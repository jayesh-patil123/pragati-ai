# backend/components/Learning/resources/router.py

from flask import Blueprint, jsonify

from .documents import get_documents
from .courses import get_courses
from .youtube import get_youtube_videos

learning_resources_bp = Blueprint("learning_resources", __name__)


@learning_resources_bp.route("/documents", methods=["GET"])
def list_documents():
    items = get_documents()
    return jsonify({
        "items": items,
        "total": len(items),
    })


@learning_resources_bp.route("/courses", methods=["GET"])
def list_courses():
    items = get_courses()
    return jsonify({
        "items": items,
        "total": len(items),
    })


@learning_resources_bp.route("/youtube", methods=["GET"])
def list_youtube():
    items = get_youtube_videos()
    return jsonify({
        "items": items,
        "total": len(items),
    })
