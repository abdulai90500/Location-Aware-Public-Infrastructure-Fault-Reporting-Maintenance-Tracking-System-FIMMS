"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search, MapPin, Calendar, Clock, AlertTriangle, CheckCircle2,
  Wrench, ShieldCheck, UserCheck, ArrowRight, Camera, ThumbsUp, Printer, Download
} from "lucide-react";
import { api } from "@/lib/api";
import { FaultReport } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import MapView from "@/components/MapView";

function TrackReportContent() {
  const searchParams = useSearchParams();
  const initialTracking = searchParams.get("tracking") || "";
  
  const [trackingNumber, setTrackingNumber] = useState(initialTracking);
  const [report, setReport] = useState<FaultReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upvoting, setUpvoting] = useState(false);

  const fetchReport = async (queryNumber: string) => {
    if (!queryNumber.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.trackReport(queryNumber);
      setReport(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to find fault report");
      setReport(null);
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (!report) return;
    try {
      setUpvoting(true);
      const res = await api.upvoteReport(report.id);
      setReport({ ...report, upvote_count: res.upvote_count });
      setUpvoting(false);
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Track Infrastructure Fault Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Enter your unique reference tracking number (e.g. <span className="font-mono font-bold text-slate-900">FTN-2026-0001</span>) to view real-time inspection, repair updates, and verification progress.
        </p>

        {/* Search Input Bar */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto pt-4 flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="e.g. FTN-2026-0001"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition"
          >
            {loading ? "Searching..." : "Track"}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold text-center">
          {error}
        </div>
      )}

      {report && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Report Reference</span>
                <h2 className="text-2xl font-mono font-black text-slate-900 dark:text-white">{report.tracking_number}</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="no-print flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-bold transition"
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
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
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
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-sm"
                          : isDone
                          ? "border-slate-300 bg-slate-50 text-slate-700 font-medium"
                          : "border-slate-100 text-slate-300 font-normal"
                      }`}
                    >
                      <div className={`w-5 h-5 mx-auto rounded-full text-[10px] flex items-center justify-center font-bold mb-1 ${
                        isCurrent
                          ? "bg-emerald-600 text-white"
                          : isDone
                          ? "bg-slate-300 text-slate-700"
                          : "bg-slate-100 text-slate-300"
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
                <h3 className="text-base font-bold text-slate-900">{report.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {report.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Category:</span>
                    <p className="font-semibold text-slate-800">{report.category?.category_name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Community:</span>
                    <p className="font-semibold text-slate-800">{report.community}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Landmark / Location:</span>
                    <p className="font-semibold text-slate-800">{report.landmark || report.location_name || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Logged On:</span>
                    <p className="font-semibold text-slate-800">{new Date(report.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Map Preview */}
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                  <span>Location Pin:</span>
                  <span className="font-mono text-[11px] text-slate-600">
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
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-slate-600" />
                <h3 className="text-base font-bold text-slate-900">Photographic Evidence</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {report.images.map((img) => (
                  <div key={img.id} className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 space-y-2 p-2">
                    <img
                      src={img.image_url}
                      alt={img.caption || "Fault evidence"}
                      className="w-full h-44 object-cover rounded-xl"
                    />
                    <div className="px-1 text-[11px]">
                      <span className="font-bold text-slate-700 capitalize">
                        {img.image_type.replace("_", " ")}:
                      </span>{" "}
                      <span className="text-slate-500">{img.caption}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maintenance Progress & Work Updates */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <Wrench className="w-5 h-5 text-slate-600" />
              <h3 className="text-base font-bold text-slate-900">Maintenance &amp; Repair Updates</h3>
            </div>

            {report.updates && report.updates.length > 0 ? (
              <div className="space-y-3">
                {report.updates.map((upd) => (
                  <div key={upd.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <StatusBadge status={upd.status} size="sm" />
                        <span className="text-xs font-bold text-slate-800">
                          {upd.officer?.full_name || "Field Maintenance Team"}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(upd.updated_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {upd.work_description}
                    </p>
                    {upd.materials_used && (
                      <div className="text-[11px] text-slate-500 pt-1">
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

          {/* Official Municipal Quality Sign-off (Visible on Print / PDF Export) */}
          <div className="hidden print:block border-t-2 border-slate-900 pt-6 mt-8 space-y-4">
            <div className="grid grid-cols-3 gap-6 text-xs">
              <div className="border border-slate-300 p-3 rounded">
                <p className="font-bold">Reporting Resident:</p>
                <p className="text-slate-600 mt-2">{report.citizen?.full_name || "Verified Resident"}</p>
                <p className="text-[10px] text-slate-400 mt-6 border-t pt-1">Citizen Signature / Date</p>
              </div>
              <div className="border border-slate-300 p-3 rounded">
                <p className="font-bold">Lead Maintenance Officer:</p>
                <p className="text-slate-600 mt-2">{report.updates?.[0]?.officer?.full_name || "Dispatched Officer"}</p>
                <p className="text-[10px] text-slate-400 mt-6 border-t pt-1">Field Signature / Date</p>
              </div>
              <div className="border border-slate-300 p-3 rounded">
                <p className="font-bold">FCC Supervisor Sign-Off:</p>
                <p className="text-slate-600 mt-2">Quality Assurance Passed</p>
                <p className="text-[10px] text-slate-400 mt-6 border-t pt-1">Official Municipal Seal / Stamp</p>
              </div>
            </div>
          </div>
        </div>
      )}
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
