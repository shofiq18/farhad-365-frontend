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
  }),
});

export const {
  useGetProductsQuery,
  useGetProductSuggestionsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
