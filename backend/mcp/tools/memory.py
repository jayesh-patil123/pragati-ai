# backend/mcp/tools/memory.py

from typing import Dict, List

from mcp.types import MCPToolSpec


# ------------------------------------------------------------------
# In-Memory Store (Phase 1)
# ------------------------------------------------------------------
# NOTE:
# This is intentionally simple and in-memory.
# You can later replace this with:
# - FAISS
# - Vector DB
# - SQL / Redis
# without changing MCP contracts.
# ------------------------------------------------------------------

_MEMORY_STORE: Dict[str, List[str]] = {}


# ------------------------------------------------------------------
# Handlers
# ------------------------------------------------------------------

def store_memory(user_id: str, text: str) -> str:
    """
    Store a piece of memory for a user.
    """
    if not user_id:
        return "User ID is required to store memory."

    _MEMORY_STORE.setdefault(user_id, []).append(text)
    return "Memory stored successfully."


def retrieve_memory(user_id: str) -> str:
    """
    Retrieve stored memory for a user.
    """
    if not user_id:
        return "User ID is required to retrieve memory."

    memories = _MEMORY_STORE.get(user_id, [])

    if not memories:
        return "No memory found."

    return "\n".join(memories)


# ------------------------------------------------------------------
# REGISTRATION ENTRYPOINT (REQUIRED)
# ------------------------------------------------------------------

def register(server):
    """
    Register memory-related MCP tools.
    """

    server.register_tool(
        MCPToolSpec(
            name="memory.store",
            description="Store a memory snippet for a user",
            params={
                "user_id": "string",
                "text": "string",
            },
            handler=store_memory,
        )
    )

    server.register_tool(
        MCPToolSpec(
            name="memory.retrieve",
            description="Retrieve stored memory for a user",
            params={
                "user_id": "string",
            },
            handler=retrieve_memory,
        )
    )
