"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin, PlusCircle, Search, ShieldAlert, Wrench, Droplets,
  Lightbulb, Footprints, Trash2, ArrowRight, CheckCircle2, Navigation, Activity
} from "lucide-react";
import { api } from "@/lib/api";
import { AnalyticsSummary } from "@/types";

export default function HomePage() {
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  const [quickTrackNum, setQuickTrackNum] = useState("");

  useEffect(() => {
    api.getAnalyticsSummary()
      .then(setStats)
      .catch((err) => console.warn("Analytics load:", err));
  }, []);

  const categories = [
    {
      name: "Road damage",
      desc: "Potholes, collapsed surfaces, and asphalt deterioration",
      icon: Wrench,
      color: "bg-orange-500",
    },
    {
      name: "Streetlights",
      desc: "Broken, non-functional, or dark public streetlights",
      icon: Lightbulb,
      color: "bg-yellow-500",
    },
    {
      name: "Drainage systems",
      desc: "Blocked culverts, silt accumulation, and street flooding",
      icon: Droplets,
      color: "bg-blue-500",
    },
    {
      name: "Water infrastructure",
      desc: "Leaking municipal pipes and damaged standpipes",
      icon: Wrench,
      color: "bg-teal-500",
    },
    {
      name: "Public walkways",
      desc: "Damaged sidewalks, open drops, and eroded kerbs",
      icon: Footprints,
      color: "bg-purple-500",
    },
    {
      name: "Waste facilities",
      desc: "Overflowing community skips and illegal waste deposits",
      icon: Trash2,
      color: "bg-rose-500",
    },
  ];

  const pilotAreas = [
    { name: "Central Freetown", detail: "Siaka Stevens St, Cotton Tree, Kroo Town Rd" },
    { name: "Congo Cross", detail: "Roundabout, Main Motor Rd, St. Edwards" },
    { name: "Kissy", detail: "Kissy Road, Shell, Old Wharf, Health Centre" },
    { name: "Lumley", detail: "Lumley Beach Road, Police Station, Juba" },
    { name: "Wilkinson Road", detail: "Commercial corridor, Standard Chartered, Murray Town Junction" },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-8 sm:p-14 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Western Area Urban, Freetown Pilot</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Location-Aware Public Infrastructure Fault Reporting &amp; Maintenance Tracking
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Empowering residents of Freetown to report potholes, blocked drains, burst water pipes, and broken streetlights with instant GPS location and photo evidence — connected directly to municipal rapid response teams.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/report-fault"
              className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 transition flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Infrastructure Fault</span>
            </Link>

            <Link
              href="/map"
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition flex items-center space-x-2"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>View Interactive City Map</span>
            </Link>
          </div>

          {/* Quick Track Bar */}
          <div className="pt-4 max-w-md">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (quickTrackNum.trim()) {
                  window.location.href = `/track-report?tracking=${encodeURIComponent(quickTrackNum.trim())}`;
                }
              }}
              className="flex items-center bg-white/10 backdrop-blur-md rounded-2xl p-1.5 border border-white/20"
            >
              <Search className="w-4 h-4 text-slate-400 ml-3 mr-2" />
              <input
                type="text"
                placeholder="Track by reference e.g. FTN-2026-0001"
                value={quickTrackNum}
                onChange={(e) => setQuickTrackNum(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none flex-1 font-mono py-2"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-emerald-400 transition"
              >
                Track
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Live Metrics Counter */}
      {stats && (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.total_reports}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Total Faults Logged</div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-amber-700 dark:text-amber-400">{stats.submitted + stats.under_review}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Under Review / Verification</div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 flex items-center justify-center">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-blue-700 dark:text-blue-400">{stats.assigned + stats.in_progress}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Maintenance In Progress</div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{stats.resolved + stats.closed}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Resolved ({stats.avg_resolution_hours}h avg)</div>
            </div>
          </div>
        </section>
      )}

      {/* Six Infrastructure Categories */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Infrastructure Categories</h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            FIMMS initially tracks six core categories essential for Western Area Urban public health, safety, and transit:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-3"
              >
                <div className={`w-10 h-10 rounded-xl ${cat.color} text-white flex items-center justify-center shadow-sm`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{cat.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{cat.desc}</p>
                </div>
                <div className="pt-1">
                  <Link
                    href={`/report-fault`}
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center space-x-1"
                  >
                    <span>Report this issue</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Complete Lifecycle Workflow */}
      <section className="bg-white dark:bg-[#1E293B] rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Complete MVP Fault Lifecycle</h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            From initial citizen submission to verified repair closure:
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { step: "1", title: "Report", desc: "Citizen captures GPS & photo evidence" },
            { step: "2", title: "Review", desc: "Admin reviews & checks duplicates" },
            { step: "3", title: "Assign", desc: "Dispatched to maintenance unit" },
            { step: "4", title: "Repair", desc: "Officer logs materials & progress" },
            { step: "5", title: "Resolved", desc: "Citizen notified via SMS/portal" },
            { step: "6", title: "Closed", desc: "Supervisor verifies & closes" },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
              <div className="w-6 h-6 rounded-full bg-slate-900 dark:bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center mb-2">
                {item.step}
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Western Area Urban Pilot Communities */}
      <section className="bg-slate-900 rounded-3xl p-8 text-white space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black">Western Area Urban Pilot Communities</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Initial deployment focus areas with high pedestrian and vehicular traffic density in Freetown:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {pilotAreas.map((area, idx) => (
            <div key={idx} className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-xs">
                <MapPin className="w-3.5 h-3.5" />
                <span>{area.name}</span>
              </div>
              <p className="text-[11px] text-slate-400">{area.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
