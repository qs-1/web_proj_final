from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from .ai_service import AIServiceError, generate_notes
from .models import Note, Subject
from .serializers import (
    GenerateSerializer,
    NoteListSerializer,
    NoteSerializer,
    SharedNoteSerializer,
    SubjectSerializer,
)


class SubjectViewSet(viewsets.ModelViewSet):
    serializer_class = SubjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Subject.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NoteViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return NoteListSerializer
        return NoteSerializer

    def get_queryset(self):
        qs = Note.objects.filter(user=self.request.user).select_related("subject")
        subject_id = self.request.query_params.get("subject")
        if subject_id:
            qs = qs.filter(subject_id=subject_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def share(self, request, pk=None):
        note = self.get_object()
        note.enable_sharing()
        return Response({"share_id": str(note.share_id)})

    @action(detail=True, methods=["post"])
    def unshare(self, request, pk=None):
        note = self.get_object()
        note.share_id = None
        note.save(update_fields=["share_id"])
        return Response({"share_id": None})


class GenerateView(APIView):
    """AI endpoint: raw_input + theme -> structured generated_content."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = GenerateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            content = generate_notes(
                raw_input=data["raw_input"],
                theme=data["theme"],
                title=data.get("title", ""),
            )
        except AIServiceError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        return Response({"generated_content": content})


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def shared_note(request, share_id):
    note = get_object_or_404(Note, share_id=share_id)
    return Response(SharedNoteSerializer(note).data)
