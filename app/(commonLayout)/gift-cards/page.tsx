"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import { usePurchaseGiftCardMutation } from "@/redux/api/giftcard/giftcardApi";

export default function GiftCardsPage() {
  const [selectedAmount, setSelectedAmount] = useState<number>(2000);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");

  const { user } = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const [purchaseGiftCard, { isLoading }] = usePurchaseGiftCardMutation();

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to purchase a Gift Card.");
      router.push(`/login?redirect=/gift-cards`);
      return;
    }
    if (!recipientEmail || !senderName) {
      toast.error("Please fill in the required fields.");
      return;
    }
    try {
      const response = await purchaseGiftCard({
        amount: selectedAmount,
        recipientEmail,
        senderName,
        message,
      }).unwrap();

      if (response.status === "success" && response.paymentUrl) {
        toast.success("Redirecting to bKash for payment...");
        window.location.href = response.paymentUrl;
      } else {
        toast.error("Failed to initiate payment gateway.");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "An error occurred while purchasing the gift card.");
    }
  };

  const amounts = [1000, 2000, 5000, 10000];

  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased select-none pb-24">
      {/* Header Banner */}
      <div className="relative bg-zinc-950 text-white py-16 md:py-24 overflow-hidden border-b border-zinc-900">
        <div className="absolute top-0 right-0 w-80 h-80 bg-zinc-800 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-16 relative z-10 flex flex-col items-center text-center">
          <p className="text-xs font-black uppercase tracking-widest text-[#507c68] mb-2">Give the Best Gift</p>
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
            PRISTTO E-GIFT CARDS
          </h1>
          <p className="text-base text-zinc-400 mt-2 max-w-xl font-medium">
            Send instant style credit directly to friends and family.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-4xl mx-auto px-6 mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Left Card Visual */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-full aspect-[16/10] bg-zinc-950 text-white border border-zinc-800 p-8 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-lg">
            <div className="absolute top-0 right-0 w-48 h-48 bg-zinc-800 rounded-full blur-3xl opacity-35 -mr-12 -mt-12"></div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#507c68]">Pristto E-Gift Card</span>
              <p className="text-lg font-bold mt-1">GIFT OF STYLE</p>
            </div>
            <div className="flex justify-between items-end relative z-10">
              <span className="text-2xl md:text-3xl font-black tracking-tight">৳{selectedAmount.toLocaleString()}</span>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Valid Online & In Store</span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 mt-4 text-center">
            * Pristto E-Gift Cards are delivered instantly to the recipient's inbox and never expire.
          </p>
        </div>

        {/* Right Form */}
        <div>
          <form onSubmit={handlePurchase} className="space-y-6">
            
            {/* Amount selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-zinc-500">Select Amount (BDT) *</label>
              <div className="grid grid-cols-4 gap-2">
                {amounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setSelectedAmount(amount)}
                    className={`py-3 rounded border text-xs font-bold transition cursor-pointer ${
                      selectedAmount === amount
                        ? "bg-black text-white border-black"
                        : "bg-white text-zinc-500 border-zinc-300 hover:border-black"
                    }`}
                  >
                    ৳{amount.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Email */}
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-500 mb-1.5">Recipient Email *</label>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="friend@email.com"
                className="w-full border border-zinc-400 p-4 text-sm focus:outline-none focus:border-black placeholder-zinc-300"
              />
            </div>

            {/* Sender Name */}
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-500 mb-1.5">Your Name *</label>
              <input
                type="text"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Sender Name"
                className="w-full border border-zinc-400 p-4 text-sm focus:outline-none focus:border-black placeholder-zinc-300"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-500 mb-1.5">Optional Message</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personalized note..."
                className="w-full border border-zinc-400 p-4 text-sm focus:outline-none focus:border-black placeholder-zinc-300 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black hover:bg-zinc-800 text-white font-bold py-4 text-xs uppercase tracking-wider rounded-full transition cursor-pointer disabled:bg-zinc-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Redirecting..." : "Purchase with bKash"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
