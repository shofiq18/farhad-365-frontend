export default function CareersPage() {
  const OpenRoles = [
    { title: "Sourcing & Logistics Executive", dept: "Operations", location: "Dhaka Office" },
    { title: "Brand & Content Strategist", dept: "Marketing", location: "Dhaka Office" },
    { title: "Senior React Native / Mobile Developer", dept: "Technology", location: "Dhaka (Hybrid)" }
  ];

  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased select-none pb-24">
      {/* Header Banner */}
      <div className="relative bg-zinc-950 text-white py-16 md:py-24 overflow-hidden border-b border-zinc-900">
        <div className="absolute top-0 right-0 w-80 h-80 bg-zinc-800 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-16 relative z-10 flex flex-col items-center text-center">
          <p className="text-xs font-black uppercase tracking-widest text-[#507c68] mb-2">Join Our Team</p>
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
            CAREERS AT PRISTTO
          </h1>
          <p className="text-base text-zinc-400 mt-2 max-w-xl font-medium">
            Building the future of activewear and premium lifestyle e-commerce.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 mt-12 md:mt-16 space-y-12">
        <div className="space-y-6">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-black">Our Culture</h2>
          <p className="text-zinc-600 font-medium text-sm md:text-base leading-relaxed">
            At Pristto, we value speed, detail, design integrity, and collaboration. We are a fast-moving, technology-driven fashion platform that constantly challenges the boundaries of traditional e-commerce in Bangladesh. We build together, learn continuously, and maintain high standards in everything we ship.
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-6 border-t border-zinc-100 pt-8">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-black">Employee Benefits</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-medium">
            <div className="p-5 bg-zinc-50 border border-zinc-100 space-y-1">
              <h4 className="font-bold text-sm text-black uppercase">Competitive Pay</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">Two festival bonuses, yearly increments, and performance-based allowances.</p>
            </div>
            <div className="p-5 bg-zinc-50 border border-zinc-100 space-y-1">
              <h4 className="font-bold text-sm text-black uppercase">Work Environment</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">Modern hybrid schedules, state-of-the-art developer setups, and free daily office meals.</p>
            </div>
            <div className="p-5 bg-zinc-50 border border-zinc-100 space-y-1">
              <h4 className="font-bold text-sm text-black uppercase">Pristto Merch</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">A yearly employee stipend to purchase our flagship sneakers and activewear outfits.</p>
            </div>
          </div>
        </div>

        {/* Mock jobs */}
        <div className="space-y-6 border-t border-zinc-100 pt-8">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-black">Current Openings</h2>
          <div className="space-y-4">
            {OpenRoles.map((role, idx) => (
              <div key={idx} className="flex justify-between items-center p-6 border border-zinc-200 hover:border-black transition bg-white rounded-xl">
                <div>
                  <h3 className="font-black text-sm md:text-base text-black uppercase">{role.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1 font-bold uppercase tracking-wider">
                    {role.dept} • {role.location}
                  </p>
                </div>
                <a
                  href="mailto:careers@pristto.com?subject=Application for Job"
                  className="text-xs font-black uppercase tracking-wider border border-black px-4 py-2 hover:bg-black hover:text-white transition"
                >
                  Apply
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
