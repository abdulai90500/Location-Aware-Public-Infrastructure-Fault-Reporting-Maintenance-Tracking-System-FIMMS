"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText, CheckCircle2, Wrench, Clock, Search, RefreshCw, Download,
  MapPin, UserCheck, Volume2, Camera, ArrowRight, ShieldCheck, LayoutDashboard,
  CheckCircle, Filter
} from "lucide-react";
import { api } from "@/lib/api";
import { FaultReport, MaintenanceTeam } from "@/types";
import StatusBadge from "@/components/StatusBadge";

export default function AdminAllReportsPage() {
  const [reports, setReports] = useState<FaultReport[]>([]);
  const [teams, setTeams] = useState<MaintenanceTeam[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeTab, setActiveTab] = useState<"all" | "fixed" | "active" | "pending">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [communityFilter, setCommunityFilter] = useState("");

  // Modal state for Quick Assign or Mark as Fixed
  const [selectedReport, setSelectedReport] = useState<FaultReport | null>(null);
  const [modalMode, setModalMode] = useState<"fix" | "assign" | null>(null);
  const [fixStatus, setFixStatus] = useState<"Resolved" | "Closed">("Resolved");
  const [fixNotes, setFixNotes] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<number | "">("");
  const [assignInstructions, setAssignInstructions] = useState("");
  const [actionSaving, setActionSaving] = useState(false);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [allReports, allTeams] = await Promise.all([
        api.getReports({ limit: 200 }),
        api.getMaintenanceTeams(),
      ]);
      setReports(allReports || []);
      setTeams(allTeams || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load all admin reports:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const isFixed = (status: string) => status === "Resolved" || status === "Closed";
  const isActive = (status: string) => status === "Assigned" || status === "In Progress";
  const isPending = (status: string) => status === "Submitted" || status === "Under Review";

  const totalCount = reports.length;
  const fixedCount = reports.filter((r) => isFixed(r.status)).length;
  const activeCount = reports.filter((r) => isActive(r.status)).length;
  const pendingCount = reports.filter((r) => isPending(r.status)).length;
  const fixedRate = totalCount > 0 ? Math.round((fixedCount / totalCount) * 100) : 0;

  const filteredReports = reports.filter((r) => {
    if (activeTab === "fixed" && !isFixed(r.status)) return false;
    if (activeTab === "active" && !isActive(r.status)) return false;
    if (activeTab === "pending" && !isPending(r.status)) return false;
    if (communityFilter && r.community !== communityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        r.tracking_number.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.community.toLowerCase().includes(q) ||
        (r.citizen?.full_name || "").toLowerCase().includes(q) ||
        (r.location_name || "").toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleOpenMarkFixed = (report: FaultReport) => {
    setSelectedReport(report);
    setModalMode("fix");
    setFixStatus("Resolved");
    setFixNotes("Infrastructure fault inspected and completely repaired by municipal crew.");
  };

  const handleOpenAssign = (report: FaultReport) => {
    setSelectedReport(report);
    setModalMode("assign");
    setSelectedTeamId(teams.length > 0 ? teams[0].id : "");
    setAssignInstructions("");
  };

  const handleConfirmFixed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    try {
      setActionSaving(true);
      await api.updateReportStatus(selectedReport.id, fixStatus, fixNotes);
      setActionSaving(false);
      setModalMode(null);
      setSelectedReport(null);
      loadAllData();
    } catch (err: any) {
      alert("Error marking report fixed: " + err.message);
      setActionSaving(false);
    }
  };

  const handleConfirmAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !selectedTeamId) return;
    try {
      setActionSaving(true);
      await api.assignMaintenanceTeam(selectedReport.id, Number(selectedTeamId), undefined, assignInstructions);
      setActionSaving(false);
      setModalMode(null);
      setSelectedReport(null);
      loadAllData();
    } catch (err: any) {
      alert("Error assigning team: " + err.message);
      setActionSaving(false);
    }
  };

  const communities = Array.from(new Set(reports.map((r) => r.community))).sort();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Admin All Reports &amp; Fixed Verification Hub
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Complete register of every citizen infrastructure report across Freetown — clearly showing fixed/solved works, active repairs, and pending complaints.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <a
            href={api.getExportCsvUrl(undefined, communityFilter || undefined)}
            download="freetown_all_reports.csv"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
          <button
            type="button"
            onClick={loadAllData}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white text-xs font-bold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab("all")}
          className="cursor-pointer bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-400 transition"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Reports
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {totalCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">All citywide submissions</div>
        </div>

        <div
          onClick={() => setActiveTab("fixed")}
          className="cursor-pointer bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/40 p-5 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 shadow-sm hover:scale-[1.01] transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Fixed &amp; Solved
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
            {fixedCount}
          </div>
          <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            {fixedRate}% Resolution Rate
          </div>
        </div>

        <div
          onClick={() => setActiveTab("active")}
          className="cursor-pointer bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Active Repairs
            </span>
            <Wrench className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-300 mt-1">
            {activeCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Assigned &amp; In Progress</div>
        </div>

        <div
          onClick={() => setActiveTab("pending")}
          className="cursor-pointer bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-400 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Pending Triage
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-300 mt-1">
            {pendingCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Awaiting dispatch</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#1E293B] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Filter Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 lg:pb-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              All Reports ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab("fixed")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === "fixed"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100"
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Fixed &amp; Solved ({fixedCount})</span>
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === "active"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Active Repairs ({activeCount})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === "pending"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Pending ({pendingCount})
            </button>
          </div>

          {/* Search & Community Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tracking #, title, citizen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-60 pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={communityFilter}
              onChange={(e) => setCommunityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="">All Communities</option>
              {communities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            Loading complete municipal report registry...
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 italic">
            No reports match your selected filter criteria.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => {
              const reportFixed = isFixed(report.status);
              const latestUpdate =
                report.updates && report.updates.length > 0
                  ? report.updates[report.updates.length - 1]
                  : null;
              const latestAssignment =
                report.assignments && report.assignments.length > 0
                  ? report.assignments[report.assignments.length - 1]
                  : null;

              const audioAttachments = (report.images || []).filter(
                (img) =>
                  img.image_type === "audio_note" ||
                  img.image_url?.endsWith(".webm") ||
                  img.image_url?.endsWith(".wav") ||
                  img.image_url?.endsWith(".mp3")
              );
              const photoAttachments = (report.images || []).filter(
                (img) => !audioAttachments.includes(img)
              );

              return (
                <div
                  key={report.id}
                  className={`rounded-2xl p-5 border transition-all space-y-4 ${
                    reportFixed
                      ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80 shadow-xs"
                      : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80"
                  }`}
                >
                  {/* Top Row: Tracking, Badges, Actions */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-700 text-white">
                          {report.tracking_number}
                        </span>
                        <StatusBadge status={report.status} size="sm" />
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            report.severity === "critical"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              : report.severity === "high"
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300"
                              : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                          }`}
                        >
                          {report.severity} Priority
                        </span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {report.category?.category_name}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white pt-1">
                        {report.title}
                      </h3>
                    </div>

                    {/* Admin Quick Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {!reportFixed && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenAssign(report)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 text-xs font-bold flex items-center space-x-1 transition"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Assign Crew</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenMarkFixed(report)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1 shadow-xs transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark as Fixed</span>
                          </button>
                        </>
                      )}
                      <Link
                        href={`/track-report?tracking=${report.tracking_number}`}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center space-x-1 transition"
                      >
                        <span>Full Docket</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Description & Metadata */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {report.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center space-x-1 font-semibold text-slate-700 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {report.community}
                        {report.location_name ? ` • ${report.location_name}` : ""}
                      </span>
                    </span>
                    <span>
                      Reported by:{" "}
                      <strong className="text-slate-700 dark:text-slate-200">
                        {report.citizen?.full_name || "Anonymous Citizen"}
                      </strong>
                    </span>
                    <span>Date: {new Date(report.created_at).toLocaleString()}</span>
                    {latestAssignment?.team && (
                      <span>
                        Crew:{" "}
                        <strong className="text-indigo-700 dark:text-indigo-300">
                          {latestAssignment.team.team_name}
                        </strong>
                      </span>
                    )}
                  </div>

                  {/* FIXED / SOLVED Verification Banner */}
                  {reportFixed && (
                    <div className="p-4 rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-wide">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>OFFICIALLY FIXED &amp; VERIFIED ({report.status})</span>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                          Updated: {new Date(report.updated_at).toLocaleString()}
                        </span>
                      </div>
                      {latestUpdate && (
                        <div className="text-xs text-emerald-950 dark:text-emerald-100 space-y-1 pt-1">
                          <p>
                            <strong>Repair Summary:</strong> {latestUpdate.work_description}
                          </p>
                          {(latestUpdate.materials_used || latestUpdate.hours_spent) && (
                            <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                              {latestUpdate.materials_used && (
                                <span>
                                  <strong>Materials:</strong> {latestUpdate.materials_used}{" "}
                                </span>
                              )}
                              {latestUpdate.hours_spent && (
                                <span>
                                  &bull; <strong>Labor:</strong> {latestUpdate.hours_spent} hrs
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Inline Citizen Voice Audio Player & Photos */}
                  {(audioAttachments.length > 0 || photoAttachments.length > 0) && (
                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200/70 dark:border-slate-700/60">
                      {audioAttachments.map((aud) => {
                        const url = aud.image_url.startsWith("http")
                          ? aud.image_url
                          : `${process.env.NEXT_PUBLIC_API_URL || ""}${aud.image_url}`;
                        return (
                          <div
                            key={aud.id}
                            className="flex items-center space-x-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800"
                          >
                            <Volume2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                              Voice Note:
                            </span>
                            <audio controls src={url} className="h-8 w-48 sm:w-60" />
                          </div>
                        );
                      })}

                      {photoAttachments.map((img) => {
                        const url = img.image_url.startsWith("http")
                          ? img.image_url
                          : `${process.env.NEXT_PUBLIC_API_URL || ""}${img.image_url}`;
                        return (
                          <a
                            key={img.id}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:border-emerald-500"
                          >
                            <Camera className="w-3.5 h-3.5 text-sky-600" />
                            <span>View Photo ({img.image_type.replace("_", " ")})</span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mark as Fixed Modal */}
      {modalMode === "fix" && selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Mark Report as Fixed: {selectedReport.tracking_number}
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {selectedReport.title} &bull; {selectedReport.community}
            </p>
            <form onSubmit={handleConfirmFixed} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Resolution Status
                </label>
                <select
                  value={fixStatus}
                  onChange={(e) => setFixStatus(e.target.value as "Resolved" | "Closed")}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none"
                >
                  <option value="Resolved">✓ Fixed (Resolved)</option>
                  <option value="Closed">✓ Fixed &amp; Officially Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Completion &amp; Verification Notes
                </label>
                <textarea
                  rows={3}
                  required
                  value={fixNotes}
                  onChange={(e) => setFixNotes(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSaving}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  {actionSaving ? "Saving..." : "Confirm Fixed & Solved"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Maintenance Crew Modal */}
      {modalMode === "assign" && selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Assign Maintenance Crew: {selectedReport.tracking_number}
            </h3>
            <form onSubmit={handleConfirmAssign} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Maintenance Unit
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.team_name} ({t.department})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Field Instructions
                </label>
                <textarea
                  rows={3}
                  value={assignInstructions}
                  onChange={(e) => setAssignInstructions(e.target.value)}
                  placeholder="Provide instructions for the field maintenance crew..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSaving}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  {actionSaving ? "Assigning..." : "Dispatch Crew"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
