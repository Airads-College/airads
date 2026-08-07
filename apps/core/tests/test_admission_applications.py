import json
import re
from urllib.parse import parse_qs, urlencode, urlparse

import pytest
from django.contrib.messages import get_messages
from django.core import mail
from django.test import override_settings
from django.urls import reverse

from apps.core.admission_course_options import (
    EDUCATION_LEVEL_PRIMARY,
    EDUCATION_LEVEL_SECONDARY,
    MAIN_SITE_APPLICATION_COURSES,
    MAIN_SITE_APPLICATION_COURSE_NAMES,
    get_course_option,
    is_course_eligible,
)
from apps.core.tests.factories import UserFactory


@pytest.fixture
def open_enrollment_mode():
    """Make direct free enrollment explicit for tests that exercise that policy."""
    from apps.platform.models import PlatformSettings

    platform_settings = PlatformSettings.get_settings()
    platform_settings.features = {
        **(platform_settings.features or {}),
        "enrollment_mode": "open",
    }
    platform_settings.save(update_fields=["features", "updated_at"])


@pytest.mark.django_db
def test_main_application_form_uses_structured_brochure_course_list(client):
    from apps.progression.tests.factories import ProgramFactory

    ProgramFactory(name="Database-only Virtual Course", is_published=True)

    response = client.get(
        reverse("core:airads.application_apply"),
        HTTP_X_INERTIA=True,
    )

    assert response.status_code == 200
    programmes = response.json()["props"]["programmes"]
    assert [programme["name"] for programme in programmes] == list(
        MAIN_SITE_APPLICATION_COURSE_NAMES
    )
    assert len(programmes) == len(MAIN_SITE_APPLICATION_COURSES)
    assert all(
        set(programme)
        == {
            "code",
            "name",
            "route",
            "minimumGrade",
            "eligibleEducationLevels",
            "requirementText",
            "additionalRequirement",
        }
        for programme in programmes
    )
    assert response.json()["props"]["educationLevels"] == ["Primary", "Secondary"]
    assert "Database-only Virtual Course" not in {
        programme["name"] for programme in programmes
    }
    cpa_foundation = next(
        programme for programme in programmes if programme["code"] == "kasneb-cpa-foundation"
    )
    assert cpa_foundation["minimumGrade"] == "C+"
    assert "Mathematics and English" in cpa_foundation["additionalRequirement"]


@pytest.mark.django_db
@override_settings(
    ALLOWED_HOSTS=["testserver", "virtual.airads.ac.ke"],
    VIRTUAL_CAMPUS_HOSTS=["virtual.airads.ac.ke"],
)
def test_virtual_application_form_keeps_published_database_courses(client):
    from apps.progression.tests.factories import ProgramFactory

    programme = ProgramFactory(name="Virtual Database Course", is_published=True)

    response = client.get(
        "/apply/",
        HTTP_HOST="virtual.airads.ac.ke",
        HTTP_X_INERTIA=True,
    )

    assert response.status_code == 200
    assert response.json()["props"]["programmes"] == [
        {
            "id": programme.id,
            "name": programme.name,
            "level": programme.level,
            "category": programme.category or "",
        }
    ]


@pytest.mark.django_db
def test_public_admission_application_submission_creates_pending_application(client):
    from apps.core.models import AdmissionApplication

    payload = {
        "fullName": "  Jane Achieng  ",
        "phone": " 0715 000 111 ",
        "email": " jane@example.com ",
        "preferredCampus": "Eldoret Campus",
        "preferredCourseCode": "diploma-information-communication-technology",
        "intake": "January 2026",
        "educationLevel": "Secondary",
        "educationResult": "B-",
        "message": "I would like to join the diploma intake.",
    }

    response = client.post(
        reverse("core:airads.application_submit"),
        data=json.dumps(payload),
        content_type="application/json",
    )

    assert response.status_code == 302
    assert response.url == reverse("core:airads.application_apply")

    application = AdmissionApplication.objects.get()
    assert application.full_name == "Jane Achieng"
    assert application.phone == "0715 000 111"
    assert application.whatsapp == "0715 000 111"
    assert application.email == "jane@example.com"
    assert application.preferred_campus == "Eldoret Campus"
    assert application.preferred_programme == "Diploma in Information and Communication Technology (ICT)"
    assert application.intake == "January 2026"
    assert application.education_level == "Secondary"
    assert application.education_result == "B-"
    assert application.message == "I would like to join the diploma intake."
    assert application.status == AdmissionApplication.STATUS_NEW


