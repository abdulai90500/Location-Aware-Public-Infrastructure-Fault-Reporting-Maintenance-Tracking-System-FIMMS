import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, DateTime, Boolean, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from backend.app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=True)
    password_hash = Column(String(255), nullable=False)
    # Roles: citizen, administrator, maintenance_officer, supervisor
    role = Column(String(50), nullable=False, default="citizen", index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    reports = relationship("FaultReport", back_populates="citizen", foreign_keys="FaultReport.citizen_id")
    assigned_tasks = relationship("MaintenanceAssignment", back_populates="assigner", foreign_keys="MaintenanceAssignment.assigned_by")
    maintenance_updates = relationship("MaintenanceUpdate", back_populates="officer")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")


class InfrastructureCategory(Base):
    __tablename__ = "infrastructure_categories"

    id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(50), default="wrench")
    default_sla_hours = Column(Integer, default=72)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    reports = relationship("FaultReport", back_populates="category")


class FaultReport(Base):
    __tablename__ = "fault_reports"

    id = Column(Integer, primary_key=True, index=True)
    tracking_number = Column(String(50), unique=True, index=True, nullable=False)
    citizen_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    category_id = Column(Integer, ForeignKey("infrastructure_categories.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String(255), nullable=True)
    community = Column(String(100), nullable=False, index=True)
    landmark = Column(String(255), nullable=True)
    # severity: low, medium, high, critical
    severity = Column(String(20), default="medium", nullable=False)
    # status: Submitted, Under Review, Assigned, In Progress, Resolved, Closed, Rejected, On Hold, Reopened
    status = Column(String(30), default="Submitted", nullable=False, index=True)
    upvote_count = Column(Integer, default=0, nullable=False)
    ai_classification = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    citizen = relationship("User", back_populates="reports", foreign_keys=[citizen_id])
    category = relationship("InfrastructureCategory", back_populates="reports")
    images = relationship("ReportImage", back_populates="report", cascade="all, delete-orphan")
    assignments = relationship("MaintenanceAssignment", back_populates="report", cascade="all, delete-orphan")
    updates = relationship("MaintenanceUpdate", back_populates="report", cascade="all, delete-orphan")


class ReportImage(Base):
    __tablename__ = "report_images"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("fault_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(Text, nullable=False)
    # initial, before_repair, after_repair
    image_type = Column(String(30), default="initial", nullable=False)
    caption = Column(String(255), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    report = relationship("FaultReport", back_populates="images")


class MaintenanceTeam(Base):
    __tablename__ = "maintenance_teams"

    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String(100), unique=True, nullable=False)
    team_leader = Column(String(100), nullable=False)
    contact_number = Column(String(50), nullable=False)
    department = Column(String(100), nullable=False)
    community_focus = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    assignments = relationship("MaintenanceAssignment", back_populates="team")


class MaintenanceAssignment(Base):
    __tablename__ = "maintenance_assignments"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("fault_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    team_id = Column(Integer, ForeignKey("maintenance_teams.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assigned_at = Column(DateTime, default=datetime.datetime.utcnow)
    due_date = Column(DateTime, nullable=True)
    instructions = Column(Text, nullable=True)
    # assigned, in_progress, completed, cancelled
    status = Column(String(30), default="assigned", nullable=False)

    report = relationship("FaultReport", back_populates="assignments")
    team = relationship("MaintenanceTeam", back_populates="assignments")
    assigner = relationship("User", back_populates="assigned_tasks", foreign_keys=[assigned_by])


class MaintenanceUpdate(Base):
    __tablename__ = "maintenance_updates"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("fault_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    officer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(30), nullable=False)
    work_description = Column(Text, nullable=False)
    materials_used = Column(Text, nullable=True)
    hours_spent = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

    report = relationship("FaultReport", back_populates="updates")
    officer = relationship("User", back_populates="maintenance_updates", foreign_keys=[officer_id])


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    report_id = Column(Integer, ForeignKey("fault_reports.id", ondelete="SET NULL"), nullable=True)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=True)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    user = relationship("User", back_populates="audit_logs")
