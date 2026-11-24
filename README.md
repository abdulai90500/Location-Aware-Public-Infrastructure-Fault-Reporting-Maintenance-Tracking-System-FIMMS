# Freetown Infrastructure Monitoring and Maintenance System (FIMMS)
### Location-Aware Public Infrastructure Fault Reporting and Maintenance Tracking System
**Case Study**: Western Area Urban, Freetown, Sierra Leone

---

## 📌 Project Overview

**FIMMS** is a web-based, location-aware smart city infrastructure fault reporting and lifecycle tracking platform built specifically for the Western Area Urban municipality of Freetown.

The system connects citizens who encounter infrastructure problems with municipal administrators, field maintenance units, and quality supervisors to ensure complaints are tracked from initial GPS pin to verified on-site resolution.

### Complete Closed-Loop MVP Workflow:
$$\text{Citizen Reports Fault} \longrightarrow \text{GPS Captures Location} \longrightarrow \text{Admin Reviews Report} \longrightarrow \text{Maintenance Assigned} \longrightarrow \text{Repair Executed} \longrightarrow \text{Citizen Receives Update} \longrightarrow \text{Supervisor Closes}$$

---

## 🚀 Advanced Capabilities Implemented

1. **🤖 AI-Driven Defect Classification**: Real-time computer vision feature extraction analyzes uploaded photos to automatically suggest category, confidence rating (88%–97%), recommended severity, and defect tags.
2. **⚠️ Automatic Spatial Duplicate Detection**: When a resident sets GPS or selects a location, FIMMS checks within 350m for existing open complaints, enabling citizens to **Endorse / Upvote (+1)** an existing issue rather than creating redundant paperwork.
3. **🔥 GIS Spatial Hotspot & Risk Clustering**: Aggregates fault density across Western Area Urban into interactive risk intensity zones (*Critical, High, Medium*) for municipal resource planning.
4. **🔔 Live In-App Notifications**: Interactive notification bell with real-time status updates delivered directly to citizens and administrators upon assignment and repair completion.
5. **📊 Municipal CSV Data Export**: 1-click export of filtered incident logs for Freetown City Council (FCC) reporting and governance.
6. **📱 Progressive Web App (PWA)**: Mobile manifest and standalone installation support for Android and iOS mobile devices.

---

## 🏗️ Supported Infrastructure Categories

1. **Road damage**: Potholes, collapsed asphalt surfaces, and traffic obstruction.
2. **Streetlights**: Broken, non-functional, or dark public streetlights.
3. **Drainage systems**: Blocked culverts, stormwater silt accumulation, and flash flooding hazards.
4. **Water infrastructure**: Leaking municipal drinking pipes and damaged public standpipes.
5. **Public walkways**: Broken sidewalk slabs, pedestrian curb erosion, and missing covers.
6. **Waste facilities**: Overflowing communal skip containers and unsanctioned dump sites.

---

## 👥 Four User Roles & Responsibilities

| Role | Responsibilities | Default Demo Account |
| :--- | :--- | :--- |
| **Citizen** | Submits faults, captures device GPS, uploads photos, tracks tracking number | `citizen@freetown.gov.sl` |
| **Administrator** | Verifies complaints, prevents duplicates, sets priority, assigns teams | `admin@freetown.gov.sl` |
| **Maintenance Officer** | Receives dispatched work orders, logs progress, materials, and photos | `officer@freetown.gov.sl` |
| **Supervisor** | Conducts quality verification of completed repairs, approves formal closure | `supervisor@freetown.gov.sl` |

> **Password for all demo accounts**: `Freetown2026!`  
> *(Quick One-Click Demo Switcher buttons are also provided on the UI top navigation bar and login page!)*

---

## 📍 Western Area Urban Pilot Deployment Coverage

The system is configured with pre-seeded pilot locations across Western Area Urban:
- **Central Freetown** (8.4840° N, -13.2340° W) — Siaka Stevens St, Historic Cotton Tree, Central Bank, Kroo Town Road.
- **Congo Cross** (8.4825° N, -13.2570° W) — Roundabout hub, Main Motor Road, St. Edwards School.
- **Kissy** (8.4789° N, -13.2120° W) — Kissy Road, Kissy Health Centre, Shell corridor.
- **Lumley** (8.4712° N, -13.2758° W) — Lumley Beach Road, Lumley Police Station.
- **Wilkinson Road** (8.4750° N, -13.2640° W) — Commercial artery, Standard Chartered Bank branch.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **GIS Mapping**: Leaflet, OpenStreetMap, HTML5 Geolocation API.
- **Backend API**: Python FastAPI, Pydantic, SQLAlchemy 2.0, PyJWT.
- **Database**: 
  - **Production / Docker**: PostgreSQL 16 + PostGIS Extension (`geography(Point, 4326)`).
  - **Local Development**: Dual-engine support with automatic fallback to SQLite + native Haversine spatial calculation.
- **Containerization**: Docker, Docker Compose.

---

## 🚀 Quickstart: Running Locally on Windows 11

### Prerequisites
- Python 3.10+ (Available on system via `py`)
- Node.js 18+ and npm (`npm.cmd`)

### Method 1: One-Click Startup (Recommended)
Simply double-click `run-local.bat` or run:
```powershell
.\run-local.ps1
```

### Method 2: Manual Startup

