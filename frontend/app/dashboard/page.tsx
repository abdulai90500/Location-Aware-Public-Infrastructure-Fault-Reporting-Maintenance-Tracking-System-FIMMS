"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity, ShieldAlert, Wrench, CheckCircle2, MapPin, PlusCircle,
  Search, Printer, Download, ArrowRight, Clock, AlertTriangle,
  Flame, Filter, Eye, RefreshCw, Sparkles, Building2, Mic, Volume2,
  User as UserIcon, Lock, CheckCircle
} from "lucide-react";
import { api } from "@/lib/api";
import { FaultReport, MaintenanceTeam, AnalyticsSummary, HotspotCluster, User } from "@/types";
import AnalyticsCards from "@/components/AnalyticsCards";
import StatusBadge from "@/components/StatusBadge";
import MapView from "@/components/MapView";

export default function DashboardPage() {
  const [reports, setReports] = useState<FaultReport[]>([]);
  const [teams, setTeams] = useState<MaintenanceTeam[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [hotspots, setHotspots] = useState<HotspotCluster[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const user = api.getCurrentUser();
      setCurrentUser(user);

      if (user && user.role === "citizen") {
        // Strict citizen isolation: Citizen sees their account only!
        const [myReports, stats] = await Promise.all([
          api.getMyReports().catch(() => api.getReports({ mine: true })),
          api.getAnalyticsSummary().catch(() => null),
        ]);
        setReports(myReports || []);
        setSummary(stats);
        setTeams([]);
        setHotspots([]);
        setLoading(false);
        return;
      }

      const [allReports, allTeams, stats, clusters] = await Promise.all([
        api.getReports({ limit: 50 }),
        api.getMaintenanceTeams(),
        api.getAnalyticsSummary(),
        api.getHotspots(),
      ]);
      setReports(allReports);
      setTeams(allTeams);
      setSummary(stats);
      setHotspots(clusters || []);
      setLoading(false);
    } catch (err) {
      console.error("Dashboard data load error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const pendingReports = reports.filter((r) => r.status === "Submitted" || r.status === "Under Review");
  const inProgressReports = reports.filter((r) => r.status === "Assigned" || r.status === "In Progress");
  const resolvedReports = reports.filter((r) => r.status === "Resolved");

  // Dedicated Citizen Account View (Isolated to user's reports only)
  if (currentUser && currentUser.role === "citizen") {
    const myTotal = reports.length;
    const mySolved = reports.filter((r) => r.status === "Resolved" || r.status === "Closed").length;
    const myActive = reports.filter((r) => r.status === "In Progress" || r.status === "Assigned").length;
    const myPending = reports.filter((r) => r.status === "Submitted" || r.status === "Under Review").length;

    return (
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Citizen Account Profile Header */}
        <div className="bg-white dark:bg-[#1E293B] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-sky-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                {currentUser.full_name ? currentUser.full_name.charAt(0) : "C"}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {currentUser.full_name}
                  </h1>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    Citizen Account
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {currentUser.email} &bull; Western Area Urban Resident
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                href="/report-fault"
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Report New Fault</span>
              </Link>
              <button
                onClick={loadData}
                disabled={loading}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
                title="Refresh My Reports"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Account Privacy & Isolation Notice */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
            <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Personal Account Isolation:</strong> You are viewing only the complaints and tracking dockets registered under your citizen profile.
            </span>
          </div>
        </div>

        {/* Citizen Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Reported
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {myTotal}
            </div>
          </div>
          <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Solved &amp; Verified
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
              {mySolved}
            </div>
          </div>
          <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Active Repairs
            </span>
            <div className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-300 mt-1">
              {myActive}
            </div>
          </div>
          <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Under Review
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-300 mt-1">
              {myPending}
            </div>
          </div>
        </div>

        {/* My Reported Faults Table */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <Wrench className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                My Lodged Complaints ({reports.length})
              </h3>
            </div>
            <Link
              href="/track-report"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
            >
              <span>Track All Statuses</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Tracking Number</th>
                  <th className="py-2.5 px-3">Incident Title &amp; Community</th>
                  <th className="py-2.5 px-3">Date Submitted</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="max-w-sm mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                          <PlusCircle className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          No Fault Reports Lodged Yet
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Spot a pothole, burst water pipe, or broken streetlight? Report it instantly using your microphone or photos.
                        </p>
                        <Link
                          href="/report-fault"
                          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md"
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span>Lodge a Report Now</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  reports.map((r) => {
                    const hasAudio = r.images?.some(
                      (img) =>
                        img.image_type === "audio_note" ||
                        img.image_url?.endsWith(".webm") ||
                        img.image_url?.endsWith(".wav") ||
                        img.image_url?.endsWith(".mp3")
                    );

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                          <Link href={`/track-report?tracking=${r.tracking_number}`} className="hover:underline">
                            {r.tracking_number}
                          </Link>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                            <span>{r.title}</span>
                            {hasAudio && (
                              <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold" title="Voice note attached">
                                <Volume2 className="w-3 h-3" />
                                <span>Voice Note</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            📍 {r.community} {r.location_name ? `• ${r.location_name}` : ""}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {new Date(r.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={r.status} size="sm" />
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            href={`/track-report?tracking=${r.tracking_number}`}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center space-x-1 transition shadow-xs"
                          >
                            <span>Track</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Printable Header (Visible only when printing) */}
      <div className="hidden print:block mb-8 border-b-2 border-slate-900 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black uppercase text-slate-900">
              Freetown City Council &bull; Municipal Works Department
            </h1>
            <p className="text-xs text-slate-600">
              Freetown Infrastructure Monitoring and Maintenance System (FIMMS)
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Western Area Urban Operational Summary &bull; Printed: {new Date().toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs font-bold border border-slate-300 px-2.5 py-1 rounded">
              OFFICIAL DISPATCH RECORD
            </span>
          </div>
        </div>
      </div>

      {/* Top Welcome & Actions Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Municipal Operations Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
              Live Pilot
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time urban infrastructure incident tracking across Western Area Urban communities.
          </p>
        </div>

        {/* Action Toolbar: Print, CSV, Report */}
        <div className="flex flex-wrap items-center gap-2 no-print">
          {currentUser?.role === "administrator" && (
            <Link
              href="/admin/reports"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>All Reports &amp; Fixed</span>
            </Link>
          )}
          <a
            href={api.getExportCsvUrl()}
            download="freetown_infrastructure_reports.csv"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition shadow-sm"
            title="Download CSV database export"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Export CSV</span>
          </a>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition shadow-sm"
            title="Print or export to PDF"
          >
            <Printer className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Print PDF</span>
          </button>

          <Link
            href="/report-fault"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Fault</span>
          </Link>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
            title="Refresh Dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <AnalyticsCards summary={summary} loading={loading} />

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Quick Triage & Active Operations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Work Orders Table */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Active Municipal Incidents ({reports.length})
                </h3>
              </div>
              <Link
                href="/admin/reports"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
              >
                <span>View All &amp; Fixed Reports</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3">Incident &amp; Location</th>
                    <th className="py-2.5 px-3">Severity</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                        No active complaints registered.
                      </td>
                    </tr>
                  ) : (
                    reports.slice(0, 5).map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                          <Link href={`/track-report?tracking=${r.tracking_number}`} className="hover:underline">
                            {r.tracking_number}
                          </Link>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{r.title}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            📍 {r.community} {r.location_name ? `• ${r.location_name}` : ""}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              r.severity === "critical"
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                : r.severity === "high"
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                          >
                            {r.severity}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={r.status} size="sm" />
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            href={`/track-report?tracking=${r.tracking_number}`}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition inline-block"
                            title="Inspect docket"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fixed & Solved Reports Overview */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-3xl p-6 border border-emerald-200 dark:border-emerald-800/80 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200/70 dark:border-emerald-800/60">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-black text-emerald-950 dark:text-emerald-200 uppercase tracking-wider">
                  Fixed &amp; Solved Infrastructure Reports (
                  {reports.filter((r) => r.status === "Resolved" || r.status === "Closed").length})
                </h3>
              </div>
              <Link
                href="/admin/reports"
                className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center space-x-1"
              >
                <span>Open Full Fixed Registry</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {reports.filter((r) => r.status === "Resolved" || r.status === "Closed").length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-500 italic">
                  No completed repairs recorded yet.
                </div>
              ) : (
                reports
                  .filter((r) => r.status === "Resolved" || r.status === "Closed")
                  .slice(0, 4)
                  .map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#1E293B] border border-emerald-200/80 dark:border-emerald-800/60"
                    >
                      <div className="space-y-0.5 min-w-0 pr-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                            {r.tracking_number}
                          </span>
                          <StatusBadge status={r.status} size="sm" />
                        </div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {r.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          📍 {r.community} &bull; Updated {new Date(r.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Link
                        href={`/track-report?tracking=${r.tracking_number}`}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex-shrink-0 transition"
                      >
                        View Fix
                      </Link>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Quick Action Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
            <Link
              href="/admin"
              className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 border border-indigo-200 dark:border-indigo-800/60 hover:shadow-md transition space-y-2 block"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Admin Triage</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {pendingReports.length} complaints awaiting dispatch &amp; team allocation.
              </p>
            </Link>

            <Link
              href="/maintenance"
              className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/60 hover:shadow-md transition space-y-2 block"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Field Repairs</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {inProgressReports.length} work orders underway by rapid response units.
              </p>
            </Link>

            <Link
              href="/supervisor"
              className="p-5 rounded-3xl bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/40 dark:to-fuchsia-950/40 border border-purple-200 dark:border-purple-800/60 hover:shadow-md transition space-y-2 block"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Supervisor Hub</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {resolvedReports.length} completed repairs awaiting final sign-off stamp.
              </p>
            </Link>
          </div>
        </div>

        {/* Right Column (1 Col): Spatial Hotspots & Map Preview */}
        <div className="space-y-6">
          {/* Spatial Risk Hotspot Feed */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Spatial Density Hotspots
                </h3>
              </div>
              <Link href="/map" className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline">
                View Map
              </Link>
            </div>

            <div className="space-y-3">
              {hotspots.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4">No risk clusters detected.</p>
              ) : (
                hotspots.slice(0, 4).map((h) => (
                  <div
                    key={h.cluster_id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{h.community}</span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                          h.risk_level === "Critical"
                            ? "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                            : h.risk_level === "High"
                            ? "bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-800"
                            : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                        }`}
                      >
                        {h.risk_level} Risk
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Primary: {h.predominant_category}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{h.fault_count} faults</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Municipal Units Contact */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors no-print">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Dispatched Rapid Units
            </h3>
            <div className="space-y-2 text-xs">
              {teams.slice(0, 3).map((t) => (
                <div key={t.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">{t.team_name}</div>
                    <div className="text-[10px] text-slate-400">{t.team_leader} &bull; {t.contact_number}</div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active"></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
