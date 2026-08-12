"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

export default function PrivacyChoicesPage() {
  const [choices, setChoices] = useState({
    necessary: true,
    targeted: false,
    sharing: false,
    analytics: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Privacy preferences saved successfully!");
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased select-none pb-24">
      {/* Header Banner */}
      <div className="relative bg-zinc-950 text-white py-16 md:py-24 overflow-hidden border-b border-zinc-900">
        <div className="absolute top-0 right-0 w-80 h-80 bg-zinc-800 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-16 relative z-10 flex flex-col items-center text-center">
          <p className="text-xs font-black uppercase tracking-widest text-[#507c68] mb-2">Cookie & Data Consent</p>
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
            YOUR PRIVACY CHOICES
          </h1>
          <p className="text-base text-zinc-400 mt-2 max-w-xl font-medium">
            Manage how Pristto uses cookies and tracks advertising preferences.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 mt-12 md:mt-16">
        <form onSubmit={handleSave} className="space-y-8 font-medium text-zinc-600 text-sm md:text-base leading-relaxed">
          
          <p className="text-zinc-500 text-sm">
            In compliance with international data privacy guidelines, we respect your rights to control what data is shared. Use the toggles below to configure your preferences.
          </p>

          {/* Necessary */}
          <div className="flex items-start justify-between p-5 border border-zinc-200 bg-zinc-50/50 rounded-2xl">
            <div className="space-y-1 pr-6">
              <span className="block font-bold text-black uppercase text-xs tracking-wider">Strictly Necessary Cookies</span>
              <p className="text-xs text-zinc-400">Required to manage product cart cache, logging sessions, security tokens, and user database routing. Cannot be turned off.</p>
            </div>
            <input
              type="checkbox"
              checked={choices.necessary}
              disabled
              className="h-5 w-5 accent-zinc-500 rounded cursor-not-allowed shrink-0 mt-1"
            />
          </div>

          {/* Targeted */}
          <div className="flex items-start justify-between p-5 border border-zinc-200 bg-white rounded-2xl">
            <div className="space-y-1 pr-6">
              <span className="block font-bold text-black uppercase text-xs tracking-wider">Targeted Advertising Cookies</span>
              <p className="text-xs text-zinc-400">Allows social media networks and custom search engines to trace your products views and render matching ads across web channels.</p>
            </div>
            <input
              type="checkbox"
              checked={choices.targeted}
              onChange={(e) => setChoices((p) => ({ ...p, targeted: e.target.checked }))}
              className="h-5 w-5 accent-black rounded cursor-pointer shrink-0 mt-1"
            />
          </div>

          {/* Sharing */}
          <div className="flex items-start justify-between p-5 border border-zinc-200 bg-white rounded-2xl">
            <div className="space-y-1 pr-6">
              <span className="block font-bold text-black uppercase text-xs tracking-wider">Sales or Sharing of Personal Data</span>
              <p className="text-xs text-zinc-400">Opt-out of sharing or processing of personal records for targeted advertisements or third-party analytical statistics.</p>
            </div>
            <input
              type="checkbox"
              checked={choices.sharing}
              onChange={(e) => setChoices((p) => ({ ...p, sharing: e.target.checked }))}
              className="h-5 w-5 accent-black rounded cursor-pointer shrink-0 mt-1"
            />
          </div>

          {/* Analytics */}
          <div className="flex items-start justify-between p-5 border border-zinc-200 bg-white rounded-2xl">
            <div className="space-y-1 pr-6">
              <span className="block font-bold text-black uppercase text-xs tracking-wider">Analytics & Reporting Cookies</span>
              <p className="text-xs text-zinc-400">Let us count visits and evaluate website speed metrics so we can improve layout loading performance.</p>
            </div>
            <input
              type="checkbox"
              checked={choices.analytics}
              onChange={(e) => setChoices((p) => ({ ...p, analytics: e.target.checked }))}
              className="h-5 w-5 accent-black rounded cursor-pointer shrink-0 mt-1"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black hover:bg-zinc-800 text-white font-bold py-4 text-xs uppercase tracking-wider rounded-full transition cursor-pointer"
          >
            Save Preferences
          </button>
        </form>
      </div>
    </div>
  );
}
