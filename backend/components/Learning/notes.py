from flask import Blueprint, request, jsonify, make_response
from uuid import uuid4
from datetime import datetime
from typing import Dict, Any

# --------------------------------------------------
# Blueprint
# --------------------------------------------------

learning_notes_bp = Blueprint(
    "learning_notes",
    __name__,
    url_prefix="/notes"
)

# --------------------------------------------------
# In-Memory Store (replace with DB later)
# --------------------------------------------------

NOTES_STORE: Dict[str, Dict[str, Any]] = {}

# --------------------------------------------------
# Utilities
# --------------------------------------------------

def now() -> str:
    return datetime.utcnow().isoformat()

def corsify(response):
    """
    Explicit CORS handling to avoid OPTIONS / 308 issues
    """
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response

# --------------------------------------------------
# Preflight (OPTIONS)
# --------------------------------------------------

@learning_notes_bp.route("", methods=["OPTIONS"], strict_slashes=False)
@learning_notes_bp.route("/", methods=["OPTIONS"], strict_slashes=False)
def notes_preflight():
    return corsify(make_response("", 204))

# --------------------------------------------------
# List Notes
# --------------------------------------------------

@learning_notes_bp.route("", methods=["GET"], strict_slashes=False)
@learning_notes_bp.route("/", methods=["GET"], strict_slashes=False)
def list_notes():
    response = jsonify(
        sorted(
            NOTES_STORE.values(),
            key=lambda n: n["updated_at"],
            reverse=True
        )
    )
    return corsify(response)

# --------------------------------------------------
# Create Note
# --------------------------------------------------

@learning_notes_bp.route("", methods=["POST"], strict_slashes=False)
@learning_notes_bp.route("/", methods=["POST"], strict_slashes=False)
def create_note():
    if not request.is_json:
        return corsify(jsonify({"error": "JSON body required"})), 400

    data = request.get_json(force=True)

    note_id = str(uuid4())
    note = {
        "id": note_id,
        "title": data.get("title", "Untitled"),
        "content": data.get("content", ""),
        "starred": bool(data.get("starred", False)),
        "tags": data.get("tags", []),
        "created_at": now(),
        "updated_at": now(),
    }

    NOTES_STORE[note_id] = note
    return corsify(jsonify(note)), 201

# --------------------------------------------------
# Update Note
# --------------------------------------------------

@learning_notes_bp.route("/<note_id>", methods=["PUT"], strict_slashes=False)
def update_note(note_id: str):
    if note_id not in NOTES_STORE:
        return corsify(jsonify({"error": "Note not found"})), 404

    if not request.is_json:
        return corsify(jsonify({"error": "JSON body required"})), 400

    data = request.get_json(force=True)

    note = NOTES_STORE[note_id]
    note.update({
        "title": data.get("title", note["title"]),
        "content": data.get("content", note["content"]),
        "starred": bool(data.get("starred", note["starred"])),
        "tags": data.get("tags", note["tags"]),
        "updated_at": now(),
    })

    return corsify(jsonify(note))

# --------------------------------------------------
# Delete Note
# --------------------------------------------------

@learning_notes_bp.route("/<note_id>", methods=["DELETE"], strict_slashes=False)
def delete_note(note_id: str):
    if note_id not in NOTES_STORE:
        return corsify(jsonify({"error": "Note not found"})), 404

    NOTES_STORE.pop(note_id)
    return corsify(jsonify({"status": "deleted"})), 200
