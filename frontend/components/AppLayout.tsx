"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import AppHeader from "./AppHeader";
import { ThemeProvider } from "./ThemeContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
        {/* Fixed Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content View with Fixed Header and Scroll Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
          <AppHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto">
            {children}
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
    </ThemeProvider>
  );
}