@pytest.mark.django_db
def test_public_admission_application_requires_result_for_selected_exam(client):
    from apps.core.models import AdmissionApplication

    response = client.post(
        reverse("core:airads.application_submit"),
        data={
            "fullName": "Jane Achieng",
            "phone": "0715000111",
            "preferredCampus": "Eldoret Campus",
            "preferredCourseCode": "certificate-information-communication-technology",
            "educationLevel": "Secondary",
        },
    )

    assert response.status_code == 302
    assert not AdmissionApplication.objects.exists()
    assert "Please provide the KCSE mean grade." in {
        str(message) for message in get_messages(response.wsgi_request)
    }


@pytest.mark.django_db
def test_primary_application_ignores_result_and_uses_artisan_route(client):
    from apps.core.models import AdmissionApplication

    client.post(
        reverse("core:airads.application_submit"),
        data={
            "fullName": "John Kiptoo",
            "phone": "0715000222",
            "preferredCampus": "Eldoret Campus",
            "preferredCourseCode": "artisan-welding-fabrication",
            "educationLevel": "Primary",
            "educationResult": "347",
        },
    )

    application = AdmissionApplication.objects.get()
    assert application.education_level == "Primary"
    assert application.education_result == ""
    assert application.preferred_programme == "Artisan in Welding and Fabrication"


@pytest.mark.django_db
def test_secondary_application_rejects_course_above_selected_grade(client):
    from apps.core.models import AdmissionApplication

    response = client.post(
        reverse("core:airads.application_submit"),
        data={
            "fullName": "David Mwangi",
            "phone": "0715000333",
            "preferredCampus": "Eldoret Campus",
            "preferredCourseCode": "diploma-information-communication-technology",
            "educationLevel": "Secondary",
            "educationResult": "D",
        },
    )

    assert not AdmissionApplication.objects.exists()
    assert any(
        "not available for the selected education level and grade" in str(message)
        for message in get_messages(response.wsgi_request)
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    ("course_code", "grade", "expected_message"),
    [
        ("unknown-course", "D", "Please select an available course."),
        (
            "certificate-information-communication-technology",
            "Z",
            "Please select a valid KCSE mean grade.",
        ),
    ],
)
def test_secondary_application_rejects_unknown_courses_and_invalid_grades(
    client,
    course_code,
    grade,
    expected_message,
):
    from apps.core.models import AdmissionApplication

    response = client.post(
        reverse("core:airads.application_submit"),
        data={
            "fullName": "Invalid Applicant",
            "phone": "0715000444",
            "preferredCampus": "Eldoret Campus",
            "preferredCourseCode": course_code,
            "educationLevel": "Secondary",
            "educationResult": grade,
        },
    )

    assert not AdmissionApplication.objects.exists()
    assert expected_message in {
        str(message) for message in get_messages(response.wsgi_request)
    }


@pytest.mark.parametrize(
    ("grade", "course_code", "eligible"),
    [
        ("D", "certificate-information-communication-technology", True),
        ("D", "diploma-information-communication-technology", False),
        ("C-", "diploma-information-communication-technology", True),
        ("C-", "diploma-health-records-information-technology", False),
        ("C", "diploma-health-records-information-technology", True),
        ("D", "driving-school", True),
    ],
)
def test_secondary_course_eligibility_is_cumulative(grade, course_code, eligible):
    course = get_course_option(course_code)

    assert is_course_eligible(course, EDUCATION_LEVEL_SECONDARY, grade) is eligible


