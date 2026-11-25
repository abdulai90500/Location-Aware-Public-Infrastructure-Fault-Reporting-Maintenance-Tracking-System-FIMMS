import React from "react";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const getColors = () => {
    switch (status) {
      case "Submitted":
        return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800";
      case "Under Review":
        return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800";
      case "Assigned":
        return "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800";
      case "In Progress":
        return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800";
      case "Resolved":
        return "bg-emerald-100 text-emerald-800 border-emerald-400 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700";
      case "Closed":
        return "bg-teal-100 text-teal-800 border-teal-400 dark:bg-teal-950/80 dark:text-teal-300 dark:border-teal-700";
      case "Rejected":
        return "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800";
      case "On Hold":
        return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/70 dark:text-orange-300 dark:border-orange-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    }
  };

  const getLabel = () => {
    if (status === "Resolved") return "✓ Fixed (Resolved)";
    if (status === "Closed") return "✓ Fixed & Closed";
    return status;
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-bold",
    md: "px-2.5 py-1 text-xs font-bold",
    lg: "px-3 py-1.5 text-sm font-bold",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${getColors()} ${sizeClasses[size]}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-80"></span>
      {getLabel()}
    </span>
  );
}
