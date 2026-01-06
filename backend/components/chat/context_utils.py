"""
Chat context utilities.

Features:
- Safe trimming
- Automatic summarization fallback
- Deterministic behavior
"""

from __future__ import annotations
from typing import List, Any, Dict


def _is_valid_message(msg: Any) -> bool:
    if not msg:
        return False
    if isinstance(msg, dict):
        return bool(str(msg.get("content", "")).strip())
    return bool(str(msg).strip())


def trim_context(
    context: Any,
    max_messages: int = 10,
) -> List[Dict[str, str]]:
    if not context or not isinstance(context, list):
        return []

    valid = [m for m in context if _is_valid_message(m)]
    return valid[-max_messages:]


def summarize_context(context: List[Dict[str, str]]) -> List[Dict[str, str]]:
    """
    Lightweight summarization fallback.
    Used ONLY when context grows too large.
    """

    if len(context) < 8:
        return context

    summary = []
    for msg in context[-6:]:
        summary.append({
            "role": msg.get("role", "assistant"),
            "content": msg.get("content", "")[:300],
        })

    return summary