#### Step 1: Start Python FastAPI Backend
```bash
# In project root:
py -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
*The backend will automatically create all tables and populate seed pilot data on first startup!*
- Backend API Root: `http://localhost:8000`
- Interactive Swagger Documentation: `http://localhost:8000/docs`

#### Step 2: Start Next.js Frontend
```bash
cd frontend
npm.cmd install
npm.cmd run dev
```
- Open browser: `http://localhost:3000`

---

## 🐳 Running with Docker & PostGIS

To run the full production stack with PostgreSQL 16 + PostGIS:
```bash
docker compose up --build
```
This automatically initializes:
- `db`: PostGIS database with `database/schema.sql` executed on startup.
- `backend`: FastAPI server connected via PostGIS geography points.
- `frontend`: Next.js web application on port 3000.

---

## 🧪 Testing the Complete MVP Acceptance Criteria

Follow this step-by-step test to verify the acceptance criteria from Section 14:

1. **Citizen Reporting & GPS Capture**:
   - Navigate to `http://localhost:3000/report-fault`.
   - Select **Road damage** or **Drainage systems**.
   - Click **"Use My Device GPS"** or click on the interactive Freetown map.
   - Enter a title and description, and attach a photo.
   - Click **"Submit Fault Report"**.
   - Note down the generated reference number (e.g. `FTN-2026-XXXX`).

2. **Public Status Tracking**:
   - Go to `http://localhost:3000/track-report`.
   - Enter the tracking number.
   - View the visual progress stepper (`Submitted`), GPS coordinate pin, and problem details.

3. **GIS City Map Explorer**:
   - Go to `http://localhost:3000/map`.
   - View all reported markers color-coded across Western Area Urban.
   - Filter by community (e.g. `Lumley`, `Congo Cross`) or category.

4. **Administrator Triage & Assignment**:
   - Click **"Demo: Admin"** in the top navigation bar (or log in as `admin@freetown.gov.sl`).
   - Navigate to `/admin`.
   - In the table, click the **UserCheck icon** on the newly submitted complaint.
   - Select **Freetown Roads & Drainage Unit (FRDU)** and submit the assignment.
   - The status updates automatically to `Assigned`.

5. **Field Maintenance Officer Update**:
   - Click **"Demo: Officer"** (or log in as `officer@freetown.gov.sl`).
   - Navigate to `/maintenance`.
   - Click **"Log Work Progress"** on the assigned task.
   - Set status to `Resolved`, enter work description (e.g. *"Culvert cleared, reinforced with cement mortar"*), hours spent (e.g. `3.5`), and attach completion photo.
   - Submit the update.

6. **Supervisor Verification & Closure**:
   - Click **"Demo: Supervisor"** (or log in as `supervisor@freetown.gov.sl`).
   - Navigate to `/supervisor`.
   - Under **"Repairs Awaiting Final Sign-Off"**, click **"Verify & Close"**.
   - Review the field officer's work description and photos.
   - Enter supervisor inspection notes and click **"Approve & Close Report"**.
   - Report status changes to `Closed`.

7. **Analytics Verification**:
   - Visit `/analytics` to see the live metrics update: resolved count incremented, resolution time calculated, and community density charted.

---

## 📁 Repository Structure

```
freetown-infrastructure-mvp/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point & CORS configuration
│   │   ├── database.py          # SQLAlchemy engine & SQLite/PostGIS abstraction
│   │   ├── models/              # Relational models (Reports, Users, Categories, Teams)
│   │   ├── schemas/             # Pydantic validation schemas
│   │   ├── auth/                # JWT token generation & role-based access control
│   │   ├── services/            # Database auto-seed service
│   │   └── routes/              # Auth, Reports, Map, Maintenance, Analytics, Audit
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # Public landing page with stats & workflow
│   │   ├── report-fault/        # Fault reporting wizard with GPS & photos
│   │   ├── track-report/        # Public tracking timeline stepper
│   │   ├── map/                 # Full-screen GIS Leaflet map
│   │   ├── admin/               # Administrator management dashboard
│   │   ├── maintenance/         # Field maintenance portal
│   │   ├── supervisor/          # Supervisor quality sign-off hub
│   │   ├── analytics/           # Community and category analytics
│   │   ├── login/               # Authentication with one-click demo logins
│   │   └── register/            # Citizen registration
│   ├── components/              # Navbar, MapView, FaultForm, ReportTable, etc.
│   ├── lib/                     # API client abstraction
│   ├── types/                   # TypeScript interfaces
│   ├── Dockerfile
│   └── package.json
├── database/
│   └── schema.sql               # PostgreSQL + PostGIS complete DDL and seed SQL
├── docs/
│   ├── system-architecture.md   # Architectural design with Mermaid diagrams
│   └── api-documentation.md     # Complete REST API specification
├── docker-compose.yml           # Multi-container orchestration (DB, API, Web)
├── run-local.bat                # Windows 11 one-click launcher
├── run-local.ps1                # PowerShell launcher
└── README.md
```

---

## 📜 Academic & Municipal Reference
- **System**: Freetown Infrastructure Monitoring and Maintenance System (FIMMS)
- **Pilot Area**: Western Area Urban, Freetown, Sierra Leone
- **Primary Stakeholder**: Freetown City Council (FCC) & Ministry of Works and Public Assets
