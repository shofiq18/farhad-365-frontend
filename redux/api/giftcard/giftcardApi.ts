import baseApi from "../baseApi";

export const giftcardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    purchaseGiftCard: builder.mutation<
      any,
      { amount: number; recipientEmail: string; senderName: string; message?: string }
    >({
      query: (body) => ({
        url: "/gift-cards/purchase",
        method: "POST",
        body,
      }),
      invalidatesTags: ["GiftCard", "Order"],
    }),
    validateGiftCard: builder.mutation<any, { code: string }>({
      query: (body) => ({
        url: "/gift-cards/validate",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { usePurchaseGiftCardMutation, useValidateGiftCardMutation } = giftcardApi;
export default giftcardApi;
