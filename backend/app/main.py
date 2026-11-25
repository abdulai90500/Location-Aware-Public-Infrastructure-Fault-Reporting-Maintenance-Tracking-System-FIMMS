import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.database import engine, Base, SessionLocal
from backend.app.services.seed import seed_database

from backend.app.routes.auth import router as auth_router
from backend.app.routes.categories import router as categories_router
from backend.app.routes.reports import router as reports_router
from backend.app.routes.map import router as map_router
from backend.app.routes.maintenance import router as maintenance_router
from backend.app.routes.analytics import router as analytics_router
from backend.app.routes.audit import router as audit_router
from backend.app.routes.ai import router as ai_router
from backend.app.routes.notifications import router as notifications_router

# Ensure uploads directory exists (use /tmp on Vercel serverless filesystem)
UPLOAD_DIR = (
    "/tmp/uploads"
    if os.getenv("VERCEL")
    else os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
)
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Create tables and seed data on startup
Base.metadata.create_all(bind=engine)
with SessionLocal() as db_session:
    seed_database(db_session)

app = FastAPI(
    title="Freetown Infrastructure Monitoring and Maintenance System (FIMMS)",
    description=(
        "Location-Aware Public Infrastructure Fault Reporting and Maintenance Tracking System "
        "for Western Area Urban, Freetown, Sierra Leone."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded evidence images statically
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include API Routers
app.include_router(auth_router)
app.include_router(categories_router)
app.include_router(reports_router)
app.include_router(map_router)
app.include_router(maintenance_router)
app.include_router(analytics_router)
app.include_router(audit_router)
app.include_router(ai_router)
app.include_router(notifications_router)


@app.get("/", tags=["Root"])
def root():
    return {
        "system": "Freetown Infrastructure Monitoring and Maintenance System (FIMMS)",
        "case_study": "Western Area Urban, Freetown, Sierra Leone",
        "version": "1.0.0",
        "status": "online",
        "api_documentation": "/docs"
    }


@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "fimms-backend"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
