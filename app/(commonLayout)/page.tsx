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
  Pause
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toggleWishlist } from "@/redux/wishlistSlice";
import { useGetCategoriesQuery } from "@/redux/api/category/categoryApi";
import { useGetProductsQuery } from "@/redux/api/product/productApi";

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
    image: "/corousal2.webp",
    subtitle: "The best hoopers know greatness isn't built overnight—it's forged rep after rep, detail by detail.",
    link: "/shop?targetGroup=SPORTS",
  },
  {
    image: "/corousal1.webp",
     title: "THE STANDARD IS SET",
    subtitle: "Experience next-level cushioning and support engineered for daily runners and active athletes.",
    link: "/shop?category=shoes",
  },
  {
    image: "/corousal3.webp",
    title: "ELEVATE YOUR WORKOUT",
    subtitle: "Premium performance sportswear designed for maximum flexibility, breathability, and comfort.",
    link: "/shop?targetGroup=WOMEN",
  },
  {
    image: "/corousal4.webp",
    title: "DOMINATE THE STAGE",
    subtitle: "Unmatched speed meets elite comfort. Push your boundaries and exceed your goals daily.",
    link: "/shop?targetGroup=MEN",
  },
  {
    image: "/corousal6.webp",
    title: "PURFUMES",
    subtitle: "Unmatched speed meets elite comfort. Push your boundaries and exceed your goals daily.",
    link: "/shop?targetGroup=MEN",
  },
];

