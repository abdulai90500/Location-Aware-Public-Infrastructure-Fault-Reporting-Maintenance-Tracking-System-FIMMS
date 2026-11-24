"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LogIn, ShieldCheck, User, Wrench, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await api.login(email, password);
      setLoading(false);
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "Failed to log in");
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    try {
      setLoading(true);
      setError(null);
      await api.login(demoEmail, "Freetown2026!");
      setLoading(false);
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "Failed demo login");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pt-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">FIMMS System Login</h1>
        <p className="text-xs text-slate-600">
          Sign in to your municipal, maintenance, or citizen account.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. admin@freetown.gov.sl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* Demo Fast Login Selector */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="text-center">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Instant Demo Quick Login
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin("citizen@freetown.gov.sl")}
              disabled={loading}
              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex items-center space-x-2"
            >
              <User className="w-4 h-4 text-slate-600" />
              <div>
                <div className="text-xs font-bold text-slate-900">Citizen</div>
                <div className="text-[10px] text-slate-500">Report &amp; Track</div>
              </div>
            </button>

            <button
              onClick={() => handleDemoLogin("admin@freetown.gov.sl")}
              disabled={loading}
              className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left transition flex items-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <div>
                <div className="text-xs font-bold text-emerald-950">Administrator</div>
                <div className="text-[10px] text-emerald-700">Assign &amp; Review</div>
              </div>
            </button>

            <button
              onClick={() => handleDemoLogin("officer@freetown.gov.sl")}
              disabled={loading}
              className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-left transition flex items-center space-x-2"
            >
              <Wrench className="w-4 h-4 text-blue-700" />
              <div>
                <div className="text-xs font-bold text-blue-950">Maintenance</div>
                <div className="text-[10px] text-blue-700">Field Updates</div>
              </div>
            </button>

            <button
              onClick={() => handleDemoLogin("supervisor@freetown.gov.sl")}
              disabled={loading}
              className="p-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-left transition flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4 text-purple-700" />
              <div>
                <div className="text-xs font-bold text-purple-950">Supervisor</div>
                <div className="text-[10px] text-purple-700">Verify &amp; Close</div>
              </div>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center font-mono">
            Default Demo Password: Freetown2026!
          </p>
        </div>

        <div className="text-center pt-2">
          <Link href="/register" className="text-xs text-emerald-700 hover:underline font-semibold">
            Don't have an account? Register as a resident
          </Link>
        </div>
      </div>
    </div>
  );
}
