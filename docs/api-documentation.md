# FIMMS - REST API Documentation
## Location-Aware Public Infrastructure Fault Reporting and Maintenance Tracking System
### FastAPI Swagger UI: `http://localhost:8000/docs`

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Citizen Registration
- **Method**: `POST`
- **Endpoint**: `/api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "full_name": "Aminata Kamara",
  "email": "aminata.kamara@gmail.com",
  "phone": "+232 78 123 456",
  "password": "Password123!",
  "role": "citizen"
}
```
- **Response** (`201 Created`):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "bearer",
  "user": {
    "id": 5,
    "full_name": "Aminata Kamara",
    "email": "aminata.kamara@gmail.com",
    "phone": "+232 78 123 456",
    "role": "citizen",
    "created_at": "2026-11-24T10:00:00Z"
  }
}
```

### 1.2 User Login
- **Method**: `POST`
- **Endpoint**: `/api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "admin@freetown.gov.sl",
  "password": "Freetown2026!"
}
```
- **Response** (`200 OK`):
Returns JWT Bearer token and user details.

---

## 2. Infrastructure Categories (`/api/categories`)

### 2.1 List Categories
- **Method**: `GET`
- **Endpoint**: `/api/categories`
- **Response**: Array of categories with SLA hours:
  - Road damage (48h)
  - Streetlights (24h)
  - Drainage systems (36h)
  - Water infrastructure (12h)
  - Public walkways (72h)
  - Waste facilities (24h)

---

## 3. Fault Reports (`/api/reports`)

### 3.1 Submit New Fault Report
- **Method**: `POST`
- **Endpoint**: `/api/reports`
- **Access**: Public or Authenticated (Attaches citizen ID if logged in)
- **Request Body**:
```json
{
  "category_id": 1,
  "title": "Severe pothole near Lumley roundabout",
  "description": "Deep asphalt erosion obstructing westbound traffic lane.",
  "latitude": 8.4712,
  "longitude": -13.2758,
  "community": "Lumley",
  "location_name": "Lumley Beach Road",
  "landmark": "Near Lumley Police Station",
  "severity": "high"
}
```
- **Response** (`201 Created`):
Returns report object with unique `tracking_number` (e.g. `FTN-2026-0001`) and initial status `Submitted`.

### 3.2 List Fault Reports
- **Method**: `GET`
- **Endpoint**: `/api/reports`
- **Query Parameters**:
  - `category_id`: Integer
  - `status`: String (`Submitted`, `Under Review`, `Assigned`, `In Progress`, `Resolved`, `Closed`)
  - `community`: String (`Central Freetown`, `Congo Cross`, `Kissy`, `Lumley`, `Wilkinson Road`)
  - `severity`: String (`low`, `medium`, `high`, `critical`)
  - `search`: String (searches title, description, tracking number, landmark)

### 3.3 Public Tracking by Reference Number
- **Method**: `GET`
- **Endpoint**: `/api/reports/track/{tracking_number}`
- **Access**: Public
- **Example**: `/api/reports/track/FTN-2026-0001`
- **Response**: Full report timeline, assigned team, updates, and photos.

### 3.4 Update Report Status
- **Method**: `PATCH`
- **Endpoint**: `/api/reports/{id}/status`
- **Access**: Authenticated (`administrator`, `supervisor`, `maintenance_officer`)
- **Request Body**:
```json
{
  "status": "In Progress",
  "notes": "Crew arrived on-site and began desilting.",
  "severity": "critical"
}
```

### 3.5 Upload Photographic Evidence
- **Method**: `POST`
- **Endpoint**: `/api/reports/{id}/images`
- **Form Data**:
  - `file`: Image binary (JPEG, PNG, WEBP)
  - `image_type`: `initial` | `before_repair` | `after_repair`
  - `caption`: Description string

---

## 4. GIS & Location Management (`/api/map`)

### 4.1 Retrieve Map Fault Markers
- **Method**: `GET`
- **Endpoint**: `/api/map/faults`
- **Query Parameters**: `category_id`, `status`, `community`, `severity`
- **Response**: Array of markers formatted for Leaflet OpenStreetMap.

### 4.2 Proximity Search (Nearby Faults)
- **Method**: `GET`
- **Endpoint**: `/api/map/nearby`
- **Query Parameters**:
  - `lat`: Float
  - `lng`: Float
  - `radius_km`: Float (defaults to 5.0 km)
- **Engine**: PostGIS `ST_DWithin` or SQLite Haversine.

---

## 5. Maintenance Operations

### 5.1 List Maintenance Teams
- **Method**: `GET`
- **Endpoint**: `/api/maintenance/teams`

### 5.2 Assign Task to Maintenance Team
- **Method**: `POST`
- **Endpoint**: `/api/assignments`
- **Access**: `administrator`, `supervisor`
- **Request Body**:
```json
{
  "report_id": 1,
  "team_id": 1,
  "due_date": "2026-11-26T18:00:00Z",
  "instructions": "Apply asphalt cold-mix and compact road surface."
}
```

### 5.3 View Assigned Tasks
- **Method**: `GET`
- **Endpoint**: `/api/assignments/my-tasks`
- **Access**: Authenticated

### 5.4 Submit Work Progress Update
- **Method**: `POST`
- **Endpoint**: `/api/maintenance/updates`
- **Access**: `maintenance_officer`, `administrator`, `supervisor`
- **Request Body**:
```json
{
  "report_id": 1,
  "status": "Resolved",
  "work_description": "Pothole filled with 2 tons asphalt cold mix and steam-rolled.",
  "materials_used": "Asphalt cold-mix, primer emulsion",
  "hours_spent": 3.5
}
```

---

## 6. Analytics & Performance (`/api/analytics`)

### 6.1 Summary Metrics
- **Method**: `GET`
- **Endpoint**: `/api/analytics/summary`
- **Returns**: Counts of total, submitted, under review, assigned, in progress, resolved, closed, and average resolution time in hours.

### 6.2 Community Distribution
- **Method**: `GET`
- **Endpoint**: `/api/analytics/community`

### 6.3 Category Breakdown
- **Method**: `GET`
- **Endpoint**: `/api/analytics/category`

### 6.4 Team Performance Metrics
- **Method**: `GET`
- **Endpoint**: `/api/analytics/teams`
