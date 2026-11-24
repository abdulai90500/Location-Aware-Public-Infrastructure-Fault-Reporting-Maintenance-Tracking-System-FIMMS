from typing import List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field


# ==================== User Schemas ====================
class UserBase(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    role: str = "citizen"


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ==================== Category Schemas ====================
class CategoryResponse(BaseModel):
    id: int
    category_name: str
    description: Optional[str] = None
    icon: Optional[str] = "wrench"
    default_sla_hours: int = 72

    class Config:
        from_attributes = True


# ==================== Image Schemas ====================
class ReportImageResponse(BaseModel):
    id: int
    report_id: int
    image_url: str
    image_type: str
    caption: Optional[str] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True


# ==================== Maintenance Schemas ====================
class MaintenanceTeamResponse(BaseModel):
    id: int
    team_name: str
    team_leader: str
    contact_number: str
    department: str
    community_focus: Optional[str] = None

    class Config:
        from_attributes = True


class MaintenanceAssignmentCreate(BaseModel):
    report_id: int
    team_id: int
    due_date: Optional[datetime] = None
    instructions: Optional[str] = None


class MaintenanceAssignmentResponse(BaseModel):
    id: int
    report_id: int
    team_id: int
    assigned_by: Optional[int] = None
    assigned_at: datetime
    due_date: Optional[datetime] = None
    instructions: Optional[str] = None
    status: str
    team: Optional[MaintenanceTeamResponse] = None

    class Config:
        from_attributes = True


class MaintenanceUpdateCreate(BaseModel):
    report_id: int
    status: str  # In Progress, Resolved, etc.
    work_description: str
    materials_used: Optional[str] = None
    hours_spent: Optional[float] = 0.0


class MaintenanceUpdateResponse(BaseModel):
    id: int
    report_id: int
    officer_id: Optional[int] = None
    status: str
    work_description: str
    materials_used: Optional[str] = None
    hours_spent: Optional[float] = 0.0
    updated_at: datetime
    officer: Optional[UserResponse] = None

    class Config:
        from_attributes = True


# ==================== Fault Report Schemas ====================
class FaultReportCreate(BaseModel):
    category_id: int
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    community: str
    landmark: Optional[str] = None
    severity: str = "medium"
    image_urls: Optional[List[str]] = []


class FaultReportStatusUpdate(BaseModel):
    status: str
    severity: Optional[str] = None
    notes: Optional[str] = None


class FaultReportResponse(BaseModel):
    id: int
    tracking_number: str
    citizen_id: Optional[int] = None
    category_id: int
    title: str
    description: str
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    community: str
    landmark: Optional[str] = None
    severity: str
    status: str
    upvote_count: int = 0
    ai_classification: Optional[Any] = None
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None
    citizen: Optional[UserResponse] = None
    images: List[ReportImageResponse] = []
    assignments: List[MaintenanceAssignmentResponse] = []
    updates: List[MaintenanceUpdateResponse] = []

    class Config:
        from_attributes = True


# ==================== Duplicate Detection Schemas ====================
class DuplicateCheckRequest(BaseModel):
    latitude: float
    longitude: float
    category_id: Optional[int] = None
    radius_meters: float = 350.0


class DuplicateCandidate(BaseModel):
    id: int
    tracking_number: str
    title: str
    category_name: str
    community: str
    distance_meters: float
    status: str
    severity: str
    upvote_count: int
    created_at: datetime


class DuplicateCheckResponse(BaseModel):
    has_potential_duplicates: bool
    duplicate_count: int
    candidates: List[DuplicateCandidate]


class UpvoteResponse(BaseModel):
    report_id: int
    tracking_number: str
    upvote_count: int
    message: str


# ==================== AI Classification Schemas ====================
class AIClassificationResponse(BaseModel):
    suggested_category_id: int
    suggested_category_name: str
    confidence: float
    recommended_severity: str
    detected_tags: List[str]
    suggested_title: str
    suggested_description: str
    reasoning: str


# ==================== Notification Schemas ====================
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    report_id: Optional[int] = None
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== Spatial Hotspot Cluster ====================
class HotspotCluster(BaseModel):
    cluster_id: str
    community: str
    centroid_lat: float
    centroid_lng: float
    fault_count: int
    critical_count: int
    predominant_category: str
    risk_level: str  # High, Medium, Low
    radius_meters: float


# ==================== Map Marker Schemas ====================
class MapFaultMarker(BaseModel):
    id: int
    tracking_number: str
    title: str
    category_id: int
    category_name: str
    category_icon: str
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    community: str
    severity: str
    status: str
    thumbnail_url: Optional[str] = None
    created_at: datetime


# ==================== Analytics Schemas ====================
class AnalyticsSummary(BaseModel):
    total_reports: int
    submitted: int
    under_review: int
    assigned: int
    in_progress: int
    resolved: int
    closed: int
    avg_resolution_hours: float


class CommunityStat(BaseModel):
    community: str
    total: int
    resolved: int
    pending: int


class CategoryStat(BaseModel):
    category_name: str
    icon: str
    count: int


# ==================== Audit Log Schemas ====================
class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    entity_type: str
    entity_id: Optional[int] = None
    details: Optional[Any] = None
    created_at: datetime
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True
