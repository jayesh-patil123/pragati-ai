# pyright: reportUndefinedVariable=false

from flask import Flask, request, jsonify, Response, stream_with_context, session
from flask_cors import CORS
from dotenv import load_dotenv
import os
# =====================================================
# MCP NOTE
# -----------------------------------------------------
# app.py MUST NOT:
# - Contain MCP routing logic
# - Contain tool heuristics
# - Call LLMs directly
#
# All AI intelligence lives in services/mcp_service.py
# =====================================================
from database.db import init_db, db
import random
from datetime import datetime, timedelta, timezone
from database.models import LoginOTP
from utils.email import send_email
from werkzeug.security import generate_password_hash, check_password_hash
from database.models import (
    User,
    LoginOTP,
    UserSettings,
    ChatSession,
    ChatMessage,
)

from flask import redirect
from urllib.parse import urlencode
import requests
from database.models import AuthProvider
from sqlalchemy.orm import joinedload
from utils.auth import login_required



# =====================================================
# Session Helpers
# =====================================================
def current_user():
    user = session.get("user")
    if not user or "id" not in user:
        session.clear()
        raise RuntimeError("Invalid user session")
    return user

# =====================================================
# Environment Setup
# =====================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

# =====================================================
# Flask App Initialization
# =====================================================
app = Flask(__name__)

app.config.update(
    SMTP_HOST=os.getenv("SMTP_HOST"),
    SMTP_PORT=int(os.getenv("SMTP_PORT", 587)),
    SMTP_USER=os.getenv("SMTP_USER"),
    SMTP_PASSWORD=os.getenv("SMTP_PASSWORD"),
)

# -----------------------------
# Database configuration
# -----------------------------
app.config["DB_HOST"] = os.getenv("DB_HOST")
app.config["DB_PORT"] = os.getenv("DB_PORT")
app.config["DB_NAME"] = os.getenv("DB_NAME")
app.config["DB_USER"] = os.getenv("DB_USER")
app.config["DB_PASSWORD"] = os.getenv("DB_PASSWORD")

init_db(app)

# Secret key required for session-based authentication
app.secret_key = os.getenv("SECRET_KEY", "dev-secret-key")

# Session cookie configuration
# - HTTPOnly: prevents JS access
# - SameSite=Lax: required for Vite proxy + credentials
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False,
)

# =====================================================
# MCP Initialization (REQUIRED)
# =====================================================

# Ensure MCP tools are registered at startup
import mcp.tools  # noqa

from mcp.client import mcp_client
from services.mcp_service import call_mcp_tool


# =====================================================
# CORS Configuration
# =====================================================
# Allow frontend (Vite) to send cookies with requests
CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:5173"],
)

# =====================================================
# Internal Imports (after env + app setup)
# =====================================================
from components.home.homepage import home_chat_handler
from components.chat.chatpage import (
    chatpage_chat_handler,
    chatpage_chat_stream_handler,
)
from components.ai_tutor.ai_tutor import ai_tutor_bp


from components.user.userpage import user_page_bp
from components.Settings.settingspage import settings_bp
from components.courses.courses import courses_bp
from components.Filespage.routes import files_bp

from components.Learning.router import learning_bp



# =====================================================
# Blueprint Registration
# =====================================================
# UserPage APIs: /api/user/*
# Settings APIs: /api/settings/*
app.register_blueprint(user_page_bp)
app.register_blueprint(settings_bp)
app.register_blueprint(courses_bp)
app.register_blueprint(ai_tutor_bp, url_prefix="/api")
app.register_blueprint(files_bp)

app.register_blueprint(learning_bp, url_prefix="/api/v1/learning",)


# =====================================================
# Authentication: Password Signup
# =====================================================
@app.route("/api/register", methods=["POST"])
def register():
    """
    Create a new user using email + password.
    """

    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    phone = data.get("phone", "").strip()

    # -------------------------
    # Validation
    # -------------------------
    if not name or not email or not password:
        return jsonify({"error": "Name, email and password are required"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "Email already registered"}), 409

    # -------------------------
    # Create User
    # -------------------------
    user = User(
        name=name,
        email=email,
        is_verified=True,  # password signup = verified
    )
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    # Create default settings
    settings = UserSettings(user_id=user.id)
    db.session.add(settings)
    db.session.commit()

    # Store session
    session["user"] = user.to_session_dict()

    return jsonify({"user": session["user"]}), 201

