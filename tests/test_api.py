import unittest

from app import create_app
from player_data import PLAYER_DATA


class GameApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = create_app({"TESTING": True}).test_client()

    def test_game_info_reports_player_and_clue_counts(self):
        response = self.client.get("/game_info")
        data = response.get_json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data["player_count"], 310)
        self.assertEqual(len(data["easy_hint_limits"]), 310)
        isak_index = next(i for i, player in enumerate(PLAYER_DATA) if player["name"] == "Alexander Isak")
        self.assertEqual(data["easy_hint_limits"][isak_index], 8)

    def test_health_endpoint_reports_ready(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), {"status": "ok"})

    def test_cors_is_limited_to_configured_frontend_origins(self):
        client = create_app({
            "TESTING": True,
            "CORS_ALLOWED_ORIGINS": "https://game.example",
        }).test_client()

        allowed = client.get(
            "/game_info",
            headers={"Origin": "https://game.example"},
        )
        denied = client.get(
            "/game_info",
            headers={"Origin": "https://untrusted.example"},
        )

        self.assertEqual(
            allowed.headers.get("Access-Control-Allow-Origin"),
            "https://game.example",
        )
        self.assertIsNone(denied.headers.get("Access-Control-Allow-Origin"))

    def test_cors_rejects_wildcard_origins(self):
        with self.assertRaisesRegex(ValueError, "explicit origins"):
            create_app({"CORS_ALLOWED_ORIGINS": "*"})

    def test_start_round_validates_inputs_and_returns_options(self):
        self.assertEqual(self.client.post("/start_round", json={"difficulty": "impossible"}).status_code, 400)
        self.assertEqual(self.client.post("/start_round", json={"mode": "unknown"}).status_code, 400)
        self.assertEqual(self.client.post("/start_round", json=[]).status_code, 400)

        response = self.client.post(
            "/start_round",
            json={"mode": "multiple_choice", "difficulty": "hard"},
        )
        data = response.get_json()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(PLAYER_DATA[data["index"]]["hard"])
        self.assertEqual(len(data["options"]), 4)
        self.assertEqual(data["player_count"], 310)

    def test_get_hint_returns_all_easy_hints_and_rejects_exhaustion(self):
        player_index = next(i for i, player in enumerate(PLAYER_DATA) if player["name"] == "Alexander Isak")
        for hint_no, expected_hint in enumerate(PLAYER_DATA[player_index]["hints"]):
            response = self.client.post(
                "/get_hint",
                json={"index": player_index, "hint_no": hint_no, "difficulty": "easy"},
            )
            data = response.get_json()
            self.assertEqual(response.status_code, 200)
            self.assertEqual(data["hint"], expected_hint)
            self.assertEqual(data["has_more"], hint_no < 7)

        exhausted = self.client.post(
            "/get_hint",
            json={"index": player_index, "hint_no": 8, "difficulty": "easy"},
        )
        self.assertEqual(exhausted.status_code, 404)

    def test_check_answer_accepts_aliases_and_handles_invalid_requests(self):
        player_index = next(i for i, player in enumerate(PLAYER_DATA) if player["name"] == "Luka Modrić")
        response = self.client.post(
            "/check_answer",
            json={"index": player_index, "guess": "Luka Modric", "difficulty": "hard"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["points"], 5)
        self.assertEqual(
            self.client.post("/check_answer", json={"index": -1, "guess": "Luka"}).status_code,
            400,
        )
        self.assertEqual(
            self.client.post("/check_answer", json={"index": player_index, "guess": ""}).status_code,
            400,
        )


if __name__ == "__main__":
    unittest.main()
