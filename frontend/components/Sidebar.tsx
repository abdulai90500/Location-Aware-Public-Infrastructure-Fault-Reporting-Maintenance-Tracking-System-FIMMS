"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, MapPin, PlusCircle, Search, ShieldAlert,
  Wrench, CheckCircle2, BarChart3, Sun, Moon, Download,
  Printer, LogOut, LogIn, User as UserIcon, X, Sparkles, FileText, ChevronRight
} from "lucide-react";
import { api } from "@/lib/api";
import { User } from "@/types";
import { useTheme } from "./ThemeContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [demoSwitching, setDemoSwitching] = useState(false);

  useEffect(() => {
    setCurrentUser(api.getCurrentUser());
  }, [pathname]);

  const handleQuickLogin = async (email: string) => {
    try {
      setDemoSwitching(true);
      await api.login(email, "Freetown2026!");
      setCurrentUser(api.getCurrentUser());
      setDemoSwitching(false);
      window.location.reload();
    } catch (err: any) {
      alert("Demo login error: " + err.message);
      setDemoSwitching(false);
    }
  };

  const isCitizen = currentUser?.role === "citizen";
  const isStaff =
    currentUser &&
    ["administrator", "maintenance_officer", "supervisor"].includes(currentUser.role);

  const navSections: Array<{
    title: string;
    items: Array<{
      label: string;
      href: string;
      icon: any;
      badge?: string;
      highlight?: boolean;
      role?: string[];
    }>;
  }> = [
    {
      title: isCitizen ? "Citizen Portal" : "Core Portals",
      items: [
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
          badge: isCitizen ? "My Account" : "Live",
        },
        { label: "Report a Fault", href: "/report-fault", icon: PlusCircle, highlight: true },
        { label: "Track Reference", href: "/track-report", icon: Search },
        { label: "GIS City Map", href: "/map", icon: MapPin },
      ],
    },
    {
      title: "Admin & Municipal Operations",
      items: [
        {
          label: "All Reports & Fixed",
          href: "/admin/reports",
          icon: FileText,
          badge: "Admin",
          role: ["administrator"],
        },
        { label: "Admin Management", href: "/admin", icon: ShieldAlert, role: ["administrator"] },
        { label: "Field Maintenance", href: "/maintenance", icon: Wrench, role: ["maintenance_officer", "administrator"] },
        { label: "Supervisor Hub", href: "/supervisor", icon: CheckCircle2, role: ["supervisor", "administrator"] },
        { label: "Analytics & SLA", href: "/analytics", icon: BarChart3, role: ["administrator", "supervisor"] },
      ],
    },
  ];

  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.role || (currentUser && item.role.includes(currentUser.role))
      ),
    }))
    .filter((section) => section.items.length > 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Fixed Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top: Logo & City Identity */}
        <div>
          <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group" onClick={onClose}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-sky-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">FIMMS</span>
                  <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    Freetown
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Western Area Urban</p>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Navigation Menu */}
          <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-280px)]">
            {filteredSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {section.title}
                </div>
                <div className="space-y-1 pt-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                            : item.highlight
                            ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-current"}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            isActive ? "bg-white/20 text-white" : "bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300"
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quick Export & Print Actions */}
            <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {isStaff ? "Exports & Reports" : "Print View"}
              </div>
              <div className={`grid ${isStaff ? "grid-cols-2" : "grid-cols-1"} gap-2 pt-1`}>
                {isStaff && (
                  <a
                    href={api.getExportCsvUrl()}
                    download="freetown_infrastructure_faults.csv"
                    className="flex items-center justify-center space-x-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition"
                    title="Download CSV database dump"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>CSV File</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center justify-center space-x-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-sky-50 dark:hover:bg-sky-950/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition"
                  title="Print or export current view to PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Print PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Theme Switcher & User Profile */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B1120]/50 space-y-3">
          {/* Bright / Dark Mood Toggle */}
          <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300/50 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 pl-2">Theme Mode</span>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => { if (theme !== "light") toggleTheme(); }}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  theme === "light"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Sun className="w-3 h-3 text-amber-500" />
                <span>Bright</span>
              </button>
              <button
                type="button"
                onClick={() => { if (theme !== "dark") toggleTheme(); }}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  theme === "dark"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Moon className="w-3 h-3 text-sky-400" />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* User Profile & Prominent Logout Button */}
          {currentUser ? (
            <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-emerald-600/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs flex-shrink-0">
                  {currentUser.full_name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser.full_name}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold capitalize">
                    {currentUser.role.replace("_", " ")}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={api.logout}
                title="Sign out of system"
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white dark:bg-rose-950/60 dark:hover:bg-rose-600 dark:text-rose-300 dark:hover:text-white font-bold text-xs transition border border-rose-200 dark:border-rose-900 shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/login"
                onClick={onClose}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In to Portal</span>
              </Link>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center pt-1">
                Demo Quick Access
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleQuickLogin("citizen@freetown.gov.sl")}
                  disabled={demoSwitching}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:border-emerald-500"
                >
                  Citizen
                </button>
                <button
                  onClick={() => handleQuickLogin("admin@freetown.gov.sl")}
                  disabled={demoSwitching}
                  className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-800 dark:text-emerald-300"
                >
                  Admin
                </button>
                <button
                  onClick={() => handleQuickLogin("officer@freetown.gov.sl")}
                  disabled={demoSwitching}
                  className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-[10px] font-bold text-sky-800 dark:text-sky-300"
                >
                  Officer
                </button>
                <button
                  onClick={() => handleQuickLogin("supervisor@freetown.gov.sl")}
                  disabled={demoSwitching}
                  className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[10px] font-bold text-purple-800 dark:text-purple-300"
                >
                  Supervisor
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
