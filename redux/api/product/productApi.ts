import baseApi from "../baseApi";

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<any, any>({
      query: (params) => ({
        url: "/products",
        method: "GET",
        params,
      }),
      providesTags: ["Product"],
    }),
    getProductSuggestions: builder.query<any, string>({
      query: (q) => ({
        url: "/products/search/suggestions",
        method: "GET",
        params: { q },
      }),
    }),
    createProduct: builder.mutation<any, FormData>({
      query: (body) => ({
        url: "/products",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation<any, { id: string; body: FormData }>({
      query: ({ id, body }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Product"],
    }),
    deleteProduct: builder.mutation<any, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
    getProductBySlug: builder.query<any, string>({
      query: (slug) => ({
        url: `/products/${slug}`,
        method: "GET",
      }),
      providesTags: (result, error, slug) => [{ type: "Product", id: slug }],
    }),
    getProductReviews: builder.query<any, string>({
      query: (productId) => ({
        url: `/products/${productId}/reviews`,
        method: "GET",
      }),
      providesTags: (result, error, productId) => [{ type: "Product", id: `reviews-${productId}` }],
    }),
    createReview: builder.mutation<any, { productId: string; rating: number; comment: string }>({
      query: ({ productId, rating, comment }) => ({
        url: `/products/${productId}/reviews`,
        method: "POST",
        body: { rating, comment },
      }),
      invalidatesTags: (result, error, { productId }) => [{ type: "Product", id: `reviews-${productId}` }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductSuggestionsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductBySlugQuery,
  useGetProductReviewsQuery,
  useCreateReviewMutation,
} = productApi;
