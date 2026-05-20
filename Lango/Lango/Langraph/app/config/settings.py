import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App config
    PROJECT_NAME: str = "LangGraph Enterprise API"
    VERSION: str = "1.0.0"
    
    # LangSmith
    LANGSMITH_TRACING: bool = True
    LANGSMITH_ENDPOINT: str = "https://eu.api.smith.langchain.com"
    LANGSMITH_API_KEY: str = ""
    LANGSMITH_PROJECT: str = "company-research-agent"

    # Database
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"  # Ignore API keys loaded via dotenv since they are read via os.environ

settings = Settings()
