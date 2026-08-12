"use client";

import { useState } from "react";
import { useSubmitQuotationMutation } from "@/redux/api/quotation/quotationApi";
import { Plus, Trash2, Loader, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

interface QuotationItem {
  sku: string;
  description: string;
  uom: string;
  quantity: number;
}

export default function QuotationPage() {
  const [submitQuotation, { isLoading }] = useSubmitQuotationMutation();
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    contactPerson: "",
    mobile: "",
    email: "",
    billingAddress: "",
    shippingAddress: "",
    comment: "",
  });

  const [items, setItems] = useState<QuotationItem[]>([
    { sku: "", description: "", uom: "PCS", quantity: 1 },
  ]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = (index: number, field: keyof QuotationItem, value: string | number) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, { sku: "", description: "", uom: "PCS", quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName || !form.contactPerson || !form.mobile || !form.email) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const validItems = items.filter((it) => it.sku.trim());
    if (validItems.length === 0) {
      toast.error("Please add at least one product item with a SKU.");
      return;
    }
    try {
      await submitQuotation({ ...form, items: validItems }).unwrap();
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit quotation. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-zinc-200 p-10 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-black uppercase text-black tracking-tight">Quotation Submitted!</h2>
          <p className="text-sm text-zinc-500">
            Thank you! Your quotation request has been received. Our team will review it and get back to you shortly.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setForm({ companyName: "", contactPerson: "", mobile: "", email: "", billingAddress: "", shippingAddress: "", comment: "" });
              setItems([{ sku: "", description: "", uom: "PCS", quantity: 1 }]);
            }}
            className="bg-black hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-wider py-3 px-6 rounded-full transition cursor-pointer"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Wholesale & Bulk Orders</p>
          <h1 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tight leading-tight">Request a Quotation</h1>
          <p className="text-zinc-500 mt-3 text-base">
            Looking to order in bulk? Fill in the form below and our team will provide a custom pricing quote within 24 hours.
          </p>
          <div className="w-16 h-1 bg-black mt-5" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Info */}
          <div className="bg-white border border-zinc-200 p-6 space-y-5">
            <h2 className="text-sm font-black text-black uppercase tracking-widest border-b border-zinc-100 pb-3">Company & Contact Info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { field: "companyName", label: "Company Name *", type: "text" },
                { field: "contactPerson", label: "Contact Person *", type: "text" },
                { field: "mobile", label: "Mobile Number *", type: "tel" },
                { field: "email", label: "Email Address *", type: "email" },
              ].map(({ field, label, type }) => (
                <div key={field}>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={form[field as keyof typeof form]}
                    onChange={(e) => updateField(field, e.target.value)}
                    className="w-full border border-zinc-300 p-3.5 text-sm focus:outline-none focus:border-black placeholder-zinc-400"
                    placeholder={label.replace(" *", "")}
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Billing Address</label>
                <textarea rows={2} value={form.billingAddress} onChange={(e) => updateField("billingAddress", e.target.value)}
                  className="w-full border border-zinc-300 p-3.5 text-sm focus:outline-none focus:border-black placeholder-zinc-400 resize-none"
                  placeholder="Billing address" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Shipping Address</label>
                <textarea rows={2} value={form.shippingAddress} onChange={(e) => updateField("shippingAddress", e.target.value)}
                  className="w-full border border-zinc-300 p-3.5 text-sm focus:outline-none focus:border-black placeholder-zinc-400 resize-none"
                  placeholder="Shipping address" />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white border border-zinc-200 p-6 space-y-4">
            <h2 className="text-sm font-black text-black uppercase tracking-widest border-b border-zinc-100 pb-3">Product Items</h2>
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-3">
                  {index === 0 && <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">SKU</label>}
                  <input type="text" value={item.sku} onChange={(e) => updateItem(index, "sku", e.target.value)}
                    className="w-full border border-zinc-300 p-3 text-sm focus:outline-none focus:border-black"
                    placeholder="e.g. PR-001" />
                </div>
                <div className="col-span-4">
                  {index === 0 && <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Description</label>}
                  <input type="text" value={item.description} onChange={(e) => updateItem(index, "description", e.target.value)}
                    className="w-full border border-zinc-300 p-3 text-sm focus:outline-none focus:border-black"
                    placeholder="Product description" />
                </div>
                <div className="col-span-2">
                  {index === 0 && <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">UOM</label>}
                  <select value={item.uom} onChange={(e) => updateItem(index, "uom", e.target.value)}
                    className="w-full border border-zinc-300 p-3 text-sm focus:outline-none focus:border-black bg-white">
                    {["PCS", "PAIR", "SET", "DOZEN", "BOX"].map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  {index === 0 && <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Quantity</label>}
                  <input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                    className="w-full border border-zinc-300 p-3 text-sm focus:outline-none focus:border-black" />
                </div>
                <div className="col-span-1 pb-0.5">
                  <button type="button" onClick={() => removeItem(index)} disabled={items.length === 1}
                    className="w-full flex items-center justify-center p-3 text-red-400 hover:bg-red-50 border border-red-100 transition cursor-pointer disabled:opacity-30">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addItem}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-black border border-zinc-300 px-4 py-2.5 hover:bg-zinc-50 transition cursor-pointer">
              <Plus className="h-3.5 w-3.5" /> Add Item
            </button>
          </div>

          {/* Comment */}
          <div className="bg-white border border-zinc-200 p-6 space-y-3">
            <h2 className="text-sm font-black text-black uppercase tracking-widest border-b border-zinc-100 pb-3">Additional Notes</h2>
            <textarea rows={4} value={form.comment} onChange={(e) => updateField("comment", e.target.value)}
              className="w-full border border-zinc-300 p-3.5 text-sm focus:outline-none focus:border-black placeholder-zinc-400 resize-none"
              placeholder="Any additional requirements, delivery deadlines, or special instructions..." />
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 disabled:bg-zinc-400 text-white text-sm font-black uppercase tracking-wider py-4 transition cursor-pointer">
            {isLoading ? <Loader className="animate-spin h-5 w-5" /> : null}
            {isLoading ? "Submitting..." : "Submit Quotation Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
