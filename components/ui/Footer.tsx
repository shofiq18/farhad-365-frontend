"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronUp, MapPin } from "lucide-react";

export default function Footer() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    products: false,
    support: false,
    company: false,
    followus: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <footer className="bg-black text-white font-sans antialiased select-none border-t border-zinc-900">
      
      {/* ── ADIDAS STYLE TOP NEWSLETTER / ADICLUB BAR ── */}
      <div className="bg-[#507c68] text-white py-5">
        <div className="mx-auto max-w-[1920px] px-6 md:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-4">
          <h3 className="text-lg md:text-xl font-black uppercase tracking-wider" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            JOIN OUR <span className="font-light">365</span>CLUB & GET 15% OFF
          </h3>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-3 bg-white hover:bg-zinc-100 text-black font-black text-xs py-3.5 px-6 rounded-none border border-white uppercase tracking-wider group transition duration-300"
          >
            Sign Up For Free <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </Link>
        </div>
      </div>

      {/* ── MAIN FOOTER CONTENT ── */}
      <div className="mx-auto max-w-[1920px] px-6 md:px-12 lg:px-16 py-16">
        
        {/* Main Grid: 6 columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-6 pb-12">
          
          {/* Column 1: PRODUCTS */}
          <div className="border-b border-zinc-800 md:border-b-0 pb-4 md:pb-0">
            <h3 className="hidden md:block text-[14px] font-bold text-white uppercase tracking-wider mb-5">
              PRODUCTS
            </h3>
            <button
              onClick={() => toggleSection("products")}
              className="flex md:hidden justify-between items-center w-full text-[13px] font-bold text-white uppercase tracking-wider py-2"
            >
              <span>PRODUCTS</span>
              {openSections.products ? <ChevronUp className="h-4 w-4 text-zinc-100" /> : <ChevronDown className="h-4 w-4 text-zinc-100" />}
            </button>
            
            <ul className={`${openSections.products ? "block" : "hidden"} md:block space-y-3 mt-2 md:mt-0 text-[13px] text-zinc-100 font-medium`}>
              <li><Link href="/shop?targetGroup=MEN" className="hover:text-white hover:underline transition duration-200">Men</Link></li>
              <li><Link href="/shop?targetGroup=WOMEN" className="hover:text-white hover:underline transition duration-200">Women</Link></li>
              <li><Link href="/shop?targetGroup=KIDS" className="hover:text-white hover:underline transition duration-200">Kids</Link></li>
              <li><Link href="/shop?category=accessories" className="hover:text-white hover:underline transition duration-200">Accessories</Link></li>
              <li><Link href="/shop" className="hover:text-white hover:underline transition duration-200">Back to School</Link></li>
              <li><Link href="/shop?maxPrice=500" className="hover:text-white hover:underline transition duration-200  font-semibold">Sale</Link></li>
              <li><Link href="/shop" className="hover:text-white hover:underline transition duration-200">New Arrivals</Link></li>
              <li><Link href="/shop" className="hover:text-white hover:underline transition duration-200">Best Sellers</Link></li>
              <li><Link href="/gift-cards" className="hover:text-white hover:underline transition duration-200">Gift Cards</Link></li>
            </ul>
          </div>

          {/* Column 5: SUPPORT */}
          <div className="border-b border-zinc-800 md:border-b-0 pb-4 md:pb-0">
            <h3 className="hidden md:block text-[14px] font-bold text-white uppercase tracking-wider mb-5">
              SUPPORT
            </h3>
            <button
              onClick={() => toggleSection("support")}
              className="flex md:hidden justify-between items-center w-full text-[13px] font-bold text-white uppercase tracking-wider py-2"
            >
              <span>SUPPORT</span>
              {openSections.support ? <ChevronUp className="h-4 w-4 text-zinc-100" /> : <ChevronDown className="h-4 w-4 text-zinc-100" />}
            </button>
            
            <ul className={`${openSections.support ? "block" : "hidden"} md:block space-y-3 mt-2 md:mt-0 text-[13px] text-zinc-100 font-medium`}>
              <li><Link href="/help" className="hover:text-white hover:underline transition duration-200">Help</Link></li>
              <li><Link href="/returns" className="hover:text-white hover:underline transition duration-200">Returns & Exchanges</Link></li>
              <li><Link href="/shipping" className="hover:text-white hover:underline transition duration-200">Shipping</Link></li>
              <li><Link href="/track-order" className="hover:text-white hover:underline transition duration-200">Order Tracker</Link></li>
              <li><Link href="/store-locator" className="hover:text-white hover:underline transition duration-200">Store Locator</Link></li>
              <li><Link href="/size-charts" className="hover:text-white hover:underline transition duration-200">Size Charts</Link></li>
            </ul>
          </div>

          {/* Column 6: COMPANY INFO */}
          <div className="border-b border-zinc-800 md:border-b-0 pb-4 md:pb-0">
            <h3 className="hidden md:block text-[14px] font-bold text-white uppercase tracking-wider mb-5">
              COMPANY INFO
            </h3>
            <button
              onClick={() => toggleSection("company")}
              className="flex md:hidden justify-between items-center w-full text-[13px] font-bold text-white uppercase tracking-wider py-2"
            >
              <span>COMPANY INFO</span>
              {openSections.company ? <ChevronUp className="h-4 w-4 text-zinc-100" /> : <ChevronDown className="h-4 w-4 text-zinc-100" />}
            </button>
            
            <ul className={`${openSections.company ? "block" : "hidden"} md:block space-y-3 mt-2 md:mt-0 text-[13px] text-zinc-100 font-medium`}>
              <li><Link href="/about" className="hover:text-white hover:underline transition duration-200">About Us</Link></li>
              <li><Link href="/student-discount" className="hover:text-white hover:underline transition duration-200">Student Discount</Link></li>
              <li><Link href="/healthcare-discount" className="hover:text-white hover:underline transition duration-200">Military & Healthcare Discount</Link></li>
              <li><Link href="/stories" className="hover:text-white hover:underline transition duration-200">Farhad365 Stories</Link></li>
              <li><Link href="/blog" className="hover:text-white hover:underline transition duration-200">Blog</Link></li>
              <li><Link href="/careers" className="hover:text-white hover:underline transition duration-200">Careers</Link></li>
            </ul>
          </div>

          {/* Column 5: FOLLOW US */}
          <div className="border-b border-zinc-800 md:border-b-0 pb-4 md:pb-0">
            <h3 className="hidden md:block text-[14px] font-bold text-white uppercase tracking-wider mb-5">
              FOLLOW US
            </h3>
            <button
              onClick={() => toggleSection("followus")}
              className="flex md:hidden justify-between items-center w-full text-[13px] font-bold text-white uppercase tracking-wider py-2"
            >
              <span>FOLLOW US</span>
              {openSections.followus ? <ChevronUp className="h-4 w-4 text-zinc-100" /> : <ChevronDown className="h-4 w-4 text-zinc-100" />}
            </button>
            <ul className={`${openSections.followus ? "block" : "hidden"} md:block space-y-4 mt-2 md:mt-0`}>
              <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[13px] text-zinc-100 hover:text-white transition duration-200" aria-label="Facebook"><svg className="h-5 w-5 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" /></svg><span>Facebook</span></a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[13px] text-zinc-100 hover:text-white transition duration-200" aria-label="Instagram"><svg className="h-5 w-5 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg><span>Instagram</span></a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[13px] text-zinc-100 hover:text-white transition duration-200" aria-label="Twitter/X"><svg className="h-5 w-5 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg><span>Twitter / X</span></a></li>
              <li><a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[13px] text-zinc-100 hover:text-white transition duration-200" aria-label="TikTok"><svg className="h-5 w-5 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.54-4.06-1.4-1.24-.9-2.07-2.22-2.4-3.71-.05 2.19-.02 4.39-.03 6.58 0 1.96-.28 3.96-1.16 5.72-1.25 2.44-3.79 4.13-6.52 4.31-2.92.17-5.94-1.22-7.24-3.86-1.51-2.92-.85-6.84 1.58-9.02 2.1-1.89 5.25-2.23 7.74-1.01v4.11c-1.57-.84-3.64-.67-4.95.53-1.4 1.25-1.53 3.59-.3 5.03 1.13 1.34 3.24 1.63 4.67.65 1.02-.7 1.5-1.92 1.49-3.17-.03-4.99-.01-9.97-.03-14.96z" /></svg><span>TikTok</span></a></li>
              <li><a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[13px] text-zinc-100 hover:text-white transition duration-200" aria-label="YouTube"><svg className="h-5 w-5 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg><span>YouTube</span></a></li>
            </ul>
          </div>

          {/* Column 6: BANGLADESH */}
          <div className="pb-4 md:pb-0 flex md:justify-end">
            <div className="flex item-end gap-2 text-[13px] font-semibold text-zinc-100 hover:text-white transition duration-200 cursor-pointer">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>Bangladesh</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar: localization + privacy links + copyright */}
        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col items-center justify-center text-center text-[12.5px] font-semibold text-zinc-100 space-y-4">
          
          {/* Line 1: Location + Privacy Choices Toggle + Other Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link href="/privacy-choices" className="hover:text-white transition duration-200 inline-flex items-center gap-1.5 font-bold">
              <span>Your Privacy Choices</span>
              <svg className="h-3.5 w-6 align-middle" viewBox="0 0 30 14" fill="none">
                <rect width="30" height="14" rx="7" fill="#2B6CB0"/>
                <circle cx="21" cy="7" r="5" fill="white"/>
                <path d="M7 7.5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </Link>
            <span className="text-zinc-500 text-xl hidden sm:inline">|</span>
            <Link href="/privacy" className="hover:text-white transition duration-200 font-bold">Privacy Policy</Link>
            <span className="text-zinc-500 text-xl hidden sm:inline">|</span>
            <Link href="/terms" className="hover:text-white transition duration-200 font-bold">Terms and Conditions</Link>
          </div>

          {/* Line 2: Copyright */}
          <div className="text-zinc-200 mt-5 font-semibold text-[12px]">
            &copy; {new Date().getFullYear()} Farhad365, Inc. All Rights Reserved
          </div>

        </div>
      </div>
    </footer>
  );
}
