import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-[#757575] font-sans antialiased">
      <div className="mx-auto max-w-[1920px] px-6 md:px-12 lg:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Column 1: Nike Bold All-Caps Links */}
          <div className="flex flex-col space-y-3.5">
            <Link href="/store-locator" className="text-[12px] font-bold text-white uppercase tracking-wider hover:text-gray-300">
              Find A Store
            </Link>
            <Link href="/sign-up" className="text-[12px] font-bold text-white uppercase tracking-wider hover:text-gray-300">
              Become A Member
            </Link>
            <Link href="/email-signup" className="text-[12px] font-bold text-white uppercase tracking-wider hover:text-gray-300">
              Sign Up For Email
            </Link>
            <Link href="/feedback" className="text-[12px] font-bold text-white uppercase tracking-wider hover:text-gray-300">
              Send Us Feedback
            </Link>
          </div>

          {/* Column 2: Help & Customer Services */}
          <div>
            <h3 className="text-[12px] font-bold text-white uppercase tracking-wider mb-4">Get Help</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/track-order" className="hover:text-white transition duration-200">Order Status</Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition duration-200">Shipping & Delivery</Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition duration-200">Returns</Link>
              </li>
              <li>
                <Link href="/payments" className="hover:text-white transition duration-200">Payment Options</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition duration-200">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Corporate Info */}
          <div>
            <h3 className="text-[12px] font-bold text-white uppercase tracking-wider mb-4">About Us</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/news" className="hover:text-white transition duration-200">News</Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-white transition duration-200">Careers</Link>
              </li>
              <li>
                <Link href="/investors" className="hover:text-white transition duration-200">Investors</Link>
              </li>
              <li>
                <Link href="/sustainability" className="hover:text-white transition duration-200">Sustainability</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Social Media Circle Buttons */}
          <div className="flex space-x-3.5 items-start">
            {/* Facebook circle button */}
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 text-black hover:bg-white transition duration-300">
              <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" />
              </svg>
            </a>
            {/* Twitter circle button */}
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 text-black hover:bg-white transition duration-300">
              <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M23.95 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </a>
            {/* Instagram circle button */}
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 text-black hover:bg-white transition duration-300">
              <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          </div>

        </div>

        {/* Nike Bottom bar */}
        <div className="mt-16 border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center text-[11px] font-bold text-zinc-500 space-y-4 md:space-y-0">
          
          {/* Location + Copyright */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center text-white gap-1.5 cursor-pointer hover:text-gray-300">
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span>Bangladesh</span>
            </div>
            <p>&copy; {new Date().getFullYear()} FARHAD365, Inc. All Rights Reserved</p>
          </div>

          {/* Legal Guide links */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center text-zinc-500">
            <Link href="/guides" className="hover:text-white transition duration-200">Guides</Link>
            <Link href="/terms-sale" className="hover:text-white transition duration-200">Terms of Sale</Link>
            <Link href="/terms-use" className="hover:text-white transition duration-200">Terms of Use</Link>
            <Link href="/privacy" className="hover:text-white transition duration-200">Privacy Policy</Link>
          </div>

        </div>
      </div>
    </footer>
  );
}
