"""Brochure-backed course eligibility for the main Airads admissions form."""

from dataclasses import dataclass


EDUCATION_LEVEL_PRIMARY = "Primary"
EDUCATION_LEVEL_SECONDARY = "Secondary"
MAIN_SITE_EDUCATION_LEVELS = (
    EDUCATION_LEVEL_PRIMARY,
    EDUCATION_LEVEL_SECONDARY,
)

KCSE_GRADES = (
    "A",
    "A-",
    "B+",
    "B",
    "B-",
    "C+",
    "C",
    "C-",
    "D+",
    "D",
    "D-",
    "E",
)
KCSE_GRADE_RANK = {grade: len(KCSE_GRADES) - index for index, grade in enumerate(KCSE_GRADES)}


@dataclass(frozen=True)
class AdmissionCourseOption:
    code: str
    name: str
    route: str
    eligible_education_levels: tuple[str, ...]
    requirement_text: str
    minimum_grade: str | None = None
    additional_requirement: str = ""

    def as_payload(self) -> dict:
        return {
            "code": self.code,
            "name": self.name,
            "route": self.route,
            "minimumGrade": self.minimum_grade,
            "eligibleEducationLevels": list(self.eligible_education_levels),
            "requirementText": self.requirement_text,
            "additionalRequirement": self.additional_requirement,
        }


def _secondary_course(
    code: str,
    name: str,
    route: str,
    minimum_grade: str,
    *,
    requirement_text: str | None = None,
    additional_requirement: str = "",
) -> AdmissionCourseOption:
    return AdmissionCourseOption(
        code=code,
        name=name,
        route=route,
        eligible_education_levels=(EDUCATION_LEVEL_SECONDARY,),
        minimum_grade=minimum_grade,
        requirement_text=requirement_text or f"KCSE {minimum_grade} or higher",
        additional_requirement=additional_requirement,
    )


def _artisan_course(
    code: str,
    name: str,
    route: str,
    requirement_text: str,
) -> AdmissionCourseOption:
    return AdmissionCourseOption(
        code=code,
        name=name,
        route=route,
        eligible_education_levels=MAIN_SITE_EDUCATION_LEVELS,
        minimum_grade="E",
        requirement_text=requirement_text,
    )


def _open_course(code: str, name: str, route: str) -> AdmissionCourseOption:
    return AdmissionCourseOption(
        code=code,
        name=name,
        route=route,
        eligible_education_levels=MAIN_SITE_EDUCATION_LEVELS,
        requirement_text="Open entry",
    )


def _split_certificate_diploma(
    code: str,
    subject: str,
    *,
    certificate_grade: str = "D",
    diploma_grade: str = "C-",
) -> tuple[AdmissionCourseOption, AdmissionCourseOption]:
    return (
        _secondary_course(
            f"certificate-{code}",
            f"Certificate in {subject}",
            "Certificate",
            certificate_grade,
        ),
        _secondary_course(
            f"diploma-{code}",
            f"Diploma in {subject}",
            "Diploma",
            diploma_grade,
        ),
    )


