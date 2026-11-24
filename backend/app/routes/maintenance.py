from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.app.database import get_db
from backend.app.models.models import (
    MaintenanceTeam, MaintenanceAssignment, MaintenanceUpdate, FaultReport, User, AuditLog, Notification
)
from backend.app.schemas.schemas import (
    MaintenanceTeamResponse, MaintenanceAssignmentCreate, MaintenanceAssignmentResponse,
    MaintenanceUpdateCreate, MaintenanceUpdateResponse
)
from backend.app.auth.dependencies import get_current_user, require_role

router = APIRouter(prefix="", tags=["Maintenance Operations"])


# 1. Maintenance Teams
@router.get("/api/maintenance/teams", response_model=List[MaintenanceTeamResponse])
def get_maintenance_teams(db: Session = Depends(get_db)):
    return db.query(MaintenanceTeam).all()


# 2. Task Assignments
@router.post("/api/assignments", response_model=MaintenanceAssignmentResponse, status_code=status.HTTP_201_CREATED)
def assign_team(
    assign_in: MaintenanceAssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["administrator", "supervisor"]))
):
    report = db.query(FaultReport).filter(FaultReport.id == assign_in.report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fault report not found")

    team = db.query(MaintenanceTeam).filter(MaintenanceTeam.id == assign_in.team_id).first()
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance team not found")

    assignment = MaintenanceAssignment(
        report_id=assign_in.report_id,
        team_id=assign_in.team_id,
        assigned_by=current_user.id,
        due_date=assign_in.due_date,
        instructions=assign_in.instructions,
        status="assigned"
    )
    db.add(assignment)

    # Automatically progress status of report to 'Assigned' if it is Submitted or Under Review
    if report.status in ["Submitted", "Under Review"]:
        report.status = "Assigned"

    # Notification to citizen if attached
    if report.citizen_id:
        notif = Notification(
            user_id=report.citizen_id,
            report_id=report.id,
            message=f"Your report {report.tracking_number} has been assigned to team: {team.team_name}."
        )
        db.add(notif)

    # Log audit
    audit = AuditLog(
        user_id=current_user.id,
        action="REPORT_ASSIGNED",
        entity_type="maintenance_assignment",
        entity_id=report.id,
        details={
            "report_tracking": report.tracking_number,
            "team_name": team.team_name,
            "due_date": str(assign_in.due_date) if assign_in.due_date else None
        }
    )
    db.add(audit)
    db.commit()
    db.refresh(assignment)

    return assignment


@router.get("/api/assignments/my-tasks")
def get_my_tasks(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """View assigned tasks for field teams or general maintenance."""
    query = db.query(MaintenanceAssignment).join(FaultReport)
    if status_filter:
        query = query.filter(MaintenanceAssignment.status == status_filter)

    assignments = query.order_by(desc(MaintenanceAssignment.assigned_at)).all()
    results = []
    for a in assignments:
        results.append({
            "id": a.id,
            "report_id": a.report_id,
            "tracking_number": a.report.tracking_number,
            "title": a.report.title,
            "category": a.report.category.category_name,
            "community": a.report.community,
            "location_name": a.report.location_name,
            "latitude": a.report.latitude,
            "longitude": a.report.longitude,
            "severity": a.report.severity,
            "report_status": a.report.status,
            "assignment_status": a.status,
            "team_name": a.team.team_name,
            "due_date": a.due_date,
            "instructions": a.instructions,
            "assigned_at": a.assigned_at
        })
    return results


# 3. Work Progress Updates
@router.post("/api/maintenance/updates", response_model=MaintenanceUpdateResponse, status_code=status.HTTP_201_CREATED)
def record_maintenance_update(
    update_in: MaintenanceUpdateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["maintenance_officer", "administrator", "supervisor"]))
):
    report = db.query(FaultReport).filter(FaultReport.id == update_in.report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fault report not found")

    update_entry = MaintenanceUpdate(
        report_id=update_in.report_id,
        officer_id=current_user.id,
        status=update_in.status,
        work_description=update_in.work_description,
        materials_used=update_in.materials_used,
        hours_spent=update_in.hours_spent or 0.0
    )
    db.add(update_entry)

    # Sync fault report status
    old_status = report.status
    report.status = update_in.status

    if report.citizen_id:
        notif = Notification(
            user_id=report.citizen_id,
            report_id=report.id,
            message=f"Maintenance update on {report.tracking_number}: {update_in.work_description[:120]}... Status is now {report.status}."
        )
        db.add(notif)

    audit = AuditLog(
        user_id=current_user.id,
        action="MAINTENANCE_UPDATE",
        entity_type="fault_report",
        entity_id=report.id,
        details={
            "old_status": old_status,
            "new_status": report.status,
            "hours_spent": update_in.hours_spent,
            "materials_used": update_in.materials_used,
            "officer": current_user.full_name
        }
    )
    db.add(audit)
    db.commit()
    db.refresh(update_entry)

    return update_entry
