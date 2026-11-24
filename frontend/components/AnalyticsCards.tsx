import React from "react";
import { AlertCircle, Clock, CheckCircle2, Wrench, ShieldAlert } from "lucide-react";
import { AnalyticsSummary } from "@/types";

interface AnalyticsCardsProps {
  summary: AnalyticsSummary | null;
  loading?: boolean;
}

export default function AnalyticsCards({ summary, loading = false }: AnalyticsCardsProps) {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 animate-pulse space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const activeWork = summary.assigned + summary.in_progress;
  const pendingReview = summary.submitted + summary.under_review;
  const completed = summary.resolved + summary.closed;

  const cards = [
    {
      title: "Total Faults Logged",
      value: summary.total_reports,
      subtitle: "Western Area Urban",
      icon: AlertCircle,
      color: "text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800",
    },
    {
      title: "Pending Review",
      value: pendingReview,
      subtitle: `${summary.submitted} new, ${summary.under_review} in review`,
      icon: ShieldAlert,
      color: "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800",
    },
    {
      title: "Active Maintenance",
      value: activeWork,
      subtitle: `${summary.in_progress} in progress, ${summary.assigned} assigned`,
      icon: Wrench,
      color: "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800",
    },
    {
      title: "Resolved & Closed",
      value: completed,
      subtitle: `Avg. resolution: ${summary.avg_resolution_hours} hrs`,
      icon: CheckCircle2,
      color: "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{card.title}</span>
              <div className={`p-2 rounded-xl ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{card.value}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">{card.subtitle}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
