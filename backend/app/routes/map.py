from typing import List, Optional, Dict
from collections import Counter
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database import get_db, DATABASE_URL
from backend.app.models.models import FaultReport, InfrastructureCategory, ReportImage
from backend.app.schemas.schemas import MapFaultMarker, HotspotCluster

router = APIRouter(prefix="/api/map", tags=["GIS and Mapping"])


@router.get("/faults", response_model=List[MapFaultMarker])
def get_map_faults(
    category_id: Optional[int] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    community: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(FaultReport).join(InfrastructureCategory)

    if category_id:
        query = query.filter(FaultReport.category_id == category_id)
    if status_filter:
        query = query.filter(FaultReport.status == status_filter)
    if community:
        query = query.filter(FaultReport.community.ilike(f"%{community}%"))
    if severity:
        query = query.filter(FaultReport.severity == severity)

    reports = query.all()
    results = []

    for r in reports:
        # Get latest image thumbnail if available
        first_img = db.query(ReportImage).filter(ReportImage.report_id == r.id).first()
        thumb = first_img.image_url if first_img else None

        results.append(
            MapFaultMarker(
                id=r.id,
                tracking_number=r.tracking_number,
                title=r.title,
                category_id=r.category_id,
                category_name=r.category.category_name,
                category_icon=r.category.icon or "wrench",
                latitude=r.latitude,
                longitude=r.longitude,
                location_name=r.location_name,
                community=r.community,
                severity=r.severity,
                status=r.status,
                thumbnail_url=thumb,
                created_at=r.created_at
            )
        )

    return results


@router.get("/nearby")
def get_nearby_faults(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius_km: float = Query(5.0, description="Search radius in kilometers"),
    db: Session = Depends(get_db)
):
    """Retrieve faults within radius_km from given lat, lng coordinates."""
    if DATABASE_URL.startswith("sqlite"):
        sql = text("""
            SELECT id, tracking_number, title, latitude, longitude, community, status, severity,
                   haversine_distance_km(latitude, longitude, :lat, :lng) AS distance_km
            FROM fault_reports
            WHERE haversine_distance_km(latitude, longitude, :lat, :lng) <= :radius
            ORDER BY distance_km ASC
        """)
        rows = db.execute(sql, {"lat": lat, "lng": lng, "radius": radius_km}).mappings().all()
        return [dict(r) for r in rows]
    else:
        # PostGIS query using ST_DWithin
        sql = text("""
            SELECT id, tracking_number, title, latitude, longitude, community, status, severity,
                   ST_Distance(geom, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography) / 1000.0 AS distance_km
            FROM fault_reports
            WHERE ST_DWithin(geom, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radius_meters)
            ORDER BY distance_km ASC
        """)
        rows = db.execute(sql, {"lat": lat, "lng": lng, "radius_meters": radius_km * 1000.0}).mappings().all()
        return [dict(r) for r in rows]


@router.get("/hotspots", response_model=List[HotspotCluster])
def get_spatial_hotspots(db: Session = Depends(get_db)):
    """
    Spatial hotspot & density analysis across Western Area Urban:
    Aggregates geographic density, critical risk concentrations, and dominant defect types.
    """
    reports = db.query(FaultReport).filter(FaultReport.status.in_(["Submitted", "Under Review", "Assigned", "In Progress"])).all()
    if not reports:
        # Fallback to all reports if all are resolved
        reports = db.query(FaultReport).all()

    # Group by community
    by_comm: Dict[str, List[FaultReport]] = {}
    for r in reports:
        by_comm.setdefault(r.community, []).append(r)

    clusters: List[HotspotCluster] = []
    for comm, comm_reports in by_comm.items():
        count = len(comm_reports)
        crit_count = sum(1 for r in comm_reports if r.severity in ["critical", "high"])
        avg_lat = sum(r.latitude for r in comm_reports) / count
        avg_lng = sum(r.longitude for r in comm_reports) / count

        # Find predominant category
        cat_names = [r.category.category_name for r in comm_reports if r.category]
        predom = Counter(cat_names).most_common(1)[0][0] if cat_names else "Infrastructure"

        # Risk level determination
        if crit_count >= 2 or count >= 4:
            risk = "Critical"
        elif crit_count >= 1 or count >= 2:
            risk = "High"
        else:
            risk = "Medium"

        clusters.append(
            HotspotCluster(
                cluster_id=f"hotspot_{comm.lower().replace(' ', '_')}",
                community=comm,
                centroid_lat=round(avg_lat, 5),
                centroid_lng=round(avg_lng, 5),
                fault_count=count,
                critical_count=crit_count,
                predominant_category=predom,
                risk_level=risk,
                radius_meters=min(1200.0, 300.0 + (count * 150.0))
            )
        )

    clusters.sort(key=lambda x: (x.critical_count, x.fault_count), reverse=True)
    return clusters
