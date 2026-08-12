"use client";

import { useState, useEffect, useRef } from "react";
import { useGetMe } from "@/hooks/useGetMe";
import { useUpdateProfileMutation } from "@/redux/api/auth/authApi";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { setCredentials } from "@/feature/user/userSlice";
import {
  Loader,
  ShieldCheck,
  Mail,
  Phone,
  User,
  KeyRound,
  Save,
  Camera,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminProfilePage() {
  const dispatch = useDispatch();
  const { user, isLoading: isUserLoading } = useGetMe();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  // Basic Info Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState("");

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Populate form when user is loaded
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone((user as any).phone || "");
      setProfileImage((user as any).profileImage || "");
    }
  }, [user]);

  // Handle profile image file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size cannot exceed 5MB.");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and Email are required fields.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const response = await updateProfile(formData).unwrap();
      toast.success("Profile information updated successfully!");
      
      // Instantly sync updated fields into Redux store
      if (response?.data) {
        const token = Cookies.get("accessToken");
        if (token) {
          dispatch(
            setCredentials({
              user: {
                id: response.data.id,
                name: response.data.name,
                email: response.data.email,
                role: response.data.role,
                phone: response.data.phone,
                profileImage: response.data.profileImage,
              },
              accessToken: token,
            })
          );
        }
        if (response.data.profileImage) {
          setProfileImage(response.data.profileImage);
          setSelectedFile(null);
        }
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update profile information.");
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("currentPassword", currentPassword);
      formData.append("newPassword", newPassword);

      await updateProfile(formData).unwrap();
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to change password. Make sure current password is correct.");
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader className="animate-spin h-8 w-8 text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-10 poppins-regular">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">Settings</p>
        <h1 className="text-3xl font-black text-black uppercase tracking-tight">Admin Profile</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage your administrative credentials and personal details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: General Profile Information */}
        <div className="lg:col-span-8 space-y-8">
          <div className="border border-zinc-200 bg-white p-6 md:p-8 rounded-none">
            <h2 className="text-lg font-black uppercase tracking-wider text-black mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-zinc-600" /> General Information
            </h2>

            <form onSubmit={handleUpdateInfo} className="space-y-6">
              {/* Photo Upload Area */}
              <div className="flex flex-col sm:flex-row items-center gap-5 border-b border-zinc-100 pb-6 mb-2">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-24 h-24 rounded-full overflow-hidden border border-zinc-200 bg-zinc-100 flex items-center justify-center">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-zinc-400" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <h3 className="font-bold text-black text-sm">Profile Avatar Image</h3>
                  <p className="text-xs text-zinc-400">JPG, PNG or WEBP. Max size limit of 5MB.</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-black uppercase tracking-wider text-black underline hover:text-zinc-600 cursor-pointer pt-1 block"
                  >
                    Upload Photo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full py-3 pl-10 pr-4 text-zinc-700 bg-zinc-50 border border-zinc-300 rounded-none focus:outline-none focus:border-black focus:bg-white transition"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full py-3 pl-10 pr-4 text-zinc-700 bg-zinc-50 border border-zinc-300 rounded-none focus:outline-none focus:border-black focus:bg-white transition"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="md:col-span-2">
                  <label htmlFor="phone" className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +8801712345678"
                      className="block w-full py-3 pl-10 pr-4 text-zinc-700 bg-zinc-50 border border-zinc-300 rounded-none focus:outline-none focus:border-black focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-black hover:bg-zinc-800 text-white font-bold py-3.5 px-8 text-xs uppercase tracking-widest rounded-none flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? <Loader className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                  Save Information
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="border border-zinc-200 bg-white p-6 md:p-8 rounded-none">
            <h2 className="text-lg font-black uppercase tracking-wider text-black mb-6 flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-zinc-600" /> Security & Password
            </h2>

            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Current Password */}
                <div>
                  <label htmlFor="currPassword" className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      id="currPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="block w-full py-3 pl-4 pr-12 text-zinc-700 bg-zinc-50 border border-zinc-300 rounded-none focus:outline-none focus:border-black focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-zinc-600 transition"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password & Confirm */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="newPassword" className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="block w-full py-3 pl-4 pr-12 text-zinc-700 bg-zinc-50 border border-zinc-300 rounded-none focus:outline-none focus:border-black focus:bg-white transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-zinc-600 transition"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        className="block w-full py-3 pl-4 pr-12 text-zinc-700 bg-zinc-50 border border-zinc-300 rounded-none focus:outline-none focus:border-black focus:bg-white transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-zinc-600 transition"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-black hover:bg-zinc-800 text-white font-bold py-3.5 px-8 text-xs uppercase tracking-widest rounded-none flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? <Loader className="animate-spin h-4 w-4" /> : <KeyRound className="h-4 w-4" />}
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Account Summary Card */}
        <div className="lg:col-span-4">
          <div className="border border-zinc-200 bg-zinc-950 text-white p-6 md:p-8 rounded-none relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-800 rounded-full blur-2xl opacity-40 -mr-10 -mt-10"></div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center mb-4">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-white" />
                )}
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">{user?.name || "Admin"}</h3>
              <p className="text-xs text-zinc-400 mt-1">{user?.email}</p>

              {/* Status & Role badge */}
              <div className="mt-6 flex flex-wrap gap-2.5 items-center justify-center">
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black uppercase tracking-widest rounded-full">
                  {user?.role}
                </span>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Active
                </span>
              </div>

              {/* Joined Date */}
              <div className="border-t border-zinc-800 w-full mt-8 pt-6 text-left">
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Registration Info</p>
                <div className="flex justify-between items-center mt-3 text-sm">
                  <span className="text-zinc-400">Created Date:</span>
                  <span className="font-bold text-zinc-200">
                    {(user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
