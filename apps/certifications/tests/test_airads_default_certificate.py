from importlib import import_module

import pytest
from django.apps import apps

from apps.certifications.models import (
    CertificateTemplate,
    CertificateTemplateAssignment,
)
from apps.certifications.services import TemplateGenerator
from apps.certifications.template_builder import validate_layout


seed_migration = import_module(
    "apps.certifications.migrations.0009_seed_airads_default_certificate"
)


def test_airads_default_definition_is_a_valid_editable_portrait_layout():
    definition = seed_migration.airads_default_definition()

    normalized = validate_layout(
        definition["layout"],
        width_mm=definition["width"],
        height_mm=definition["height"],
    )
    contents = {item["content"] for item in normalized["elements"]}
    colors = {
        item["styles"].get("stroke") or item["styles"].get("fill")
        for item in normalized["elements"]
        if item["type"] == "shape"
    }

    assert definition["name"] == "Airads College Official"
    assert definition["orientation"] == "portrait"
    assert len(normalized["elements"]) < 100
    assert {
        "{{student_name}}",
        "{{program_title}}",
        "{{principal_name}}",
        "{{verification_url}}",
    }.issubset(contents)
    assert {"#0c4da2", "#ed1c24", "#008b4b"}.issubset(colors)
    assert any(
        item["type"] == "image"
        and item["assetUrl"] == "/static/airads-logo.png"
        for item in normalized["elements"]
    )


@pytest.mark.django_db
def test_airads_default_seed_is_idempotent_without_forcing_an_assignment():
    seed_migration.seed_airads_default(apps, None)
    seed_migration.seed_airads_default(apps, None)

    template = CertificateTemplate.objects.get(
        name=seed_migration.TEMPLATE_NAME,
        is_starter=True,
    )
    assert template.is_default is True
    assert template.status == CertificateTemplate.Status.PUBLISHED
    assert template.visibility == CertificateTemplate.Visibility.SYSTEM
    assert template.metadata["starterKey"] == seed_migration.STARTER_KEY
    assert template.versions.count() == 1
    assert not CertificateTemplateAssignment.objects.filter(
        scope="default"
    ).exists()


@pytest.mark.django_db
def test_administrator_default_overrides_the_airads_starter_fallback():
    seed_migration.seed_airads_default(apps, None)
    administrator_default = CertificateTemplate.objects.create(
        name="Administrator default",
        is_default=True,
    )

    assert TemplateGenerator().get_default_template() == administrator_default
