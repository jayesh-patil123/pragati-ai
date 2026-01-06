from flask import Blueprint, jsonify, request

learning_paths_bp = Blueprint(
    "learning_paths",
    __name__,
    url_prefix="/api/v1/learning"
)

@learning_paths_bp.route("/paths", methods=["GET"])
def list_paths():
    return jsonify([
        {
            "id": "pythonDev",
            "title": "Python Developer Path",
            "meta": "5 skills · 10 hours",
            "status": "Continue",
            "icon": "code",
            "description": "Python foundations for backend and automation.",
            "roadmap": [
                "Python basics",
                "Control flow",
                "Functions & modules",
                "Files & errors",
                "Mini project",
            ],
        },
        {
            "id": "ml",
            "title": "Machine Learning Path",
            "meta": "6 skills · 15 hours",
            "status": "Start",
            "icon": "brain",
            "description": "ML fundamentals to real-world models.",
            "roadmap": [
                "ML problem types",
                "Regression & classification",
                "Model evaluation",
                "Overfitting & tuning",
                "Hands-on ML project",
            ],
        },
        {
            "id": "webDev",
            "title": "Web Developer Path",
            "meta": "8 skills · 20 hours",
            "status": "Start",
            "icon": "route",
            "description": "Modern frontend + backend web apps.",
            "roadmap": [
                "HTML & CSS",
                "JavaScript",
                "React",
                "APIs",
                "Mini full-stack project",
            ],
        },
        {
            "id": "automation",
            "title": "Automation Engineer Path",
            "meta": "4 skills · 12 hours",
            "status": "Start",
            "icon": "route",
            "description": "Automate workflows using Python.",
            "roadmap": [
                "Python scripting",
                "OS automation",
                "Web automation",
                "Scheduling",
                "Automation project",
            ],
        },
        {
            "id": "dataScience",
            "title": "Data Scientist Path",
            "meta": "7 skills · 18 hours",
            "status": "Start",
            "icon": "brain",
            "description": "Data analysis and modeling.",
            "roadmap": [
                "NumPy & pandas",
                "EDA",
                "Visualization",
                "Basic ML",
                "End-to-end project",
            ],
        },
    ])
