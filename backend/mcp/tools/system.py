# backend/mcp/tools/system.py

import os
from datetime import datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from mcp.server import mcp_server
from mcp.types import MCPToolSpec


# ------------------------------------------------------------------
# Handlers
# ------------------------------------------------------------------

def get_time(timezone: str = "Asia/Kolkata") -> dict:
    """
    Get current time in a specific timezone.

    This function is GUARANTEED not to raise.
    """

    try:
        tz = ZoneInfo(timezone)
    except ZoneInfoNotFoundError:
        tz = ZoneInfo("UTC")
    except Exception:
        tz = None

    now = datetime.now(tz) if tz else datetime.utcnow()

    return {
        "timezone": timezone if tz else "UTC",
        "time": now.strftime("%I:%M %p"),
        "date": now.strftime("%Y-%m-%d"),
        "iso": now.isoformat(),
    }


def get_env() -> dict:
    return {
        "environment": os.getenv("FLASK_ENV", "development"),
        "debug": os.getenv("DEBUG", "false"),
    }


def health_check() -> dict:
    return {
        "status": "ok",
        "layer": "mcp",
    }


# ------------------------------------------------------------------
# Registration
# ------------------------------------------------------------------

def register(server):
    server.register_tool(
        MCPToolSpec(
            name="system.time",
            description="Get current time for a given timezone",
            params={"timezone": "string"},
            handler=get_time,
        )
    )

    server.register_tool(
        MCPToolSpec(
            name="system.env",
            description="Get server environment information",
            params={},
            handler=get_env,
        )
    )

    server.register_tool(
        MCPToolSpec(
            name="system.health",
            description="Health check for MCP layer",
            params={},
            handler=health_check,
        )
    )
