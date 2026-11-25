"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LogIn, LogOut, ShieldCheck, User, Wrench, CheckCircle2,
  AlertCircle, Shield, Award, Sparkles, ArrowRight, Lock
} from "lucide-react";
import { api } from "@/lib/api";
import { SierraLeoneCoatOfArms, SierraLeoneArmyLogo } from "@/components/SierraLeoneEmblems";
import { User as UserType } from "@/types";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeEmblem, setActiveEmblem] = useState<"gov" | "army">("gov");
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  useEffect(() => {
    setCurrentUser(api.getCurrentUser());
  }, []);

  const getPortalForRole = (role?: string) => {
    if (role === "administrator") return "/admin";
    if (role === "maintenance_officer") return "/maintenance";
    if (role === "supervisor") return "/supervisor";
    return "/dashboard";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const data = await api.login(email, password);
      setLoading(false);
      window.location.href = getPortalForRole(data?.user?.role);
    } catch (err: any) {
      setError(err.message || "Failed to log in");
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.login(demoEmail, "Freetown2026!");
      setLoading(false);
      window.location.href = getPortalForRole(data?.user?.role);
    } catch (err: any) {
      setError(err.message || "Failed demo login");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-10">
      {/* Top National Tricolor Ribbon */}
      <div className="h-2 w-full rounded-full overflow-hidden flex shadow-sm mb-6">
        <div className="h-full flex-1 bg-[#1EB53A]" />
        <div className="h-full flex-1 bg-[#FFFFFF] border-y border-slate-200" />
        <div className="h-full flex-1 bg-[#0072C6]" />
      </div>

      {/* Main Side-by-Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* ================= LEFT SIDE: Official Sierra Leone Government / Army Crest Panel ================= */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 via-slate-800 to-[#0A1628] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-slate-700/80 shadow-2xl relative overflow-hidden">
          
          {/* Subtle Background Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>OFFICIAL PORTAL</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">EST. 1961</span>
            </div>

            {/* Title */}
            <div className="space-y-1 mb-6">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center space-x-2">
                <span>REPUBLIC OF SIERRA LEONE</span>
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Government of Sierra Leone &amp; Armed Forces (RSLAF)
              </p>
              <p className="text-[11px] text-emerald-400 font-semibold">
                Western Area Urban Infrastructure Taskforce • FIMMS
              </p>
            </div>

            {/* Emblem Mode Switcher (Government vs Army) */}
            <div className="flex items-center p-1 bg-slate-800/80 rounded-xl border border-slate-700 mb-6 text-xs">
              <button
                type="button"
                onClick={() => setActiveEmblem("gov")}
                className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center space-x-1.5 transition ${
                  activeEmblem === "gov"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Government Crest</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveEmblem("army")}
                className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center space-x-1.5 transition ${
                  activeEmblem === "army"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Armed Forces (RSLAF)</span>
              </button>
            </div>

            {/* Displayed Official Logo */}
            <div className="flex flex-col items-center justify-center py-4 bg-slate-800/40 rounded-2xl border border-slate-700/60 p-4">
              {activeEmblem === "gov" ? (
                <div className="text-center space-y-3">
                  <div className="w-44 h-44 sm:w-48 sm:h-48 mx-auto hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                    <SierraLeoneCoatOfArms className="w-full h-full drop-shadow-xl" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-amber-300 tracking-wider uppercase">
                      Coat of Arms of Sierra Leone
                    </h3>
                    <p className="text-[11px] text-slate-300 italic">
                      "Unity • Freedom • Justice"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <div className="w-44 h-44 sm:w-48 sm:h-48 mx-auto hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                    <SierraLeoneArmyLogo className="w-full h-full drop-shadow-xl" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-emerald-300 tracking-wider uppercase">
                      Sierra Leone Armed Forces
                    </h3>
                    <p className="text-[11px] text-slate-300 italic">
                      "Honour • Duty • Loyalty" &bull; RSLAF
                    </p>
                  </div>
                </div>
              )}

              {/* Side-by-side Dual Mini Badges */}
              <div className="mt-4 pt-3 border-t border-slate-700/60 w-full flex items-center justify-around text-center">
                <div
                  onClick={() => setActiveEmblem("gov")}
                  className={`cursor-pointer px-2 py-1 rounded-lg transition ${
                    activeEmblem === "gov" ? "ring-2 ring-amber-400 bg-amber-400/10" : "opacity-60"
                  }`}
                >
                  <p className="text-[10px] font-bold text-amber-300">Coat of Arms</p>
                  <p className="text-[9px] text-slate-400">Civilian &amp; Municipal</p>
                </div>
                <div className="h-6 w-px bg-slate-700" />
                <div
                  onClick={() => setActiveEmblem("army")}
                  className={`cursor-pointer px-2 py-1 rounded-lg transition ${
                    activeEmblem === "army" ? "ring-2 ring-blue-400 bg-blue-400/10" : "opacity-60"
                  }`}
                >
                  <p className="text-[10px] font-bold text-blue-300">Armed Forces</p>
                  <p className="text-[9px] text-slate-400">Defence &amp; Security</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice at Bottom */}
          <div className="mt-6 pt-4 border-t border-slate-700/70 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Official Government Infrastructure Protection</span>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-400">
              Authorized municipal officers, supervisors, and registered residents of Western Area Urban.
            </p>
          </div>
        </div>

        {/* ================= RIGHT SIDE: Login Form & One-Click Access ================= */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col justify-between space-y-6">
          
          {/* Active Session Notification & Direct Logout */}
          {currentUser && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Currently Signed In: <strong>{currentUser.full_name}</strong></span>
                </div>
                <div className="text-[11px] text-amber-700 dark:text-amber-300 capitalize">
                  Role: {currentUser.role.replace("_", " ")} ({currentUser.email})
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  href="/"
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-sm"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}

          <div>
            <div className="space-y-1 mb-6">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                FIMMS Portal Sign In
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Log in to report, dispatch, or verify public infrastructure faults in Freetown.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Standard Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Government or Citizen Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. admin@freetown.gov.sl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Security Password
                  </label>
                  <span className="text-[10px] text-slate-400">Default: Freetown2026!</span>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? "Authenticating with Government Server..." : "Sign In to FIMMS Portal"}</span>
              </button>
            </form>
          </div>

          {/* Instant Demo Quick Login Selector */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant One-Click Demo Access</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Password auto-filled</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemoLogin("citizen@freetown.gov.sl")}
                disabled={loading}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-left transition flex items-center space-x-2.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:scale-105 transition">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Citizen Resident</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Report &amp; Upvote Faults</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin("admin@freetown.gov.sl")}
                disabled={loading}
                className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-left transition flex items-center space-x-2.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center group-hover:scale-105 transition">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-950 dark:text-emerald-200">Administrator</div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400">Dispatch &amp; SLA Control</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin("officer@freetown.gov.sl")}
                disabled={loading}
                className="p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-left transition flex items-center space-x-2.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-105 transition">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-950 dark:text-blue-200">Maintenance Crew</div>
                  <div className="text-[10px] text-blue-700 dark:text-blue-400">Field Works &amp; Materials</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin("supervisor@freetown.gov.sl")}
                disabled={loading}
                className="p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 text-left transition flex items-center space-x-2.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center group-hover:scale-105 transition">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-purple-950 dark:text-purple-200">Field Supervisor</div>
                  <div className="text-[10px] text-purple-700 dark:text-purple-400">Quality Check &amp; Close</div>
                </div>
              </button>
            </div>
          </div>

          {/* Footer Registration Link */}
          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/register"
              className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-bold inline-flex items-center space-x-1"
            >
              <span>Don't have an account? Register as a resident</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
