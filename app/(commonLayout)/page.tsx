"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Truck, 
  ShieldCheck, 
  HeartHandshake, 
  Award, 
  Loader2,
  Heart,
  Play,
  Pause,
  Copy
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toggleWishlist } from "@/redux/wishlistSlice";
import { useGetCategoriesQuery } from "@/redux/api/category/categoryApi";
import { useGetProductsQuery } from "@/redux/api/product/productApi";
import { useGetActiveDiscountQuery } from "@/redux/api/discount/discountApi";
import { useGetAllSettingsQuery } from "@/redux/api/setting/settingApi";

// Curated high-quality Nike-style lifestyle imagery for the three core categories
const CATEGORY_IMAGE_MAP: Record<string, string> = {
  men: "/men2.jpg",
  women: "/women.avif",
  accessories: "/purfume.webp",
};

// Fallback silhouettes if database is empty
const STATIC_TRENDING_FALLBACKS = [
  { name: "Air Jordan 1", link: "/shop?search=Jordan", image: "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?q=80&w=250" },
  { name: "Air Max", link: "/shop?search=Air%20Max", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=250" },
  { name: "Graphic Tees", link: "/shop?search=Tee", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=250" },
  { name: "Dunk", link: "/shop?search=Dunk", image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=250" },
  { name: "Air Force 1", link: "/shop?search=Air%20Force", image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=80&w=250" },
  { name: "24.7 Collection", link: "/shop?search=Sweatshirt", image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=250" },
  { name: "Vomero 5", link: "/shop?search=Vomero", image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=250" },
  { name: "Sport Ready", link: "/shop", image: "https://images.unsplash.com/photo-1514989940723-e8e5163ccbe8?q=80&w=250" },
  { name: "ACG", link: "/shop?search=ACG", image: "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=250" },
  { name: "Pegasus", link: "/shop?search=Pegasus", image: "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?q=80&w=250" },
  { name: "Vomero Plus", link: "/shop?search=Vomero", image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=250" },
  { name: "Metcon", link: "/shop?search=Metcon", image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?q=80&w=250" },
  { name: "School Essential", link: "/shop?search=Backpack", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=250" },
  { name: "Jordan Retro", link: "/shop?search=Jordan", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=250" },
  { name: "Sabrina 4", link: "/shop?search=Sabrina", image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=250" },
  { name: "Tatum 4", link: "/shop?search=Tatum", image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=250" },
];

const SPECIAL_CAROUSEL_SLIDES = [
   {
    image: "/corousal3.webp",
    tag: "WOMEN'S COLLECTION",
    title: "ELEVATE YOUR WORKOUT",
    subtitle: "Premium performance sportswear designed for maximum flexibility, breathability, and comfort.",
    primaryBtnText: "Shop Men's",
    primaryLink: "/shop?targetGroup=MEN",
    secondaryBtnText: "View Collection",
    secondaryLink: "/shop",
  },
   {
    image: "/corousal4.webp",
    tag: "PRO PERFORMANCE",
    title: "DOMINATE THE STAGE",
    subtitle: "Unmatched speed meets elite comfort. Push your boundaries and exceed your goals daily.",
    primaryBtnText: "Shop Women's",
    primaryLink: "/shop?targetGroup=WOMEN",
    secondaryBtnText: "Shop All",
    secondaryLink: "/shop",
  },
  {
    image: "/corousal2.avif",
    tag: "JUST RELEASED",
    title: "WIN ON YOUR TERMS",
    subtitle: "Step into limitlessness with our brand new seasonal collections. Engineered with lightweight, premium fabrics designed for peak movement and performance.",
    primaryBtnText: "Shop Collection",
    primaryLink: "/shop",
    secondaryBtnText: "Shop Accessories",
    secondaryLink: "/shop?category=accessories",
  },
  {
    image: "/corousal1.webp",
    tag: "NEW ARRIVAL",
    title: "THE STANDARD IS SET",
    subtitle: "Experience next-level cushioning and support engineered for daily runners and active athletes.",
    primaryBtnText: "Shop Footwear",
    primaryLink: "/shop?category=shoes",
    secondaryBtnText: "Explore Running",
    secondaryLink: "/shop?targetGroup=SPORTS",
  },
 
 
  {
    image: "/corousal6.webp",
    tag: "LUXURY FRAGRANCE",
    title: "SIGNATURE SCENTS",
    subtitle: "Discover iconic fragrances crafted to complement your style with lasting elegance.",
    primaryBtnText: "Shop Perfumes",
    primaryLink: "/shop?category=accessories",
    secondaryBtnText: "Explore Shop",
    secondaryLink: "/shop",
  },
];

export default function Home() {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetCategoriesQuery();
  const { data: productsData, isLoading: isProductsLoading } = useGetProductsQuery({ limit: 16 });
  const { data: activeDiscountResponse } = useGetActiveDiscountQuery();
  const activeDiscount = activeDiscountResponse?.data;
  const { data: settingsResponse } = useGetAllSettingsQuery();
  const settings = settingsResponse?.data?.map || {};
  
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isPlaying) {
      setProgress(0);
      return;
    }

    const intervalTime = 50; // ms
    const totalTime = 5000; // ms
    const step = (intervalTime / totalTime) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, currentSlide]);

  // Dynamically resolve hero slides from settings or fallback to default
  const carouselSlides = (() => {
    if (settings.hero_carousel_slides) {
      try {
        const parsed = JSON.parse(settings.hero_carousel_slides);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (err) {
        console.error("Failed to parse hero_carousel_slides setting:", err);
      }
    }
    return SPECIAL_CAROUSEL_SLIDES;
  })();

  useEffect(() => {
    if (progress >= 100) {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
      setProgress(0);
    }
  }, [progress, carouselSlides.length]);

  const rawCategories = categoriesData?.data ?? [];
  const productsList = productsData?.data ?? [];

  // Filter root categories matching Men, Women, Accessories dynamically
  const menCat = rawCategories.find(
    (c: any) => !c.parentId && c.slug.toLowerCase().includes("men")
  );
  const womenCat = rawCategories.find(
    (c: any) => !c.parentId && c.slug.toLowerCase().includes("women")
  );
  const accCat = rawCategories.find(
    (c: any) => 
      !c.parentId && 
      (c.slug.toLowerCase().includes("access") || 
       c.slug.toLowerCase().includes("other") || 
       c.slug.toLowerCase().includes("shoe") || 
       c.slug.toLowerCase().includes("bag"))
  );

  // Helper function to resolve dynamic product image fallback for a category
  const getProductImageFallback = (catSlug: string, catId?: string) => {
    if (productsList.length > 0 && catId) {
      const match = productsList.find((p: any) => p.categoryId === catId || p.category?.slug === catSlug);
      if (match && match.images?.[0]) return match.images[0];
    }
    return CATEGORY_IMAGE_MAP[catSlug] || CATEGORY_IMAGE_MAP.accessories;
  };

  // Define the exact 3 cards matching Nike landing page section
  const displayCategories = [
    {
      id: menCat?.id || "fallback-men",
      name: "Shop Men's",
      slug: "men",
      shopUrl: menCat ? `/shop?category=${menCat.slug}` : "/shop?targetGroup=MEN",
      image: menCat ? getProductImageFallback(menCat.slug, menCat.id) : CATEGORY_IMAGE_MAP.men
    },
    {
      id: womenCat?.id || "fallback-women",
      name: "Shop Women's",
      slug: "women",
      shopUrl: womenCat ? `/shop?category=${womenCat.slug}` : "/shop?targetGroup=WOMEN",
      image: womenCat ? getProductImageFallback(womenCat.slug, womenCat.id) : CATEGORY_IMAGE_MAP.women
    },
    {
      id: accCat?.id || "fallback-accessories",
      name: "Shop Accessories",
      slug: "accessories",
      shopUrl: accCat ? `/shop?category=${accCat.slug}` : "/shop?category=accessories",
      image: accCat ? getProductImageFallback(accCat.slug, accCat.id) : CATEGORY_IMAGE_MAP.accessories
    }
  ];

  const handleScroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const scrollAmount = 340;
    const currentScroll = carouselRef.current.scrollLeft;
    
    const targetScroll = 
      direction === "left" 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
        
    carouselRef.current.scrollTo({
      left: targetScroll,
      behavior: "smooth"
    });
    setScrollPosition(targetScroll);
  };

  const isWishlisted = (productId: string) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const handleWishlistToggle = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    dispatch(toggleWishlist({
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      discount: product.discount,
      image: product.images?.[0] || null,
      categoryName: product.category?.name || "Sportswear",
      targetGroup: product.targetGroup || "UNISEX"
    }));
  };

  // Build the dynamic trending list using the database products
  const dynamicTrendingItems = productsList.map((product: any) => ({
    name: product.title,
    link: `/products/${product.slug}`,
    image: product.images?.[0] || null,
  })).filter((item: any) => item.image !== null);

  const displayTrending = dynamicTrendingItems.length > 0 ? dynamicTrendingItems : STATIC_TRENDING_FALLBACKS;

  // Dynamic Promo Marketing Banner Resolution
  const promoTitle = settings.promo_banner_title || (activeDiscount ? `${activeDiscount.code} SALE` : "BACK TO SCHOOL SALE");
  const promoOffer = settings.promo_banner_offer || (activeDiscount ? `EXTRA ${activeDiscount.type === "PERCENTAGE" ? `${activeDiscount.discountValue}%` : `৳${activeDiscount.discountValue}`} OFF` : "EXTRA 25% OFF");
  const promoCode = settings.promo_banner_code || (activeDiscount ? activeDiscount.code : "DAYONE");
  const promoSubtitle = settings.promo_banner_subtitle || (activeDiscount ? "FIXED PRICE STYLES" : "SELECT STYLES");

  return (
    <div className="bg-white text-black font-sans antialiased">
      
      {/* ── PROMO BANNER BAR (EXACT NIKE LOOK FOR LG & MOBILE) ── */}
      <div className="bg-[#111111] text-[#9eff00] py-3 sm:py-4 border-b border-zinc-900 w-full select-none font-sans overflow-hidden">
        <div className="mx-auto max-w-[1920px] px-3 sm:px-6 md:px-12 lg:px-16 flex items-center justify-between gap-2 sm:gap-4 text-center">
          
          {/* 1. Left Block: Sale Title */}
          <div className="text-left shrink-0">
            <div className="hidden md:block text-[11px] sm:text-xs md:text-sm lg:text-[15px] font-black tracking-wider uppercase text-[#9eff00] whitespace-nowrap">
              {promoTitle}
            </div>
            {/* Mobile view */}
            <div className="md:hidden leading-tight">
              <div className="text-[10px] sm:text-xs font-black tracking-wider uppercase text-[#9eff00]">
                {promoTitle}
              </div>
            </div>
          </div>

          {/* 2. Middle Block: Discount Offer */}
          <div className="text-center leading-tight shrink-0">
            <div className="text-[10px] sm:text-xs md:text-sm font-extrabold uppercase tracking-wider text-[#9eff00]">
              {promoOffer}
            </div>
            <div className="text-[9px] sm:text-[11px] md:text-sm font-extrabold uppercase tracking-widest text-[#9eff00]">
              {promoSubtitle}
            </div>
          </div>

          {/* 3. Logo Block */}
          <div className="hidden lg:flex items-center shrink-0 px-2">
            <img 
              src="/main-logo.svg" 
              alt="Pristto Logo" 
              className="h-6 lg:h-8 xl:h-8 w-auto object-contain select-none cursor-pointer invert" 
            />
          </div>

          {/* 4. Right Block: Coupon Code Button */}
          <div className="flex justify-end items-center shrink-0">
            <button
              onClick={() => {
                navigator.clipboard.writeText(promoCode);
                toast.success(`Coupon code "${promoCode}" copied!`);
              }}
              className="inline-flex items-center gap-1 text-[10px] sm:text-xs md:text-sm font-extrabold tracking-wider uppercase text-[#9eff00] hover:text-white transition-colors cursor-pointer select-none whitespace-nowrap"
              title="Click to copy coupon code"
            >
              CODE: {promoCode}
              <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#9eff00] shrink-0" />
            </button>
          </div>

        </div>
      </div>

      {/* ── DYNAMIC DUAL-MODE HERO SECTION (CAROUSEL VS VIDEO) ── */}
      <section className="w-full relative select-none">
        {settings.hero_mode === "VIDEO" ? (
          /* Video Showcase Hero Banner */
          <div className="relative w-full aspect-[3/4] sm:aspect-[21/9] md:aspect-[2.3/1] min-h-[520px] sm:min-h-[580px] md:min-h-[640px] overflow-hidden bg-zinc-950 flex flex-col justify-end">
            <video
              key={settings.hero_video_url || "/videos/gym.mp4"}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover object-top select-none"
            >
              <source src={settings.hero_video_url || "/videos/gym.mp4"} type="video/mp4" />
            </video>
            {/* Light, subtle gradient overlay for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent z-10" />

            {/* Video Hero Overlay Text */}
            <div className="relative z-20 mx-auto w-full max-w-[1920px] px-4 sm:px-6 md:px-12 lg:px-16 pb-16 sm:pb-20 text-white">
              {settings.hero_video_tag && (
                <span className="text-[10px] sm:text-xs md:text-sm font-black tracking-widest text-[#f5f5f5] uppercase mb-1.5 sm:mb-3 block drop-shadow-sm">
                  {settings.hero_video_tag}
                </span>
              )}
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-black tracking-tighter uppercase select-none leading-none mb-2 sm:mb-6 max-w-4xl drop-shadow-sm" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                {settings.hero_video_title || "WIN ON YOUR TERMS"}
              </h1>
              <p className="text-xs sm:text-sm md:text-base leading-relaxed text-zinc-100 max-w-xl mb-4 sm:mb-8 font-medium drop-shadow-sm line-clamp-3 sm:line-clamp-none">
                {settings.hero_video_subtitle || "Step into limitlessness with our brand new seasonal collections."}
              </p>
              <div className="flex flex-wrap gap-2.5 sm:gap-4">
                <Link
                  href={settings.hero_video_primary_btn_link || "/shop"}
                  className="rounded-full bg-white text-black hover:bg-zinc-200 transition duration-300 py-2.5 px-6 sm:py-3 sm:px-8 text-[11px] sm:text-xs font-bold tracking-wider uppercase border border-white cursor-pointer"
                >
                  {settings.hero_video_primary_btn_text || "Shop Collection"}
                </Link>
                {settings.hero_video_secondary_btn_text && (
                  <Link
                    href={settings.hero_video_secondary_btn_link || "/shop"}
                    className="rounded-full bg-transparent text-white hover:bg-white/10 transition duration-300 py-2.5 px-6 sm:py-3 sm:px-8 text-[11px] sm:text-xs font-bold tracking-wider uppercase border-2 border-white cursor-pointer"
                  >
                    {settings.hero_video_secondary_btn_text}
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Carousel Slider Showcase Hero */
          <div className="relative w-full aspect-[3/4] sm:aspect-[21/9] md:aspect-[2.3/1] min-h-[520px] sm:min-h-[580px] md:min-h-[640px] overflow-hidden bg-zinc-950 flex flex-col justify-end">
            {/* Slides */}
            {carouselSlides.map((slide: any, index: number) => {
              const active = index === currentSlide;
              return (
                <div
                  key={slide.id || index}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                    active ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  {/* Background Image */}
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="absolute inset-0 w-full h-full object-cover object-top select-none"
                  />
                  
                  {/* Dark overlay for readability */}
                  <div className="absolute inset-0 bg-black/25" />

                  {/* Redirect whole slide overlay */}
                  <Link
                    href={slide.primaryLink || "/shop"}
                    className="absolute inset-0 z-20 cursor-pointer"
                    aria-label={`Shop ${slide.title}`}
                  />
                  
                  {/* Slide content */}
                  <div className="relative z-25 mx-auto w-full max-w-[1920px] h-full flex flex-col justify-end pb-16 sm:pb-16 md:pb-20 text-white px-4 sm:px-6 md:px-12 lg:px-16 pointer-events-none">
                    {slide.tag && (
                      <span className="text-[10px] sm:text-xs md:text-sm font-black tracking-widest text-[#f5f5f5] uppercase mb-1.5 sm:mb-3 block drop-shadow-sm">
                        {slide.tag}
                      </span>
                    )}
                    <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-black tracking-tighter uppercase select-none leading-none mb-2 sm:mb-6 max-w-4xl drop-shadow-sm animate-fade-in" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                      {slide.title}
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base leading-relaxed text-zinc-100 max-w-xl mb-4 sm:mb-8 font-medium drop-shadow-sm line-clamp-2 sm:line-clamp-none">
                      {slide.subtitle}
                    </p>
                    <div className="flex flex-wrap gap-2.5 sm:gap-4 pointer-events-auto">
                      <Link
                        href={slide.primaryLink || "/shop"}
                        className="rounded-full bg-white text-black hover:bg-zinc-200 transition duration-300 py-2.5 px-6 sm:py-3 sm:px-8 text-[11px] sm:text-xs font-bold tracking-wider uppercase border border-white cursor-pointer"
                      >
                        {slide.primaryBtnText || "Shop Collection"}
                      </Link>
                      {slide.secondaryBtnText && (
                        <Link
                          href={slide.secondaryLink || "/shop"}
                          className="rounded-full bg-transparent text-white hover:bg-white/10 transition duration-300 py-2.5 px-6 sm:py-3 sm:px-8 text-[11px] sm:text-xs font-bold tracking-wider uppercase border-2 border-white cursor-pointer"
                        >
                          {slide.secondaryBtnText}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Controls overlay in the bottom right and dots on mobile/desktop */}
            <div className="absolute bottom-3 sm:bottom-6 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-8 md:px-16 pointer-events-none">
              {/* Dots indicators (Left on mobile, center on desktop) */}
              <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto md:flex-1 md:justify-center">
                {carouselSlides.map((_: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentSlide(index);
                      setProgress(0);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      index === currentSlide ? "w-5 sm:w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Bottom-right Controls */}
              <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
                {/* Play/Pause Button with Circular Progress Ring */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-9 h-9 sm:w-11 sm:h-11 relative flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-all cursor-pointer backdrop-blur-sm"
                  aria-label={isPlaying ? "Pause autoplay" : "Start autoplay"}
                >
                  {/* SVG Progress Ring */}
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 44 44">
                    {/* Background Track */}
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      className="stroke-white/20 fill-none"
                      strokeWidth="2.5"
                    />
                    {/* Active Progress Path */}
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      className="stroke-white fill-none transition-all duration-75"
                      strokeWidth="2.5"
                      strokeDasharray="113.1"
                      strokeDashoffset={113.1 - (progress / 100) * 113.1}
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Icon (centered on top) */}
                  <div className="relative z-10 flex items-center justify-center">
                    {isPlaying ? (
                      <Pause className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-white text-white" />
                    ) : (
                      <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-white text-white ml-0.5" />
                    )}
                  </div>
                </button>

                {/* Prev Button */}
                <button
                  onClick={() => {
                    setCurrentSlide(
                      (prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length
                    );
                    setProgress(0);
                  }}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 border border-white/20 transition-all cursor-pointer backdrop-blur-sm"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>

                {/* Next Button */}
                <button
                  onClick={() => {
                    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
                    setProgress(0);
                  }}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 border border-white/20 transition-all cursor-pointer backdrop-blur-sm"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── EXACT NIKE STYLE CATEGORY GRID (BEST IN CLASS) ── */}
      <section id="categories" className="mx-auto max-w-[1920px] px-0 sm:px-6 md:px-12 lg:px-16 mt-12 sm:mt-16 md:mt-20 scroll-mt-16">
        <div className="text-center mb-8 sm:mb-12 px-4 sm:px-0">
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-black uppercase leading-none select-none" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            BEST IN CLASS
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-zinc-800 mt-2 sm:mt-4 max-w-2xl mx-auto leading-relaxed">
            From class to sport, find back-to-school essentials for day one and beyond.
          </p>
        </div>

        {isCategoriesLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-black" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-6">
            {displayCategories.map((cat) => (
              <Link 
                key={cat.id} 
                href={cat.shopUrl}
                className="group relative flex flex-col justify-end aspect-[4/5] overflow-hidden bg-zinc-950 shadow-sm cursor-pointer rounded-none"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover select-none cursor-pointer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 sm:hidden" />

                <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 z-20">
                  <span className="inline-block text-white font-bold text-xl sm:text-xl md:text-2xl hover:text-zinc-300 transition duration-300 tracking-wide cursor-pointer drop-shadow-sm">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── DYNAMIC POPULAR RIGHT NOW PRODUCTS GRID ── */}
      <section className="mx-auto max-w-[1920px] px-0 sm:px-6 md:px-12 lg:px-16 mt-16 sm:mt-24 md:mt-28 mb-16 sm:mb-24 md:mb-28">
        <div className="mb-6 sm:mb-8 px-4 sm:px-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-black uppercase">
            Popular Right Now
          </h2>
        </div>

        {isProductsLoading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="animate-spin h-8 w-8 text-black" />
          </div>
        ) : productsList.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-2xl text-center py-20 bg-gray-50">
            <p className="text-gray-400 text-sm font-semibold">No products found. Please add products in the dashboard.</p>
            <Link href="/shop" className="inline-block mt-4 text-xs font-bold underline uppercase hover:text-gray-600">
              Go to shop page
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-2 sm:gap-x-6 gap-y-6 sm:gap-y-10">
            {productsList.slice(0, 4).map((product: any) => {
              const discountedPrice =
                product.discount > 0
                  ? product.price * (1 - product.discount / 100)
                  : null;

              const subtitle = product.targetGroup && product.category?.name
                ? `${product.targetGroup.charAt(0) + product.targetGroup.slice(1).toLowerCase()}'s ${product.category.name}`
                : product.category?.name || "Sportswear";

              return (
                <div 
                  key={product.id}
                  className="w-full group flex flex-col relative cursor-pointer"
                >
                  {/* Image container: Nike aspect-square with #f6f6f6 bg */}
                  <div className="relative w-full aspect-square bg-[#f6f6f6] overflow-hidden mb-1.5 cursor-pointer flex items-center justify-center">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover object-center select-none cursor-pointer"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#f6f6f6] flex items-center justify-center text-zinc-400 text-xs">
                        No Image
                      </div>
                    )}
                    
                    {/* Quick Redirect Cover Link */}
                    <Link href={`/products/${product.slug}`} className="absolute inset-0 z-10 cursor-pointer" aria-label={product.title} />
                  </div>

                  {/* Nike Colorway Swatches Bar (px-2 on mobile only, flush md:px-0 on desktop) */}
                  {product.images && product.images.length > 1 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1 mb-1 px-2 md:px-0 scrollbar-none min-h-[32px]">
                      {product.images.slice(0, 8).map((img: string, idx: number) => (
                        <div
                          key={idx}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-[#f6f6f6] border overflow-hidden shrink-0 transition cursor-pointer ${
                            idx === 0 ? "border-black" : "border-gray-200 hover:border-gray-400"
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Nike Info Hierarchy: Title -> Subtitle -> Price (px-2 on mobile only, flush md:px-0 on desktop) */}
                  <div className="flex flex-col px-2 md:px-0 mt-0.5">
                    <Link 
                      href={`/products/${product.slug}`}
                      className="text-sm sm:text-[15px] font-semibold text-[#111111] truncate cursor-pointer leading-tight"
                    >
                      {product.title}
                    </Link>
                    <p className="text-xs sm:text-sm font-normal text-[#757575] mt-0.5 truncate">
                      {subtitle}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-1 sm:mt-1.5">
                      {discountedPrice ? (
                        <>
                          <span className="text-sm sm:text-[15px] font-semibold text-[#111111]">
                            ৳{discountedPrice.toLocaleString()}
                          </span>
                          <span className="text-xs sm:text-sm text-[#757575] line-through">
                            ৳{product.price.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm sm:text-[15px] font-semibold text-[#111111]">
                          ৳{product.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── FULL WIDTH VIDEO SECTOR ── */}
      <section className="w-full aspect-[3/4] sm:aspect-[16/9] md:aspect-[21/9] min-h-[480px] sm:min-h-[450px] bg-black relative overflow-hidden select-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center"
        >
          <source src="/videos/running.mp4" type="video/mp4" />
        </video>
        {/* Subtle gradient overlay — clear & bright video background */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent z-10" />
        {/* Left-aligned editorial text overlay */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end px-6 sm:px-8 md:px-16 lg:px-24 pb-10 sm:pb-14 md:pb-20 text-white">
          <span className="text-[10px] sm:text-xs font-black tracking-[0.3em] uppercase text-zinc-300 mb-2 sm:mb-3 block">
            PRISTTO MOTION
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-none mb-3 sm:mb-4 max-w-2xl">
            MOVEMENT<br />IS LIFE
          </h2>
          <p className="text-xs sm:text-sm text-zinc-200 max-w-xs sm:max-w-sm leading-relaxed mb-6 sm:mb-7 font-normal line-clamp-3 sm:line-clamp-none">
            Engineered to keep you moving forward. Performance activewear crafted for speed, agility, and recovery.
          </p>
          <div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-white text-black hover:bg-zinc-100 transition duration-300 py-3 px-7 sm:py-3 sm:px-8 text-xs font-bold tracking-wider uppercase"
            >
              Explore Activewear <span className="text-sm">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── EXACT NIKE STYLE FEATURED CAMPAIGNS GRID ── */}
      <section className="mx-auto max-w-[1920px] px-0 sm:px-6 md:px-12 lg:px-16 mt-16 sm:mt-24">
        <div className="mb-6 sm:mb-8 px-3 sm:px-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-black uppercase">
            Featured
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          
          {/* Campaign 1: Run Free */}
          <div className="flex flex-col group cursor-pointer">
            <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100 shadow-sm cursor-pointer">
              <img
                src="/run free.avif"
                alt="Jordan Kids"
                className="absolute inset-0 w-full h-full object-cover select-none cursor-pointer"
                loading="lazy"
              />
              <Link href="/shop?category=shoes" className="absolute inset-0 z-20 cursor-pointer" />
            </div>
            <div className="mt-4 sm:mt-5 px-3 sm:px-0">
              <h3 className="text-sm sm:text-[15px] font-medium text-black tracking-tight cursor-pointer">
                Run Free
              </h3>
              <p className="text-xs text-zinc-500 font-semibold leading-relaxed mt-1 sm:mt-1.5 max-w-[320px]">
                Ultra-responsive road runners engineered to cushion and accelerate every single step.
              </p>
              <Link 
                href="/shop?category=shoes" 
                className="inline-block text-xs font-semibold underline text-black hover:text-zinc-600 mt-2.5 sm:mt-3.5 tracking-wide transition cursor-pointer"
              >
                Shop Footwear
              </Link>
            </div>
          </div>

          {/* Campaign 2: Street Style */}
          <div className="flex flex-col group cursor-pointer">
            <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100 shadow-sm cursor-pointer">
              <img
                src="/men.jpg"
                alt="Streetwear style campaign"
                className="absolute inset-0 w-full h-full object-cover select-none cursor-pointer"
                loading="lazy"
              />
              <Link href="/shop?targetGroup=UNISEX" className="absolute inset-0 z-20 cursor-pointer" />
            </div>
            <div className="mt-4 sm:mt-5 px-3 sm:px-0">
              <h3 className="text-sm sm:text-[15px] font-medium text-black tracking-tight cursor-pointer">
                Street Essentials
              </h3>
              <p className="text-xs text-zinc-500 font-semibold leading-relaxed mt-1 sm:mt-1.5 max-w-[320px]">
                Reimagined everyday basics designed to look completely effortless, anywhere and everywhere.
              </p>
              <Link 
                href="/shop?targetGroup=UNISEX" 
                className="inline-block text-xs font-semibold underline text-black hover:text-zinc-600 mt-2.5 sm:mt-3.5 tracking-wide transition cursor-pointer"
              >
                Shop Streetwear
              </Link>
            </div>
          </div>

          {/* Campaign 3: Gym Gear */}
          <div className="flex flex-col group cursor-pointer">
            <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100 shadow-sm cursor-pointer">
              <img
                src="/featured.avif"
                alt="Jordan Kids"
                className="absolute inset-0 w-full h-full object-cover select-none cursor-pointer"
                loading="lazy"
              />
              <Link href="/shop?category=clothing" className="absolute inset-0 z-20 cursor-pointer" />
            </div>
            <div className="mt-4 sm:mt-5 px-3 sm:px-0">
              <h3 className="text-sm sm:text-[15px] font-medium text-black tracking-tight cursor-pointer">
                Peak Recovery
              </h3>
              <p className="text-xs text-zinc-500 font-semibold leading-relaxed mt-1 sm:mt-1.5 max-w-[320px]">
                Sweat-wicking performance clothing built to withstand high-intensity reps and active training.
              </p>
              <Link 
                href="/shop?category=clothing" 
                className="inline-block text-xs font-semibold underline text-black hover:text-zinc-600 mt-2.5 sm:mt-3.5 tracking-wide transition cursor-pointer"
              >
                Shop Training
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── HERO BANNER VIDEO SECTION ── */}
      <section className="w-full relative mt-16 sm:mt-24 select-none">
        <div className="relative w-full aspect-[3/4] sm:aspect-[21/9] md:aspect-[2.3/1] min-h-[500px] sm:min-h-[440px] overflow-hidden bg-zinc-950 flex flex-col justify-end">
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent z-10" />
          {/* Full-screen background video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-center select-none"
          >
            <source src="/videos/gym.mp4" type="video/mp4" />
          </video>
          
          <div className="relative z-20 mx-auto w-full max-w-[1920px] px-4 sm:px-6 md:px-12 lg:px-16 pb-10 sm:pb-12 md:pb-20 text-white">
            <span className="text-[11px] sm:text-xs md:text-sm font-black tracking-widest text-[#f5f5f5] uppercase mb-2 sm:mb-3 block">
              Just Released
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black tracking-tighter uppercase select-none leading-none mb-3 sm:mb-6 max-w-4xl drop-shadow-sm">
              {settings.hero_title || "WIN ON YOUR TERMS"}
            </h1>
            <p className="text-xs sm:text-sm md:text-base leading-relaxed text-zinc-100 max-w-xl mb-6 sm:mb-8 font-medium drop-shadow-sm line-clamp-3 sm:line-clamp-none">
              {settings.hero_subtitle || "Step into limitlessness with our brand new seasonal collections. Engineered with lightweight, premium fabrics designed for peak movement and performance."}
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Link
                href="/shop"
                className="rounded-full bg-white text-black hover:bg-zinc-200 transition duration-300 py-3 px-7 sm:py-3 sm:px-8 text-xs font-bold tracking-wider uppercase border border-white"
              >
                Shop Collection
              </Link>
              <Link
                href="/shop?targetGroup=MEN"
                className="rounded-full bg-transparent text-white hover:bg-white/10 transition duration-300 py-3 px-7 sm:py-3 sm:px-8 text-xs font-bold tracking-wider uppercase border-2 border-white"
              >
                Shop Men&#39;s
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FRAGRANCE & TIMEPIECES SECTION ── */}
      <section className="mx-auto max-w-[1920px] px-0 sm:px-6 md:px-12 lg:px-16 mt-16 sm:mt-24 md:mt-28">
        <div className="text-center mb-8 sm:mb-12 select-none px-4 sm:px-0">
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter text-black uppercase leading-none" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            FRAGRANCE & TIMEPIECES
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-zinc-600 mt-2 sm:mt-4 max-w-2xl mx-auto leading-relaxed">
            Iconic luxury fragrances and precision timepieces crafted to elevate your daily style.
          </p>
        </div>

        {/* Outer Container: 1 column on mobile, 2 columns on desktop (old desktop look preserved) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          
          {/* Left Column (Desktop: Tall Fragrance Card; Mobile: Full Width Fragrance Banner) */}
          <div className="relative group overflow-hidden bg-zinc-900 w-full h-[360px] sm:h-[480px] md:h-[640px] lg:h-[720px] xl:h-[900px] 2xl:h-[1316px] cursor-pointer">
            <img
              src="/landing-purfume.avif"
              alt="Shop Fragrance"
              className="absolute inset-0 w-full h-full object-cover object-center select-none cursor-pointer"
              loading="lazy"
            />
            {/* Softened black gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10 cursor-pointer" />
            
            {/* Bottom-Left Title Overlay */}
            <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 z-20 pointer-events-none">
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight drop-shadow-md block">
                Shop Fragrance
              </span>
            </div>

            <Link href="/shop?category=accessories" className="absolute inset-0 z-30 cursor-pointer" aria-label="Shop Fragrance" />
          </div>

          {/* Right Column (Desktop: 2 Stacked Watch Cards; Mobile: 2 Watch Cards with 360px height) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-col gap-4 h-full w-full">
            {/* Watch Card 1 */}
            <div className="relative group overflow-hidden bg-zinc-900 w-full flex-1 h-[360px] md:h-full md:min-h-[300px] cursor-pointer">
              <img
                src="/landing-watch-1.jpg"
                alt="Shop Timepieces"
                className="absolute inset-0 w-full h-full object-cover object-center select-none cursor-pointer"
                loading="lazy"
              />
              {/* Softened black gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent z-10 cursor-pointer" />
              
              {/* Bottom-Left Title Overlay */}
              <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 z-20 pointer-events-none">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight drop-shadow-md block">
                  Shop Timepieces
                </span>
              </div>

              <Link href="/shop?category=accessories" className="absolute inset-0 z-30 cursor-pointer" aria-label="Shop Timepieces" />
            </div>

            {/* Watch Card 2 */}
            <div className="relative group overflow-hidden bg-zinc-900 w-full flex-1 h-[360px] md:h-full md:min-h-[300px] cursor-pointer">
              <img
                src="/landing-watch-2.jpg"
                alt="Shop Luxury Watches"
                className="absolute inset-0 w-full h-full object-cover object-center select-none cursor-pointer"
                loading="lazy"
              />
              {/* Softened black gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent z-10 cursor-pointer" />
              
              {/* Bottom-Left Title Overlay */}
              <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 z-20 pointer-events-none">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight drop-shadow-md block">
                  Shop Luxury Watches
                </span>
              </div>

              <Link href="/shop?category=accessories" className="absolute inset-0 z-30 cursor-pointer" aria-label="Shop Luxury Watches" />
            </div>
          </div>

        </div>
      </section>

      {/* ── BACK TO SCHOOL SECTION ── */}
      <section className="mx-auto max-w-[1920px] px-0 sm:px-6 md:px-12 lg:px-16 mt-16 sm:mt-24 md:mt-28 mb-16 sm:mb-24 md:mb-28">
        <div className="text-center mb-8 sm:mb-12 select-none px-4 sm:px-0">
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter text-black uppercase leading-none" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            BACK TO SCHOOL
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-zinc-600 mt-2 sm:mt-4 max-w-2xl mx-auto leading-relaxed">
            Mix and match with ease, because every piece plays.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: Jordan Kids */}
          <div className="group relative flex flex-col justify-end aspect-[4/5] overflow-hidden bg-zinc-950 cursor-pointer rounded-none">
            <img
              src="/original.avif"
              alt="Jordan Kids"
              className="absolute inset-0 w-full h-full object-cover select-none cursor-pointer"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent z-10 cursor-pointer" />
            <div className="relative z-20 p-6 sm:p-8 flex flex-col items-start justify-end h-full text-white cursor-pointer">
              <p className="text-base sm:text-[17px] font-bold leading-snug mb-3 sm:mb-4 max-w-[260px] cursor-pointer">
                Bring serious style to their everyday game.
              </p>
              <Link
                href="/shop?search=Jordan"
                className="bg-white text-black text-xs font-bold px-5 py-2.5 rounded-full hover:bg-zinc-200 transition-colors uppercase tracking-wider cursor-pointer"
              >
                Jordan Kids
              </Link>
            </div>
            <Link href="/shop?search=Jordan" className="absolute inset-0 z-30 cursor-pointer" />
          </div>

          {/* Card 2: Bags & Backpacks */}
          <div className="group relative flex flex-col justify-end aspect-[4/5] overflow-hidden bg-zinc-950 cursor-pointer rounded-none">
            <img
              src="/original (1).avif"
              alt="Bags & Backpacks"
              className="absolute inset-0 w-full h-full object-cover select-none cursor-pointer"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent z-10 cursor-pointer" />
            <div className="relative z-20 p-6 sm:p-8 flex flex-col items-start justify-end h-full text-white cursor-pointer">
              <p className="text-base sm:text-[17px] font-bold leading-snug mb-3 sm:mb-4 max-w-[260px] cursor-pointer">
                Find the perfect bag for carrying their gear comfortably.
              </p>
              <Link
                href="/shop?category=accessories&search=bag"
                className="bg-white text-black text-xs font-bold px-5 py-2.5 rounded-full hover:bg-zinc-200 transition-colors uppercase tracking-wider cursor-pointer"
              >
                Bags & Backpacks
              </Link>
            </div>
            <Link href="/shop?category=accessories&search=bag" className="absolute inset-0 z-30 cursor-pointer" />
          </div>

          {/* Card 3: Nike Kids */}
          <div className="group relative flex flex-col justify-end aspect-[4/5] overflow-hidden bg-zinc-950 cursor-pointer rounded-none">
            <img
              src="/original (2).avif"
              alt="Nike Kids"
              className="absolute inset-0 w-full h-full object-cover select-none cursor-pointer"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent z-10 cursor-pointer" />
            <div className="relative z-20 p-6 sm:p-8 flex flex-col items-start justify-end h-full text-white cursor-pointer">
              <p className="text-base sm:text-[17px] font-bold leading-snug mb-3 sm:mb-4 max-w-[260px] cursor-pointer">
                Elevate their school style with essentials for the classroom and sport.
              </p>
              <Link
                href="/shop?targetGroup=KIDS"
                className="bg-white text-black text-xs font-bold px-5 py-2.5 rounded-full hover:bg-zinc-200 transition-colors uppercase tracking-wider cursor-pointer"
              >
                Nike Kids
              </Link>
            </div>
            <Link href="/shop?targetGroup=KIDS" className="absolute inset-0 z-30 cursor-pointer" />
          </div>
        </div>
      </section>

      {/* ── DYNAMIC NIKE "TRENDING" SILHOUETTE GRID (EXACT NIKE LOOK) ── */}
      <section className="mx-auto max-w-[1920px] px-0 sm:px-6 md:px-12 lg:px-16 mt-16 sm:mt-24 md:mt-28 mb-16 sm:mb-24 md:mb-28 select-none">
        <div className="text-center mb-8 sm:mb-12 px-4 sm:px-0">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-black uppercase leading-none select-none" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            TRENDING
          </h2>
          <p className="text-xs sm:text-sm md:text-base font-semibold text-zinc-900 mt-3 max-w-xl mx-auto leading-relaxed">
            Classic silhouettes and cutting-edge innovation to build your game from the ground up.
          </p>
        </div>

        {/* 3 columns on mobile, 4 on tablet, 8 on desktop */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-x-2 sm:gap-x-6 gap-y-8 sm:gap-y-12 mt-6 sm:mt-12 px-2 sm:px-0">
          {displayTrending.slice(0, 16).map((item: any, index: number) => (
            <Link 
              key={index} 
              href={item.link} 
              className="flex flex-col items-center group text-center cursor-pointer"
            >
              {/* Transparent container with uniform fixed height so all floating silhouettes align perfectly */}
              <div className="w-full h-16 sm:h-24 bg-transparent flex items-center justify-center overflow-hidden cursor-pointer">
                <img
                  src={item.image || ""}
                  alt={item.name}
                  className="max-h-14 sm:max-h-20 w-auto max-w-full object-contain select-none cursor-pointer"
                  loading="lazy"
                />
              </div>
              {/* Label */}
              <span className="text-xs sm:text-[15px] font-bold text-black mt-2 sm:mt-3 transition truncate max-w-full cursor-pointer group-hover:text-zinc-600">
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── BRAND STATEMENT SECTION (ADIDAS TEXT LAYOUT) ── */}
      <section className="bg-black text-white py-20 text-center relative overflow-hidden select-none border-t border-zinc-900">
        <div className="mx-auto max-w-5xl px-6 flex flex-col items-start">
          <h2 className="text-xl md:text-3xl font-black uppercase tracking-widest mb-6" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            Fashion, Fragrance, Timepieces & Sports 
          </h2>
          <div className="text-xs md:text-base text-zinc-200 space-y-4 max-w-4xl leading-relaxed text-start font-normal">
            <p>
              Pristto is your all-in-one lifestyle destination. We bring together the very best in fashion clothing, luxury perfumes, premium watches and the latest sportswear — so you never have to shop anywhere else. Whether you're refreshing your wardrobe with the latest seasonal styles, finding a signature scent, investing in a timepiece that turns heads, or gearing up for your next workout, Pristto has you covered for every occasion and every mood.
            </p>
            <p>
              Explore our clothing collection featuring everyday essentials and statement pieces for Men, Women and Kids. Discover a curated selection of perfumes and fragrances from around the world — from fresh and light to bold and intense. Browse our watch collection for elegant dress watches, smart sports watches and everything in between. And now, step into our expanding sports range with performance sneakers, activewear and accessories designed for training, running and beyond. One brand. Every lifestyle. Pristto.
            </p>
          </div>
          {/* Pristto brand icon */}
          <img 
            src="/main-logo.svg" 
            alt="Pristto Logo" 
            className="h-8 lg:h-10 xl:h-10 w-auto object-contain mx-auto mt-8 select-none invert" 
          />
        </div>
      </section>

      

    </div>
  );
}