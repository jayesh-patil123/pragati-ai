"""
Enterprise-grade learning documents registry.

- Structured for frontend rendering
- Supports filtering, search, and pagination
- Can be migrated to DB without breaking API
"""

DOCUMENTS = [

    # =================================================
    # MACHINE LEARNING
    # =================================================
    {
        "id": "doc-ml-101",
        "title": "Introduction to Machine Learning",
        "description": "Lecture notes covering ML fundamentals and core concepts",
        "category": "Machine Learning",
        "level": "Beginner",
        "format": "pdf",
        "pages": 120,
        "provider": "Internal",
        "url": "/static/docs/ml/introduction_to_ml.pdf",
        "related_course_ids": ["ml-001"],
        "tags": ["ml", "basics", "theory"],
    },
    {
        "id": "doc-ml-math",
        "title": "Mathematics for Machine Learning",
        "description": "Linear algebra, probability, and optimization notes",
        "category": "Machine Learning",
        "level": "Intermediate",
        "format": "pdf",
        "pages": 150,
        "provider": "Internal",
        "url": "/static/docs/ml/ml_math.pdf",
        "related_course_ids": ["ml-002"],
        "tags": ["ml", "math", "linear algebra"],
    },

    # =================================================
    # PYTHON & DATA SCIENCE
    # =================================================
    {
        "id": "doc-python-da",
        "title": "Python for Data Analysis",
        "description": "Pandas, NumPy, and data manipulation examples",
        "category": "Data Science",
        "level": "Beginner",
        "format": "markdown",
        "pages": 80,
        "provider": "Internal",
        "url": "/static/docs/python/python_data_analysis.md",
        "related_course_ids": ["ds-001", "py-001"],
        "tags": ["python", "data analysis", "pandas"],
    },
    {
        "id": "doc-ds-viz",
        "title": "Data Visualization Handbook",
        "description": "Matplotlib, Seaborn, and best practices",
        "category": "Data Science",
        "level": "Intermediate",
        "format": "pdf",
        "pages": 95,
        "provider": "Internal",
        "url": "/static/docs/ds/data_visualization.pdf",
        "related_course_ids": ["ds-002"],
        "tags": ["visualization", "matplotlib", "seaborn"],
    },

    # =================================================
    # DEEP LEARNING & NLP
    # =================================================
    {
        "id": "doc-dl-cnn",
        "title": "Convolutional Neural Networks",
        "description": "CNN architectures, training, and optimization",
        "category": "Deep Learning",
        "level": "Advanced",
        "format": "pdf",
        "pages": 110,
        "provider": "Internal",
        "url": "/static/docs/dl/cnn_guide.pdf",
        "related_course_ids": ["dl-001"],
        "tags": ["cnn", "deep learning"],
    },
    {
        "id": "doc-nlp-transformers",
        "title": "Transformers and Attention Mechanisms",
        "description": "Self-attention, BERT, GPT, and transformers explained",
        "category": "NLP",
        "level": "Advanced",
        "format": "pdf",
        "pages": 130,
        "provider": "Internal",
        "url": "/static/docs/nlp/transformers.pdf",
        "related_course_ids": ["nlp-001", "nlp-002"],
        "tags": ["nlp", "transformers", "attention"],
    },

    # =================================================
    # MLOPS & SYSTEMS
    # =================================================
    {
        "id": "doc-mlops-pipelines",
        "title": "MLOps Pipelines and Deployment",
        "description": "CI/CD, model versioning, and monitoring",
        "category": "MLOps",
        "level": "Advanced",
        "format": "pdf",
        "pages": 100,
        "provider": "Internal",
        "url": "/static/docs/mlops/mlops_pipelines.pdf",
        "related_course_ids": ["mlops-001", "mlops-002"],
        "tags": ["mlops", "pipelines", "deployment"],
    },
    {
        "id": "doc-system-design",
        "title": "System Design Fundamentals",
        "description": "Scalable backend and distributed system concepts",
        "category": "Systems",
        "level": "Advanced",
        "format": "pdf",
        "pages": 140,
        "provider": "Internal",
        "url": "/static/docs/systems/system_design.pdf",
        "related_course_ids": ["sys-001"],
        "tags": ["system design", "scalability"],
    },
]

# =================================================
# Public API (Filter-Ready)
# =================================================
def get_documents(
    *,
    category: str | None = None,
    level: str | None = None,
    tag: str | None = None,
    course_id: str | None = None,
):
    """
    Fetch documents with optional filters.
    """

    results = DOCUMENTS

    if category:
        results = [d for d in results if d["category"] == category]

    if level:
        results = [d for d in results if d["level"] == level]

    if tag:
        results = [d for d in results if tag in d["tags"]]

    if course_id:
        results = [
            d for d in results
            if course_id in d.get("related_course_ids", [])
        ]

    return {
        "items": results,
        "total": len(results),
    }
