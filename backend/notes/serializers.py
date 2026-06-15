from rest_framework import serializers

from .models import Note, Subject


class SubjectSerializer(serializers.ModelSerializer):
    note_count = serializers.IntegerField(source="notes.count", read_only=True)

    class Meta:
        model = Subject
        fields = ["id", "name", "color", "created_at", "note_count"]
        read_only_fields = ["id", "created_at", "note_count"]


class NoteListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list/grid views."""

    subject_name = serializers.CharField(source="subject.name", read_only=True)
    subject_color = serializers.CharField(source="subject.color", read_only=True)
    preview = serializers.SerializerMethodField()

    class Meta:
        model = Note
        fields = [
            "id",
            "title",
            "subject",
            "subject_name",
            "subject_color",
            "theme",
            "share_id",
            "preview",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_preview(self, obj):
        """Short text snippet for the card, without shipping full content."""
        gc = obj.generated_content or {}
        if gc.get("summary"):
            return gc["summary"][:160]
        sections = gc.get("sections") or []
        if sections and sections[0].get("content"):
            import re

            text = re.sub(r"[#*`>_]", "", sections[0]["content"])
            return text.strip()[:160]
        return ""


class NoteSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    subject_color = serializers.CharField(source="subject.color", read_only=True)

    class Meta:
        model = Note
        fields = [
            "id",
            "title",
            "subject",
            "subject_name",
            "subject_color",
            "raw_input",
            "generated_content",
            "theme",
            "share_id",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "share_id", "created_at", "updated_at"]

    def validate_subject(self, value):
        request = self.context.get("request")
        if value is not None and request and value.user != request.user:
            raise serializers.ValidationError("Invalid subject.")
        return value


class SharedNoteSerializer(serializers.ModelSerializer):
    """Public, read-only representation of a shared note."""

    author = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Note
        fields = ["title", "generated_content", "theme", "author", "updated_at"]
        read_only_fields = fields


class GenerateSerializer(serializers.Serializer):
    raw_input = serializers.CharField(required=False, allow_blank=True, default="")
    file = serializers.FileField(required=False, allow_empty_file=False)
    theme = serializers.ChoiceField(
        choices=[c[0] for c in Note.THEME_CHOICES], default="minimal"
    )
    title = serializers.CharField(required=False, allow_blank=True, default="")

    def validate(self, data):
        if not data.get("raw_input") and not data.get("file"):
            raise serializers.ValidationError("Either raw_input or a file must be provided.")
        return data
