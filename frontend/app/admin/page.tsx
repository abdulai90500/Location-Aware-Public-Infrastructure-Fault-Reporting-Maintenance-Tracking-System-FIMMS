"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert, UserCheck, Filter, Search, RefreshCw, FileText,
  Activity, CheckCircle2, Clock, AlertTriangle, Download
} from "lucide-react";
import { api } from "@/lib/api";
import { FaultReport, MaintenanceTeam, AnalyticsSummary } from "@/types";
import AnalyticsCards from "@/components/AnalyticsCards";
import ReportTable from "@/components/ReportTable";

export default function AdminPage() {
  const [reports, setReports] = useState<FaultReport[]>([]);
  const [teams, setTeams] = useState<MaintenanceTeam[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "assigned" | "audit">("all");
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [communityFilter, setCommunityFilter] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [allReports, allTeams, stats] = await Promise.all([
        api.getReports({
          search: searchTerm || undefined,
          status: statusFilter || (activeTab === "pending" ? "Submitted" : activeTab === "assigned" ? "Assigned" : undefined),
          community: communityFilter || undefined,
        }),
        api.getMaintenanceTeams(),
        api.getAnalyticsSummary(),
      ]);

      setReports(allReports);
      setTeams(allTeams);
      setSummary(stats);

      if (activeTab === "audit") {
        const logs = await api.getAuditLogs();
        setAuditLogs(logs);
      }

      setLoading(false);
    } catch (err) {
      console.error("Admin data error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, statusFilter, communityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleAssignTeam = async (reportId: number, teamId: number, instructions: string) => {
    try {
      await api.assignMaintenanceTeam(reportId, teamId, undefined, instructions);
      loadData();
    } catch (err: any) {
      alert("Error assigning team: " + err.message);
    }
  };

  const handleStatusChange = async (reportId: number, newStatus: string, notes: string) => {
    try {
      await api.updateReportStatus(reportId, newStatus, notes);
      loadData();
    } catch (err: any) {
      alert("Error updating status: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <ShieldAlert className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Centralized Fault Management Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Western Area Urban municipal operations: review citizen complaints, verify duplicates, set priority, and dispatch field units.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={api.getExportCsvUrl(statusFilter, communityFilter)}
            download="freetown_infrastructure_reports.csv"
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs font-semibold shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Report</span>
          </a>

          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold shadow-sm transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <AnalyticsCards summary={summary} loading={loading} />

      {/* Main Filter & Tabs Header */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "all", label: "All Complaints", count: reports.length },
              { id: "pending", label: "Pending Verification", count: summary?.submitted || 0 },
              { id: "assigned", label: "Assigned Tasks", count: summary?.assigned || 0 },
              { id: "audit", label: "Audit Trail", count: undefined },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "bg-slate-900 dark:bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === tab.id ? "bg-slate-800 dark:bg-emerald-700 text-slate-200" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search complaint, tracking #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
            >
              Filter
            </button>
          </form>
        </div>

        {/* Content Area */}
        {activeTab === "audit" ? (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">System Audit &amp; Compliance Trail</h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
              {auditLogs.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 italic">No audit records found.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3.5 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-200 uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">
                          {log.action}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Entity: {log.entity_type} #{log.entity_id}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {JSON.stringify(log.details)}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <ReportTable
            reports={reports}
            teams={teams}
            isAdmin={true}
            onAssignTeam={handleAssignTeam}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </div>
  );
}
