"""
MCP Service Layer (Enterprise Grade)

Responsibilities:
- Central intelligence router (MCP)
- Tool execution (sync + streaming)
- Home chat (non-streaming)
- Chat page streaming (SSE-safe)
- AI Tutor (non-streaming)

Design guarantees:
- Deterministic routing
- Clean context handling
- No SSE protocol violations
- Prompt logic delegated to prompt builder
"""

from __future__ import annotations

from typing import Generator, List, Dict, Any, Optional

from mcp.router import mcp_router
from mcp.client import mcp_client
from mcp.types import MCPResult

from components.llm.llm_client import (
    chat_completion,
    chat_completion_stream,
)

from components.chat.prompts import (
    build_messages,
    build_generation_config,
)

from components.chat.context_utils import (
    trim_context,
    summarize_context,
)

# ==============================================================================
# Context helpers
# ==============================================================================

def _extract_user_profile(
    context: Optional[List[Dict[str, Any]]],
) -> Dict[str, Any]:
    """
    Extract user profile from context if present.

    Expected shape:
    {
        "role": "system",
        "user": {...}
    }
    """
    if not context:
        return {}

    for item in context:
        if (
            isinstance(item, dict)
            and item.get("role") == "system"
            and isinstance(item.get("user"), dict)
        ):
            return item["user"]

    return {}


def _sanitize_context(
    context: Optional[List[Dict[str, Any]]],
) -> List[Dict[str, Any]]:
    """
    Normalize, trim, and summarize context safely.
    """
    if not context:
        return []

    trimmed = trim_context(context)
    summarized = summarize_context(trimmed)

    safe: List[Dict[str, Any]] = []
    for msg in summarized:
        if (
            isinstance(msg, dict)
            and msg.get("role") in {"user", "assistant"}
            and "content" in msg
        ):
            safe.append(
                {
                    "role": msg["role"],
                    "content": str(msg["content"]),
                }
            )

    return safe


# ==============================================================================
# MCP tool execution (non-streaming)
# ==============================================================================

def call_mcp_tool(tool: str, params: Dict[str, Any]) -> Any:
    """
    Execute a non-streaming MCP tool.
    """
    return mcp_client.call_tool(tool, params)


# ==============================================================================
# MCP tool execution (streaming)
# ==============================================================================

def stream_mcp_tool(
    tool: str,
    params: Dict[str, Any],
) -> Generator[str, None, None]:
    """
    Execute a streaming MCP tool.
    Falls back to non-streaming if unsupported.
    """
    try:
        yield from mcp_client.stream_tool(tool, params)
    except RuntimeError:
        result = mcp_client.call_tool(tool, params)
        for token in str(result).split():
            yield f"{token} "


# ==============================================================================
# AI Tutor — Non-streaming
# ==============================================================================

def handle_ai_tutor(
    question: str,
    mode: str = "tutor",
) -> Dict[str, str]:
    """
    AI Tutor handler (non-streaming).
    """

    if not question or not question.strip():
        return {"answer": "Please ask a question."}

    system_prompt_map = {
        "tutor": "You are an expert AI tutor. Explain clearly and step by step.",
        "learn": "You are a teaching assistant. Start from fundamentals.",
        "review": "You are helping revise. Summarize key ideas concisely.",
        "practice": "You are a practice coach. Ask guiding questions.",
    }

    system_prompt = system_prompt_map.get(
        mode,
        system_prompt_map["tutor"],
    )

    answer = chat_completion(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question},
        ]
    )

    return {"answer": str(answer)}


# ==============================================================================
# Home Page — Non-streaming
# ==============================================================================

def handle_home_message(message: str) -> str:
    """
    Home page chat handler.

    Characteristics:
    - Stateless
    - Non-streaming
    - MCP-first
    - LLM fallback
    """

    if not message or not message.strip():
        return "Please enter a message."

    result: MCPResult = mcp_router.route(
        message,
        context=[],
    )

    # Low confidence → clarification
    if result.confidence < 0.6:
        return chat_completion(
            messages=[
                {
                    "role": "user",
                    "content": "I want to be accurate. Could you clarify your request?",
                }
            ]
        )

    # Tool only
    if result.type == "tool":
        output = call_mcp_tool(
            tool=result.content["tool"],
            params=result.content["params"],
        )
        return str(output)

    # Hybrid
    if result.type == "hybrid":
        tool_output = call_mcp_tool(
            tool=result.content["tool"],
            params=result.content["params"],
        )

        prompt = result.content["prompt"].format(
            tool_output=tool_output
        )

        return chat_completion(
            messages=[{"role": "user", "content": prompt}]
        )

    # LLM only
    return chat_completion(
        messages=[{"role": "user", "content": message}]
    )


# ==============================================================================
# Internal — LLM streaming (SSE-safe)
# ==============================================================================

def _stream_llm(
    *,
    message: str,
    context: List[Dict[str, Any]],
    mode: Optional[str],
    model: Optional[str],
    has_documents: bool,
) -> Generator[str, None, None]:
    """
    Stream LLM tokens using the enterprise prompt builder.
    """

    safe_context = _sanitize_context(context)

    messages = build_messages(
        user_message=message,
        mode=mode,
        context=safe_context,
        has_documents=has_documents,
        model_name=model,
    )

    gen_cfg = build_generation_config(
        context=safe_context,
        mode=mode,
        model_name=model,
    )

    for token in chat_completion_stream(
        messages=messages,
        temperature=gen_cfg["temperature"],
        max_tokens=gen_cfg["max_tokens"],
    ):
        yield token


# ==============================================================================
# Chat Page — Streaming Entry Point
# ==============================================================================

def handle_chat_stream(
    message: str,
    context: Optional[List[Dict[str, Any]]] = None,
    mode: Optional[str] = None,
    model: Optional[str] = None,
    has_documents: bool = False,
) -> Generator[str, None, None]:
    """
    Streaming chat handler for Chat Page.

    Guarantees:
    - No [DONE] token leaks
    - No SSE framing violations
    - Deterministic routing
    """

    if not message or not message.strip():
        yield "Please enter a message."
        return

    safe_context = _sanitize_context(context)

    result: MCPResult = mcp_router.route(
        message,
        context=safe_context,
    )

    # Low confidence → clarification
    if result.confidence < 0.6:
        yield from _stream_llm(
            message="I want to be accurate. Could you clarify your request?",
            context=safe_context,
            mode=mode,
            model=model,
            has_documents=has_documents,
        )
        return

    # Tool only
    if result.type == "tool":
        if result.stream:
            yield from stream_mcp_tool(
                tool=result.content["tool"],
                params=result.content["params"],
            )
            return

        output = call_mcp_tool(
            tool=result.content["tool"],
            params=result.content["params"],
        )

        for token in str(output).split():
            yield f"{token} "
        return

    # Hybrid
    if result.type == "hybrid":
        tool_output = call_mcp_tool(
            tool=result.content["tool"],
            params=result.content["params"],
        )

        prompt = result.content["prompt"].format(
            tool_output=tool_output
        )

        yield from _stream_llm(
            message=prompt,
            context=safe_context,
            mode=mode,
            model=model,
            has_documents=has_documents,
        )
        return

    # LLM only
    yield from _stream_llm(
        message=message,
        context=safe_context,
        mode=mode,
        model=model,
        has_documents=has_documents,
    )
