import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${process.env.NEXT_PUBLIC_API_URL || ""}`,
  credentials: "include",
  prepareHeaders: (headers) => {
    if (typeof window !== "undefined") {
      const accessToken = Cookies.get("accessToken");
      if (accessToken) {
        headers.set("Authorization", accessToken);
      }
    }
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: rawBaseQuery,
  endpoints: () => ({}),
  tagTypes: [
    "User",
    "Product",
    "Order",
    "Category",
    "Blog",
    "Discount",
    "Quotation",
    "Setting",
    "GiftCard",
  ],
});

export default baseApi;