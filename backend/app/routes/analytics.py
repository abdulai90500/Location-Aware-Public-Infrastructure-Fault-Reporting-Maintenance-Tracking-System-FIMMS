from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database import get_db
from backend.app.models.models import FaultReport, InfrastructureCategory, MaintenanceTeam, MaintenanceAssignment
from backend.app.schemas.schemas import AnalyticsSummary, CommunityStat, CategoryStat

router = APIRouter(prefix="/api/analytics", tags=["Analytics and Reporting"])


@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics_summary(db: Session = Depends(get_db)):
    total = db.query(FaultReport).count()
    submitted = db.query(FaultReport).filter(FaultReport.status == "Submitted").count()
    under_review = db.query(FaultReport).filter(FaultReport.status == "Under Review").count()
    assigned = db.query(FaultReport).filter(FaultReport.status == "Assigned").count()
    in_progress = db.query(FaultReport).filter(FaultReport.status == "In Progress").count()
    resolved = db.query(FaultReport).filter(FaultReport.status == "Resolved").count()
    closed = db.query(FaultReport).filter(FaultReport.status == "Closed").count()

    # Calculate average resolution time (hours between created_at and updated_at for resolved/closed)
    resolved_reports = db.query(FaultReport).filter(FaultReport.status.in_(["Resolved", "Closed"])).all()
    avg_hours = 0.0
    if resolved_reports:
        total_seconds = sum((r.updated_at - r.created_at).total_seconds() for r in resolved_reports)
        avg_hours = round((total_seconds / len(resolved_reports)) / 3600.0, 1)

    return AnalyticsSummary(
        total_reports=total,
        submitted=submitted,
        under_review=under_review,
        assigned=assigned,
        in_progress=in_progress,
        resolved=resolved,
        closed=closed,
        avg_resolution_hours=avg_hours
    )


@router.get("/community", response_model=List[CommunityStat])
def get_community_breakdown(db: Session = Depends(get_db)):
    results = []
    # Query distinct communities
    communities = db.query(FaultReport.community).distinct().all()

    for (comm,) in communities:
        total = db.query(FaultReport).filter(FaultReport.community == comm).count()
        resolved = db.query(FaultReport).filter(
            FaultReport.community == comm,
            FaultReport.status.in_(["Resolved", "Closed"])
        ).count()
        pending = total - resolved
        results.append(CommunityStat(
            community=comm,
            total=total,
            resolved=resolved,
            pending=pending
        ))

    # Sort descending by total
    results.sort(key=lambda x: x.total, reverse=True)
    return results


@router.get("/category", response_model=List[CategoryStat])
def get_category_breakdown(db: Session = Depends(get_db)):
    results = []
    categories = db.query(InfrastructureCategory).all()

    for cat in categories:
        count = db.query(FaultReport).filter(FaultReport.category_id == cat.id).count()
        results.append(CategoryStat(
            category_name=cat.category_name,
            icon=cat.icon or "wrench",
            count=count
        ))

    results.sort(key=lambda x: x.count, reverse=True)
    return results


@router.get("/teams")
def get_teams_performance(db: Session = Depends(get_db)):
    teams = db.query(MaintenanceTeam).all()
    results = []

    for t in teams:
        assigned_count = db.query(MaintenanceAssignment).filter(MaintenanceAssignment.team_id == t.id).count()
        completed_count = db.query(MaintenanceAssignment).filter(
            MaintenanceAssignment.team_id == t.id,
            MaintenanceAssignment.status == "completed"
        ).count()
        active_count = assigned_count - completed_count

        results.append({
            "team_id": t.id,
            "team_name": t.team_name,
            "department": t.department,
            "team_leader": t.team_leader,
            "contact_number": t.contact_number,
            "total_assigned": assigned_count,
            "completed": completed_count,
            "active": active_count
        })

    return results
