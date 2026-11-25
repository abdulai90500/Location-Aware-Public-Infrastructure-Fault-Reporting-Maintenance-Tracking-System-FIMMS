"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Sun, Moon, Lock, ArrowRight } from "lucide-react";
import Sidebar from "./Sidebar";
import AppHeader from "./AppHeader";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { api } from "@/lib/api";

function AuthHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 px-4 sm:px-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md">
      <Link
        href="/"
        className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Public Portal</span>
      </Link>
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
          <span className="w-4 h-3 rounded-xs overflow-hidden flex flex-col border border-slate-300 dark:border-slate-700 shadow-xs" title="Republic of Sierra Leone">
            <span className="h-1 bg-[#1EB53A]" />
            <span className="h-1 bg-[#FFFFFF]" />
            <span className="h-1 bg-[#0072C6]" />
          </span>
          <span className="hidden sm:inline">Republic of Sierra Leone</span>
        </div>
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
      </div>
    </header>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const user = api.getCurrentUser();
    setCurrentUserRole(user?.role || null);
  }, [pathname]);

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const staffOnlyPaths = ["/admin", "/maintenance", "/supervisor", "/analytics"];
  const isCitizenBlockedFromStaff =
    currentUserRole === "citizen" && staffOnlyPaths.includes(pathname);

  return (
    <ThemeProvider>
      {isAuthPage ? (
        /* Full-screen dedicated authentication layout without sidebar or dashboard header */
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
          <AuthHeader />

          <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 max-w-6xl w-full mx-auto">
            {children}
          </main>

          <footer className="py-4 px-4 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0F172A] text-center text-xs text-slate-500 dark:text-slate-400">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                <strong>Republic of Sierra Leone</strong> &bull; FIMMS Public Infrastructure Monitoring &amp; Maintenance Tracking System
              </div>
              <div className="text-slate-400">
                Western Area Urban Taskforce &bull; Freetown City Council
              </div>
            </div>
          </footer>
        </div>
      ) : (
        /* Standard Portal Layout with Sidebar and Header */
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
          {/* Fixed Sidebar */}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Main Content View with Fixed Header and Scroll Area */}
          <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
            <AppHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            
            <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto">
              {isCitizenBlockedFromStaff ? (
                <div className="max-w-lg mx-auto my-12 bg-white dark:bg-[#1E293B] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-lg text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                    <Lock className="w-7 h-7" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    Personal Citizen Account Only
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Municipal staff portals are restricted to authorized Government &amp; City Council personnel. Your account is configured to view and manage your own submitted reports only.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
                    >
                      <span>Go to My Account &amp; Faults</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                children
              )}
            </main>

            <footer className="py-6 px-4 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0F172A] text-center text-xs text-slate-500 dark:text-slate-400 no-print">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
                <div>
                  <strong>FIMMS Freetown</strong> &bull; Location-Aware Public Infrastructure Fault Reporting &amp; Maintenance Tracking System
                </div>
                <div className="flex items-center space-x-3 text-slate-400">
                  <span>Western Area Urban Pilot</span>
                  <span>&bull;</span>
                  <span>FCC &amp; Ministry of Works</span>
                </div>
              </div>
            </footer>
          </div>
        </div>
      )}
    </ThemeProvider>
  );
}
