from flask import Blueprint, jsonify
from datetime import datetime

courses_bp = Blueprint("courses", __name__)

@courses_bp.route("/api/courses", methods=["GET"])
def get_courses():
    """
    Enterprise-grade Courses API
    - Frontend compatible
    - Scalable
    - AI / DB ready
    """

    courses = [

        # ===================== DATA SCIENCE =====================
        {
            "id": "ds-python-101",
            "title": "Python for Data Science",
            "category": "Data Science",
            "level": "Beginner",
            "duration": "6 weeks",
            "status": "ongoing",
            "skills": ["Python", "NumPy", "pandas", "Jupyter"],
            "jobRoles": ["Data Analyst", "Junior Data Scientist"],
            "rating": 4.6,
            "progress": 48,
            "isTrending": True,
            "isNew": False,
            "lastUpdated": "2025-01-12",
        },
        {
            "id": "ds-sql-102",
            "title": "SQL for Analytics",
            "category": "Data Science",
            "level": "Beginner",
            "duration": "4 weeks",
            "status": "library",
            "skills": ["SQL", "Joins", "Indexes"],
            "jobRoles": ["Business Analyst", "Data Analyst"],
            "rating": 4.5,
            "isTrending": False,
            "isNew": False,
            "lastUpdated": "2024-11-20",
        },
        {
            "id": "ds-eda-201",
            "title": "Exploratory Data Analysis",
            "category": "Data Science",
            "level": "Intermediate",
            "duration": "5 weeks",
            "status": "recommended",
            "skills": ["EDA", "Visualization", "Statistics"],
            "jobRoles": ["Data Scientist"],
            "rating": 4.7,
            "isTrending": True,
            "isNew": True,
            "lastUpdated": "2025-02-05",
        },

        # ===================== ARTIFICIAL INTELLIGENCE =====================
        {
            "id": "ai-ml-201",
            "title": "Machine Learning Foundations",
            "category": "Artificial Intelligence",
            "level": "Intermediate",
            "duration": "8 weeks",
            "status": "recommended",
            "skills": ["Linear Regression", "Classification", "Scikit-learn"],
            "jobRoles": ["ML Engineer", "Data Scientist"],
            "rating": 4.8,
            "isTrending": True,
            "isNew": True,
            "lastUpdated": "2025-02-01",
        },
        {
            "id": "ai-dl-301",
            "title": "Deep Learning with PyTorch",
            "category": "Artificial Intelligence",
            "level": "Advanced",
            "duration": "10 weeks",
            "status": "library",
            "skills": ["PyTorch", "CNN", "RNN", "CUDA"],
            "jobRoles": ["AI Engineer", "DL Engineer"],
            "rating": 4.9,
            "isTrending": False,
            "isNew": False,
            "lastUpdated": "2024-12-18",
        },
        {
            "id": "ai-nlp-302",
            "title": "Natural Language Processing",
            "category": "Artificial Intelligence",
            "level": "Advanced",
            "duration": "9 weeks",
            "status": "library",
            "skills": ["NLP", "Transformers", "BERT"],
            "jobRoles": ["NLP Engineer", "AI Researcher"],
            "rating": 4.7,
            "isTrending": True,
            "isNew": False,
            "lastUpdated": "2025-01-25",
        },

        # ===================== WEB DEVELOPMENT =====================
        {
            "id": "web-html-101",
            "title": "HTML & CSS Fundamentals",
            "category": "Web Development",
            "level": "Beginner",
            "duration": "3 weeks",
            "status": "library",
            "skills": ["HTML", "CSS", "Responsive Design"],
            "jobRoles": ["Frontend Developer"],
            "rating": 4.4,
            "isTrending": False,
            "isNew": False,
            "lastUpdated": "2024-10-12",
        },
        {
            "id": "web-react-201",
            "title": "React for Frontend Development",
            "category": "Web Development",
            "level": "Intermediate",
            "duration": "6 weeks",
            "status": "ongoing",
            "skills": ["React", "Hooks", "TypeScript"],
            "jobRoles": ["Frontend Developer"],
            "rating": 4.7,
            "progress": 62,
            "isTrending": True,
            "isNew": True,
            "lastUpdated": "2025-02-10",
        },
        {
            "id": "web-node-301",
            "title": "Node.js & Express Backend",
            "category": "Web Development",
            "level": "Advanced",
            "duration": "7 weeks",
            "status": "recommended",
            "skills": ["Node.js", "Express", "REST APIs"],
            "jobRoles": ["Full Stack Developer"],
            "rating": 4.6,
            "isTrending": True,
            "isNew": False,
            "lastUpdated": "2025-01-30",
        },

        # ===================== CLOUD COMPUTING =====================
        {
            "id": "cloud-aws-101",
            "title": "AWS Cloud Practitioner",
            "category": "Cloud Computing",
            "level": "Beginner",
            "duration": "5 weeks",
            "status": "recommended",
            "skills": ["AWS", "EC2", "S3", "IAM"],
            "jobRoles": ["Cloud Engineer"],
            "rating": 4.6,
            "isTrending": True,
            "isNew": True,
            "lastUpdated": "2025-02-06",
        },
        {
            "id": "cloud-devops-301",
            "title": "DevOps with Docker & Kubernetes",
            "category": "Cloud Computing",
            "level": "Advanced",
            "duration": "8 weeks",
            "status": "library",
            "skills": ["Docker", "Kubernetes", "CI/CD"],
            "jobRoles": ["DevOps Engineer"],
            "rating": 4.8,
            "isTrending": True,
            "isNew": False,
            "lastUpdated": "2025-01-15",
        },

        # ===================== CYBER SECURITY =====================
        {
            "id": "cyber-sec-201",
            "title": "Cyber Security Fundamentals",
            "category": "Cyber Security",
            "level": "Intermediate",
            "duration": "6 weeks",
            "status": "library",
            "skills": ["Networking", "Threat Analysis", "Firewalls"],
            "jobRoles": ["Security Analyst"],
            "rating": 4.5,
            "isTrending": False,
            "isNew": False,
            "lastUpdated": "2024-12-01",
        },
    ]

    return jsonify(
        {
            "courses": courses,
            "meta": {
                "total": len(courses),
                "version": "v3-enterprise",
                "generatedAt": datetime.utcnow().isoformat(),
            },
        }
    ), 200
