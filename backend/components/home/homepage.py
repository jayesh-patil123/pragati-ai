# backend/components/home/homepage.py

import logging
import traceback

from services.mcp_service import handle_home_message

logger = logging.getLogger(__name__)


def home_chat_handler(user_message: str) -> str:
    """
    Home page chat handler.

    Characteristics:
    - Stateless
    - Non-streaming
    - MCP-first with LLM fallback
    - Never raises unhandled exceptions
    """

    if not user_message or not user_message.strip():
        return "Please enter a message."

    try:
        return handle_home_message(user_message)

    except Exception as exc:
        # Log full traceback for backend debugging
        logger.error(
            "Home chat MCP failure: %s\n%s",
            exc,
            traceback.format_exc(),
        )

        # User-safe response (no internal details leaked)
        return "I ran into an internal issue while processing your request. Please try again."
