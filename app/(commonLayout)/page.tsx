import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Truck, ShieldCheck, HeartHandshake, Award } from "lucide-react";

export default function Home() {
  const categories = [
    { name: "Men's Collection", desc: "Engineered for maximum movement and performance.", link: "/products?target=MEN" },
    { name: "Women's Collection", desc: "Designed for support, style, and everyday comfort.", link: "/products?target=WOMEN" },
    { name: "Kids Wear", desc: "Lightweight and durable styles for non-stop action.", link: "/products?target=KIDS" },
    { name: "Unisex Streetwear", desc: "Iconic silhouettes built for everyone, everywhere.", link: "/products?target=UNISEX" }
  ];

  return (
    <div className="bg-white text-black pb-24 font-sans antialiased">
      
      {/* Nike Thin Header Promo Bar - Full Width bg */}
      <div className="bg-[#f5f5f5] py-2.5 text-center text-xs font-semibold text-black border-b border-gray-200 w-full">
        <div className="mx-auto max-w-[1920px] px-6 md:px-12 lg:px-16">
          <p>
            Free Shipping & Returns <span className="font-normal">| Join Us To Get Free Shipping & 30-Day Returns.</span>{" "}
            <Link href="/sign-up" className="underline font-bold hover:text-gray-600 ml-1">Learn More</Link>
          </p>
        </div>
      </div>

      {/* Nike Full-Width Hero Section (Edge-to-Edge Image/Banner) */}
      <section className="w-full">
        
        {/* Large Hero Image - Edge to edge */}
        <div className="relative w-full aspect-[21/9] md:aspect-[2.3/1] overflow-hidden bg-zinc-100">
          <Image
            src="/nike_hero_athletic.png"
            alt="Nike Athletic Wear Collection Banner"
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Hero Title & Description block - 1920 centered */}
        <div className="mx-auto max-w-[1920px] px-6 md:px-12 lg:px-16 text-center mt-8 flex flex-col items-center">
          <span className="text-[12px] font-bold tracking-widest text-[#111111] uppercase mb-2">
            Just In
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-[#111111] uppercase select-none leading-none mb-4">
            MOVE. STYLE. ELEVATE.
          </h1>
          <p className="text-[14px] md:text-[15px] leading-relaxed text-[#757575] font-semibold max-w-2xl mb-8">
            Experience the peak of performance and comfort. Explore our new season gear and activewear engineered for limitlessness and everyday versatility.
          </p>
          <div className="flex gap-3">
            <Link
              href="/products"
              className="rounded-full bg-black text-white hover:bg-zinc-800 transition-colors py-3 px-8 text-xs font-bold tracking-wider uppercase border border-black"
            >
              Shop Collection
            </Link>
          </div>
        </div>

      </section>

      {/* Nike "Trending" Split Section - 1920 width with padding */}
      <section className="mx-auto max-w-[1920px] px-6 md:px-12 lg:px-16 mt-16">
        <h2 className="text-2xl font-bold tracking-tight text-black mb-6 left-aligned uppercase">
          Trending
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Men's Trend Column */}
          <div className="group relative flex flex-col justify-end min-h-[400px] md:min-h-[550px] overflow-hidden">
            <Image
              src="/nike_men_trend.png"
              alt="Men's Running Apparel Collection"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-103"
            />
            {/* Absolute redirect overlay */}
            <Link href="/products?target=MEN" className="absolute inset-0 z-10" />
            
            {/* Bottom Left Card Description Overlay */}
            <div className="absolute bottom-10 left-10 z-20 text-white space-y-3">
              <span className="text-[11px] font-extrabold tracking-widest uppercase">Performance Gear</span>
              <h3 className="text-2xl font-black uppercase tracking-tight">Men&#39;s Track & Field</h3>
              <Link 
                href="/products?target=MEN" 
                className="inline-block bg-white text-black hover:opacity-80 py-2.5 px-6 rounded-full text-xs font-bold tracking-wider uppercase"
              >
                Shop Now
              </Link>
            </div>
          </div>

          {/* Women's Trend Column */}
          <div className="group relative flex flex-col justify-end min-h-[400px] md:min-h-[550px] overflow-hidden">
            <Image
              src="/nike_women_trend.png"
              alt="Women's Workout Activewear Gear"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-103"
            />
            {/* Absolute redirect overlay */}
            <Link href="/products?target=WOMEN" className="absolute inset-0 z-10" />

            {/* Bottom Left Card Description Overlay */}
            <div className="absolute bottom-10 left-10 z-20 text-white space-y-3">
              <span className="text-[11px] font-extrabold tracking-widest uppercase">New Release</span>
              <h3 className="text-2xl font-black uppercase tracking-tight">Women&#39;s Active Training</h3>
              <Link 
                href="/products?target=WOMEN" 
                className="inline-block bg-white text-black hover:opacity-80 py-2.5 px-6 rounded-full text-xs font-bold tracking-wider uppercase"
              >
                Shop Now
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Category Pills & Quick Section - 1920 width with padding */}
      <section id="categories" className="mx-auto max-w-[1920px] px-6 md:px-12 lg:px-16 mt-20 scroll-mt-16">
        
        {/* Pills Selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          <Link 
            href="/products?target=MEN" 
            className="border border-black bg-white hover:bg-black hover:text-white text-[12px] font-bold tracking-wider py-3 px-10 rounded-full transition duration-300 cursor-pointer min-w-[120px] text-center"
          >
            Men
          </Link>
          <Link 
            href="/products?target=WOMEN" 
            className="border border-black bg-white hover:bg-black hover:text-white text-[12px] font-bold tracking-wider py-3 px-10 rounded-full transition duration-300 cursor-pointer min-w-[120px] text-center"
          >
            Women
          </Link>
          <Link 
            href="/products?target=KIDS" 
            className="border border-black bg-white hover:bg-black hover:text-white text-[12px] font-bold tracking-wider py-3 px-10 rounded-full transition duration-300 cursor-pointer min-w-[120px] text-center"
          >
            Kids
          </Link>
        </div>

        {/* Categories Grid (Clean Monochrome Cards) */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between p-8 rounded-none border border-black bg-white transition duration-300 hover:shadow-lg group"
            >
              <div>
                <h3 className="text-lg font-bold text-black mb-3">{cat.name}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-8">{cat.desc}</p>
              </div>
              <Link
                href={cat.link}
                className="inline-flex items-center gap-2 text-[12px] font-bold text-black hover:opacity-75 transition-opacity"
              >
                Shop Now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 duration-200" />
              </Link>
            </div>
          ))}
        </div>

      </section>

      {/* Nike Vibe Value Props - 1920 width with padding */}
      <section className="bg-zinc-50 border-y border-zinc-100 py-20 mt-20">
        <div className="mx-auto max-w-[1920px] px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Feature 1 */}
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none bg-black text-white">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-black">Fast Shipping</h3>
                <p className="mt-2 text-xs text-gray-500 leading-relaxed">Quick and trackable delivery directly to your door.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none bg-black text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-black">Secure Checkout</h3>
                <p className="mt-2 text-xs text-gray-500 leading-relaxed">Your data is secured using advanced encryption standard.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none bg-black text-white">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-black">Expert Support</h3>
                <p className="mt-2 text-xs text-gray-500 leading-relaxed">Our support crew is active 24/7 to solve queries.</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none bg-black text-white">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-black">Premium Quality</h3>
                <p className="mt-2 text-xs text-gray-500 leading-relaxed">Selected high-performance materials for durability.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}