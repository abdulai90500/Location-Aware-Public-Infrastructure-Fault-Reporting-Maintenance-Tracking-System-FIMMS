"use client";

import React, { useState, useEffect } from "react";
import { Filter, Layers, MapPin, RefreshCw, PlusCircle, Eye, Flame, Map as MapIcon } from "lucide-react";
import { api } from "@/lib/api";
import { MapMarker, Category, HotspotCluster } from "@/types";
import MapView from "@/components/MapView";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";

export default function MapPage() {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [hotspots, setHotspots] = useState<HotspotCluster[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [viewMode, setViewMode] = useState<"markers" | "hotspots">("markers");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedCommunity, setSelectedCommunity] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cats, mapPoints, hotspotClusters] = await Promise.all([
        api.getCategories(),
        api.getMapFaults({
          category_id: selectedCategory ? Number(selectedCategory) : undefined,
          community: selectedCommunity || undefined,
          status: selectedStatus || undefined,
          severity: selectedSeverity || undefined,
        }),
        api.getHotspots(),
      ]);
      setCategories(cats);
      setMarkers(mapPoints);
      setHotspots(hotspotClusters || []);
      setLoading(false);
    } catch (err) {
      console.error("Map data error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedCommunity, selectedStatus, selectedSeverity]);

  const legend = [
    { name: "Road damage", color: "#EA580C" },
    { name: "Streetlights", color: "#CA8A04" },
    { name: "Drainage systems", color: "#0284C7" },
    { name: "Water infrastructure", color: "#0D9488" },
    { name: "Public walkways", color: "#7C3AED" },
    { name: "Waste facilities", color: "#E11D48" },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <span>Freetown Infrastructure GIS Map</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Interactive geographical distribution of reported faults across Western Area Urban.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 text-xs">
            <button
              onClick={() => setViewMode("markers")}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 transition ${
                viewMode === "markers"
                  ? "bg-slate-900 dark:bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Pins View</span>
            </button>
            <button
              onClick={() => setViewMode("hotspots")}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 transition ${
                viewMode === "hotspots"
                  ? "bg-orange-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Spatial Hotspots</span>
            </button>
          </div>

          <Link
            href="/report-fault"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Fault</span>
          </Link>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            title="Refresh Map Points"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 font-bold pr-2 border-r border-slate-200 dark:border-slate-700">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Category */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.category_name}</option>
          ))}
        </select>

        {/* Community */}
        <select
          value={selectedCommunity}
          onChange={(e) => setSelectedCommunity(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 outline-none"
        >
          <option value="">All Communities</option>
          <option value="Central Freetown">Central Freetown</option>
          <option value="Congo Cross">Congo Cross</option>
          <option value="Kissy">Kissy</option>
          <option value="Lumley">Lumley</option>
          <option value="Wilkinson Road">Wilkinson Road</option>
        </select>

        {/* Status */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 outline-none"
        >
          <option value="">All Statuses</option>
          <option value="Submitted">Submitted</option>
          <option value="Under Review">Under Review</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>

        {/* Severity */}
        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 outline-none"
        >
          <option value="">All Severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        {(selectedCategory || selectedCommunity || selectedStatus || selectedSeverity) && (
          <button
            onClick={() => {
              setSelectedCategory("");
              setSelectedCommunity("");
              setSelectedStatus("");
              setSelectedSeverity("");
            }}
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline ml-auto"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Main Map + Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-3 space-y-3">
          <MapView
            markers={viewMode === "markers" ? markers : []}
            hotspots={viewMode === "hotspots" ? hotspots : []}
            height="600px"
            zoom={13}
            center={selectedMarker ? [selectedMarker.latitude, selectedMarker.longitude] : undefined}
          />

          {/* Color Legend */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Map Pin Legend:</span>
            <div className="flex flex-wrap items-center gap-3">
              {legend.map((l) => (
                <div key={l.name} className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }}></span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">{l.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fault Marker Feed List */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[650px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Reported Markers ({markers.length})
            </h3>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800 space-y-2 pt-2 pr-1">
            {markers.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-8">
                No faults match the current filters.
              </p>
            ) : (
              markers.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMarker(m)}
                  className={`p-3 rounded-2xl cursor-pointer transition text-left space-y-1.5 ${
                    selectedMarker?.id === m.id
                      ? "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-700"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">{m.tracking_number}</span>
                    <StatusBadge status={m.status} size="sm" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{m.title}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{m.community}</span>
                    <span className="capitalize font-semibold text-rose-700 dark:text-rose-400">{m.severity}</span>
                  </div>
                  <div className="pt-1 flex items-center justify-end">
                    <Link
                      href={`/track-report?tracking=${m.tracking_number}`}
                      className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                    >
                      <span>Track Status</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
