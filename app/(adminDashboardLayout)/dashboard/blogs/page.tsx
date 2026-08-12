"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Plus, Pencil, Trash2, Loader, X, Eye, BookOpen } from "lucide-react";
import {
  useGetAdminBlogsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} from "@/redux/api/blog/blogApi";

interface BlogFormState {
  title: string;
  excerpt: string;
  coverImage: string;
  content: string;
  author: string;
  readTime: string;
  isPublished: boolean;
}

const defaultForm: BlogFormState = {
  title: "",
  excerpt: "",
  coverImage: "",
  content: "",
  author: "Pristto Team",
  readTime: "5 min read",
  isPublished: true,
};

export default function AdminBlogsPage() {
  const { data: blogsResponse, isLoading } = useGetAdminBlogsQuery();
  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();

  const [form, setForm] = useState<BlogFormState>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");

  const blogs: any[] = blogsResponse?.data ?? [];

  const handleOpenEdit = (blog: any) => {
    setForm({
      title: blog.title,
      excerpt: blog.excerpt,
      coverImage: blog.coverImage,
      content: blog.content,
      author: blog.author || "Pristto Team",
      readTime: blog.readTime || "5 min read",
      isPublished: blog.isPublished,
    });
    setCoverPreview(blog.coverImage || "");
    setCoverFile(null);
    setEditingId(blog.id || blog._id);
    setShowForm(true);
  };

  const handleResetForm = () => {
    setForm(defaultForm);
    setCoverFile(null);
    setCoverPreview("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setCoverFile(null);
    setCoverPreview("");
    setForm((prev) => ({ ...prev, coverImage: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required.");
    if (!form.excerpt.trim()) return toast.error("Excerpt is required.");
    if (!coverPreview) return toast.error("Cover image is required.");
    if (!form.content.trim()) return toast.error("Content is required.");

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("excerpt", form.excerpt);
    formData.append("content", form.content);
    formData.append("author", form.author);
    formData.append("readTime", form.readTime);
    formData.append("isPublished", String(form.isPublished));

    if (coverFile) {
      formData.append("file", coverFile);
    } else if (form.coverImage) {
      formData.append("coverImage", form.coverImage);
    }

    try {
      if (editingId) {
        await updateBlog({ id: editingId, body: formData }).unwrap();
        toast.success("Blog post updated successfully!");
      } else {
        await createBlog(formData).unwrap();
        toast.success("Blog post created successfully!");
      }
      handleResetForm();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "An error occurred.");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteBlog(deletingId).unwrap();
      toast.success("Blog post deleted successfully.");
      setDeletingId(null);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to delete blog post.");
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto" style={{ fontFamily: '"Helvetica Neue", sans-serif' }}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-black" /> Blogs Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, edit, and publish editorial articles and styles for the Pristto Blog.
          </p>
        </div>
        <button
          onClick={() => { handleResetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-zinc-800 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Blog Post
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader className="animate-spin h-8 w-8 text-black" />
        </div>
      )}

      {/* Blogs List Table */}
      {!isLoading && blogs.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-300 rounded-2xl bg-gray-50/50">
          <p className="text-gray-400 font-bold">No blog posts found. Create your first post now!</p>
        </div>
      ) : (
        !isLoading && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <th className="py-4 px-6">Cover</th>
                    <th className="py-4 px-6">Title</th>
                    <th className="py-4 px-6">Author</th>
                    <th className="py-4 px-6">Read Time</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {blogs.map((blog) => (
                    <tr key={blog.id || blog._id} className="hover:bg-gray-50/50 transition">
                      <td className="py-4 px-6">
                        {blog.coverImage ? (
                          <img
                            src={blog.coverImage}
                            alt={blog.title}
                            className="h-10 w-16 object-cover rounded border border-gray-200"
                          />
                        ) : (
                          <div className="h-10 w-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-[10px] text-gray-400 font-bold">
                            No Img
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 font-bold text-black max-w-xs truncate">
                        {blog.title}
                      </td>
                      <td className="py-4 px-6 text-gray-600 font-medium">{blog.author}</td>
                      <td className="py-4 px-6 text-gray-600 font-medium">{blog.readTime}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          blog.isPublished
                            ? "bg-green-50 text-green-700 border border-green-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}>
                          {blog.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(blog)}
                          className="p-2 hover:bg-gray-100 text-gray-600 hover:text-black rounded transition inline-flex items-center"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(blog.id || blog._id)}
                          className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded transition inline-flex items-center"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* ── ADD/EDIT MODAL ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 overflow-y-auto py-10">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-6 relative shadow-xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleResetForm}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-black uppercase tracking-wider mb-5">
              {editingId ? "Edit Blog Post" : "Add New Blog Post"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1.5">Blog Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Summer Styling Guide 2026"
                  className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-black"
                  required
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1.5">Excerpt * (Short Summary)</label>
                <input
                  type="text"
                  value={form.excerpt}
                  onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                  placeholder="A quick 1-2 sentence description of the article."
                  className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-black"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Author */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1.5">Author</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-black"
                  />
                </div>
                {/* Read Time */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1.5">Read Time</label>
                  <input
                    type="text"
                    value={form.readTime}
                    onChange={(e) => setForm((p) => ({ ...p, readTime: e.target.value }))}
                    placeholder="e.g. 5 min read"
                    className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Cover Image File Upload */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1.5">Cover Image *</label>
                {coverPreview ? (
                  <div className="relative border border-gray-200 rounded-xl overflow-hidden aspect-[16/9] bg-zinc-50 max-w-sm">
                    <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full shadow hover:bg-red-700 transition cursor-pointer"
                      title="Remove Image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50/50 hover:bg-gray-50 transition relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required={!editingId}
                    />
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Plus className="h-6 w-6 text-gray-400" />
                      <span className="text-xs font-bold text-gray-500 uppercase">Upload Image</span>
                      <span className="text-[10px] text-gray-400">JPG, PNG, WEBP (Max 5MB)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1.5">Article Content *</label>
                <textarea
                  rows={8}
                  value={form.content}
                  onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  placeholder="Write your article details here. You can use multiple paragraphs..."
                  className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-black resize-none"
                  required
                />
              </div>

              {/* Status Switch */}
              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <div>
                  <span className="block text-sm font-bold text-black">Publish Instantly</span>
                  <span className="text-xs text-gray-400">Make this blog post visible on the website immediately.</span>
                </div>
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))}
                  className="h-5 w-5 accent-black rounded cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-5 py-2.5 border border-gray-200 rounded-full text-xs font-bold hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-6 py-2.5 bg-black text-white rounded-full text-xs font-bold hover:bg-zinc-800 transition cursor-pointer disabled:opacity-50"
                >
                  {isCreating || isUpdating ? "Saving..." : editingId ? "Update Post" : "Create Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center shadow-xl">
            <h3 className="text-base font-black uppercase text-black mb-2">Delete Blog Post?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this blog post? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="px-5 py-2.5 border border-gray-200 rounded-full text-xs font-bold hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold transition cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
