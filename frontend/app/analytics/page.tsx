"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, Activity, PieChart, Users, CheckCircle2, Clock, MapPin, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { AnalyticsSummary, CommunityStat, CategoryStat } from "@/types";
import AnalyticsCards from "@/components/AnalyticsCards";

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [communityStats, setCommunityStats] = useState<CommunityStat[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [sum, comms, cats, tm] = await Promise.all([
        api.getAnalyticsSummary(),
        api.getCommunityStats(),
        api.getCategoryStats(),
        api.getTeamsPerformance(),
      ]);
      setSummary(sum);
      setCommunityStats(comms);
      setCategoryStats(cats);
      setTeams(tm);
      setLoading(false);
    } catch (err) {
      console.error("Analytics error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const maxCommunityTotal = Math.max(...communityStats.map((c) => c.total), 1);
  const maxCategoryTotal = Math.max(...categoryStats.map((c) => c.count), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-7 h-7 text-emerald-600" />
            <span>Freetown Municipal Analytics &amp; Performance</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Real-time urban infrastructure health indicators, community density analysis, and repair SLA metrics.
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-white rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Top Metrics Cards */}
      <AnalyticsCards summary={summary} loading={loading} />

      {/* Two Column Grid: Community Breakdown & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Community Breakdown */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Faults by Community (Western Area Urban)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Density metric</span>
          </div>

          <div className="space-y-3 pt-2">
            {communityStats.map((comm) => {
              const percentage = Math.round((comm.total / maxCommunityTotal) * 100);
              const resolutionRate = comm.total > 0 ? Math.round((comm.resolved / comm.total) * 100) : 0;
              return (
                <div key={comm.community} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{comm.community}</span>
                    <span className="text-slate-500 font-mono">
                      {comm.total} reports ({resolutionRate}% resolved)
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${(comm.resolved / maxCommunityTotal) * 100}%` }}
                      title={`Resolved: ${comm.resolved}`}
                    />
                    <div
                      className="h-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${(comm.pending / maxCommunityTotal) * 100}%` }}
                      title={`Pending: ${comm.pending}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center space-x-4 pt-2 text-[11px] text-slate-500">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Resolved</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span>Pending / Active</span>
            </div>
          </div>
        </div>

        {/* 2. Category Distribution */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Distribution by Infrastructure Category
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Issue types</span>
          </div>

          <div className="space-y-3 pt-2">
            {categoryStats.map((cat) => {
              const percentage = Math.round((cat.count / maxCategoryTotal) * 100);
              return (
                <div key={cat.category_name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{cat.category_name}</span>
                    <span className="text-slate-500 font-mono font-bold">{cat.count}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Maintenance Team Workload & Performance */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Maintenance Team Dispatch &amp; Completion Performance
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Field crew throughput</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {teams.map((t) => (
            <div key={t.team_id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{t.team_name}</h4>
              <p className="text-[11px] text-slate-500">{t.department}</p>
              <div className="pt-2 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <div className="text-base font-extrabold text-blue-700">{t.active}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Active</div>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <div className="text-base font-extrabold text-emerald-700">{t.completed}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Completed</div>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 pt-1">
                Leader: <strong className="text-slate-700">{t.team_leader}</strong> ({t.contact_number})
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
