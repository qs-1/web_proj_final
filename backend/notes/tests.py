from unittest.mock import patch

from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from .models import Note, Subject


class AuthFlowTests(APITestCase):
    def test_register_and_login(self):
        resp = self.client.post(
            "/api/auth/register/",
            {"username": "alice", "email": "a@x.com", "password": "Str0ngPass!9"},
            format="json",
        )
        self.assertEqual(resp.status_code, 201)

        resp = self.client.post(
            "/api/auth/login/",
            {"username": "alice", "password": "Str0ngPass!9"},
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertIn("access", resp.data)

    def test_duplicate_username_rejected(self):
        User.objects.create_user(username="bob", password="Str0ngPass!9")
        resp = self.client.post(
            "/api/auth/register/",
            {"username": "bob", "password": "Str0ngPass!9"},
            format="json",
        )
        self.assertEqual(resp.status_code, 400)


class NotesApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="carol", password="Str0ngPass!9")
        self.client.force_authenticate(self.user)

    def test_subject_and_note_crud(self):
        resp = self.client.post(
            "/api/subjects/", {"name": "Algorithms", "color": "#6366f1"}, format="json"
        )
        self.assertEqual(resp.status_code, 201)
        subject_id = resp.data["id"]

        resp = self.client.post(
            "/api/notes/",
            {"title": "Sorting", "subject": subject_id, "raw_input": "messy text"},
            format="json",
        )
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(Note.objects.count(), 1)

    def test_cannot_see_other_users_notes(self):
        other = User.objects.create_user(username="dave", password="Str0ngPass!9")
        subj = Subject.objects.create(user=other, name="Secret")
        Note.objects.create(user=other, subject=subj, title="Hidden")
        resp = self.client.get("/api/notes/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 0)

    def test_share_and_public_access(self):
        note = Note.objects.create(
            user=self.user,
            title="Shared",
            generated_content={"title": "Shared", "summary": "s", "sections": [], "key_takeaways": []},
        )
        resp = self.client.post(f"/api/notes/{note.id}/share/")
        self.assertEqual(resp.status_code, 200)
        share_id = resp.data["share_id"]

        # Public access without auth
        self.client.force_authenticate(user=None)
        resp = self.client.get(f"/api/shared/{share_id}/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["title"], "Shared")

    @patch("notes.views.generate_notes")
    def test_generate_endpoint(self, mock_generate):
        mock_generate.return_value = {
            "title": "Generated",
            "summary": "ok",
            "sections": [],
            "key_takeaways": ["a"],
        }
        resp = self.client.post(
            "/api/notes/generate/",
            {"raw_input": "some messy notes", "theme": "minimal"},
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["generated_content"]["title"], "Generated")
