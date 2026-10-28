import json
import unicodedata
from pathlib import Path
from typing import TypedDict


PLAYER_DATA_PATH = Path(__file__).with_name("player_data.json")
ANSWER_CHARACTER_TRANSLATIONS = str.maketrans({
    "ø": "o",
    "æ": "ae",
    "œ": "oe",
    "ł": "l",
})


class Player(TypedDict):
    name: str
    aliases: list[str]
    hints: list[str]
    hard: bool


def normalize_answer(value: str) -> str:
    normalized = unicodedata.normalize(
        "NFKD",
        value.casefold().translate(ANSWER_CHARACTER_TRANSLATIONS),
    )
    return "".join(
        character
        for character in normalized
        if character.isalnum() and not unicodedata.combining(character)
    )


def load_player_data(path: Path = PLAYER_DATA_PATH) -> list[Player]:
    with path.open(encoding="utf-8") as player_file:
        records = json.load(player_file)

    if not isinstance(records, list) or not records:
        raise ValueError("Player data must be a non-empty JSON list")

    players: list[Player] = []
    aliases_by_name: dict[str, int] = {}
    for index, record in enumerate(records):
        if not isinstance(record, dict):
            raise ValueError(f"Player record {index} must be an object")

        name = record.get("name")
        aliases = record.get("aliases")
        hints = record.get("hints")
        hard = record.get("hard")
        if not isinstance(name, str) or not name.strip():
            raise ValueError(f"Player record {index} must have a non-empty name")
        if not isinstance(aliases, list) or any(
            not isinstance(alias, str) or not alias.strip()
            for alias in aliases
        ):
            raise ValueError(f"Aliases for {name} must be a list of non-empty strings")
        if not isinstance(hints, list) or not hints or any(
            not isinstance(hint, str) or not hint.strip()
            for hint in hints
        ):
            raise ValueError(f"Hints for {name} must be a non-empty list of strings")
        if not isinstance(hard, bool):
            raise ValueError(f"Hard-mode flag for {name} must be a boolean")

        for answer in [name, *aliases]:
            normalized = normalize_answer(answer)
            existing_index = aliases_by_name.get(normalized)
            if existing_index is not None and existing_index != index:
                existing_name = players[existing_index]["name"]
                raise ValueError(
                    f"Answer {answer!r} is ambiguous between {existing_name} and {name}"
                )
            aliases_by_name[normalized] = index

        players.append({
            "name": name,
            "aliases": aliases,
            "hints": hints,
            "hard": hard,
        })

    return players


PLAYER_DATA = load_player_data()
names = [player["name"] for player in PLAYER_DATA]
hints = [player["hints"] for player in PLAYER_DATA]
PLAYER_COUNT = len(PLAYER_DATA)
