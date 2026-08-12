export default function StoriesPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased select-none pb-24">
      
      {/* Editorial Header */}
      <div className="relative bg-zinc-950 text-white py-24 md:py-36 border-b border-zinc-900 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-zinc-800 rounded-full blur-3xl opacity-20 -mr-24 -mt-24"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-zinc-700 rounded-full blur-3xl opacity-10 -ml-24 -mb-24"></div>

        <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-16 relative z-10 flex flex-col items-center text-center">
          <p className="text-xs md:text-sm font-black uppercase tracking-widest text-[#507c68] mb-4">Pristto Stories</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-none max-w-4xl" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            DESIGNED FOR MOTION. <br/>CRAFTED FOR LIFE.
          </h1>
          <p className="text-sm md:text-lg text-zinc-400 mt-6 max-w-xl font-medium leading-relaxed">
            Unveiling the heart, the heritage, and the dedicated craftsmanship that goes into every single fiber we weave.
          </p>
        </div>
      </div>

      {/* Main Sections */}
      <div className="max-w-5xl mx-auto px-6 mt-16 md:mt-24 space-y-24 md:space-y-36">
        
        {/* Section 1: The Genesis */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-6 space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Chapter 01</span>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">The Genesis</h2>
            <p className="text-zinc-600 text-sm md:text-base leading-relaxed font-medium">
              Pristto was born out of a desire to create something timeless. Founded in Dhaka, Bangladesh, our journey started with a simple question: why should comfort and elite style be mutually exclusive? We set out to design products that don't just fit, but enhance the way you move, work, and express yourself.
            </p>
          </div>
          <div className="md:col-span-6 border border-zinc-200 overflow-hidden bg-zinc-50 aspect-video relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-zinc-100 to-white flex items-center justify-center font-black uppercase tracking-widest text-zinc-300 text-sm">
               Dhaka Workspace
            </div>
          </div>
        </section>

        {/* Section 2: Craftsmanship */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center md:flex-row-reverse">
          <div className="md:col-span-6 md:order-2 space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Chapter 02</span>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Craftsmanship Over Everything</h2>
            <p className="text-zinc-600 text-sm md:text-base leading-relaxed font-medium">
              Every curve, stitching pattern, and fabric choice is strictly curated. We collaborate with master artisans and state-of-the-art mills to source materials that endure. Our garments are tested for resilience, breathability, and feel, ensuring you wear not just an item, but a product of precision.
            </p>
          </div>
          <div className="md:col-span-6 md:order-1 border border-zinc-200 overflow-hidden bg-zinc-50 aspect-video relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-zinc-100 to-white flex items-center justify-center font-black uppercase tracking-widest text-zinc-300 text-sm">
              Artisan Workshop
            </div>
          </div>
        </section>

        {/* Section 3: The Green Standard */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-6 space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Chapter 03</span>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">The Green Standard</h2>
            <p className="text-zinc-600 text-sm md:text-base leading-relaxed font-medium">
              At Pristto, we believe in styling for the future. We are continuously upgrading our supply chains to include recycled organic cottons, low-impact dyes, and sustainable packaging. We strive to reduce waste and implement carbon-neutral logistics, because protecting our environment is the ultimate style statement.
            </p>
          </div>
          <div className="md:col-span-6 border border-zinc-200 overflow-hidden bg-zinc-50 aspect-video relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-zinc-100 to-white flex items-center justify-center font-black uppercase tracking-widest text-zinc-300 text-sm">
              Eco-Conscious Packaging
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
