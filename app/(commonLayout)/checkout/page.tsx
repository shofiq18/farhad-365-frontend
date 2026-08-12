"use client";

import { useState, useEffect, Suspense } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { clearCart } from "@/redux/cartSlice";
import { useCreateOrderMutation } from "@/redux/api/order/orderApi";
import { useValidateDiscountMutation } from "@/redux/api/discount/discountApi";
import { Loader, CheckCircle, AlertCircle, ShoppingBag, Truck, CreditCard } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useGetAllSettingsQuery } from "@/redux/api/setting/settingApi";

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader className="animate-spin h-8 w-8 text-black" />
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  );
}

function CheckoutForm() {
  const { items } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.user);
  
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("status");
  const orderIdParam = searchParams.get("orderId");
  const reasonParam = searchParams.get("reason");

  const [createOrder, { isLoading: isPlacingOrder }] = useCreateOrderMutation();
  const [validateDiscount, { isLoading: isVerifyingPromo }] = useValidateDiscountMutation();
  const { data: settingsResponse } = useGetAllSettingsQuery();
  const settings = settingsResponse?.data?.map || {};

  // Form State
  const [street, setStreet] = useState("");
  const [thana, setThana] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Dhaka");
  const [zipCode, setZipCode] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "DIGITAL">("COD");
  const [paymentGateway, setPaymentGateway] = useState<"SSLCOMMERZ" | "BKASH">("BKASH");

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [promoError, setPromoError] = useState("");

  // Load saved phone and address defaults from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPhone = localStorage.getItem("user_phone");
      if (savedPhone) setPhone(savedPhone);

      const savedAddr = localStorage.getItem("user_address");
      if (savedAddr) {
        try {
          const parsed = JSON.parse(savedAddr);
          if (parsed.street) setStreet(parsed.street);
          if (parsed.city) setCity(parsed.city);
          if (parsed.state) setState(parsed.state);
          if (parsed.zipCode) setZipCode(parsed.zipCode);
        } catch (e) {
          console.error("Failed to parse saved address", e);
        }
      }
    }
  }, []);

  // Clear cart if returning from a successful payment gateway transaction
  useEffect(() => {
    if (paymentStatus === "success" && orderIdParam && items.length > 0) {
      dispatch(clearCart());
    }
  }, [paymentStatus, orderIdParam, items, dispatch]);

  // Re-validate coupon if cart items change to ensure minSpend and eligibility constraints hold
  useEffect(() => {
    if (appliedCoupon && items.length > 0) {
      const reValidate = async () => {
        try {
          const response = await validateDiscount({
            code: appliedCoupon.code,
            items: items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
            })),
          }).unwrap();
          if (response.status === "success" && response.data) {
            setAppliedCoupon(response.data);
          }
        } catch (err) {
          setAppliedCoupon(null);
          setPromoError("Cart updated. Applied coupon is no longer valid.");
          toast.error("Applied coupon is no longer valid.");
        }
      };
      reValidate();
    } else if (items.length === 0) {
      setAppliedCoupon(null);
    }
  }, [items]);

  // Order Result State
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  // Form Validation
  const isFormValid = street.trim() && city.trim() && state.trim() && zipCode.trim() && phone.trim();

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.discountedPrice * item.quantity, 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  
  // Dynamic free shipping threshold
  const threshold = settings.free_shipping_threshold ? parseFloat(settings.free_shipping_threshold) : 1000;
  const isFreeShipping = subtotal >= threshold;
  const shippingFee = isFreeShipping ? 0.0 : (state.toLowerCase() === "dhaka" ? 80.0 : 120.0);
  const total = Math.max(0, subtotal - discountAmount) + shippingFee;

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    setPromoError("");
    try {
      const response = await validateDiscount({
        code: promoCodeInput.trim(),
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      }).unwrap();

      if (response.status === "success" && response.data) {
        setAppliedCoupon(response.data);
        setPromoError("");
        toast.success("Coupon code applied!");
      }
    } catch (err: any) {
      setPromoError(err?.data?.message || "Failed to validate promo code.");
      setAppliedCoupon(null);
    }
  };

  const handleRemovePromo = () => {
    setAppliedCoupon(null);
    setPromoCodeInput("");
    setPromoError("");
    toast.success("Promo code removed.");
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to place an order.");
      router.push(`/login?redirect=/checkout`);
      return;
    }

    if (!isFormValid) {
      toast.error("Please fill in all shipping details.");
      return;
    }

    const orderPayload = {
      items: items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
      shippingAddress: {
        street: thana.trim() ? `${street}, Thana: ${thana}` : street,
        city,
        state,
        zipCode,
        country: "Bangladesh",
        phone,
      },
      paymentMethod,
      ...(paymentMethod === "DIGITAL" && { paymentGateway }),
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
    };

    try {
      const response = await createOrder(orderPayload).unwrap();
      if (response.status === "success") {
        if (response.paymentUrl) {
          // Redirect to payment gateway URL (bKash or SSLCommerz)
          // Note: Cart is NOT cleared here so that if the user cancels or fails payment,
          // their cart is preserved. It is only cleared on successful payment callback.
          window.location.href = response.paymentUrl;
          return;
        }
        setOrderSuccess(response.data);
        dispatch(clearCart());
        toast.success("Order placed successfully!");
      } else {
        toast.error("Failed to place order. Please try again.");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "An error occurred while creating order.");
    }
  };

  // Payment failed view from query params
  if (paymentStatus === "fail") {
    return (
      <div 
        className="min-h-screen bg-white flex items-center justify-center py-16 px-4"
        style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
      >
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-600 animate-pulse" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-black tracking-tight">Payment Failed</h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
            {reasonParam ? decodeURIComponent(reasonParam) : "We couldn't process your payment. Please try again."}
          </p>
          
          <div className="pt-4 flex gap-4">
            <button
              onClick={() => router.push("/checkout")}
              className="flex-1 bg-black hover:bg-zinc-800 text-white font-bold py-3.5 px-6 rounded-full text-sm transition cursor-pointer"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/shop")}
              className="flex-1 border border-gray-200 hover:border-black text-black font-bold py-3.5 px-6 rounded-full text-sm transition cursor-pointer"
            >
              Go to Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success view (from either local COD state or gateway callback)
  if (orderSuccess || (paymentStatus === "success" && orderIdParam)) {
    const displayOrderId = orderSuccess ? (orderSuccess.id || orderSuccess._id) : orderIdParam;
    return (
      <div 
        className="min-h-screen bg-white flex items-center justify-center py-16 px-4"
        style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
      >
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600 animate-bounce" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-black tracking-tight">Order Confirmed!</h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
            Thank you for your purchase. Your order has been received and is now being processed.
          </p>
          
          <div className="bg-gray-50 p-6 text-left border border-gray-100 space-y-3.5">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Order ID</p>
              <p className="text-xs font-bold text-gray-800 break-all">{displayOrderId}</p>
            </div>
            {orderSuccess && (
              <>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Deliver to</p>
                  <p className="text-xs font-bold text-gray-800">
                    {orderSuccess.shippingAddress.street}, {orderSuccess.shippingAddress.city}, {orderSuccess.shippingAddress.state} {orderSuccess.shippingAddress.zipCode}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Total Amount</p>
                  <p className="text-sm font-black text-black">৳{orderSuccess.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Payment Method</p>
                  <p className="text-xs font-bold text-gray-800">
                    {orderSuccess.paymentMethod === "COD" ? "Cash on Delivery" : "bKash Payment"}
                  </p>
                </div>
              </>
            )}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Status</p>
              <p className="text-xs font-bold text-green-600">
                {orderSuccess ? (orderSuccess.paymentMethod === "COD" ? "Pending Processing" : "Paid & Processing") : "Paid & Processing"}
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => router.push("/shop")}
              className="w-full bg-black hover:bg-zinc-800 text-white font-bold py-3.5 px-6 rounded-full text-sm transition cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty Cart View
  if (items.length === 0) {
    return (
      <div 
        className="min-h-[70vh] bg-white flex flex-col items-center justify-center text-center px-4"
        style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
      >
        <ShoppingBag className="h-16 w-16 text-gray-200 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Your Bag is Empty</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
          Please add items to your shopping bag before checking out.
        </p>
        <button
          onClick={() => router.push("/shop")}
          className="mt-6 rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 transition cursor-pointer"
        >
          Explore Shop
        </button>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-white py-12 md:py-20"
      style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl md:text-3xl font-black text-black tracking-tight mb-8 md:mb-12">
          Checkout
        </h1>

        {/* Guest/Sign-in notice */}
        {!user && (
          <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">Sign in to complete your checkout</h3>
              <p className="text-xs text-amber-700 mt-1">
                You are currently not signed in. Sign in now to speed up checkout and keep track of your order.
              </p>
              <Link
                href="/login?redirect=/checkout"
                className="mt-3 inline-block rounded-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-1.5 px-4 text-xs transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* LEFT: Shipping Form (cols: 7) */}
          <div className="lg:col-span-7 space-y-8">
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              
              {/* Shipping Address Header */}
              <div>
                <h2 className="text-lg font-bold text-black border-b border-gray-100 pb-3 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-black" /> Shipping Address
                </h2>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Area, House, Road details"
                    className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:border-black placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">City / District</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Dhaka, Savar, Gazipur"
                    className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:border-black placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Division</label>
                  <select
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full border border-gray-200 p-3 text-sm bg-white focus:outline-none focus:border-black"
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

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Thana / Upazila (Optional)</label>
                  <input
                    type="text"
                    value={thana}
                    onChange={(e) => setThana(e.target.value)}
                    placeholder="e.g. Mirpur, Uttara"
                    className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:border-black placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Zip / Postal Code</label>
                  <input
                    type="text"
                    required
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="1209"
                    className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:border-black placeholder-gray-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01712345678"
                    className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:border-black placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="pt-6">
                <h2 className="text-lg font-bold text-black border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-black" /> Payment Method
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* COD */}
                  <label 
                    className={`flex items-start gap-3.5 border p-4 cursor-pointer transition ${
                      paymentMethod === "COD" ? "border-black bg-gray-50" : "border-gray-200 hover:border-black"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="mt-1 accent-black"
                    />
                    <div>
                      <p className="text-sm font-bold text-black">Cash on Delivery</p>
                      <p className="text-xs text-gray-500 mt-0.5">Pay in cash when your order is delivered.</p>
                    </div>
                  </label>

                  {/* bKash */}
                  <label 
                    className={`flex items-start gap-3.5 border p-4 cursor-pointer transition ${
                      paymentMethod === "DIGITAL" ? "border-black bg-gray-50" : "border-gray-200 hover:border-black"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="DIGITAL"
                      checked={paymentMethod === "DIGITAL"}
                      onChange={() => {
                        setPaymentMethod("DIGITAL");
                        setPaymentGateway("BKASH");
                      }}
                      className="mt-1.5 accent-black"
                    />
                    <div className="flex-1 flex items-center justify-between gap-3 min-w-0">
                      <div>
                        <p className="text-sm font-bold text-black">Pay with bKash</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Pay securely via your bKash wallet.</p>
                      </div>
                      <img 
                        src="/bkash.png" 
                        alt="bKash Logo" 
                        className="h-8 object-contain shrink-0"
                      />
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isPlacingOrder || !user}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-black hover:bg-zinc-800 disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 text-sm transition cursor-pointer"
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader className="animate-spin h-4 w-4" /> Placing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* RIGHT: Order Summary (cols: 5) */}
          <div className="lg:col-span-5 bg-gray-50 border border-gray-100 p-6 md:p-8 sticky top-24">
            <h2 className="text-lg font-bold text-black border-b border-gray-200 pb-3.5 mb-6">
              Summary
            </h2>

            {/* Product Item List */}
            <div className="space-y-4 max-h-72 overflow-y-auto pr-2 scrollbar-thin border-b border-gray-200 pb-6 mb-6">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="h-16 w-16 bg-white border border-gray-200 overflow-hidden shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gray-200" />
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-black truncate">{item.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {item.size ? `Size: ${item.size}` : ""}
                      {item.size && item.color ? " | " : ""}
                      {item.color ? `Color: ${item.color}` : ""}
                    </p>
                    <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  {/* Cost */}
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-black">
                      ৳{(item.discountedPrice * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Input Block */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Have a Promo Code?</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  disabled={!!appliedCoupon}
                  className="flex-1 border border-gray-200 p-2.5 text-xs focus:outline-none focus:border-black placeholder-gray-400 disabled:bg-gray-50 uppercase font-mono"
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 px-4 transition cursor-pointer"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={isVerifyingPromo || !promoCodeInput.trim()}
                    className="bg-black hover:bg-zinc-800 disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold py-2.5 px-4 transition cursor-pointer"
                  >
                    {isVerifyingPromo ? "Applying..." : "Apply"}
                  </button>
                )}
              </div>
              {promoError && (
                <p className="text-red-600 text-xs mt-1.5 font-semibold flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" strokeWidth={3} /> {promoError}
                </p>
              )}
              {appliedCoupon && (
                <p className="text-green-600 text-xs mt-1.5 font-bold flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" strokeWidth={3} /> Coupon "{appliedCoupon.code}" applied!
                </p>
              )}
            </div>

            {/* Pricing details */}
            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold text-black">৳{subtotal.toLocaleString()}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between items-center text-sm text-green-600 font-medium">
                  <span>Voucher Discount ({appliedCoupon.code})</span>
                  <span>-৳{discountAmount.toLocaleString()}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className={`font-semibold ${isFreeShipping ? "text-green-600 font-bold" : "text-black"}`}>
                  {isFreeShipping ? "FREE" : `৳${shippingFee.toLocaleString()}`}
                </span>
              </div>
 
              <div className="text-[10px] text-gray-400 mt-0.5 text-right font-medium">
                {isFreeShipping 
                  ? `Free Shipping applied (Orders over ৳${threshold.toLocaleString()})`
                  : `Free shipping on orders over ৳${threshold.toLocaleString()} | Delivery Inside Dhaka ৳80 | Outside Dhaka ৳120`
                }
              </div>

              <div className="border-t border-gray-200 pt-3.5 flex justify-between items-center text-base">
                <span className="font-bold text-black">Total</span>
                <span className="font-black text-black text-lg">৳{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
