"use client";

import { useState, useEffect } from "react";
import { useGetAllSettingsQuery, useUpdateSettingMutation } from "@/redux/api/setting/settingApi";
import { Loader, Save, Settings2, Check } from "lucide-react";
import toast from "react-hot-toast";

const SETTING_LABELS: Record<string, { label: string; description: string; multiline?: boolean }> = {
  hero_title: { label: "Hero Section Title", description: "Main heading shown in the website banner." },
  hero_subtitle: { label: "Hero Subtitle", description: "Subtitle text below the banner heading.", multiline: true },
  support_email: { label: "Support Email", description: "Contact email shown in footer and support pages." },
  support_phone: { label: "Support Phone", description: "Contact phone number for customer support." },
  support_address: { label: "Physical Address", description: "Your store or office address." },
  footer_about: { label: "Footer About Text", description: "Short description of the brand shown in the footer.", multiline: true },
  free_shipping_threshold: { label: "Free Shipping Threshold (৳)", description: "Minimum order amount to qualify for free shipping." },
  inside_dhaka_shipping: { label: "Inside Dhaka Delivery Charge (৳)", description: "Shipping cost for deliveries inside Dhaka area (default: 80)." },
  outside_dhaka_shipping: { label: "Outside Dhaka Delivery Charge (৳)", description: "Shipping cost for deliveries outside Dhaka area (default: 120)." },
};

export default function ContentSettingsPage() {
  const { data, isLoading, error } = useGetAllSettingsQuery();
  const [updateSetting] = useUpdateSettingMutation();

  const [values, setValues] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    if (data?.data?.map) {
      setValues(data.data.map);
    }
  }, [data]);

  const handleSave = async (key: string) => {
    if (!values[key] && values[key] !== "") return;
    setSavingKey(key);
    try {
      await updateSetting({ key, value: values[key] }).unwrap();
      toast.success("Setting saved!");
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 2000);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save setting.");
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-10">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">Admin Panel</p>
        <h1 className="text-3xl font-black text-black uppercase tracking-tight">Site Content</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage dynamic text and configuration settings across your storefront.</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-48">
          <Loader className="animate-spin h-8 w-8 text-zinc-400" />
        </div>
      )}

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 p-6 text-sm font-semibold">
          Failed to load settings. Please try again.
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.keys(SETTING_LABELS).map((key) => {
            const meta = SETTING_LABELS[key];
            const isSaving = savingKey === key;
            const isSaved = savedKey === key;
            return (
              <div key={key} className="bg-white border border-zinc-200 p-6 space-y-3">
                <div className="flex items-start gap-2">
                  <Settings2 className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-black text-black uppercase tracking-wider">{meta.label}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{meta.description}</p>
                  </div>
                </div>

                {meta.multiline ? (
                  <textarea
                    rows={3}
                    value={values[key] || ""}
                    onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full border border-zinc-300 p-3.5 text-sm focus:outline-none focus:border-black placeholder-zinc-400 resize-none"
                    placeholder={`Enter ${meta.label}...`}
                  />
                ) : (
                  <input
                    type="text"
                    value={values[key] || ""}
                    onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full border border-zinc-300 p-3.5 text-sm focus:outline-none focus:border-black placeholder-zinc-400"
                    placeholder={`Enter ${meta.label}...`}
                  />
                )}

                <button
                  onClick={() => handleSave(key)}
                  disabled={isSaving}
                  className={`flex items-center gap-2 text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-full transition cursor-pointer disabled:opacity-50 ${
                    isSaved
                      ? "bg-green-600 text-white"
                      : "bg-black hover:bg-zinc-800 text-white"
                  }`}
                >
                  {isSaving ? (
                    <Loader className="animate-spin h-3.5 w-3.5" />
                  ) : isSaved ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  {isSaved ? "Saved!" : "Save"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
