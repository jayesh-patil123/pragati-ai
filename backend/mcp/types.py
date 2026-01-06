# backend/mcp/types.py

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Dict, Generator, Literal, Optional


# ------------------------------------------------------------------
# Tool Handler Types
# ------------------------------------------------------------------

ToolHandler = Callable[..., Any]
StreamToolHandler = Callable[..., Generator[str, None, None]]


# ------------------------------------------------------------------
# MCP Tool Definition
# ------------------------------------------------------------------

@dataclass(frozen=True)
class MCPToolSpec:
    name: str
    description: str
    params: Dict[str, str]

    handler: ToolHandler
    stream_handler: Optional[StreamToolHandler] = None


# ------------------------------------------------------------------
# MCP Routing Result
# ------------------------------------------------------------------

MCPResultType = Literal["tool", "llm", "hybrid"]


@dataclass
class MCPResult:
    """
    Result returned by MCP router.

    This object describes WHAT to do, not execution.
    """

    type: MCPResultType
    content: Dict[str, Any]

    stream: bool = False
    confidence: float = 1.0  # ← MUST exist on every instance
