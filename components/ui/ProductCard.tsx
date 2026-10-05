"use client";

import { useState } from "react";
import Link from "next/link";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    discount?: number;
    images?: string[];
    category?: { name: string; slug: string };
    targetGroup?: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [selectedImage, setSelectedImage] = useState<string>(
    product.images?.[0] || ""
  );

  const discountedPrice =
    product.discount && product.discount > 0
      ? product.price * (1 - product.discount / 100)
      : null;

  const subtitle =
    product.targetGroup && product.category?.name
      ? `${product.targetGroup.charAt(0) + product.targetGroup.slice(1).toLowerCase()}'s ${product.category.name}`
      : product.category?.name || "Sportswear";

  return (
    <div className="group flex flex-col relative cursor-pointer w-full">
      {/* Main Product Image Container */}
      <Link
        href={`/products/${product.slug}`}
        className="w-full aspect-square overflow-hidden mb-1.5 flex-shrink-0 bg-[#f6f6f6] relative flex items-center justify-center cursor-pointer"
      >
        {selectedImage ? (
          <img
            src={selectedImage}
            alt={product.title}
            className="w-full h-full object-cover object-top transition duration-300"
          />
        ) : (
          <div className="w-full h-full bg-[#f6f6f6] flex items-center justify-center text-xs text-gray-400">
            No Image
          </div>
        )}
      </Link>

      {/* Colorway Swatches Bar */}
      {product.images && product.images.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 mb-1 px-2 md:px-0 scrollbar-none min-h-[32px] z-20">
          {product.images.slice(0, 8).map((img: string, idx: number) => {
            const isSelected = selectedImage === img;
            return (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(img);
                }}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-[#f6f6f6] border overflow-hidden shrink-0 transition cursor-pointer p-0 focus:outline-none ${
                  isSelected
                    ? "border-black ring-1 ring-black"
                    : "border-gray-200 hover:border-gray-400"
                }`}
                title={`View image ${idx + 1}`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Product Info */}
      <div className="flex flex-col px-2 md:px-0 mt-0.5">
        <Link
          href={`/products/${product.slug}`}
          className="text-sm sm:text-[15px] font-semibold text-[#111111] leading-tight truncate hover:underline"
        >
          {product.title}
        </Link>
        <p className="text-xs sm:text-sm font-normal text-[#757575] mt-0.5 truncate">
          {subtitle}
        </p>
        <div className="flex items-center gap-2 mt-1 sm:mt-1.5">
          {discountedPrice ? (
            <>
              <span className="text-sm sm:text-[15px] font-semibold text-[#111111]">
                ৳{discountedPrice.toLocaleString()}
              </span>
              <span className="text-xs sm:text-sm text-[#757575] line-through">
                ৳{product.price.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-sm sm:text-[15px] font-semibold text-[#111111]">
              ৳{product.price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
