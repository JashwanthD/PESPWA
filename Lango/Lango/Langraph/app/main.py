from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables early
load_dotenv()

from app.routes import agent
from app.utils.exceptions import BaseAppException, GraphExecutionError, ProviderError

app = FastAPI(
    title="LangGraph Enterprise API",
    description="FastAPI Backend for the Company Intelligence LangGraph Pipeline",
    version="1.0.0"
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(agent.router)

# Exception Handlers
@app.exception_handler(BaseAppException)
async def custom_app_exception_handler(request: Request, exc: BaseAppException):
    # This ensures internal stack traces aren't leaked to the client
    return JSONResponse(
        status_code=400,
        content={"error": exc.__class__.__name__, "message": exc.message},
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the raw exception securely here (e.g., to Datadog/LangSmith)
    print(f"Unhandled Exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "InternalServerError", "message": "An unexpected system error occurred."},
    )

@app.get("/", tags=["System"])
async def root():
    """Root endpoint returning a welcome message."""
    return {"message": "Welcome to LangGraph Enterprise API. Visit /docs for interactive documentation."}

@app.get("/health", tags=["System"])
async def health_check():
    """Basic API health check."""
    return {"status": "healthy", "version": "1.0.0"}
