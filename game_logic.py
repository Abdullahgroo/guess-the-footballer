import hashlib
import secrets
from datetime import datetime, timezone
from typing import Any

from player_data import Player, normalize_answer


def display_name(name: str) -> str:
    return name.title().replace("'O", "'o")


def hint_limit(player: Player, difficulty: str) -> int:
    if difficulty not in {"easy", "hard"}:
        raise ValueError("Difficulty must be easy or hard")
    if difficulty == "hard":
        return min(1, len(player["hints"]))
    return len(player["hints"])


def player_pool(players: list[Player], difficulty: str) -> list[int]:
    if difficulty not in {"easy", "hard"}:
        raise ValueError("Difficulty must be easy or hard")
    hard = difficulty == "hard"
    return [
        index
        for index, player in enumerate(players)
        if player["hard"] is hard
    ]


def parse_player_index(data: Any, player_count: int) -> int | None:
    if not isinstance(data, dict):
        return None
    try:
        index = int(data.get("index"))
    except (TypeError, ValueError):
        return None
    if index < 0 or index >= player_count:
        return None
    return index


def start_round(
    players: list[Player],
    mode: str,
    difficulty: str,
    today: str | None = None,
) -> dict[str, Any]:
    if mode not in {"random", "daily", "multiple_choice"}:
        raise ValueError("Mode must be random, daily, or multiple_choice")
    candidates = player_pool(players, difficulty)
    if not candidates:
        raise ValueError(f"No players are configured for {difficulty} mode")

    challenge_date = today or datetime.now(timezone.utc).date().isoformat()
    if mode == "daily":
        daily_seed = int.from_bytes(
            hashlib.sha256(f"{challenge_date}:{difficulty}".encode("ascii")).digest()[:8],
            "big",
        )
        index = candidates[daily_seed % len(candidates)]
    else:
        index = secrets.choice(candidates)

    round_data: dict[str, Any] = {
        "index": index,
        "player_count": len(players),
        "mode": mode,
        "difficulty": difficulty,
        "max_hints": hint_limit(players[index], difficulty),
        "challenge_date": challenge_date if mode == "daily" else None,
    }
    if mode == "multiple_choice":
        if len(candidates) < 4:
            raise ValueError("Multiple-choice mode needs at least four eligible players")
        randomizer = secrets.SystemRandom()
        option_indexes = [
            index,
            *randomizer.sample(
                [candidate for candidate in candidates if candidate != index],
                3,
            ),
        ]
        randomizer.shuffle(option_indexes)
        round_data["options"] = [
            display_name(players[player_index]["name"])
            for player_index in option_indexes
        ]
        round_data["correct_option"] = option_indexes.index(index)

    return round_data


def get_hint(player: Player, hint_no: int, difficulty: str) -> dict[str, Any]:
    available_hints = hint_limit(player, difficulty)
    if hint_no < 0 or hint_no >= available_hints:
        raise IndexError("No more hints available")
    hint = player["hints"][-1] if difficulty == "hard" else player["hints"][hint_no]
    return {"hint": hint, "has_more": hint_no + 1 < available_hints}


def check_answer(player: Player, guess: str, difficulty: str) -> dict[str, Any]:
    if difficulty not in {"easy", "hard"}:
        raise ValueError("Difficulty must be easy or hard")
    accepted_answers = {
        normalize_answer(answer)
        for answer in [player["name"], *player["aliases"]]
    }
    correct = normalize_answer(guess) in accepted_answers
    points = (5 if difficulty == "hard" else 3) if correct else (-2 if difficulty == "hard" else -1)
    return {
        "result": "You guessed it! WON" if correct else "No, wrong answer",
        "points": points,
    }
