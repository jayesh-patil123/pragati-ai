"""
Chat Page Backend (ENTERPRISE, FRONTEND-ALIGNED)

Key guarantees:
- EXACTLY ONE SSE event per line
- NO double newlines
- NO embedded 'data:' leakage
- Frontend-safe streaming
- RAG used ONLY when document intent is detected
"""

from __future__ import annotations

import logging
import traceback
from typing import Any, Iterable, Optional

from RAG.rag_engine import answer as rag_answer
from services.mcp_service import handle_chat_stream, handle_home_message

logger = logging.getLogger(__name__)

# =============================================================================
# Helpers
# =============================================================================

def _normalize_message(message: Any) -> Optional[str]:
    if message is None:
        return None
    text = str(message).strip()
    return text if text else None


def _sse_line(data: str) -> str:
    """
    Emit EXACTLY one SSE line.
    Frontend splits on '\\n', not '\\n\\n'.
    """
    return f"data: {data}\n"


def _is_document_question(message: str) -> bool:
    msg = message.lower()
    return any(
        k in msg
        for k in (
            "document", "pdf", "file", "page", "pages",
            "according to", "from the document",
            "summarize", "summary",
            "table", "figure", "paragraph",
            "section", "chapter",
            "this file", "this pdf",
        )
    )

# =============================================================================
# NON-STREAMING FALLBACK
# =============================================================================

def chatpage_chat_handler(
    message: Any,
    context: Any = None,
    mode: Optional[str] = None,
    file_id: Optional[str] = None,
) -> str:
    clean = _normalize_message(message)
    if not clean:
        return "Please enter a valid message."

    try:
        if not file_id:
            return handle_home_message(clean)

        if _is_document_question(clean):
            return rag_answer(clean, file_id=file_id)

        return handle_home_message(clean)

    except Exception:
        logger.exception("[CHATPAGE] Non-streaming error")
        return "An internal error occurred."

# =============================================================================
# STREAMING HANDLER (FRONTEND-SAFE)
# =============================================================================

def chatpage_chat_stream_handler(
    message: Any,
    context: Any = None,
    mode: Optional[str] = None,
    file_id: Optional[str] = None,
):
    clean = _normalize_message(message)
    if not clean:
        yield "data: Please enter a valid message.\n"
        yield "data: [DONE]\n"
        return

    def should_flush(buf: str) -> bool:
        return buf.endswith((".", "?", "!", "\n"))

    try:
        # ---------------- NO DOCUMENT ----------------
        if not file_id:
            buffer = ""

            for token in handle_chat_stream(
                clean,
                context=context,
                mode=mode,
            ):
                if token.strip() == "[DONE]":
                    continue

                buffer += token

                if should_flush(buffer):
                    yield f"data: {buffer.strip()}\n"
                    buffer = ""

            if buffer.strip():
                yield f"data: {buffer.strip()}\n"

            yield "data: [DONE]\n"
            return

        # ---------------- DOCUMENT (RAG) ----------------
        if _is_document_question(clean):
            answer = rag_answer(clean, file_id=file_id)
            yield f"data: {answer}\n"
            yield "data: [DONE]\n"
            return

        # ---------------- CASUAL CHAT WITH DOC ----------------
        buffer = ""

        for token in handle_chat_stream(
            clean,
            context=context,
            mode=mode,
        ):
            if token.strip() == "[DONE]":
                continue

            buffer += token

            if should_flush(buffer):
                yield f"data: {buffer.strip()}\n"
                buffer = ""

        if buffer.strip():
            yield f"data: {buffer.strip()}\n"

        yield "data: [DONE]\n"

    except Exception:
        yield "data: An internal server error occurred.\n"
        yield "data: [DONE]\n"
