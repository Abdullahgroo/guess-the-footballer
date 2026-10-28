import os

from flask import Flask
from flask_cors import CORS

from api_routes import create_api_blueprint
from player_data import PLAYER_COUNT, PLAYER_DATA, hints, names


def create_app(test_config=None, players=None):
    flask_app = Flask(__name__)
    flask_app.config["CORS_ALLOWED_ORIGINS"] = os.environ.get(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )
    if test_config is not None:
        flask_app.config.update(test_config)
    allowed_origins = flask_app.config["CORS_ALLOWED_ORIGINS"]
    if isinstance(allowed_origins, str):
        allowed_origins = [
            origin.strip()
            for origin in allowed_origins.split(",")
            if origin.strip()
        ]
    if "*" in allowed_origins:
        raise ValueError("CORS_ALLOWED_ORIGINS must contain explicit origins, not '*'.")
    CORS(flask_app, resources={r"/*": {"origins": allowed_origins}})
    flask_app.register_blueprint(
        create_api_blueprint(PLAYER_DATA if players is None else players)
    )
    return flask_app


app = create_app()


if __name__ == "__main__":
    debug_enabled = os.environ.get("FLASK_DEBUG", "").lower() in {"1", "true"}
    app.run(debug=debug_enabled)