def test_primary_course_eligibility_is_limited_to_artisan_and_open_entry_routes():
    assert is_course_eligible(
        get_course_option("artisan-plumbing"), EDUCATION_LEVEL_PRIMARY
    )
    assert is_course_eligible(get_course_option("computer-computer-packages"), EDUCATION_LEVEL_PRIMARY)
    assert not is_course_eligible(
        get_course_option("certificate-business-management"), EDUCATION_LEVEL_PRIMARY
    )
    assert not is_course_eligible(
        get_course_option("certificate-diploma-general-agriculture"),
        EDUCATION_LEVEL_PRIMARY,
    )


@pytest.mark.django_db
@override_settings(
    ALLOWED_HOSTS=["testserver", "virtual.airads.ac.ke"],
    VIRTUAL_CAMPUS_HOSTS=["virtual.airads.ac.ke"],
)
def test_virtual_subdomain_submission_forces_virtual_campus(client):
    from apps.core.models import AdmissionApplication, Campus

    Campus.objects.get_or_create(
        slug="virtual",
        defaults={
            "name": "Virtual Campus",
            "campus_type": Campus.CAMPUS_TYPE_VIRTUAL,
            "contact_email": "virtualcampus@airads.ac.ke",
        },
    )

    response = client.post(
        "/apply/submit/",
        data={
            "fullName": "Virtual Student",
            "phone": "0715000111",
            "preferredProgramme": "Information Communication Technology",
            "preferredCampus": "Eldoret Campus",
        },
        HTTP_HOST="virtual.airads.ac.ke",
    )

    assert response.status_code == 302
    assert response.url == "/apply/"
    application = AdmissionApplication.objects.get()
    assert application.study_mode == AdmissionApplication.STUDY_MODE_VIRTUAL
    assert application.campus.slug == "virtual"
    assert application.preferred_campus == "Virtual Campus"
    assert application.phone == "0715000111"
    assert application.whatsapp == "0715000111"
    assert application.source == "virtual_subdomain"


@pytest.mark.django_db
def test_application_submission_uses_course_label_for_missing_course(client):
    response = client.post(
        reverse("core:airads.application_submit"),
        data={
            "fullName": "Normal Student",
            "phone": "0715000111",
            "preferredCampus": "Eldoret Campus",
            "educationLevel": "Primary",
        },
    )

    assert response.status_code == 302
    messages = [str(message) for message in get_messages(response.wsgi_request)]
    assert any("available course" in message for message in messages)


@pytest.mark.django_db
def test_normal_submission_requires_physical_campus(client):
    response = client.post(
        reverse("core:airads.application_submit"),
        data={
            "fullName": "Normal Student",
            "phone": "0715000111",
            "preferredCourseCode": "artisan-welding-fabrication",
            "educationLevel": "Primary",
            "preferredCampus": "",
        },
    )

    assert response.status_code == 302
    assert response.url == reverse("core:airads.application_apply")


@pytest.mark.django_db
def test_program_interest_submission_creates_account_and_free_enrollment(
    client, open_enrollment_mode
):
    from apps.core.models import AdmissionApplication, User
    from apps.progression.models import Enrollment
    from apps.progression.tests.factories import ProgramFactory

    program = ProgramFactory(
        name="Introduction to AI",
        is_published=True,
        custom_pricing={"price": 0},
    )

    response = client.post(
        reverse("core:program_interest_submit", kwargs={"pk": program.id}),
        data=json.dumps(
            {
                "fullName": "  Mary Wanjiku  ",
                "email": " MARY@gmail.com ",
                "phone": " 0715 000 222 ",
            }
        ),
        content_type="application/json",
    )

    assert response.status_code == 302
    assert response.url == f"/programs/{program.slug}/"

    application = AdmissionApplication.objects.get()
    user = User.objects.get(email="mary@gmail.com")
    enrollment = Enrollment.objects.get(user=user, program=program)
    assert application.full_name == "Mary Wanjiku"
    assert application.email == "mary@gmail.com"
    assert application.phone == "0715 000 222"
    assert application.whatsapp == "0715 000 222"
    assert application.program == program
    assert application.preferred_programme == "Introduction to AI"
    assert application.preferred_campus == "Course detail enquiry"
    assert application.source == "program_detail_modal"
    assert application.user == user
    assert application.enrollment == enrollment
    assert application.status == AdmissionApplication.STATUS_ACCEPTED
    assert enrollment.access_source == "free"
    assert user.first_name == "Mary"
    assert user.last_name == "Wanjiku"
    assert user.phone == "0715 000 222"
    assert user.has_usable_password()
    assert len(mail.outbox) == 1
    assert "Temporary password:" in mail.outbox[0].body
    password_match = re.search(r"Temporary password:\s*(\S+)", mail.outbox[0].body)
    assert password_match
    assert user.check_password(password_match.group(1))

    page_response = client.get(response.url, HTTP_X_INERTIA=True)
    success = page_response.json()["props"]["programInterestSuccess"]
    assert success["mode"] == "free"
    assert success["accountState"] == "created"
    assert success["courseUrl"] == reverse(
        "progression:student.program", kwargs={"pk": program.id}
    )
    assert success["emailInboxUrl"] == "https://mail.google.com/mail/"
    assert success["loginUrl"].startswith("/login/?next=")


