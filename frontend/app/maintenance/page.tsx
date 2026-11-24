"use client";

import React, { useState, useEffect } from "react";
import {
  Wrench, CheckCircle2, Clock, MapPin, Upload, Camera,
  AlertCircle, FileText, ArrowRight, RefreshCw
} from "lucide-react";
import { api } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";

export default function MaintenancePage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<any | null>(null);

  // Form State for Progress Update
  const [updateStatus, setUpdateStatus] = useState("In Progress");
  const [workDescription, setWorkDescription] = useState("");
  const [materialsUsed, setMaterialsUsed] = useState("");
  const [hoursSpent, setHoursSpent] = useState("2.5");
  const [evidencePhoto, setEvidencePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getMyTasks();
      setTasks(data);
      setLoading(false);
    } catch (err) {
      console.error("Tasks error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleOpenUpdate = (task: any) => {
    setActiveTask(task);
    setUpdateStatus(task.report_status === "In Progress" ? "Resolved" : "In Progress");
    setWorkDescription("");
    setMaterialsUsed("");
    setHoursSpent("2.0");
    setEvidencePhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask) return;

    try {
      setSubmitting(true);
      // 1. Log maintenance progress update
      await api.submitMaintenanceUpdate({
        report_id: activeTask.report_id,
        status: updateStatus,
        work_description: workDescription,
        materials_used: materialsUsed || undefined,
        hours_spent: parseFloat(hoursSpent) || 0.0,
      });

      // 2. Upload repair photo evidence if selected
      if (evidencePhoto) {
        const photoType = updateStatus === "Resolved" ? "after_repair" : "before_repair";
        try {
          await api.uploadReportImage(
            activeTask.report_id,
            evidencePhoto,
            photoType,
            `Field maintenance evidence (${photoType.replace("_", " ")})`
          );
        } catch (imgErr) {
          console.warn("Evidence photo upload warning:", imgErr);
        }
      }

      setSubmitting(false);
      setActiveTask(null);
      loadTasks();
    } catch (err: any) {
      alert("Error logging maintenance update: " + err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Wrench className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <span>Field Maintenance Portal</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Assigned rapid response work orders, repair progress tracking, and before-and-after photo submission.
          </p>
        </div>

        <button
          onClick={loadTasks}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Tasks</span>
        </button>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">Loading work orders...</div>
        ) : tasks.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">No active assigned tasks.</div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">{task.tracking_number}</span>
                  <StatusBadge status={task.report_status} size="sm" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">{task.title}</h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{task.community} &bull; {task.location_name || "Location tagged"}</span>
                </div>

                {task.instructions && (
                  <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Admin Dispatch Notes:</span>
                    {task.instructions}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Link
                  href={`/track-report?tracking=${task.tracking_number}`}
                  className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  View Details &rarr;
                </Link>
                <button
                  onClick={() => handleOpenUpdate(task)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm"
                >
                  Log Work Progress
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Log Work Progress Modal */}
      {activeTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Work Order Update</span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{activeTask.tracking_number}</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{activeTask.title}</p>
            </div>

            <form onSubmit={handleSubmitUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">New Report Status</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                >
                  <option value="In Progress">In Progress (Crews currently on-site)</option>
                  <option value="Resolved">Resolved (Physical repair finished)</option>
                  <option value="On Hold">On Hold (Awaiting specialized spare parts)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Work Done / Action Description</label>
                <textarea
                  required
                  rows={3}
                  value={workDescription}
                  onChange={(e) => setWorkDescription(e.target.value)}
                  placeholder="e.g. Cleared 2 tons of sediment from the culvert inlet, reinforced collapsed side slabs with concrete mortar..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Materials / Equipment Used</label>
                  <input
                    type="text"
                    placeholder="e.g. 4 bags cement, asphalt cold-mix"
                    value={materialsUsed}
                    onChange={(e) => setMaterialsUsed(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Labor Hours Spent</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="100"
                    value={hoursSpent}
                    onChange={(e) => setHoursSpent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none font-semibold"
                  />
                </div>
              </div>

              {/* Photo Evidence Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Before/After Repair Photograph Evidence
                </label>
                {photoPreview ? (
                  <div className="space-y-2">
                    <img src={photoPreview} alt="Work preview" className="h-36 mx-auto rounded-xl object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setEvidencePhoto(null);
                        setPhotoPreview(null);
                      }}
                      className="text-xs text-rose-600 font-semibold block mx-auto hover:underline"
                    >
                      Change photo
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center cursor-pointer block hover:border-slate-400 dark:hover:border-slate-600 transition">
                    <Camera className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">Snap or Upload Repair Photo</span>
                    <span className="text-[10px] text-slate-400">JPG, PNG from field camera</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setEvidencePhoto(e.target.files[0]);
                          setPhotoPreview(URL.createObjectURL(e.target.files[0]));
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTask(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? "Submitting Log..." : "Submit Work Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
