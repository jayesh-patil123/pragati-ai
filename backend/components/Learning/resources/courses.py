"""
Enterprise-grade static course catalog.

- Designed for search, filters, and learning paths
- Easy to migrate to DB later
- Covers AI, ML, DL, Data, Backend, DevOps, Cloud, Systems
"""

COURSES = [

    # =================================================
    # PYTHON & PROGRAMMING FOUNDATIONS
    # =================================================
    {
        "id": "py-001",
        "title": "Python for Everybody",
        "provider": "Coursera",
        "level": "Beginner",
        "duration_hours": 40,
        "url": "https://www.coursera.org/specializations/python",
        "tags": ["python", "programming", "basics"],
        "category": "Programming",
    },
    {
        "id": "py-002",
        "title": "Complete Python Bootcamp",
        "provider": "Udemy",
        "level": "Beginner",
        "duration_hours": 50,
        "url": "https://www.udemy.com",
        "tags": ["python", "hands-on"],
        "category": "Programming",
    },

    # =================================================
    # DATA STRUCTURES & ALGORITHMS
    # =================================================
    {
        "id": "dsa-001",
        "title": "Data Structures and Algorithms Specialization",
        "provider": "Coursera",
        "level": "Intermediate",
        "duration_hours": 80,
        "url": "https://www.coursera.org",
        "tags": ["dsa", "algorithms", "problem-solving"],
        "category": "Computer Science",
    },
    {
        "id": "dsa-002",
        "title": "DSA for Coding Interviews",
        "provider": "Udemy",
        "level": "Intermediate",
        "duration_hours": 45,
        "url": "https://www.udemy.com",
        "tags": ["dsa", "interviews"],
        "category": "Computer Science",
    },

    # =================================================
    # MACHINE LEARNING
    # =================================================
    {
        "id": "ml-001",
        "title": "Machine Learning Specialization",
        "provider": "Coursera",
        "level": "Beginner",
        "duration_hours": 60,
        "url": "https://www.coursera.org",
        "tags": ["ml", "supervised", "regression"],
        "category": "Machine Learning",
    },
    {
        "id": "ml-002",
        "title": "Hands-On Machine Learning with Scikit-Learn",
        "provider": "O'Reilly",
        "level": "Intermediate",
        "duration_hours": 55,
        "url": "https://www.oreilly.com",
        "tags": ["ml", "sklearn"],
        "category": "Machine Learning",
    },
    {
        "id": "ml-003",
        "title": "Applied Machine Learning",
        "provider": "edX",
        "level": "Intermediate",
        "duration_hours": 45,
        "url": "https://www.edx.org",
        "tags": ["ml", "real-world"],
        "category": "Machine Learning",
    },

    # =================================================
    # DEEP LEARNING
    # =================================================
    {
        "id": "dl-001",
        "title": "Deep Learning Specialization",
        "provider": "Coursera",
        "level": "Advanced",
        "duration_hours": 90,
        "url": "https://www.coursera.org",
        "tags": ["deep learning", "cnn", "rnn"],
        "category": "Deep Learning",
    },
    {
        "id": "dl-002",
        "title": "Deep Learning with PyTorch",
        "provider": "Udemy",
        "level": "Advanced",
        "duration_hours": 40,
        "url": "https://www.udemy.com",
        "tags": ["deep learning", "pytorch"],
        "category": "Deep Learning",
    },
    {
        "id": "dl-003",
        "title": "TensorFlow Developer Certificate",
        "provider": "Coursera",
        "level": "Intermediate",
        "duration_hours": 50,
        "url": "https://www.coursera.org",
        "tags": ["tensorflow", "dl"],
        "category": "Deep Learning",
    },

    # =================================================
    # NLP & LLMs
    # =================================================
    {
        "id": "nlp-001",
        "title": "Natural Language Processing Specialization",
        "provider": "Coursera",
        "level": "Advanced",
        "duration_hours": 80,
        "url": "https://www.coursera.org",
        "tags": ["nlp", "transformers"],
        "category": "NLP",
    },
    {
        "id": "nlp-002",
        "title": "Large Language Models Bootcamp",
        "provider": "DeepLearning.AI",
        "level": "Advanced",
        "duration_hours": 35,
        "url": "https://www.deeplearning.ai",
        "tags": ["llm", "gpt", "rag"],
        "category": "NLP",
    },
    {
        "id": "nlp-003",
        "title": "Prompt Engineering for Developers",
        "provider": "DeepLearning.AI",
        "level": "Beginner",
        "duration_hours": 10,
        "url": "https://www.deeplearning.ai",
        "tags": ["prompt-engineering", "llm"],
        "category": "NLP",
    },

    # =================================================
    # DATA SCIENCE
    # =================================================
    {
        "id": "ds-001",
        "title": "IBM Data Science Professional Certificate",
        "provider": "Coursera",
        "level": "Beginner",
        "duration_hours": 90,
        "url": "https://www.coursera.org",
        "tags": ["data science", "python"],
        "category": "Data Science",
    },
    {
        "id": "ds-002",
        "title": "Applied Data Science with Python",
        "provider": "Coursera",
        "level": "Intermediate",
        "duration_hours": 70,
        "url": "https://www.coursera.org",
        "tags": ["pandas", "numpy", "matplotlib"],
        "category": "Data Science",
    },

    # =================================================
    # MLOPS & DEPLOYMENT
    # =================================================
    {
        "id": "mlops-001",
        "title": "MLOps Specialization",
        "provider": "Coursera",
        "level": "Advanced",
        "duration_hours": 60,
        "url": "https://www.coursera.org",
        "tags": ["mlops", "pipelines"],
        "category": "MLOps",
    },
    {
        "id": "mlops-002",
        "title": "Deploying ML Models with Docker & Kubernetes",
        "provider": "Udemy",
        "level": "Advanced",
        "duration_hours": 35,
        "url": "https://www.udemy.com",
        "tags": ["docker", "kubernetes", "mlops"],
        "category": "MLOps",
    },

    # =================================================
    # BACKEND & SYSTEM DESIGN
    # =================================================
    {
        "id": "be-001",
        "title": "Backend Development with Python",
        "provider": "Udemy",
        "level": "Intermediate",
        "duration_hours": 45,
        "url": "https://www.udemy.com",
        "tags": ["backend", "flask", "api"],
        "category": "Backend",
    },
    {
        "id": "sys-001",
        "title": "System Design for Software Engineers",
        "provider": "Educative",
        "level": "Advanced",
        "duration_hours": 30,
        "url": "https://www.educative.io",
        "tags": ["system-design", "scalability"],
        "category": "Systems",
    },

    # =================================================
    # CLOUD & DEVOPS
    # =================================================
    {
        "id": "cloud-001",
        "title": "AWS Cloud Practitioner",
        "provider": "AWS",
        "level": "Beginner",
        "duration_hours": 20,
        "url": "https://aws.amazon.com",
        "tags": ["aws", "cloud"],
        "category": "Cloud",
    },
    {
        "id": "cloud-002",
        "title": "Google Cloud Data Engineer",
        "provider": "Coursera",
        "level": "Advanced",
        "duration_hours": 65,
        "url": "https://www.coursera.org",
        "tags": ["gcp", "data-engineering"],
        "category": "Cloud",
    },

]


# =================================================
# Public API
# =================================================
def get_courses(
    *,
    category: str | None = None,
    level: str | None = None,
    tag: str | None = None,
):
    """
    Fetch courses with optional filters.
    """

    results = COURSES

    if category:
        results = [c for c in results if c["category"] == category]

    if level:
        results = [c for c in results if c["level"] == level]

    if tag:
        results = [c for c in results if tag in c["tags"]]

    return results