@pytest.mark.django_db
def test_google_sign_in_resumes_free_course_enrollment(
    client, monkeypatch, open_enrollment_mode
):
    from apps.core.models import AdmissionApplication, User
    from apps.progression.models import Enrollment
    from apps.progression.tests.factories import ProgramFactory

    program = ProgramFactory(
        name="Free Google Course",
        is_published=True,
        custom_pricing={"price": 0},
    )
    lead_response = client.post(
        reverse("core:program_interest_submit", kwargs={"pk": program.id}),
        {
            "fullName": "Mary Wanjiku",
            "email": "mary.google@example.com",
            "phone": "0715000222",
        },
    )
    success_response = client.get(lead_response.url, HTTP_X_INERTIA=True)
    intent_url = success_response.json()["props"]["programInterestSuccess"]["resumeUrl"]

    login_response = client.get(intent_url)
    assert login_response.status_code == 302
    assert login_response.url.startswith("/login/?next=")

    def fake_verify(_credential):
        return {
            "email": "mary.google@example.com",
            "email_verified": True,
            "given_name": "Mary",
            "family_name": "Wanjiku",
            "sub": "google-free-course-student",
        }

    monkeypatch.setattr("apps.core.views._verify_google_one_tap_credential", fake_verify)
    client.cookies["g_csrf_token"] = "google-csrf"
    google_callback_url = (
        reverse("core:google_onetap_login")
        + "?"
        + urlencode({"next": intent_url})
    )

    with override_settings(
        GOOGLE_ONE_TAP_ENABLED=True,
        GOOGLE_ONE_TAP_CLIENT_ID="google-client-id",
    ):
        google_response = client.post(
            google_callback_url,
            {
                "credential": "signed-google-jwt",
                "g_csrf_token": "google-csrf",
            },
        )

    assert google_response.status_code == 302
    assert google_response.url == intent_url

    enrollment_response = client.get(google_response.url)
    user = User.objects.get(email="mary.google@example.com")
    enrollment = Enrollment.objects.get(user=user, program=program)
    application = AdmissionApplication.objects.get(email="mary.google@example.com")

    assert enrollment_response.status_code == 302
    assert enrollment_response.url == reverse(
        "progression:student.program", kwargs={"pk": program.id}
    )
    assert enrollment.access_source == "free"
    assert application.user == user
    assert application.enrollment == enrollment
    assert application.status == AdmissionApplication.STATUS_ACCEPTED
    assert user.phone == "0715000222"
    assert user.has_usable_password()


