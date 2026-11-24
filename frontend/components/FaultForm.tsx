"use client";

import React, { useState, useEffect } from "react";
import {
  Camera, MapPin, Navigation, AlertTriangle, CheckCircle, Upload,
  Wrench, Lightbulb, Droplets, Footprints, Trash2, ShieldAlert, ArrowRight,
  Sparkles, ThumbsUp, Layers
} from "lucide-react";
import { api } from "@/lib/api";
import { Category, DuplicateCandidate, AIClassificationResult } from "@/types";
import MapView from "./MapView";
import Link from "next/link";

const FREETOWN_COMMUNITIES = [
  "Central Freetown",
  "Congo Cross",
  "Kissy",
  "Lumley",
  "Wilkinson Road",
  "Aberdeen",
  "Brookfields",
  "Kingtom",
  "Wilberforce",
  "Murray Town",
  "Goderich",
  "Cline Town",
  "Tower Hill",
  "Mountain Cut"
];

// Default GPS centers for Freetown communities
const COMMUNITY_COORDS: Record<string, [number, number]> = {
  "Central Freetown": [8.4840, -13.2340],
  "Congo Cross": [8.4825, -13.2570],
  "Kissy": [8.4789, -13.2120],
  "Lumley": [8.4712, -13.2758],
  "Wilkinson Road": [8.4750, -13.2640],
  "Aberdeen": [8.4980, -13.2910],
  "Brookfields": [8.4770, -13.2480],
  "Kingtom": [8.4910, -13.2500],
  "Wilberforce": [8.4680, -13.2610],
  "Murray Town": [8.4940, -13.2690],
};