BUSINESS_COURSES = (
    *_split_certificate_diploma("business-management", "Business Management"),
    *_split_certificate_diploma("human-resource-management", "Human Resource Management"),
    *_split_certificate_diploma("library-information-science", "Library and Information Science"),
    *_split_certificate_diploma("supply-chain-management", "Supply Chain Management"),
    *_split_certificate_diploma("accountancy", "Accountancy"),
    *_split_certificate_diploma("sales-marketing", "Sales and Marketing"),
    *_split_certificate_diploma("marketing", "Marketing"),
    *_split_certificate_diploma("cooperative-management", "Cooperative Management"),
    *_split_certificate_diploma("computerized-secretarial-studies", "Computerized Secretarial Studies"),
    *_split_certificate_diploma("banking-finance", "Banking and Finance"),
    *_split_certificate_diploma("project-management-development", "Project Management and Development"),
    *_split_certificate_diploma("purchasing-supplies", "Purchasing and Supplies"),
    *_split_certificate_diploma("entrepreneurship-development", "Entrepreneurship Development"),
    *_split_certificate_diploma("investment", "Investment"),
    _secondary_course(
        "diploma-international-freight-management",
        "Diploma in International Freight Management",
        "Diploma",
        "C-",
    ),
    _secondary_course(
        "diploma-maritime-transport-logistics",
        "Diploma in Maritime Transport and Logistics",
        "Diploma",
        "C-",
    ),
    _secondary_course(
        "certificate-road-transport-management",
        "Certificate in Road Transport Management",
        "Certificate",
        "D",
    ),
    _secondary_course(
        "certificate-clerical-operations",
        "Certificate in Clerical Operations",
        "Certificate",
        "D",
    ),
    _artisan_course(
        "artisan-store-keeping-management",
        "Artisan in Store Keeping Management",
        "Artisan",
        "KCPE or KCSE D- and below",
    ),
    _artisan_course(
        "artisan-salesmanship",
        "Artisan in Salesmanship",
        "Artisan",
        "KCPE or KCSE D- and below",
    ),
    _artisan_course(
        "artisan-secretarial-studies",
        "Artisan in Secretarial Studies",
        "Artisan",
        "KCPE or KCSE D- and below",
    ),
)

HOSPITALITY_COURSES = (
    *_split_certificate_diploma("hotel-catering-management", "Hotel and Catering Management"),
    *_split_certificate_diploma("food-beverage-management", "Food and Beverage Management"),
    *_split_certificate_diploma("tourism-tour-guiding", "Tourism and Tour Guiding"),
    *_split_certificate_diploma("housekeeping-laundry", "Housekeeping and Laundry"),
    *_split_certificate_diploma("food-processing-technology", "Food Processing Technology"),
    *_split_certificate_diploma("bakery-technology", "Bakery Technology"),
    _artisan_course(
        "artisan-food-beverage-management",
        "Artisan in Food and Beverage Management",
        "Artisan",
        "KCPE or KCSE D- and below",
    ),
)

COSMETOLOGY_COURSES = (
    *_split_certificate_diploma("hairdressing-beauty-therapy", "Hairdressing and Beauty Therapy"),
    _secondary_course(
        "certificate-nail-technology",
        "Certificate in Nail Technology",
        "Certificate",
        "D",
    ),
    *_split_certificate_diploma("fashion-design", "Fashion and Design"),
    *_split_certificate_diploma("textile-technology", "Textile Technology"),
)

HEALTH_SOCIAL_SCIENCE_COURSES = (
    *_split_certificate_diploma("nutrition-dietetics-management", "Nutrition and Dietetics Management"),
    *_split_certificate_diploma("community-health-development", "Community Health Development"),
    *_split_certificate_diploma("community-development-social-work", "Community Development and Social Work"),
    _secondary_course(
        "certificate-health-records-information-technology",
        "Certificate in Health Records and Information Technology",
        "Certificate",
        "C-",
    ),
    _secondary_course(
        "diploma-health-records-information-technology",
        "Diploma in Health Records and Information Technology",
        "Diploma",
        "C",
    ),
    _secondary_course(
        "certificate-nursing-assistant-caregiver",
        "Certified Nursing Assistant (CNA) / Caregiver",
        "Certificate",
        "D-",
    ),
    _secondary_course(
        "diploma-counselling-guidance-psychology",
        "Diploma in Counselling, Guidance and Psychology",
        "Diploma",
        "C-",
    ),
    _secondary_course(
        "diploma-spiritual-counselling",
        "Diploma in Spiritual Counselling",
        "Diploma",
        "D",
        requirement_text="KCSE D / C-",
    ),
    _secondary_course(
        "diploma-hiv-testing-management",
        "Diploma in HIV Testing and Management",
        "Diploma",
        "D",
        requirement_text="KCSE D / C-",
    ),
    *_split_certificate_diploma("development-studies-entrepreneurship-skills", "Development Studies with Entrepreneurship Skills"),
    _secondary_course(
        "certificate-laboratory-science",
        "Certificate in Laboratory Science",
        "Certificate",
        "D",
        requirement_text="KCSE D / C-",
    ),
)

