import baseApi from "../baseApi";

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<any, void>({
      query: () => ({ url: "/categories", method: "GET" }),
      providesTags: ["Category"],
    }),
    createCategory: builder.mutation<any, any>({
      query: (body) => ({ url: "/categories", method: "POST", body }),
      invalidatesTags: ["Category"],
    }),
    updateCategory: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/categories/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Category"],
    }),
    deleteCategory: builder.mutation<any, string>({
      query: (id) => ({ url: `/categories/${id}`, method: "DELETE" }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
