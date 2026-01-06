# backend/mcp/tools/search.py

import os
import requests

from mcp.types import MCPToolSpec


OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")


# ------------------------------------------------------------------
# Handlers
# ------------------------------------------------------------------

def get_weather(city: str) -> str:
    """
    Get current weather for a city using OpenWeather API.
    """
    if not OPENWEATHER_API_KEY:
        return "Weather service is not configured."

    response = requests.get(
        "https://api.openweathermap.org/data/2.5/weather",
        params={
            "q": city,
            "appid": OPENWEATHER_API_KEY,
            "units": "metric",
        },
        timeout=10,
    )

    if response.status_code != 200:
        return f"Unable to fetch weather for {city}."

    data = response.json()
    temp = data["main"]["temp"]
    description = data["weather"][0]["description"]

    return (
        f"Weather in {city.title()}: {description}, {temp}°C. "
        "Temperatures may vary slightly across apps due to different sensors."
    )


def get_air_quality(city: str) -> str:
    """
    Get real-time air quality (AQI) using OpenWeather Air Pollution API.
    """
    if not OPENWEATHER_API_KEY:
        return "Air quality service is not configured."

    # Step 1: Get city coordinates
    geo_resp = requests.get(
        "https://api.openweathermap.org/geo/1.0/direct",
        params={"q": city, "limit": 1, "appid": OPENWEATHER_API_KEY},
        timeout=10,
    )

    if geo_resp.status_code != 200 or not geo_resp.json():
        return f"Unable to determine location for {city}."

    location = geo_resp.json()[0]
    lat, lon = location["lat"], location["lon"]

    # Step 2: Get AQI
    aqi_resp = requests.get(
        "https://api.openweathermap.org/data/2.5/air_pollution",
        params={"lat": lat, "lon": lon, "appid": OPENWEATHER_API_KEY},
        timeout=10,
    )

    if aqi_resp.status_code != 200:
        return "Unable to fetch air quality data."

    data = aqi_resp.json()["list"][0]
    aqi = data["main"]["aqi"]

    aqi_map = {
        1: "Good 🟢",
        2: "Fair 🟡",
        3: "Moderate 🟠",
        4: "Poor 🔴",
        5: "Very Poor 🟣",
    }

    return f"Air quality in {city.title()}: {aqi_map.get(aqi, 'Unknown')} (AQI {aqi})"


# ------------------------------------------------------------------
# REGISTRATION ENTRYPOINT (REQUIRED)
# ------------------------------------------------------------------

def register(server):
    """
    Register search-related MCP tools.
    """

    server.register_tool(
        MCPToolSpec(
            name="search.weather",
            description="Get current weather for a city",
            params={"city": "string"},
            handler=get_weather,
        )
    )

    server.register_tool(
        MCPToolSpec(
            name="search.air_quality",
            description="Get real-time air quality index (AQI) for a city",
            params={"city": "string"},
            handler=get_air_quality,
        )
    )
