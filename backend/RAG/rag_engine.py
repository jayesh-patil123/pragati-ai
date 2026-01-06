"""
Production-Grade RAG Engine (PDF + Images + Chat)
-------------------------------------------------

Capabilities:
- PDF ingestion with OCR fallback
- Image ingestion (PNG/JPG/JPEG via OCR)
- Page-wise raw text extraction & persistence
- FAISS-based semantic retrieval
- Full-document extraction mode
- Question extraction mode
- Document-grounded Q&A
- General-knowledge fallback

CRITICAL GUARANTEE:
- Exactly ONE file_id per document
- file_id consistent across:
  - raw text storage
  - FAISS indexing
  - chat answers
  - /api/files/<file_id>/text
"""

from __future__ import annotations

import os
import json
import logging
from typing import List, Dict, Optional

import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import requests

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

# ==================================================
# LOGGING
# ==================================================

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("RAG")

# ==================================================
# CONFIG
# ==================================================

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    raise RuntimeError("OPENROUTER_API_KEY not set")

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

DATA_DIR = "rag_data"
VECTOR_DIR = os.path.join(DATA_DIR, "faiss")
RAW_TEXT_DIR = os.path.join(DATA_DIR, "raw_text")

os.makedirs(VECTOR_DIR, exist_ok=True)
os.makedirs(RAW_TEXT_DIR, exist_ok=True)

TOP_K = 6
MAX_CONTEXT_CHARS = 18_000
MAX_FULLDOC_PAGES = 200

CHAT_MODEL = "meta-llama/llama-3-8b-instruct"

# ==================================================
# EMBEDDINGS & SPLITTER
# ==================================================

EMBEDDINGS = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    model_kwargs={"device": "cpu"},
)

SPLITTER = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
)

# ==================================================
# VECTOR STORE (SINGLE GLOBAL INDEX)
# ==================================================

VECTOR_STORE: Optional[FAISS] = None


def load_vector_store() -> None:
    global VECTOR_STORE
    index_path = os.path.join(VECTOR_DIR, "index.faiss")
    if os.path.exists(index_path):
        VECTOR_STORE = FAISS.load_local(
            VECTOR_DIR,
            EMBEDDINGS,
            allow_dangerous_deserialization=True,
        )
        logger.info("[RAG] FAISS index loaded")


def save_vector_store() -> None:
    if VECTOR_STORE is not None:
        VECTOR_STORE.save_local(VECTOR_DIR)
        logger.info("[RAG] FAISS index saved")


load_vector_store()

# ==================================================
# OCR / EXTRACTION
# ==================================================

def _ocr_image(img: Image.Image) -> str:
    return pytesseract.image_to_string(img).strip()


def extract_pdf_text_pagewise(path: str) -> List[str]:
    pages: List[str] = []

    with fitz.open(path) as doc:
        for page in doc:
            text = page.get_text().strip()

            if len(text) < 50:
                logger.info("[RAG] OCR fallback on page %d", page.number + 1)
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                text = _ocr_image(img)

            pages.append(text.strip())

    return pages


def extract_image_text(path: str) -> List[str]:
    img = Image.open(path)
    text = _ocr_image(img)
    return [text] if text else []

# ==================================================
# RAW TEXT STORAGE
# ==================================================

def _raw_text_path(file_id: str) -> str:
    return os.path.join(RAW_TEXT_DIR, f"{file_id}.json")


