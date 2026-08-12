export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased select-none pb-24">
      {/* Header Banner */}
      <div className="relative bg-zinc-950 text-white py-16 md:py-24 overflow-hidden border-b border-zinc-900">
        <div className="absolute top-0 right-0 w-80 h-80 bg-zinc-800 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-16 relative z-10 flex flex-col items-center text-center">
          <p className="text-xs font-black uppercase tracking-widest text-[#507c68] mb-2">Service & Logistics</p>
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
            SHIPPING POLICY
          </h1>
          <p className="text-base text-zinc-400 mt-2 max-w-xl font-medium">
            Delivery timelines, shipping methods, and rates across Bangladesh.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 mt-12 md:mt-16 space-y-10">
        
        {/* Shipping rates table */}
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-black uppercase text-black">Delivery Rates & Speed</h2>
          <p className="text-zinc-600 font-medium text-sm md:text-base">
            We partner with premier domestic logistics networks to dispatch your packages securely.
          </p>
          
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mt-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <th className="py-4 px-6">Region</th>
                  <th className="py-4 px-6">Methods</th>
                  <th className="py-4 px-6">Timeline</th>
                  <th className="py-4 px-6 text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium text-zinc-700">
                <tr>
                  <td className="py-4 px-6 font-bold text-black">Inside Dhaka</td>
                  <td className="py-4 px-6">Home Delivery</td>
                  <td className="py-4 px-6">1 - 2 Days</td>
                  <td className="py-4 px-6 text-right font-bold text-black">৳60</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-bold text-black">Inside Dhaka (Express)</td>
                  <td className="py-4 px-6">Same-Day Courier</td>
                  <td className="py-4 px-6">Within 24 Hours</td>
                  <td className="py-4 px-6 text-right font-bold text-black">৳150</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-bold text-black">Outside Dhaka</td>
                  <td className="py-4 px-6">Home Delivery</td>
                  <td className="py-4 px-6">3 - 5 Days</td>
                  <td className="py-4 px-6 text-right font-bold text-black">৳120</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Dispatch Parameters */}
        <div className="space-y-4 border-t border-zinc-100 pt-8 font-medium text-zinc-600 text-sm md:text-base leading-relaxed">
          <h2 className="text-lg md:text-xl font-black uppercase text-black">Dispatch Guidelines</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Orders received before 12:00 PM are processed and handed over to logistics partners on the same business day.</li>
            <li>Tracking links will be triggered via SMS/Email notifications immediately after dispatch.</li>
            <li>If you are not available to receive your order during home delivery, the carrier will make up to 3 delivery attempts before returning the package to our warehouse.</li>
            <li>For any immediate shipping address updates after checkout, please mail us at <span className="font-bold text-black">support@pristto.com</span> with your Order ID.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