@pytest.mark.django_db
def test_program_interest_existing_user_is_linked_without_password_reset(
    client, open_enrollment_mode
):
    from apps.core.models import AdmissionApplication
    from apps.progression.models import Enrollment
    from apps.progression.tests.factories import ProgramFactory

    existing_user = UserFactory(
        email="existing-lead@example.com",
        password="ExistingPass123",
        first_name="",
        last_name="",
        phone="",
    )
    program = ProgramFactory(is_published=True, custom_pricing={"price": 0})

    response = client.post(
        reverse("core:program_interest_submit", kwargs={"pk": program.id}),
        {
            "fullName": "Existing Student",
            "email": "existing-lead@example.com",
            "phone": "0715000333",
        },
    )
    page_response = client.get(response.url, HTTP_X_INERTIA=True)
    success = page_response.json()["props"]["programInterestSuccess"]

    existing_user.refresh_from_db()
    application = AdmissionApplication.objects.get(email="existing-lead@example.com")
    enrollment = Enrollment.objects.get(user=existing_user, program=program)

    assert application.user == existing_user
    assert application.enrollment == enrollment
    assert existing_user.check_password("ExistingPass123")
    assert existing_user.phone == "0715000333"
    assert success["accountState"] == "existing"
    assert "Temporary password:" not in mail.outbox[0].body
    assert "_auth_user_id" not in client.session


@pytest.mark.django_db
def test_logged_in_user_with_phone_enrolls_without_public_details_form(
    client, open_enrollment_mode
):
    from apps.core.models import AdmissionApplication
    from apps.progression.models import Enrollment
    from apps.progression.tests.factories import ProgramFactory

    user = UserFactory(email="signed-in@example.com", phone="0715000666")
    program = ProgramFactory(is_published=True, custom_pricing={"price": 0})
    client.force_login(user)

    response = client.post(
        reverse("core:program_interest_submit", kwargs={"pk": program.id}),
        {},
    )
    page_response = client.get(response.url, HTTP_X_INERTIA=True)
    success = page_response.json()["props"]["programInterestSuccess"]

    application = AdmissionApplication.objects.get(email="signed-in@example.com")
    enrollment = Enrollment.objects.get(user=user, program=program)
    assert application.user == user
    assert application.phone == "0715000666"
    assert application.enrollment == enrollment
    assert success["accountState"] == "authenticated"
    assert success["courseUrl"] == reverse(
        "progression:student.program", kwargs={"pk": program.id}
    )


@pytest.mark.django_db
def test_logged_in_user_without_phone_must_supply_phone(client):
    from apps.core.models import AdmissionApplication
    from apps.progression.models import Enrollment
    from apps.progression.tests.factories import ProgramFactory

    user = UserFactory(email="missing-phone@example.com", phone="")
    program = ProgramFactory(is_published=True, custom_pricing={"price": 0})
    client.force_login(user)

    response = client.post(
        reverse("core:program_interest_submit", kwargs={"pk": program.id}),
        {},
    )

    assert response.status_code == 302
    assert response.url == f"/programs/{program.slug}/"
    assert AdmissionApplication.objects.count() == 0
    assert not Enrollment.objects.filter(user=user, program=program).exists()
    messages = [str(message) for message in get_messages(response.wsgi_request)]
    assert any("Phone number is required" in message for message in messages)


@pytest.mark.django_db
def test_paid_guest_interest_creates_account_but_waits_for_payment(client):
    from apps.core.models import AdmissionApplication, User
    from apps.progression.models import Enrollment

    program = _create_paid_program(code="ADM-PAY-GUEST")

    response = client.post(
        reverse("core:program_interest_submit", kwargs={"pk": program.id}),
        {
            "fullName": "Paid Guest",
            "email": "paid-guest@example.com",
            "phone": "0715000777",
        },
    )
    page_response = client.get(response.url, HTTP_X_INERTIA=True)
    success = page_response.json()["props"]["programInterestSuccess"]

    user = User.objects.get(email="paid-guest@example.com")
    application = AdmissionApplication.objects.get(email="paid-guest@example.com")
    assert application.user == user
    assert application.status == AdmissionApplication.STATUS_NEW
    assert not Enrollment.objects.filter(user=user, program=program).exists()
    assert user.has_usable_password()
    assert success["mode"] == "paid"
    assert success["accountState"] == "created"
    assert success["checkoutUrl"].startswith("/checkout/?")
    assert "Temporary password:" in mail.outbox[0].body
    assert "Payment is required" in mail.outbox[0].body


