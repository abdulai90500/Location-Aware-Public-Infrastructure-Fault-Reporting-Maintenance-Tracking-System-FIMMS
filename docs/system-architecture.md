# FIMMS - System Architecture Specification
## Location-Aware Public Infrastructure Fault Reporting and Maintenance Tracking System
### Case Study: Western Area Urban, Freetown, Sierra Leone

---

## 1. Executive Overview

The **Freetown Infrastructure Monitoring and Maintenance System (FIMMS)** is a specialized location-aware municipal incident management platform designed for the unique urban landscape of Freetown's Western Area Urban.

The primary goal of the Minimum Viable Product (MVP) is to establish a closed-loop incident lifecycle:
$$\text{Citizen Report} \longrightarrow \text{GPS Location} \longrightarrow \text{Admin Triage} \longrightarrow \text{Field Dispatch} \longrightarrow \text{Repair Execution} \longrightarrow \text{Supervisor Closure}$$

---

## 2. High-Level Architecture Diagram

```mermaid
flowchart TD
    subgraph ClientLayer["Frontend Presentation Layer (Next.js 14 + React + Tailwind CSS)"]
        Landing["Citizen Landing & Public Map"]
        ReportPortal["Fault Reporting Wizard (GPS + Photos)"]
        TrackPortal["Public Reference Tracker"]
        AdminDash["Centralized Municipal Dashboard"]
        FieldPortal["Field Maintenance Officer Portal"]
        SuperHub["Supervisor Quality Sign-Off Hub"]
    end

    subgraph APILayer["Backend Application Layer (Python FastAPI)"]
        AuthRouter["Authentication & JWT Security (/api/auth)"]
        ReportRouter["Fault Reporting & Lifecycle Router (/api/reports)"]
        GISRouter["Spatial Query & Map Router (/api/map)"]
        MaintRouter["Task Assignment & Work Orders (/api/maintenance)"]
        AnalyticsRouter["Reporting & Community SLA Analytics (/api/analytics)"]
        AuditRouter["Compliance & Audit Trails (/api/audit-logs)"]
    end

    subgraph DataLayer["Persistence & Spatial Layer"]
        PostgreSQL["PostgreSQL 14+ Relational Engine"]
        PostGIS["PostGIS Spatial Extension (geography Point, SRID 4326)"]
        LocalStorage["Static Image Uploads (/uploads)"]
        SQLiteFallback["Embedded SQLite + Haversine Engine (Local Zero-Config)"]
    end

    Landing --> GISRouter
    ReportPortal --> ReportRouter
    ReportPortal --> GISRouter
    TrackPortal --> ReportRouter
    AdminDash --> ReportRouter
    AdminDash --> MaintRouter
    AdminDash --> AnalyticsRouter
    FieldPortal --> MaintRouter
    SuperHub --> ReportRouter

    AuthRouter --> PostgreSQL
    ReportRouter --> PostgreSQL
    ReportRouter --> LocalStorage
    GISRouter --> PostGIS
    MaintRouter --> PostgreSQL
    AnalyticsRouter --> PostgreSQL
    AuditRouter --> PostgreSQL

    ReportRouter -.-> SQLiteFallback
    GISRouter -.-> SQLiteFallback
```

---

## 3. End-to-End Fault Lifecycle Sequence

```mermaid
sequenceDiagram
    autonumber
    actor C as Citizen / Resident
    participant UI as Next.js Web App
    participant API as FastAPI Backend
    participant DB as PostGIS / Database
    actor A as City Administrator
    actor M as Maintenance Officer
    actor S as Urban Supervisor

    C->>UI: Selects category, enters details & captures GPS coordinates
    C->>UI: Attaches photograph evidence
    UI->>API: POST /api/reports (with coordinates & photo payload)
    API->>DB: Stores fault report, generates tracking # (e.g., FTN-2026-0001)
    API->>DB: Converts lat/long to PostGIS geography Point(4326)
    API->>DB: Logs REPORT_CREATED in audit_logs
    API-->>UI: Returns 201 Created with tracking number
    UI-->>C: Displays confirmation modal & tracking reference

    A->>UI: Views Admin Dashboard (/admin)
    UI->>API: GET /api/reports?status=Submitted
    API-->>UI: Returns pending verification queue
    A->>UI: Reviews duplicates, verifies severity, assigns maintenance unit
    UI->>API: POST /api/assignments (team_id, instructions, due_date)
    API->>DB: Updates status to 'Assigned', records assignment
    API->>DB: Logs REPORT_ASSIGNED in audit_logs

    M->>UI: Logs in to Field Maintenance Portal (/maintenance)
    UI->>API: GET /api/assignments/my-tasks
    API-->>UI: Returns assigned work orders & map coordinates
    M->>UI: Commences work, logs status 'In Progress'
    M->>UI: Records repair progress, materials used, hours spent & after-repair photo
    UI->>API: POST /api/maintenance/updates
    API->>DB: Updates status to 'Resolved', stores repair evidence

    S->>UI: Opens Supervisor Verification Hub (/supervisor)
    UI->>API: GET /api/reports?status=Resolved
    API-->>UI: Returns completed repairs awaiting sign-off
    S->>UI: Inspects before & after photo evidence and materials log
    S->>UI: Approves resolution & closes report
    UI->>API: PATCH /api/reports/{id}/status (status='Closed')
    API->>DB: Records closure in audit_logs & creates citizen notification
```

