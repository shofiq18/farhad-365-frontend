import baseApi from "../baseApi";

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllOrders: builder.query<any, void>({
      query: () => ({
        url: "/orders",
        method: "GET",
      }),
      providesTags: ["Order"],
    }),
    updateOrderStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Order"],
    }),
  }),
});

export const {
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} = orderApi;
