import baseApi from "../baseApi";

export const settingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllSettings: builder.query<any, void>({
      query: () => ({ url: "/settings", method: "GET" }),
      providesTags: ["Setting"],
    }),
    updateSetting: builder.mutation<any, { key: string; value: string }>({
      query: ({ key, value }) => ({
        url: `/settings/${key}`,
        method: "PATCH",
        body: { value },
      }),
      invalidatesTags: ["Setting"],
    }),
  }),
});

export const { useGetAllSettingsQuery, useUpdateSettingMutation } = settingApi;
