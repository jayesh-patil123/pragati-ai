# components/ai_tutor/ai_tutor.py
#
# AI Tutor API
# - MCP-driven intelligence
# - Clean request validation
# - Safe error handling
# - Future-ready for streaming & memory
#

from flask import Blueprint, request, jsonify
from typing import Dict, Any

from services.mcp_service import handle_ai_tutor


# ==============================================================================
# Blueprint Definition
# ==============================================================================

ai_tutor_bp = Blueprint("ai_tutor", __name__)


# ==============================================================================
# AI Tutor Endpoint
# ==============================================================================

@ai_tutor_bp.route("/ai-tutor", methods=["POST"])
def ai_tutor() -> Any:
    """
    AI Tutor entry point.

    Request JSON:
    {
        "question": "string (required)",
        "mode": "tutor | learn | review | practice (optional)"
    }

    Response JSON:
    {
        "answer": "string",
        "mode": "string"
    }
    """

    payload: Dict[str, Any] = request.get_json(silent=True) or {}

    question: str = str(payload.get("question", "")).strip()
    mode: str = str(payload.get("mode", "tutor")).strip().lower()

    # ------------------------------------------------------------------
    # Validation
    # ------------------------------------------------------------------

    if not question:
        return jsonify(
            {
                "error": "Question is required",
            }
        ), 400

    if mode not in {"tutor", "learn", "review", "practice"}:
        return jsonify(
            {
                "error": "Invalid mode",
                "allowed_modes": ["tutor", "learn", "review", "practice"],
            }
        ), 400

    # ------------------------------------------------------------------
    # Core AI Tutor Execution
    # ------------------------------------------------------------------

    try:
        result: Dict[str, Any] = handle_ai_tutor(
            question=question,
            mode=mode,
        )

        # Enforce response contract
        if not isinstance(result, dict) or "answer" not in result:
            raise RuntimeError("Invalid AI Tutor response format")

        return jsonify(
            {
                "answer": result["answer"],
                "mode": mode,
            }
        ), 200

    # ------------------------------------------------------------------
    # Error Handling (safe for production)
    # ------------------------------------------------------------------

    except Exception as exc:
        # Log full error server-side without leaking secrets
        print("AI Tutor error:", repr(exc))

        return jsonify(
            {
                "error": "AI Tutor failed",
            }
        ), 500
