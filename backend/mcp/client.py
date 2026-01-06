# backend/mcp/client.py

from typing import Any, Dict, Generator

from mcp.server import mcp_server
from mcp.types import MCPToolSpec


class MCPClient:
    """
    Stateless MCP execution client.

    Responsibilities:
    - Execute registered MCP tools
    - Execute streaming tools
    - Provide a clean, uniform interface
    """

    # ---------------------------------------------------------------------
    # Tool Discovery
    # ---------------------------------------------------------------------

    def list_tools(self) -> list[dict]:
        """
        Return metadata for all registered tools.
        """
        return mcp_server.list_tools()

    # ---------------------------------------------------------------------
    # Tool Execution (Non-Streaming)
    # ---------------------------------------------------------------------

    def call_tool(self, name: str, params: Dict[str, Any]) -> Any:
        tool = mcp_server.get_tool(name)

        try:
            return tool.handler(**(params or {}))
        except TypeError as exc:
            # 🔍 EXPLICIT PARAM ERROR (this is your case)
            raise RuntimeError(
                f"MCP tool '{name}' called with invalid params: {params}"
            ) from exc
        except Exception as exc:
            raise RuntimeError(
                f"MCP tool '{name}' execution failed"
            ) from exc

    # ---------------------------------------------------------------------
    # Tool Execution (Streaming)
    # ---------------------------------------------------------------------

    def stream_tool(
        self,
        tool_name: str,
        params: Dict[str, Any],
    ) -> Generator[str, None, None]:
        """
        Execute a streaming MCP tool.

        If the tool does not support streaming, this method raises.
        """

        tool: MCPToolSpec = mcp_server.get_tool(tool_name)

        if not tool.stream_handler:
            raise RuntimeError(
                f"MCP tool does not support streaming: {tool_name}"
            )

        try:
            yield from tool.stream_handler(**params)
        except Exception as exc:
            raise RuntimeError(
                f"MCP streaming tool execution failed: {tool_name}"
            ) from exc


# -------------------------------------------------------------------------
# Singleton Client Instance
# -------------------------------------------------------------------------

mcp_client = MCPClient()
