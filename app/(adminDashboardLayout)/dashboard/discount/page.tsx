"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Plus, Pencil, Trash2, Loader, X, Tag, Calendar, AlertCircle, Copy } from "lucide-react";
import {
  useGetAllDiscountsQuery,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
} from "@/redux/api/discount/discountApi";

interface DiscountFormState {
  code: string;
  discountValue: string;
  type: "PERCENTAGE" | "FIXED";
  minSpend: string;
  expiryDate: string;
  isActive: boolean;
}

const defaultForm: DiscountFormState = {
  code: "",
  discountValue: "",
  type: "PERCENTAGE",
  minSpend: "0",
  expiryDate: "",
  isActive: true,
};

export default function AdminDiscountsPage() {
  const { data: discountsData, isLoading: isLoadingList, error: listError } = useGetAllDiscountsQuery();
  const [createDiscount, { isLoading: isCreating }] = useCreateDiscountMutation();
  const [updateDiscount, { isLoading: isUpdating }] = useUpdateDiscountMutation();
  const [deleteDiscount, { isLoading: isDeleting }] = useDeleteDiscountMutation();

  const [form, setForm] = useState<DiscountFormState>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const discounts = discountsData?.data ?? [];

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
    setShowForm(false);
  };

  const openEdit = (discount: any) => {
    let formattedDate = "";
    if (discount.expiryDate) {
      formattedDate = new Date(discount.expiryDate).toISOString().split("T")[0];
    }
    setForm({
      code: discount.code,
      discountValue: discount.discountValue.toString(),
      type: discount.type as "PERCENTAGE" | "FIXED",
      minSpend: discount.minSpend.toString(),
      expiryDate: formattedDate,
      isActive: discount.isActive,
    });
    setEditingId(discount.id);
    setShowForm(true);
  };

  const handleToggleStatus = async (discount: any) => {
    try {
      await updateDiscount({
        id: discount.id,
        isActive: !discount.isActive,
      }).unwrap();
      toast.success(`Discount ${!discount.isActive ? "activated" : "deactivated"}`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update discount status");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) return toast.error("Code is required.");
    if (!form.discountValue || parseFloat(form.discountValue) <= 0) {
      return toast.error("Discount value must be greater than 0.");
    }

    const payload: any = {
      code: form.code.trim().toUpperCase(),
      discountValue: parseFloat(form.discountValue),
      type: form.type,
      minSpend: parseFloat(form.minSpend || "0"),
      isActive: form.isActive,
      expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : null,
    };

    try {
      if (editingId) {
        await updateDiscount({ id: editingId, ...payload }).unwrap();
        toast.success("Discount code updated!");
      } else {
        await createDiscount(payload).unwrap();
        toast.success("Discount code created!");
      }
      resetForm();
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong.");
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteDiscount(deletingId).unwrap();
      toast.success("Discount deleted.");
      setDeletingId(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not delete.");
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans" style={{ fontFamily: '"Helvetica Neue", sans-serif' }}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Discounts & Coupons</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage customer promotion codes, expiration constraints, and minimum purchase requirements.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-black text-white hover:bg-zinc-800 font-bold py-2.5 px-5 rounded-full text-xs transition cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Create Coupon
          </button>
        )}
      </div>

      {/* Main Grid: Form Left / Table Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form container */}
        {showForm && (
          <div className="lg:col-span-4 bg-gray-50 border border-gray-150 p-5 rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-900">
                {editingId ? "Edit Coupon" : "Create Coupon"}
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-black transition">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EID2026"
                  value={form.code}
                  onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-black bg-white uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as "PERCENTAGE" | "FIXED" }))}
                    className="w-full border rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:border-black bg-white appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: "right 0.5rem center",
                      backgroundSize: "1.25rem",
                      backgroundRepeat: "no-repeat"
                    }}
                  >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED">Fixed (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Value</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    placeholder={form.type === "PERCENTAGE" ? "25" : "500"}
                    value={form.discountValue}
                    onChange={(e) => setForm((prev) => ({ ...prev, discountValue: e.target.value }))}
                    className="w-full border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-black bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Min Buy Amount (৳)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.minSpend}
                  onChange={(e) => setForm((prev) => ({ ...prev, minSpend: e.target.value }))}
                  className="w-full border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-black bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Expiration Date (Optional)</label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, expiryDate: e.target.value }))}
                  className="w-full border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-black bg-white font-mono"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 accent-black"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-gray-700 uppercase cursor-pointer select-none">
                  Settle as Active Code
                </label>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 border rounded-full py-2 text-xs font-bold uppercase transition hover:bg-gray-100 text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="flex-1 bg-black text-white hover:bg-zinc-800 rounded-full py-2 text-xs font-bold uppercase disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {(isCreating || isUpdating) && <Loader className="animate-spin h-3.5 w-3.5" />}
                  {editingId ? "Save Change" : "Create Code"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List table container */}
        <div className={showForm ? "lg:col-span-8" : "lg:col-span-12"}>
          {isLoadingList ? (
            <div className="flex justify-center items-center py-20 bg-gray-50/50 rounded-xl border">
              <Loader className="animate-spin text-black h-8 w-8" />
            </div>
          ) : listError ? (
            <div className="flex gap-2 items-center text-red-600 bg-red-50 p-4 rounded-lg border border-red-100">
              <AlertCircle className="h-5 w-5" />
              <span className="text-xs font-semibold">Failed to retrieve coupon lists. Check database connections.</span>
            </div>
          ) : discounts.length === 0 ? (
            <div className="text-center py-16 bg-gray-50/50 rounded-xl border border-dashed flex flex-col items-center justify-center text-gray-400">
              <Tag className="h-10 w-10 text-gray-300 mb-2" />
              <p className="text-sm font-semibold">No coupon codes registered yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-3 text-xs font-bold uppercase bg-black hover:bg-zinc-800 text-white py-2 px-4 rounded-full transition"
              >
                Create First Code
              </button>
            </div>
          ) : (
            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b text-gray-500 font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4 font-bold">Code</th>
                      <th className="py-3.5 px-4 font-bold">Discount</th>
                      <th className="py-3.5 px-4 font-bold">Min Spend</th>
                      <th className="py-3.5 px-4 font-bold">Expiration</th>
                      <th className="py-3.5 px-4 font-bold">Status</th>
                      <th className="py-3.5 px-4 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-gray-700 font-medium">
                    {discounts.map((discount: any) => {
                      const isExpired = discount.expiryDate && new Date() > new Date(discount.expiryDate);

                      return (
                        <tr key={discount.id} className="hover:bg-gray-50/30 transition">
                           <td className="py-4 px-4">
                             <span
                               onClick={() => {
                                 navigator.clipboard.writeText(discount.code);
                                 toast.success(`Coupon "${discount.code}" copied to clipboard!`);
                               }}
                               className="font-mono font-bold text-gray-900 text-sm cursor-pointer hover:text-green-700 transition-colors inline-flex items-center gap-1.5 group"
                               title="Click to copy coupon code"
                             >
                               {discount.code}
                               <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
                             </span>
                           </td>
                          <td className="py-4 px-4 font-bold">
                            {discount.type === "PERCENTAGE" 
                              ? `${discount.discountValue}% Off` 
                              : `৳${discount.discountValue.toLocaleString()} Off`
                            }
                          </td>
                          <td className="py-4 px-4 text-gray-500">
                            ৳{discount.minSpend.toLocaleString()}
                          </td>
                          <td className="py-4 px-4 font-mono text-gray-500">
                            {discount.expiryDate ? (
                              <span className={`inline-flex items-center gap-1 ${isExpired ? "text-red-500 font-semibold" : ""}`}>
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(discount.expiryDate).toLocaleDateString()}
                                {isExpired && " (Expired)"}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => handleToggleStatus(discount)}
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition cursor-pointer ${
                                discount.isActive && !isExpired
                                  ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                  : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                              }`}
                            >
                              {discount.isActive && !isExpired ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex justify-end gap-2.5">
                              <button
                                onClick={() => openEdit(discount)}
                                className="p-1.5 border border-gray-200 rounded-full hover:border-black text-gray-600 hover:text-black transition cursor-pointer"
                                title="Edit"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setDeletingId(discount.id)}
                                className="p-1.5 border border-gray-200 rounded-full hover:border-red-600 text-gray-600 hover:text-red-600 transition cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black uppercase text-gray-900">Are you sure?</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              This action cannot be undone. Any orders currently containing this coupon code will retain their discounts, but new orders will not be able to use it.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 border rounded-full py-2.5 text-xs font-bold uppercase transition hover:bg-gray-50 cursor-pointer"
              >
                Go Back
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-full py-2.5 text-xs font-bold uppercase disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isDeleting && <Loader className="animate-spin h-3.5 w-3.5" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
