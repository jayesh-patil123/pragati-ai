"""
File metadata store (UI-level) + RAG ingestion bridge (ENTERPRISE).

Responsibilities:
- Track uploaded files for Files page
- Persist upload metadata
- Ingest files into the RAG engine
- Keep Files page and Chat page in sync

CRITICAL GUARANTEES:
- EXACTLY ONE file_id per document
- file_id is the source of truth across:
  - metadata
  - filename
  - RAG ingestion
  - raw_text storage
  - FAISS indexing
  - API responses

Violating this rule causes 404s and data corruption.
"""

from __future__ import annotations

import os
import uuid
import logging
from datetime import datetime
from typing import Dict, List, Optional

# --------------------------------------------------
# AUTHORITATIVE RAG ENGINE
# --------------------------------------------------

from RAG.rag_engine import ingest_file, delete_document

logger = logging.getLogger(__name__)

# --------------------------------------------------
# Metadata store (multi-tenant, DB-ready)
# --------------------------------------------------
# Structure:
# FILES_DB[user_id] = [ {file_record}, ... ]
# --------------------------------------------------

FILES_DB: Dict[str, List[Dict]] = {}

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Feature flags (future-proof)
ASYNC_INGESTION = False   # flip later (Celery / RQ / background workers)
ENABLE_VECTOR_CLEANUP = True

# --------------------------------------------------
# Helpers
# --------------------------------------------------

def _now() -> str:
    """UTC timestamp for audit + UI."""
    return datetime.utcnow().isoformat()


def _require_file_exists(path: str) -> None:
    if not os.path.exists(path):
        raise FileNotFoundError(f"File path does not exist: {path}")

# --------------------------------------------------
# Write path (UPLOAD + INGEST)
# --------------------------------------------------

def save_file_metadata(
    *,
    filename: str,
    mimetype: str,
    file_path: str,
    user_id: Optional[str] = None,
    file_id: Optional[str] = None,
) -> Dict:
    """
    Save file metadata AND ingest into the RAG engine.

    HARD RULES:
    - file_path MUST be final (already written)
    - file_id MUST be generated exactly once
    """

    uid = user_id or "default"
    fid = file_id or str(uuid.uuid4())

    _require_file_exists(file_path)

    record = {
        "id": fid,
        "name": filename,
        "type": mimetype,
        "path": file_path,
        "user_id": uid,
        "uploadedAt": _now(),
        "updatedAt": _now(),
        "status": "uploaded",   # uploaded → indexed | failed
        "error": None,
    }

    FILES_DB.setdefault(uid, []).append(record)

    logger.info(
        "[FILES] Uploaded | file=%s name=%s user=%s",
        fid,
        filename,
        uid,
    )

    # --------------------------------------------------
    # RAG ingestion (authoritative)
    # --------------------------------------------------

    try:
        logger.info(
            "[FILES] Starting RAG ingestion | file=%s path=%s",
            fid,
            file_path,
        )

        if ASYNC_INGESTION:
            # enqueue_ingestion_job(fid, file_path, mimetype)
            pass
        else:
            ingest_file(
                file_id=fid,       # CRITICAL: same ID everywhere
                file_path=file_path,
                mimetype=mimetype,
            )

        record["status"] = "indexed"
        record["updatedAt"] = _now()

        logger.info(
            "[FILES] RAG ingestion completed | file=%s",
            fid,
        )

    except Exception as exc:
        record["status"] = "failed"
        record["error"] = str(exc)
        record["updatedAt"] = _now()

        logger.exception(
            "[FILES] RAG ingestion failed | file=%s",
            fid,
        )

    return record

# --------------------------------------------------
# Read path (FILES PAGE)
# --------------------------------------------------

def get_all_files(*, user_id: Optional[str] = None) -> List[Dict]:
    """
    Return all uploaded files visible to the user.
    """
    if user_id:
        return FILES_DB.get(user_id, [])
    # admin / debug view
    return [f for files in FILES_DB.values() for f in files]


def get_file(file_id: str, *, user_id: Optional[str] = None) -> Optional[Dict]:
    """
    Fetch a single file record by ID.
    """
    files = get_all_files(user_id=user_id)
    for f in files:
        if f["id"] == file_id:
            return f
    return None

# --------------------------------------------------
# Delete / cleanup
# --------------------------------------------------

def delete_file(file_id: str, *, user_id: Optional[str] = None) -> bool:
    """
    Delete file metadata and (optionally) RAG artifacts.

    Cleanup behavior:
    - UI metadata: ALWAYS removed
    - FAISS vectors: optional (flagged)
    - raw_text: handled by RAG engine
    """

    uid = user_id or "default"
    files = FILES_DB.get(uid, [])

    before = len(files)
    FILES_DB[uid] = [f for f in files if f["id"] != file_id]

    deleted = len(FILES_DB[uid]) < before

    if deleted:
        logger.info("[FILES] Deleted | file=%s user=%s", file_id, uid)

        if ENABLE_VECTOR_CLEANUP:
            try:
                delete_document(file_id=file_id, user_id=uid)
            except Exception:
                logger.warning(
                    "[FILES] Vector/raw_text cleanup failed | file=%s",
                    file_id,
                )
    else:
        logger.warning(
            "[FILES] Delete failed (not found) | file=%s",
            file_id,
        )

    return deleted
