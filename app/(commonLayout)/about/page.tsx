"use client";

import { useGetAllSettingsQuery } from "@/redux/api/setting/settingApi";

export default function AboutPage() {
  const { data: settingsResponse } = useGetAllSettingsQuery();
  const settings = settingsResponse?.data?.map || {};
  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased select-none pb-24">
      {/* Header Banner */}
      <div className="relative bg-zinc-950 text-white py-16 md:py-24 overflow-hidden border-b border-zinc-900">
        <div className="absolute top-0 right-0 w-80 h-80 bg-zinc-800 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-16 relative z-10 flex flex-col items-center text-center">
          <p className="text-xs font-black uppercase tracking-widest text-[#507c68] mb-2">Our Mission</p>
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
            ABOUT PRISTTO
          </h1>
          <p className="text-base text-zinc-400 mt-2 max-w-xl font-medium">
            Redefining premium apparel and lifestyle essentials from the heart of Dhaka.
          </p>
        </div>
      </div>

      {/* Main content grid */}
      <div className="max-w-4xl mx-auto px-6 mt-12 md:mt-16 space-y-12">
        <div className="space-y-6">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">Who We Are</h2>
          <p className="text-zinc-600 font-medium text-sm md:text-base leading-relaxed">
            Pristto is a premium e-commerce brand specializing in modern footwear, high-end sportswear, and everyday premium accessories. Established with the vision to bridge state-of-the-art product engineering with minimalist aesthetic standards, we deliver world-class apparel straight to your doorstep.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-b border-zinc-100 py-10">
          <div className="space-y-2">
            <h3 className="font-black text-sm uppercase tracking-wider text-black">Dhaka Head Office</h3>
            <p className="text-xs text-zinc-500 font-bold uppercase leading-relaxed">
              {settings.support_address || "Rampura Banasree, Dhaka-1219"}
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-black text-sm uppercase tracking-wider text-black">Customer Care</h3>
            <p className="text-xs text-zinc-500 font-bold uppercase leading-relaxed">
              {settings.support_email || "support@pristto.com"}<br/>Available 24/7 online
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-black text-sm uppercase tracking-wider text-black">Our Guarantee</h3>
            <p className="text-xs text-zinc-500 font-bold uppercase leading-relaxed">
              100% Authentic Products<br/>Easy 7-day returns
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 bg-zinc-50 border border-zinc-100">
              <h4 className="font-black text-sm uppercase mb-2">01 / Innovation</h4>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                Using engineered fabrics that stretch, breathe, and adapt to your movements seamlessly.
              </p>
            </div>
            <div className="p-5 bg-zinc-50 border border-zinc-100">
              <h4 className="font-black text-sm uppercase mb-2">02 / Minimal Design</h4>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                Eliminating the noise. We believe in bold silhouettes, solid colorways, and timeless cuts.
              </p>
            </div>
            <div className="p-5 bg-zinc-50 border border-zinc-100">
              <h4 className="font-black text-sm uppercase mb-2">03 / Integrity</h4>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                Ensuring fair wages for all tailors and craftsmen, and moving towards fully sustainable packaging.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