export default function FaultForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [community, setCommunity] = useState("Central Freetown");
  const [locationName, setLocationName] = useState("");
  const [landmark, setLandmark] = useState("");
  const [severity, setSeverity] = useState("medium");
  
  // GPS State
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 8.4840,
    lng: -13.2340,
  });
  const [gpsStatus, setGpsStatus] = useState<string>("");
  const [gpsLoading, setGpsLoading] = useState(false);

  // Photo Evidence State
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // AI & Duplicate State
  const [aiResult, setAiResult] = useState<AIClassificationResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const [duplicateAlertDismissed, setDuplicateAlertDismissed] = useState(false);
  const [upvoteMessage, setUpvoteMessage] = useState<string | null>(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Scan duplicates when location or category changes
  const runDuplicateScan = async (lat: number, lng: number, catId?: number | null) => {
    try {
      const res = await api.checkDuplicates(lat, lng, catId || undefined, 400);
      setDuplicates(res.candidates || []);
      setDuplicateAlertDismissed(false);
    } catch {}
  };

  useEffect(() => {
    runDuplicateScan(coords.lat, coords.lng, selectedCategory);
  }, [coords.lat, coords.lng, selectedCategory]);

  useEffect(() => {
    api.getCategories()
      .then((data) => {
        setCategories(data);
        if (data.length > 0) setSelectedCategory(data[0].id);
      })
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  const handleCommunityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const comm = e.target.value;
    setCommunity(comm);
    if (COMMUNITY_COORDS[comm]) {
      setCoords({ lat: COMMUNITY_COORDS[comm][0], lng: COMMUNITY_COORDS[comm][1] });
    }
  };

  const handleCaptureGPS = () => {
    if (!navigator.geolocation) {
      setGpsStatus("Geolocation is not supported by your browser");
      return;
    }
    setGpsLoading(true);
    setGpsStatus("Acquiring GPS fix from device satellites...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        setGpsLoading(false);
        setGpsStatus(`GPS Captured: Lat ${latitude.toFixed(5)}, Lng ${longitude.toFixed(5)} (±${Math.round(accuracy)}m)`);
      },
      (error) => {
        setGpsLoading(false);
        setGpsStatus(`GPS capture failed: ${error.message}. You can still pinpoint location on the map.`);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));

      // Trigger AI Feature Extraction
      try {
        setAiLoading(true);
        const classification = await api.classifyImage(file, file.name, description);
        setAiResult(classification);
        setAiLoading(false);
      } catch (err) {
        console.warn("AI classifier error:", err);
        setAiLoading(false);
      }
    }
  };

  const handleApplyAI = () => {
    if (!aiResult) return;
    setSelectedCategory(aiResult.suggested_category_id);
    setSeverity(aiResult.recommended_severity);
    if (!title) setTitle(aiResult.suggested_title);
    if (!description) setDescription(aiResult.suggested_description);
  };

  const handleUpvoteDuplicate = async (repId: number) => {
    try {
      const res = await api.upvoteReport(repId);
      setUpvoteMessage(res.message);
      setDuplicateAlertDismissed(true);
    } catch (err: any) {
      alert("Error endorsing fault: " + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) {
      setErrorMessage("Please select an infrastructure category");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      // 1. Create Fault Report
      const report = await api.createReport({
        category_id: selectedCategory,
        title,
        description,
        latitude: coords.lat,
        longitude: coords.lng,
        location_name: locationName || undefined,
        community,
        landmark: landmark || undefined,
        severity,
      });

      // 2. Upload Photograph Evidence if selected
      if (photoFile && report.id) {
        try {
          await api.uploadReportImage(report.id, photoFile, "initial", "Initial photo submitted by citizen");
        } catch (imgErr) {
          console.warn("Image upload failed, report was still created:", imgErr);
        }
      }

      setSubmittedReport(report);
      setSubmitting(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit fault report");
      setSubmitting(false);
    }
  };

  if (submittedReport) {
    return (
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Fault Report Submitted!</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Thank you for helping keep Freetown clean, safe, and functioning. Your complaint has been lodged into the municipal queue.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-left space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tracking Number</span>
            <span className="font-mono text-base font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              {submittedReport.tracking_number}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400">Community:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{submittedReport.community}</p>
            </div>
            <div>
              <span className="text-slate-400">Status:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{submittedReport.status}</p>
            </div>
            <div>
              <span className="text-slate-400">Coordinates:</span>
              <p className="font-mono text-slate-800 dark:text-slate-200">{submittedReport.latitude.toFixed(4)}, {submittedReport.longitude.toFixed(4)}</p>
            </div>
            <div>
              <span className="text-slate-400">Severity:</span>
              <p className="font-semibold capitalize text-slate-800 dark:text-slate-200">{submittedReport.severity}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={`/track-report?tracking=${submittedReport.tracking_number}`}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white font-semibold text-sm hover:bg-slate-800 dark:hover:bg-emerald-700 transition flex items-center justify-center space-x-2"
          >
            <span>Track This Report</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() => {
              setSubmittedReport(null);
              setTitle("");
              setDescription("");
              setPhotoFile(null);
              setPhotoPreview(null);
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Submit Another Fault
          </button>
        </div>
      </div>
    );
  }

  const getCategoryIcon = (name: string) => {
    switch (name) {
      case "Road damage": return Wrench;
      case "Streetlights": return Lightbulb;
      case "Drainage systems": return Droplets;
      case "Water infrastructure": return Wrench;
      case "Public walkways": return Footprints;
      case "Waste facilities": return Trash2;
      default: return AlertTriangle;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-sm font-medium flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upvote Success Toast */}
      {upvoteMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>{upvoteMessage}</span>
        </div>
      )}

      {/* Spatial Duplicate Warning */}
      {duplicates.length > 0 && !duplicateAlertDismissed && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>Potential Duplicate Fault Detected Nearby ({duplicates[0].distance_meters}m away)</span>
            </div>
            <button
              type="button"
              onClick={() => setDuplicateAlertDismissed(true)}
              className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline font-semibold"
            >
              Dismiss
            </button>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300">
            A resident already reported <strong>"{duplicates[0].title}"</strong> ({duplicates[0].tracking_number}) nearby. You can endorse it to boost municipal urgency instead of filing a new duplicate.
          </p>
          <div className="flex items-center space-x-3 pt-1">
            <button
              type="button"
              onClick={() => handleUpvoteDuplicate(duplicates[0].id)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Endorse This Report (+1 Upvote)</span>
            </button>
            <Link
              href={`/track-report?tracking=${duplicates[0].tracking_number}`}
              target="_blank"
              className="text-xs font-semibold text-amber-900 dark:text-amber-300 hover:underline"
            >
              View existing report &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* 1. Infrastructure Category Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-bold text-slate-900 dark:text-white">
          1. Select Infrastructure Category <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.category_name);
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/50 ring-2 ring-emerald-500/30 text-emerald-950 dark:text-emerald-200 font-bold shadow-sm"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                  isSelected ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight">{cat.category_name}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{cat.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Problem Details */}
      <div className="space-y-4">
        <label className="block text-sm font-bold text-slate-900 dark:text-white">
          2. Fault Description &amp; Severity <span className="text-rose-500">*</span>
        </label>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Fault Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Broken culvert causing flooding at intersection"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Detailed Description</label>
          <textarea
            required
            rows={3}
            placeholder="Describe what happened, how long the fault has persisted, hazard posed to pedestrians/motorists..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Estimated Severity</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: "low", label: "Low", color: "hover:border-slate-400" },
              { id: "medium", label: "Medium", color: "hover:border-amber-400" },
              { id: "high", label: "High", color: "hover:border-orange-400" },
              { id: "critical", label: "Critical", color: "hover:border-rose-400" },
            ].map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setSeverity(lvl.id)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition ${
                  severity === lvl.id
                    ? lvl.id === "critical"
                      ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                      : "bg-slate-900 dark:bg-emerald-600 text-white border-slate-900 dark:border-emerald-600 shadow-sm"
                    : `bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 ${lvl.color}`
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Geographical Location & GPS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-bold text-slate-900 dark:text-white">
            3. Geographic Location (GPS) <span className="text-rose-500">*</span>
          </label>
          <button
            type="button"
            onClick={handleCaptureGPS}
            disabled={gpsLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition"
          >
            <Navigation className={`w-3.5 h-3.5 ${gpsLoading ? "animate-spin" : ""}`} />
            <span>{gpsLoading ? "Locating..." : "Use My Device GPS"}</span>
          </button>
        </div>

        {gpsStatus && (
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
            {gpsStatus}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Community (Western Area Urban)</label>
            <select
              value={community}
              onChange={handleCommunityChange}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {FREETOWN_COMMUNITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Street / Location Name</label>
            <input
              type="text"
              placeholder="e.g. Lumley Beach Road"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Landmark</label>
            <input
              type="text"
              placeholder="e.g. Near St. Edwards School"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none"
            />
          </div>
        </div>

        {/* Interactive Map Picker */}
        <div className="space-y-1.5">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Pinpoint on Freetown Map:</span>
            <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              Latitude: {coords.lat.toFixed(5)}, Longitude: {coords.lng.toFixed(5)}
            </span>
          </div>
          <MapView
            selectedLocation={coords}
            onLocationSelect={(lat, lng) => setCoords({ lat, lng })}
            interactiveSelect={true}
            height="280px"
          />
        </div>
      </div>

      {/* 4. Photographic Evidence & AI Analysis */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-bold text-slate-900 dark:text-white">
            4. Photograph Evidence &amp; AI Analysis
          </label>
          {aiLoading && (
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center space-x-1.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analyzing photo with AI...</span>
            </span>
          )}
        </div>

        {/* AI Auto-Detection Card */}
        {aiResult && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-sky-950/40 border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-950 dark:text-emerald-200">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>AI Infrastructure Classifier ({aiResult.confidence}% Confidence)</span>
              </div>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {aiResult.recommended_severity} Priority
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300">
              <strong>Detected Category:</strong> {aiResult.suggested_category_name} &bull; <em>{aiResult.reasoning}</em>
            </p>

            <div className="flex flex-wrap items-center gap-1.5">
              {aiResult.detected_tags.map((tag) => (
                <span key={tag} className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={handleApplyAI}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5"
              >
                <Sparkles className="w-3 h-3" />
                <span>Auto-Fill Category &amp; Details with AI Suggestion</span>
              </button>
            </div>
          </div>
        )}

        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-emerald-500 dark:hover:border-emerald-400 transition">
          {photoPreview ? (
            <div className="space-y-3">
              <img
                src={photoPreview}
                alt="Selected evidence"
                className="max-h-56 mx-auto rounded-xl object-cover shadow-md"
              />
              <button
                type="button"
                onClick={() => {
                  setPhotoFile(null);
                  setPhotoPreview(null);
                }}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
              >
                Remove photo
              </button>
            </div>
          ) : (
            <label className="cursor-pointer block space-y-2">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Click to capture or upload photograph evidence
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Supports JPG, PNG, WEBP from phone camera or gallery</p>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-base shadow-lg shadow-emerald-600/25 transition disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {submitting ? (
            <span>Transmitting Complaint & GPS...</span>
          ) : (
            <>
              <span>Submit Fault Report</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mt-2.5">
          Your report will be reviewed by the Western Area Urban infrastructure administrative team and assigned to a rapid maintenance unit.
        </p>
      </div>
    </form>
  );
}
