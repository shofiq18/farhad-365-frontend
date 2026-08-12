import baseApi from "../baseApi";

export const blogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBlogs: builder.query<any, void>({
      query: () => ({
        url: "/blogs",
        method: "GET",
      }),
      providesTags: ["Blog"],
    }),
    getAdminBlogs: builder.query<any, void>({
      query: () => ({
        url: "/blogs/admin/all",
        method: "GET",
      }),
      providesTags: ["Blog"],
    }),
    getBlogBySlug: builder.query<any, string>({
      query: (slug) => ({
        url: `/blogs/${slug}`,
        method: "GET",
      }),
      providesTags: (result, error, slug) => [{ type: "Blog", id: slug }],
    }),
    createBlog: builder.mutation<any, any>({
      query: (body) => ({
        url: "/blogs",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Blog"],
    }),
    updateBlog: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/blogs/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Blog"],
    }),
    deleteBlog: builder.mutation<any, string>({
      query: (id) => ({
        url: `/blogs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Blog"],
    }),
  }),
});

export const {
  useGetBlogsQuery,
  useGetAdminBlogsQuery,
  useGetBlogBySlugQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogApi;