@pytest.mark.django_db
@override_settings(
    ALLOWED_HOSTS=["testserver", "virtual.airads.ac.ke"],
    VIRTUAL_CAMPUS_HOSTS=["virtual.airads.ac.ke"],
)
def test_virtual_host_program_interest_uses_virtual_links(client):
    from apps.core.models import AdmissionApplication, Campus
    from apps.progression.tests.factories import ProgramFactory

    Campus.objects.get_or_create(
        slug="virtual",
        defaults={
            "name": "Virtual Campus",
            "campus_type": Campus.CAMPUS_TYPE_VIRTUAL,
            "contact_email": "virtualcampus@airads.ac.ke",
        },
    )
    program = ProgramFactory(is_published=True, custom_pricing={"price": 0})

    response = client.post(
        reverse("core:program_interest_submit", kwargs={"pk": program.id}),
        {
            "fullName": "Virtual Learner",
            "email": "virtual-learner@example.com",
            "phone": "0715000888",
        },
        HTTP_HOST="virtual.airads.ac.ke",
    )
    page_response = client.get(
        response.url,
        HTTP_X_INERTIA=True,
        HTTP_HOST="virtual.airads.ac.ke",
    )
    success = page_response.json()["props"]["programInterestSuccess"]
    application = AdmissionApplication.objects.get(email="virtual-learner@example.com")

    assert application.study_mode == AdmissionApplication.STUDY_MODE_VIRTUAL
    assert application.preferred_campus == "Virtual Campus"
    assert success["absolute"]["loginUrl"].startswith("http://virtual.airads.ac.ke")
    assert "http://virtual.airads.ac.ke" in mail.outbox[0].body


@pytest.mark.django_db
def test_enrollment_resume_rejects_account_with_different_email(client):
    from apps.core.models import AdmissionApplication
    from apps.progression.models import Enrollment
    from apps.progression.tests.factories import ProgramFactory

    program = ProgramFactory(is_published=True, custom_pricing={"price": 0})
    response = client.post(
        reverse("core:program_interest_submit", kwargs={"pk": program.id}),
        {
            "fullName": "Correct Student",
            "email": "correct@example.com",
            "phone": "0715000444",
        },
    )
    success_response = client.get(response.url, HTTP_X_INERTIA=True)
    intent_url = success_response.json()["props"]["programInterestSuccess"]["resumeUrl"]
    other_user = UserFactory(email="different@example.com")
    client.force_login(other_user)

    resume_response = client.get(intent_url)

    assert resume_response.status_code == 302
    assert resume_response.url == f"/programs/{program.slug}/"
    application = AdmissionApplication.objects.get(email="correct@example.com")
    assert application.user.email == "correct@example.com"
    assert not Enrollment.objects.filter(user=other_user, program=program).exists()


@pytest.mark.django_db
def test_paid_course_resume_links_checkout_order_and_paid_enrollment(client):
    from apps.commerce.models import Order
    from apps.commerce.services import CheckoutService
    from apps.core.models import AdmissionApplication
    from apps.progression.models import Enrollment

    user = UserFactory(email="paid-google@example.com")
    program = _create_paid_program(code="ADM-PAY-GOOGLE")
    client.force_login(user)
    response = client.post(
        reverse("core:program_interest_submit", kwargs={"pk": program.id}),
        {
            "fullName": "Paid Google Student",
            "email": "paid-google@example.com",
            "phone": "0715000555",
        },
    )
    success_response = client.get(response.url, HTTP_X_INERTIA=True)
    success = success_response.json()["props"]["programInterestSuccess"]

    resume_response = client.get(success["resumeUrl"])
    checkout_query = parse_qs(urlparse(resume_response.url).query)
    application = AdmissionApplication.objects.get(email="paid-google@example.com")

    assert resume_response.status_code == 302
    assert urlparse(resume_response.url).path == "/checkout/"
    assert checkout_query["programId"] == [str(program.id)]
    assert checkout_query["applicationId"] == [str(application.id)]
    assert application.user == user
    assert success["mode"] == "paid"
    assert success["accountState"] == "authenticated"
    assert success["checkoutUrl"].startswith("/checkout/?")
    assert not Enrollment.objects.filter(user=user, program=program).exists()

    order_response = client.post(
        "/commerce/orders/",
        data=json.dumps(
            {
                "paymentMethod": Order.PROVIDER_PAYSTACK,
                "programIds": [program.id],
                "applicationId": application.id,
            }
        ),
        content_type="application/json",
    )
    assert order_response.status_code == 201
    order = Order.objects.get(id=order_response.json()["order"]["id"])
    application.refresh_from_db()
    assert application.order == order

    CheckoutService.mark_order_paid(order)
    application.refresh_from_db()
    enrollment = Enrollment.objects.get(user=user, program=program)
    assert application.enrollment == enrollment
    assert application.status == AdmissionApplication.STATUS_ACCEPTED
    assert enrollment.access_source == "paid"


