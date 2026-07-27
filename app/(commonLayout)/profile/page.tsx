"use client";

import { useState, useEffect, Suspense } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { logout } from "@/feature/user/userSlice";
import { toggleWishlistDrawer } from "@/redux/wishlistSlice";
import { useGetMyOrdersQuery, useGetOrderByIdQuery } from "@/redux/api/order/orderApi";
import { useCreateReviewMutation } from "@/redux/api/product/productApi";
import {
  User as UserIcon,
  ShoppingBag,
  Heart,
  Truck,
  BookOpen,
  LogOut,
  ChevronRight,
  Loader,
  AlertCircle,
  CheckCircle,
  LayoutDashboard,
  Star,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

type Tab = "profile" | "address" | "orders" | "tracker";

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader className="animate-spin h-8 w-8 text-black" />
      </div>
    }>
      <ProfileForm />
    </Suspense>
  );
}

function ProfileForm() {
  const { user } = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  // Get active tab from query param or default to profile
  const initialTab = (searchParams.get("tab") as Tab) || "profile";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab") as Tab;
    if (tabParam && ["profile", "address", "orders", "tracker"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Redirect to login if user is not authenticated
  // useEffect(() => {
  //   if (!user) {
  //     toast.error("Please sign in to view your profile.");
  //     router.push("/login?redirect=/profile");
  //   }
  // }, [user, router]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    router.push("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white pb-24">
      
      {/* Top Banner */}
      <div className="relative bg-zinc-950 text-white py-16 md:py-24 overflow-hidden">
        {/* Background visual graphics */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-800 rounded-full blur-3xl opacity-25 -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-90 h-90 bg-zinc-700 rounded-full blur-3xl opacity-15 -ml-16 -mb-16"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <p className="text-xs md:text-sm font-black uppercase tracking-widest text-zinc-400 mb-2">My Account Portal</p>
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
            Welcome, {user.name}
          </h1>
          <p className="text-base md:text-lg text-zinc-400 mt-2.5 font-medium">{user.email}</p>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mt-6 md:mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* LEFT: Sidebar Navigation (crisper visible border) */}
          <div className="lg:col-span-3 border border-zinc-300 p-6 bg-white space-y-6">
            <div>
              <h2 className="text-sm font-black text-black uppercase tracking-widest pb-3.5 border-b border-zinc-200 mb-5">
                My Account
              </h2>
              <nav className="space-y-1.5">
                
                {/* Admin Dashboard shortcut inside sidebar */}
                {(user.role === "ADMIN" || user.role === "SUPERADMIN" || user.role === "SUPER_ADMIN" || user.role === "MANAGER") && (
                  <Link
                    href="/dashboard"
                    className="w-full flex items-center justify-between px-3.5 py-3 text-base font-bold text-zinc-600 hover:bg-zinc-50 hover:text-black transition"
                  >
                    <span className="flex items-center gap-2.5">
                      <LayoutDashboard className="h-5 w-5 shrink-0 text-zinc-400" /> Admin Dashboard
                    </span>
                    <ChevronRight className="h-4 w-4 opacity-30" />
                  </Link>
                )}

                <button
                  onClick={() => {
                    setActiveTab("profile");
                    router.push("/profile?tab=profile");
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 text-base font-bold transition ${
                    activeTab === "profile" ? "bg-black text-white" : "text-zinc-600 hover:bg-zinc-50 hover:text-black"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <UserIcon className="h-5 w-5 shrink-0" /> My Profile
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-30" />
                </button>

                <button
                  onClick={() => {
                    setActiveTab("address");
                    router.push("/profile?tab=address");
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 text-base font-bold transition ${
                    activeTab === "address" ? "bg-black text-white" : "text-zinc-600 hover:bg-zinc-50 hover:text-black"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <BookOpen className="h-5 w-5 shrink-0" /> Address Book
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-30" />
                </button>

                <button
                  onClick={() => {
                    setActiveTab("orders");
                    router.push("/profile?tab=orders");
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 text-base font-bold transition ${
                    activeTab === "orders" ? "bg-black text-white" : "text-zinc-600 hover:bg-zinc-50 hover:text-black"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <ShoppingBag className="h-5 w-5 shrink-0" /> My Orders
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-30" />
                </button>

                <button
                  onClick={() => dispatch(toggleWishlistDrawer(true))}
                  className="w-full flex items-center justify-between px-3.5 py-3 text-base font-bold text-zinc-600 hover:bg-zinc-50 hover:text-black transition"
                >
                  <span className="flex items-center gap-2.5">
                    <Heart className="h-5 w-5 shrink-0" /> Wishlist
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-30" />
                </button>

                <button
                  onClick={() => {
                    setActiveTab("tracker");
                    router.push("/profile?tab=tracker");
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 text-base font-bold transition ${
                    activeTab === "tracker" ? "bg-black text-white" : "text-zinc-600 hover:bg-zinc-50 hover:text-black"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Truck className="h-5 w-5 shrink-0" /> Order Tracker
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-30" />
                </button>
              </nav>
            </div>

            <div className="border-t border-zinc-200 pt-5">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3.5 py-3 text-base font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
              >
                <LogOut className="h-5 w-5" /> Sign Out
              </button>
            </div>
          </div>

          {/* RIGHT: Content Panel (crisper visible border) */}
          <div className="lg:col-span-9 border border-zinc-300 p-8 md:p-12 bg-white min-h-[50vh]">
            
            {/* PROFILE TAB */}
            {activeTab === "profile" && <MyProfileSection user={user} />}

            {/* ADDRESS BOOK TAB */}
            {activeTab === "address" && <AddressBookSection />}

            {/* MY ORDERS TAB */}
            {activeTab === "orders" && <MyOrdersSection />}

            {/* ORDER TRACKER TAB */}
            {activeTab === "tracker" && <OrderTrackerSection />}

          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   Tab View Sub-components
   ========================================================================== */

/**
 * 1. My Profile Tab
 */
function MyProfileSection({ user }: { user: any }) {
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("N/A");
  const [dob, setDob] = useState("N/A");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPhone = localStorage.getItem("user_phone");
      if (savedPhone) {
        setPhone(savedPhone);
      } else {
        setPhone(user.phone || "");
      }
    }
  }, [user]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("user_phone", phone);
    }
    toast.success("Profile contact details updated!");
  };

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-wider mb-2">Account Information</h2>
        <p className="text-sm md:text-base text-gray-500">View and update your personal details below.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 border-t border-zinc-200 pt-8">
        <div>
          <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest">Full Name</p>
          <p className="text-base md:text-lg font-bold text-black mt-2">{user.name}</p>
        </div>
        <div>
          <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
          <p className="text-base md:text-lg font-bold text-black mt-2">{user.email}</p>
        </div>
        <div>
          <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
          <p className="text-base md:text-lg font-bold text-black mt-2">{phone || "Not Specified"}</p>
        </div>
        <div>
          <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest">Gender</p>
          <p className="text-base md:text-lg font-bold text-black mt-2">{gender}</p>
        </div>
        <div>
          <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest">Date of Birth</p>
          <p className="text-base md:text-lg font-bold text-black mt-2">{dob}</p>
        </div>
        <div>
          <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest">Member Since</p>
          <p className="text-base md:text-lg font-bold text-black mt-2">
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
          </p>
        </div>
      </div>

      <form onSubmit={handleUpdateProfile} className="border-t border-zinc-200 pt-10 space-y-6 max-w-md">
        <h3 className="text-base font-black uppercase text-black">Update Contact Number</h3>
        <div>
          <label className="block text-xs md:text-sm font-bold text-gray-500 uppercase mb-1.5">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 01712345678"
            className="w-full border border-zinc-400 p-4 text-base focus:outline-none focus:border-black placeholder-gray-400"
          />
        </div>
        <button
          type="submit"
          className="bg-black hover:bg-zinc-800 text-white font-bold py-3.5 px-8 text-xs uppercase tracking-wider rounded-full transition cursor-pointer"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}

/**
 * 2. Address Book Tab
 */
function AddressBookSection() {
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Dhaka");
  const [zipCode, setZipCode] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAddr = localStorage.getItem("user_address");
      if (savedAddr) {
        try {
          const parsed = JSON.parse(savedAddr);
          setStreet(parsed.street || "");
          setCity(parsed.city || "");
          setState(parsed.state || "Dhaka");
          setZipCode(parsed.zipCode || "");
        } catch (e) {
          console.error(e);
        }
      } else {
        setStreet("123 Road Ave, Sector 4");
        setCity("Dhaka");
        setState("Dhaka");
        setZipCode("1230");
      }
    }
  }, []);

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("user_address", JSON.stringify({ street, city, state, zipCode }));
    }
    toast.success("Default delivery address saved!");
  };

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-wider mb-2">Address Book</h2>
        <p className="text-sm md:text-base text-gray-500">Manage your default delivery address details.</p>
      </div>

      <form onSubmit={handleSaveAddress} className="border-t border-zinc-200 pt-8 space-y-6 max-w-lg">
        <div>
          <label className="block text-xs md:text-sm font-bold text-gray-500 uppercase mb-1.5">Street Address</label>
          <input
            type="text"
            required
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className="w-full border border-zinc-400 p-4 text-base focus:outline-none focus:border-black"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs md:text-sm font-bold text-gray-500 uppercase mb-1.5">City / District</label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border border-zinc-400 p-4 text-base focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-xs md:text-sm font-bold text-gray-500 uppercase mb-1.5">Division</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full border border-zinc-400 p-4 text-base bg-white focus:outline-none focus:border-black"
            >
              <option value="Dhaka">Dhaka</option>
              <option value="Chattogram">Chattogram</option>
              <option value="Sylhet">Sylhet</option>
              <option value="Khulna">Khulna</option>
              <option value="Barishal">Barishal</option>
              <option value="Rajshahi">Rajshahi</option>
              <option value="Rangpur">Rangpur</option>
              <option value="Mymensingh">Mymensingh</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-bold text-gray-500 uppercase mb-1.5">Zip / Postal Code</label>
          <input
            type="text"
            required
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className="w-full border border-zinc-400 p-4 text-base focus:outline-none focus:border-black"
          />
        </div>

        <button
          type="submit"
          className="bg-black hover:bg-zinc-800 text-white font-bold py-3.5 px-8 text-xs uppercase tracking-wider rounded-full transition cursor-pointer"
        >
          Save Address
        </button>
      </form>
    </div>
  );
}

/**
 * 3. My Orders Tab
 */
function MyOrdersSection() {
  const { data: ordersResponse, isLoading } = useGetMyOrdersQuery();
  const orders = ordersResponse?.data || [];

  const [createReview, { isLoading: submittingReview }] = useCreateReviewMutation();
  const [reviewModal, setReviewModal] = useState<{
    open: boolean;
    productId: string | null;
    title: string;
  }>({ open: false, productId: null, title: "" });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  const openReviewModal = (productId: string, title: string) => {
    setReviewModal({ open: true, productId, title });
    setReviewRating(5);
    setReviewComment("");
    setHoverRating(0);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModal.productId || !reviewComment.trim()) {
      toast.error("Please write a comment.");
      return;
    }
    try {
      await createReview({
        productId: reviewModal.productId,
        rating: reviewRating,
        comment: reviewComment,
      }).unwrap();
      toast.success("Review submitted!");
      setReviewModal({ open: false, productId: null, title: "" });
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit review.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[30vh] items-center justify-center">
        <Loader className="animate-spin h-6 w-6 text-black" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-wider mb-2">My Orders</h2>
        <p className="text-sm md:text-base text-gray-500">View and track your previous purchase history.</p>
      </div>

      <div className="border-t border-zinc-200 pt-8">
        {orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-base font-semibold">
            You haven't placed any orders yet.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => (
              <div key={order.id || order._id} className="border border-zinc-300 p-6 md:p-8 bg-zinc-50/50 space-y-4">
                <div className="flex flex-wrap justify-between items-start gap-2 border-b border-zinc-200 pb-4">
                  <div>
                    <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest">Order ID</p>
                    <p className="text-base font-black text-black mt-1 break-all">{order.id || order._id}</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest text-right">Order Date</p>
                    <p className="text-sm font-bold text-gray-600 mt-1 text-right">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Order Items with Review Buttons */}
                {order.status === "DELIVERED" && order.items?.length > 0 && (
                  <div className="space-y-2 pb-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Items</p>
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between gap-3 py-1.5">
                        <div>
                          <p className="text-sm font-bold text-black">{item.title}</p>
                          {item.size && <p className="text-xs text-gray-400">Size: {item.size}</p>}
                        </div>
                        {item.productId && (
                          <button
                            onClick={() => openReviewModal(item.productId, item.title)}
                            className="flex items-center gap-1 text-xs font-bold text-black border border-black px-3 py-1.5 hover:bg-black hover:text-white transition cursor-pointer shrink-0"
                          >
                            <Star className="h-3 w-3" /> Review
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center text-sm font-bold pt-2">
                  <div>
                    <span className="text-gray-400 uppercase text-xs tracking-wider block mb-1">Method</span>
                    <span className="text-black text-base">{order.paymentMethod === "COD" ? "COD" : "bKash"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 uppercase text-xs tracking-wider block mb-1">Total Amount</span>
                    <span className="text-black text-lg font-black">৳{order.totalAmount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 uppercase text-xs tracking-wider block mb-1">Ship Status</span>
                    <span className={`inline-block px-4 py-1.5 text-xs font-black uppercase tracking-wider ${
                      order.status === "DELIVERED"
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : order.status === "CANCELLED"
                        ? "bg-red-50 text-red-700 border border-red-100"
                        : "bg-amber-50 text-amber-700 border border-amber-100"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white w-full max-w-md p-8 space-y-5 relative">
            <button
              onClick={() => setReviewModal({ open: false, productId: null, title: "" })}
              className="absolute top-4 right-4 text-gray-400 hover:text-black cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-base font-black uppercase text-black">Review: {reviewModal.title}</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Your Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReviewRating(s)}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="cursor-pointer"
                    >
                      <Star
                        className={`h-7 w-7 transition ${
                          s <= (hoverRating || reviewRating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-300 fill-gray-100"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Comment</label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your thoughts about this product..."
                  className="w-full border border-zinc-400 p-3.5 text-sm focus:outline-none focus:border-black placeholder-gray-400 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submittingReview}
                className="w-full bg-black hover:bg-zinc-800 text-white font-bold py-3.5 text-xs uppercase tracking-wider rounded-full transition cursor-pointer disabled:opacity-50"
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 4. Order Tracker Tab
 */
function OrderTrackerSection() {
  const [orderId, setOrderId] = useState("");
  const [searchId, setSearchId] = useState("");

  const { data: orderResponse, isLoading, error } = useGetOrderByIdQuery(searchId, {
    skip: !searchId,
  });
  const order = orderResponse?.data;

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      toast.error("Please enter a valid Order ID");
      return;
    }
    setSearchId(orderId.trim());
  };

  const getStatusStep = (status: string) => {
    const steps = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
    return steps.indexOf(status.toUpperCase());
  };

  const currentStep = order ? getStatusStep(order.status) : -1;

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-wider mb-2">Order Tracker</h2>
        <p className="text-sm md:text-base text-gray-500">Track the real-time shipping progress of your package.</p>
      </div>

      <form onSubmit={handleTrackOrder} className="border-t border-zinc-200 pt-8 flex gap-3 max-w-md">
        <div className="flex-1">
          <input
            type="text"
            required
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter Order ID"
            className="w-full border border-zinc-400 p-4 text-base focus:outline-none focus:border-black placeholder-gray-400"
          />
        </div>
        <button
          type="submit"
          className="bg-black hover:bg-zinc-800 text-white font-bold py-3.5 px-8 text-xs uppercase tracking-wider transition cursor-pointer"
        >
          Track
        </button>
      </form>

      {/* Tracker Status Display */}
      {searchId && (
        <div className="pt-8 border-t border-zinc-200 mt-8">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader className="animate-spin h-6 w-6 text-black" />
            </div>
          )}

          {error && (
            <p className="text-base font-bold text-red-600 flex items-center gap-1.5 py-4">
              <AlertCircle className="h-5 w-5" /> Order ID not found. Please verify the ID.
            </p>
          )}

          {order && (
            <div className="space-y-8 bg-zinc-50/50 p-6 md:p-8 border border-zinc-300">
              <div className="flex justify-between items-center text-sm border-b border-zinc-200 pb-4">
                <span className="font-bold text-black text-lg">Status: <span className="text-zinc-500 uppercase font-black">{order.status}</span></span>
                <span className="text-gray-500 font-bold text-lg">Total Amount: ৳{order.totalAmount.toLocaleString()}</span>
              </div>

              {/* Progress Timeline */}
              {order.status === "CANCELLED" ? (
                <div className="text-center py-8 bg-red-50 text-red-700 border border-red-100 font-bold text-base">
                  This order has been cancelled.
                </div>
              ) : (
                <div className="grid grid-cols-4 relative pt-8">
                  {/* Progress Line */}
                  <div className="absolute top-[30px] left-[12.5%] right-[12.5%] h-0.5 bg-gray-200 z-0">
                    <div 
                      className="h-full bg-black transition-all duration-500"
                      style={{ width: `${(Math.max(0, currentStep) / 3) * 100}%` }}
                    />
                  </div>

                  {/* Step 1: Placed */}
                  <div className="flex flex-col items-center z-10 text-center">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold border transition ${
                      currentStep >= 0 ? "bg-black border-black text-white" : "bg-white border-gray-200 text-gray-400"
                    }`}>
                      1
                    </div>
                    <span className="text-sm font-bold mt-2.5 text-black">Pending</span>
                  </div>

                  {/* Step 2: Processing */}
                  <div className="flex flex-col items-center z-10 text-center">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold border transition ${
                      currentStep >= 1 ? "bg-black border-black text-white" : "bg-white border-gray-200 text-gray-400"
                    }`}>
                      2
                    </div>
                    <span className="text-sm font-bold mt-2.5 text-black">Processing</span>
                  </div>

                  {/* Step 3: Shipped */}
                  <div className="flex flex-col items-center z-10 text-center">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold border transition ${
                      currentStep >= 2 ? "bg-black border-black text-white" : "bg-white border-gray-200 text-gray-400"
                    }`}>
                      3
                    </div>
                    <span className="text-sm font-bold mt-2.5 text-black">Shipped</span>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className="flex flex-col items-center z-10 text-center">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold border transition ${
                      currentStep >= 3 ? "bg-black border-black text-white" : "bg-white border-gray-200 text-gray-400"
                    }`}>
                      4
                    </div>
                    <span className="text-sm font-bold mt-2.5 text-black">Delivered</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
