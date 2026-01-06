from .models import Sector, Role, LearningResource

def R(title: str, url: str) -> LearningResource:
    return LearningResource(title=title, url=url)

def get_role_based_learning_paths() -> list[Sector]:
    return [

        # =====================================================
        # INFORMATION TECHNOLOGY
        # =====================================================
        Sector(
            title="Information Technology",
            subtitle="Software, cloud, DevOps & systems",
            icon="cpu",
            roles=[
                Role(
                    title="Backend Developer",
                    tags=["python", "api", "fastapi", "databases"],
                    resources=[
                        R("FastAPI Docs", "https://fastapi.tiangolo.com/"),
                        R("PostgreSQL Tutorial", "https://www.postgresqltutorial.com/"),
                    ],
                ),
                Role(
                    title="Frontend Developer",
                    tags=["react", "typescript", "ui"],
                    resources=[
                        R("React Docs", "https://react.dev/"),
                        R("TypeScript Handbook", "https://www.typescriptlang.org/docs/"),
                    ],
                ),
                Role(
                    title="Full Stack Developer",
                    tags=["frontend", "backend", "apis"],
                    resources=[
                        R("Full Stack Open", "https://fullstackopen.com/"),
                    ],
                ),
                Role(
                    title="DevOps Engineer",
                    tags=["docker", "kubernetes", "ci-cd"],
                    resources=[
                        R("Docker Docs", "https://docs.docker.com/"),
                        R("Kubernetes Docs", "https://kubernetes.io/docs/"),
                    ],
                ),
                Role(
                    title="Cloud Engineer",
                    tags=["aws", "gcp", "cloud"],
                    resources=[
                        R("AWS Training", "https://aws.amazon.com/training/"),
                        R("Google Cloud Architecture", "https://cloud.google.com/architecture"),
                    ],
                ),
                Role(
                    title="Site Reliability Engineer",
                    tags=["sre", "reliability", "monitoring"],
                    resources=[
                        R("Google SRE Book", "https://sre.google/books/"),
                    ],
                ),
            ],
        ),

        # =====================================================
        # AI & DATA
        # =====================================================
        Sector(
            title="AI & Data",
            subtitle="ML, data science & AI engineering",
            icon="cpu",
            roles=[
                Role(
                    title="Machine Learning Engineer",
                    tags=["ml", "deployment", "models"],
                    resources=[
                        R("ML Crash Course", "https://developers.google.com/machine-learning/crash-course"),
                        R("Hands-On ML", "https://github.com/ageron/handson-ml"),
                    ],
                ),
                Role(
                    title="Data Scientist",
                    tags=["statistics", "python", "analysis"],
                    resources=[
                        R("Kaggle Learn", "https://www.kaggle.com/learn"),
                        R("Python DS Handbook", "https://jakevdp.github.io/PythonDataScienceHandbook/"),
                    ],
                ),
                Role(
                    title="Data Engineer",
                    tags=["pipelines", "spark", "etl"],
                    resources=[
                        R("Data Engineering Zoomcamp", "https://github.com/DataTalksClub/data-engineering-zoomcamp"),
                    ],
                ),
                Role(
                    title="AI Engineer",
                    tags=["llm", "rag", "agents"],
                    resources=[
                        R("LangChain Docs", "https://python.langchain.com/"),
                        R("DeepLearning.AI", "https://www.deeplearning.ai/"),
                    ],
                ),
                Role(
                    title="Prompt Engineer",
                    tags=["llm", "prompting"],
                    resources=[
                        R("Prompt Engineering Guide", "https://www.promptingguide.ai/"),
                    ],
                ),
            ],
        ),

        # =====================================================
        # MARKETING
        # =====================================================
        Sector(
            title="Marketing",
            subtitle="SEO, growth & digital marketing",
            icon="megaphone",
            roles=[
                Role(
                    title="Digital Marketer",
                    tags=["seo", "content", "analytics"],
                    resources=[
                        R("Google Digital Garage", "https://learndigital.withgoogle.com/"),
                        R("Ahrefs SEO Guide", "https://ahrefs.com/seo"),
                    ],
                ),
                Role(
                    title="Growth Marketer",
                    tags=["funnels", "experiments"],
                    resources=[
                        R("GrowthHackers", "https://growthhackers.com/"),
                    ],
                ),
                Role(
                    title="Content Strategist",
                    tags=["content", "branding"],
                    resources=[
                        R("Content Marketing Institute", "https://contentmarketinginstitute.com/"),
                    ],
                ),
            ],
        ),

        # =====================================================
        # FINANCE
        # =====================================================
        Sector(
            title="Finance",
            subtitle="Analytics, valuation & trading",
            icon="dollar",
            roles=[
                Role(
                    title="Financial Analyst",
                    tags=["finance", "excel", "modeling"],
                    resources=[
                        R("Corporate Finance Institute", "https://corporatefinanceinstitute.com/"),
                        R("Python for Finance", "https://www.datacamp.com/tracks/finance-with-python"),
                    ],
                ),
                Role(
                    title="Quantitative Analyst",
                    tags=["quant", "statistics", "python"],
                    resources=[
                        R("Quantopian Lectures", "https://www.quantopian.com/lectures"),
                    ],
                ),
                Role(
                    title="Risk Analyst",
                    tags=["risk", "finance"],
                    resources=[
                        R("Risk Management Guide", "https://www.investopedia.com/terms/r/riskmanagement.asp"),
                    ],
                ),
            ],
        ),
    ]
