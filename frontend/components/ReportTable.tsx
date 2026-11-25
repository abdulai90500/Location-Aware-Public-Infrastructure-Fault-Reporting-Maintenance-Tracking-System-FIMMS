"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, UserCheck, RefreshCw, MapPin, AlertCircle, Volume2 } from "lucide-react";
import { FaultReport, MaintenanceTeam } from "@/types";
import StatusBadge from "./StatusBadge";

interface ReportTableProps {
  reports: FaultReport[];
  teams?: MaintenanceTeam[];
  onAssignTeam?: (reportId: number, teamId: number, instructions: string) => void;
  onStatusChange?: (reportId: number, newStatus: string, notes: string) => void;
  isAdmin?: boolean;
}

export default function ReportTable({
  reports,
  teams = [],
  onAssignTeam,
  onStatusChange,
  isAdmin = false,
}: ReportTableProps) {
  const [selectedReport, setSelectedReport] = useState<FaultReport | null>(null);
  const [actionType, setActionType] = useState<"assign" | "status" | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | "">("");
  const [instructions, setInstructions] = useState("");
  const [targetStatus, setTargetStatus] = useState("Assigned");
  const [statusNotes, setStatusNotes] = useState("");

  const handleOpenAssign = (report: FaultReport) => {
    setSelectedReport(report);
    setActionType("assign");
    setSelectedTeamId(teams.length > 0 ? teams[0].id : "");
    setInstructions("");
  };

  const handleOpenStatus = (report: FaultReport) => {
    setSelectedReport(report);
    setActionType("status");
    setTargetStatus(report.status);
    setStatusNotes("");
  };

  const handleExecuteAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedReport && selectedTeamId && onAssignTeam) {
      onAssignTeam(selectedReport.id, Number(selectedTeamId), instructions);
      setActionType(null);
      setSelectedReport(null);
    }
  };

  const handleExecuteStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedReport && onStatusChange) {
      onStatusChange(selectedReport.id, targetStatus, statusNotes);
      setActionType(null);
      setSelectedReport(null);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Tracking #</th>
              <th className="py-3.5 px-4">Problem / Category</th>
              <th className="py-3.5 px-4">Community & Location</th>
              <th className="py-3.5 px-4">Severity</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Assigned Team</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                  No infrastructure faults match your search or filter criteria.
                </td>
              </tr>
            ) : (
              reports.map((report) => {
                const assignedAssignment = report.assignments && report.assignments.length > 0
                  ? report.assignments[report.assignments.length - 1]
                  : null;

                return (
                  <tr key={report.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      <Link
                        href={`/track-report?tracking=${report.tracking_number}`}
                        className="hover:text-emerald-600 dark:hover:text-emerald-400 underline decoration-slate-300 dark:decoration-slate-700 hover:decoration-emerald-500"
                      >
                        {report.tracking_number}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white max-w-xs truncate flex items-center space-x-1.5">
                        <span className="truncate">{report.title}</span>
                        {report.images?.some(
                          (img) =>
                            img.image_type === "audio_note" ||
                            img.image_url?.endsWith(".webm") ||
                            img.image_url?.endsWith(".wav") ||
                            img.image_url?.endsWith(".mp3")
                        ) && (
                          <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold flex-shrink-0" title="Citizen Voice Note Attached">
                            <Volume2 className="w-3 h-3" />
                            <span>Voice</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{report.category?.category_name}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{report.community}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {report.landmark || report.location_name || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          report.severity === "critical"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            : report.severity === "high"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300"
                            : report.severity === "medium"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {report.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={report.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      {assignedAssignment?.team ? (
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                          {assignedAssignment.team.team_name}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <Link
                          href={`/track-report?tracking=${report.tracking_number}`}
                          title="View Details"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleOpenAssign(report)}
                              title="Assign Maintenance Team"
                              className="p-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenStatus(report)}
                              title="Change Status"
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Assign Team Modal */}
      {actionType === "assign" && selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Assign Team: {selectedReport.tracking_number}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {selectedReport.title} ({selectedReport.community})
            </p>
            <form onSubmit={handleExecuteAssign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Select Maintenance Unit</label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none"
                  required
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.team_name} ({t.department})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Specific Field Instructions</label>
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Inspect culvert side walls, provide sandbags, coordinate with local traffic police..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {actionType === "status" && selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Update Report Status: {selectedReport.tracking_number}
            </h3>
            <form onSubmit={handleExecuteStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">New Lifecycle Status</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold outline-none"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                  <option value="Rejected">Rejected</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Status Transition Notes</label>
                <textarea
                  rows={3}
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Reason for change, audit notes, or inspection comments..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
