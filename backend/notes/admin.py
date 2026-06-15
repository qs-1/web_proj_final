from django.contrib import admin

from .models import Note, Subject


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "color", "created_at")
    search_fields = ("name", "user__username")


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "subject", "theme", "updated_at")
    list_filter = ("theme",)
    search_fields = ("title", "user__username")
