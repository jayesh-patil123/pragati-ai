# backend/components/Learning/GitHub_Projects/router.py

from flask import Blueprint

# Sub-modules
from .repos import github_repos_bp
from .notes_flash import notes_flash_bp

"""
URL STRUCTURE (FINAL):

/api/v1/learning/github-projects/repos
/api/v1/learning/github-projects/repos/categories
/api/v1/learning/github-projects/notes
"""

# Parent blueprint for all GitHub Projects features
github_projects_bp = Blueprint(
    "github_projects",
    __name__,
    url_prefix="/github-projects"
)

# -----------------------------
# Register child blueprints
# -----------------------------

# Repositories
# -> /api/v1/learning/github-projects/repos
github_projects_bp.register_blueprint(github_repos_bp)

# Notes & Flashcards
# -> /api/v1/learning/github-projects/notes
github_projects_bp.register_blueprint(notes_flash_bp)
