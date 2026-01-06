# backend/database/db.py

import os
from flask_sqlalchemy import SQLAlchemy

# ----------------------------------------------------------------------
# Single shared SQLAlchemy instance
# Imported everywhere models are defined
# ----------------------------------------------------------------------

db = SQLAlchemy()


def init_db(app):
    """
    Initialize the database with the Flask application.

    This function:
    - Configures SQLAlchemy
    - Initializes the app context
    - Creates tables if they do not exist

    This must be called exactly once from app.py.
    """

    # Prefer DATABASE_URL if present (recommended)
    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        # Fallback to individual DB_* variables (development safety)
        database_url = (
            "mysql+pymysql://"
            f"{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
            f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}"
            f"/{os.getenv('DB_NAME')}"
        )

    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Initialize SQLAlchemy with app
    db.init_app(app)

    # Create tables if they do not exist
    with app.app_context():
        db.create_all()