export default function Home() {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetCategoriesQuery();
  const { data: productsData, isLoading: isProductsLoading } = useGetProductsQuery({ limit: 16 });
  
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

  useEffect(() => {
    if (progress >= 100) {
      setCurrentSlide((prev) => (prev + 1) % SPECIAL_CAROUSEL_SLIDES.length);
      setProgress(0);
    }
  }, [progress]);

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

  return (
    <div className="bg-white text-black font-sans antialiased">
      
      {/* ── PROMO BANNER BAR (NIKE STYLE BACK TO SCHOOL SALE) ── */}
      <div className="bg-[#111111] text-[#9eff00] py-6 border-b border-zinc-900 w-full select-none font-sans">
        <div className="mx-auto max-w-[1920px] px-6 md:px-12 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          
          {/* 1. Left Block */}
          <div className="text-sm md:text-[16px] font-semibold tracking-wider uppercase">
            BACK TO SCHOOL SALE
          </div>

          {/* 2. Middle Block (contains 2 divs with justify-between) */}
          <div className="flex items-center justify-between gap-12 md:gap-24 w-full max-w-[450px]">
            {/* Text sub-div */}
            <div className="text-left leading-tight">
              <div className="text-xs md:text-[15px] font-black uppercase tracking-wider">EXTRA 25% OFF</div>
              <div className="text-[10px] md:text-[15px] font-extrabold uppercase tracking-widest text-[#9eff00]">SELECT STYLES</div>
            </div>
            
            {/* Logo sub-div */}
            <div className="flex items-center">
              <svg className="h-10 w-16 text-[#9eff00] hover:scale-105 transition-transform duration-200" viewBox="0 0 115 90" xmlns="http://www.w3.org/2000/svg">
                {/* Stripe 1 */}
                <path d="M10,75 C16,73 26,65 36,50 C44,40 32,32 45,22 C55,14 75,10 95,5 C80,10 65,18 55,28 C45,38 55,45 45,55 C35,65 22,72 10,75 Z" fill="currentColor" />
                {/* Stripe 2 */}
                <path d="M15,78 C21,76 31,68 41,53 C49,43 37,35 50,25 C60,17 80,13 100,8 C85,13 70,21 60,31 C50,41 60,48 50,58 C40,68 27,75 15,78 Z" fill="currentColor" />
                {/* Stripe 3 */}
                <path d="M20,81 C26,79 36,71 46,56 C54,46 42,38 55,28 C65,20 85,16 105,11 C90,16 75,24 65,34 C55,44 65,51 55,61 C45,71 32,78 20,81 Z" fill="currentColor" />
                {/* Stripe 4 */}
                <path d="M25,84 C31,82 41,74 51,59 C59,49 47,41 60,31 C70,23 90,19 110,14 C95,19 80,27 70,37 C60,47 70,54 60,64 C50,74 37,81 25,84 Z" fill="currentColor" />
              </svg>
            </div>
          </div>

          {/* 3. Right Block */}
          <div className="text-sm md:text-[15px] font-black tracking-wider uppercase">
            CODE: DAYONE
          </div>

        </div>
      </div>

      {/* ── HERO BANNER SECTION ── */}
      <section className="w-full relative">
        <div className="relative w-full aspect-[21/9] md:aspect-[2.3/1] min-h-[400px] overflow-hidden bg-zinc-950 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/10 z-10" />
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
          
          <div className="relative z-20 mx-auto w-full max-w-[1920px] px-6 md:px-12 lg:px-16 pb-12 md:pb-20 text-white">
            <span className="text-[12px] md:text-sm font-black tracking-widest text-[#f5f5f5] uppercase mb-3 block">
              Just Released
            </span>
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase select-none leading-none mb-6 max-w-4xl drop-shadow-sm">
              WIN ON YOUR TERMS
            </h1>
            <p className="text-sm md:text-base leading-relaxed text-zinc-100 max-w-xl mb-8 font-medium drop-shadow-sm">
              Step into limitlessness with our brand new seasonal collections. Engineered with lightweight, premium fabrics designed for peak movement and performance.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="rounded-full bg-white text-black hover:bg-zinc-200 transition duration-300 py-3 px-8 text-xs font-bold tracking-wider uppercase border border-white"
              >
                Shop Collection
              </Link>
              <Link
                href="/shop?targetGroup=MEN"
                className="rounded-full bg-transparent text-white hover:bg-white/10 transition duration-300 py-3 px-8 text-xs font-bold tracking-wider uppercase border-2 border-white"
              >
                Shop Men&#39;s
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── EXACT NIKE STYLE CATEGORY GRID (3 CORE CARDS) ── */}
      <section id="categories" className="mx-auto max-w-[1920px] px-6 md:px-12 lg:px-16 mt-20 scroll-mt-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-7xl font-black tracking-tight text-black uppercase leading-none select-none" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            BEST IN CLASS
          </h2>
          <p className="text-xs md:text-sm font-semibold text-zinc-900 mt-4 max-w-2xl mx-auto leading-relaxed">
            From class to sport, find back-to-school essentials for day one and beyond.
          </p>
        </div>

        {isCategoriesLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-black" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayCategories.map((cat) => (
              <div 
                key={cat.id} 
                className="group relative flex flex-col justify-end aspect-[4/5] overflow-hidden bg-zinc-950 shadow-sm cursor-pointer"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover select-none cursor-pointer"
                  loading="lazy"
                />

                <div className="absolute bottom-8 left-8 z-20">
                  <Link
                    href={cat.shopUrl}
                    className="inline-block text-white font-semibold text-xl md:text-2xl hover:text-zinc-300 transition duration-300 tracking-wide cursor-pointer"
                  >
                    {cat.name}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── DYNAMIC POPULAR RIGHT NOW PRODUCTS GRID ── */}
      <section className="mx-auto max-w-[1920px] px-6 md:px-12 lg:px-16 mt-28 mb-28">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-black uppercase">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productsList.slice(0, 4).map((product: any) => {
              const discountedPrice =
                product.discount > 0
                  ? product.price * (1 - product.discount / 100)
                  : null;

              return (
                <div 
                  key={product.id}
                  className="w-full group flex flex-col relative cursor-pointer"
                >
                  {/* Image container */}
                  <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden mb-4 border border-zinc-100 cursor-pointer">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover select-none cursor-pointer"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-200 flex items-center justify-center text-zinc-400 text-xs">
                        No Image
                      </div>
                    )}
                    
                    {/* Quick Redirect Cover Link */}
                    <Link href={`/products/${product.slug}`} className="absolute inset-0 z-10 cursor-pointer" aria-label={product.title} />
                  </div>

                  {/* Info */}
                  <div className="flex flex-col">
                    <p className="text-[11px] font-semibold text-gray-400 tracking-wider">
                      {product.category?.name || "Sportswear"}
                    </p>
                    <Link 
                      href={`/products/${product.slug}`}
                      className="text-[15px] font-medium text-black truncate mt-0.5 cursor-pointer"
                    >
                      {product.title}
                    </Link>
                    
                    <div className="flex items-center gap-2 mt-1.5">
                      {discountedPrice ? (
                        <>
                          <span className="text-sm font-bold text-black">
                            ৳{discountedPrice.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            ৳{product.price.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-black">
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
      <section className="w-full aspect-[16/9] md:aspect-[21/9] bg-black relative overflow-hidden select-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center"
        >
          <source src="/videos/running.mp4" type="video/mp4" />
        </video>
        {/* Subtle gradient overlay — heavier at bottom for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent z-10" />
        {/* Left-aligned editorial text overlay */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end px-6 md:px-16 lg:px-24 pb-14 md:pb-20 text-white">
          <span className="text-[10px] md:text-xs font-black tracking-[0.3em] uppercase text-zinc-300 mb-3 block">
            FARHAD365 MOTION
          </span>
          <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none mb-4 max-w-2xl">
            MOVEMENT<br />IS LIFE
          </h2>
          <p className="text-xs md:text-sm text-zinc-300 max-w-sm leading-relaxed mb-7 font-normal">
            Engineered to keep you moving forward. Performance activewear crafted for speed, agility, and recovery.
          </p>
          <div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-white text-black hover:bg-zinc-100 transition duration-300 py-3 px-8 text-xs font-bold tracking-wider uppercase"
            >
              Explore Activewear <span className="text-sm">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── EXACT NIKE STYLE FEATURED CAMPAIGNS GRID ── */}
      <section className="mx-auto max-w-[1920px] px-6 md:px-12 lg:px-16 mt-24">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-black uppercase">
            Featured
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
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
            <div className="mt-5">
              <h3 className="text-[15px] font-medium text-black tracking-tight cursor-pointer">
                Run Free
              </h3>
              <p className="text-xs text-zinc-500 font-semibold leading-relaxed mt-1.5 max-w-[320px]">
                Ultra-responsive road runners engineered to cushion and accelerate every single step.
              </p>
              <Link 
                href="/shop?category=shoes" 
                className="inline-block text-xs font-semibold underline text-black hover:text-zinc-600 mt-3.5 tracking-wide transition cursor-pointer"
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
            <div className="mt-5">
              <h3 className="text-[15px] font-medium text-black tracking-tight cursor-pointer">
                Street Essentials
              </h3>
              <p className="text-xs text-zinc-500 font-semibold leading-relaxed mt-1.5 max-w-[320px]">
                Reimagined everyday basics designed to look completely effortless, anywhere and everywhere.
              </p>
              <Link 
                href="/shop?targetGroup=UNISEX" 
                className="inline-block text-xs font-semibold underline text-black hover:text-zinc-600 mt-3.5 tracking-wide transition cursor-pointer"
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
            <div className="mt-5">
              <h3 className="text-[15px] font-medium text-black tracking-tight cursor-pointer">
                Peak Recovery
              </h3>
              <p className="text-xs text-zinc-500 font-semibold leading-relaxed mt-1.5 max-w-[320px]">
                Sweat-wicking performance clothing built to withstand high-intensity reps and active training.
              </p>
              <Link 
                href="/shop?category=clothing" 
                className="inline-block text-xs font-semibold underline text-black hover:text-zinc-600 mt-3.5 tracking-wide transition cursor-pointer"
              >
                Shop Training
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── SPECIAL AUTOPLAY HERO CAROUSEL SECTION ── */}
      <section className="w-full relative mt-20 select-none">
        <div className="relative w-full aspect-[21/9] md:aspect-[2.3/1] min-h-[450px] md:min-h-[550px] overflow-hidden bg-zinc-950 flex flex-col justify-end">
          
          {/* Slides */}
          {SPECIAL_CAROUSEL_SLIDES.map((slide, index) => {
            const active = index === currentSlide;
            return (
              <div
                key={index}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                  active ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                {/* Background Image */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover object-center select-none"
                />
                
                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-black/25" />

                {/* Redirect whole slide to sports categories */}
                <Link
                  href="/shop?targetGroup=SPORTS"
                  className="absolute inset-0 z-20 cursor-pointer"
                  aria-label={`Shop ${slide.title}`}
                />
                
                {/* Slide content */}
                <div className="relative z-25 mx-auto w-full h-full flex flex-col justify-end pb-16 md:pb-24 text-white px-6 md:px-12 lg:px-16 pointer-events-none">
                  <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase select-none leading-none mb-6 max-w-4xl drop-shadow-sm animate-fade-in" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    {slide.title}
                  </h2>
                  <p className="text-sm md:text-base leading-relaxed text-zinc-100 max-w-xl mb-8 font-medium drop-shadow-sm">
                    {slide.subtitle}
                  </p>
                  <div>
                    <div
                      className="inline-block rounded-full bg-white text-black hover:bg-zinc-200 transition duration-300 py-3 px-8 text-xs font-bold tracking-wider uppercase border border-white"
                    >
                      Shop
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Controls overlay in the bottom right and dots in the bottom center */}
          <div className="absolute bottom-6 left-0 right-0 z-30 flex items-center justify-between px-8 md:px-16 pointer-events-none">
            {/* Center dots indicators */}
            <div className="flex-1 flex justify-center gap-2 pointer-events-auto">
              {SPECIAL_CAROUSEL_SLIDES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentSlide(index);
                    setProgress(0);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    index === currentSlide ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Bottom-right Controls */}
            <div className="flex items-center gap-3 pointer-events-auto">
              {/* Play/Pause Button with Circular Progress Ring */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-11 h-11 relative flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-all cursor-pointer backdrop-blur-sm"
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
                    <Pause className="h-4 w-4 fill-white text-white" />
                  ) : (
                    <Play className="h-4 w-4 fill-white text-white ml-0.5" />
                  )}
                </div>
              </button>

              {/* Prev Button */}
              <button
                onClick={() => {
                  setCurrentSlide(
                    (prev) => (prev - 1 + SPECIAL_CAROUSEL_SLIDES.length) % SPECIAL_CAROUSEL_SLIDES.length
                  );
                  setProgress(0);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 border border-white/20 transition-all cursor-pointer backdrop-blur-sm"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Next Button */}
              <button
                onClick={() => {
                  setCurrentSlide((prev) => (prev + 1) % SPECIAL_CAROUSEL_SLIDES.length);
                  setProgress(0);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 border border-white/20 transition-all cursor-pointer backdrop-blur-sm"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── BACK TO SCHOOL SECTION ── */}
      <section className="mx-auto max-w-[1920px] px-6 md:px-12 lg:px-16 mt-28 mb-28">
        <div className="text-center mb-12 select-none">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-black uppercase leading-none" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            BACK TO SCHOOL
          </h2>
          <p className="text-xs md:text-sm font-semibold text-zinc-600 mt-4 max-w-2xl mx-auto leading-relaxed">
            Mix and match with ease, because every piece plays.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Jordan Kids */}
          <div className="group relative flex flex-col justify-end aspect-[4/5] overflow-hidden bg-zinc-950 cursor-pointer">
            <img
              src="/original.avif"
              alt="Jordan Kids"
              className="absolute inset-0 w-full h-full object-cover select-none cursor-pointer"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent z-10 cursor-pointer" />
            <div className="relative z-20 p-8 flex flex-col items-start justify-end h-full text-white cursor-pointer">
              <p className="text-[17px] font-bold leading-snug mb-4 max-w-[260px] cursor-pointer">
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
          <div className="group relative flex flex-col justify-end aspect-[4/5] overflow-hidden bg-zinc-950 cursor-pointer">
            <img
              src="/original (1).avif"
              alt="Bags & Backpacks"
              className="absolute inset-0 w-full h-full object-cover select-none cursor-pointer"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent z-10 cursor-pointer" />
            <div className="relative z-20 p-8 flex flex-col items-start justify-end h-full text-white cursor-pointer">
              <p className="text-[17px] font-bold leading-snug mb-4 max-w-[260px] cursor-pointer">
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
          <div className="group relative flex flex-col justify-end aspect-[4/5] overflow-hidden bg-zinc-950 cursor-pointer">
            <img
              src="/original (2).avif"
              alt="Nike Kids"
              className="absolute inset-0 w-full h-full object-cover select-none cursor-pointer"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent z-10 cursor-pointer" />
            <div className="relative z-20 p-8 flex flex-col items-start justify-end h-full text-white cursor-pointer">
              <p className="text-[17px] font-bold leading-snug mb-4 max-w-[260px] cursor-pointer">
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

      {/* ── DYNAMIC NIKE "TRENDING" SILHOUETTE GRID (NO BACKGROUND / TRANSPARENT) ── */}
      <section className="mx-auto max-w-[1920px] px-6 md:px-12 lg:px-16 mt-28 mb-28 select-none">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-7xl font-black tracking-tight text-black uppercase leading-none select-none" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            TRENDING
          </h2>
        </div>

        {/* 2 Rows of 8 items on desktop, wraps cleanly on tablet/mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-x-6 gap-y-12 mt-12">
          {displayTrending.slice(0, 16).map((item: any, index: number) => (
            <Link 
              key={index} 
              href={item.link} 
              className="flex flex-col items-center group text-center cursor-pointer"
            >
              {/* Image box - bg-transparent, no borders, no padding except standard spacing */}
              <div className="w-full aspect-[4/3] bg-transparent flex items-center justify-center overflow-hidden cursor-pointer">
                <img
                  src={item.image || ""}
                  alt={item.name}
                  className="max-h-[75px] max-w-[110px] object-contain select-none mix-blend-multiply cursor-pointer"
                  loading="lazy"
                />
              </div>
              {/* Label */}
              <span className="text-[15px] font-medium text-black mt-3 transition truncate max-w-full cursor-pointer">
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
              Farhad365 is your all-in-one lifestyle destination. We bring together the very best in fashion clothing, luxury perfumes, premium watches and the latest sportswear — so you never have to shop anywhere else. Whether you're refreshing your wardrobe with the latest seasonal styles, finding a signature scent, investing in a timepiece that turns heads, or gearing up for your next workout, Farhad365 has you covered for every occasion and every mood.
            </p>
            <p>
              Explore our clothing collection featuring everyday essentials and statement pieces for Men, Women and Kids. Discover a curated selection of perfumes and fragrances from around the world — from fresh and light to bold and intense. Browse our watch collection for elegant dress watches, smart sports watches and everything in between. And now, step into our expanding sports range with performance sneakers, activewear and accessories designed for training, running and beyond. One brand. Every lifestyle. Farhad365.
            </p>
          </div>
          {/* Farhad365 brand icon — 3 slanted stripes */}
          <svg className="h-8 w-12 text-white fill-current mx-auto mt-8" viewBox="0 0 24 24">
            <rect x="4" y="4" width="3.5" height="16" transform="skewX(-28)" />
            <rect x="11" y="4" width="3.5" height="16" transform="skewX(-28)" />
            <rect x="18" y="4" width="3.5" height="16" transform="skewX(-28)" />
          </svg>
        </div>
      </section>

      

    </div>
  );
}