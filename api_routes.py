from typing import Any

from flask import Blueprint, jsonify, render_template, request

from game_logic import check_answer, get_hint, hint_limit, parse_player_index, start_round
from player_data import PLAYER_DATA, Player


def create_api_blueprint(players: list[Player] = PLAYER_DATA) -> Blueprint:
    api = Blueprint("game_api", __name__)
    player_count = len(players)

    @api.get("/")
    def main_page():
        return render_template("main_html.html")

    @api.get("/game")
    def game_page():
        return render_template("index.html")

    @api.get("/health")
    def health():
        return jsonify({"status": "ok"})

    @api.get("/game_info")
    def game_info():
        return jsonify({
            "player_count": player_count,
            "easy_hint_limits": [hint_limit(player, "easy") for player in players],
        })

    @api.post("/start_round")
    def start_game_round():
        data: Any = request.get_json(silent=True)
        if not isinstance(data, dict):
            return jsonify({"error": "A JSON object is required"}), 400

        mode = str(data.get("mode", "random")).lower()
        difficulty = str(data.get("difficulty", "easy")).lower()
        if mode not in {"random", "daily", "multiple_choice"}:
            return jsonify({"error": "Mode must be random, daily, or multiple_choice"}), 400
        if difficulty not in {"easy", "hard"}:
            return jsonify({"error": "Difficulty must be easy or hard"}), 400
        return jsonify(start_round(players, mode, difficulty))

    @api.post("/get_hint")
    def reveal_hint():
        data: Any = request.get_json(silent=True)
        if not isinstance(data, dict):
            return jsonify({"error": "A JSON object is required"}), 400

        index = parse_player_index(data, player_count)
        try:
            hint_no = int(data.get("hint_no"))
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid hint number"}), 400

        if index is None:
            return jsonify({"error": f"Player number must be between 1 and {player_count}"}), 400
        difficulty = str(data.get("difficulty", "easy")).lower()
        if difficulty not in {"easy", "hard"}:
            return jsonify({"error": "Difficulty must be easy or hard"}), 400
        try:
            return jsonify(get_hint(players[index], hint_no, difficulty))
        except IndexError as error:
            return jsonify({"error": str(error)}), 404

    @api.post("/check_answer")
    def submit_answer():
        data: Any = request.get_json(silent=True)
        if not isinstance(data, dict):
            return jsonify({"error": "A JSON object is required"}), 400

        index = parse_player_index(data, player_count)
        guess = str(data.get("guess", "")).strip()
        if index is None:
            return jsonify({"error": f"Player number must be between 1 and {player_count}"}), 400
        if not guess:
            return jsonify({"error": "A guess is required"}), 400
        difficulty = str(data.get("difficulty", "easy")).lower()
        if difficulty not in {"easy", "hard"}:
            return jsonify({"error": "Difficulty must be easy or hard"}), 400
        return jsonify(check_answer(players[index], guess, difficulty))

    return api
