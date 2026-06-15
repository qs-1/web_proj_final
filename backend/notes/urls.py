from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import GenerateView, NoteViewSet, SubjectViewSet, shared_note

router = DefaultRouter()
router.register(r"subjects", SubjectViewSet, basename="subject")
router.register(r"notes", NoteViewSet, basename="note")

urlpatterns = [
    path("notes/generate/", GenerateView.as_view(), name="note-generate"),
    path("", include(router.urls)),
    path("shared/<uuid:share_id>/", shared_note, name="shared-note"),
]
