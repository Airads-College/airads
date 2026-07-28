from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import AdmissionApplication, Campus, Program, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = [
        "username",
        "email",
        "first_name",
        "last_name",
        "is_staff",
        "is_active",
    ]
    list_filter = ["is_staff", "is_superuser", "is_active"]
    search_fields = ["username", "email", "first_name", "last_name"]
    ordering = ["username"]

    fieldsets = BaseUserAdmin.fieldsets + (("Additional Info", {"fields": ("phone",)}),)
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ("Additional Info", {"fields": ("phone",)}),
    )


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "blueprint", "is_published", "created_at"]
    list_filter = ["is_published", "blueprint"]
    search_fields = ["name", "code", "description"]
    ordering = ["-created_at"]
    date_hierarchy = "created_at"

    def get_readonly_fields(self, request, obj=None):
        from apps.platform.policy import platform_capability_enabled

        readonly_fields = list(super().get_readonly_fields(request, obj))
        if not platform_capability_enabled("manageBlueprints"):
            readonly_fields.append("blueprint")
        return readonly_fields

    def save_model(self, request, obj, form, change):
        from apps.platform.models import PlatformSettings
        from apps.platform.policy import platform_capability_enabled
        from apps.platform.services import PlatformSettingsService

        if not platform_capability_enabled("manageBlueprints"):
            settings = PlatformSettings.get_settings()
            active = PlatformSettingsService.ensure_active_blueprint_for_mode(settings)
            if active:
                obj.blueprint = active
        super().save_model(request, obj, form, change)


@admin.register(Campus)
class CampusAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "campus_type", "contact_email", "is_active"]
    list_filter = ["campus_type", "is_active"]
    search_fields = ["name", "slug", "contact_email"]
    prepopulated_fields = {"slug": ("name",)}
    ordering = ["campus_type", "name"]


@admin.register(AdmissionApplication)
class AdmissionApplicationAdmin(admin.ModelAdmin):
    list_display = [
        "full_name",
        "phone",
        "study_mode",
        "campus",
        "preferred_programme",
        "user",
        "order",
        "enrollment",
        "status",
        "source",
        "created_at",
    ]
    list_filter = ["status", "study_mode", "campus", "source", "intake"]
    search_fields = [
        "full_name",
        "phone",
        "email",
        "preferred_programme",
        "education_result",
    ]
    autocomplete_fields = ["user", "program", "order", "enrollment"]
    ordering = ["-created_at"]
    date_hierarchy = "created_at"
