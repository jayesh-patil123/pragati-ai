# backend/database/models.py

from datetime import datetime, timezone
from database.db import db
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    """
    Core user table.

    Used for:
    - Email + password authentication
    - OAuth-based authentication (Google, GitHub, LinkedIn)
    """

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(120), nullable=False)

    email = db.Column(
        db.String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    # NULL for OAuth-only users
    password_hash = db.Column(db.String(255), nullable=True)

    is_verified = db.Column(db.Boolean, default=False)

    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    auth_providers = db.relationship(
        "AuthProvider",
        backref="user",
        cascade="all, delete-orphan",
        lazy="select",
    )

    def to_session_dict(self):
        """
        Minimal user data stored in Flask session.
        Avoids storing sensitive fields.
        """
        return {
            "id": self.id, 
            "name": self.name,
            "email": self.email,
        }
    
    def set_password(self, password: str) -> None:
        """
        Hash and store the user's password.
        """
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """
        Verify a password against the stored hash.
        """
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)

class AuthProvider(db.Model):
    """
    OAuth providers linked to a user.

    One user can be linked to multiple providers:
    - Google
    - GitHub
    - LinkedIn
    """

    __tablename__ = "auth_providers"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    provider = db.Column(db.String(50), nullable=False)
    provider_user_id = db.Column(db.String(255), nullable=False)

    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    __table_args__ = (
        db.UniqueConstraint(
            "provider",
            "provider_user_id",
            name="uq_provider_user",
        ),
    )


class LoginOTP(db.Model):
    __tablename__ = "login_otps"

    id = db.Column(db.Integer, primary_key=True)

    email = db.Column(db.String(255), nullable=False, index=True)
    otp = db.Column(db.String(255), nullable=False)

    # 👇 Explicitly mark intent
    expires_at = db.Column(db.DateTime(timezone=True), nullable=False)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

class UserSettings(db.Model):
    __tablename__ = "user_settings"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )

    # -------------------------
    # General
    # -------------------------
    language = db.Column(db.String(50), default="English")
    timezone = db.Column(db.String(50), default="Asia/Kolkata")

    # -------------------------
    # Appearance
    # -------------------------
    theme = db.Column(db.String(20), default="light")
    accent = db.Column(db.String(20), default="blue")
    density = db.Column(db.String(20), default="comfortable")

    # -------------------------
    # Learning
    # -------------------------
    reminders = db.Column(db.Boolean, default=True)
    recommendations = db.Column(db.Boolean, default=True)
    sync = db.Column(db.Boolean, default=True)

    # -------------------------
    # Notifications
    # -------------------------
    email_notifications = db.Column(db.Boolean, default=True)
    push_notifications = db.Column(db.Boolean, default=False)
    digest = db.Column(db.Boolean, default=True)

    # -------------------------
    # Accessibility
    # -------------------------
    text_size = db.Column(db.String(20), default="medium")
    high_contrast = db.Column(db.Boolean, default=False)
    reduced_motion = db.Column(db.Boolean, default=False)

    # -------------------------
    # AI
    # -------------------------
    agents_enabled = db.Column(db.Boolean, default=True)
    personalization = db.Column(db.Boolean, default=True)
    data_usage = db.Column(db.Boolean, default=False)

    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

# =====================================================
# Chat History
# =====================================================

class ChatSession(db.Model):
    __tablename__ = "chat_sessions"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # "home" or "chat"
    page = db.Column(db.String(20), nullable=False)

    title = db.Column(db.String(255), nullable=False)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    messages = db.relationship(
        "ChatMessage",
        backref="session",
        cascade="all, delete-orphan",
        order_by="ChatMessage.created_at",
    )


class ChatMessage(db.Model):
    __tablename__ = "chat_messages"

    id = db.Column(db.Integer, primary_key=True)

    session_id = db.Column(
        db.Integer,
        db.ForeignKey("chat_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    sender = db.Column(db.String(10), nullable=False)  # user | bot
    content = db.Column(db.Text, nullable=False)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
