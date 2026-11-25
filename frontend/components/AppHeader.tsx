"use client";

import React, { useState, useEffect } from "react";
import {
  Menu, Bell, Sun, Moon, Printer, Download, Search, CheckCircle2,
  ShieldAlert, Wrench, MapPin, ArrowRight, LogOut, LogIn, User as UserIcon
} from "lucide-react";
import { useTheme } from "./ThemeContext";
import { api } from "@/lib/api";
import { NotificationItem, User } from "@/types";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AppHeaderProps {
  onToggleSidebar: () => void;
}

export default function AppHeader({ onToggleSidebar }: AppHeaderProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadNotifications = () => {
    if (api.getCurrentUser()) {
      api.getNotifications()
        .then((data) => setNotifications(data || []))
        .catch(() => {});
    }
  };

  useEffect(() => {
    setCurrentUser(api.getCurrentUser());
    loadNotifications();
  }, [pathname]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/track-report?tracking=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isStaff =
    currentUser &&
    ["administrator", "maintenance_officer", "supervisor"].includes(currentUser.role);

  const getPageTitle = () => {
    if (pathname === "/dashboard") {
      return currentUser?.role === "citizen"
        ? "My Citizen Account Dashboard"
        : "Executive Municipal Dashboard";
    }
    if (pathname === "/report-fault") return "Citizen Fault Reporting Wizard";
    if (pathname === "/track-report") return "Incident Reference Tracker";
    if (pathname === "/map") return "GIS Spatial Infrastructure Map";
    if (pathname === "/admin/reports") return "Admin: All Reports & Fixed Status";
    if (pathname === "/admin") return "Centralized Fault Management";
    if (pathname === "/maintenance") return "Field Maintenance Work Orders";
    if (pathname === "/supervisor") return "Supervisor Quality Sign-off";
    if (pathname === "/analytics") return "City Analytics & SLA Metrics";
    return "Freetown Municipal Portal";
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-colors">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Open Sidebar Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <span className="inline-flex w-4 h-3 rounded-xs overflow-hidden flex-col shadow-xs border border-slate-300 dark:border-slate-700" title="Republic of Sierra Leone">
              <span className="h-1 bg-[#1EB53A]" />
              <span className="h-1 bg-[#FFFFFF]" />
              <span className="h-1 bg-[#0072C6]" />
            </span>
            <span>{getPageTitle()}</span>
          </h2>
          <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400">
            Western Area Urban &bull; Freetown City Council
          </p>
        </div>
      </div>

      {/* Center: Quick Search Bar */}
      <form onSubmit={handleSearch} className="hidden md:flex items-center relative max-w-xs w-full mx-4">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Track ref e.g. FTN-2026-0001..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        />
      </form>

      {/* Right: Actions, Theme, Notifications & Print */}
      <div className="flex items-center space-x-2">
        {/* Print PDF Button */}
        <button
          type="button"
          onClick={handlePrint}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Print page or save as PDF"
        >
          <Printer className="w-4 h-4" />
        </button>

        {/* Download CSV Button (Staff Only) */}
        {isStaff && (
          <a
            href={api.getExportCsvUrl()}
            download="freetown_faults.csv"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Download CSV database dump"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </a>
        )}

        {/* Dark/Bright Mood Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={`Switch to ${theme === 'dark' ? 'Bright Mood (Light)' : 'Dark Mood'}`}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={async () => {
                      await api.markAllNotificationsRead();
                      loadNotifications();
                    }}
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 italic">
                    No recent notifications.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs transition ${
                        !n.is_read
                          ? "bg-emerald-50/60 dark:bg-emerald-950/40 font-semibold"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <p className="line-clamp-2 text-slate-900 dark:text-slate-200">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Session & Direct Logout Button */}
        {currentUser ? (
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                {currentUser.full_name}
              </div>
              <div className="text-[10px] capitalize text-emerald-600 dark:text-emerald-400 font-semibold">
                {currentUser.role.replace("_", " ")}
              </div>
            </div>
            <button
              type="button"
              onClick={() => api.logout()}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 dark:bg-rose-950/60 dark:hover:bg-rose-600 text-rose-600 hover:text-white dark:text-rose-300 dark:hover:text-white border border-rose-200 dark:border-rose-900 font-bold text-xs transition shadow-xs"
              title="Sign out of FIMMS"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <Link
              href="/login"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
