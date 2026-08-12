export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased select-none pb-24">
      {/* Header Banner */}
      <div className="relative bg-zinc-950 text-white py-16 md:py-24 overflow-hidden border-b border-zinc-900">
        <div className="absolute top-0 right-0 w-80 h-80 bg-zinc-800 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-16 relative z-10 flex flex-col items-center text-center">
          <p className="text-xs font-black uppercase tracking-widest text-[#507c68] mb-2">Legal Documents</p>
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
            TERMS AND CONDITIONS
          </h1>
          <p className="text-base text-zinc-400 mt-2 max-w-xl font-medium">
            Last Updated: August 12, 2026. Standard rules governing the use of the Pristto e-commerce platform.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 mt-12 md:mt-16 space-y-8 font-medium text-zinc-600 text-sm md:text-base leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-lg md:text-xl font-black uppercase text-black">1. Acceptable Use</h2>
          <p>
            By accessing this site, registering a user account, and placing orders at Pristto, you agree to comply with our Terms and Conditions, all local laws inside Bangladesh, and acknowledge that you are responsible for maintaining account details securely.
          </p>
        </section>

        <section className="space-y-4 border-t border-zinc-100 pt-8">
          <h2 className="text-lg md:text-xl font-black uppercase text-black">2. Product Prices & Orders</h2>
          <p>
            Pristto reserves the right to adjust prices, cancel orders, or limit order quantities without notice. In the event of a listing error or incorrect stock count, we will contact you directly to process a refund or adjust shipping details.
          </p>
        </section>

        <section className="space-y-4 border-t border-zinc-100 pt-8">
          <h2 className="text-lg md:text-xl font-black uppercase text-black">3. Delivery & Payments</h2>
          <p>
            We offer Cash on Delivery (COD) and Digital Payments (e.g. bKash). Delivery times are estimates and may vary due to logistics delays, weather, or political events. Shipping rates will be computed at checkout.
          </p>
        </section>

        <section className="space-y-4 border-t border-zinc-100 pt-8">
          <h2 className="text-lg md:text-xl font-black uppercase text-black">4. Intellectual Property</h2>
          <p>
            All content on this site—including text, graphics, brand logos, primary button icons, designs, and database code—is the property of Pristto Inc. and protected by copyrights, trade marks, and IP regulations in Bangladesh and international treaties.
          </p>
        </section>

        <section className="space-y-4 border-t border-zinc-100 pt-8">
          <h2 className="text-lg md:text-xl font-black uppercase text-black">5. Legal Entity & Disputes</h2>
          <p>
            These terms are governed by the laws of Bangladesh. Any claims or disputes arising out of your purchases will be resolved exclusively in courts of Dhaka.
          </p>
          <div className="bg-zinc-50 border border-zinc-100 p-6 space-y-1 font-bold text-black text-xs uppercase tracking-wider">
            <p>Pristto Legal Department</p>
            <p>Email: support@pristto.com</p>
            <p>Address: Rampura Banasree, Dhaka-1219</p>
          </div>
        </section>
      </div>
    </div>
  );
}
