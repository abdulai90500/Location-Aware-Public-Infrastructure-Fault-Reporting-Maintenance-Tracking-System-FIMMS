-- ==============================================================================
-- Freetown Infrastructure Monitoring and Maintenance System (FIMMS)
-- Database: freetown_infrastructure_db
-- Dialect: PostgreSQL 14+ with PostGIS Extension
-- Case Study: Western Area Urban, Freetown, Sierra Leone
-- ==============================================================================

-- 1. Enable PostGIS extension for spatial queries and location operations
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Clean teardown (for fresh installs/migrations)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS maintenance_updates CASCADE;
DROP TABLE IF EXISTS maintenance_assignments CASCADE;
DROP TABLE IF EXISTS maintenance_teams CASCADE;
DROP TABLE IF EXISTS report_images CASCADE;
DROP TABLE IF EXISTS fault_reports CASCADE;
DROP TABLE IF EXISTS infrastructure_categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 3. Users Table (Role-based access control)
-- Roles: citizen, administrator, maintenance_officer, supervisor
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('citizen', 'administrator', 'maintenance_officer', 'supervisor')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 4. Infrastructure Categories
CREATE TABLE infrastructure_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'wrench',
    default_sla_hours INTEGER DEFAULT 72,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Fault Reports Table (with PostGIS Point geometry)
