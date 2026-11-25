"use client";

import React, { useState, useEffect } from "react";
import {
  Camera, MapPin, Navigation, AlertTriangle, CheckCircle, Upload,
  Wrench, Lightbulb, Droplets, Footprints, Trash2, ShieldAlert, ArrowRight,
  Sparkles, ThumbsUp, Layers, Copy, Check, Eye, Clock,
  Mic, MicOff, Square, Play, Pause, RotateCcw, Volume2, FileAudio, Radio
} from "lucide-react";
import { api } from "@/lib/api";
import { Category, DuplicateCandidate, AIClassificationResult } from "@/types";
import MapView from "./MapView";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

  // Audio Input State (Voice Note Recording & Speech Dictation)
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [isDictating, setIsDictating] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<any>(null);
  const recognitionRef = React.useRef<any>(null);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60).toString().padStart(2, "0");
    const secs = (sec % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // Start audio voice note recording
  const startRecording = async () => {
    setAudioError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setAudioError("Audio recording is not supported in this browser");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mimeType = typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const type = mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type });
        const ext = type.includes("mp4") ? "m4a" : "webm";
        const file = new File([blob], `voice_fault_${Date.now()}.${ext}`, { type });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioFile(file);
        setAudioPreviewUrl(url);

        if (!title.trim()) {
          setTitle(`Voice Reported Fault - ${community}`);
        }
        if (!description.trim()) {
          setDescription("Citizen provided a voice audio note recording detailing the fault location and conditions.");
        }
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setAudioError(err.message || "Could not access microphone. Please allow microphone permission.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const deleteRecording = () => {
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioBlob(null);
    setAudioFile(null);
    setAudioPreviewUrl(null);
    setRecordSeconds(0);
  };

  // Toggle live speech-to-text dictation
  const toggleDictation = () => {
    if (isDictating) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsDictating(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setAudioError("Speech recognition is not supported in this browser. Please use Voice Note Recording instead.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsDictating(true);
        setAudioError(null);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          }
        }
        if (finalTranscript) {
          setDescription((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${finalTranscript.trim()}` : finalTranscript.trim();
          });
          if (!title.trim()) {
            setTitle(finalTranscript.slice(0, 60).trim());
          }
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error !== "no-speech") {
          setAudioError(`Speech dictation notice: ${e.error}`);
        }
        setIsDictating(false);
      };

      recognition.onend = () => {
        setIsDictating(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setAudioError("Could not start speech recognition. Use Voice Note Recording instead.");
      setIsDictating(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  // AI & Duplicate State
  const [aiResult, setAiResult] = useState<AIClassificationResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const [duplicateAlertDismissed, setDuplicateAlertDismissed] = useState(false);
  const [upvoteMessage, setUpvoteMessage] = useState<string | null>(null);

  const router = useRouter();

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [countdown, setCountdown] = useState<number>(4);

  // Auto-redirect to tracking view after successful submission
  useEffect(() => {
    if (!submittedReport) return;
    setCountdown(4);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push(`/track-report?tracking=${submittedReport.tracking_number}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [submittedReport, router]);

  // Scan duplicates when location or category changes
  const runDuplicateScan = async (lat: number, lng: number, catId?: number | null) => {
    try {
      const res = await api.checkDuplicates(lat, lng, catId || undefined, 400);
      setDuplicates(res.candidates || []);
      setDuplicateAlertDismissed(false);
    } catch { }
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
    if (!title || !title.trim()) {
      setErrorMessage("Please provide a title for the fault report");
      return;
    }
    if (!description || !description.trim()) {
      setErrorMessage("Please provide a description of the infrastructure fault");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      // 1. Create Fault Report
      const report = await api.createReport({
        category_id: selectedCategory,
        title: title.trim(),
        description: description.trim(),
        latitude: coords.lat,
        longitude: coords.lng,
        location_name: locationName.trim() || undefined,
        community,
        landmark: landmark.trim() || undefined,
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

      // 3. Upload Voice Audio Recording if recorded
      if (audioFile && report.id) {
        try {
          await api.uploadReportImage(report.id, audioFile, "audio_note", "Citizen voice note audio recording");
        } catch (audErr) {
          console.warn("Audio upload failed, report was still created:", audErr);
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
    const handleCopy = () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(submittedReport.tracking_number);
        setCopiedTracking(true);
        setTimeout(() => setCopiedTracking(false), 2500);
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full text-center space-y-5 my-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50 dark:ring-emerald-950/30">
            <CheckCircle className="w-12 h-12" />
          </div>

          <div className="space-y-1.5">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
              Official Municipal Confirmation
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              FAULT REPORT SUBMITTED!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Your report has been successfully recorded in the Freetown municipal queue and is ready for inspection.
            </p>
          </div>

          {/* Auto-redirect countdown pill */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Automatically taking you to your live report in {countdown}s...</span>
          </div>

          {/* Tracking Number Card */}
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-left space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Official Tracking Number
                </span>
                <span className="font-mono text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400">
                  {submittedReport.tracking_number}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 transition shadow-sm"
              >
                {copiedTracking ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Reference</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400">Community:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{submittedReport.community}</p>
              </div>
              <div>
                <span className="text-slate-400">Current Status:</span>
                <p className="font-bold text-emerald-700 dark:text-emerald-400">{submittedReport.status}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
            <Link
              href={`/track-report?tracking=${submittedReport.tracking_number}`}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center space-x-1.5"
            >
              <span>View My Report Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => {
                setSubmittedReport(null);
                setTitle("");
                setDescription("");
                setPhotoFile(null);
                setPhotoPreview(null);
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Submit Another Fault
            </button>
          </div>
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
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${isSelected
                  ? "border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/50 ring-2 ring-emerald-500/30 text-emerald-950 dark:text-emerald-200 font-bold shadow-sm"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${isSelected ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
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

      {/* 2. Problem Details & Audio Input */}
      <div className="space-y-4">
        <label className="block text-sm font-bold text-slate-900 dark:text-white">
          2. Fault Description, Audio Input &amp; Severity <span className="text-rose-500">*</span>
        </label>

        {/* Voice & Audio Input Feature */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-sky-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-emerald-950 dark:text-emerald-200">
                  Voice &amp; Audio Reporting Input
                </h4>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-400">
                  Prefer to speak instead of type? Record a voice note or use real-time speech dictation below.
                </p>
              </div>
            </div>
            {isRecording && (
              <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>RECORDING {formatDuration(recordSeconds)}</span>
              </span>
            )}
            {isDictating && (
              <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black animate-pulse">
                <Radio className="w-3 h-3 animate-spin" />
                <span>LISTENING...</span>
              </span>
            )}
          </div>

          {audioError && (
            <div className="text-[11px] text-rose-700 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-950/50 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
              {audioError}
            </div>
          )}

          {/* Action Buttons for Audio Recording and Dictation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {/* Record Voice Memo Button */}
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="py-2.5 px-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-bold transition flex items-center justify-center space-x-2 shadow-xs group"
              >
                <div className="w-3 h-3 rounded-full bg-rose-500 group-hover:bg-white transition" />
                <span>Record Voice Note Memo</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="py-2.5 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center justify-center space-x-2 shadow-md animate-pulse"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Stop Recording ({formatDuration(recordSeconds)})</span>
              </button>
            )}

            {/* Live Voice Dictation Button */}
            <button
              type="button"
              onClick={toggleDictation}
              className={`py-2.5 px-3.5 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-2 shadow-xs ${
                isDictating
                  ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600 animate-pulse"
                  : "bg-white dark:bg-slate-800 hover:bg-slate-900 hover:text-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700"
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isDictating ? "Stop Voice Dictation" : "Live Speech-to-Text"}</span>
            </button>
          </div>

          {/* Recorded Audio Preview Player */}
          {audioPreviewUrl && (
            <div className="mt-2 p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-300 dark:border-emerald-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span>Voice Note Attached ({formatDuration(recordSeconds)})</span>
                </span>
                <button
                  type="button"
                  onClick={deleteRecording}
                  className="text-[11px] font-bold text-rose-600 hover:underline flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Re-record / Delete</span>
                </button>
              </div>
              <audio controls src={audioPreviewUrl} className="w-full h-8" />
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                ✓ Audio note will be uploaded and listened to by municipal field maintenance crews.
              </p>
            </div>
          )}
        </div>

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
                className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition ${severity === lvl.id
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
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-base shadow-lg shadow-emerald-600/25 transition disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {submitting ? (
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Transmitting Complaint &amp; GPS to Freetown Queue...</span>
            </div>
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