KASNEB_COURSES = (
    _secondary_course("kasneb-atd", "Accounting Technicians Diploma (ATD), Levels I-III", "KASNEB", "C-"),
    _secondary_course(
        "kasneb-cpa-foundation",
        "CPA Foundation",
        "KASNEB",
        "C+",
        additional_requirement="C+ in Mathematics and English is also required.",
    ),
    _secondary_course(
        "kasneb-cams",
        "Certificate in Accounting and Management Skills (CAMS)",
        "KASNEB",
        "D+",
    ),
)

ENGINEERING_IT_COURSES = (
    _secondary_course(
        "diploma-electrical-electronics-engineering",
        "Diploma in Electrical/Electronics Engineering",
        "Diploma",
        "C-",
    ),
    _secondary_course("diploma-electronics", "Diploma in Electronics", "Diploma", "C-"),
    *_split_certificate_diploma("electrical-electronics-telecommunication", "Electrical and Electronics (Telecommunication)"),
    _secondary_course(
        "certificate-electrical-installation",
        "Certificate in Electrical Installation",
        "Certificate",
        "D",
    ),
    *_split_certificate_diploma("building-technology", "Building Technology"),
    _secondary_course("certificate-civil-engineering", "Certificate in Civil Engineering", "Certificate", "C-"),
    _secondary_course("diploma-civil-engineering", "Diploma in Civil Engineering", "Diploma", "C-"),
    *_split_certificate_diploma("information-communication-technology", "Information and Communication Technology (ICT)"),
    *_split_certificate_diploma("building-construction", "Building and Construction"),
    *_split_certificate_diploma("plumbing", "Plumbing"),
    _secondary_course(
        "certificate-diploma-land-surveying",
        "Certificate/Diploma in Land Surveying",
        "Certificate/Diploma",
        "E",
        requirement_text="KCPE or KCSE D and below; Primary applicants are routed to artisan courses",
    ),
    _artisan_course(
        "artisan-electrical-electronic-technology",
        "Artisan in Electrical and Electronic Technology",
        "Artisan",
        "KCPE or KCSE D- and below",
    ),
    _artisan_course(
        "artisan-plumbing",
        "Artisan in Plumbing",
        "Artisan",
        "KCPE or KCSE D- and below",
    ),
    _artisan_course(
        "artisan-welding-fabrication",
        "Artisan in Welding and Fabrication",
        "Artisan",
        "KCPE or KCSE D- and below",
    ),
    _artisan_course(
        "artisan-electrical-installation",
        "Artisan in Electrical Installation",
        "Artisan",
        "KCPE or KCSE D- and below",
    ),
)

JOURNALISM_COURSES = (
    _secondary_course(
        "diploma-broadcasting-journalism-media",
        "Diploma in Broadcasting Journalism and Media",
        "Diploma",
        "C-",
    ),
    _secondary_course(
        "diploma-mass-communication-print-journalism",
        "Diploma in Mass Communication (Print Journalism)",
        "Diploma",
        "C-",
    ),
    _secondary_course(
        "diploma-mass-communication-broadcasting-journalism",
        "Diploma in Mass Communication (Broadcasting Journalism)",
        "Diploma",
        "C-",
    ),
    _secondary_course(
        "diploma-mass-communication-digital-journalism",
        "Diploma in Mass Communication (Digital Journalism)",
        "Diploma",
        "C-",
    ),
    _secondary_course(
        "diploma-mass-communication-radio-video-production",
        "Diploma in Mass Communication (Radio and Video Production)",
        "Diploma",
        "D",
        requirement_text="KCSE D / C-",
    ),
)