@pytest.mark.django_db
def test_direct_checkout_without_admission_application_still_works(client):
    from apps.commerce.models import Order

    user = UserFactory()
    program = _create_paid_program(code="ADM-PAY-DIRECT")
    client.force_login(user)

    response = client.post(
        "/commerce/orders/",
        data=json.dumps(
            {
                "paymentMethod": Order.PROVIDER_PAYSTACK,
                "programIds": [program.id],
            }
        ),
        content_type="application/json",
    )

    assert response.status_code == 201
    assert response.json()["order"]["status"] == Order.STATUS_PENDING_PAYMENT


@pytest.mark.django_db
def test_program_interest_submission_validates_required_fields(client):
    from apps.core.models import AdmissionApplication
    from apps.progression.tests.factories import ProgramFactory

    program = ProgramFactory(is_published=True)

    response = client.post(
        reverse("core:program_interest_submit", kwargs={"pk": program.id}),
        data=json.dumps(
            {
                "fullName": "",
                "email": "not-an-email",
                "phone": "",
            }
        ),
        content_type="application/json",
    )

    assert response.status_code == 302
    assert response.url == f"/programs/{program.slug}/"
    assert AdmissionApplication.objects.count() == 0


def _create_admission_application(**overrides):
    from apps.core.models import AdmissionApplication

    program = overrides.get("program")
    defaults = {
        "full_name": "Lead Student",
        "phone": "0715000333",
        "whatsapp": "0715000333",
        "email": "lead@example.com",
        "program": program,
        "preferred_campus": "Course detail enquiry",
        "preferred_programme": program.name if program else "Information Communication Technology",
        "source": "program_detail_modal",
    }
    defaults.update(overrides)
    return AdmissionApplication.objects.create(**defaults)


def _create_paid_program(code="ADM-PAY-001", price=1500):
    from apps.core.models import Program
    from apps.platform.models import PlatformSettings

    settings = PlatformSettings.get_settings()
    features = settings.features if isinstance(settings.features, dict) else {}
    settings.features = {**features, "payments": True}
    settings.save(update_fields=["features", "updated_at"])
    return Program.objects.create(
        name=f"Admissions Course {code}",
        code=code,
        is_published=True,
        custom_pricing={"price": price, "currency": "KES"},
    )


@pytest.mark.django_db
def test_admin_admissions_filters_by_campus_and_returns_campus_choices(client):
    from apps.core.models import Campus

    admin = UserFactory(admin=True)
    selected_campus = Campus.objects.create(
        name="Admissions Test Campus",
        slug="admissions-test-campus",
    )
    other_campus = Campus.objects.create(
        name="Other Admissions Campus",
        slug="other-admissions-campus",
    )
    matching = _create_admission_application(
        email="campus-match@example.com",
        campus=selected_campus,
        preferred_campus=selected_campus.name,
    )
    _create_admission_application(
        email="other-campus@example.com",
        campus=other_campus,
        preferred_campus=other_campus.name,
    )
    client.force_login(admin)

    response = client.get(
        reverse("core:admin.admission_applications"),
        {"campus": selected_campus.id},
        HTTP_X_INERTIA=True,
    )

    assert response.status_code == 200
    props = response.json()["props"]
    assert [application["id"] for application in props["applications"]] == [
        matching.id
    ]
    assert props["filters"]["campus"] == str(selected_campus.id)
    assert {"id": selected_campus.id, "name": selected_campus.name} in props[
        "campuses"
    ]
    assert "sources" not in props


