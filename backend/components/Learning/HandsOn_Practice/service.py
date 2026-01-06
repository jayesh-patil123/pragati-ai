# backend/components/Learning/HandsOn_Practice/service.py

from .models import SqlChallenge, CodingProblem


def get_sql_challenges():
    challenges = [
        SqlChallenge(
            id="employees",
            title="Select All Employees",
            query="SELECT * FROM employees;",
        ),
        SqlChallenge(
            id="count",
            title="Count Employees",
            query="SELECT COUNT(*) AS total FROM employees;",
        ),
        SqlChallenge(
            id="filter",
            title="Filter by Department",
            query="SELECT * FROM employees WHERE department = 'Engineering';",
        ),
    ]

    # ✅ IMPORTANT: convert to JSON-safe dicts
    return [c.model_dump() for c in challenges]


def get_coding_challenges():
    problems = [
        CodingProblem(
            id="metrics",
            title="Compute F1 Score",
            difficulty="Beginner",
            description="Compute precision, recall and F1 score",
            template="function metrics(yTrue, yPred) {}",
            fnName="metrics",
            tests=[],
        )
    ]

    return [p.model_dump() for p in problems]
