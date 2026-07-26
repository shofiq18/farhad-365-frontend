"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { logout } from "@/feature/user/userSlice";
import {
  Menu, X, User as UserIcon, LogOut,
  LayoutDashboard, Search, Heart, ShoppingBag,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useGetCategoriesQuery } from "@/redux/api/category/categoryApi";
import { useGetProductSuggestionsQuery } from "@/redux/api/product/productApi";

type NavItem = "men" | "women" | "kids" | "accessories" | null;

const NAV_LINKS: { label: string; key: NavItem; targetGroup?: string; href?: string }[] = [
  { label: "New & Featured", key: null, href: "/shop" },
  { label: "Men",           key: "men",         targetGroup: "MEN" },
  { label: "Women",         key: "women",        targetGroup: "WOMEN" },
  { label: "Kids",          key: "kids",         targetGroup: "KIDS" },
  { label: "Accessories",   key: "accessories" },
  { label: "Sale",          key: null, href: "/shop?maxPrice=500" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<NavItem>(null);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { user } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const { data: categoriesData } = useGetCategoriesQuery();
  const categories: any[] = categoriesData?.data ?? [];

  // Debounce search value
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchValue]);

  // Click outside suggestions logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
      if (
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { data: suggestionsResult } = useGetProductSuggestionsQuery(
    debouncedSearchValue,
    { skip: debouncedSearchValue.trim().length < 2 }
  );

  const suggestionsData = suggestionsResult?.data ?? { suggestions: [], products: [] };
  const { suggestions = [], products = [] } = suggestionsData;

  const handleSearchSubmit = (term: string) => {
    router.push(`/shop?search=${encodeURIComponent(term.trim())}`);
    setSearchValue("");
    setShowSuggestions(false);
    setIsOpen(false);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchValue.trim()) {
      handleSearchSubmit(searchValue);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setShowDropdown(false);
    toast.success("Logged out successfully");
  };

  // Build the mega menu for a given nav item
  const renderMegaMenu = (key: NavItem) => {
    const navItem = NAV_LINKS.find((n) => n.key === key);
    const targetGroup = navItem?.targetGroup; // e.g. "MEN", "WOMEN", "KIDS"

    // Filter categories by targetGroups field on the category
    const filteredCategories = categories.filter((cat: any) => {
      if (key === "accessories") {
        // Under Accessories nav, ONLY show the top-level "Accessories" parent category
        return cat.slug === "accessories";
      }
      // For Men, Women, Kids: show all top-level parent categories
      return true;
    });

    // Build category links — appended with targetGroup when applicable
    const makeHref = (slug: string) =>
      targetGroup
        ? `/shop?category=${slug}&targetGroup=${targetGroup}`
        : `/shop?category=${slug}`;

    // Sidebar featured links
    const featuredLinks = targetGroup
      ? [
          { label: "New Arrivals",   href: `/shop?targetGroup=${targetGroup}` },
          { label: "Best Sellers",   href: `/shop?targetGroup=${targetGroup}` },
          { label: "What's Trending",href: `/shop?targetGroup=${targetGroup}` },
          { label: "Sale",           href: `/shop?targetGroup=${targetGroup}&maxPrice=500` },
        ]
      : [
          { label: "All Accessories", href: `/shop` },
          { label: "New Arrivals",    href: `/shop` },
          { label: "Sale",            href: `/shop?maxPrice=500` },
        ];

    // Chunk filtered categories into max 4 columns
    const MAX_COLS = 4;
    const chunkSize = Math.max(1, Math.ceil(filteredCategories.length / MAX_COLS));
    const columns: any[][] = [];
    for (let i = 0; i < filteredCategories.length; i += chunkSize) {
      columns.push(filteredCategories.slice(i, i + chunkSize));
    }

    // Show nothing if no categories match
    if (!filteredCategories.length) return null;

    return (
      <div
        className="absolute left-0 right-0 top-16 w-full border-b border-gray-200 bg-white shadow-xl z-45"
        onMouseEnter={() => setActiveMegaMenu(key)}
        onMouseLeave={() => setActiveMegaMenu(null)}
      >
        <div
          className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16 py-8 grid gap-8"
          style={{ gridTemplateColumns: `180px repeat(${columns.length}, minmax(0, 1fr))` }}
        >
          {/* LEFT sidebar: featured links */}
          <div className="flex flex-col space-y-3 border-r border-gray-100 pr-6">
            {featuredLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setActiveMegaMenu(null)}
                className="text-[14px] font-semibold text-gray-800 hover:text-black transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* CATEGORY columns — dynamically built */}
          {columns.map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-6">
              {col.map((parent: any) => (
                <div key={parent.id}>
                  {/* Parent heading */}
                  <Link
                    href={makeHref(parent.slug)}
                    onClick={() => setActiveMegaMenu(null)}
                    className="text-[14px] font-bold text-black mb-3 block hover:opacity-70 transition"
                  >
                    {parent.name}
                  </Link>
                  {/* Children */}
                  <div className="flex flex-col space-y-2">
                    {parent.children
                      ?.filter((child: any) => {
                        const groups: string[] = child.targetGroups ?? [];
                        if (key === "accessories") {
                          return groups.includes("OTHERS") || groups.includes("UNISEX");
                        }
                        if (targetGroup) {
                          return groups.includes(targetGroup) || groups.includes("UNISEX");
                        }
                        return true;
                      })
                      .map((child: any) => (
                        <Link
                          key={child.id}
                          href={makeHref(child.slug)}
                          onClick={() => setActiveMegaMenu(null)}
                          className="text-[13px] text-gray-600 hover:text-black transition duration-200"
                        >
                          {child.name}
                        </Link>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative z-50">

      {/* ── Top Bar ── */}
      <div className="hidden sm:block border-b border-gray-200 bg-[#f5f5f5] py-1.5 text-[11px] font-bold text-[#111111]">
        <div className="mx-auto max-w-[1920px] px-6 md:px-12 lg:px-16 flex justify-between items-center">
          <div className="flex items-center space-x-3.5">
            <svg className="h-5 w-5 fill-current text-black hover:opacity-70 transition cursor-pointer" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
            <span className="h-3 w-[1px] bg-gray-300" />
            <svg className="h-5 w-5 fill-current text-black hover:opacity-70 transition cursor-pointer" viewBox="0 0 24 24">
              <path d="M12 2L2 22h20L12 2zm0 3.99L19.53 19H4.47L12 5.99z" />
            </svg>
          </div>
          <div className="flex items-center space-x-3.5">
            <Link href="/store-locator" className="hover:text-gray-500">Find a Store</Link>
            <span className="h-3.5 w-[1px] bg-gray-300" />
            <Link href="/help" className="hover:text-gray-500">Help</Link>
            <span className="h-3.5 w-[1px] bg-gray-300" />
            {user ? (
              <div className="flex items-center space-x-1">
                <span>Hi, {user.name.split(" ")[0]}</span>
                <span className="h-3.5 w-[1px] bg-gray-300 ml-1.5" />
                <button onClick={handleLogout} className="hover:text-red-600 cursor-pointer">Sign Out</button>
              </div>
            ) : (
              <div className="flex items-center space-x-3.5">
                <Link href="/sign-up" className="hover:text-gray-500">Join Us</Link>
                <span className="h-3.5 w-[1px] bg-gray-300" />
                <Link href="/login" className="hover:text-gray-500">Sign In</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Nav ── */}
      <nav className="sticky top-0 w-full border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1920px] px-6 md:px-12 lg:px-16">
          <div className="flex h-16 justify-between items-center">

            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/">
                <span className="text-2xl font-black italic tracking-tighter text-[#111111] uppercase">
                  FARHAD365
                </span>
              </Link>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center space-x-8 h-full">
              {NAV_LINKS.map((nav) => {
                const hasMega = nav.key !== null;
                const href = nav.href ?? (nav.targetGroup ? `/shop?targetGroup=${nav.targetGroup}` : "/shop");

                if (!hasMega) {
                  return (
                    <Link
                      key={nav.label}
                      href={href}
                      className="text-[14px] font-semibold text-[#111111] hover:opacity-70 transition-opacity py-5"
                    >
                      {nav.label}
                    </Link>
                  );
                }

                return (
                  <div
                    key={nav.label}
                    className="relative flex items-center h-full"
                    onMouseEnter={() => setActiveMegaMenu(nav.key)}
                    onMouseLeave={() => setActiveMegaMenu(null)}
                  >
                    <Link
                      href={href}
                      className={`text-[14px] font-semibold text-[#111111] py-5 border-b-2 transition ${
                        activeMegaMenu === nav.key ? "border-black" : "border-transparent hover:opacity-70"
                      }`}
                    >
                      {nav.label}
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <div ref={desktopSearchRef} className="relative flex items-center">
                <div className="absolute left-3 text-gray-500 pointer-events-none">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleSearch}
                  placeholder="Search"
                  className="bg-[#f5f5f5] text-black placeholder-gray-500 rounded-full py-2 pl-10 pr-4 text-xs font-semibold w-40 focus:w-60 focus:bg-[#e5e5e5] focus:outline-none transition-all duration-300"
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && searchValue.trim().length >= 2 && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-none shadow-xl z-50 overflow-hidden">
                    <div className="p-3 max-h-96 overflow-y-auto">
                      {products.length === 0 ? (
                        <div className="text-gray-500 text-xs text-center py-4">
                          No products found
                        </div>
                      ) : (
                        <>
                          {/* Matching products list */}
                          {products.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
                                Products
                              </p>
                              <div className="flex flex-col space-y-2">
                                {products.map((product: any) => {
                                  const discountedPrice =
                                    product.discount > 0
                                      ? product.price * (1 - product.discount / 100)
                                      : null;

                                  return (
                                    <button
                                      key={product.id}
                                      onClick={() => handleSearchSubmit(product.title)}
                                      className="flex w-full text-left items-center gap-3 p-1.5 rounded hover:bg-gray-50 transition-colors"
                                    >
                                      <div className="h-10 w-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                        {product.images?.[0] ? (
                                          <img
                                            src={product.images[0]}
                                            alt={product.title}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full bg-gray-200" />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-800 truncate">
                                          {product.title}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                          {discountedPrice ? (
                                            <>
                                              <span className="text-xs font-bold text-black">
                                                ${discountedPrice.toFixed(2)}
                                              </span>
                                              <span className="text-[10px] text-gray-400 line-through">
                                                ${product.price.toFixed(2)}
                                              </span>
                                            </>
                                          ) : (
                                            <span className="text-xs font-bold text-black">
                                              ${product.price.toFixed(2)}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button className="hover:opacity-60 transition cursor-pointer p-1.5 text-black">
                <Heart className="h-5 w-5" />
              </button>
              <button className="hover:opacity-60 transition cursor-pointer p-1.5 text-black">
                <ShoppingBag className="h-5 w-5" />
              </button>
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center justify-center h-8 w-8 rounded-full border border-black hover:bg-gray-50 transition cursor-pointer"
                  >
                    <UserIcon className="h-4 w-4" />
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-lg z-50">
                      {(user.role === "ADMIN" || user.role === "SUPERADMIN" || user.role === "SUPER_ADMIN") && (
                        <Link
                          href="/dashboard"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition"
                        >
                          <LayoutDashboard className="h-4 w-4 text-gray-500" />
                          Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition cursor-pointer"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Mega Menu Panel */}
        {activeMegaMenu && renderMegaMenu(activeMegaMenu)}

        {/* ── Mobile Menu ── */}
        {isOpen && (
          <div className="border-b border-gray-100 bg-white px-4 py-3 md:hidden max-h-[80vh] overflow-y-auto">
            <div className="space-y-1 pb-3">
              {/* Mobile search */}
              <div ref={mobileSearchRef} className="relative flex flex-col mb-3">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => {
                      setSearchValue(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchValue.trim()) {
                        handleSearchSubmit(searchValue);
                      }
                    }}
                    placeholder="Search products..."
                    className="w-full bg-[#f5f5f5] rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none"
                  />
                </div>

                {/* Mobile Suggestions Dropdown */}
                {showSuggestions && searchValue.trim().length >= 2 && (
                  <div className="w-full mt-2 bg-white border border-gray-100 rounded-none shadow-lg z-50 overflow-hidden">
                    <div className="p-3 max-h-80 overflow-y-auto">
                      {products.length === 0 ? (
                        <div className="text-gray-500 text-xs text-center py-3">
                          No products found
                        </div>
                      ) : (
                        <>
                          {products.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-1">
                                Products
                              </p>
                              <div className="flex flex-col space-y-2">
                                {products.map((product: any) => {
                                  const discountedPrice =
                                    product.discount > 0
                                      ? product.price * (1 - product.discount / 100)
                                      : null;

                                  return (
                                    <button
                                      key={product.id}
                                      onClick={() => handleSearchSubmit(product.title)}
                                      className="flex w-full text-left items-center gap-3 p-1 rounded hover:bg-gray-50"
                                    >
                                      <div className="h-9 w-9 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                        {product.images?.[0] ? (
                                          <img
                                            src={product.images[0]}
                                            alt={product.title}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full bg-gray-200" />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-800 truncate">
                                          {product.title}
                                        </p>
                                        <div className="flex items-center gap-1.5">
                                          {discountedPrice ? (
                                            <>
                                              <span className="text-xs font-bold text-black">
                                                ${discountedPrice.toFixed(2)}
                                              </span>
                                              <span className="text-[10px] text-gray-400 line-through">
                                                ${product.price.toFixed(2)}
                                              </span>
                                            </>
                                          ) : (
                                            <span className="text-xs font-bold text-black">
                                              ${product.price.toFixed(2)}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Gender filters */}
              {[
                { label: "New & Featured", href: "/shop" },
                { label: "Men",   href: "/shop?targetGroup=MEN" },
                { label: "Women", href: "/shop?targetGroup=WOMEN" },
                { label: "Kids",  href: "/shop?targetGroup=KIDS" },
              ].map((link) => (
                <Link key={link.label} href={link.href} onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-base font-semibold text-gray-700 hover:bg-gray-50">
                  {link.label}
                </Link>
              ))}

              {/* Dynamic categories */}
              <p className="px-3 pt-3 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Categories</p>
              {categories.map((parent: any) => (
                <div key={parent.id}>
                  <Link
                    href={`/shop?category=${parent.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-bold text-gray-800 hover:bg-gray-50"
                  >
                    {parent.name}
                  </Link>
                  {parent.children?.map((child: any) => (
                    <Link
                      key={child.id}
                      href={`/shop?category=${child.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="block rounded-lg pl-6 pr-3 py-1.5 text-sm text-gray-500 hover:text-black hover:bg-gray-50"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              ))}

              <Link href="/shop?maxPrice=500" onClick={() => setIsOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-base font-semibold text-gray-700 hover:bg-gray-50">
                Sale
              </Link>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
