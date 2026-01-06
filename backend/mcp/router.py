# backend/mcp/router.py

from typing import List, Optional, Dict, Any

from mcp.types import MCPResult


class MCPRouter:
    """
    MCP intent router.

    Responsibilities:
    - Detect user intent
    - Decide tool vs LLM vs hybrid
    - Ask clarifying questions instead of guessing
    - Attach confidence for safe downstream execution
    """

    # ---------------------------------------------------------
    # Internal helpers
    # ---------------------------------------------------------

    def _extract_user_context(
        self,
        context: Optional[List[Dict[str, Any]]],
    ) -> Dict[str, str]:
        """
        Safely extract user metadata from context.

        Context is a list of chat messages, NOT a dict.
        User info may or may not exist.
        """
        user = {}

        if not context:
            return user

        for item in context:
            if isinstance(item, dict) and item.get("role") == "system":
                user = item.get("user", {}) or {}
                break

        return user

    # ---------------------------------------------------------
    # Routing
    # ---------------------------------------------------------

    def route(
        self,
        message: str,
        context: Optional[List[dict]] = None,
    ) -> MCPResult:
        text = message.lower().strip()

        user = self._extract_user_context(context)

        user_city = user.get("city", "pune")
        user_timezone = user.get("timezone", "Asia/Kolkata")

        # =====================================================
        # 1️⃣ CLARIFICATION (HIGHEST PRIORITY)
        # =====================================================

        if "time" in text and any(k in text for k in ["where", "which", "timezone"]):
            return MCPResult(
                type="llm",
                content={
                    "message": "Which location or timezone should I use to tell the time?"
                },
                stream=True,
                confidence=0.9,
            )

        if "weather" in text and any(k in text for k in ["where", "which city"]):
            return MCPResult(
                type="llm",
                content={
                    "message": "Which city would you like the weather for?"
                },
                stream=True,
                confidence=0.9,
            )

        if ("air quality" in text or "aqi" in text) and any(
            k in text for k in ["where", "which city"]
        ):
            return MCPResult(
                type="llm",
                content={
                    "message": "Which city should I check the air quality for?"
                },
                stream=True,
                confidence=0.9,
            )

        # =====================================================
        # 2️⃣ AIR QUALITY (REAL MCP TOOL)
        # =====================================================

        if "air quality" in text or "aqi" in text:
            return MCPResult(
                type="tool",
                content={
                    "tool": "search.air_quality",
                    "params": {"city": user_city},
                },
                stream=False,
                confidence=0.95,
            )

        # =====================================================
        # 3️⃣ TIME (TIMEZONE-SAFE)
        # =====================================================

        if "time" in text:
            timezone = user_timezone

            if "utc" in text:
                timezone = "UTC"
            elif any(k in text for k in ["india", "ist", "my"]):
                timezone = user_timezone

            return MCPResult(
                type="tool",
                content={
                    "tool": "system.time",
                    "params": {"timezone": timezone},
                },
                stream=False,
                confidence=0.95,
            )

        # =====================================================
        # 4️⃣ HYBRID: WEATHER → LLM REASONING
        # =====================================================

        if "weather" in text and any(
            k in text for k in ["explain", "analysis", "should i", "advice"]
        ):
            return MCPResult(
                type="hybrid",
                content={
                    "tool": "search.weather",
                    "params": {"city": user_city},
                    "prompt": (
                        "Using the following weather data, explain it clearly "
                        "and give practical advice:\n\n{tool_output}"
                    ),
                },
                stream=True,
                confidence=0.85,
            )

        # =====================================================
        # 5️⃣ WEATHER (DIRECT TOOL)
        # =====================================================

        if "weather" in text or "temperature" in text:
            return MCPResult(
                type="tool",
                content={
                    "tool": "search.weather",
                    "params": {"city": user_city},
                },
                stream=True,
                confidence=0.95,
            )

        # =====================================================
        # 6️⃣ DEFAULT: LLM FALLBACK
        # =====================================================

        return MCPResult(
            type="llm",
            content={
                "message": message,
                "context": context or [],
            },
            stream=True,
            confidence=0.7,
        )


# Singleton router instance
mcp_router = MCPRouter()
