"use client";

import React from "react";
import FaultForm from "@/components/FaultForm";
import { ShieldCheck, Info } from "lucide-react";

export default function ReportFaultPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Report an Infrastructure Fault
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Provide details, capture your precise GPS coordinates, and optionally attach photograph evidence. Your report will be immediately dispatched for administrative review.
        </p>
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-start space-x-3 text-xs text-emerald-900 dark:text-emerald-300">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Citizen Tip:</span> Turning on your mobile phone's GPS location will automatically lock onto the street or junction where the fault is located in Freetown.
        </div>
      </div>

      <FaultForm />
    </div>
  );
}
