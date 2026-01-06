from functools import wraps
from flask import session, jsonify
import logging

log = logging.getLogger(__name__)

def login_required(func):
    """
    Enforces session-based authentication.

    - Requires 'user' dict in session
    - Requires 'id' inside session user
    - Clears corrupted sessions
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        user = session.get("user")

        if not user:
            log.debug("Auth failed: no session user")
            return jsonify({"error": "Unauthorized"}), 401

        if not isinstance(user, dict) or "id" not in user:
            log.warning("Auth failed: invalid session user")
            session.clear()
            return jsonify({"error": "Unauthorized"}), 401

        return func(*args, **kwargs)
    return wrapper
