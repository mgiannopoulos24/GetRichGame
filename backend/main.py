from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.router import router as core_router

# Initialize the FastAPI application
app = FastAPI(
    title="FastAPI Game Backend",
    description="A modern, high-performance, and async backend for a game, built with Python.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the router containing the HTTP and WebSocket endpoints
# This automatically registers all routes defined in router.py
app.include_router(core_router)


# Example of a simple root path
@app.get("/")
def read_root():
    return {
        "message": "Welcome to the FastAPI Game Backend. Check /api/v1/health/ for status."
    }
