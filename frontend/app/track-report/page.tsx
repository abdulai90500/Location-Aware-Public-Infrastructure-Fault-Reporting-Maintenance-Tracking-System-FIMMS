"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search, MapPin, Calendar, Clock, AlertTriangle, CheckCircle2,
  Wrench, ShieldCheck, UserCheck, ArrowRight, Camera, ThumbsUp, Printer, Download,
  Sparkles, Check, CheckCircle, Filter, Eye, RefreshCw
} from "lucide-react";
import { api } from "@/lib/api";
import { FaultReport } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import MapView from "@/components/MapView";

function TrackReportContent() {
  const searchParams = useSearchParams();
  const initialTracking = searchParams.get("tracking") || "";
  const initialTab = searchParams.get("tab") || "all";
  
  const [trackingNumber, setTrackingNumber] = useState(initialTracking);
  const [report, setReport] = useState<FaultReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upvoting, setUpvoting] = useState(false);

  // Public Community Feed State
  const [feedReports, setFeedReports] = useState<FaultReport[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "solved" | "active" | "pending">(
    initialTab === "solved" ? "solved" : "all"
  );
  const [communityFilter, setCommunityFilter] = useState("");

  const reportDetailsRef = useRef<HTMLDivElement>(null);

  const loadFeedReports = async () => {
    try {
      setFeedLoading(true);
      const data = await api.getReports({ limit: 50 });
      setFeedReports(data || []);
      setFeedLoading(false);
    } catch (err) {
      console.warn("Feed reports load error:", err);
      setFeedLoading(false);
    }
  };

  useEffect(() => {
    loadFeedReports();
  }, []);

  const fetchReport = async (queryNumber: string) => {
    if (!queryNumber.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.trackReport(queryNumber);
      setReport(data);
      setLoading(false);
      setTimeout(() => {
        reportDetailsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      setError(err.message || "Failed to find fault report");
      setReport(null);
      setLoading(false);
    }
  };

  const handleSelectReport = (selected: FaultReport) => {
    setReport(selected);
    setTrackingNumber(selected.tracking_number);
    setError(null);
    setTimeout(() => {
      reportDetailsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleUpvote = async () => {
    if (!report) return;
    try {
      setUpvoting(true);
      const res = await api.upvoteReport(report.id);
      setReport({ ...report, upvote_count: res.upvote_count });
      setUpvoting(false);
      // update in feed list as well
      setFeedReports((prev) =>
        prev.map((r) => (r.id === report.id ? { ...r, upvote_count: res.upvote_count } : r))
      );
    } catch (err: any) {
      alert("Error endorsing: " + err.message);
      setUpvoting(false);
    }
  };

  useEffect(() => {
    if (initialTracking) {
      fetchReport(initialTracking);
    }
  }, [initialTracking]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReport(trackingNumber);
  };

  const steps = [
    "Submitted",
    "Under Review",
    "Assigned",
    "In Progress",
    "Resolved",
    "Closed"
  ];

  const currentStepIndex = report ? steps.indexOf(report.status) : -1;
  const isSolved = report ? (report.status === "Resolved" || report.status === "Closed") : false;

  // Filter feed reports
  const filteredFeed = feedReports.filter((r) => {
    if (communityFilter && r.community !== communityFilter) return false;
    if (activeTab === "solved") return r.status === "Resolved" || r.status === "Closed";
    if (activeTab === "active") return r.status === "In Progress" || r.status === "Assigned";
    if (activeTab === "pending") return r.status === "Submitted" || r.status === "Under Review";
    return true;
  });

  const solvedCount = feedReports.filter((r) => r.status === "Resolved" || r.status === "Closed").length;
  const activeCount = feedReports.filter((r) => r.status === "In Progress" || r.status === "Assigned").length;
  const pendingCount = feedReports.filter((r) => r.status === "Submitted" || r.status === "Under Review").length;

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header Search Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Freetown Infrastructure Tracking &amp; Resolution Hub</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Track &amp; View Infrastructure Faults
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Enter your reference tracking number or browse the community feed below to inspect live repair progress and verify solved municipal issues.
        </p>

        {/* Search Input Bar */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto pt-2 flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="e.g. FTN-2026-0001"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none uppercase shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
          >
            {loading ? "Searching..." : "Track"}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold text-center">
          {error}
        </div>
      )}

      {/* Selected Report Details View */}
      {report && (
        <div ref={reportDetailsRef} className="space-y-6 scroll-mt-24">
          {report.status === "Submitted" && (
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 text-xs font-semibold flex items-center space-x-3 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div>
                <strong>Report Lodged Successfully:</strong> Tracking reference <strong className="font-mono">{report.tracking_number}</strong> has been registered in the municipal intake queue and is pending administrative review.
              </div>
            </div>
          )}

          {/* SPECIAL CELEBRATION CALLOUT IF SOLVED / RESOLVED */}
          {isSolved && (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-teal-500/15 dark:from-emerald-950/60 dark:to-teal-950/40 border-2 border-emerald-500 dark:border-emerald-600 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
                <div className="flex items-center space-x-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-lg shadow-emerald-600/30">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                      Municipal Repair Completed &amp; Verified
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      THIS FAULT HAS BEEN OFFICIALLY SOLVED!
                    </h2>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase shadow-sm">
                    {report.status}
                  </span>
                  <span className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                    Quality Inspected
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 space-y-1">
                  <span className="font-bold text-slate-500 dark:text-slate-400 block">Physical Repair Status:</span>
                  <p className="text-slate-800 dark:text-slate-200 font-semibold">
                    Work completed on site by dispatched rapid maintenance team.
                  </p>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 space-y-1">
                  <span className="font-bold text-slate-500 dark:text-slate-400 block">Latest Maintenance Action:</span>
                  <p className="text-slate-800 dark:text-slate-200 font-semibold line-clamp-2">
                    {report.updates?.[report.updates.length - 1]?.work_description || "Surface excavation, resurfacing and debris clearance completed."}
                  </p>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 space-y-1">
                  <span className="font-bold text-slate-500 dark:text-slate-400 block">Supervisor Sign-Off:</span>
                  <p className="text-emerald-700 dark:text-emerald-400 font-bold">
                    Quality standards verified by Freetown Urban Infrastructure Directorate.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Header Card */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Report Reference</span>
                <h2 className="text-2xl font-mono font-black text-slate-900 dark:text-white">{report.tracking_number}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="no-print flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition"
                  title="Print Docket / Save as PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Print PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handleUpvote}
                  disabled={upvoting}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-800 dark:hover:text-emerald-300 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
                  title="Click to endorse this report"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{report.upvote_count || 0} Endorsements</span>
                </button>
                <StatusBadge status={report.status} size="lg" />
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-black uppercase ${
                    report.severity === "critical"
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                      : report.severity === "high"
                      ? "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {report.severity} Severity
                </span>
              </div>
            </div>

            {/* Lifecycle Progress Stepper */}
            <div className="py-4">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Lifecycle Progression
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {steps.map((st, idx) => {
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = report.status === st;
                  return (
                    <div
                      key={st}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        isCurrent
                          ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 font-bold shadow-sm"
                          : isDone
                          ? "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                          : "border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 font-normal"
                      }`}
                    >
                      <div className={`w-5 h-5 mx-auto rounded-full text-[10px] flex items-center justify-center font-bold mb-1 ${
                        isCurrent
                          ? "bg-emerald-600 text-white"
                          : isDone
                          ? "bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600"
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="text-[11px] leading-tight">{st}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fault Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{report.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                  {report.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Category:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{report.category?.category_name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Community:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{report.community}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Landmark / Location:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{report.landmark || report.location_name || "Tagged on map"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Logged On:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{new Date(report.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Map Preview */}
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Location Pin:</span>
                  <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                  </span>
                </div>
                <MapView
                  markers={[
                    {
                      id: report.id,
                      tracking_number: report.tracking_number,
                      title: report.title,
                      category_id: report.category_id,
                      category_name: report.category?.category_name || "Infrastructure",
                      category_icon: report.category?.icon || "wrench",
                      latitude: report.latitude,
                      longitude: report.longitude,
                      community: report.community,
                      location_name: report.location_name,
                      severity: report.severity,
                      status: report.status,
                      created_at: report.created_at,
                    },
                  ]}
                  center={[report.latitude, report.longitude]}
                  zoom={15}
                  height="220px"
                />
              </div>
            </div>
          </div>

          {/* Photographic Evidence Gallery */}
          {report.images && report.images.length > 0 && (
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Photographic Evidence</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {report.images.map((img) => (
                  <div key={img.id} className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 space-y-2 p-2">
                    <img
                      src={img.image_url}
                      alt={img.caption || "Fault evidence"}
                      className="w-full h-44 object-cover rounded-xl"
                    />
                    <div className="px-1 text-[11px]">
                      <span className="font-bold text-slate-700 dark:text-slate-200 capitalize">
                        {img.image_type.replace("_", " ")}:
                      </span>{" "}
                      <span className="text-slate-500 dark:text-slate-400">{img.caption}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maintenance Progress & Work Updates */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <Wrench className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Maintenance &amp; Repair Updates</h3>
            </div>

            {report.updates && report.updates.length > 0 ? (
              <div className="space-y-3">
                {report.updates.map((upd) => (
                  <div key={upd.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <StatusBadge status={upd.status} size="sm" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {upd.officer?.full_name || "Field Maintenance Team"}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(upd.updated_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {upd.work_description}
                    </p>
                    {upd.materials_used && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                        <strong>Materials / Equipment Used:</strong> {upd.materials_used}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                No on-site maintenance updates logged yet. The report is awaiting inspection or crew dispatch.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PUBLIC PLACE TO VIEW, BROWSE & READ ALL FAULTS AND SOLVED ISSUES */}
      {/* ========================================================================= */}
      <section className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
              <Eye className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Public Infrastructure Complaints &amp; Solved Issues Hub</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Browse, view, and read all reported faults in Western Area Urban. Check which problems have been officially solved.
            </p>
          </div>

          <button
            type="button"
            onClick={loadFeedReports}
            disabled={feedLoading}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${feedLoading ? "animate-spin" : ""}`} />
            <span>Refresh List</span>
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-slate-900 dark:bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              All Complaints ({feedReports.length})
            </button>
            <button
              onClick={() => setActiveTab("solved")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === "solved"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800"
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Solved &amp; Closed ({solvedCount})</span>
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === "active"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Active Repairs ({activeCount})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === "pending"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Pending ({pendingCount})
            </button>
          </div>

          {/* Community Filter */}
          <select
            value={communityFilter}
            onChange={(e) => setCommunityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="">All Communities</option>
            <option value="Central Freetown">Central Freetown</option>
            <option value="Congo Cross">Congo Cross</option>
            <option value="Kissy">Kissy</option>
            <option value="Lumley">Lumley</option>
            <option value="Wilkinson Road">Wilkinson Road</option>
          </select>
        </div>

        {/* List of Fault Reports */}
        <div className="space-y-3">
          {feedLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading infrastructure reports...</div>
          ) : filteredFeed.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 italic">
              No reports match the selected filter.
            </div>
          ) : (
            filteredFeed.map((item) => {
              const itemSolved = item.status === "Resolved" || item.status === "Closed";
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectReport(item)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    report?.id === item.id
                      ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20"
                      : itemSolved
                      ? "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20 hover:border-emerald-400"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-black text-slate-500 dark:text-slate-400">
                        {item.tracking_number}
                      </span>
                      <StatusBadge status={item.status} size="sm" />
                      {itemSolved && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-600 text-white shadow-xs">
                          Fixed &amp; Solved
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">&bull; {item.community}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {item.description}
                    </p>

                    <div className="flex items-center space-x-3 text-[11px] text-slate-400 pt-0.5">
                      <span>Category: <strong className="text-slate-700 dark:text-slate-300">{item.category?.category_name}</strong></span>
                      <span>&bull;</span>
                      <span>Endorsements: <strong className="text-slate-700 dark:text-slate-300">{item.upvote_count || 0}</strong></span>
                      <span>&bull;</span>
                      <span>Logged: {new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center space-x-1"
                    >
                      <span>Read Full Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

export default function TrackReportPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-xs text-slate-400">Loading tracking portal...</div>}>
      <TrackReportContent />
    </Suspense>
  );
}