-- Statuses: Submitted, Under Review, Assigned, In Progress, Resolved, Closed, Rejected, On Hold, Reopened
CREATE TABLE fault_reports (
    id SERIAL PRIMARY KEY,
    tracking_number VARCHAR(50) NOT NULL UNIQUE,
    citizen_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    category_id INTEGER NOT NULL REFERENCES infrastructure_categories(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOGRAPHY(Point, 4326),
    location_name VARCHAR(255),
    community VARCHAR(100) NOT NULL,
    landmark VARCHAR(255),
    severity VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(30) NOT NULL DEFAULT 'Submitted' CHECK (status IN (
        'Submitted',
        'Under Review',
        'Assigned',
        'In Progress',
        'Resolved',
        'Closed',
        'Rejected',
        'On Hold',
        'Reopened'
    )),
    upvote_count INTEGER NOT NULL DEFAULT 0,
    ai_classification JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fault_reports_tracking ON fault_reports(tracking_number);
CREATE INDEX idx_fault_reports_status ON fault_reports(status);
CREATE INDEX idx_fault_reports_community ON fault_reports(community);
CREATE INDEX idx_fault_reports_category ON fault_reports(category_id);
CREATE INDEX idx_fault_reports_citizen ON fault_reports(citizen_id);
CREATE INDEX idx_fault_reports_created ON fault_reports(created_at DESC);
CREATE INDEX idx_fault_reports_geom ON fault_reports USING GIST(geom);

-- Trigger to automatically populate PostGIS geom from latitude and longitude
CREATE OR REPLACE FUNCTION update_fault_report_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fault_reports_geom
BEFORE INSERT OR UPDATE OF latitude, longitude ON fault_reports
FOR EACH ROW
EXECUTE FUNCTION update_fault_report_geom();

-- 6. Report Images
-- Types: initial (citizen report), before_repair, after_repair
CREATE TABLE report_images (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES fault_reports(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type VARCHAR(30) NOT NULL DEFAULT 'initial' CHECK (image_type IN ('initial', 'before_repair', 'after_repair')),
    caption VARCHAR(255),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_report_images_report ON report_images(report_id);
CREATE INDEX idx_report_images_type ON report_images(image_type);

-- 7. Maintenance Teams
CREATE TABLE maintenance_teams (
    id SERIAL PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL UNIQUE,
    team_leader VARCHAR(100) NOT NULL,
    contact_number VARCHAR(50) NOT NULL,
    department VARCHAR(100) NOT NULL,
    community_focus VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Maintenance Assignments
CREATE TABLE maintenance_assignments (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES fault_reports(id) ON DELETE CASCADE,
    team_id INTEGER NOT NULL REFERENCES maintenance_teams(id) ON DELETE CASCADE,
    assigned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP WITH TIME ZONE,
    instructions TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled'))
);

CREATE INDEX idx_maintenance_assignments_report ON maintenance_assignments(report_id);
CREATE INDEX idx_maintenance_assignments_team ON maintenance_assignments(team_id);
CREATE INDEX idx_maintenance_assignments_status ON maintenance_assignments(status);

-- 9. Maintenance Updates (Work Progress Log)
CREATE TABLE maintenance_updates (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES fault_reports(id) ON DELETE CASCADE,
    officer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL,
    work_description TEXT NOT NULL,
    materials_used TEXT,
    hours_spent NUMERIC(5,2) DEFAULT 0.0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_maintenance_updates_report ON maintenance_updates(report_id);

-- 10. Notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_id INTEGER REFERENCES fault_reports(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- 11. Audit Logs (Compliance & Governance)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ==============================================================================
-- INITIAL SEED DATA
-- Freetown, Western Area Urban Pilot Deployment
-- Default password for all seed accounts: "Freetown2026!"
-- ==============================================================================

-- Seed Users
-- Password hash generated using PBKDF2-SHA256 (salt='freetown_salt') for "Freetown2026!"
-- Equivalent hash is also managed programmatically in backend auth.
INSERT INTO users (full_name, email, phone, password_hash, role) VALUES
('Freetown City Administrator', 'admin@freetown.gov.sl', '+232 76 100 001', 'pbkdf2:sha256:10000$saltsalt$27c5bb6f777e4cfd14e1a6be1a07bb9007f9c2d1b7dd612c2a041f16d7a4cb2d', 'administrator'),
('Urban Infrastructure Supervisor', 'supervisor@freetown.gov.sl', '+232 76 100 002', 'pbkdf2:sha256:10000$saltsalt$27c5bb6f777e4cfd14e1a6be1a07bb9007f9c2d1b7dd612c2a041f16d7a4cb2d', 'supervisor'),
('FRDU Field Maintenance Officer', 'officer@freetown.gov.sl', '+232 76 100 003', 'pbkdf2:sha256:10000$saltsalt$27c5bb6f777e4cfd14e1a6be1a07bb9007f9c2d1b7dd612c2a041f16d7a4cb2d', 'maintenance_officer'),
('Aminata Kamara (Resident)', 'citizen@freetown.gov.sl', '+232 78 200 123', 'pbkdf2:sha256:10000$saltsalt$27c5bb6f777e4cfd14e1a6be1a07bb9007f9c2d1b7dd612c2a041f16d7a4cb2d', 'citizen');

-- Seed Infrastructure Categories (6 Required Categories)
INSERT INTO infrastructure_categories (category_name, description, icon, default_sla_hours) VALUES
('Road damage', 'Potholes, damaged roads, collapsed surfaces and asphalt deterioration', 'road', 48),
('Streetlights', 'Broken, non-functional or flickering public streetlights', 'lightbulb', 24),
('Drainage systems', 'Blocked drains, stormwater culverts, flooding hazards and silt accumulation', 'droplets', 36),
('Water infrastructure', 'Burst municipal pipes, leaking conduits and damaged water access points', 'wrench', 12),
('Public walkways', 'Broken pavements, pedestrian curbs, sidewalk erosion and missing slabs', 'footprints', 72),
('Waste facilities', 'Damaged public waste containers and overflowing collection points', 'trash-2', 24);

-- Seed Maintenance Teams
INSERT INTO maintenance_teams (team_name, team_leader, contact_number, department, community_focus) VALUES
('Freetown Roads & Drainage Unit (FRDU)', 'Mohamed Sesay', '+232 77 345 678', 'Ministry of Works & Public Assets', 'Western Area Urban Wide'),
('Guma Valley Rapid Water Response', 'Fatmata Bangura', '+232 88 234 567', 'Guma Valley Water Company', 'Central & West Freetown'),
('FCC Electrical & Streetlighting Team', 'Samuel Koroma', '+232 76 890 123', 'Freetown City Council', 'Central Freetown & Kissy'),
('Western Area Waste Management Taskforce', 'Ibrahim Conteh', '+232 99 456 789', 'FCC Waste Management Department', 'Kroo Town, Lumley & East');

-- Seed Fault Reports in Western Area Urban, Freetown
-- Central Freetown: 8.4840° N, -13.2340° W
-- Congo Cross: 8.4825° N, -13.2570° W
-- Kissy: 8.4789° N, -13.2120° W
-- Lumley: 8.4712° N, -13.2758° W
-- Wilkinson Road: 8.4750° N, -13.2640° W
INSERT INTO fault_reports (tracking_number, citizen_id, category_id, title, description, latitude, longitude, location_name, community, landmark, severity, status, created_at) VALUES
('FTN-2026-0001', 4, 1, 'Deep crater pothole obstructing traffic', 'A deep pothole has expanded across the westbound lane, causing vehicles to swerve dangerously into oncoming traffic.', 8.4712, -13.2758, 'Lumley Beach Road', 'Lumley', 'Near Lumley Police Station', 'high', 'Assigned', NOW() - INTERVAL '2 days'),
('FTN-2026-0002', 4, 3, 'Severely blocked stormwater culvert', 'Culvert blocked with silt, plastic debris and rocks. Heavy rains caused runoff to flood adjacent storefronts.', 8.4825, -13.2570, 'Congo Cross Roundabout', 'Congo Cross', 'Opposite St. Edwards School', 'critical', 'In Progress', NOW() - INTERVAL '3 days'),
('FTN-2026-0003', 4, 2, 'Row of non-functional solar streetlights', 'Four consecutive streetlight poles are dark every night, posing security concerns for pedestrians.', 8.4840, -13.2340, 'Siaka Stevens Street', 'Central Freetown', 'Near Cotton Tree and Bank of Sierra Leone', 'medium', 'Under Review', NOW() - INTERVAL '1 day'),
('FTN-2026-0004', 4, 4, 'High-pressure water main pipe rupture', 'Clean drinking water gushing onto the roadway from a fractured subterranean main pipe.', 8.4789, -13.2120, 'Kissy Road', 'Kissy', 'Adjacent to Kissy Health Centre', 'critical', 'Resolved', NOW() - INTERVAL '4 days'),
('FTN-2026-0005', 4, 5, 'Collapsed concrete pedestrian walkway slabs', 'Pedestrian slabs broken, leaving a 1-meter deep open drop next to the road.', 8.4750, -13.2640, 'Wilkinson Road', 'Wilkinson Road', 'Near Standard Chartered Bank branch', 'medium', 'Submitted', NOW() - INTERVAL '5 hours'),
('FTN-2026-0006', 4, 6, 'Overflowing waste collection skip container', 'Public skip container overflowing onto the road, creating environmental and sanitation hazards.', 8.4890, -13.2410, 'Kroo Town Road', 'Central Freetown', 'Near Kroo Town Community Market', 'high', 'Closed', NOW() - INTERVAL '6 days');

-- Seed Assignments
INSERT INTO maintenance_assignments (report_id, team_id, assigned_by, assigned_at, due_date, instructions, status) VALUES
(1, 1, 1, NOW() - INTERVAL '1 day', NOW() + INTERVAL '1 day', 'Deploy asphalt cold-mix and compact road bed immediately.', 'in_progress'),
(2, 1, 1, NOW() - INTERVAL '2 days', NOW() + INTERVAL '12 hours', 'Clear silt using vacuum excavator and inspect concrete walls.', 'in_progress'),
(4, 2, 1, NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days', 'Isolate water section, weld replacement sleeve, and restore pressure.', 'completed'),
(6, 4, 1, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', 'Evacuate skip container and disinfect surrounding area.', 'completed');

-- Seed Maintenance Updates
INSERT INTO maintenance_updates (report_id, officer_id, status, work_description, materials_used, hours_spent, updated_at) VALUES
(2, 3, 'In Progress', 'Excavated 3 metric tons of plastic waste and mud from the culvert inlet. Reinforcing steel mesh inspected.', 'Heavy excavator, shovels, safety barriers', 4.5, NOW() - INTERVAL '1 day'),
(4, 3, 'Resolved', 'Guma Valley crew replaced 6-meter ductile iron pipe section and re-sealed road surface.', '6m 150mm ductile iron pipe, rubber gaskets, asphalt patch', 6.0, NOW() - INTERVAL '2 days'),
(6, 3, 'Resolved', 'Waste skip evacuated, perimeter swept and disinfected with chlorine solution.', 'Waste compactor truck, disinfectant spray', 2.0, NOW() - INTERVAL '5 days');

-- Seed Audit Logs
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, created_at) VALUES
(4, 'REPORT_CREATED', 'fault_report', 1, '{"tracking_number": "FTN-2026-0001", "community": "Lumley"}', NOW() - INTERVAL '2 days'),
(1, 'REPORT_ASSIGNED', 'fault_report', 1, '{"team": "FRDU", "priority": "high"}', NOW() - INTERVAL '1 day'),
(3, 'WORK_LOGGED', 'fault_report', 2, '{"status": "In Progress", "hours": 4.5}', NOW() - INTERVAL '1 day'),
(2, 'REPORT_CLOSED', 'fault_report', 6, '{"verified_by": "supervisor@freetown.gov.sl", "outcome": "approved"}', NOW() - INTERVAL '4 days');