# =====================================================
# Authentication: Login
# =====================================================
@app.route("/api/login", methods=["POST"])
def login():
    """
    Authenticate user using email and password.

    - Looks up user in database
    - Verifies password hash
    - Stores minimal user data in session
    """

    data = request.get_json(silent=True) or {}

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    session["user"] = user.to_session_dict()

    # Ensure settings row exists
    if not UserSettings.query.filter_by(user_id=user.id).first():
        settings = UserSettings(user_id=user.id)
        db.session.add(settings)
        db.session.commit()

    return jsonify({"user": session["user"]})


# =====================================================
# Authentication: OTP
# =====================================================

# OTP Request 
@app.route("/api/auth/request-otp", methods=["POST"])
def request_otp():
    """
    Send 4-digit OTP to email for login.
    """

    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()

    if not email:
        return jsonify({"error": "Email required"}), 400

    otp = f"{random.randint(1000, 9999)}"
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)

    otp_entry = LoginOTP(
        email=email,
        otp=generate_password_hash(otp),
        expires_at=expires_at,
    )

    db.session.add(otp_entry)
    db.session.commit()

    send_email(
        to_email=email,
        subject="Your Login OTP",
        body=f"Your OTP is {otp}. It expires in 5 minutes.",
    )

    return jsonify({"success": True})

print("VERIFY OTP ROUTE LOADED")

# OTP Verification
@app.route("/api/auth/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()
    otp = data.get("otp", "").strip()

    if not email or not otp:
        return jsonify({"error": "Email and OTP required"}), 400

    record = (
        LoginOTP.query
        .filter_by(email=email)
        .order_by(LoginOTP.created_at.desc())
        .first()
    )

    if not record:
        return jsonify({"error": "Invalid OTP"}), 401

    expires_at = record.expires_at

    # 🔒 Normalize legacy naive timestamps
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if datetime.now(timezone.utc) > expires_at:
        return jsonify({"error": "OTP expired"}), 401

    if not check_password_hash(record.otp, otp):
        return jsonify({"error": "Invalid OTP"}), 401

    user = User.query.filter_by(email=email).first()

    if not user:
        user = User(
            name=email.split("@")[0],  # temporary name
            email=email,
            is_verified=True,
        )
        db.session.add(user)
        db.session.commit()

    session["user"] = user.to_session_dict()

    if not UserSettings.query.filter_by(user_id=user.id).first():
        settings = UserSettings(user_id=user.id)
        db.session.add(settings)

    db.session.delete(record)
    db.session.commit()

    return jsonify({"user": session["user"]})


# =====================================================
# Authentication: Logout
# =====================================================
@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True})

# =====================================================
# Chat History APIs
# =====================================================

@app.route("/api/chat/save", methods=["POST"])
@login_required
def save_chat():
    data = request.get_json() or {}

    page = data.get("page")          # home | chat
    session_id = data.get("session_id")
    message = data.get("message")    # { from, text }

    if not page or not message:
        return jsonify({"error": "Invalid payload"}), 400

    user_id = current_user()["id"]

    # create session if missing
    if not session_id:
        title = message["text"][:40] or "New Chat"

        chat_session = ChatSession(
            user_id=user_id,
            page=page,
            title=title,
        )
        db.session.add(chat_session)
        db.session.flush()

    else:
        chat_session = ChatSession.query.filter_by(
            id=session_id,
            user_id=user_id,
        ).first()

        if not chat_session:
            return jsonify({"error": "Session not found"}), 404

    chat_message = ChatMessage(
        session_id=chat_session.id,
        sender=message["from"],
        content=message["text"],
    )

    db.session.add(chat_message)
    db.session.commit()  # commit BOTH session + message together

    return jsonify({
        "session_id": chat_session.id
    })


@app.route("/api/chat/history", methods=["GET"])
@login_required
def chat_history():
    page = request.args.get("page")
    user_id = current_user()["id"]

    sessions = (
        ChatSession.query
        .options(joinedload(ChatSession.messages))
        .filter_by(user_id=user_id, page=page)
        .order_by(ChatSession.created_at.desc())
        .all()
    )

    return jsonify([
        {
            "id": s.id,
            "title": s.title,
            "messages": [
                {"from": m.sender, "text": m.content}
                for m in s.messages
            ],
        }
        for s in sessions
    ])


@app.route("/api/chat/<int:session_id>", methods=["DELETE"])
@login_required
def delete_chat(session_id):
    user_id = current_user()["id"]

    chat = ChatSession.query.filter_by(
        id=session_id,
        user_id=user_id,
    ).first()

    if not chat:
        return jsonify({"error": "Chat not found"}), 404

    db.session.delete(chat)
    db.session.commit()

    return jsonify({"success": True})


