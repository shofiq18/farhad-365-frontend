"use client";

import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { toggleDrawer, updateQuantity, removeFromCart } from "@/redux/cartSlice";
import { useGetAllSettingsQuery } from "@/redux/api/setting/settingApi";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function CartDrawer() {
  const { items, isDrawerOpen } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const drawerRef = useRef<HTMLDivElement>(null);

  const { data: settingsResponse } = useGetAllSettingsQuery();
  const settings = settingsResponse?.data?.map || {};

  // Close drawer on clicking outside the drawer content panel
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        isDrawerOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(e.target as Node)
      ) {
        dispatch(toggleDrawer(false));
      }
    };
    if (isDrawerOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "hidden"; // Prevent body scroll
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen, dispatch]);

  const handleClose = () => {
    dispatch(toggleDrawer(false));
  };

  const handleQtyChange = (variantId: string, currentQty: number, change: number) => {
    dispatch(updateQuantity({ variantId, quantity: currentQty + change }));
  };

  const handleRemove = (variantId: string) => {
    dispatch(removeFromCart(variantId));
  };

  // Subtotal calculation
  const subtotal = items.reduce((sum, item) => sum + item.discountedPrice * item.quantity, 0);

  // Dynamic free shipping threshold & delivery fees from settings
  const threshold = settings.free_shipping_threshold ? parseFloat(settings.free_shipping_threshold) : 1000;
  const insideDhakaFee = settings.inside_dhaka_shipping ? parseFloat(settings.inside_dhaka_shipping) : 80;
  const outsideDhakaFee = settings.outside_dhaka_shipping ? parseFloat(settings.outside_dhaka_shipping) : 120;
  const isFreeShipping = subtotal >= threshold;

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={handleClose}
      />

      {/* Drawer Body */}
      <div
        ref={drawerRef}
        className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300"
        style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-black" />
            <h2 className="text-lg font-bold text-black">
              Cart Bag <span className="text-gray-400 font-normal">({items.reduce((acc, curr) => acc + curr.quantity, 0)})</span>
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-black transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="h-16 w-16 text-gray-200 mb-4" />
              <p className="text-base font-bold text-gray-900">Your bag is empty.</p>
              <p className="text-sm text-gray-400 mt-1 max-w-[240px]">
                When you add items to your shopping bag, they will appear here.
              </p>
              <button
                onClick={handleClose}
                className="mt-6 rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.variantId}
                className="flex items-start gap-4 pb-5 border-b border-gray-100 last:border-0"
              >
                {/* Image */}
                <div className="h-24 w-24 shrink-0 overflow-hidden bg-gray-50 border border-gray-100">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-sm font-bold text-black hover:underline truncate">
                      <Link href={`/products/${item.slug}`} onClick={handleClose}>
                        {item.title}
                      </Link>
                    </h3>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-black">
                        ৳{(item.discountedPrice * item.quantity).toLocaleString()}
                      </p>
                      {item.discount > 0 && (
                        <p className="text-xs text-gray-400 line-through">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Attributes */}
                  <p className="text-xs text-gray-500 mt-1">
                    {item.size ? `Size: ${item.size}` : ""}
                    {item.size && item.color ? " | " : ""}
                    {item.color ? `Color: ${item.color}` : ""}
                  </p>

                  {/* Qty & Remove Actions */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-gray-200 py-1 px-2.5">
                      <button
                        onClick={() => handleQtyChange(item.variantId, item.quantity, -1)}
                        disabled={item.quantity <= 1}
                        className="text-gray-500 hover:text-black disabled:opacity-30 cursor-pointer p-0.5"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-xs font-bold text-black px-3.5 min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQtyChange(item.variantId, item.quantity, 1)}
                        disabled={item.quantity >= item.stock}
                        className="text-gray-500 hover:text-black disabled:opacity-30 cursor-pointer p-0.5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.variantId)}
                      className="text-gray-400 hover:text-red-600 transition cursor-pointer p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary (Only if items exist) */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50/50 p-5 space-y-3">
            {/* Free Shipping Progress Indicator */}
            <div className="bg-white border border-gray-100 p-3 rounded-lg text-center shadow-2xs">
              {isFreeShipping ? (
                <p className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1">
                  🎉 Congratulations! You qualify for FREE Delivery!
                </p>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-zinc-700 mb-1.5">
                    Add <span className="font-bold text-black">৳{(threshold - subtotal).toLocaleString()}</span> more for <span className="font-bold text-emerald-600">FREE Delivery</span>
                  </p>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-300 rounded-full" 
                      style={{ width: `${Math.min(100, (subtotal / threshold) * 100)}%` }} 
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-sm pt-1">
              <span className="font-semibold text-gray-600">Subtotal</span>
              <span className="text-base font-bold text-black">৳{subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center text-xs text-zinc-500 border-t border-dashed border-gray-200 pt-2">
              <span>Estimated Delivery</span>
              <span className="font-bold text-black">
                {isFreeShipping ? "FREE" : `৳${insideDhakaFee} (Inside Dhaka) / ৳${outsideDhakaFee} (Outside)`}
              </span>
            </div>
            
            <div className="grid gap-2 pt-1">
              <Link
                href="/checkout"
                onClick={handleClose}
                className="w-full text-center bg-black hover:bg-zinc-800 text-white font-bold py-3.5 px-4 rounded-full text-sm transition cursor-pointer shadow-sm"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
