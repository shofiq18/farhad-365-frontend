import { MapPin, Clock, Phone } from "lucide-react";

export default function StoreLocatorPage() {
  const Stores = [
    {
      name: "Banasree Flagship Store",
      address: "Rampura Banasree, Dhaka-1219",
      hours: "10:00 AM - 10:00 PM (Daily)",
      phone: "+880 1712-345678",
      features: ["All Collections Available", "Click & Collect Pickup", "Product Exchanges"]
    },
    {
      name: "Jamuna Future Park Branch",
      address: "Shop 4A-012, Level 4, Jamuna Future Park, Kuril, Dhaka",
      hours: "11:00 AM - 09:00 PM (Closed Wednesday)",
      phone: "+880 1812-345678",
      features: ["Footwear Specialization", "Click & Collect Pickup"]
    }
  ];

  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased select-none pb-24">
      {/* Header Banner */}
      <div className="relative bg-zinc-950 text-white py-16 md:py-24 overflow-hidden border-b border-zinc-900">
        <div className="absolute top-0 right-0 w-80 h-80 bg-zinc-800 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-16 relative z-10 flex flex-col items-center text-center">
          <p className="text-xs font-black uppercase tracking-widest text-[#507c68] mb-2">Retail Network</p>
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
            PRISTTO STORE LOCATOR
          </h1>
          <p className="text-base text-zinc-400 mt-2 max-w-xl font-medium">
            Find the closest Pristto physical branch near you to try on footwear and gear.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 mt-12 md:mt-16 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Stores.map((store, idx) => (
            <div key={idx} className="border border-zinc-200 p-6 md:p-8 bg-zinc-50/50 rounded-2xl flex flex-col space-y-6">
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-black">{store.name}</h2>
                <div className="mt-4 space-y-3 font-medium text-zinc-600 text-sm">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 text-[#507c68] shrink-0 mt-0.5" />
                    <span>{store.address}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Clock className="h-4 w-4 text-[#507c68] shrink-0 mt-0.5" />
                    <span>{store.hours}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Phone className="h-4 w-4 text-[#507c68] shrink-0 mt-0.5" />
                    <span>{store.phone}</span>
                  </div>
                </div>
              </div>

              {/* Special features */}
              <div className="border-t border-zinc-200 pt-4 flex-1">
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Available Services</span>
                <div className="flex flex-wrap gap-1.5">
                  {store.features.map((f, i) => (
                    <span key={i} className="inline-block bg-white border border-zinc-200 text-zinc-600 px-3 py-1 rounded text-xs font-bold">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
