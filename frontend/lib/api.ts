const API_BASE = typeof window !== "undefined" ? "" : "http://localhost:8000";

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("fimms_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    let errorDetail = "An unexpected error occurred";
    try {
      const err = await res.json();
      errorDetail = err.detail || err.message || JSON.stringify(err);
    } catch {
      errorDetail = await res.text();
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(res);
    if (typeof window !== "undefined" && data.access_token) {
      localStorage.setItem("fimms_token", data.access_token);
      localStorage.setItem("fimms_user", JSON.stringify(data.user));
    }
    return data;
  },

  async register(userData: { full_name: string; email: string; password: string; phone?: string; role?: string }) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await handleResponse(res);
    if (typeof window !== "undefined" && data.access_token) {
      localStorage.setItem("fimms_token", data.access_token);
      localStorage.setItem("fimms_user", JSON.stringify(data.user));
    }
    return data;
  },

  getCurrentUser() {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("fimms_user");
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("fimms_token");
      localStorage.removeItem("fimms_user");
      window.location.href = "/";
    }
  },

  // Categories
  async getCategories() {
    const res = await fetch(`${API_BASE}/api/categories`);
    return handleResponse(res);
  },

  // Fault Reports
  async getReports(params?: {
    category_id?: number;
    status?: string;
    community?: string;
    severity?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.category_id) query.append("category_id", String(params.category_id));
    if (params?.status) query.append("status", params.status);
    if (params?.community) query.append("community", params.community);
    if (params?.severity) query.append("severity", params.severity);
    if (params?.search) query.append("search", params.search);
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.offset) query.append("offset", String(params.offset));

    const res = await fetch(`${API_BASE}/api/reports?${query.toString()}`);
    return handleResponse(res);
  },

  async getReportById(id: number) {
    const res = await fetch(`${API_BASE}/api/reports/${id}`);
    return handleResponse(res);
  },

  async trackReport(trackingNumber: string) {
    const res = await fetch(`${API_BASE}/api/reports/track/${encodeURIComponent(trackingNumber.trim())}`);
    return handleResponse(res);
  },

  async createReport(reportData: {
    category_id: number;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    location_name?: string;
    community: string;
    landmark?: string;
    severity?: string;
    image_urls?: string[];
  }) {
    const res = await fetch(`${API_BASE}/api/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(reportData),
    });
    return handleResponse(res);
  },

  async updateReportStatus(reportId: number, status: string, notes?: string, severity?: string) {
    const res = await fetch(`${API_BASE}/api/reports/${reportId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ status, notes, severity }),
    });
    return handleResponse(res);
  },

  async uploadReportImage(reportId: number, file: File, imageType: string = "initial", caption?: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("image_type", imageType);
    if (caption) formData.append("caption", caption);

    const res = await fetch(`${API_BASE}/api/reports/${reportId}/images`, {
      method: "POST",
      headers: {
        ...getAuthHeader(),
      },
      body: formData,
    });
    return handleResponse(res);
  },

  // Map & GIS
  async getMapFaults(params?: { category_id?: number; status?: string; community?: string; severity?: string }) {
    const query = new URLSearchParams();
    if (params?.category_id) query.append("category_id", String(params.category_id));
    if (params?.status) query.append("status", params.status);
    if (params?.community) query.append("community", params.community);
    if (params?.severity) query.append("severity", params.severity);

    const res = await fetch(`${API_BASE}/api/map/faults?${query.toString()}`);
    return handleResponse(res);
  },

  // Maintenance & Teams
  async getMaintenanceTeams() {
    const res = await fetch(`${API_BASE}/api/maintenance/teams`);
    return handleResponse(res);
  },

  async assignMaintenanceTeam(reportId: number, teamId: number, dueDate?: string, instructions?: string) {
    const res = await fetch(`${API_BASE}/api/assignments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        report_id: reportId,
        team_id: teamId,
        due_date: dueDate || null,
        instructions: instructions || null,
      }),
    });
    return handleResponse(res);
  },

  async getMyTasks(statusFilter?: string) {
    const query = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : "";
    const res = await fetch(`${API_BASE}/api/assignments/my-tasks${query}`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    return handleResponse(res);
  },

  async submitMaintenanceUpdate(updateData: {
    report_id: number;
    status: string;
    work_description: string;
    materials_used?: string;
    hours_spent?: number;
  }) {
    const res = await fetch(`${API_BASE}/api/maintenance/updates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(updateData),
    });
    return handleResponse(res);
  },

  // Analytics
  async getAnalyticsSummary() {
    const res = await fetch(`${API_BASE}/api/analytics/summary`);
    return handleResponse(res);
  },

  async getCommunityStats() {
    const res = await fetch(`${API_BASE}/api/analytics/community`);
    return handleResponse(res);
  },

  async getCategoryStats() {
    const res = await fetch(`${API_BASE}/api/analytics/category`);
    return handleResponse(res);
  },

  async getTeamsPerformance() {
    const res = await fetch(`${API_BASE}/api/analytics/teams`);
    return handleResponse(res);
  },

  async getAuditLogs(entityType?: string) {
    const query = entityType ? `?entity_type=${encodeURIComponent(entityType)}` : "";
    const res = await fetch(`${API_BASE}/api/audit-logs${query}`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    return handleResponse(res);
  },

  // Duplicate Check & Citizen Endorsement
  async checkDuplicates(latitude: number, longitude: number, categoryId?: number, radiusMeters: number = 350) {
    const res = await fetch(`${API_BASE}/api/reports/check-duplicates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        latitude,
        longitude,
        category_id: categoryId || null,
        radius_meters: radiusMeters,
      }),
    });
    return handleResponse(res);
  },

  async upvoteReport(reportId: number) {
    const res = await fetch(`${API_BASE}/api/reports/${reportId}/upvote`, {
      method: "POST",
      headers: {
        ...getAuthHeader(),
      },
    });
    return handleResponse(res);
  },

  // AI Classification
  async classifyImage(file?: File, filenameHint?: string, descriptionHint?: string) {
    const formData = new FormData();
    if (file) formData.append("file", file);
    if (filenameHint) formData.append("filename_hint", filenameHint);
    if (descriptionHint) formData.append("description_hint", descriptionHint);

    const res = await fetch(`${API_BASE}/api/ai/classify-image`, {
      method: "POST",
      body: formData,
    });
    return handleResponse(res);
  },

  // Spatial Hotspots
  async getHotspots() {
    const res = await fetch(`${API_BASE}/api/map/hotspots`);
    return handleResponse(res);
  },

  // In-App Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE}/api/notifications`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    return handleResponse(res);
  },

  async markNotificationRead(notificationId: number) {
    const res = await fetch(`${API_BASE}/api/notifications/${notificationId}/read`, {
      method: "PATCH",
      headers: {
        ...getAuthHeader(),
      },
    });
    return handleResponse(res);
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/api/notifications/mark-all-read`, {
      method: "POST",
      headers: {
        ...getAuthHeader(),
      },
    });
    return handleResponse(res);
  },

  getExportCsvUrl(status?: string, community?: string) {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (community) params.append("community", community);
    return `${API_BASE}/api/reports/export/csv?${params.toString()}`;
  },
};
