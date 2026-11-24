import datetime
from sqlalchemy.orm import Session
from backend.app.models.models import (
    User, InfrastructureCategory, FaultReport, ReportImage,
    MaintenanceTeam, MaintenanceAssignment, MaintenanceUpdate, AuditLog
)
from backend.app.auth.security import hash_password


def seed_database(db: Session):
    # Check if database has already been populated
    if db.query(InfrastructureCategory).first() is not None:
        return

    print("[FIMMS SEED] Initializing Freetown pilot infrastructure data...")

    # 1. Users
    default_password_hash = hash_password("Freetown2026!")

    admin = User(
        full_name="Freetown City Administrator",
        email="admin@freetown.gov.sl",
        phone="+232 76 100 001",
        password_hash=default_password_hash,
        role="administrator"
    )
    supervisor = User(
        full_name="Urban Infrastructure Supervisor",
        email="supervisor@freetown.gov.sl",
        phone="+232 76 100 002",
        password_hash=default_password_hash,
        role="supervisor"
    )
    officer = User(
        full_name="FRDU Field Maintenance Officer",
        email="officer@freetown.gov.sl",
        phone="+232 76 100 003",
        password_hash=default_password_hash,
        role="maintenance_officer"
    )
    citizen = User(
        full_name="Aminata Kamara (Resident)",
        email="citizen@freetown.gov.sl",
        phone="+232 78 200 123",
        password_hash=default_password_hash,
        role="citizen"
    )

    db.add_all([admin, supervisor, officer, citizen])
    db.commit()

    # 2. Infrastructure Categories
    cat_road = InfrastructureCategory(
        category_name="Road damage",
        description="Potholes, damaged roads, collapsed surfaces and asphalt erosion",
        icon="road",
        default_sla_hours=48
    )
    cat_light = InfrastructureCategory(
        category_name="Streetlights",
        description="Broken, dark, or flickering public streetlights",
        icon="lightbulb",
        default_sla_hours=24
    )
    cat_drain = InfrastructureCategory(
        category_name="Drainage systems",
        description="Blocked drains, stormwater culverts, silt buildup and street flooding",
        icon="droplets",
        default_sla_hours=36
    )
    cat_water = InfrastructureCategory(
        category_name="Water infrastructure",
        description="Leaking municipal pipes, damaged public standpipes and water supply faults",
        icon="wrench",
        default_sla_hours=12
    )
    cat_walk = InfrastructureCategory(
        category_name="Public walkways",
        description="Damaged pedestrian sidewalks, collapsed slabs and missing kerbs",
        icon="footprints",
        default_sla_hours=72
    )
    cat_waste = InfrastructureCategory(
        category_name="Waste facilities",
        description="Overflowing community waste skips, damaged dustbins and illegal dumping",
        icon="trash-2",
        default_sla_hours=24
    )

    db.add_all([cat_road, cat_light, cat_drain, cat_water, cat_walk, cat_waste])
    db.commit()

    # 3. Maintenance Teams
    team_frdu = MaintenanceTeam(
        team_name="Freetown Roads & Drainage Unit (FRDU)",
        team_leader="Mohamed Sesay",
        contact_number="+232 77 345 678",
        department="Ministry of Works & Public Assets",
        community_focus="Western Area Urban Wide"
    )
    team_guma = MaintenanceTeam(
        team_name="Guma Valley Rapid Water Response",
        team_leader="Fatmata Bangura",
        contact_number="+232 88 234 567",
        department="Guma Valley Water Company",
        community_focus="Central & West Freetown"
    )
    team_light = MaintenanceTeam(
        team_name="FCC Electrical & Streetlighting Team",
        team_leader="Samuel Koroma",
        contact_number="+232 76 890 123",
        department="Freetown City Council",
        community_focus="Central Freetown & Kissy"
    )
    team_waste = MaintenanceTeam(
        team_name="Western Area Waste Management Taskforce",
        team_leader="Ibrahim Conteh",
        contact_number="+232 99 456 789",
        department="FCC Waste Management Department",
        community_focus="Kroo Town, Lumley & East"
    )

    db.add_all([team_frdu, team_guma, team_light, team_waste])
    db.commit()

    # 4. Fault Reports (Western Area Urban Pilot)
    now = datetime.datetime.utcnow()

    r1 = FaultReport(
        tracking_number="FTN-2026-0001",
        citizen_id=citizen.id,
        category_id=cat_road.id,
        title="Deep crater pothole obstructing westbound traffic",
        description="A 40cm deep pothole has expanded across the westbound lane, forcing drivers into oncoming traffic near Lumley Beach.",
        latitude=8.4712,
        longitude=-13.2758,
        location_name="Lumley Beach Road",
        community="Lumley",
        landmark="Near Lumley Police Station",
        severity="high",
        status="Assigned",
        created_at=now - datetime.timedelta(days=2),
        updated_at=now - datetime.timedelta(days=1)
    )

    r2 = FaultReport(
        tracking_number="FTN-2026-0002",
        citizen_id=citizen.id,
        category_id=cat_drain.id,
        title="Severely blocked stormwater culvert with flood risk",
        description="Culvert inlet blocked with household plastic debris and silt. Rainwater overflowed into nearby shops yesterday.",
        latitude=8.4825,
        longitude=-13.2570,
        location_name="Congo Cross Roundabout",
        community="Congo Cross",
        landmark="Opposite St. Edwards Secondary School",
        severity="critical",
        status="In Progress",
        created_at=now - datetime.timedelta(days=3),
        updated_at=now - datetime.timedelta(hours=14)
    )

    r3 = FaultReport(
        tracking_number="FTN-2026-0003",
        citizen_id=citizen.id,
        category_id=cat_light.id,
        title="Series of non-functional solar streetlights",
        description="Four solar streetlights along Siaka Stevens Street have stopped turning on, leaving a dark stretch prone to night robberies.",
        latitude=8.4840,
        longitude=-13.2340,
        location_name="Siaka Stevens Street",
        community="Central Freetown",
        landmark="Near Historic Cotton Tree & Central Bank",
        severity="medium",
        status="Under Review",
        created_at=now - datetime.timedelta(days=1),
        updated_at=now - datetime.timedelta(hours=6)
    )

    r4 = FaultReport(
        tracking_number="FTN-2026-0004",
        citizen_id=citizen.id,
        category_id=cat_water.id,
        title="High-pressure underground water pipe rupture",
        description="Municipal drinking water pipe burst under the asphalt. Clean potable water is gushing onto the road surface.",
        latitude=8.4789,
        longitude=-13.2120,
        location_name="Kissy Road",
        community="Kissy",
        landmark="Adjacent to Kissy Health Centre",
        severity="critical",
        status="Resolved",
        created_at=now - datetime.timedelta(days=4),
        updated_at=now - datetime.timedelta(days=1)
    )

    r5 = FaultReport(
        tracking_number="FTN-2026-0005",
        citizen_id=citizen.id,
        category_id=cat_walk.id,
        title="Collapsed concrete sidewalk slab with open drop",
        description="Two large concrete covers over the pedestrian gutter have collapsed, creating an uncovered hazard for school children.",
        latitude=8.4750,
        longitude=-13.2640,
        location_name="Wilkinson Road",
        community="Wilkinson Road",
        landmark="Near Standard Chartered Bank branch",
        severity="medium",
        status="Submitted",
        created_at=now - datetime.timedelta(hours=5),
        updated_at=now - datetime.timedelta(hours=5)
    )

    r6 = FaultReport(
        tracking_number="FTN-2026-0006",
        citizen_id=citizen.id,
        category_id=cat_waste.id,
        title="Overflowing community waste skip container",
        description="Communal waste skip is full and garbage is spilling 15 meters along the market perimeter.",
        latitude=8.4890,
        longitude=-13.2410,
        location_name="Kroo Town Road",
        community="Central Freetown",
        landmark="Kroo Town Community Market",
        severity="high",
        status="Closed",
        created_at=now - datetime.timedelta(days=6),
        updated_at=now - datetime.timedelta(days=3)
    )

    db.add_all([r1, r2, r3, r4, r5, r6])
    db.commit()

    # 5. Assignments
    a1 = MaintenanceAssignment(
        report_id=r1.id,
        team_id=team_frdu.id,
        assigned_by=admin.id,
        assigned_at=now - datetime.timedelta(days=1),
        due_date=now + datetime.timedelta(days=1),
        instructions="Cold-mix asphalt patch required. Coordinate with traffic police during morning rush.",
        status="in_progress"
    )
    a2 = MaintenanceAssignment(
        report_id=r2.id,
        team_id=team_frdu.id,
        assigned_by=admin.id,
        assigned_at=now - datetime.timedelta(days=2),
        due_date=now + datetime.timedelta(hours=12),
        instructions="Desilt inlet, remove debris, check integrity of side retaining walls.",
        status="in_progress"
    )
    a4 = MaintenanceAssignment(
        report_id=r4.id,
        team_id=team_guma.id,
        assigned_by=admin.id,
        assigned_at=now - datetime.timedelta(days=4),
        due_date=now - datetime.timedelta(days=2),
        instructions="Isolate section valve, replace cracked 150mm ductile iron sleeve.",
        status="completed"
    )
    a6 = MaintenanceAssignment(
        report_id=r6.id,
        team_id=team_waste.id,
        assigned_by=admin.id,
        assigned_at=now - datetime.timedelta(days=5),
        due_date=now - datetime.timedelta(days=4),
        instructions="Dispatch compactor truck and provide disinfectant powder.",
        status="completed"
    )
    db.add_all([a1, a2, a4, a6])
    db.commit()

    # 6. Maintenance Updates
    u2 = MaintenanceUpdate(
        report_id=r2.id,
        officer_id=officer.id,
        status="In Progress",
        work_description="Excavated 2.5 tons of silt and plastic bottles. Water flow partially restored. Concrete culvert lid being secured.",
        materials_used="Mini excavator, shovels, 3 bags cement",
        hours_spent=4.5,
        updated_at=now - datetime.timedelta(hours=14)
    )
    u4 = MaintenanceUpdate(
        report_id=r4.id,
        officer_id=officer.id,
        status="Resolved",
        work_description="Guma Valley technicians replaced ruptured collar joint and tested pipeline pressure at 4.2 bars. No further leakage.",
        materials_used="150mm cast iron coupling collar, rubber seals, gravel bedding",
        hours_spent=6.0,
        updated_at=now - datetime.timedelta(days=1)
    )
    u6 = MaintenanceUpdate(
        report_id=r6.id,
        officer_id=officer.id,
        status="Closed",
        work_description="Skip cleared and perimeter cleaned thoroughly. Disinfectant applied.",
        materials_used="Compactor truck, disinfectant powder",
        hours_spent=2.0,
        updated_at=now - datetime.timedelta(days=3)
    )
    db.add_all([u2, u4, u6])
    db.commit()

    # 7. Audit Logs
    log1 = AuditLog(
        user_id=citizen.id,
        action="REPORT_CREATED",
        entity_type="fault_report",
        entity_id=r1.id,
        details={"tracking_number": "FTN-2026-0001", "community": "Lumley", "severity": "high"},
        created_at=r1.created_at
    )
    log2 = AuditLog(
        user_id=admin.id,
        action="REPORT_ASSIGNED",
        entity_type="fault_report",
        entity_id=r1.id,
        details={"assigned_to_team": "FRDU", "due_date": str(a1.due_date)},
        created_at=a1.assigned_at
    )
    log3 = AuditLog(
        user_id=officer.id,
        action="MAINTENANCE_UPDATE",
        entity_type="fault_report",
        entity_id=r2.id,
        details={"status": "In Progress", "hours_spent": 4.5},
        created_at=u2.updated_at
    )
    log4 = AuditLog(
        user_id=supervisor.id,
        action="REPORT_CLOSED",
        entity_type="fault_report",
        entity_id=r6.id,
        details={"verified_by": "supervisor@freetown.gov.sl", "status": "Closed"},
        created_at=r6.updated_at
    )
    db.add_all([log1, log2, log3, log4])
    db.commit()

    print("[FIMMS SEED] Freetown pilot data seeded successfully!")
