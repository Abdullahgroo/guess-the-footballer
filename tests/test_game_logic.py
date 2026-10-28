import unittest
from datetime import date

from game_logic import check_answer, get_hint, hint_limit, parse_player_index, player_pool, start_round
from player_data import PLAYER_DATA, normalize_answer


class GameLogicTests(unittest.TestCase):
    def test_easy_and_hard_pools_use_player_data_flag(self):
        easy = player_pool(PLAYER_DATA, "easy")
        hard = player_pool(PLAYER_DATA, "hard")
        self.assertEqual((len(easy), len(hard)), (290, 20))
        self.assertTrue(all(not PLAYER_DATA[index]["hard"] for index in easy))
        self.assertTrue(all(PLAYER_DATA[index]["hard"] for index in hard))

    def test_easy_exposes_all_clues_and_hard_exposes_one(self):
        index = next(i for i, player in enumerate(PLAYER_DATA) if player["name"] == "Alexander Isak")
        player = PLAYER_DATA[index]
        self.assertEqual(hint_limit(player, "easy"), 8)
        self.assertEqual(hint_limit(player, "hard"), 1)

        for hint_no, expected_hint in enumerate(player["hints"]):
            result = get_hint(player, hint_no, "easy")
            self.assertEqual(result["hint"], expected_hint)
            self.assertEqual(result["has_more"], hint_no < 7)
        self.assertEqual(get_hint(player, 0, "hard"), {
            "hint": player["hints"][-1],
            "has_more": False,
        })

    def test_start_round_supports_random_daily_and_multiple_choice(self):
        for difficulty in ("easy", "hard"):
            pool = player_pool(PLAYER_DATA, difficulty)
            random_round = start_round(PLAYER_DATA, "random", difficulty)
            self.assertIn(random_round["index"], pool)
            self.assertEqual(random_round["max_hints"], hint_limit(
                PLAYER_DATA[random_round["index"]],
                difficulty,
            ))

            daily_one = start_round(PLAYER_DATA, "daily", difficulty, today="2026-10-27")
            daily_two = start_round(PLAYER_DATA, "daily", difficulty, today="2026-10-27")
            self.assertEqual(daily_one, daily_two)

            multiple_choice = start_round(PLAYER_DATA, "multiple_choice", difficulty)
            self.assertEqual(len(multiple_choice["options"]), 4)
            self.assertIn(multiple_choice["correct_option"], range(4))

    def test_answer_matching_is_accent_insensitive_and_points_follow_difficulty(self):
        player = next(player for player in PLAYER_DATA if player["name"] == "Luka Modrić")
        self.assertEqual(normalize_answer("Luka Modric"), normalize_answer(player["name"]))
        self.assertEqual(check_answer(player, "Luka Modric", "easy")["points"], 3)
        self.assertEqual(check_answer(player, "not that player", "easy")["points"], -1)
        self.assertEqual(check_answer(player, "Luka Modric", "hard")["points"], 5)
        self.assertEqual(check_answer(player, "not that player", "hard")["points"], -2)

    def test_player_index_parser_rejects_bad_values(self):
        self.assertEqual(parse_player_index({"index": "0"}, len(PLAYER_DATA)), 0)
        self.assertIsNone(parse_player_index({"index": "-1"}, len(PLAYER_DATA)))
        self.assertIsNone(parse_player_index({"index": "bad"}, len(PLAYER_DATA)))
        self.assertIsNone(parse_player_index([], len(PLAYER_DATA)))


if __name__ == "__main__":
    unittest.main()
