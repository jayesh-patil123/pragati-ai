"""
Files API routes (AUTHORITATIVE, FINAL).

Responsibilities:
- Upload files from Files page or Chat page
- Persist UI metadata
- Ingest files directly into SINGLE-FILE RAG engine
- List, delete, and inspect files
- Expose FULL extracted document text (page-wise)
- Maintain strict file_id consistency across the system
"""

from __future__ import annotations

import os
import uuid
import logging

from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename

from .service import (
    save_file_metadata,
    get_all_files,
    delete_file,
    UPLOAD_DIR,
)

# Authoritative raw-text access (RAG owns extraction)
from RAG.rag_engine import get_raw_text

logger = logging.getLogger(__name__)

# ------------------------------------------------------------------
# Blueprint
# ------------------------------------------------------------------

files_bp = Blueprint("files", __name__, url_prefix="/api/files")

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------

def _get_user_id() -> str:
    """
    Resolve user_id.

    NOTE:
    - Single-user mode for now
    - Future-ready for auth integration
    """
    return "default"


# ------------------------------------------------------------------
# List files
# ------------------------------------------------------------------

@files_bp.route("", methods=["GET"])
def list_files():
    """
    Return all uploaded files visible to the user.
    """
    user_id = _get_user_id()
    files = get_all_files(user_id=user_id)
    return jsonify({"files": files}), 200


# ------------------------------------------------------------------
# Upload file (FilesPage + ChatPage)
# ------------------------------------------------------------------

@files_bp.route("/upload", methods=["POST"])
def upload_file():
    """
    Upload a file and ingest it into the SINGLE-FILE RAG engine.

    CRITICAL GUARANTEES:
    - file_id is generated ONCE
    - file_id is shared across:
        - metadata
        - raw extracted text
        - FAISS vectors
        - frontend APIs
    - No renaming, no temp files, no race conditions
    """

    # -----------------------------
    # Validate request
    # -----------------------------

    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if not file or not file.filename:
        return jsonify({"error": "Invalid file"}), 400

    filename = secure_filename(file.filename)
    if not filename:
        return jsonify({"error": "Invalid filename"}), 400

    user_id = _get_user_id()

    # -----------------------------
    # Generate SINGLE file_id
    # -----------------------------

    file_id = str(uuid.uuid4())

    final_path = os.path.join(
        UPLOAD_DIR,
        f"{file_id}_{filename}",
    )

    # -----------------------------
    # Save file to disk (ONCE)
    # -----------------------------

    try:
        file.save(final_path)
    except Exception:
        logger.exception("[FILES] Failed to write file to disk")
        return jsonify({"error": "Failed to save file"}), 500

    # -----------------------------
    # Save metadata + ingest RAG
    # -----------------------------

    try:
        record = save_file_metadata(
            file_id=file_id,                     # AUTHORITATIVE ID
            filename=filename,
            mimetype=file.mimetype or "application/octet-stream",
            file_path=final_path,
            user_id=user_id,
        )

        logger.info(
            "[FILES] Upload + ingestion successful | file=%s user=%s",
            file_id,
            user_id,
        )

        return jsonify(
            {
                "success": True,
                "file": record,
            }
        ), 201

    except Exception as exc:
        logger.exception("[FILES] Metadata save or RAG ingestion failed")

        # Cleanup partially written file
        try:
            if os.path.exists(final_path):
                os.remove(final_path)
        except Exception:
            pass

        return jsonify(
            {
                "error": "Upload failed",
                "details": str(exc),
            }
        ), 500


# ------------------------------------------------------------------
# Get FULL extracted text (PAGE-WISE, AUTHORITATIVE)
# ------------------------------------------------------------------

@files_bp.route("/<file_id>/text", methods=["GET"])
def get_file_text(file_id: str):
    """
    Return FULL extracted text from the document.

    IMPORTANT:
    - Deterministic (no LLM)
    - Page-wise text
    - Backed by persisted raw extraction
    - Used by FilesPage preview
    """

    pages = get_raw_text(file_id)

    if not pages:
        return jsonify(
            {
                "error": "No extracted text found for this file",
                "file_id": file_id,
            }
        ), 404

    return jsonify(
        {
            "file_id": file_id,
            "page_count": len(pages),
            "pages": pages,
        }
    ), 200


# ------------------------------------------------------------------
# Delete file metadata
# ------------------------------------------------------------------

@files_bp.route("/<file_id>", methods=["DELETE"])
def remove_file(file_id: str):
    """
    Delete file metadata.

    NOTE:
    - Does NOT yet remove vectors from FAISS
    - Acceptable for current architecture
    """

    deleted = delete_file(file_id)

    if not deleted:
        return jsonify({"error": "File not found"}), 404

    logger.info("[FILES] File metadata deleted | file=%s", file_id)
    return jsonify({"success": True}), 200
