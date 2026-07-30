"use client";

import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { removeFromWishlist, toggleWishlistDrawer } from "@/redux/wishlistSlice";
import { X, Heart, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function WishlistDrawer() {
  const { items, isWishlistOpen } = useSelector((state: RootState) => state.wishlist);
  const dispatch = useDispatch();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on clicking outside the drawer content panel
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        isWishlistOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(e.target as Node)
      ) {
        dispatch(toggleWishlistDrawer(false));
      }
    };
    if (isWishlistOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "hidden"; // Prevent body scroll
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "";
    };
  }, [isWishlistOpen, dispatch]);

  const handleClose = () => {
    dispatch(toggleWishlistDrawer(false));
  };

  const handleRemove = (id: string) => {
    dispatch(removeFromWishlist(id));
    toast.success("Removed from Favorites");
  };

  if (!isWishlistOpen) return null;

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
            <Heart className="h-5 w-5 text-black fill-current" />
            <h2 className="text-base font-black text-black uppercase tracking-wider">
              Favorites ({items.length})
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
              <Heart className="h-16 w-16 text-gray-200 mb-4" />
              <p className="text-base font-bold text-gray-900">Your Favorites list is empty.</p>
              <p className="text-sm text-gray-400 mt-1 max-w-[240px]">
                Add shoes to your Favorites list to keep track of items you love.
              </p>
              <button
                onClick={handleClose}
                className="mt-6 rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => {
              const discounted = item.discount > 0 ? item.price * (1 - item.discount / 100) : null;
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-4 pb-5 border-b border-gray-100 last:border-0"
                >
                  {/* Image */}
                  <Link 
                    href={`/products/${item.slug}`}
                    onClick={handleClose}
                    className="h-24 w-24 shrink-0 overflow-hidden bg-gray-50 border border-gray-100 block"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200" />
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <Link 
                        href={`/products/${item.slug}`}
                        onClick={handleClose}
                        className="text-sm font-bold text-black hover:underline truncate block"
                      >
                        {item.title}
                      </Link>
                      
                      {/* Price */}
                      <div className="text-right shrink-0">
                        {discounted ? (
                          <>
                            <p className="text-xs font-bold text-black">৳{discounted.toLocaleString()}</p>
                            <p className="text-[10px] text-gray-400 line-through">৳{item.price.toLocaleString()}</p>
                          </>
                        ) : (
                          <p className="text-xs font-bold text-black">৳{item.price.toLocaleString()}</p>
                        )}
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-500 font-medium mt-0.5 uppercase tracking-wider">
                      {item.targetGroup}'s {item.categoryName}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-4">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={handleClose}
                        className="bg-black hover:bg-zinc-800 text-white font-bold py-1.5 px-4 text-[10px] rounded-full transition cursor-pointer flex items-center gap-1 uppercase tracking-wider"
                      >
                        Select Size
                      </Link>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-gray-400 hover:text-red-600 transition cursor-pointer p-1 border border-gray-100 hover:border-red-200 rounded-full"
                        title="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-5 bg-gray-50">
            <Link
              href="/shop"
              onClick={handleClose}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-black py-4 text-center text-sm font-bold text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              Continue Shopping <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
