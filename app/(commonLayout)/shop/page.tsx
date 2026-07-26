"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGetProductsQuery } from "@/redux/api/product/productApi";
import { useGetCategoriesQuery } from "@/redux/api/category/categoryApi";
import { ChevronDown, ChevronUp, SlidersHorizontal, X, Loader } from "lucide-react";
import Link from "next/link";

const TARGET_GROUPS = ["MEN", "WOMEN", "KIDS", "UNISEX"] as const;
const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
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
  const [sortOpen, setSortOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categories: true,
    gender: true,
    price: false,
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

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
    >
      {/* ── TOP CONTROLS BAR ── */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="mx-auto max-w-[1920px] px-6 md:px-12 lg:px-16 py-4 flex items-center justify-between gap-4">
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
          <div className="flex items-center gap-5">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-semibold hover:opacity-60 transition cursor-pointer"
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
              <SlidersHorizontal className="h-4 w-4" />
            </button>

            {/* Sort */}
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

      {/* ── BODY: SIDEBAR + GRID ── */}
      <div className="mx-auto max-w-[1920px] px-6 md:px-12 lg:px-16 flex min-h-[calc(100vh-65px)]">

        {/* LEFT SIDEBAR */}
        {showFilters && (
          <aside className="w-52 shrink-0 pr-6 py-6 sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto">
            {/* Clear filters */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs font-bold text-black mb-5 hover:opacity-60 transition cursor-pointer"
              >
                <X className="h-3.5 w-3.5" /> Clear All Filters
              </button>
            )}

            {/* CATEGORIES */}
            <div className="border-b border-gray-200 pb-4 mb-4">
              <button
                onClick={() => toggleSection("categories")}
                className="flex justify-between items-center w-full text-sm font-bold text-black mb-3 cursor-pointer"
              >
                Categories
                {expandedSections.categories ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {expandedSections.categories && (
                <div className="space-y-0.5">
                  <button
                    onClick={() => { setSelectedCategory(null); setPage(1); }}
                    className={`block w-full text-left py-1.5 text-sm transition cursor-pointer ${
                      !selectedCategory
                        ? "font-bold text-black"
                        : "text-gray-500 hover:text-black"
                    }`}
                  >
                    All Products
                  </button>
                  {categoriesData?.data?.map((parent: any) => (
                    <div key={parent.id}>
                      <button
                        onClick={() => { setSelectedCategory(parent.slug); setPage(1); }}
                        className={`block w-full text-left py-1.5 text-sm font-semibold transition cursor-pointer ${
                          selectedCategory === parent.slug || selectedCategory === parent.id
                            ? "text-black font-bold"
                            : "text-gray-500 hover:text-black"
                        }`}
                      >
                        {parent.name}
                      </button>
                      {parent.children?.map((child: any) => (
                        <button
                          key={child.id}
                          onClick={() => { setSelectedCategory(child.slug); setPage(1); }}
                          className={`block w-full text-left py-1 pl-3 text-sm transition cursor-pointer ${
                            selectedCategory === child.slug || selectedCategory === child.id
                              ? "font-bold text-black"
                              : "text-gray-400 hover:text-black"
                          }`}
                        >
                          {child.name}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* GENDER */}
            <div className="border-b border-gray-200 pb-4 mb-4">
              <button
                onClick={() => toggleSection("gender")}
                className="flex justify-between items-center w-full text-sm font-bold text-black mb-3 cursor-pointer"
              >
                Gender
                {expandedSections.gender ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {expandedSections.gender && (
                <div className="space-y-0.5">
                  {TARGET_GROUPS.map((g) => (
                    <button
                      key={g}
                      onClick={() => {
                        setSelectedTarget(selectedTarget === g ? null : g);
                        setPage(1);
                      }}
                      className={`block w-full text-left py-1.5 text-sm transition cursor-pointer ${
                        selectedTarget === g
                          ? "font-bold text-black"
                          : "text-gray-500 hover:text-black"
                      }`}
                    >
                      {g.charAt(0) + g.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PRICE RANGE */}
            <div className="pb-4">
              <button
                onClick={() => toggleSection("price")}
                className="flex justify-between items-center w-full text-sm font-bold text-black mb-3 cursor-pointer"
              >
                Price Range
                {expandedSections.price ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {expandedSections.price && (
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                    placeholder="Min $"
                    className="w-full border rounded-lg py-1.5 px-2 text-xs focus:outline-none focus:border-black"
                  />
                  <span className="text-gray-400 text-xs">–</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                    placeholder="Max $"
                    className="w-full border rounded-lg py-1.5 px-2 text-xs focus:outline-none focus:border-black"
                  />
                </div>
              )}
            </div>
          </aside>
        )}

        {/* ── PRODUCT GRID ── */}
        <main className={`flex-1 py-6 ${showFilters ? "pl-8" : ""}`}>
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
              {/* 3-column grid: 1 col mobile, 2 col sm, 3 col lg */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
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
                      {/* Product Image — fixed 507px height */}
                      <div className="w-full h-[507px] bg-gray-100 overflow-hidden mb-3 flex-shrink-0">
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

                      {/* Product Info */}
                      <div className="flex flex-col gap-0.5">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          {product.category?.name}
                        </p>
                        <p className="text-sm font-bold text-black leading-snug group-hover:underline line-clamp-2">
                          {product.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {discountedPrice ? (
                            <>
                              <span className="text-sm font-bold text-black">
                                ${discountedPrice.toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-400 line-through">
                                ${product.price.toFixed(2)}
                              </span>
                              <span className="text-xs font-bold text-red-600">
                                {product.discount}% OFF
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-bold text-black">
                              ${product.price.toFixed(2)}
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
