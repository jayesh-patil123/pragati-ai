# backend/components/Learning/HandsOn_Practice/router.py

from flask import Blueprint, jsonify, request

from .service import get_coding_challenges, get_sql_challenges

hands_on_bp = Blueprint("hands_on_practice", __name__)


# --------------------------------------------------
# Coding Challenges
# /api/v1/learning/coding/challenges
# --------------------------------------------------

@hands_on_bp.route("/coding/challenges", methods=["GET"])
def coding_challenges():
    return jsonify(get_coding_challenges())


# --------------------------------------------------
# SQL Challenges
# /api/v1/learning/sql/challenges
# --------------------------------------------------

@hands_on_bp.route("/sql/challenges", methods=["GET"])
def sql_challenges():
    return jsonify(get_sql_challenges())


# --------------------------------------------------
# SQL Execute
# /api/v1/learning/sql/execute
# --------------------------------------------------

@hands_on_bp.route("/sql/execute", methods=["POST"])
def run_sql():
    data = request.get_json(silent=True) or {}
    query = data.get("query", "")

    if not query:
        return jsonify({"error": "Query required"}), 400

    # Stub execution (replace with real DB later)
    return jsonify([])


# --------------------------------------------------
# Python Execute
# /api/v1/learning/python/execute
# --------------------------------------------------

@hands_on_bp.route("/python/execute", methods=["POST"])
def run_python():
    return jsonify({
        "stdout": "Execution requires backend sandbox",
        "stderr": None,
    })