@pytest.mark.django_db
def test_admin_can_link_existing_user_from_admission_application(client):
    student = UserFactory(username="existing-student", email="lead@example.com")
    admin = UserFactory(admin=True)
    application = _create_admission_application(email="LEAD@example.com")
    client.force_login(admin)

    response = client.post(
        reverse("core:admin.admission_application.link_user", args=[application.id])
    )

    assert response.status_code == 302
    application.refresh_from_db()
    assert application.user == student


@pytest.mark.django_db
def test_admin_can_create_student_account_from_admission_application(client):
    from apps.core.models import User

    admin = UserFactory(admin=True)
    application = _create_admission_application(
        full_name="Grace Njeri Wambui",
        email="grace@example.com",
        phone="0700111222",
    )
    client.force_login(admin)

    response = client.post(
        reverse("core:admin.admission_application.create_user", args=[application.id])
    )

    assert response.status_code == 302
    user = User.objects.get(email="grace@example.com")
    application.refresh_from_db()
    assert application.user == user
    assert user.first_name == "Grace"
    assert user.last_name == "Njeri Wambui"
    assert user.phone == "0700111222"
    assert user.has_usable_password()


@pytest.mark.django_db
def test_admin_direct_enroll_creates_enrollment_and_links_application(client):
    from apps.progression.models import Enrollment
    from apps.progression.tests.factories import ProgramFactory

    admin = UserFactory(admin=True)
    student = UserFactory(email="enroll@example.com")
    program = ProgramFactory(name="Direct Admissions", is_published=True)
    application = _create_admission_application(
        email="enroll@example.com",
        user=student,
        program=program,
    )
    client.force_login(admin)

    response = client.post(
        reverse("core:admin.admission_application.direct_enroll", args=[application.id])
    )

    assert response.status_code == 302
    enrollment = Enrollment.objects.get(user=student, program=program)
    application.refresh_from_db()
    assert enrollment.status == "active"
    assert enrollment.access_source == "admin"
    assert application.enrollment == enrollment
    assert application.status == "accepted"


@pytest.mark.django_db
def test_admin_admission_payment_status_serializes_pending_and_paid_orders(client):
    from apps.commerce.models import Order
    from apps.commerce.services import CheckoutService
    from apps.progression.models import Enrollment

    admin = UserFactory(admin=True)
    student = UserFactory(email="paying-lead@example.com")
    program = _create_paid_program()
    application = _create_admission_application(
        email="paying-lead@example.com",
        user=student,
        program=program,
    )
    client.force_login(admin)

    order = CheckoutService.create_order_from_programs(
        student,
        [program],
        Order.PROVIDER_OFFLINE_BANK_TRANSFER,
    )

    pending_response = client.get(
        reverse("core:admin.admission_application", args=[application.id]),
        HTTP_X_INERTIA=True,
    )
    pending_application = pending_response.json()["props"]["application"]
    assert pending_application["paymentStatus"]["state"] == "pending"
    assert pending_application["paymentStatus"]["orderId"] == order.id
    assert pending_application["enrollmentStatus"]["state"] == "not_enrolled"

    CheckoutService.mark_order_paid(order, actor=admin)

    paid_response = client.get(
        reverse("core:admin.admission_application", args=[application.id]),
        HTTP_X_INERTIA=True,
    )
    paid_application = paid_response.json()["props"]["application"]
    assert paid_application["paymentStatus"]["state"] == "paid"
    assert paid_application["enrollmentStatus"]["state"] == "active"
    assert Enrollment.objects.filter(user=student, program=program).exists()
