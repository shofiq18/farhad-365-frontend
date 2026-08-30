"use client";

import { useState, useEffect, useRef } from "react";
import { useGetAllSettingsQuery, useUpdateSettingMutation } from "@/redux/api/setting/settingApi";
import { 
  Loader, 
  Save, 
  Settings2, 
  Check, 
  Video, 
  Film, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  Layout, 
  Sliders,
  Eye,
  Upload,
  Image as ImageIcon,
  FileVideo,
  Radio,
  CheckCircle2,
  Tv
} from "lucide-react";
import toast from "react-hot-toast";

export interface CarouselSlide {
  id: string;
  image: string;
  tag: string;
  title: string;
  subtitle: string;
  primaryBtnText: string;
  primaryLink: string;
  secondaryBtnText?: string;
  secondaryLink?: string;
}

const GENERAL_SETTING_LABELS: Record<string, { label: string; description: string; multiline?: boolean }> = {
  support_email: { label: "Support Email", description: "Contact email shown in footer and support pages." },
  support_phone: { label: "Support Phone", description: "Contact phone number for customer support." },
  support_address: { label: "Physical Address", description: "Your store or office address." },
  footer_about: { label: "Footer About Text", description: "Short description of the brand shown in the footer.", multiline: true },
  free_shipping_threshold: { label: "Free Shipping Threshold (৳)", description: "Minimum order amount to qualify for free shipping." },
  inside_dhaka_shipping: { label: "Inside Dhaka Delivery Charge (৳)", description: "Shipping cost for deliveries inside Dhaka area (default: 80)." },
  outside_dhaka_shipping: { label: "Outside Dhaka Delivery Charge (৳)", description: "Shipping cost for deliveries outside Dhaka area (default: 120)." },
  promo_banner_title: { label: "Promo Banner Title", description: "Headline text shown on top marketing bar (e.g. BACK TO SCHOOL SALE)." },
  promo_banner_offer: { label: "Promo Banner Offer", description: "Offer text shown on top marketing bar (e.g. EXTRA 25% OFF)." },
  promo_banner_code: { label: "Promo Banner Coupon Code", description: "Coupon code shown on top marketing bar (e.g. DAYONE)." },
  promo_banner_subtitle: { label: "Promo Banner Subtitle", description: "Subtitle shown under offer text (e.g. SELECT STYLES)." },
};

