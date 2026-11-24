"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertOctagon, RefreshCw, Eye, Camera, ThumbsUp, RotateCcw } from "lucide-react";
import { api } from "@/lib/api";
import { FaultReport } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";

export default function SupervisorPage() {
  const [resolvedReports, setResolvedReports] = useState<FaultReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState<FaultReport | null>(null);
  const [decisionNotes, setDecisionNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const loadResolvedReports = async () => {
    try {
      setLoading(true);
      const data = await api.getReports({ status: "Resolved" });
      setResolvedReports(data);
      setLoading(false);
    } catch (err) {
      console.error("Supervisor data error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResolvedReports();
  }, []);

  const handleDecision = async (reportId: number, outcome: "approve" | "rework") => {
    try {
      setProcessing(true);
      const newStatus = outcome === "approve" ? "Closed" : "In Progress";
      await api.updateReportStatus(
        reportId,
        newStatus,
        `Supervisor Verification [${outcome.toUpperCase()}]: ${decisionNotes || "Work inspected and approved by Urban Infrastructure Supervisor."}`
      );
      setProcessing(false);
      setActiveReport(null);
      setDecisionNotes("");
      loadResolvedReports();
    } catch (err: any) {
      alert("Verification error: " + err.message);
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <CheckCircle2 className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            <span>Supervisor Quality &amp; Closure Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Verify completed physical repairs, inspect photographic evidence, and approve formal closure of complaints.
          </p>
        </div>

        <button
          onClick={loadResolvedReports}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Repairs Awaiting Final Sign-Off ({resolvedReports.length})
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Quality assurance protocol</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading pending closures...</div>
        ) : resolvedReports.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No resolved reports currently pending supervisor verification. All caught up!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resolvedReports.map((report) => (
              <div
                key={report.id}
                className="bg-slate-50/70 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-500 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{report.tracking_number}</span>
                    <StatusBadge status={report.status} size="sm" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{report.title}</h4>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    📍 {report.community} {report.landmark ? `• ${report.landmark}` : ""}
                  </div>

                  {/* Latest Update */}
                  {report.updates && report.updates.length > 0 && (
                    <div className="bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        Crew Work Report ({report.updates[report.updates.length - 1].officer?.full_name || "Field Officer"}):
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                        {report.updates[report.updates.length - 1].work_description}
                      </p>
                      {report.updates[report.updates.length - 1].materials_used && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                          <strong>Materials:</strong> {report.updates[report.updates.length - 1].materials_used}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <Link
                    href={`/track-report?tracking=${report.tracking_number}`}
                    className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </Link>

                  <button
                    onClick={() => {
                      setActiveReport(report);
                      setDecisionNotes("");
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shadow-sm transition"
                  >
                    Verify &amp; Close &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verification Modal */}
      {activeReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Supervisor Final Review</span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{activeReport.tracking_number}</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{activeReport.title}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Supervisor Inspection Notes</label>
              <textarea
                rows={3}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="e.g. On-site inspection confirms pothole repaired to municipal grade standards. Road open to traffic."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs outline-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveReport(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={() => handleDecision(activeReport.id, "rework")}
                className="px-4 py-2 text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-xl"
              >
                Request Rework
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={() => handleDecision(activeReport.id, "approve")}
                className="px-6 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm"
              >
                Approve &amp; Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
