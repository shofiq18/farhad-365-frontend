import baseApi from "../baseApi";

export const quotationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitQuotation: builder.mutation<any, any>({
      query: (body) => ({
        url: "/quotations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Quotation"],
    }),
    getAllQuotations: builder.query<any, void>({
      query: () => ({ url: "/quotations", method: "GET" }),
      providesTags: ["Quotation"],
    }),
    updateQuotationStatus: builder.mutation<any, { id: string; status: "Submit" | "Approve" | "Cancel" }>({
      query: ({ id, status }) => ({
        url: `/quotations/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Quotation"],
    }),
  }),
});

export const {
  useSubmitQuotationMutation,
  useGetAllQuotationsQuery,
  useUpdateQuotationStatusMutation,
} = quotationApi;
