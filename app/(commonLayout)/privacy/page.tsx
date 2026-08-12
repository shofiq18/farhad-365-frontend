export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased select-none pb-24">
      {/* Header Banner */}
      <div className="relative bg-zinc-950 text-white py-16 md:py-24 overflow-hidden border-b border-zinc-900">
        <div className="absolute top-0 right-0 w-80 h-80 bg-zinc-800 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-16 relative z-10 flex flex-col items-center text-center">
          <p className="text-xs font-black uppercase tracking-widest text-[#507c68] mb-2">Legal Documents</p>
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
            PRIVACY POLICY
          </h1>
          <p className="text-base text-zinc-400 mt-2 max-w-xl font-medium">
            Last Updated: August 12, 2026. How we protect and manage your personal data.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 mt-12 md:mt-16 space-y-8 font-medium text-zinc-600 text-sm md:text-base leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-lg md:text-xl font-black uppercase text-black">1. Information We Collect</h2>
          <p>
            When you interact with Pristto—whether by placing an order, registering an account, or subscribing to our newsletters—we collect personal data such as your name, delivery address, phone number, email address, and payment information (when buying products).
          </p>
        </section>

        <section className="space-y-4 border-t border-zinc-100 pt-8">
          <h2 className="text-lg md:text-xl font-black uppercase text-black">2. How We Use Your Data</h2>
          <p>
            We use your collected information strictly to process and ship your orders, manage your user profile, authenticate order tracking inputs, communicate tracking updates, and improve your navigation experience. If you opt-in, we may send you promotion coupons and newsletters.
          </p>
        </section>

        <section className="space-y-4 border-t border-zinc-100 pt-8">
          <h2 className="text-lg md:text-xl font-black uppercase text-black">3. Data Security & Storage</h2>
          <p>
            Pristto takes appropriate technical and operational measures to protect your personal details against unauthorized access, loss, or alteration. All transaction exchanges are secured using standard SSL/TLS encryptions. Your address and purchase history logs are securely stored inside our database servers.
          </p>
        </section>

        <section className="space-y-4 border-t border-zinc-100 pt-8">
          <h2 className="text-lg md:text-xl font-black uppercase text-black">4. Sharing Information with Third Parties</h2>
          <p>
            We do NOT sell, rent, or trade your data to third parties. We share basic shipping details (like name, address, and phone number) with our trusted third-party courier services (e.g. Pathao, RedX, Steadfast) to fulfill delivery tasks.
          </p>
        </section>

        <section className="space-y-4 border-t border-zinc-100 pt-8">
          <h2 className="text-lg md:text-xl font-black uppercase text-black">5. Contact Information</h2>
          <p>
            For any queries regarding this Privacy Policy, your account termination requests, or requesting deletion of your personal records, please reach out to us:
          </p>
          <div className="bg-zinc-50 border border-zinc-100 p-6 space-y-1 font-bold text-black text-xs uppercase tracking-wider">
            <p>Pristto Inc. Data Control</p>
            <p>Email: support@pristto.com</p>
            <p>Address: Rampura Banasree, Dhaka-1219</p>
          </div>
        </section>
      </div>
    </div>
  );
}
