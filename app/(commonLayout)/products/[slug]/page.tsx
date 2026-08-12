"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetProductBySlugQuery, useGetProductsQuery, useGetProductReviewsQuery, useCreateReviewMutation } from "@/redux/api/product/productApi";
import { addToCart } from "@/redux/cartSlice";
import { toggleWishlist } from "@/redux/wishlistSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Loader, Heart, ChevronDown, ChevronUp, AlertCircle, ShoppingBag, CheckCircle, Star } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useGetAllSettingsQuery } from "@/redux/api/setting/settingApi";

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const { data: productResponse, isLoading, error } = useGetProductBySlugQuery(slug as string);
  const product = productResponse?.data;
  const { data: settingsResponse } = useGetAllSettingsQuery();
  const settings = settingsResponse?.data?.map || {};

  // Fetch related products from the same category
  const { data: relatedResponse } = useGetProductsQuery(
    {
      category: product?.categoryId || undefined,
      limit: 6,
    },
    { skip: !product }
  );

  const relatedProducts = (relatedResponse?.data || [])
    .filter((p: any) => p.id !== product?.id)
    .slice(0, 4);

  const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);
  const user = useSelector((state: RootState) => state.user.user);
  const isWishlisted = product ? wishlistItems.some((item) => item.id === product.id) : false;

  // UI state
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string>("");
  const [sizeError, setSizeError] = useState(false);
  
  // Accordion state
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    description: true,
    shipping: false,
  });

  // Reviews state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewsOpen, setReviewsOpen] = useState(false);

  const productId = product?.id;
  const { data: reviewsData, isLoading: reviewsLoading } = useGetProductReviewsQuery(productId!, {
    skip: !productId,
  });
  const [createReview, { isLoading: submittingReview }] = useCreateReviewMutation();

  const reviews: any[] = reviewsData?.data?.reviews || [];
  const avgRating: number = reviewsData?.data?.meta?.averageRating || 0;
  const totalReviews: number = reviewsData?.data?.meta?.totalReviews || 0;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to submit a review.");
      return;
    }
    if (!reviewComment.trim()) {
      toast.error("Please write a comment.");
      return;
    }
    try {
      await createReview({ productId: productId!, rating: reviewRating, comment: reviewComment }).unwrap();
      toast.success("Review submitted!");
      setReviewComment("");
      setReviewRating(5);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit review.");
    }
  };

  // Set default active image and attributes once product is loaded
  useEffect(() => {
    if (product) {
      if (product.images && product.images.length > 0) {
        setActiveImage(product.images[0]);
      }
      
      // Get all unique colors
      const colors = getUniqueColors(product.variants);
      if (colors.length > 0) {
        setSelectedColor(colors[0]); // Default to first color
      }
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader className="animate-spin h-8 w-8 text-black" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white text-center px-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Product Not Found</h2>
        <p className="text-sm text-gray-500 mt-2">
          The product you are looking for might have been removed or is temporarily unavailable.
        </p>
        <button
          onClick={() => router.push("/shop")}
          className="mt-6 rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 transition cursor-pointer"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const variants = product.variants || [];

  // Helper: Get unique colors, supporting comma-separated strings
  function getUniqueColors(vars: any[]) {
    const set = new Set<string>();
    vars.forEach((v) => {
      if (v.color) {
        v.color.split(",").forEach((c: string) => {
          const trimmed = c.trim();
          if (trimmed) set.add(trimmed);
        });
      }
    });
    return Array.from(set);
  }

  // Helper: Get unique sizes, supporting comma-separated strings
  function getUniqueSizes(vars: any[]) {
    const set = new Set<string>();
    vars.forEach((v) => {
      if (v.size) {
        v.size.split(",").forEach((s: string) => {
          const trimmed = s.trim();
          if (trimmed) set.add(trimmed);
        });
      }
    });
    return Array.from(set);
  }

  const availableColors = getUniqueColors(variants);
  const availableSizes = getUniqueSizes(variants);

  // Helper to check if a size exists for a color
  const doesSizeExistForColor = (sizeVal: string, colorVal: string | null) => {
    return variants.some((v: any) => {
      const colorMatch = colorVal 
        ? (v.color === colorVal || (v.color && v.color.split(",").map((c: string) => c.trim()).includes(colorVal)))
        : true;
      const sizeMatch = v.size === sizeVal || (v.size && v.size.split(",").map((s: string) => s.trim()).includes(sizeVal));
      return colorMatch && sizeMatch;
    });
  };

  // Helper to check if a size is available/in-stock for a color
  const isSizeAvailableForColor = (sizeVal: string, colorVal: string | null) => {
    return variants.some((v: any) => {
      const colorMatch = colorVal 
        ? (v.color === colorVal || (v.color && v.color.split(",").map((c: string) => c.trim()).includes(colorVal)))
        : true;
      const sizeMatch = v.size === sizeVal || (v.size && v.size.split(",").map((s: string) => s.trim()).includes(sizeVal));
      return colorMatch && sizeMatch && v.stock > 0;
    });
  };

  // Find currently selected variant based on selected size & color
  const selectedVariant = variants.find((v: any) => {
    const colorMatch = selectedColor 
      ? (v.color === selectedColor || (v.color && v.color.split(",").map((c: string) => c.trim()).includes(selectedColor)))
      : true;
    const sizeMatch = selectedSize 
      ? (v.size === selectedSize || (v.size && v.size.split(",").map((s: string) => s.trim()).includes(selectedSize)))
      : true;
    return colorMatch && sizeMatch;
  }) || variants.find((v: any) => {
    const colorMatch = selectedColor 
      ? (v.color === selectedColor || (v.color && v.color.split(",").map((c: string) => c.trim()).includes(selectedColor)))
      : true;
    return colorMatch;
  }) || variants[0];

  // Price calculations
  const basePrice = selectedVariant?.price !== null && selectedVariant?.price !== undefined 
    ? selectedVariant.price 
    : product.price;
  const discountedPrice = product.discount > 0 
    ? basePrice * (1 - product.discount / 100) 
    : basePrice;

  // Handle Add to Bag
  const handleAddToBag = () => {
    // If sizing is applicable but none is selected
    if (availableSizes.length > 0 && !selectedSize) {
      setSizeError(true);
      toast.error("Please select a size.");
      return;
    }

    setSizeError(false);

    if (!selectedVariant || selectedVariant.stock === 0) {
      toast.error("Selected item is out of stock.");
      return;
    }

    const cartPayload = {
      variantId: selectedVariant.id,
      productId: product.id,
      title: product.title,
      slug: product.slug,
      price: basePrice,
      discount: product.discount,
      discountedPrice: discountedPrice,
      size: selectedSize || selectedVariant.size || null,
      color: selectedColor || selectedVariant.color || null,
      image: product.images?.[0] || null,
      quantity: 1,
      stock: selectedVariant.stock,
    };

    dispatch(addToCart(cartPayload));
    toast.success("Added to Bag!", {
      icon: "👜",
    });
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    dispatch(
      toggleWishlist({
        id: product.id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        discount: product.discount,
        image: product.images?.[0] || null,
        categoryName: product.category?.name || "Shoe",
        targetGroup: product.targetGroup,
      })
    );
    if (isWishlisted) {
      toast.success("Removed from Favorites");
    } else {
      toast.success("Added to Favorites", { icon: "❤️" });
    }
  };

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div 
      className="min-h-screen bg-white py-8 md:py-16"
      style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="text-xs text-gray-500 mb-6 uppercase tracking-wider">
          Shop / {product.targetGroup} / {product.category?.name}
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          
          {/* LEFT: Image Gallery (cols: 7) */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto shrink-0 md:w-20 max-h-[500px] scrollbar-none">
              {product.images?.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`h-16 w-16 md:h-20 md:w-20 bg-gray-50 border shrink-0 overflow-hidden cursor-pointer transition ${
                    activeImage === img ? "border-black scale-95" : "border-gray-200 hover:border-black"
                  }`}
                >
                  <img src={img} alt={`${product.title} view ${idx + 1}`} className="h-full w-full object-cover object-top" />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 bg-gray-50 aspect-square overflow-hidden relative border border-gray-100 max-h-[600px] flex items-center justify-center">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.title}
                  className="w-full h-full object-cover object-top transition duration-300 hover:scale-105"
                />
              ) : (
                <div className="text-gray-300 text-sm">No Image Available</div>
              )}

              {/* Discount Tag */}
              {product.discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-3 py-1">
                  {product.discount}% OFF
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Product Information (cols: 5) */}
          <div className="lg:col-span-5 flex flex-col lg:sticky lg:top-24 lg:h-fit">
            {/* Product Header */}
            <div className="mb-6">
              <span className="text-sm font-bold text-red-600 uppercase tracking-wider">
                {product.discount > 0 ? "Special Offer" : "Just In"}
              </span>
              <h1 className="text-3xl md:text-4xl font-semibold text-black leading-tight mt-1">
                {product.title}
              </h1>
              <p className="text-base text-gray-500 font-medium mt-1.5">
                {product.targetGroup}'s {product.category?.name}
              </p>

              {/* Price Details */}
              <div className="flex items-center gap-3 mt-4">
                {product.discount > 0 ? (
                  <>
                    <span className="text-2xl font-bold text-black">
                      ৳{discountedPrice.toLocaleString()}
                    </span>
                    <span className="text-base text-gray-400 line-through">
                      ৳{basePrice.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-black">
                    ৳{basePrice.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-1">inclusive of all taxes</p>
            </div>

            {/* Color Selection (if multiple colors) */}
            {availableColors.length > 1 && (
              <div className="mb-6">
                <h3 className="text-base font-bold text-black mb-3">
                  Select Color: <span className="font-normal text-gray-500">{selectedColor}</span>
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setSelectedSize(null); // Reset size on color switch
                        setSizeError(false);
                      }}
                      className={`px-4 py-2 border text-xs font-bold transition cursor-pointer ${
                        selectedColor === color
                          ? "border-black bg-black text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-black"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizing Section */}
            {availableSizes.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-bold text-black">
                    Select Size
                  </h3>
                  <button className="text-sm text-gray-400 hover:text-black hover:underline cursor-pointer">
                    Size Guide
                  </button>
                </div>

                {sizeError && (
                  <p className="text-sm text-red-600 font-semibold flex items-center gap-1 mb-3">
                    <AlertCircle className="h-4 w-4" /> Please select a size.
                  </p>
                )}

                {/* Sizing Grid (Nike grid style) */}
                <div className="grid grid-cols-3 gap-2">
                  {availableSizes.map((sizeVal: string, idx: number) => {
                    const exists = doesSizeExistForColor(sizeVal, selectedColor);
                    const inStock = exists && isSizeAvailableForColor(sizeVal, selectedColor);
                    const isSelected = selectedSize === sizeVal;

                    return (
                      <button
                        key={idx}
                        disabled={!exists}
                        onClick={() => {
                          setSelectedSize(sizeVal);
                          setSizeError(false);
                        }}
                        className={`relative py-3.5 border text-xs font-bold transition flex items-center justify-center ${
                          !exists
                            ? "border-gray-100 bg-gray-50 text-gray-200 cursor-not-allowed opacity-40"
                            : !inStock
                            ? "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed overflow-hidden"
                            : isSelected
                            ? "border-black bg-black text-white z-10"
                            : "border-gray-200 hover:border-black text-black bg-white cursor-pointer"
                        }`}
                      >
                        {sizeVal}
                        {!inStock && exists && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-[120%] h-[1px] bg-gray-200 rotate-12 absolute" />
                          </div>
                        )}
                        {!exists && (
                          <span className="absolute bottom-0.5 text-[8px] text-gray-400 scale-75">N/A</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock Level Warning */}
            {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 3 && (
              <p className="text-sm text-amber-600 font-bold mb-4 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> Only {selectedVariant.stock} left in stock - order soon.
              </p>
            )}

            {selectedVariant && selectedVariant.stock === 0 && (
              <p className="text-sm text-red-600 font-bold mb-4 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> Out of stock in this variation.
              </p>
            )}

            {/* CTAs */}
            <div className="space-y-3.5">
              <button
                onClick={handleAddToBag}
                disabled={selectedVariant?.stock === 0}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-black hover:bg-zinc-800 text-white font-bold py-4 text-base transition disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed cursor-pointer"
              >
                <ShoppingBag className="h-4.5 w-4.5" />
                Add to Bag
              </button>

              <button
                onClick={handleToggleWishlist}
                className={`w-full flex items-center justify-center gap-2 rounded-full border py-4 text-base font-bold transition cursor-pointer ${
                  isWishlisted
                    ? "border-red-600 bg-red-50 text-red-600 hover:bg-red-100"
                    : "border-gray-200 bg-white text-black hover:border-black"
                }`}
              >
                <Heart className={`h-4.5 w-4.5 ${isWishlisted ? "fill-current text-red-600" : ""}`} />
                {isWishlisted ? "Favourited" : "Favourite"}
              </button>
            </div>

            {/* Nike Accordions */}
            <div className="border-t border-gray-100 mt-10">
              
              {/* Description Collapse */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() => toggleAccordion("description")}
                  className="w-full flex justify-between items-center py-5 text-base font-semibold text-black cursor-pointer text-left"
                >
                  Product Description
                  {openAccordions.description ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {openAccordions.description && (
                  <div className="pb-5 text-base text-gray-600 leading-relaxed space-y-3">
                    <p>{product.description}</p>
                    {product.metadata && (
                      <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 gap-4">
                        {Object.entries(product.metadata).map(([key, val]: any) => (
                          <div key={key}>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">{key}</p>
                            <p className="text-xs font-bold text-gray-800">{val}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Shipping & Returns Collapse */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() => toggleAccordion("shipping")}
                  className="w-full flex justify-between items-center py-5 text-base font-semibold text-black cursor-pointer text-left"
                >
                  Free Shipping & Returns
                  {openAccordions.shipping ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {openAccordions.shipping && (
                  <div className="pb-5 text-xs text-gray-500 leading-relaxed space-y-2">
                    <p>
                      Free standard shipping on orders over ৳{(settings.free_shipping_threshold ? parseFloat(settings.free_shipping_threshold).toLocaleString() : "1,000")}. Delivery takes 3–7 business days once processed.
                    </p>
                    <p>
                      You can return your purchase for any reason within 30 days of delivery, completely free of charge. Some exclusions apply.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* ---- Customer Reviews Section ---- */}
        <div className="mt-16 md:mt-20 border-t border-gray-100 pt-10">
          {/* Collapsible header */}
          <button
            type="button"
            onClick={() => setReviewsOpen((prev) => !prev)}
            className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-0 cursor-pointer group"
          >
            <div className="flex items-center justify-between w-full">
              <div className="text-left">
                <h2 className="text-xl md:text-2xl font-semibold text-black tracking-tight">Customer Reviews</h2>
                {totalReviews > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${
                            s <= Math.round(avgRating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-black">{avgRating.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">({totalReviews} {totalReviews === 1 ? "review" : "reviews"})</span>
                  </div>
                )}
              </div>
              {reviewsOpen ? (
                <ChevronUp className="h-5 w-5 text-gray-500 group-hover:text-black transition shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500 group-hover:text-black transition shrink-0" />
              )}
            </div>
          </button>

          {/* Collapsible body */}
          {reviewsOpen && (<>
          {user ? (
            <form
              onSubmit={handleSubmitReview}
              className="border border-zinc-200 p-6 md:p-8 bg-zinc-50 mb-8 space-y-4"
            >
              <h3 className="text-sm font-black uppercase tracking-widest text-black">Write a Review</h3>
              {/* Star picker */}
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
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Your Comment</label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="w-full border border-zinc-300 p-3.5 text-sm focus:outline-none focus:border-black placeholder-gray-400 bg-white resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submittingReview}
                className="bg-black hover:bg-zinc-800 text-white font-bold py-3 px-8 text-xs uppercase tracking-wider rounded-full transition cursor-pointer disabled:opacity-50"
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
              <p className="text-xs text-gray-400 pt-1">Note: You can only review products you have purchased and received.</p>
            </form>
          ) : (
            <div className="border border-zinc-200 p-5 bg-zinc-50 mb-8 text-sm text-gray-600">
              <span className="font-bold text-black">Sign in</span> to write a review.{" "}
              <Link href={`/login?redirect=/products/${slug}`} className="underline font-bold text-black">Login here</Link>.
            </div>
          )}

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="flex justify-center py-8">
              <Loader className="animate-spin h-5 w-5 text-black" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-gray-400 py-4">No reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="space-y-5">
              {reviews.map((review: any) => (
                <div key={review.id} className="border border-zinc-200 p-5 md:p-6">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <p className="text-sm font-black text-black">{review.userName}</p>
                      <p className="text-xs text-gray-400">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3.5 w-3.5 ${
                            s <= review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
          </>)}
        </div>

      </div>
      {/* ─── You Might Also Like: full-width, outside the max-w-7xl constraint ─── */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 md:mt-20 border-t border-gray-100 pt-12 px-6 md:px-12 lg:px-16">
          <h2 className="text-xl md:text-2xl font-semibold text-black tracking-tight mb-8">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {relatedProducts.map((p: any) => {
              const discountedPrice = p.discount > 0 ? p.price * (1 - p.discount / 100) : null;
              return (
                <Link key={p.id} href={`/products/${p.slug}`} className="group flex flex-col">
                  <div className="w-full h-[280px] sm:h-[380px] md:h-[460px] lg:h-[540px] bg-gray-100 overflow-hidden mb-3 flex-shrink-0">
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      {p.category?.name || p.targetGroup}
                    </p>
                    <p className="text-sm font-bold text-black leading-snug group-hover:underline line-clamp-2">
                      {p.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {discountedPrice ? (
                        <>
                          <span className="text-sm font-bold text-black">
                            ৳{Math.round(discountedPrice).toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            ৳{p.price.toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-red-600">
                            {p.discount}% OFF
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-black">
                          ৳{p.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
