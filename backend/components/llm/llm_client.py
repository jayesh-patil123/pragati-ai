# components/llm/llm_client.py
#
# OpenRouter LLM client
# - Non-streaming + streaming support
# - Environment variables read at CALL TIME (not import time)
# - Safe for Flask reloads, Docker, Gunicorn, tests
#

from __future__ import annotations

import os
import json
from typing import Generator, List, Dict, Any, Optional

import requests


# ==============================================================================
# Static Headers (safe at import time)
# ==============================================================================

DEFAULT_HEADERS: Dict[str, str] = {
    "Content-Type": "application/json",
    "HTTP-Referer": "http://localhost:5000",
    "X-Title": "Pragati AI",
}


# ==============================================================================
# Environment Accessors (CRITICAL: read at call time)
# ==============================================================================

def _get_openrouter_api_key() -> str:
    """
    Fetch OpenRouter API key at runtime.
    This avoids Flask import-order and reload issues.
    """
    key = os.getenv("OPENROUTER_API_KEY")
    if not key:
        raise RuntimeError("OPENROUTER_API_KEY is missing or not set")
    return key


def _get_base_url() -> str:
    """
    Fetch OpenRouter base URL.
    """
    return os.getenv(
        "OPENROUTER_BASE_URL",
        "https://openrouter.ai/api/v1/chat/completions",
    )


def _get_default_model() -> str:
    """
    Fetch default LLM model.
    """
    return os.getenv(
        "DEFAULT_MODEL",
        "openai/gpt-4o-mini",
    )


def _build_headers() -> Dict[str, str]:
    """
    Build request headers with runtime API key.
    """
    return {
        **DEFAULT_HEADERS,
        "Authorization": f"Bearer {_get_openrouter_api_key()}",
    }


# ==============================================================================
# NON-STREAMING COMPLETION
# ==============================================================================

def chat_completion(
    messages: List[Dict[str, Any]],
    model: Optional[str] = None,
    temperature: float = 0.5,
    max_tokens: int = 800,
) -> str:
    """
    Perform a non-streaming chat completion request.

    Args:
        messages: OpenAI-style messages list
        model: Optional override model
        temperature: Sampling temperature
        max_tokens: Token limit

    Returns:
        Full assistant response text
    """

    payload: Dict[str, Any] = {
        "model": model or _get_default_model(),
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    try:
        response = requests.post(
            _get_base_url(),
            json=payload,
            headers=_build_headers(),
            timeout=60,
        )
        response.raise_for_status()

        data = response.json()
        return data["choices"][0]["message"]["content"]

    except requests.exceptions.RequestException as exc:
        raise RuntimeError(f"OpenRouter request failed: {exc}") from exc

    except (KeyError, IndexError, ValueError) as exc:
        raise RuntimeError(
            f"Invalid OpenRouter response format: {response.text}"
        ) from exc


# ==============================================================================
# STREAMING COMPLETION (SSE-compatible)
# ==============================================================================

def chat_completion_stream(
    messages: List[Dict[str, Any]],
    model: Optional[str] = None,
    temperature: float = 0.5,
    max_tokens: int = 800,
) -> Generator[str, None, None]:
    """
    Perform a streaming chat completion request.

    Yields:
        Incremental text tokens
    """

    payload: Dict[str, Any] = {
        "model": model or _get_default_model(),
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": True,
    }

    try:
        with requests.post(
            _get_base_url(),
            json=payload,
            headers=_build_headers(),
            stream=True,
            timeout=60,
        ) as response:

            response.raise_for_status()

            for raw_line in response.iter_lines(decode_unicode=True):
                if not raw_line:
                    continue

                # Expected SSE format: "data: {...}"
                if not raw_line.startswith("data:"):
                    continue

                data = raw_line.removeprefix("data:").strip()

                if data == "[DONE]":
                    break

                try:
                    chunk = json.loads(data)
                    delta = chunk["choices"][0].get("delta", {})
                    content = delta.get("content")

                    if content:
                        yield content

                except (json.JSONDecodeError, KeyError, IndexError):
                    # Ignore malformed chunks to keep stream alive
                    continue

    except requests.exceptions.RequestException as exc:
        raise RuntimeError(f"OpenRouter streaming failed: {exc}") from exc
