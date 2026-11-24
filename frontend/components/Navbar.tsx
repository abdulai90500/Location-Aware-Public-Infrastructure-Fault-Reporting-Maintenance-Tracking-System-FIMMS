"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin, ShieldAlert, Wrench, BarChart3, Search, PlusCircle,
  LogIn, LogOut, User as UserIcon, Menu, X, CheckCircle2, Bell
} from "lucide-react";
import { api } from "@/lib/api";
import { User, NotificationItem } from "@/types";

export default function Navbar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoSwitching, setDemoSwitching] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const loadNotifications = () => {
    if (api.getCurrentUser()) {
      api.getNotifications()
        .then((data) => setNotifications(data || []))
        .catch(() => {});
    }
  };

  useEffect(() => {
    const user = api.getCurrentUser();
    setCurrentUser(user);
    if (user) {
      loadNotifications();
    }
  }, [pathname]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkRead = async (notifId: number) => {
    try {
      await api.markNotificationRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
      );
    } catch {}
  };

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

  const navLinks = [
    { label: "Home", href: "/", icon: MapPin },
    { label: "Report Fault", href: "/report-fault", icon: PlusCircle, highlight: true },
    { label: "Track Fault", href: "/track-report", icon: Search },
    { label: "City Map", href: "/map", icon: MapPin },
    { label: "Admin", href: "/admin", icon: ShieldAlert, role: ["administrator"] },
    { label: "Maintenance", href: "/maintenance", icon: Wrench, role: ["maintenance_officer", "administrator"] },
    { label: "Supervisor", href: "/supervisor", icon: CheckCircle2, role: ["supervisor", "administrator"] },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
  ];

  const visibleLinks = navLinks.filter(
    (item) => !item.role || (currentUser && item.role.includes(currentUser.role))
  );

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & City Identity */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-sky-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">FIMMS</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Freetown
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Western Area Urban Fault Tracker</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {visibleLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : item.highlight
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Session & Demo Role Switcher */}
          <div className="hidden lg:flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl relative transition"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
                    )}
                  </button>

                  {/* Dropdown */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-900">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={async () => {
                              await api.markAllNotificationsRead();
                              loadNotifications();
                            }}
                            className="text-[10px] text-emerald-700 font-semibold hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400 italic">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleMarkRead(n.id)}
                              className={`p-3 text-xs cursor-pointer transition ${
                                !n.is_read ? "bg-emerald-50/60 font-semibold" : "text-slate-600"
                              }`}
                            >
                              <p className="line-clamp-2 text-slate-800">{n.message}</p>
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

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">{currentUser.full_name}</div>
                  <div className="text-[11px] capitalize text-emerald-700 font-semibold flex items-center justify-end space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{currentUser.role.replace("_", " ")}</span>
                  </div>
                </div>
                <button
                  onClick={api.logout}
                  title="Sign out"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="flex items-center rounded-lg bg-slate-100 p-1 text-xs">
                  <span className="text-[11px] text-slate-500 px-2 font-medium">Demo:</span>
                  <button
                    onClick={() => handleQuickLogin("citizen@freetown.gov.sl")}
                    disabled={demoSwitching}
                    className="px-2 py-1 rounded hover:bg-white text-slate-700 font-medium transition"
                  >
                    Citizen
                  </button>
                  <button
                    onClick={() => handleQuickLogin("admin@freetown.gov.sl")}
                    disabled={demoSwitching}
                    className="px-2 py-1 rounded hover:bg-white text-emerald-700 font-semibold transition"
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => handleQuickLogin("officer@freetown.gov.sl")}
                    disabled={demoSwitching}
                    className="px-2 py-1 rounded hover:bg-white text-blue-700 font-semibold transition"
                  >
                    Officer
                  </button>
                  <button
                    onClick={() => handleQuickLogin("supervisor@freetown.gov.sl")}
                    disabled={demoSwitching}
                    className="px-2 py-1 rounded hover:bg-white text-purple-700 font-semibold transition"
                  >
                    Supervisor
                  </button>
                </div>
                <Link
                  href="/login"
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : item.highlight
                    ? "bg-emerald-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 border-t border-slate-200">
            {currentUser ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900">{currentUser.full_name}</div>
                  <div className="text-xs text-slate-500 capitalize">{currentUser.role.replace("_", " ")}</div>
                </div>
                <button
                  onClick={api.logout}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 border border-rose-200 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500">Quick Demo Switcher:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleQuickLogin("citizen@freetown.gov.sl")}
                    className="p-2 text-xs font-semibold bg-slate-100 rounded-lg text-slate-800"
                  >
                    Citizen
                  </button>
                  <button
                    onClick={() => handleQuickLogin("admin@freetown.gov.sl")}
                    className="p-2 text-xs font-semibold bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200"
                  >
                    Administrator
                  </button>
                  <button
                    onClick={() => handleQuickLogin("officer@freetown.gov.sl")}
                    className="p-2 text-xs font-semibold bg-blue-50 text-blue-800 rounded-lg border border-blue-200"
                  >
                    Maintenance Officer
                  </button>
                  <button
                    onClick={() => handleQuickLogin("supervisor@freetown.gov.sl")}
                    className="p-2 text-xs font-semibold bg-purple-50 text-purple-800 rounded-lg border border-purple-200"
                  >
                    Supervisor
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