def save_raw_text(file_id: str, pages: List[str]) -> None:
    payload = [{"page": i + 1, "text": t} for i, t in enumerate(pages)]
    with open(_raw_text_path(file_id), "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    logger.info("[RAG] Raw text saved | file=%s pages=%d", file_id, len(pages))


def load_raw_text(file_id: str) -> List[Dict]:
    path = _raw_text_path(file_id)
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

# ==================================================
# INGESTION (PDF / IMAGE)
# ==================================================

def ingest_file(*, file_id: str, file_path: str, mimetype: Optional[str] = None) -> None:
    """
    Authoritative ingestion entry point.
    Called by Files page and Chat page.
    """
    global VECTOR_STORE

    logger.info("[RAG] Ingesting | file=%s path=%s", file_id, file_path)

    ext = os.path.splitext(file_path)[1].lower()

    if ext in {".png", ".jpg", ".jpeg"}:
        pages = extract_image_text(file_path)
    else:
        pages = extract_pdf_text_pagewise(file_path)

    if not any(pages):
        raise ValueError("No text extracted from document")

    # Persist raw text FIRST (authoritative)
    save_raw_text(file_id, pages)

    docs: List[Document] = []

    for page_num, text in enumerate(pages, start=1):
        for chunk in SPLITTER.split_text(text):
            docs.append(
                Document(
                    page_content=chunk,
                    metadata={
                        "file_id": file_id,
                        "page": page_num,
                    },
                )
            )

    if VECTOR_STORE is None:
        VECTOR_STORE = FAISS.from_documents(docs, EMBEDDINGS)
    else:
        VECTOR_STORE.add_documents(docs)

    save_vector_store()

    logger.info(
        "[RAG] Ingestion complete | file=%s pages=%d chunks=%d",
        file_id,
        len(pages),
        len(docs),
    )

# ==================================================
# DELETE / CLEANUP (REQUIRED)
# ==================================================

def delete_document(*, file_id: str) -> bool:
    """
    Remove ALL RAG artifacts for a document.
    Safe, idempotent, never crashes caller.
    """

    deleted = False

    # ---- raw text ----
    raw_path = _raw_text_path(file_id)
    if os.path.exists(raw_path):
        os.remove(raw_path)
        deleted = True
        logger.info("[RAG] Raw text deleted | file=%s", file_id)

    # ---- vectors ----
    global VECTOR_STORE
    if VECTOR_STORE is not None:
        docs = list(VECTOR_STORE.docstore._dict.values())
        kept = []
        removed = 0

        for d in docs:
            if d.metadata.get("file_id") == file_id:
                removed += 1
            else:
                kept.append(d)

        if removed:
            VECTOR_STORE = FAISS.from_documents(kept, EMBEDDINGS)
            save_vector_store()
            deleted = True
            logger.info(
                "[RAG] FAISS vectors deleted | file=%s chunks=%d",
                file_id,
                removed,
            )

    return deleted

# ==================================================
# INTENT DETECTION
# ==================================================

def _is_full_document_request(q: str) -> bool:
    q = q.lower()
    return any(
        p in q
        for p in (
            "all the text",
            "full text",
            "entire pdf",
            "entire document",
            "show full document",
            "extract all text",
        )
    )


def _is_question_extraction(q: str) -> bool:
    q = q.lower()
    return any(
        p in q
        for p in (
            "all questions",
            "extract questions",
            "interview questions",
            "mcq",
        )
    )

# ==================================================
# ANSWERING
# ==================================================

def answer(question: str, file_id: Optional[str] = None) -> str:
    question = question.strip()
    if not question:
        return "Please ask a valid question."

    # -------- FULL DOCUMENT MODE --------
    if _is_full_document_request(question):
        if not file_id:
            return "No document attached to this chat."

        pages = load_raw_text(file_id)
        if not pages:
            return "No extracted text found for this document."

        return "\n\n".join(
            f"Page {p['page']}:\n{p['text']}"
            for p in pages
        )

    # -------- DOCUMENT Q&A --------
    if VECTOR_STORE is not None:
        docs = VECTOR_STORE.similarity_search(
            question,
            k=TOP_K,
            filter={"file_id": file_id} if file_id else None,
        )
        if docs:
            context = "\n\n".join(d.page_content for d in docs)[:MAX_CONTEXT_CHARS]
            system_prompt = (
                "You are a document-grounded assistant.\n"
                "Answer strictly from the document context.\n"
                "If the answer is not present, say so.\n\n"
                f"{context}"
            )
            return _call_llm(system_prompt, question)

    # -------- NO DOCUMENT ANSWER --------
    return "The answer is not present in the uploaded document."


# ==================================================
# LLM CALL (SINGLE PLACE)
# ==================================================

def _call_llm(system_prompt: str, user_prompt: str) -> str:
    payload = {
        "model": CHAT_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.3,
    }

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    response = requests.post(
        OPENROUTER_URL,
        headers=headers,
        json=payload,
        timeout=60,
    )
    response.raise_for_status()

    return response.json()["choices"][0]["message"]["content"]

# ==================================================
# API HELPERS
# ==================================================

def get_raw_text(file_id: str) -> List[Dict]:
    return load_raw_text(file_id)


def get_chunks_preview(limit: int = 5) -> List[str]:
    if VECTOR_STORE is None:
        return []
    return [d.page_content for d in list(VECTOR_STORE.docstore._dict.values())[:limit]]


def answer_question(question: str) -> str:
    return answer(question)