@app.route("/api/chat/history", methods=["DELETE"])
@login_required
def clear_all_chats():
    user_id = current_user()["id"]
    page = request.args.get("page")

    ChatMessage.query.join(ChatSession).filter(
        ChatSession.user_id == user_id,
        ChatSession.page == page,
    ).delete(synchronize_session=False)

    ChatSession.query.filter_by(
        user_id=user_id,
        page=page,
    ).delete()

    db.session.commit()
    return jsonify({"success": True})


# =====================================================
# OAuth: Shared Helper
# =====================================================
def oauth_login(provider: str, provider_user_id: str, email: str, name: str):
    """
    Common OAuth login logic for all providers.
    """

    auth = AuthProvider.query.filter_by(
        provider=provider,
        provider_user_id=provider_user_id,
    ).first()

    if auth:
        user = auth.user
    else:
        user = User.query.filter_by(email=email).first()

        if not user:
            user = User(
                name=name,
                email=email,
                is_verified=True,
            )
            db.session.add(user)
            db.session.commit()

        auth = AuthProvider(
            user_id=user.id,
            provider=provider,
            provider_user_id=provider_user_id,
        )
        db.session.add(auth)
        db.session.commit()

    session["user"] = user.to_session_dict()

# =====================================================
# Authentication: Google OAuth
# =====================================================

@app.route("/api/auth/google")
def google_login():
    """
    Redirect user to Google OAuth consent screen.
    """
    params = {
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "redirect_uri": os.getenv("GOOGLE_REDIRECT_URI"),
        "response_type": "code",
        "scope": "openid email profile",
        "prompt": "select_account",
    }

    google_auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        + urlencode(params)
    )

    return redirect(google_auth_url)


@app.route("/api/auth/google/callback")
def google_callback():
    """
    Google redirects here after user authentication.
    """

    code = request.args.get("code")
    if not code:
        return "Google login failed", 400

    # Exchange authorization code for access token
    token_response = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": os.getenv("GOOGLE_REDIRECT_URI"),
        },
    )

    token_data = token_response.json()
    access_token = token_data.get("access_token")

    if not access_token:
        return "Failed to obtain access token", 400

    # Fetch user profile from Google
    userinfo_response = requests.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    userinfo = userinfo_response.json()

    oauth_login(
        provider="google",
        provider_user_id=userinfo["id"],
        email=userinfo["email"],
        name=userinfo.get("name", "User"),
    )

    # Redirect back to frontend after successful login
    return redirect(os.getenv("FRONTEND_URL", "http://localhost:5173/"))


# =====================================================
# Authentication: GitHub OAuth
# =====================================================

@app.route("/api/auth/github")
def github_login():
    """
    Redirect user to GitHub OAuth consent screen.
    """
    params = {
        "client_id": os.getenv("GITHUB_CLIENT_ID"),
        "redirect_uri": os.getenv("GITHUB_REDIRECT_URI"),
        "scope": "read:user user:email",
    }

    github_auth_url = (
        "https://github.com/login/oauth/authorize?"
        + urlencode(params)
    )

    return redirect(github_auth_url)


@app.route("/api/auth/github/callback")
def github_callback():
    """
    GitHub redirects here after authentication.
    """

    code = request.args.get("code")
    if not code:
        return "GitHub login failed", 400

    # Exchange code for access token
    token_response = requests.post(
        "https://github.com/login/oauth/access_token",
        headers={"Accept": "application/json"},
        data={
            "client_id": os.getenv("GITHUB_CLIENT_ID"),
            "client_secret": os.getenv("GITHUB_CLIENT_SECRET"),
            "code": code,
            "redirect_uri": os.getenv("GITHUB_REDIRECT_URI"),
        },
    )

    token_data = token_response.json()
    access_token = token_data.get("access_token")

    if not access_token:
        return "Failed to obtain GitHub access token", 400

    headers = {"Authorization": f"Bearer {access_token}"}

    # Fetch GitHub user profile
    user_response = requests.get(
        "https://api.github.com/user",
        headers=headers,
    )
    user_data = user_response.json()

    # Fetch email (GitHub may hide it)
    emails_response = requests.get(
        "https://api.github.com/user/emails",
        headers=headers,
    )
    emails = emails_response.json()

    primary_email = next(
        (e["email"] for e in emails if e.get("primary")),
        None,
    )

    if not primary_email:
        return "GitHub email not available", 400

    oauth_login(
        provider="github",
        provider_user_id=str(user_data["id"]),
        email=primary_email,
        name=user_data.get("name") or user_data.get("login"),
    )

    return redirect(os.getenv("FRONTEND_URL", "http://localhost:5173/"))