---

## 4. Entity-Relationship (ER) Schema

```mermaid
erDiagram
    users ||--o{ fault_reports : "submits"
    users ||--o{ maintenance_assignments : "assigns"
    users ||--o{ maintenance_updates : "performs"
    users ||--o{ audit_logs : "triggers"
    users ||--o{ notifications : "receives"

    infrastructure_categories ||--o{ fault_reports : "categorizes"
    fault_reports ||--o{ report_images : "contains"
    fault_reports ||--o{ maintenance_assignments : "receives"
    fault_reports ||--o{ maintenance_updates : "logs"
    maintenance_teams ||--o{ maintenance_assignments : "fulfills"

    users {
        int id PK
        string full_name
        string email
        string phone
        string password_hash
        string role "citizen|administrator|maintenance_officer|supervisor"
        datetime created_at
    }

    infrastructure_categories {
        int id PK
        string category_name
        string description
        string icon
        int default_sla_hours
    }

    fault_reports {
        int id PK
        string tracking_number UK
        int citizen_id FK
        int category_id FK
        string title
        text description
        float latitude
        float longitude
        geography geom
        string location_name
        string community
        string landmark
        string severity "low|medium|high|critical"
        string status "Submitted|Under Review|Assigned|In Progress|Resolved|Closed"
        datetime created_at
        datetime updated_at
    }

    report_images {
        int id PK
        int report_id FK
        string image_url
        string image_type "initial|before_repair|after_repair"
        string caption
        datetime uploaded_at
    }

    maintenance_teams {
        int id PK
        string team_name
        string team_leader
        string contact_number
        string department
        string community_focus
    }

    maintenance_assignments {
        int id PK
        int report_id FK
        int team_id FK
        int assigned_by FK
        datetime assigned_at
        datetime due_date
        text instructions
        string status
    }

    maintenance_updates {
        int id PK
        int report_id FK
        int officer_id FK
        string status
        text work_description
        text materials_used
        float hours_spent
        datetime updated_at
    }

    audit_logs {
        int id PK
        int user_id FK
        string action
        string entity_type
        int entity_id
        json details
        datetime created_at
    }
```

---

## 5. Western Area Urban Geographical Coverage

The pilot application covers the following primary commercial and residential zones:
1. **Central Freetown** (8.4840° N, -13.2340° W) — Historical Cotton Tree, Siaka Stevens Street, Central Business District, Kroo Town Road.
2. **Congo Cross** (8.4825° N, -13.2570° W) — Roundabout transit hub, Main Motor Road, St. Edwards Secondary School.
3. **Kissy** (8.4789° N, -13.2120° W) — Kissy Road, Shell New Road, Eastern industrial & residential thoroughfares.
4. **Lumley** (8.4712° N, -13.2758° W) — Lumley Beach Road, Lumley Police Station, Juba Bridge connection.
5. **Wilkinson Road** (8.4750° N, -13.2640° W) — Western arterial commercial strip, banking hubs, Murray Town Junction.

### Spatial Distance Querying
The backend natively queries spatial geometry using PostGIS `ST_DWithin` and `ST_Distance`. When running on embedded SQLite, custom Python C-level bindings calculate great-circle distance via the Haversine formula:
$$d = 2R \arcsin \left( \sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)} \right)$$
where $R = 6371\text{ km}$.
