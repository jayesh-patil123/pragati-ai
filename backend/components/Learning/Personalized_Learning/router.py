from flask import Blueprint, jsonify
from .service import get_role_based_learning_paths

personalized_learning_bp = Blueprint(
    "personalized_learning",
    __name__,
    url_prefix="/api/v1/learning/paths",
)

@personalized_learning_bp.route("/roles", methods=["GET"])
def get_roles():
    sectors = get_role_based_learning_paths()

    # Convert Pydantic → dict
    return jsonify([
        sector.model_dump()
        for sector in sectors
    ])