# =====================================================
# Authentication: LinkedIn OAuth
# =====================================================
@app.route("/api/auth/linkedin")
def linkedin_login():
    params = {
        "response_type": "code",
        "client_id": os.getenv("LINKEDIN_CLIENT_ID"),
        "redirect_uri": os.getenv("LINKEDIN_REDIRECT_URI"),
        "scope": "openid profile email",
    }

    return redirect(
        "https://www.linkedin.com/oauth/v2/authorization?"
        + urlencode(params)
    )

@app.route("/api/auth/linkedin/callback")
def linkedin_callback():
    error = request.args.get("error")
    if error:
        return f"LinkedIn error: {error}", 400

    code = request.args.get("code")
    if not code:
        return "LinkedIn login failed", 400

    token_response = requests.post(
        "https://www.linkedin.com/oauth/v2/accessToken",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "client_id": os.getenv("LINKEDIN_CLIENT_ID"),
            "client_secret": os.getenv("LINKEDIN_CLIENT_SECRET"),
            "redirect_uri": os.getenv("LINKEDIN_REDIRECT_URI"),
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    token_data = token_response.json()
    access_token = token_data.get("access_token")

    if not access_token:
        return "Failed to obtain access token", 400

    userinfo = requests.get(
        "https://api.linkedin.com/v2/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
    ).json()

    provider_user_id = userinfo.get("sub")
    email = userinfo.get("email")
    name = userinfo.get("name", "User")

    if not provider_user_id or not email:
        return "Invalid LinkedIn user info", 400

    oauth_login(
        provider="linkedin",
        provider_user_id=provider_user_id,
        email=email,
        name=name,
    )

    return redirect(os.getenv("FRONTEND_URL", "http://localhost:5173/"))

# =====================================================
# MCP (Model Context Protocol) APIs
# =====================================================
@app.route("/api/mcp/tools", methods=["GET"])
@login_required
def list_mcp_tools():
    """
    List available MCP tools.
    """
    try:
        return jsonify(mcp_client.list_tools())
    except Exception as exc:
        print("MCP tools error:", repr(exc))
        return jsonify({"error": "MCP unavailable"}), 500


@app.route("/api/mcp/execute", methods=["POST"])
@login_required
def execute_mcp_tool():
    data = request.get_json(silent=True) or {}
    tool = data.get("tool")
    params = data.get("params", {})

    if not tool:
        return jsonify({"error": "Tool name required"}), 400

    try:
        result = call_mcp_tool(tool, params)
        return jsonify(result)
    except Exception as exc:
        print("MCP error:", exc)
        return jsonify({"error": "MCP execution failed"}), 500


# =====================================================
# Home Page Chat (Non-Streaming)
# =====================================================
@app.route("/api/home/chat", methods=["POST"])
def home_chat():
    data = request.get_json(silent=True) or {}
    message = data.get("message", "").strip()

    if not message:
        return jsonify({"reply": "Please enter a message."}), 400

    try:
        reply = home_chat_handler(message)
        return jsonify({"reply": reply})
    except Exception as exc:
        print("Home chat error:", repr(exc))
        return jsonify({"reply": "Server error"}), 500


# =====================================================
# Chat Page Chat (Non-Streaming)
# =====================================================
@app.route("/api/chatpage/chat", methods=["POST"])
def chatpage_chat():
    data = request.get_json(silent=True) or {}

    message = data.get("message", "").strip()
    context = data.get("context", [])
    mode = data.get("mode")

    if not message:
        return jsonify({"reply": "Please enter a message."}), 400

    try:
        reply = chatpage_chat_handler(message, context, mode)
        return jsonify({"reply": reply})
    except Exception as exc:
        print("Chat page error:", repr(exc))
        return jsonify({"reply": "Server error"}), 500


# =====================================================
# Chat Page Chat (Streaming - SSE)
# =====================================================
@app.route("/api/chatpage/chat/stream", methods=["POST"])
def chatpage_stream():
    payload = request.json or {}

    def generate():
        for token in chatpage_chat_stream_handler(
            message=payload.get("message"),
            context=None,
            mode=payload.get("mode"),
            file_id=payload.get("file_id"),
        ):
            yield f"data: {token}\n\n"

    return Response(generate(), mimetype="text/event-stream")


# =====================================================
# Health Check
# =====================================================
@app.route("/health", methods=["GET"])
def health():
    return {"status": "ok"}


# =====================================================
# Application Entry Point
# =====================================================
if __name__ == "__main__":
    print("Backend started successfully with RAG enabled")
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
        debug=True,
        threaded=True,
    )

