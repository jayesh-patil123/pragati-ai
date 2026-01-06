from flask import Blueprint, jsonify, session
from utils.auth import login_required

# =================================================
# Blueprint Configuration
# =================================================
user_page_bp = Blueprint(
    "user_page",
    __name__,
    url_prefix="/api/user"
)

# =================================================
# Helpers
# =================================================
def current_user():
    """
    Guaranteed authenticated user accessor.
    login_required ensures session['user'] exists.
    """
    return session["user"]

# =================================================
# USER PROFILE (TOP CARD)
# =================================================
@user_page_bp.route("/profile", methods=["GET"])
@login_required
def user_profile():
    user = current_user()
    return jsonify({
        "id": user["id"],
        "name": user["name"],
        "email": user["email"]
    })

# =================================================
# ACHIEVEMENTS
# =================================================
@user_page_bp.route("/achievements", methods=["GET"])
@login_required
def achievements():
    return jsonify({
        "badges": [
            "Fast Learner",
            "AI Explorer",
            "Consistent Performer"
        ],
        "milestones": [
            "Completed 10 courses",
            "100+ study hours",
            "First AI project deployed"
        ],
        "score": 87
    })

# =================================================
# LEARNING PROGRESS
# =================================================
@user_page_bp.route("/learning", methods=["GET"])
@login_required
def learning():
    return jsonify({
        "active_courses": 3,
        "completed_courses": 7,
        "progress_percent": 68,
        "weekly_streak_days": 5
    })

# =================================================
# SUBSCRIPTION
# =================================================
@user_page_bp.route("/subscription", methods=["GET"])
@login_required
def subscription():
    return jsonify({
        "plan": "Pro",
        "price_inr": 999,
        "billing_cycle": "monthly",
        "renewal_date": "2025-01-01",
        "status": "active",
        "auto_renew": True
    })

# =================================================
# PREFERENCES (READ-ONLY SUMMARY)
# =================================================
@user_page_bp.route("/preferences", methods=["GET"])
@login_required
def preferences():
    return jsonify({
        "theme": "light",
        "language": "English",
        "timezone": "Asia/Kolkata",
        "notifications_enabled": True
    })

# =================================================
# SUPPORT
# =================================================
@user_page_bp.route("/support", methods=["GET"])
@login_required
def support():
    return jsonify({
        "open_tickets": 1,
        "resolved_tickets": 5,
        "average_response_time_hours": 4,
        "last_response": "2025-02-10"
    })

# =================================================
# FILES
# =================================================
@user_page_bp.route("/files", methods=["GET"])
@login_required
def files():
    return jsonify({
        "total_files": 12,
        "storage_used_mb": 240,
        "storage_limit_mb": 1024,
        "usage_percent": round((240 / 1024) * 100, 2)
    })

# =================================================
# HELP (PUBLIC)
# =================================================
@user_page_bp.route("/help", methods=["GET"])
def help_center():
    return jsonify({
        "faqs": 24,
        "guides": 8,
        "contact_available": True,
        "support_email": "support@pragati-ai.com"
    })

# =================================================
# SECURITY (OVERVIEW ONLY)
# =================================================
@user_page_bp.route("/security", methods=["GET"])
@login_required
def security():
    return jsonify({
        "two_factor_enabled": False,
        "active_sessions": 1,
        "trusted_devices": 1,
        "last_password_change": "2024-12-01",
        "oauth_providers": ["google", "github"]
    })
