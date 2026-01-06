# backend/components/Learning/dashboard.py

from flask import Blueprint, jsonify, session
from datetime import datetime

learning_dashboard_bp = Blueprint(
    "learning_dashboard",
    __name__,
)

# ------------------------------------------------------------------
# Dashboard Overview
# ------------------------------------------------------------------

@learning_dashboard_bp.route("/dashboard", methods=["GET"])
def learning_dashboard():
    """
    High-level Learning Dashboard overview.

    Purpose:
    - Feed the Learning Dashboard landing page
    - Provide availability + lightweight stats
    - Avoid heavy payloads (detail panes fetch their own data)

    Auth:
    - Optional session-based personalization
    """

    user = session.get("user")

    response = {
        "user": {
            "authenticated": bool(user),
            "name": user.get("name") if user else None,
        },

        "last_updated": datetime.utcnow().isoformat() + "Z",

        # --------------------------------------------------
        # Learning Resources
        # --------------------------------------------------
        "learning_resources": {
            "documents": {
                "enabled": True,
                "count": 42,
                "description": "AI, ML, Python, and system design documents",
            },
            "youtube": {
                "enabled": True,
                "count": 18,
                "description": "Curated YouTube lectures and playlists",
            },
            "courses": {
                "enabled": True,
                "count": 12,
                "description": "Structured learning courses",
            },
        },

        # --------------------------------------------------
        # GitHub Projects
        # --------------------------------------------------
        "github_projects": {
            "explore_repos": {
                "enabled": True,
                "count": 75,
                "description": "Open-source AI & ML repositories",
            },
            "notes_flashcards": {
                "enabled": True,
                "count": 23,
                "description": "Notes, summaries, and flashcards",
            },
        },

        # --------------------------------------------------
        # Hands-on Practice
        # --------------------------------------------------
        "hands_on_practice": {
            "coding_challenges": {
                "enabled": True,
                "count": 30,
                "difficulty_levels": ["easy", "medium", "hard"],
            },
            "practice_python": {
                "enabled": True,
                "count": 25,
                "description": "Python hands-on exercises",
            },
            "sql_exercises": {
                "enabled": True,
                "count": 20,
                "description": "SQL challenges (HackerRank-style)",
            },
        },

        # --------------------------------------------------
        # Personalized Learning
        # --------------------------------------------------
        "personalized_learning": {
            "sectors": {
                "enabled": True,
                "count": 9,
                "description": "Role & industry-based learning paths",
            }
        },

        # --------------------------------------------------
        # Future / AI Capabilities
        # --------------------------------------------------
        "ai_capabilities": {
            "ask_ai": {
                "enabled": False,
                "status": "planned",
            },
            "knowledge_model": {
                "enabled": False,
                "status": "planned",
            },
        },
    }

    return jsonify(response)