AGRICULTURE_COURSES = (
    _secondary_course(
        "certificate-diploma-general-agriculture",
        "Certificate/Diploma in General Agriculture",
        "Certificate/Diploma",
        "E",
        requirement_text="KCPE or KCSE D and below; Primary applicants are routed to artisan courses",
    ),
    _secondary_course(
        "diploma-entrepreneurial-agriculture",
        "Diploma in Entrepreneurial Agriculture",
        "Diploma",
        "E",
        requirement_text="KCPE or KCSE D and below; Primary applicants are routed to artisan courses",
    ),
    _artisan_course(
        "artisan-general-agriculture",
        "Artisan in General Agriculture",
        "Artisan",
        "KCPE or KCSE D- and below",
    ),
)

PROFESSIONAL_SHORT_COURSE_NAMES = (
    ("health-records-management", "Certificate in Health Records Management"),
    ("leadership-skills", "Certificate in Leadership Skills"),
    ("advocacy-lobbying", "Certificate in Advocacy and Lobbying"),
    ("first-aid-management", "Certificate in First Aid Management"),
    ("sales-marketing-short", "Certificate in Sales and Marketing"),
    ("project-management-short", "Certificate in Project Management"),
    ("public-relations", "Certificate in Public Relations"),
    ("criminology", "Certificate in Criminology"),
    ("investment-short", "Certificate in Investment"),
    ("film-production", "Certificate in Film Production"),
    ("front-office-management", "Certificate in Front Office Management"),
    ("customer-care-management", "Certificate in Customer Care Management"),
    ("school-college-management", "Certificate in School/College Management"),
    ("ethics-county-governance", "Certificate in Ethics and County Governance"),
    ("public-procurement", "Certificate in Public Procurement"),
    ("book-keeping", "Certificate in Book Keeping"),
    ("storekeeping", "Certificate in Storekeeping"),
    ("psychology", "Certificate in Psychology"),
    ("gender-human-rights", "Certificate in Gender and Human Rights"),
    ("drug-abuse-rehabilitation", "Certificate in Drug Abuse and Rehabilitation"),
    ("ngo-management", "Certificate in NGO Management"),
    ("disaster-management", "Certificate in Disaster Management"),
    ("hiv-aids-management", "Certificate in HIV/AIDS Management"),
    ("conflict-management", "Certificate in Conflict Management"),
    ("integrated-management-acute-malnutrition", "Certificate in Integrated Management of Acute Malnutrition"),
    ("video-editing", "Certificate in Video Editing"),
    ("photojournalism", "Certificate in Photojournalism"),
    ("solar-technology", "Certificate in Solar Technology"),
    ("electrical-wireman-installation", "Certificate in Electrical Wireman and Installation"),
    ("computer-networking", "Certificate in Computer Networking"),
    ("computer-repair-maintenance", "Certificate in Computer Repair and Maintenance"),
    ("bakery-cake-making-decoration", "Certificate in Bakery Technology, Cake Making and Decoration"),
    ("events-management", "Certificate in Events Management"),
    ("waiting-services", "Certificate in Waiting Services"),
    ("financial-planning", "Certificate in Financial Planning"),
    ("juice-making-cocktails", "Certificate in Juice Making and Cocktails"),
    ("entrepreneurship-management", "Certificate in Entrepreneurship Management"),
    ("professional-cooking", "Certificate in Professional Cooking"),
    ("food-service-technique", "Certificate in Food and Service Technique"),
    ("records-management-short", "Certificate in Records Management"),
    ("health-service-management", "Certificate in Health Service Management"),
    ("basic-life-support", "Certificate in Basic Life Support"),
    ("communicable-disease-management", "Certificate in Communicable and Non-Communicable Disease Management"),
    ("barbering-kinyozi", "Certificate in Barbering/Kinyozi"),
    ("body-massaging", "Certificate in Body Massaging"),
    ("make-up", "Certificate in Make-up"),
    ("public-health-short", "Certificate in Public Health"),
    ("fashion-design-short", "Certificate in Fashion and Design"),
    ("cctv-installation", "CCTV Installation"),
    ("languages", "French, English and German Languages"),
)
PROFESSIONAL_SHORT_COURSES = tuple(
    _open_course(f"short-{code}", name, "Professional Short Course")
    for code, name in PROFESSIONAL_SHORT_COURSE_NAMES
)

