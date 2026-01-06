from flask import Blueprint

from .dashboard import learning_dashboard_bp
from .paths import learning_paths_bp
from .notes import learning_notes_bp
from .resources.router import learning_resources_bp
from .Personalized_Learning.router import personalized_learning_bp
from .HandsOn_Practice.router import hands_on_bp
from .GitHub_Projects.router import github_projects_bp

learning_bp = Blueprint(
    "learning",
    __name__,
    url_prefix="/api/v1/learning"
)

# -------------------------
# Core learning modules
# -------------------------

learning_bp.register_blueprint(learning_dashboard_bp, url_prefix="/dashboard")
learning_bp.register_blueprint(learning_paths_bp, url_prefix="/paths")
learning_bp.register_blueprint(personalized_learning_bp, url_prefix="/paths")
learning_bp.register_blueprint(learning_notes_bp, url_prefix="/notes")
learning_bp.register_blueprint(learning_resources_bp, url_prefix="/resources")

# -------------------------
# Practice & projects
# -------------------------

learning_bp.register_blueprint(hands_on_bp, url_prefix="/hands-on")
learning_bp.register_blueprint(github_projects_bp, url_prefix="/github-projects")
