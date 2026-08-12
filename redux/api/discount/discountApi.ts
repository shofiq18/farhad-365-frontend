import baseApi from "../baseApi";

export const discountApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActiveDiscount: builder.query<any, void>({
      query: () => ({
        url: "/discounts/active",
        method: "GET",
      }),
      providesTags: ["Discount"],
    }),
    validateDiscount: builder.mutation<any, { code: string; items: { variantId: string; quantity: number }[] }>({
      query: (body) => ({
        url: "/discounts/validate",
        method: "POST",
        body,
      }),
    }),
    getAllDiscounts: builder.query<any, void>({
      query: () => ({
        url: "/discounts",
        method: "GET",
      }),
      providesTags: ["Discount"],
    }),
    createDiscount: builder.mutation<any, any>({
      query: (body) => ({
        url: "/discounts",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Discount"],
    }),
    updateDiscount: builder.mutation<any, { id: string; [key: string]: any }>({
      query: ({ id, ...body }) => ({
        url: `/discounts/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Discount"],
    }),
    deleteDiscount: builder.mutation<any, string>({
      query: (id) => ({
        url: `/discounts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Discount"],
    }),
  }),
});

export const {
  useGetActiveDiscountQuery,
  useValidateDiscountMutation,
  useGetAllDiscountsQuery,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
} = discountApi;
export default discountApi;
