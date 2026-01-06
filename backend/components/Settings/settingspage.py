from flask import Blueprint, jsonify, session, request
from functools import wraps
from database.models import UserSettings
from database.db import db
from utils.auth import login_required


settings_bp = Blueprint("settings", __name__)


from database.models import User

def get_user_and_settings():
    user_session = session["user"]

    user = User.query.filter_by(email=user_session["email"]).first()
    if not user:
        return None, None

    settings = UserSettings.query.filter_by(user_id=user.id).first()

    if not settings:
        settings = UserSettings(user_id=user.id)
        db.session.add(settings)
        db.session.commit()

    return user, settings

# -----------------------------
# Auth Guard (local, simple)
# -----------------------------
#def login_required(func):
#    @wraps(func)
#    def wrapper(*args, **kwargs):
#        if "user" not in session:
#            return jsonify({"error": "Unauthorized"}), 401
#        return func(*args, **kwargs)
#    return wrapper

# =========================================================
# SETTINGS ROOT (AGGREGATOR)
# =========================================================
@settings_bp.route("/api/settings", methods=["GET"])
@login_required
def settings_root():
    user, settings = get_user_and_settings()

    return jsonify({
        "general": {
            "language": settings.language,
            "timezone": settings.timezone,
        },
        "appearance": {
            "theme": settings.theme,
            "accent": settings.accent,
        },
        "learning": {
            "reminders": settings.reminders,
            "recommendations": settings.recommendations,
        },
    })

# =========================================================
# GENERAL SETTINGS
# =========================================================
@settings_bp.route("/api/settings/general", methods=["GET", "PATCH"])
@login_required
def general_settings():
    """
    Get or update general user settings.

    - GET  → return current general settings
    - PATCH → update language and timezone
    """

    # Always resolve user + settings via helper
    _, settings = get_user_and_settings()

    # -------------------------
    # GET: fetch settings
    # -------------------------
    if request.method == "GET":
        return jsonify({
            "language": settings.language,
            "timezone": settings.timezone,
        })

    # -------------------------
    # PATCH: update settings
    # -------------------------
    data = request.get_json(silent=True) or {}

    settings.language = data.get("language", settings.language)
    settings.timezone = data.get("timezone", settings.timezone)

    db.session.commit()

    return jsonify({"success": True})

# =========================================================
# LEARNING SETTINGS
# =========================================================
@settings_bp.route("/api/settings/learning", methods=["GET", "PATCH"])
@login_required
def learning_settings():
    _, settings = get_user_and_settings()

    if request.method == "GET":
        return jsonify({
            "reminders": settings.reminders,
            "recommendations": settings.recommendations,
        })

    data = request.get_json() or {}

    settings.reminders = data.get("reminders", settings.reminders)
    settings.recommendations = data.get("recommendations", settings.recommendations)

    db.session.commit()
    return jsonify({"success": True})


# =========================================================
# SECURITY SETTINGS
# =========================================================
@settings_bp.route("/api/settings/security", methods=["GET"])
@login_required
def security_overview():
    return jsonify({
        "two_factor": False,
        "active_sessions": 2,
        "trusted_devices": 3
    })


@settings_bp.route("/api/settings/security/change-password", methods=["POST"])
@login_required
def change_password():
    data = request.get_json() or {}
    new_password = data.get("newPassword")

    if not new_password:
        return jsonify({"error": "Password required"}), 400

    # TODO: hash + save password
    return jsonify({"success": True})


@settings_bp.route("/api/settings/security/2fa/enable", methods=["POST"])
@login_required
def enable_2fa():
    return jsonify({"enabled": True})


@settings_bp.route("/api/settings/security/2fa/disable", methods=["POST"])
@login_required
def disable_2fa():
    return jsonify({"enabled": False})


@settings_bp.route("/api/settings/security/sessions", methods=["DELETE"])
@login_required
def clear_sessions():
    # TODO: invalidate sessions
    return jsonify({"success": True})


# =========================================================
# APPEARANCE SETTINGS
# =========================================================
@settings_bp.route("/api/settings/appearance", methods=["GET", "PATCH"])
@login_required
def appearance_settings():
    _, settings = get_user_and_settings()

    if request.method == "GET":
        return jsonify({
            "theme": settings.theme,
            "accent": settings.accent,
        })

    data = request.get_json() or {}

    settings.theme = data.get("theme", settings.theme)
    settings.accent = data.get("accent", settings.accent)

    db.session.commit()
    return jsonify({"success": True})


# =========================================================
# NOTIFICATIONS
# =========================================================
@settings_bp.route("/api/settings/notifications", methods=["GET", "PATCH"])
@login_required
def notification_settings():
    if request.method == "GET":
        return jsonify({
            "email": True,
            "push": False,
            "digest": True
        })

    data = request.get_json() or {}
    return jsonify({"success": True, "notifications": data})


# =========================================================
# ACCOUNT SETTINGS
# =========================================================
@settings_bp.route("/api/settings/account", methods=["GET", "PATCH"])
@login_required
def account_settings():
    user = session.get("user", {})

    if request.method == "GET":
        return jsonify({
            "username": user.get("name"),
            "email": user.get("email")
        })

    data = request.get_json() or {}
    session["user"].update(data)
    return jsonify({"success": True, "account": data})


# =========================================================
# ACCESSIBILITY
# =========================================================
@settings_bp.route("/api/settings/accessibility", methods=["GET", "PATCH"])
@login_required
def accessibility_settings():
    if request.method == "GET":
        return jsonify({
            "text_size": "medium",
            "high_contrast": False,
            "reduced_motion": False
        })

    data = request.get_json() or {}
    return jsonify({"success": True, "accessibility": data})


# =========================================================
# AI SETTINGS
# =========================================================
@settings_bp.route("/api/settings/ai", methods=["GET", "PATCH"])
@login_required
def ai_settings():
    if request.method == "GET":
        return jsonify({
            "agents_enabled": True,
            "personalization": True,
            "data_usage": False
        })

    data = request.get_json() or {}
    return jsonify({"success": True, "ai": data})


# =========================================================
# LOGOUT
# =========================================================
@settings_bp.route("/api/settings/logout", methods=["POST"])
@login_required
def settings_logout():
    session.clear()
    return jsonify({"success": True})