COMPUTER_COURSE_NAMES = (
    ("computer-packages", "Computer Packages"),
    ("photoshop", "Photoshop"),
    ("corel-draw", "CorelDRAW"),
    ("autocad", "AutoCAD"),
    ("archicad", "ArchiCAD"),
    ("logo-creator", "Logo Creator"),
    ("grasshopper", "Grasshopper"),
    ("adobe-premiere", "Adobe Premiere"),
    ("illustrator", "Adobe Illustrator"),
    ("adobe-indesign", "Adobe InDesign CC"),
    ("web-design", "Certificate in Web Design"),
    ("graphic-design", "Certificate in Graphic Design"),
    ("spss", "SPSS"),
    ("stata", "Stata"),
    ("r", "R"),
    ("latex", "LaTeX"),
    ("quickbooks", "QuickBooks"),
    ("pastel", "Pastel"),
    ("tally", "Tally"),
    ("arduino", "Arduino"),
    ("openscad", "OpenSCAD"),
    ("cad", "CAD"),
    ("geomagic-design", "Geomagic Design"),
    ("php", "PHP"),
    ("python", "Python"),
    ("sql", "SQL"),
    ("java", "Java"),
    ("netbeans", "NetBeans"),
    ("dreamweaver", "Dreamweaver"),
    ("perl", "Perl"),
    ("matlab", "MATLAB"),
    ("html-css", "HTML/CSS"),
    ("javascript", "JavaScript"),
    ("visual-basic", "Visual Basic"),
    ("cpp-csharp", "C++/C#"),
    ("prolog", "Prolog"),
    ("delphi-pascal", "Delphi/Pascal"),
    ("swift", "Swift"),
    ("go", "Go Programming"),
    ("typescript", "TypeScript"),
)
COMPUTER_COURSES = tuple(
    _open_course(f"computer-{code}", name, "Computer Course")
    for code, name in COMPUTER_COURSE_NAMES
)

OPEN_ENTRY_COURSES = (
    *PROFESSIONAL_SHORT_COURSES,
    *COMPUTER_COURSES,
    _open_course("driving-school", "Driving School", "Driving School"),
)

MAIN_SITE_APPLICATION_COURSES = (
    *BUSINESS_COURSES,
    *HOSPITALITY_COURSES,
    *COSMETOLOGY_COURSES,
    *HEALTH_SOCIAL_SCIENCE_COURSES,
    *KASNEB_COURSES,
    *ENGINEERING_IT_COURSES,
    *JOURNALISM_COURSES,
    *AGRICULTURE_COURSES,
    *OPEN_ENTRY_COURSES,
)

MAIN_SITE_APPLICATION_COURSE_NAMES = tuple(
    course.name for course in MAIN_SITE_APPLICATION_COURSES
)
MAIN_SITE_APPLICATION_COURSES_BY_CODE = {
    course.code: course for course in MAIN_SITE_APPLICATION_COURSES
}


def is_course_eligible(
    course: AdmissionCourseOption,
    education_level: str,
    grade: str = "",
) -> bool:
    if education_level not in course.eligible_education_levels:
        return False
    if education_level == EDUCATION_LEVEL_PRIMARY:
        return True
    if education_level != EDUCATION_LEVEL_SECONDARY or grade not in KCSE_GRADE_RANK:
        return False
    if course.minimum_grade is None:
        return True
    return KCSE_GRADE_RANK[grade] >= KCSE_GRADE_RANK[course.minimum_grade]


def get_course_option(code: str) -> AdmissionCourseOption | None:
    return MAIN_SITE_APPLICATION_COURSES_BY_CODE.get(code)
