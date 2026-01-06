# backend/mcp/server.py

from typing import Dict, Generator, Any

from mcp.types import MCPToolSpec


class MCPServer:
    """
    Central MCP tool registry and execution engine.
    """

    def __init__(self) -> None:
        self._tools: Dict[str, MCPToolSpec] = {}

    # --------------------------------------------------
    # Compatibility helper (used by MCP client)
    # --------------------------------------------------

    def get_tool(self, name: str):
        """
        Return tool spec without executing it.
        """
        if name not in self._tools:
            raise RuntimeError(f"MCP tool not found: {name}")

        return self._tools[name]


    # --------------------------------------------------
    # Registration
    # --------------------------------------------------

    def register_tool(self, spec: MCPToolSpec) -> None:
        if spec.name in self._tools:
            raise ValueError(f"MCP tool already registered: {spec.name}")

        self._tools[spec.name] = spec

    # --------------------------------------------------
    # Discovery
    # --------------------------------------------------

    def list_tools(self):
        return [
            {
                "name": spec.name,
                "description": spec.description,
                "params": spec.params,
            }
            for spec in self._tools.values()
        ]

    # --------------------------------------------------
    # Execution
    # --------------------------------------------------

    def call_tool(self, name: str, params: Dict[str, Any]) -> Any:
        if name not in self._tools:
            raise RuntimeError(f"MCP tool not found: {name}")

        tool = self._tools[name]
        return tool.handler(**params)

    def stream_tool(self, name: str, params: Dict[str, Any]) -> Generator[str, None, None]:
        if name not in self._tools:
            raise RuntimeError(f"MCP tool not found: {name}")

        tool = self._tools[name]

        if not tool.stream_handler:
            raise RuntimeError(f"MCP tool does not support streaming: {name}")

        return tool.stream_handler(**params)


# --------------------------------------------------
# SINGLETON INSTANCE (ONLY ONE)
# --------------------------------------------------

mcp_server = MCPServer()


# --------------------------------------------------
# TOOL REGISTRATION (IMPORT SIDE-EFFECT SAFE)
# --------------------------------------------------

from mcp.tools import system, search, memory  # noqa: E402,F401

system.register(mcp_server)
search.register(mcp_server)
memory.register(mcp_server)
