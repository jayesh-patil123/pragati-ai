# backend/components/Learning/GitHub_Projects/repos.py

import json
import os
import re
from flask import Blueprint, jsonify, request

github_repos_bp = Blueprint(
    "github_repos",
    __name__,
    url_prefix="/repos"
)

DATA_FILE = os.path.join(
    os.path.dirname(__file__),
    "data",
    "repos.json"
)

# -------------------------------------------------------------------
# Utilities
# -------------------------------------------------------------------

def load_repos():
    """
    Always read repos.json from disk.
    Restart Flask after editing repos.json.
    """
    if not os.path.exists(DATA_FILE):
        print("repos.json not found:", DATA_FILE)
        return []

    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print("Error loading repos.json:", e)
        return []

    if not isinstance(data, list):
        print("repos.json must be a LIST")
        return []

    return data


def parse_stars(value: str) -> int:
    """
    Convert:
      "400k+", "180k", "1.2M+" → integer
    """
    if not value:
        return 0

    s = str(value).lower().replace("+", "").strip()
    match = re.match(r"([\d\.]+)\s*([km]?)", s)

    if not match:
        return 0

    num, suffix = match.groups()
    num = float(num)

    if suffix == "m":
        return int(num * 1_000_000)
    if suffix == "k":
        return int(num * 1_000)

    return int(num)


def enrich_repo(repo: dict) -> dict:
    """
    Normalize repo data while keeping original JSON intact.
    """
    return {
        "id": repo.get("id"),
        "name": repo.get("name", ""),
        "url": repo.get("url", ""),
        "stars": repo.get("stars", "0"),
        "description": repo.get("description", ""),
        "category": repo.get("category", "General"),
        "tags": repo.get("tags", []),
        "_stars": parse_stars(repo.get("stars")),
    }


def strip_internal_fields(repos: list) -> list:
    """
    Remove internal computed fields before sending to frontend.
    """
    return [
        {k: v for k, v in r.items() if not k.startswith("_")}
        for r in repos
    ]

# -------------------------------------------------------------------
# Routes
# -------------------------------------------------------------------

@github_repos_bp.route("", methods=["GET"])
def get_repos():
    """
    GET /api/v1/learning/github-projects/repos

    Query params:
      q          - search (name, description, category, tags)
      category   - category filter
      tag        - single tag filter
      min_stars  - minimum stars (e.g. 50000)
      page       - page number
      limit      - items per page (max 100)
      top        - top N repos by stars
    """

    repos = [enrich_repo(r) for r in load_repos()]

    q = request.args.get("q", "").lower().strip()
    category = request.args.get("category", "").lower().strip()
    tag = request.args.get("tag", "").lower().strip()
    min_stars = int(request.args.get("min_stars", 0))
    page = max(int(request.args.get("page", 1)), 1)
    limit = min(int(request.args.get("limit", 20)), 100)
    top = request.args.get("top")

    # ------------------------------
    # Filtering
    # ------------------------------

    if q:
        repos = [
            r for r in repos
            if q in r["name"].lower()
            or q in r["description"].lower()
            or q in r["category"].lower()
            or any(q in t.lower() for t in r["tags"])
        ]

    if category:
        repos = [
            r for r in repos
            if r["category"].lower() == category
        ]

    if tag:
        repos = [
            r for r in repos
            if any(tag == t.lower() for t in r["tags"])
        ]

    if min_stars:
        repos = [
            r for r in repos
            if r["_stars"] >= min_stars
        ]

    # ------------------------------
    # Sort by stars DESC
    # ------------------------------

    repos.sort(key=lambda r: r["_stars"], reverse=True)

    # ------------------------------
    # Top N
    # ------------------------------

    if top:
        try:
            n = int(top)
        except ValueError:
            n = 20

        selected = repos[:n]
        return jsonify({
            "total": len(selected),
            "repos": strip_internal_fields(selected)
        })

    # ------------------------------
    # Pagination
    # ------------------------------

    total = len(repos)
    start = (page - 1) * limit
    end = start + limit

    return jsonify({
        "page": page,
        "limit": limit,
        "total": total,
        "pages": (total + limit - 1) // limit,
        "repos": strip_internal_fields(repos[start:end]),
    })


@github_repos_bp.route("/categories", methods=["GET"])
def get_categories():
    repos = load_repos()
    categories = sorted({r.get("category", "General") for r in repos})
    return jsonify(categories)


@github_repos_bp.route("/tags", methods=["GET"])
def get_tags():
    repos = load_repos()
    tags = sorted({t for r in repos for t in r.get("tags", [])})
    return jsonify(tags)
