"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGetProductsQuery } from "@/redux/api/product/productApi";
import { useGetCategoriesQuery } from "@/redux/api/category/categoryApi";
import { ChevronDown, ChevronUp, SlidersHorizontal, X, Loader, Check } from "lucide-react";
import Link from "next/link";

const TARGET_GROUPS = ["MEN", "WOMEN", "KIDS", "UNISEX", "SCHOOL", "SPORTS"] as const;

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

const PRICE_RANGES = [
  { label: "৳0 - ৳1,000", min: "0", max: "1000" },
  { label: "৳1,000 - ৳2,500", min: "1000", max: "2500" },
  { label: "৳2,500 - ৳5,000", min: "2500", max: "5000" },
  { label: "৳5,000 - ৳10,000", min: "5000", max: "10000" },
  { label: "Over ৳10,000", min: "10000", max: "" },
];

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read initial state from URL params
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get("category") || null
  );
  const [selectedTarget, setSelectedTarget] = useState<string | null>(
    searchParams.get("targetGroup") || null
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categories: true,
    gender: true,
    price: true,
  });

  // Sync URL params when they change (Navbar navigation)
  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || null);
    setSelectedTarget(searchParams.get("targetGroup") || null);
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setSearch(searchParams.get("search") || "");
    setPage(1);
  }, [searchParams]);

  const { data: categoriesData } = useGetCategoriesQuery();

  const { data: productsData, isLoading, isFetching } = useGetProductsQuery({
    search: search || undefined,
    category: selectedCategory || undefined,
    targetGroup: selectedTarget || undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    sort: sort !== "newest" ? sort : undefined,
    page,
    limit: 12,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedTarget(null);
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(1);
    router.push("/shop");
  };

  const handlePriceBracketClick = (min: string, max: string) => {
    if (minPrice === min && maxPrice === max) {
      setMinPrice("");
      setMaxPrice("");
    } else {
      setMinPrice(min);
      setMaxPrice(max);
    }
    setPage(1);
  };

  const hasFilters = selectedCategory || selectedTarget || minPrice || maxPrice || search;

  // Build breadcrumb title
  let breadcrumb = "All Products";
  if (search) {
    breadcrumb = `Search: "${search}"`;
  } else if (selectedTarget && !selectedCategory) {
    breadcrumb = selectedTarget.charAt(0) + selectedTarget.slice(1).toLowerCase() + "'s";
  } else if (selectedCategory && categoriesData?.data) {
    for (const parent of categoriesData.data) {
      if (parent.slug === selectedCategory || parent.id === selectedCategory) {
        breadcrumb = parent.name;
        break;
      }
      const child = parent.children?.find(
        (c: any) => c.slug === selectedCategory || c.id === selectedCategory
      );
      if (child) {
        breadcrumb = child.name;
        break;
      }
    }
  }

  // Helper component to render Nike-style Checkbox Filter Sections
  const renderFilterSections = () => {
    const rawCats = categoriesData?.data ?? [];
    const categoryOrder = ["clothing", "footwear", "accessories"];
    const orderedCategories = [...rawCats].sort((a: any, b: any) => {
      const idxA = categoryOrder.indexOf(a.slug?.toLowerCase());
      const idxB = categoryOrder.indexOf(b.slug?.toLowerCase());
      if (idxA !== -1 && idxB === -1) return -1;
      if (idxA === -1 && idxB !== -1) return 1;
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      return a.name.localeCompare(b.name);
    });

    return (
      <div className="space-y-6 select-none">
        {/* Clear filters button */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs font-bold text-black hover:opacity-60 transition cursor-pointer mb-2"
          >
            <X className="h-3.5 w-3.5" /> Clear All Filters
          </button>
        )}

        {/* GENDER / TARGET GROUPS */}
        <div className="border-b border-gray-200 pb-5">
          <button
            onClick={() => toggleSection("gender")}
            className="flex justify-between items-center w-full text-base font-bold text-black mb-3.5 cursor-pointer"
          >
            Gender
            {expandedSections.gender ? (
              <ChevronUp className="h-4 w-4 text-black" />
            ) : (
              <ChevronDown className="h-4 w-4 text-black" />
            )}
          </button>
          {expandedSections.gender && (
            <div className="space-y-2.5 pt-1">
              {TARGET_GROUPS.map((g) => {
                const isSelected = selectedTarget === g;
                return (
                  <label
                    key={g}
                    className="flex items-center gap-3 cursor-pointer group py-0.5 select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        setSelectedTarget(isSelected ? null : g);
                        setPage(1);
                      }}
                      className="h-5 w-5 rounded border-2 border-zinc-400 text-black accent-black focus:ring-0 cursor-pointer shrink-0"
                    />
                    <span
                      className={`text-[15px] leading-tight transition ${
                        isSelected
                          ? "font-bold text-black"
                          : "font-medium text-black group-hover:text-zinc-600"
                      }`}
                    >
                      {g.charAt(0) + g.slice(1).toLowerCase()}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* CATEGORIES */}
        <div className="border-b border-gray-200 pb-5">
          <button
            onClick={() => toggleSection("categories")}
            className="flex justify-between items-center w-full text-base font-bold text-black mb-3.5 cursor-pointer"
          >
            Categories
            {expandedSections.categories ? (
              <ChevronUp className="h-4 w-4 text-black" />
            ) : (
              <ChevronDown className="h-4 w-4 text-black" />
            )}
          </button>
          {expandedSections.categories && (
            <div className="space-y-2.5 pt-1">
              <label className="flex items-center gap-3 cursor-pointer group py-0.5 select-none">
                <input
                  type="checkbox"
                  checked={!selectedCategory}
                  onChange={() => {
                    setSelectedCategory(null);
                    setPage(1);
                  }}
                  className="h-5 w-5 rounded border-2 border-zinc-400 text-black accent-black focus:ring-0 cursor-pointer shrink-0"
                />
                <span
                  className={`text-[15px] leading-tight transition ${
                    !selectedCategory
                      ? "font-bold text-black"
                      : "font-medium text-black group-hover:text-zinc-600"
                  }`}
                >
                  All Products
                </span>
              </label>

              {orderedCategories.map((parent: any) => {
                const isParentSelected =
                  selectedCategory === parent.slug || selectedCategory === parent.id;
                return (
                  <div key={parent.id} className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer group py-0.5 select-none">
                      <input
                        type="checkbox"
                        checked={isParentSelected}
                        onChange={() => {
                          setSelectedCategory(isParentSelected ? null : parent.slug);
                          setPage(1);
                        }}
                        className="h-5 w-5 rounded border-2 border-zinc-400 text-black accent-black focus:ring-0 cursor-pointer shrink-0"
                      />
                      <span
                        className={`text-[15px] leading-tight transition ${
                          isParentSelected
                            ? "font-bold text-black"
                            : "font-medium text-black group-hover:text-zinc-600"
                        }`}
                      >
                        {parent.name}
                      </span>
                    </label>

                    {/* Subcategories */}
                    {parent.children?.map((child: any) => {
                      const isChildSelected =
                        selectedCategory === child.slug || selectedCategory === child.id;
                      return (
                        <label
                          key={child.id}
                          className="flex items-center gap-3 pl-6 cursor-pointer group py-0.5 select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isChildSelected}
                            onChange={() => {
                              setSelectedCategory(isChildSelected ? null : child.slug);
                              setPage(1);
                            }}
                            className="h-4.5 w-4.5 rounded border-2 border-zinc-400 text-black accent-black focus:ring-0 cursor-pointer shrink-0"
                          />
                          <span
                            className={`text-sm leading-tight transition ${
                              isChildSelected
                                ? "font-bold text-black"
                                : "font-medium text-zinc-800 group-hover:text-black"
                            }`}
                          >
                            {child.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SHOP BY PRICE (NIKE CHECKBOX STYLE) */}
        <div className="pb-4">
          <button
            onClick={() => toggleSection("price")}
            className="flex justify-between items-center w-full text-base font-bold text-black mb-3.5 cursor-pointer"
          >
            Shop by Price
            {expandedSections.price ? (
              <ChevronUp className="h-4 w-4 text-black" />
            ) : (
              <ChevronDown className="h-4 w-4 text-black" />
            )}
          </button>
          {expandedSections.price && (
            <div className="space-y-2.5 pt-1">
              {PRICE_RANGES.map((range) => {
                const isSelected = minPrice === range.min && maxPrice === range.max;
                return (
                  <label
                    key={range.label}
                    className="flex items-center gap-3 cursor-pointer group py-0.5 select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handlePriceBracketClick(range.min, range.max)}
                      className="h-5 w-5 rounded border-2 border-zinc-400 text-black accent-black focus:ring-0 cursor-pointer shrink-0"
                    />
                    <span
                      className={`text-[15px] leading-tight transition ${
                        isSelected
                          ? "font-bold text-black"
                          : "font-medium text-black group-hover:text-zinc-600"
                      }`}
                    >
                      {range.label}
                    </span>
                  </label>
                );
              })}

              {/* Custom Min / Max Inputs */}
              <div className="pt-3 border-t border-gray-100 mt-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  Custom Range
                </span>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Min ৳"
                    className="w-full border border-gray-300 rounded-lg py-1.5 px-2.5 text-xs text-black font-medium focus:outline-none focus:border-black"
                  />
                  <span className="text-gray-400 text-xs">–</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Max ৳"
                    className="w-full border border-gray-300 rounded-lg py-1.5 px-2.5 text-xs text-black font-medium focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
    >
      {/* ── TOP CONTROLS BAR ── */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="mx-auto max-w-[1920px] px-3 sm:px-6 md:px-12 lg:px-16 py-4 flex items-center justify-between gap-4">
          {/* Title + count */}
          <div>
            <h1 className="text-lg font-bold text-black">
              {breadcrumb}{" "}
              <span className="text-gray-400 font-normal">
                ({productsData?.totalCount ?? 0})
              </span>
            </h1>
          </div>

          {/* Filter toggle + Sort */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Desktop Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="hidden md:flex items-center gap-2 text-sm font-semibold hover:opacity-60 transition cursor-pointer"
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
              <SlidersHorizontal className="h-4 w-4" />
            </button>

            {/* Mobile Filter Trigger Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="flex md:hidden items-center gap-2 text-sm font-semibold hover:opacity-60 transition cursor-pointer"
            >
              Filter ({productsData?.totalCount ?? 0})
              <SlidersHorizontal className="h-4 w-4" />
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-1 text-sm font-semibold hover:opacity-60 transition cursor-pointer"
              >
                Sort By{" "}
                {sortOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg z-30 w-52 py-2 overflow-hidden">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSort(opt.value);
                        setSortOpen(false);
                        setPage(1);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition cursor-pointer ${
                        sort === opt.value
                          ? "font-bold bg-gray-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE SLIDE-OVER FILTER DRAWER ── */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
              <h2 className="text-base font-extrabold text-black">
                Filters {productsData?.totalCount ? `(${productsData.totalCount})` : ""}
              </h2>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer text-gray-500 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {renderFilterSections()}
            </div>

            {/* Sticky Bottom Apply Button */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full bg-black hover:bg-zinc-800 text-white font-bold py-3.5 rounded-full text-sm transition cursor-pointer"
              >
                View Results ({productsData?.totalCount ?? 0})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BODY: SIDEBAR + GRID ── */}
      <div className="mx-auto max-w-[1920px] px-0 sm:px-6 md:px-12 lg:px-16 flex min-h-[calc(100vh-65px)]">

        {/* DESKTOP LEFT SIDEBAR */}
        {showFilters && (
          <aside className="hidden md:block w-56 shrink-0 pr-6 py-6 sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto border-r border-gray-100">
            {renderFilterSections()}
          </aside>
        )}

        {/* ── PRODUCT GRID ── */}
        <main className={`flex-1 py-6 ${showFilters ? "md:pl-8" : ""}`}>
          {isLoading || isFetching ? (
            <div className="flex justify-center items-center py-32">
              <Loader className="animate-spin h-8 w-8 text-black" />
            </div>
          ) : productsData?.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <p className="text-xl font-bold text-gray-900 mb-2">
                No products found
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Try adjusting or clearing your filters.
              </p>
              <button
                onClick={clearFilters}
                className="bg-black text-white py-3 px-8 rounded-full text-sm font-bold cursor-pointer hover:bg-zinc-800 transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {/* Product Grid: Responsive column scaling for mobile, laptop (1024px), desktop (1440px), and ultra-wide/4K (1920px - 2560px) */}
              <div
                className={`grid gap-x-2 sm:gap-x-6 gap-y-6 sm:gap-y-10 ${
                  showFilters
                    ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4"
                    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
                }`}
              >
                {productsData?.data?.map((product: any) => {
                  const discountedPrice =
                    product.discount > 0
                      ? product.price * (1 - product.discount / 100)
                      : null;
                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="group flex flex-col"
                    >
                      {/* Product Image: Responsive 4:5 aspect ratio for perfectly proportioned cards on 1024px, 1440px, and 4K viewports */}
                      <div className="w-full aspect-[4/5] overflow-hidden mb-2 sm:mb-3 flex-shrink-0 bg-gray-100">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex flex-col gap-0.5 px-2 sm:px-0">
                        <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          {product.category?.name}
                        </p>
                        <p className="text-xs sm:text-sm font-bold text-black leading-snug group-hover:underline line-clamp-2">
                          {product.title}
                        </p>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                          {discountedPrice ? (
                            <>
                              <span className="text-xs sm:text-sm font-bold text-black">
                                ৳{discountedPrice.toLocaleString()}
                              </span>
                              <span className="text-[11px] sm:text-sm text-gray-400 line-through">
                                ৳{product.price.toLocaleString()}
                              </span>
                              <span className="text-[10px] sm:text-xs font-bold text-red-600">
                                {product.discount}% OFF
                              </span>
                            </>
                          ) : (
                            <span className="text-xs sm:text-sm font-bold text-black">
                              ৳{product.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {productsData?.totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-12">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-6 py-2.5 border border-black rounded-full text-sm font-bold disabled:opacity-40 hover:bg-black hover:text-white transition cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-semibold text-gray-500">
                    {page} / {productsData.totalPages}
                  </span>
                  <button
                    disabled={page === productsData.totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-6 py-2.5 border border-black rounded-full text-sm font-bold disabled:opacity-40 hover:bg-black hover:text-white transition cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
