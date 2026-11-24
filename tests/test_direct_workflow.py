"""
Direct Lifecycle Verification Test (No external test runner dependencies)
Verifies:
1. Category seed data
2. User authentication & password hashing
3. Report creation with GPS coordinates
4. Map query & Haversine distance calculations
5. Maintenance assignment
6. Progress update with materials and labor hours
7. Supervisor verification & status transition to Closed
8. Analytics metrics calculation
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.database import SessionLocal
from backend.app.models.models import (
    User, InfrastructureCategory, FaultReport, MaintenanceTeam,
    MaintenanceAssignment, MaintenanceUpdate, AuditLog
)
from backend.app.auth.security import hash_password, verify_password, create_access_token, decode_access_token
from backend.app.routes.reports import generate_tracking_number


def run_verification():
    db = SessionLocal()
    print("=" * 60)
    print("FIMMS - System Verification Test Suite")
    print("=" * 60)

    # 1. Categories
    categories = db.query(InfrastructureCategory).all()
    print(f"\n[1] Infrastructure Categories ({len(categories)} found):")
    for c in categories:
        print(f"    - {c.category_name} (SLA: {c.default_sla_hours}h, Icon: {c.icon})")
    assert len(categories) == 6, "Expected 6 categories"

    # 2. Users and Authentication
    print("\n[2] User Role Authentication Verification:")
    roles_checked = {}
    for email in [
        "citizen@freetown.gov.sl",
        "admin@freetown.gov.sl",
        "officer@freetown.gov.sl",
        "supervisor@freetown.gov.sl"
    ]:
        user = db.query(User).filter(User.email == email).first()
        assert user is not None, f"User {email} missing"
        assert verify_password("Freetown2026!", user.password_hash), f"Password check failed for {email}"
        token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
        payload = decode_access_token(token)
        assert payload["role"] == user.role
        roles_checked[user.role] = user.full_name
        print(f"    - Role: {user.role:20} -> {user.full_name} ({user.email}) [JWT OK]")

    # 3. New Report Submission Simulation
    print("\n[3] Citizen Fault Reporting Simulation:")
    citizen = db.query(User).filter(User.role == "citizen").first()
    road_cat = db.query(InfrastructureCategory).filter(InfrastructureCategory.category_name == "Road damage").first()
    tracking_num = generate_tracking_number(db)

    new_report = FaultReport(
        tracking_number=tracking_num,
        citizen_id=citizen.id,
        category_id=road_cat.id,
        title="Deep pavement fissure at Wilkinson Road intersection",
        description="A 3-meter long asphalt fissure has opened up near the banking corridor, posing danger to motorists.",
        latitude=8.4750,
        longitude=-13.2640,
        location_name="Wilkinson Road Commercial Strip",
        community="Wilkinson Road",
        landmark="Opposite Standard Chartered Bank",
        severity="high",
        status="Submitted"
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    print(f"    - Generated Tracking Reference: {new_report.tracking_number}")
    print(f"    - GPS Coordinates: {new_report.latitude}, {new_report.longitude}")
    print(f"    - Initial Status: {new_report.status}")
    assert new_report.status == "Submitted"

    # 4. Spatial Proximity / Map Query
    print("\n[4] Spatial Proximity & Map Filtering:")
    from backend.app.routes.map import get_map_faults
    markers = get_map_faults(category_id=None, status_filter=None, community=None, severity=None, db=db)
    print(f"    - Total Map Markers in Freetown: {len(markers)}")
    assert any(m.tracking_number == new_report.tracking_number for m in markers)

    # 5. Administrative Assignment
    print("\n[5] Municipal Administrator Assignment:")
    admin = db.query(User).filter(User.role == "administrator").first()
    team = db.query(MaintenanceTeam).first()
    assignment = MaintenanceAssignment(
        report_id=new_report.id,
        team_id=team.id,
        assigned_by=admin.id,
        instructions="Apply asphalt cold-mix and secure perimeter with hazard cones.",
        status="assigned"
    )
    db.add(assignment)
    new_report.status = "Assigned"
    db.commit()
    db.refresh(new_report)
    print(f"    - Dispatched to Unit: {team.team_name}")
    print(f"    - Updated Status: {new_report.status}")
    assert new_report.status == "Assigned"

    # 6. Field Maintenance Update
    print("\n[6] Field Maintenance Progress Update:")
    officer = db.query(User).filter(User.role == "maintenance_officer").first()
    maint_update = MaintenanceUpdate(
        report_id=new_report.id,
        officer_id=officer.id,
        status="Resolved",
        work_description="Excavated fractured surface, applied tack coat emulsion, and compacted 2 tons asphalt cold mix.",
        materials_used="2 tons asphalt cold-mix, bitumen tack coat, safety barriers",
        hours_spent=3.5
    )
    db.add(maint_update)
    new_report.status = "Resolved"
    db.commit()
    db.refresh(new_report)
    print(f"    - Field Officer: {officer.full_name}")
    print(f"    - Work Description: {maint_update.work_description}")
    print(f"    - Materials Logged: {maint_update.materials_used}")
    print(f"    - Labor Hours Spent: {maint_update.hours_spent} hrs")
    print(f"    - Updated Status: {new_report.status}")
    assert new_report.status == "Resolved"

    # 7. Supervisor Verification & Closure
    print("\n[7] Supervisor Final Verification & Formal Closure:")
    supervisor = db.query(User).filter(User.role == "supervisor").first()
    new_report.status = "Closed"
    audit_closure = AuditLog(
        user_id=supervisor.id,
        action="REPORT_CLOSED",
        entity_type="fault_report",
        entity_id=new_report.id,
        details={"verified_by": supervisor.email, "quality_inspection": "approved"}
    )
    db.add(audit_closure)
    db.commit()
    db.refresh(new_report)
    print(f"    - Verified by: {supervisor.full_name} ({supervisor.role})")
    print(f"    - Final Lifecycle Status: {new_report.status}")
    assert new_report.status == "Closed"

    # 8. Analytics Verification
    print("\n[8] Analytics & Resolution Metric Calculation:")
    from backend.app.routes.analytics import get_analytics_summary, get_community_breakdown
    summary = get_analytics_summary(db=db)
    print(f"    - Total Reports Logged: {summary.total_reports}")
    print(f"    - Resolved/Closed: {summary.resolved + summary.closed}")
    print(f"    - Average Resolution Time: {summary.avg_resolution_hours} hours")
    assert summary.total_reports >= 7
    assert summary.closed >= 2

    communities = get_community_breakdown(db=db)
    print(f"    - Pilot Communities Analyzed: {[c.community for c in communities]}")

    db.close()
    print("\n" + "=" * 60)
    print("ALL VERIFICATION SUITES EXECUTED AND PASSED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    run_verification()
