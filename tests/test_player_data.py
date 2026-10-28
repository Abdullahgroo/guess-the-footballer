import json
import re
import unittest
from tempfile import TemporaryDirectory
from pathlib import Path

from player_data import PLAYER_DATA, PLAYER_COUNT, load_player_data, normalize_answer


class PlayerDataTests(unittest.TestCase):
    def test_active_player_data_is_complete_and_validated(self):
        self.assertEqual(PLAYER_COUNT, 310)
        self.assertEqual(len(PLAYER_DATA), PLAYER_COUNT)
        self.assertEqual(len(load_player_data()), PLAYER_COUNT)

        normalized_names = set()
        normalized_answers = {}
        for index, player in enumerate(PLAYER_DATA):
            self.assertTrue(player["name"].strip())
            self.assertTrue(player["hints"])
            self.assertIsInstance(player["hard"], bool)
            self.assertTrue(all(alias.strip() for alias in player["aliases"]))
            self.assertTrue(all(hint.strip() for hint in player["hints"]))

            name = normalize_answer(player["name"])
            self.assertNotIn(name, normalized_names)
            normalized_names.add(name)
            for answer in [player["name"], *player["aliases"]]:
                normalized = normalize_answer(answer)
                existing_index = normalized_answers.get(normalized)
                self.assertTrue(
                    existing_index is None or existing_index == index,
                    f"Ambiguous alias: {answer}",
                )
                normalized_answers[normalized] = index

    def test_hard_mode_membership_is_data_driven(self):
        hard_players = [player for player in PLAYER_DATA if player["hard"]]
        self.assertEqual(len(hard_players), 20)
        expected_hard_aliases = {
            "xavi", "iniesta", "puyol", "henry", "drogba", "pirlo", "totti", "buffon",
            "klose", "lahm", "etoo", "yayatoure", "kompany", "aguero", "davidvilla",
            "davidsilva", "kante", "mahrez", "scholes", "riquelme",
        }
        actual_hard_answers = {
            normalize_answer(answer)
            for player in hard_players
            for answer in [player["name"], *player["aliases"]]
        }
        self.assertTrue(expected_hard_aliases.issubset(actual_hard_answers))
        self.assertFalse(next(player for player in PLAYER_DATA if player["name"] == "Lionel Messi")["hard"])

    def test_loader_rejects_malformed_and_ambiguous_data(self):
        invalid_records = [
            [],
            [{"name": "Player One", "aliases": [], "hints": ["clue"]}],
            [
                {"name": "Player One", "aliases": ["shared"], "hints": ["clue"], "hard": False},
                {"name": "Player Two", "aliases": ["SHARED"], "hints": ["clue"], "hard": True},
            ],
        ]
        with TemporaryDirectory() as directory:
            path = Path(directory) / "players.json"
            for records in invalid_records:
                with self.subTest(records=records):
                    path.write_text(json.dumps(records), encoding="utf-8")
                    with self.assertRaises(ValueError):
                        load_player_data(path)

    def test_every_supplied_player_and_clue_is_in_the_active_dataset(self):
        players_by_name = {
            normalize_answer(player["name"]): player
            for player in PLAYER_DATA
        }
        isak = players_by_name[normalize_answer("Alexander Isak")]
        self.assertEqual(len(isak["hints"]), 8)
        self.assertIn(
            normalize_answer("isak"),
            {normalize_answer(alias) for alias in isak["aliases"]},
        )
        inzaghi = players_by_name[normalize_answer("Filippo Inzaghi")]
        self.assertEqual(len(inzaghi["hints"]), 7)
        self.assertIn(
            normalize_answer("Pippo Inzaghi"),
            {normalize_answer(alias) for alias in inzaghi["aliases"]},
        )

    def test_reviewed_clues_do_not_reintroduce_future_world_cup_or_award_claims(self):
        disallowed_claims = re.compile(
            r"\b2026\s+(?:fifa\s+)?world\s+cup|\b2026\s+ballon d['’]or",
            re.IGNORECASE,
        )
        for player in PLAYER_DATA:
            for hint in player["hints"]:
                self.assertIsNone(disallowed_claims.search(hint), (player["name"], hint))

        tielemans = next(player for player in PLAYER_DATA if player["name"] == "Youri Tielemans")
        self.assertFalse(any("belarus" in hint.casefold() for hint in tielemans["hints"]))


if __name__ == "__main__":
    unittest.main()
