"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Plus, Pencil, Trash2, Loader, X, ChevronDown, ChevronRight } from "lucide-react";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/redux/api/category/categoryApi";

const ALL_GROUPS = ["MEN", "WOMEN", "KIDS", "UNISEX", "OTHERS", "SCHOOL", "SPORTS"] as const;
type Group = (typeof ALL_GROUPS)[number];

const GROUP_LABELS: Record<Group, string> = {
  MEN: "Men",
  WOMEN: "Women",
  KIDS: "Kids",
  UNISEX: "Unisex / All",
  OTHERS: "Accessories / Others",
  SCHOOL: "School",
  SPORTS: "Sports",
};

const GROUP_COLORS: Record<Group, string> = {
  MEN:    "bg-blue-100 text-blue-700",
  WOMEN:  "bg-pink-100 text-pink-700",
  KIDS:   "bg-yellow-100 text-yellow-700",
  UNISEX: "bg-gray-100 text-gray-600",
  OTHERS: "bg-purple-100 text-purple-700",
  SCHOOL: "bg-orange-100 text-orange-700",
  SPORTS: "bg-red-100 text-red-700",
};


interface FormState {
  name: string;
  slug: string;
  parentId: string;
  targetGroups: Group[];
}

const defaultForm: FormState = {
  name: "",
  slug: "",
  parentId: "",
  targetGroups: ["UNISEX"],
};

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
}

export default function AdminCategoriesPage() {
  const { data: categoriesData, isLoading } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const [form, setForm] = useState<FormState>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const categories: any[] = categoriesData?.data ?? [];

  // Flatten for parent selector
  const flatCategories = categories.flatMap((p: any) => [
    { id: p.id, name: p.name, isParent: true },
    ...(p.children ?? []).map((c: any) => ({ id: c.id, name: `— ${c.name}`, isParent: false })),
  ]);

  const handleNameChange = (name: string) => {
    setForm((prev) => ({ ...prev, name, slug: slugify(name) }));
  };

  const toggleGroup = (g: Group) => {
    setForm((prev) => ({
      ...prev,
      targetGroups: prev.targetGroups.includes(g)
        ? prev.targetGroups.filter((x) => x !== g)
        : [...prev.targetGroups, g],
    }));
  };

  const openEdit = (cat: any) => {
    setForm({
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId ?? "",
      targetGroups: (cat.targetGroups ?? ["UNISEX"]) as Group[],
    });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) return toast.error("Name and slug are required.");
    if (!form.targetGroups.length) return toast.error("Select at least one target group.");

    const payload = {
      name: form.name,
      slug: form.slug,
      parentId: form.parentId || null,
      targetGroups: form.targetGroups,
    };

    try {
      if (editingId) {
        await updateCategory({ id: editingId, body: payload }).unwrap();
        toast.success("Category updated!");
      } else {
        await createCategory(payload).unwrap();
        toast.success("Category created!");
      }
      resetForm();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Something went wrong.");
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteCategory(deletingId).unwrap();
      toast.success("Category deleted.");
      setDeletingId(null);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Could not delete.");
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto" style={{ fontFamily: '"Helvetica Neue", sans-serif' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Tag each category so the navbar and shop filter show them correctly.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-zinc-800 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      {/* ── FORM ── */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold">
              {editingId ? "Edit Category" : "New Category"}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-black cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1.5">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Polo Shirts"
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-black"
                  required
                />
              </div>
              {/* Slug */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1.5">Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="polo-shirts"
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-black"
                  required
                />
              </div>
            </div>

            {/* Parent category */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1.5">Parent Category (optional)</label>
              <select
                value={form.parentId}
                onChange={(e) => setForm((p) => ({ ...p, parentId: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-black bg-white"
              >
                <option value="">None (top-level)</option>
                {flatCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Target Groups */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-2">
                Target Groups * <span className="text-gray-400 font-normal normal-case">(controls which navbar tab shows this category)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_GROUPS.map((g) => {
                  const active = form.targetGroups.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGroup(g)}
                      className={`px-4 py-2 rounded-full text-xs font-bold border transition cursor-pointer ${
                        active
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-600 border-gray-300 hover:border-black"
                      }`}
                    >
                      {GROUP_LABELS[g]}
                    </button>
                  );
                })}
              </div>
              {form.targetGroups.length === 0 && (
                <p className="text-xs text-red-500 mt-1">Please select at least one group.</p>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={isCreating || isUpdating}
                className="bg-black text-white px-7 py-2.5 rounded-full text-sm font-bold hover:bg-zinc-800 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {(isCreating || isUpdating) && <Loader className="animate-spin h-3.5 w-3.5" />}
                {editingId ? "Update" : "Create"}
              </button>
              <button type="button" onClick={resetForm}
                className="px-7 py-2.5 rounded-full border border-gray-300 text-sm font-bold hover:border-black transition cursor-pointer">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── CATEGORY TREE ── */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader className="animate-spin h-7 w-7 text-black" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No categories yet. Add one above.</div>
      ) : (
        <div className="border border-gray-200 rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_200px_120px] bg-gray-50 border-b border-gray-200 px-5 py-3 text-xs font-bold uppercase text-gray-500">
            <span>Category</span>
            <span>Target Groups</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Rows */}
          {categories.map((parent: any) => (
            <div key={parent.id} className="border-b border-gray-100 last:border-0">
              {/* Parent row */}
              <div className="grid grid-cols-[1fr_200px_120px] items-center px-5 py-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-2">
                  {parent.children?.length > 0 && (
                    <button
                      onClick={() => setExpanded((p) => ({ ...p, [parent.id]: !p[parent.id] }))}
                      className="text-gray-400 hover:text-black transition cursor-pointer"
                    >
                      {expanded[parent.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                  )}
                  <span className="font-bold text-sm text-black">{parent.name}</span>
                  <span className="text-xs text-gray-400 font-mono">/{parent.slug}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(parent.targetGroups ?? ["UNISEX"]).map((g: Group) => (
                    <span key={g} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${GROUP_COLORS[g]}`}>
                      {GROUP_LABELS[g]}
                    </span>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => openEdit(parent)} className="p-1.5 hover:bg-gray-100 rounded-lg transition cursor-pointer text-gray-600">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeletingId(parent.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition cursor-pointer text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Children rows */}
              {expanded[parent.id] && parent.children?.map((child: any) => (
                <div key={child.id} className="grid grid-cols-[1fr_200px_120px] items-center px-5 py-3 bg-gray-50/60 border-t border-gray-100 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-2 pl-6">
                    <span className="text-gray-300 text-lg leading-none">└</span>
                    <span className="text-sm text-gray-700">{child.name}</span>
                    <span className="text-xs text-gray-400 font-mono">/{child.slug}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(child.targetGroups ?? ["UNISEX"]).map((g: Group) => (
                      <span key={g} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${GROUP_COLORS[g]}`}>
                        {GROUP_LABELS[g]}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(child)} className="p-1.5 hover:bg-gray-100 rounded-lg transition cursor-pointer text-gray-600">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeletingId(child.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition cursor-pointer text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 text-center">
            <h2 className="text-lg font-black mb-2">Delete Category</h2>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure? This action cannot be undone. Products in this category will lose their category.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeletingId(null)}
                className="py-2.5 px-6 text-xs font-bold uppercase rounded-full border border-black hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="py-2.5 px-6 text-xs font-bold uppercase rounded-full bg-red-600 text-white border border-red-600 hover:bg-red-700 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && <Loader className="animate-spin h-3.5 w-3.5" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
