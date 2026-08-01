from django.test import TestCase
from rest_framework.test import APIClient

from account.models import Suites


class SuitesEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.suite = Suites.objects.create(
            suite_id="SUIT-001",
            suite_name="Login Suite",
            suite_code="LS001",
            std_follows="ST",
            description="Checks login flows",
        )

    def test_suites_endpoint_returns_existing_suites(self):
        response = self.client.get("/suites/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]["suite_id"], self.suite.suite_id)
