"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronUp, Mail, MapPin, Phone } from "lucide-react";
import { useGetAllSettingsQuery } from "@/redux/api/setting/settingApi";

interface FAQItem {
  question: string;
  answer: string;
  category: "orders" | "payments" | "returns" | "products";
}

const FAQS: FAQItem[] = [
  {
    category: "orders",
    question: "How do I track my order?",
    answer: "You can track your order status directly by logging into your account, navigating to the Profile page, and clicking the 'Order Tracker' tab. Input your Order ID to view real-time shipping progress.",
  },
  {
    category: "orders",
    question: "How long does shipping take?",
    answer: "Deliveries inside Dhaka take 1 - 2 business days. Outside Dhaka deliveries take 3 - 5 business days. Express same-day delivery is available for orders placed inside Dhaka before 12:00 PM.",
  },
  {
    category: "payments",
    question: "What payment methods do you accept?",
    answer: "We support Cash on Delivery (COD) across all areas of Bangladesh, as well as digital payments via bKash, SSLCommerz, and credit/debit cards.",
  },
  {
    category: "payments",
    question: "Is digital payment secure on Pristto?",
    answer: "Yes, we do not store your card details. All transactions are routed through secured PCI-DSS compliant banking channels with SSL encryption protocols.",
  },
  {
    category: "returns",
    question: "What is your return policy?",
    answer: "We offer a 7-day hassle-free return and exchange policy. Items must be unworn, in their original packaging, with all labels and barcodes intact.",
  },
  {
    category: "returns",
    question: "How do I request a refund?",
    answer: "Email us at support@pristto.com with your Order ID and items to return. Once inspected at our center, refunds are issued via bKash/Bank Transfer within 5 - 7 business days.",
  },
  {
    category: "products",
    question: "How do I select the right size?",
    answer: "Please refer to our Size Chart page linked in the footer. We have detailed charts for footwear, tops, and pants for Men, Women, and Kids.",
  },
  {
    category: "products",
    question: "Will out-of-stock products be restocked?",
    answer: "Most of our signature items are restocked within 2 - 3 weeks. You can check back regularly or subscribe to our newsletter for restock notifications.",
  },
];

export default function HelpPage() {
  const { data: settingsResponse } = useGetAllSettingsQuery();
  const settings = settingsResponse?.data?.map || {};
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFAQs = FAQS.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased select-none pb-24">
      {/* Header Banner */}
      <div className="relative bg-zinc-950 text-white py-16 md:py-24 overflow-hidden border-b border-zinc-900">
        <div className="absolute top-0 right-0 w-80 h-80 bg-zinc-800 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-16 relative z-10 flex flex-col items-center text-center">
          <p className="text-xs font-black uppercase tracking-widest text-[#507c68] mb-2">Customer Care</p>
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
            SUPPORT CENTER & FAQ
          </h1>
          
          {/* Search bar inside hero */}
          <div className="relative w-full max-w-md mt-6">
            <input
              type="text"
              placeholder="Search help topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white text-black pl-12 pr-4 py-3 rounded-full text-sm border-none focus:outline-none focus:ring-2 focus:ring-[#507c68]"
            />
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-4xl mx-auto px-6 mt-10 md:mt-14">
        
        {/* Category Toggles */}
        <div className="flex flex-wrap gap-2 justify-center border-b border-zinc-100 pb-6 mb-8">
          {["all", "orders", "payments", "returns", "products"].map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
              className={`px-5 py-2.5 rounded-full text-xs font-bold border uppercase tracking-wider transition cursor-pointer ${
                activeCategory === cat
                  ? "bg-black text-white border-black"
                  : "bg-white text-zinc-500 border-zinc-300 hover:border-black hover:text-black"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQs List */}
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <p className="text-center text-gray-400 py-10 font-bold">No FAQ topics match your criteria.</p>
          ) : (
            filteredFAQs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className="border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50/50">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between p-5 text-left font-black text-sm uppercase tracking-tight text-black hover:bg-zinc-50 transition cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 shrink-0 text-zinc-500" /> : <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" />}
                  </button>
                  {isOpen && (
                    <div className="p-5 border-t border-zinc-200 bg-white text-zinc-600 font-medium text-sm leading-relaxed">
                      {faq.answer.replace("support@pristto.com", settings.support_email || "support@pristto.com")}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Contact direct details */}
        <div className="mt-16 border-t border-zinc-200 pt-10 text-center space-y-6">
          <h2 className="text-lg md:text-xl font-black uppercase text-black">Still need support?</h2>
          <p className="text-zinc-500 font-medium text-sm max-w-md mx-auto">
            If you could not find the answers to your questions, please contact our support team.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <div className="flex items-center gap-3 p-4 border border-zinc-200 bg-white rounded-xl">
              <Mail className="h-5 w-5 text-[#507c68] shrink-0" />
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase">Write Email</span>
                <span className="text-sm font-bold text-black select-text">{settings.support_email || "support@pristto.com"}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border border-zinc-200 bg-white rounded-xl">
              <Phone className="h-5 w-5 text-[#507c68] shrink-0" />
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase">Call Support</span>
                <span className="text-sm font-bold text-black select-text">{settings.support_phone || "+880 1700-000000"}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border border-zinc-200 bg-white rounded-xl">
              <MapPin className="h-5 w-5 text-[#507c68] shrink-0" />
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase">Our Head Office</span>
                <span className="text-sm font-bold text-black select-text">{settings.support_address || "Rampura Banasree, Dhaka-1219"}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
