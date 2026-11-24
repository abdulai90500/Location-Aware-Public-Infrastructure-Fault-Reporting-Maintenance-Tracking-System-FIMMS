export type UserRole = "citizen" | "administrator" | "maintenance_officer" | "supervisor";

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: number;
  category_name: string;
  description?: string;
  icon?: string;
  default_sla_hours: number;
}

export interface ReportImage {
  id: number;
  report_id: number;
  image_url: string;
  image_type: "initial" | "before_repair" | "after_repair";
  caption?: string;
  uploaded_at: string;
}

export interface MaintenanceTeam {
  id: number;
  team_name: string;
  team_leader: string;
  contact_number: string;
  department: string;
  community_focus?: string;
}

export interface MaintenanceAssignment {
  id: number;
  report_id: number;
  team_id: number;
  assigned_by?: number;
  assigned_at: string;
  due_date?: string;
  instructions?: string;
  status: "assigned" | "in_progress" | "completed" | "cancelled";
  team?: MaintenanceTeam;
}

export interface MaintenanceUpdate {
  id: number;
  report_id: number;
  officer_id?: number;
  status: string;
  work_description: string;
  materials_used?: string;
  hours_spent?: number;
  updated_at: string;
  officer?: User;
}

export interface FaultReport {
  id: number;
  tracking_number: string;
  citizen_id?: number;
  category_id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  community: string;
  landmark?: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "Submitted" | "Under Review" | "Assigned" | "In Progress" | "Resolved" | "Closed" | "Rejected" | "On Hold" | "Reopened";
  upvote_count?: number;
  ai_classification?: any;
  created_at: string;
  updated_at: string;
  category?: Category;
  citizen?: User;
  images?: ReportImage[];
  assignments?: MaintenanceAssignment[];
  updates?: MaintenanceUpdate[];
}

export interface NotificationItem {
  id: number;
  user_id: number;
  report_id?: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface HotspotCluster {
  cluster_id: string;
  community: string;
  centroid_lat: number;
  centroid_lng: number;
  fault_count: number;
  critical_count: number;
  predominant_category: string;
  risk_level: "Critical" | "High" | "Medium" | "Low";
  radius_meters: number;
}

export interface DuplicateCandidate {
  id: number;
  tracking_number: string;
  title: string;
  category_name: string;
  community: string;
  distance_meters: number;
  status: string;
  severity: string;
  upvote_count: number;
  created_at: string;
}

export interface AIClassificationResult {
  suggested_category_id: number;
  suggested_category_name: string;
  confidence: number;
  recommended_severity: string;
  detected_tags: string[];
  suggested_title: string;
  suggested_description: string;
  reasoning: string;
}

export interface MapMarker {
  id: number;
  tracking_number: string;
  title: string;
  category_id: number;
  category_name: string;
  category_icon: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  community: string;
  severity: string;
  status: string;
  thumbnail_url?: string;
  created_at: string;
}

export interface AnalyticsSummary {
  total_reports: number;
  submitted: number;
  under_review: number;
  assigned: number;
  in_progress: number;
  resolved: number;
  closed: number;
  avg_resolution_hours: number;
}

export interface CommunityStat {
  community: string;
  total: number;
  resolved: number;
  pending: number;
}

export interface CategoryStat {
  category_name: string;
  icon: string;
  count: number;
}
