"""
FIMMS End-to-End Workflow Verification Test
Tests the complete fault lifecycle:
Citizen reports -> GPS captures -> Admin verifies & assigns -> Maintenance repairs -> Supervisor closes -> Analytics updates
"""
import sys
import os

# Add root directory to python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_complete_e2e_lifecycle():
    print("\n--- [TEST 1] System Health & Root Info ---")
    res = client.get("/")
    assert res.status_code == 200
    print("Root API response:", res.json())

    print("\n--- [TEST 2] Category Discovery ---")
    res = client.get("/api/categories")
    assert res.status_code == 200
    categories = res.json()
    assert len(categories) == 6
    print(f"Loaded {len(categories)} categories: {[c['category_name'] for c in categories]}")

    print("\n--- [TEST 3] Citizen Registration & Login ---")
    citizen_payload = {
        "full_name": "Test Resident Freetown",
        "email": "test.resident@freetown.sl",
        "phone": "+232 78 999 888",
        "password": "Password2026!",
        "role": "citizen"
    }
    # Register or login if exists
    res = client.post("/api/auth/register", json=citizen_payload)
    if res.status_code == 400:
        res = client.post("/api/auth/login", json={"email": citizen_payload["email"], "password": citizen_payload["password"]})
    assert res.status_code in [200, 201]
    citizen_token = res.json()["access_token"]
    citizen_headers = {"Authorization": f"Bearer {citizen_token}"}
    print("Citizen authenticated successfully!")

    print("\n--- [TEST 4] Citizen Submits Fault Report with GPS ---")
    report_payload = {
        "category_id": categories[0]["id"],  # Road damage
        "title": "Severe asphalt depression at Wilkinson Road Junction",
        "description": "Hazardous road crater causing sudden vehicular braking and pedestrian splash hazards during rainfall.",
        "latitude": 8.4750,
        "longitude": -13.2640,
        "community": "Wilkinson Road",
        "location_name": "Wilkinson Road Commercial Strip",
        "landmark": "Near Standard Chartered Bank",
        "severity": "high"
    }
    res = client.post("/api/reports", json=report_payload, headers=citizen_headers)
    assert res.status_code == 201
    report = res.json()
    tracking_number = report["tracking_number"]
    report_id = report["id"]
    print(f"Fault Report Created! ID: {report_id}, Tracking Reference: {tracking_number}")
    assert report["status"] == "Submitted"

    print("\n--- [TEST 5] Public Tracking by Reference Number ---")
    res = client.get(f"/api/reports/track/{tracking_number}")
    assert res.status_code == 200
    assert res.json()["tracking_number"] == tracking_number
    print(f"Public reference tracking verified for {tracking_number} -> Status: {res.json()['status']}")

    print("\n--- [TEST 6] GIS Map Markers & Spatial Proximity ---")
    res = client.get("/api/map/faults")
    assert res.status_code == 200
    map_markers = res.json()
    assert any(m["tracking_number"] == tracking_number for m in map_markers)
    print(f"Verified marker is present on Freetown GIS map (Total markers: {len(map_markers)})")

    # Nearby query
    res = client.get(f"/api/map/nearby?lat=8.4750&lng=-13.2640&radius_km=3.0")
    assert res.status_code == 200
    print(f"Spatial nearby search returned {len(res.json())} faults within 3km of Wilkinson Road")

    print("\n--- [TEST 7] Administrator Login & Task Assignment ---")
    res = client.post("/api/auth/login", json={"email": "admin@freetown.gov.sl", "password": "Freetown2026!"})
    assert res.status_code == 200
    admin_token = res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Fetch maintenance teams
    res = client.get("/api/maintenance/teams")
    assert res.status_code == 200
    teams = res.json()
    assert len(teams) > 0
    assigned_team = teams[0]

    # Assign report to maintenance team
    assign_payload = {
        "report_id": report_id,
        "team_id": assigned_team["id"],
        "instructions": "Dispatch cold-mix asphalt patch crew and place hazard cones immediately."
    }
    res = client.post("/api/assignments", json=assign_payload, headers=admin_headers)
    assert res.status_code == 201
    print(f"Report assigned to team '{assigned_team['team_name']}'!")

    # Verify status changed to Assigned
    res = client.get(f"/api/reports/{report_id}")
    assert res.json()["status"] == "Assigned"
    print("Report status automatically progressed to: Assigned")

    print("\n--- [TEST 8] Field Maintenance Officer Updates Progress ---")
    res = client.post("/api/auth/login", json={"email": "officer@freetown.gov.sl", "password": "Freetown2026!"})
    assert res.status_code == 200
    officer_token = res.json()["access_token"]
    officer_headers = {"Authorization": f"Bearer {officer_token}"}

    update_payload = {
        "report_id": report_id,
        "status": "Resolved",
        "work_description": "Excavated loose asphalt, applied tack coat, laid 2.5 tons cold asphalt mix, and compacted with pneumatic roller.",
        "materials_used": "2.5 tons asphalt cold-mix, bitumen tack emulsion, safety cones",
        "hours_spent": 3.0
    }
    res = client.post("/api/maintenance/updates", json=update_payload, headers=officer_headers)
    assert res.status_code == 201
    print("Maintenance work progress recorded and status updated to: Resolved")

    print("\n--- [TEST 9] Urban Supervisor Quality Verification & Formal Closure ---")
    res = client.post("/api/auth/login", json={"email": "supervisor@freetown.gov.sl", "password": "Freetown2026!"})
    assert res.status_code == 200
    supervisor_token = res.json()["access_token"]
    supervisor_headers = {"Authorization": f"Bearer {supervisor_token}"}

    # Supervisor reviews and closes report
    closure_payload = {
        "status": "Closed",
        "notes": "On-site physical inspection complete. Roadway restored to uniform grade. Quality sign-off granted."
    }
    res = client.patch(f"/api/reports/{report_id}/status", json=closure_payload, headers=supervisor_headers)
    assert res.status_code == 200
    assert res.json()["status"] == "Closed"
    print("Supervisor verified repair and formally closed complaint -> Status: Closed")

    print("\n--- [TEST 10] Analytics & Performance Verification ---")
    res = client.get("/api/analytics/summary")
    assert res.status_code == 200
    summary = res.json()
    print("Updated Analytics Summary:", summary)
    assert summary["closed"] >= 1
    assert summary["total_reports"] >= 7

    res = client.get("/api/analytics/community")
    assert res.status_code == 200
    print("Community distribution verified successfully!")

    print("\n=======================================================")
    print("🎉 ALL 10 END-TO-END ACCEPTANCE TESTS PASSED SUCCESSFULLY!")
    print("=======================================================")


if __name__ == "__main__":
    test_complete_e2e_lifecycle()
