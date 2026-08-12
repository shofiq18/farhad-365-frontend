export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased select-none pb-24">
      {/* Header Banner */}
      <div className="relative bg-zinc-950 text-white py-16 md:py-24 overflow-hidden border-b border-zinc-900">
        <div className="absolute top-0 right-0 w-80 h-80 bg-zinc-800 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-16 relative z-10 flex flex-col items-center text-center">
          <p className="text-xs font-black uppercase tracking-widest text-[#507c68] mb-2">Service & Protection</p>
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
            RETURNS & EXCHANGES
          </h1>
          <p className="text-base text-zinc-400 mt-2 max-w-xl font-medium">
            Hassle-free 7-day return policy for all unworn apparel and footwear.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 mt-12 md:mt-16 space-y-10 font-medium text-zinc-600 text-sm md:text-base leading-relaxed">
        
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-black uppercase text-black">Return Eligibility</h2>
          <p>
            We want you to love your purchase. If you are not fully satisfied, you can initiate a return or exchange request within <span className="font-bold text-black">7 days</span> of receiving your order.
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4">
            <li>Products must be completely unworn, unwashed, and in their original packaging.</li>
            <li>All tags, barcodes, product manuals, and box details must remain fully intact.</li>
            <li>Innerwear, socks, and items marked as "Final Sale" are not eligible for returns due to hygiene guidelines.</li>
            <li>A proof of purchase (digital invoice or order email) is required to process any claims.</li>
          </ul>
        </div>

        <div className="space-y-4 border-t border-zinc-100 pt-8">
          <h2 className="text-lg md:text-xl font-black uppercase text-black">How to Return or Exchange</h2>
          <ol className="list-decimal pl-5 space-y-3">
            <li>
              <span className="font-bold text-black">Request Initiation</span>: Email us at <span className="font-bold text-black">support@pristto.com</span> with your Order ID, product details, and reasons for return (attach images if returning a damaged item).
            </li>
            <li>
              <span className="font-bold text-black">Package Collection</span>: Once approved, we will schedule a return pickup from your delivery address (charge may apply depending on reason) or you can drop it off at our head branch at <span className="font-bold text-black">Rampura Banasree, Dhaka-1219</span>.
            </li>
            <li>
              <span className="font-bold text-black">Refund Processing</span>: After our team inspects the returned item at the warehouse, we will issue a credit voucher or refund your payment via bKash/Bank Transfer within <span className="font-bold text-black">5 - 7 business days</span>.
            </li>
          </ol>
        </div>

      </div>
    </div>
  );
}
