import os
import io
import csv
import shutil
import random
import datetime
import math
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form, Response
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import desc
from backend.app.database import get_db
from backend.app.models.models import (
    FaultReport, InfrastructureCategory, ReportImage, User, Notification, AuditLog,
    MaintenanceAssignment, MaintenanceUpdate
)
from backend.app.schemas.schemas import (
    FaultReportCreate, FaultReportResponse, FaultReportStatusUpdate, ReportImageResponse,
    DuplicateCheckRequest, DuplicateCheckResponse, DuplicateCandidate, UpvoteResponse
)
from backend.app.auth.dependencies import get_current_user, get_current_user_optional, require_role

router = APIRouter(prefix="/api/reports", tags=["Fault Reports"])

# Local uploads directory
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def generate_tracking_number(db: Session) -> str:
    """Generate unique tracking number in format FTN-2026-XXXX"""
    year = datetime.datetime.now().year
    for _ in range(50):
        code = random.randint(1000, 9999)
        tracking = f"FTN-{year}-{code}"
        if not db.query(FaultReport).filter(FaultReport.tracking_number == tracking).first():
            return tracking
    # Fallback timestamp-based
    return f"FTN-{year}-{int(datetime.datetime.now().timestamp()) % 100000}"


@router.post("", response_model=FaultReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    report_in: FaultReportCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    # Validate category exists
    cat = db.query(InfrastructureCategory).filter(InfrastructureCategory.id == report_in.category_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Selected category does not exist")

    tracking_num = generate_tracking_number(db)

    report = FaultReport(
        tracking_number=tracking_num,
        citizen_id=current_user.id if current_user else None,
        category_id=report_in.category_id,
        title=report_in.title,
        description=report_in.description,
        latitude=report_in.latitude,
        longitude=report_in.longitude,
        location_name=report_in.location_name,
        community=report_in.community,
        landmark=report_in.landmark,
        severity=report_in.severity if report_in.severity in ["low", "medium", "high", "critical"] else "medium",
        status="Submitted"
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Attach initial image URLs if provided
    if report_in.image_urls:
        for img_url in report_in.image_urls:
            img = ReportImage(
                report_id=report.id,
                image_url=img_url,
                image_type="initial",
                caption="Citizen submitted photo evidence"
            )
            db.add(img)
        db.commit()

    # Log to audit log
    audit = AuditLog(
        user_id=current_user.id if current_user else None,
        action="REPORT_CREATED",
        entity_type="fault_report",
        entity_id=report.id,
        details={
            "tracking_number": report.tracking_number,
            "category": cat.category_name,
            "community": report.community,
            "severity": report.severity
        }
    )
    db.add(audit)
    db.commit()

    return db.query(FaultReport).filter(FaultReport.id == report.id).first()


@router.get("", response_model=List[FaultReportResponse])
def list_reports(
    category_id: Optional[int] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    community: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(FaultReport).options(
        joinedload(FaultReport.category),
        joinedload(FaultReport.citizen),
        selectinload(FaultReport.images),
        selectinload(FaultReport.assignments).joinedload(MaintenanceAssignment.team),
        selectinload(FaultReport.updates).joinedload(MaintenanceUpdate.officer)
    )

    if category_id:
        query = query.filter(FaultReport.category_id == category_id)
    if status_filter:
        query = query.filter(FaultReport.status == status_filter)
    if community:
        query = query.filter(FaultReport.community.ilike(f"%{community}%"))
    if severity:
        query = query.filter(FaultReport.severity == severity)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (FaultReport.title.ilike(search_fmt)) |
            (FaultReport.description.ilike(search_fmt)) |
            (FaultReport.tracking_number.ilike(search_fmt)) |
            (FaultReport.location_name.ilike(search_fmt)) |
            (FaultReport.community.ilike(search_fmt))
        )

    return query.order_by(desc(FaultReport.created_at)).offset(offset).limit(limit).all()


@router.get("/track/{tracking_number}", response_model=FaultReportResponse)
def track_report_public(tracking_number: str, db: Session = Depends(get_db)):
    report = db.query(FaultReport).filter(FaultReport.tracking_number.ilike(tracking_number.strip())).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fault report with tracking number '{tracking_number}' was not found"
        )
    return report


@router.get("/{report_id}", response_model=FaultReportResponse)
def get_report_detail(report_id: int, db: Session = Depends(get_db)):
    report = db.query(FaultReport).filter(FaultReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fault report not found")
    return report


@router.patch("/{report_id}/status", response_model=FaultReportResponse)
def update_report_status(
    report_id: int,
    update_data: FaultReportStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["administrator", "supervisor", "maintenance_officer"]))
):
    report = db.query(FaultReport).filter(FaultReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fault report not found")

    old_status = report.status
    report.status = update_data.status
    if update_data.severity:
        report.severity = update_data.severity
    report.updated_at = datetime.datetime.utcnow()

    # If citizen is linked, notify them of status update
    if report.citizen_id:
        notif = Notification(
            user_id=report.citizen_id,
            report_id=report.id,
            message=f"Update on your report {report.tracking_number}: status changed from '{old_status}' to '{report.status}'."
        )
        db.add(notif)

    # Log to audit trail
    audit = AuditLog(
        user_id=current_user.id,
        action="STATUS_UPDATED",
        entity_type="fault_report",
        entity_id=report.id,
        details={
            "old_status": old_status,
            "new_status": report.status,
            "notes": update_data.notes,
            "updated_by": current_user.full_name,
            "role": current_user.role
        }
    )
    db.add(audit)
    db.commit()
    db.refresh(report)

    return report


@router.post("/{report_id}/images", response_model=ReportImageResponse)
async def upload_report_image(
    report_id: int,
    image_type: str = Form("initial"),  # initial, before_repair, after_repair
    caption: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    report = db.query(FaultReport).filter(FaultReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fault report not found")

    # Save uploaded file
    file_ext = os.path.splitext(file.filename)[1] or ".jpg"
    safe_filename = f"report_{report_id}_{int(datetime.datetime.now().timestamp())}_{random.randint(100, 999)}{file_ext}"
    dest_path = os.path.join(UPLOAD_DIR, safe_filename)

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    relative_url = f"/uploads/{safe_filename}"
    img_record = ReportImage(
        report_id=report_id,
        image_url=relative_url,
        image_type=image_type,
        caption=caption or f"{image_type.replace('_', ' ').capitalize()} photograph"
    )
    db.add(img_record)

    audit = AuditLog(
        user_id=current_user.id if current_user else None,
        action="IMAGE_UPLOADED",
        entity_type="fault_report",
        entity_id=report_id,
        details={"image_type": image_type, "file": safe_filename}
    )
    db.add(audit)
    db.commit()
    db.refresh(img_record)

    return img_record


def _haversine_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


@router.post("/check-duplicates", response_model=DuplicateCheckResponse)
def check_duplicate_reports(
    req: DuplicateCheckRequest,
    db: Session = Depends(get_db)
):
    """
    Automatic spatial duplicate detection:
    Scans open faults within radius_meters to prevent redundant complaints.
    """
    open_statuses = ["Submitted", "Under Review", "Assigned", "In Progress"]
    query = db.query(FaultReport).options(
        joinedload(FaultReport.category),
        joinedload(FaultReport.citizen),
        selectinload(FaultReport.images),
        selectinload(FaultReport.assignments).joinedload(MaintenanceAssignment.team),
        selectinload(FaultReport.updates).joinedload(MaintenanceUpdate.officer)
    ).filter(FaultReport.status.in_(open_statuses))

    if req.category_id:
        query = query.filter(FaultReport.category_id == req.category_id)

    candidates: List[DuplicateCandidate] = []
    for r in query.all():
        dist = _haversine_meters(req.latitude, req.longitude, r.latitude, r.longitude)
        if dist <= req.radius_meters:
            candidates.append(
                DuplicateCandidate(
                    id=r.id,
                    tracking_number=r.tracking_number,
                    title=r.title,
                    category_name=r.category.category_name,
                    community=r.community,
                    distance_meters=round(dist, 1),
                    status=r.status,
                    severity=r.severity,
                    upvote_count=r.upvote_count or 0,
                    created_at=r.created_at
                )
            )

    candidates.sort(key=lambda x: x.distance_meters)
    return DuplicateCheckResponse(
        has_potential_duplicates=len(candidates) > 0,
        duplicate_count=len(candidates),
        candidates=candidates
    )


@router.post("/{report_id}/upvote", response_model=UpvoteResponse)
def upvote_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Citizen endorsement ('Me Too' count):
    Increases report priority weight for municipal attention.
    """
    report = db.query(FaultReport).filter(FaultReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fault report not found")

    report.upvote_count = (report.upvote_count or 0) + 1

    audit = AuditLog(
        user_id=current_user.id if current_user else None,
        action="REPORT_UPVOTED",
        entity_type="fault_report",
        entity_id=report.id,
        details={"upvotes": report.upvote_count}
    )
    db.add(audit)
    db.commit()

    return UpvoteResponse(
        report_id=report.id,
        tracking_number=report.tracking_number,
        upvote_count=report.upvote_count,
        message="Thank you! Your endorsement has increased the municipal priority for this issue."
    )


@router.get("/export/csv")
def export_reports_csv(
    status_filter: Optional[str] = Query(None, alias="status"),
    community: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Export fault reports as CSV for official Freetown City Council reporting.
    """
    query = db.query(FaultReport).options(
        joinedload(FaultReport.category),
        joinedload(FaultReport.citizen),
        selectinload(FaultReport.images),
        selectinload(FaultReport.assignments).joinedload(MaintenanceAssignment.team),
        selectinload(FaultReport.updates).joinedload(MaintenanceUpdate.officer)
    )
    if status_filter:
        query = query.filter(FaultReport.status == status_filter)
    if community:
        query = query.filter(FaultReport.community.ilike(f"%{community}%"))

    reports = query.order_by(desc(FaultReport.created_at)).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Tracking Number", "Title", "Category", "Community", "Location Name",
        "Landmark", "Latitude", "Longitude", "Severity", "Status",
        "Upvotes", "Created At", "Updated At"
    ])

    for r in reports:
        writer.writerow([
            r.tracking_number,
            r.title,
            r.category.category_name if r.category else "",
            r.community,
            r.location_name or "",
            r.landmark or "",
            r.latitude,
            r.longitude,
            r.severity,
            r.status,
            r.upvote_count or 0,
            r.created_at.strftime("%Y-%m-%d %H:%M:%S") if r.created_at else "",
            r.updated_at.strftime("%Y-%m-%d %H:%M:%S") if r.updated_at else ""
        ])

    csv_data = output.getvalue()
    filename = f"freetown_faults_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
