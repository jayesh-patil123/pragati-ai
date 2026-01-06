# backend/components/Learning/GitHub_Projects/notes_flash.py

import json
import os
from flask import Blueprint, jsonify, request
from uuid import uuid4

notes_flash_bp = Blueprint(
    "notes_flash",
    __name__,
    url_prefix="/notes"
)

DATA_FILE = os.path.join(
    os.path.dirname(__file__),
    "data",
    "notes_flash.json"
)


def load_notes():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_notes(notes):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(notes, f, indent=2)


@notes_flash_bp.route("", methods=["GET"])
def get_notes():
    """
    GET /api/v1/learning/github-projects/notes
    """
    return jsonify(load_notes())


@notes_flash_bp.route("", methods=["POST"])
def create_note():
    data = request.json or {}

    note = {
        "id": str(uuid4()),
        "title": data.get("title", "Untitled"),
        "body": data.get("body", ""),
    }

    notes = load_notes()
    notes.insert(0, note)
    save_notes(notes)

    return jsonify(note), 201


@notes_flash_bp.route("/<note_id>", methods=["PUT"])
def update_note(note_id):
    data = request.json or {}
    notes = load_notes()

    for note in notes:
        if note["id"] == note_id:
            note["title"] = data.get("title", note["title"])
            note["body"] = data.get("body", note.get("body", ""))
            save_notes(notes)
            return jsonify(note)

    return {"error": "Note not found"}, 404


@notes_flash_bp.route("/<note_id>", methods=["DELETE"])
def delete_note(note_id):
    notes = load_notes()
    updated = [n for n in notes if n["id"] != note_id]

    if len(updated) == len(notes):
        return {"error": "Note not found"}, 404

    save_notes(updated)
    return {"status": "deleted"}
