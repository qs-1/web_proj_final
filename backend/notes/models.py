import uuid

from django.contrib.auth.models import User
from django.db import models


class Subject(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="subjects")
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default="#6366f1")  # hex color
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.user.username})"


class Note(models.Model):
    THEME_CHOICES = [
        ("minimal", "Minimal"),
        ("textbook", "Modern Textbook"),
    ]

    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name="notes",
        null=True,
        blank=True,
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")
    title = models.CharField(max_length=200)
    raw_input = models.TextField(blank=True)
    generated_content = models.JSONField(default=dict)  # AI-structured output
    theme = models.CharField(max_length=20, choices=THEME_CHOICES, default="minimal")
    share_id = models.UUIDField(unique=True, null=True, blank=True)  # public sharing
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.title

    def enable_sharing(self):
        if not self.share_id:
            self.share_id = uuid.uuid4()
            self.save(update_fields=["share_id"])
        return self.share_id