export default function ContentSettingsPage() {
  const { data, isLoading, error } = useGetAllSettingsQuery();
  const [updateSetting] = useUpdateSettingMutation();

  const [activeTab, setActiveTab] = useState<"hero" | "general">("hero");
  const [heroSubTab, setHeroSubTab] = useState<"carousel" | "video">("carousel");

  const [values, setValues] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  // Uploading states
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingSlideImage, setIsUploadingSlideImage] = useState(false);

  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const slideImageFileInputRef = useRef<HTMLInputElement>(null);

  // Carousel slides state
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [isSavingSlides, setIsSavingSlides] = useState(false);

  useEffect(() => {
    if (data?.data?.map) {
      setValues(data.data.map);
      
      const mode = data.data.map.hero_mode || "CAROUSEL";
      setHeroSubTab(mode === "VIDEO" ? "video" : "carousel");

      // Parse slides if available
      try {
        if (data.data.map.hero_carousel_slides) {
          const parsed = JSON.parse(data.data.map.hero_carousel_slides);
          if (Array.isArray(parsed)) {
            setSlides(parsed);
          }
        }
      } catch (err) {
        console.error("Failed to parse hero_carousel_slides:", err);
      }
    }
  }, [data]);

  // Helper to compute SHA-1 hash for Cloudinary signature
  const sha1 = async (str: string): Promise<string> => {
    const buffer = new TextEncoder().encode(str);
    const hashBuffer = await window.crypto.subtle.digest("SHA-1", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  // Helper to upload media file directly to Cloudinary using Signed API
  const uploadMediaFile = async (file: File, type: "video" | "image"): Promise<string> => {
    const toastId = toast.loading(`Uploading ${type} to Cloudinary...`);

    try {
      const cloudName = "dlzbuti48";
      const apiKey = "914499938576199";
      const apiSecret = "eK4x1208LjBIhlX21dDB7AQYQhU";
      const timestamp = Math.floor(Date.now() / 1000).toString();

      // Signed upload signature formula: timestamp=<timestamp><api_secret>
      const strToSign = `timestamp=${timestamp}${apiSecret}`;
      const signature = await sha1(strToSign);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (data.secure_url) {
          toast.success(`${type.toUpperCase()} uploaded successfully!`, { id: toastId });
          return data.secure_url;
        }
      }
      
      const errData = await res.json();
      console.error("Cloudinary error:", errData);
      toast.error(errData?.error?.message || "Cloudinary upload failed.", { id: toastId });
      throw new Error("Upload failed");
    } catch (err: any) {
      toast.error(err?.message || `Failed to upload ${type} file.`, { id: toastId });
      throw err;
    }
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video file (.mp4, .webm, .mov)");
      return;
    }

    setIsUploadingVideo(true);
    try {
      const url = await uploadMediaFile(file, "video");
      setValues((prev) => ({ ...prev, hero_video_url: url }));
    } catch (err) {
      toast.error("Video upload failed.");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleSlideImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingSlide) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (.jpg, .png, .webp)");
      return;
    }

    setIsUploadingSlideImage(true);
    try {
      const url = await uploadMediaFile(file, "image");
      setEditingSlide((prev) => prev ? { ...prev, image: url } : null);
    } catch (err) {
      toast.error("Image upload failed.");
    } finally {
      setIsUploadingSlideImage(false);
    }
  };

  const handleSaveSetting = async (key: string, customValue?: string) => {
    const val = customValue !== undefined ? customValue : values[key];
    if (val === undefined) return;
    
    setSavingKey(key);
    try {
      await updateSetting({ key, value: val }).unwrap();
      toast.success(`Updated ${key.replace(/_/g, " ")}`);
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 2000);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save setting.");
    } finally {
      setSavingKey(null);
    }
  };

  const handleActivateMode = async (mode: "CAROUSEL" | "VIDEO") => {
    setValues((prev) => ({ ...prev, hero_mode: mode }));
    await handleSaveSetting("hero_mode", mode);
    toast.success(`Active Website Hero set to: ${mode === "VIDEO" ? "Video Showcase" : "Carousel Slider"}`);
  };

  // Video Section Save handler
  const handleSaveVideoSettings = async () => {
    setSavingKey("video_all");
    try {
      const keysToSave = [
        "hero_video_url",
        "hero_video_tag",
        "hero_video_title",
        "hero_video_subtitle",
        "hero_video_primary_btn_text",
        "hero_video_primary_btn_link",
        "hero_video_secondary_btn_text",
        "hero_video_secondary_btn_link",
      ];

      await Promise.all(
        keysToSave.map((key) =>
          updateSetting({ key, value: values[key] || "" }).unwrap()
        )
      );

      toast.success("Video Hero settings saved successfully!");
      setSavedKey("video_all");
      setTimeout(() => setSavedKey(null), 2000);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save video hero settings.");
    } finally {
      setSavingKey(null);
    }
  };

  // Slide CRUD Operations
  const handleSaveSlidesToDB = async (newSlides: CarouselSlide[]) => {
    setIsSavingSlides(true);
    try {
      const serialized = JSON.stringify(newSlides);
      await updateSetting({ key: "hero_carousel_slides", value: serialized }).unwrap();
      setSlides(newSlides);
      toast.success("Carousel slides updated and saved!");
    } catch (err: any) {
      toast.error("Failed to save slides.");
    } finally {
      setIsSavingSlides(false);
    }
  };

  const handleOpenSlideModal = (slide?: CarouselSlide) => {
    if (slide) {
      setEditingSlide({ ...slide });
    } else {
      setEditingSlide({
        id: `slide-${Date.now()}`,
        image: "/corousal1.webp",
        tag: "NEW COLLECTION",
        title: "NEW HERO TITLE",
        subtitle: "Add engaging subtext description for this slide.",
        primaryBtnText: "Shop Collection",
        primaryLink: "/shop",
        secondaryBtnText: "Explore More",
        secondaryLink: "/shop",
      });
    }
    setIsSlideModalOpen(true);
  };

  const handleSaveSingleSlide = async () => {
    if (!editingSlide) return;
    if (!editingSlide.image || !editingSlide.title) {
      toast.error("Slide image URL and title are required!");
      return;
    }

    const index = slides.findIndex((s) => s.id === editingSlide.id);
    let updated: CarouselSlide[];
    if (index >= 0) {
      updated = [...slides];
      updated[index] = editingSlide;
    } else {
      updated = [...slides, editingSlide];
    }

    await handleSaveSlidesToDB(updated);
    setIsSlideModalOpen(false);
    setEditingSlide(null);
  };

  const handleDeleteSlide = async (id: string) => {
    if (slides.length <= 1) {
      toast.error("At least one slide is required for the carousel!");
      return;
    }
    if (!confirm("Are you sure you want to delete this carousel slide?")) return;
    const updated = slides.filter((s) => s.id !== id);
    await handleSaveSlidesToDB(updated);
  };

  const handleMoveSlide = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const updated = [...slides];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    await handleSaveSlidesToDB(updated);
  };

  const activeMode = values.hero_mode || "CAROUSEL";

  return (
    <div className="min-h-screen bg-zinc-50 p-4 sm:p-6 md:p-10 font-sans">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={videoFileInputRef}
        onChange={handleVideoFileUpload}
        accept="video/*"
        className="hidden"
      />
      <input
        type="file"
        ref={slideImageFileInputRef}
        onChange={handleSlideImageFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">Admin Panel</p>
          <h1 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-tight">Site Content & Hero Manager</h1>
          <p className="text-sm text-zinc-500 mt-1">Configure your storefront Hero Section (Video vs Carousel) and upload custom media.</p>
        </div>

        {/* Storefront Live Link */}
        <a 
          href="/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition self-start md:self-auto shadow-sm cursor-pointer"
        >
          <Eye className="h-4 w-4" />
          View Storefront
        </a>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-zinc-200 mb-8 bg-white rounded-xl p-1.5 shadow-sm max-w-md">
        <button
          onClick={() => setActiveTab("hero")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer ${
            activeTab === "hero"
              ? "bg-black text-white shadow-md"
              : "text-zinc-500 hover:text-black hover:bg-zinc-100"
          }`}
        >
          <Sliders className="h-4 w-4" />
          Hero Section Manager
        </button>
        <button
          onClick={() => setActiveTab("general")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer ${
            activeTab === "general"
              ? "bg-black text-white shadow-md"
              : "text-zinc-500 hover:text-black hover:bg-zinc-100"
          }`}
        >
          <Settings2 className="h-4 w-4" />
          General Site Settings
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-48">
          <Loader className="animate-spin h-8 w-8 text-zinc-400" />
        </div>
      )}

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 p-6 text-sm font-semibold rounded-2xl">
          Failed to load settings from server. Please check backend connection.
        </div>
      )}

      {!isLoading && !error && activeTab === "hero" && (
        <div className="space-y-8">
          
          {/* ── TOP BANNER: ACTIVE STOREFRONT HERO MODE CONTROLLER ── */}
          <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-black text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-zinc-800 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#9eff00] text-black text-[10px] font-black uppercase tracking-widest rounded-full mb-3 shadow-sm">
                  <Tv className="h-3.5 w-3.5" /> STOREFRONT LIVE STATUS
                </span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                  Currently Active: <span className="text-[#9eff00] drop-shadow">{activeMode === "VIDEO" ? "VIDEO SHOWCASE" : "CAROUSEL SLIDER"}</span>
                </h2>
                <p className="text-xs text-zinc-300 mt-1.5 max-w-xl leading-relaxed font-medium">
                  Switch the live homepage banner anytime with 1 click. You can configure both Video settings and Carousel slides below anytime.
                </p>
              </div>

              {/* Mode Activation Action Cards */}
              <div className="flex flex-col sm:flex-row items-stretch gap-3 shrink-0">
                
                {/* Activate Carousel Card */}
                <button
                  type="button"
                  onClick={() => handleActivateMode("CAROUSEL")}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition cursor-pointer text-left ${
                    activeMode === "CAROUSEL"
                      ? "bg-[#9eff00] text-black border-[#9eff00] shadow-lg scale-105"
                      : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                  }`}
                >
                  <Layout className="h-6 w-6 shrink-0" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black uppercase tracking-wider">Carousel Slider</span>
                      {activeMode === "CAROUSEL" && <CheckCircle2 className="h-4 w-4 fill-black text-[#9eff00]" />}
                    </div>
                    <span className="text-[10px] block opacity-80 font-semibold">
                      {activeMode === "CAROUSEL" ? "LIVE ON HOMEPAGE" : "Click to Activate"}
                    </span>
                  </div>
                </button>

                {/* Activate Video Card */}
                <button
                  type="button"
                  onClick={() => handleActivateMode("VIDEO")}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition cursor-pointer text-left ${
                    activeMode === "VIDEO"
                      ? "bg-[#9eff00] text-black border-[#9eff00] shadow-lg scale-105"
                      : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                  }`}
                >
                  <Video className="h-6 w-6 shrink-0" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black uppercase tracking-wider">Video Showcase</span>
                      {activeMode === "VIDEO" && <CheckCircle2 className="h-4 w-4 fill-black text-[#9eff00]" />}
                    </div>
                    <span className="text-[10px] block opacity-80 font-semibold">
                      {activeMode === "VIDEO" ? "LIVE ON HOMEPAGE" : "Click to Activate"}
                    </span>
                  </div>
                </button>

              </div>
            </div>
          </div>

          {/* ── SECTION SWITCHER TABS (EDIT CAROUSEL VS EDIT VIDEO) ── */}
          <div className="flex border-b border-zinc-200 bg-white rounded-2xl p-1.5 shadow-sm max-w-xl">
            <button
              onClick={() => setHeroSubTab("carousel")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                heroSubTab === "carousel"
                  ? "bg-black text-white shadow-md"
                  : "text-zinc-500 hover:text-black hover:bg-zinc-100"
              }`}
            >
              <Layout className="h-4 w-4" />
              Configure Carousel Slides ({slides.length})
              {activeMode === "CAROUSEL" && (
                <span className="w-2 h-2 rounded-full bg-[#9eff00] animate-pulse" title="Active on Website" />
              )}
            </button>
            <button
              onClick={() => setHeroSubTab("video")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                heroSubTab === "video"
                  ? "bg-black text-white shadow-md"
                  : "text-zinc-500 hover:text-black hover:bg-zinc-100"
              }`}
            >
              <Film className="h-4 w-4" />
              Configure Video Showcase
              {activeMode === "VIDEO" && (
                <span className="w-2 h-2 rounded-full bg-[#9eff00] animate-pulse" title="Active on Website" />
              )}
            </button>
          </div>

          {/* ────────────────── VIDEO SHOWCASE FORM SECTION ────────────────── */}
          {heroSubTab === "video" && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <Film className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-black uppercase tracking-tight text-black">Video Showcase Settings</h3>
                </div>
                
                <div className="flex items-center gap-3">
                  {activeMode !== "VIDEO" && (
                    <button
                      onClick={() => handleActivateMode("VIDEO")}
                      className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-sm"
                    >
                      <Sparkles className="h-3.5 w-3.5" /> Make Live on Website
                    </button>
                  )}

                  <button
                    onClick={handleSaveVideoSettings}
                    disabled={savingKey === "video_all"}
                    className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                  >
                    {savingKey === "video_all" ? (
                      <Loader className="animate-spin h-3.5 w-3.5" />
                    ) : savedKey === "video_all" ? (
                      <Check className="h-3.5 w-3.5 text-green-400" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    {savedKey === "video_all" ? "Saved All!" : "Save Video Settings"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inputs & Video File Upload */}
                <div className="space-y-4">
                  {/* Upload Video Box */}
                  <div className="border-2 border-dashed border-zinc-300 hover:border-black rounded-2xl p-5 bg-zinc-50 transition text-center flex flex-col items-center justify-center gap-2">
                    <FileVideo className="h-8 w-8 text-zinc-400" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-black">Upload Video File</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Select a local video file (.mp4, .webm, .mov) from your computer</p>
                    </div>

                    <button
                      type="button"
                      disabled={isUploadingVideo}
                      onClick={() => videoFileInputRef.current?.click()}
                      className="mt-2 inline-flex items-center gap-2 bg-zinc-950 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer disabled:opacity-50 shadow-sm"
                    >
                      {isUploadingVideo ? (
                        <Loader className="animate-spin h-4 w-4" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {isUploadingVideo ? "Uploading Video..." : "Choose Video File"}
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1">
                      Video Source Link (Auto-filled on upload)
                    </label>
                    <input
                      type="text"
                      value={values.hero_video_url || ""}
                      onChange={(e) => setValues((prev) => ({ ...prev, hero_video_url: e.target.value }))}
                      placeholder="e.g. /videos/gym.mp4 or https://..."
                      className="w-full border border-zinc-300 rounded-xl p-3 text-sm focus:outline-none focus:border-black font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1">
                      Category Tag / Label
                    </label>
                    <input
                      type="text"
                      value={values.hero_video_tag || ""}
                      onChange={(e) => setValues((prev) => ({ ...prev, hero_video_tag: e.target.value }))}
                      placeholder="e.g. PRISTTO MOTION or JUST RELEASED"
                      className="w-full border border-zinc-300 rounded-xl p-3 text-sm focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1">
                      Video Hero Title
                    </label>
                    <input
                      type="text"
                      value={values.hero_video_title || ""}
                      onChange={(e) => setValues((prev) => ({ ...prev, hero_video_title: e.target.value }))}
                      placeholder="e.g. WIN ON YOUR TERMS"
                      className="w-full border border-zinc-300 rounded-xl p-3 text-sm focus:outline-none focus:border-black font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1">
                      Subtitle / Description
                    </label>
                    <textarea
                      rows={3}
                      value={values.hero_video_subtitle || ""}
                      onChange={(e) => setValues((prev) => ({ ...prev, hero_video_subtitle: e.target.value }))}
                      placeholder="Enter engaging subtitle description..."
                      className="w-full border border-zinc-300 rounded-xl p-3 text-sm focus:outline-none focus:border-black resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1">
                        Primary Button Text
                      </label>
                      <input
                        type="text"
                        value={values.hero_video_primary_btn_text || ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, hero_video_primary_btn_text: e.target.value }))}
                        placeholder="Shop Collection"
                        className="w-full border border-zinc-300 rounded-xl p-3 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1">
                        Primary Link
                      </label>
                      <input
                        type="text"
                        value={values.hero_video_primary_btn_link || ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, hero_video_primary_btn_link: e.target.value }))}
                        placeholder="/shop"
                        className="w-full border border-zinc-300 rounded-xl p-3 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1">
                        Secondary Button Text
                      </label>
                      <input
                        type="text"
                        value={values.hero_video_secondary_btn_text || ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, hero_video_secondary_btn_text: e.target.value }))}
                        placeholder="Shop Men's"
                        className="w-full border border-zinc-300 rounded-xl p-3 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1">
                        Secondary Link
                      </label>
                      <input
                        type="text"
                        value={values.hero_video_secondary_btn_link || ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, hero_video_secondary_btn_link: e.target.value }))}
                        placeholder="/shop?targetGroup=MEN"
                        className="w-full border border-zinc-300 rounded-xl p-3 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </div>

                {/* Video Live Preview */}
                <div className="flex flex-col">
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-2">
                    Live Video Preview
                  </label>
                  <div className="relative flex-1 min-h-[340px] bg-black rounded-2xl overflow-hidden flex flex-col justify-end p-6 border border-zinc-800 shadow-inner">
                    {values.hero_video_url ? (
                      <video
                        key={values.hero_video_url}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover object-top opacity-95"
                      >
                        <source src={values.hero_video_url} type="video/mp4" />
                      </video>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-xs font-bold">
                        No video file uploaded
                      </div>
                    )}

                    <div className="relative z-10 text-white pointer-events-none">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 block mb-1">
                        {values.hero_video_tag || "JUST RELEASED"}
                      </span>
                      <h4 className="text-2xl font-black uppercase tracking-tighter leading-none mb-2">
                        {values.hero_video_title || "WIN ON YOUR TERMS"}
                      </h4>
                      <p className="text-xs text-zinc-200 line-clamp-2 mb-4 font-normal">
                        {values.hero_video_subtitle || "Step into limitlessness..."}
                      </p>
                      <div className="flex gap-2">
                        <span className="px-4 py-2 bg-white text-black rounded-full text-[10px] font-bold uppercase">
                          {values.hero_video_primary_btn_text || "Shop Collection"}
                        </span>
                        {values.hero_video_secondary_btn_text && (
                          <span className="px-4 py-2 bg-transparent text-white border border-white rounded-full text-[10px] font-bold uppercase">
                            {values.hero_video_secondary_btn_text}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────── CAROUSEL SLIDES MANAGER SECTION ────────────────── */}
          {heroSubTab === "carousel" && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-black flex items-center gap-2">
                    <Layout className="h-5 w-5 text-blue-600" /> Carousel Slides Manager ({slides.length} slides)
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Add, edit, reorder, or delete slides shown in the autoplay homepage hero carousel.
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {activeMode !== "CAROUSEL" && (
                    <button
                      onClick={() => handleActivateMode("CAROUSEL")}
                      className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-sm"
                    >
                      <Sparkles className="h-3.5 w-3.5" /> Make Live on Website
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenSlideModal()}
                    className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="h-4 w-4" /> Add New Slide
                  </button>
                </div>
              </div>

              {/* Slides Grid / List */}
              <div className="grid grid-cols-1 gap-4">
                {slides.map((slide, idx) => (
                  <div
                    key={slide.id || idx}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between border border-zinc-200 rounded-2xl p-4 bg-zinc-50 hover:border-zinc-300 transition gap-4"
                  >
                    {/* Thumbnail & Info */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-zinc-200">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-full object-cover object-top"
                        />
                        <span className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          #{idx + 1}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">
                          {slide.tag || "TAG"}
                        </span>
                        <h4 className="text-sm font-black text-black uppercase truncate max-w-md">
                          {slide.title}
                        </h4>
                        <p className="text-xs text-zinc-500 truncate max-w-lg mt-0.5">
                          {slide.subtitle}
                        </p>
                        <div className="flex gap-2 mt-1 text-[10px] text-zinc-400">
                          <span className="bg-zinc-200 px-2 py-0.5 rounded font-bold text-zinc-700">
                            Primary: {slide.primaryBtnText} ({slide.primaryLink})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                      {/* Reorder Buttons */}
                      <button
                        disabled={idx === 0}
                        onClick={() => handleMoveSlide(idx, "up")}
                        className="p-2 border border-zinc-200 rounded-lg hover:bg-white text-zinc-600 disabled:opacity-30 transition cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        disabled={idx === slides.length - 1}
                        onClick={() => handleMoveSlide(idx, "down")}
                        className="p-2 border border-zinc-200 rounded-lg hover:bg-white text-zinc-600 disabled:opacity-30 transition cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenSlideModal(slide)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Edit
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteSlide(slide.id)}
                        className="p-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition cursor-pointer"
                        title="Delete Slide"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ────────────────── GENERAL SITE SETTINGS TAB ────────────────── */}
      {!isLoading && !error && activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.keys(GENERAL_SETTING_LABELS).map((key) => {
            const meta = GENERAL_SETTING_LABELS[key];
            const isSaving = savingKey === key;
            const isSaved = savedKey === key;
            return (
              <div key={key} className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-3 shadow-sm">
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
                    className="w-full border border-zinc-300 rounded-xl p-3.5 text-sm focus:outline-none focus:border-black placeholder-zinc-400 resize-none"
                    placeholder={`Enter ${meta.label}...`}
                  />
                ) : (
                  <input
                    type="text"
                    value={values[key] || ""}
                    onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full border border-zinc-300 rounded-xl p-3.5 text-sm focus:outline-none focus:border-black placeholder-zinc-400"
                    placeholder={`Enter ${meta.label}...`}
                  />
                )}

                <button
                  onClick={() => handleSaveSetting(key)}
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

      {/* ────────────────── SLIDE EDIT / CREATE MODAL ────────────────── */}
      {isSlideModalOpen && editingSlide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xl font-black text-black uppercase tracking-tight">
                {slides.some((s) => s.id === editingSlide.id) ? "Edit Carousel Slide" : "Add New Carousel Slide"}
              </h3>
              <button
                onClick={() => setIsSlideModalOpen(false)}
                className="text-zinc-400 hover:text-black font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Upload Image File Box */}
              <div className="border-2 border-dashed border-zinc-300 hover:border-black rounded-2xl p-4 bg-zinc-50 transition text-center flex flex-col items-center justify-center gap-2">
                <ImageIcon className="h-7 w-7 text-zinc-400" />
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-black">Upload Slide Image</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Select a local image file (.jpg, .png, .webp) from your computer</p>
                </div>

                <button
                  type="button"
                  disabled={isUploadingSlideImage}
                  onClick={() => slideImageFileInputRef.current?.click()}
                  className="mt-1 inline-flex items-center gap-2 bg-zinc-950 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {isUploadingSlideImage ? (
                    <Loader className="animate-spin h-4 w-4" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {isUploadingSlideImage ? "Uploading Image..." : "Choose Image File"}
                </button>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1">
                  Background Image URL / Path (Auto-filled on upload) *
                </label>
                <input
                  type="text"
                  value={editingSlide.image}
                  onChange={(e) => setEditingSlide({ ...editingSlide, image: e.target.value })}
                  placeholder="e.g. /corousal1.webp or https://..."
                  className="w-full border border-zinc-300 rounded-xl p-3 text-sm focus:outline-none focus:border-black font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1">
                  Category Tag / Label
                </label>
                <input
                  type="text"
                  value={editingSlide.tag}
                  onChange={(e) => setEditingSlide({ ...editingSlide, tag: e.target.value })}
                  placeholder="e.g. WOMEN'S COLLECTION"
                  className="w-full border border-zinc-300 rounded-xl p-3 text-sm focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1">
                  Slide Main Title *
                </label>
                <input
                  type="text"
                  value={editingSlide.title}
                  onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  placeholder="e.g. ELEVATE YOUR WORKOUT"
                  className="w-full border border-zinc-300 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1">
                  Subtitle Description
                </label>
                <textarea
                  rows={2}
                  value={editingSlide.subtitle}
                  onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                  placeholder="Enter slide subtitle..."
                  className="w-full border border-zinc-300 rounded-xl p-3 text-sm focus:outline-none focus:border-black resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1">
                    Primary Button Label
                  </label>
                  <input
                    type="text"
                    value={editingSlide.primaryBtnText}
                    onChange={(e) => setEditingSlide({ ...editingSlide, primaryBtnText: e.target.value })}
                    placeholder="Shop Collection"
                    className="w-full border border-zinc-300 rounded-xl p-3 text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1">
                    Primary Button Link
                  </label>
                  <input
                    type="text"
                    value={editingSlide.primaryLink}
                    onChange={(e) => setEditingSlide({ ...editingSlide, primaryLink: e.target.value })}
                    placeholder="/shop"
                    className="w-full border border-zinc-300 rounded-xl p-3 text-sm focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1">
                    Secondary Button Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingSlide.secondaryBtnText || ""}
                    onChange={(e) => setEditingSlide({ ...editingSlide, secondaryBtnText: e.target.value })}
                    placeholder="View Collection"
                    className="w-full border border-zinc-300 rounded-xl p-3 text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1">
                    Secondary Button Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingSlide.secondaryLink || ""}
                    onChange={(e) => setEditingSlide({ ...editingSlide, secondaryLink: e.target.value })}
                    placeholder="/shop?category=shoes"
                    className="w-full border border-zinc-300 rounded-xl p-3 text-sm focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Preview Card in Modal */}
              <div className="border border-zinc-200 rounded-2xl p-4 bg-zinc-950 text-white relative min-h-[160px] flex flex-col justify-end overflow-hidden">
                {editingSlide.image && (
                  <img
                    src={editingSlide.image}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover object-top opacity-45"
                  />
                )}
                <div className="relative z-10">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300 block mb-0.5">
                    {editingSlide.tag || "SLIDE TAG"}
                  </span>
                  <h4 className="text-xl font-black uppercase tracking-tighter leading-none mb-1">
                    {editingSlide.title || "SLIDE TITLE"}
                  </h4>
                  <p className="text-xs text-zinc-200 line-clamp-1 mb-2 font-normal">
                    {editingSlide.subtitle || "Slide subtitle placeholder..."}
                  </p>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white text-black rounded-full text-[9px] font-bold uppercase">
                      {editingSlide.primaryBtnText || "Shop"}
                    </span>
                    {editingSlide.secondaryBtnText && (
                      <span className="px-3 py-1 bg-transparent text-white border border-white rounded-full text-[9px] font-bold uppercase">
                        {editingSlide.secondaryBtnText}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                type="button"
                onClick={() => setIsSlideModalOpen(false)}
                className="px-5 py-2.5 rounded-full border border-zinc-300 text-xs font-bold uppercase tracking-wider text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSingleSlide}
                disabled={isSavingSlides}
                className="px-6 py-2.5 rounded-full bg-black hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isSavingSlides && <Loader className="animate-spin h-3.5 w-3.5" />}
                Save Slide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
