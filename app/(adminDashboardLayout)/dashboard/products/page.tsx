"use client";

import { useState } from "react";
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "@/redux/api/product/productApi";
import { useGetCategoriesQuery } from "@/redux/api/category/categoryApi";
import { Search, Plus, Edit, Trash2, X, AlertCircle, Loader } from "lucide-react";
import { toast } from "react-hot-toast";

interface VariantInput {
  size: string;
  color: string;
  sku: string;
  stock: number;
  price?: number;
  isCustomSize?: boolean;
  isCustomColor?: boolean;
}

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [discount, setDiscount] = useState("0");
  const [categoryId, setCategoryId] = useState("");
  const [targetGroup, setTargetGroup] = useState("UNISEX");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesFiles, setImagesFiles] = useState<File[]>([]);
  const [variants, setVariants] = useState<VariantInput[]>([
    { size: "", color: "", sku: "", stock: 10 }
  ]);

  // Queries & Mutations
  const { data: productsData, isLoading: isLoadingProducts, error: productsError } = useGetProductsQuery({
    search,
    page,
    limit: 10
  });

  const { data: categoriesData } = useGetCategoriesQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const getDynamicOptions = (catId: string, group: string) => {
    const defaultRes = {
      sizes: ["S", "M", "L", "XL", "XXL", "2XL"],
      colors: [
        "Black", "White", "Navy", "Blue", "Red", "Green", "Grey", 
        "Yellow", "Pink", "Purple", "Orange", "Maroon", "Olive", 
        "Beige", "Cream", "Mustard", "Multicolor"
      ],
      hasSize: true,
      hasColor: true,
      sizeLabel: "Size",
      colorLabel: "Color"
    };

    if (!catId || !categoriesData?.data) {
      return defaultRes;
    }

    // Find category
    let selectedCat: any = null;
    for (const parent of categoriesData.data) {
      if (parent.id === catId) {
        selectedCat = parent;
        break;
      }
      const child = parent.children?.find((c: any) => c.id === catId);
      if (child) {
        selectedCat = child;
        break;
      }
    }

    if (!selectedCat) {
      return defaultRes;
    }

    const slug = (selectedCat.slug || "").toLowerCase();
    const name = (selectedCat.name || "").toLowerCase();

    // Watches
    if (slug.includes("watch") || name.includes("watch")) {
      return {
        sizes: [],
        colors: ["Gold", "Silver", "Black", "Rose Gold", "Brown", "Grey", "Blue", "Steel"],
        hasSize: false,
        hasColor: true,
        sizeLabel: "Size",
        colorLabel: "Color"
      };
    }

    // Perfumes
    if (slug.includes("perfume") || name.includes("perfume")) {
      return {
        sizes: ["30 ml", "50 ml", "100 ml", "200 ml"],
        colors: [],
        hasSize: true,
        hasColor: false,
        sizeLabel: "Volume (ml)",
        colorLabel: "Color"
      };
    }

    // Belts
    if (slug.includes("belt") || name.includes("belt")) {
      return {
        sizes: ["40", "44", "48"],
        colors: ["Black", "Brown", "Tan", "Grey", "White", "Navy"],
        hasSize: true,
        hasColor: true,
        sizeLabel: "Size (Inches)",
        colorLabel: "Color"
      };
    }

    // Shoes & Footwear
    const isFootwear = 
      slug.includes("shoe") || slug.includes("footwear") || slug.includes("sandal") || slug.includes("canvas") ||
      name.includes("shoe") || name.includes("footwear") || name.includes("sandal") || name.includes("canvas");
    
    if (isFootwear) {
      if (group === "SCHOOL") {
        return {
          sizes: ["3", "4", "5"],
          colors: ["Black", "White", "Brown"],
          hasSize: true,
          hasColor: true,
          sizeLabel: "Size (UK/Apex)",
          colorLabel: "Color"
        };
      }
      return {
        sizes: ["39", "40", "41", "42", "43", "44"],
        colors: ["Black", "White", "Brown", "Tan", "Grey", "Navy", "Blue", "Red", "Green", "Multicolor"],
        hasSize: true,
        hasColor: true,
        sizeLabel: "Size (BD/EU)",
        colorLabel: "Color"
      };
    }

    // Pants/Jeans
    const isPants = 
      slug.includes("pant") || slug.includes("denim") || slug.includes("jeans") ||
      name.includes("pant") || name.includes("denim") || name.includes("jeans");
    
    if (isPants) {
      return {
        sizes: ["28", "30", "32", "34", "36", "38"],
        colors: ["Black", "Blue", "Grey", "Navy", "Brown", "White", "Khaki", "Beige"],
        hasSize: true,
        hasColor: true,
        sizeLabel: "Size (Waist)",
        colorLabel: "Color"
      };
    }

    // Shirt, T-Shirt, Polo, Panjabi, Clothing
    const isClothingTops = 
      slug.includes("shirt") || slug.includes("panjabi") || slug.includes("t-shirt") || slug.includes("polo") || slug.includes("clothing") ||
      name.includes("shirt") || name.includes("t-shirt") || name.includes("panjabi") || name.includes("polo") || name.includes("clothing");
    
    if (isClothingTops) {
      return {
        sizes: ["S", "M", "L", "XL", "XXL", "2XL"],
        colors: [
          "Black", "White", "Navy", "Blue", "Red", "Green", "Grey", 
          "Yellow", "Pink", "Purple", "Orange", "Maroon", "Olive", 
          "Beige", "Cream", "Mustard", "Multicolor"
        ],
        hasSize: true,
        hasColor: true,
        sizeLabel: "Size",
        colorLabel: "Color"
      };
    }

    return defaultRes;
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setTitle("");
    setDescription("");
    setPrice("");
    setCostPrice("");
    setDiscount("0");
    setCategoryId("");
    setTargetGroup("UNISEX");
    setExistingImages([]);
    setImagesFiles([]);
    setVariants([{ size: "", color: "", sku: "", stock: 10 }]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: any) => {
    setEditingProduct(product);
    setTitle(product.title);
    setDescription(product.description);
    setPrice(product.price.toString());
    setCostPrice(product.costPrice?.toString() || "0");
    setDiscount(product.discount.toString());
    setCategoryId(product.categoryId);
    setTargetGroup(product.targetGroup);
    setExistingImages(product.images || []);
    setImagesFiles([]);
    
    setVariants(
      product.variants.map((v: any) => ({
        size: v.size || "",
        color: v.color || "",
        sku: v.sku,
        stock: v.stock,
        price: v.price || undefined,
      }))
    );
    setIsModalOpen(true);
  };

  const handleAddVariantRow = () => {
    setVariants([...variants, { size: "", color: "", sku: "", stock: 10 }]);
  };

  const handleRemoveVariantRow = (index: number) => {
    if (variants.length === 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleToggleSize = (index: number, sizeVal: string) => {
    const updated = [...variants];
    const currentSizes = updated[index].size 
      ? updated[index].size.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];
    
    let nextSizes;
    if (currentSizes.includes(sizeVal)) {
      nextSizes = currentSizes.filter((s: string) => s !== sizeVal);
    } else {
      nextSizes = [...currentSizes, sizeVal];
    }
    updated[index].size = nextSizes.join(", ");
    setVariants(updated);
  };

  const handleToggleColor = (index: number, colorVal: string) => {
    const updated = [...variants];
    const currentColors = updated[index].color 
      ? updated[index].color.split(",").map((c: string) => c.trim()).filter(Boolean)
      : [];
    
    let nextColors;
    if (currentColors.includes(colorVal)) {
      nextColors = currentColors.filter((c: string) => c !== colorVal);
    } else {
      nextColors = [...currentColors, colorVal];
    }
    updated[index].color = nextColors.join(", ");
    setVariants(updated);
  };

  const handleVariantChange = (index: number, field: keyof VariantInput, value: any) => {
    const updated = [...variants];
    if (field === "stock") {
      (updated[index] as any)[field] = parseInt(value) || 0;
    } else if (field === "price") {
      (updated[index] as any)[field] = value ? parseFloat(value) : undefined;
    } else {
      (updated[index] as any)[field] = value;
    }
    setVariants(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setImagesFiles((prev) => [...prev, ...selected]);
    }
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleRemoveNewUpload = (index: number) => {
    setImagesFiles(imagesFiles.filter((_, i) => i !== index));
  };

  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!deletingProductId) return;
    try {
      await deleteProduct(deletingProductId).unwrap();
      toast.success("Product deleted successfully");
      setDeletingProductId(null);
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to delete product");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !price || !costPrice || !categoryId) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (variants.some(v => !v.sku)) {
      toast.error("Please specify a SKU for every variant row");
      return;
    }

    const opts = getDynamicOptions(categoryId, targetGroup);
    const cleanedVariants = variants.map(v => ({
      sku: v.sku,
      stock: v.stock,
      price: v.price,
      size: opts.hasSize ? v.size : "",
      color: opts.hasColor ? v.color : "",
    }));

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("costPrice", costPrice);
    formData.append("discount", discount);
    formData.append("categoryId", categoryId);
    formData.append("targetGroup", targetGroup);
    formData.append("variants", JSON.stringify(cleanedVariants));

    // Append remaining existing images if editing
    if (editingProduct) {
      if (existingImages.length === 0) {
        formData.append("images", "");
      } else {
        existingImages.forEach(img => {
          formData.append("images", img);
        });
      }
    }

    // Append newly selected uploads
    imagesFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct.id, body: formData }).unwrap();
        toast.success("Product updated successfully");
      } else {
        await createProduct(formData).unwrap();
        toast.success("Product created successfully");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.data?.message || "Operation failed");
    }
  };

  const getMarginBadgeClass = (m: number) => {
    if (m >= 30) return "bg-green-50 text-green-800 border-green-200";
    if (m >= 0) return "bg-yellow-50 text-yellow-800 border-yellow-200";
    return "bg-red-50 text-red-800 border-red-200";
  };

  const getCategoryFormConfig = () => {
    if (!categoryId || !categoriesData?.data) {
      return { sizeLabel: "Size (optional)", sizePlaceholder: "e.g. 10 or M" };
    }
    
    // Find category
    let selectedCat: any = null;
    for (const parent of categoriesData.data) {
      if (parent.id === categoryId) {
        selectedCat = parent;
        break;
      }
      const child = parent.children?.find((c: any) => c.id === categoryId);
      if (child) {
        selectedCat = child;
        break;
      }
    }

    if (!selectedCat) {
      return { sizeLabel: "Size (optional)", sizePlaceholder: "e.g. 10 or M" };
    }

    const slug = selectedCat.slug || "";
    
    if (slug === "perfumes" || slug.includes("perfume")) {
      return { sizeLabel: "Volume (ml) (optional)", sizePlaceholder: "e.g. 100ml or 50ml" };
    }
    
    if (
      slug.includes("shoes") ||
      slug.includes("sandals") ||
      slug.includes("canvas") ||
      slug.includes("boots") ||
      slug.includes("footwear")
    ) {
      return { sizeLabel: "Size (US/EU/UK) (optional)", sizePlaceholder: "e.g. US 10 / EU 44" };
    }

    if (
      slug.includes("shirt") ||
      slug.includes("pants") ||
      slug.includes("denim") ||
      slug.includes("clothing") ||
      slug.includes("tops") ||
      slug.includes("dress")
    ) {
      return { sizeLabel: "Size (S/M/L/XL) (optional)", sizePlaceholder: "e.g. M or L" };
    }

    return { sizeLabel: "Size (optional)", sizePlaceholder: "e.g. Standard" };
  };

  const formConfig = getCategoryFormConfig();

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
          <p className="text-sm text-gray-500">Add, edit, or delete items in your catalog.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 rounded-lg bg-black text-white hover:bg-zinc-800 transition py-2.5 px-5 text-sm font-semibold cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Search & filters */}
      <div className="flex items-center relative max-w-md">
        <span className="absolute left-3 text-gray-400">
          <Search className="h-4.5 w-4.5" />
        </span>
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full bg-gray-50 border border-gray-250 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:bg-white focus:border-black transition"
        />
      </div>

      {/* Main product table list */}
      {isLoadingProducts ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="animate-spin text-black h-8 w-8" />
        </div>
      ) : productsError ? (
        <div className="flex gap-2 items-center text-red-600 bg-red-50 p-4 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Failed to load product data. Check connection.</span>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Cost Price</th>
                  <th className="py-4 px-6">Selling Price</th>
                  <th className="py-4 px-6">Profit Margin</th>
                  <th className="py-4 px-6">Stock</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 text-gray-800">
                {productsData?.data?.map((product: any) => {
                  const totalStock = product.variants?.reduce((acc: number, v: any) => acc + v.stock, 0) || 0;
                  const cost = product.costPrice || 0;
                  const priceVal = product.price || 0;
                  const margin = priceVal > 0 ? ((priceVal - cost) / priceVal) * 100 : 0;
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden border bg-gray-50">
                          {product.images && product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="object-cover h-full w-full"
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-200"></div>
                          )}
                        </div>
                        <div className="font-semibold">{product.title}</div>
                      </td>
                      <td className="py-4 px-6">{product.category?.name || "N/A"}</td>
                      <td className="py-4 px-6 font-medium text-gray-500">${cost.toFixed(2)}</td>
                      <td className="py-4 px-6 font-semibold text-gray-900">${priceVal.toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${getMarginBadgeClass(margin)}`}>
                          {margin.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold">{totalStock} units</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2.5">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-2 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 transition cursor-pointer"
                          >
                            <Edit className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => setDeletingProductId(product.id)}
                            className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {productsData?.totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
              <span className="text-xs text-gray-500 font-semibold">
                Page {page} of {productsData.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 border rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-white transition cursor-pointer"
                >
                  Previous
                </button>
                <button
                  disabled={page === productsData.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 border rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-white transition cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal for adding/editing product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="relative bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl animate-fade-in">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-black transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Product Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Nike Air Zoom Pegasus 40"
                    className="w-full border rounded-lg py-2 px-3.5 text-sm focus:outline-none focus:border-black"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="w-full border rounded-lg py-2 px-3.5 text-sm focus:outline-none focus:border-black bg-white"
                  >
                    <option value="">Select Category</option>
                    {categoriesData?.data?.map((parent: any) => [
                      <option key={parent.id} value={parent.id} className="font-bold text-black bg-gray-100">
                        {parent.name} (Parent)
                      </option>,
                      ...(parent.children || []).map((child: any) => (
                        <option key={child.id} value={child.id} className="pl-4 text-gray-700">
                          &nbsp;&nbsp;&mdash;&nbsp;{child.name}
                        </option>
                      ))
                    ])}
                  </select>
                </div>

                {/* Cost Price */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Cost Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    required
                    placeholder="80.00"
                    className="w-full border rounded-lg py-2 px-3.5 text-sm focus:outline-none focus:border-black"
                  />
                </div>

                {/* Base Selling Price */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Selling Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    placeholder="120.00"
                    className="w-full border rounded-lg py-2 px-3.5 text-sm focus:outline-none focus:border-black"
                  />
                </div>

                {/* Discount Percentage */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Discount Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full border rounded-lg py-2 px-3.5 text-sm focus:outline-none focus:border-black"
                  />
                </div>

                {/* Target Group */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Target Group *</label>
                  <select
                    value={targetGroup}
                    onChange={(e) => setTargetGroup(e.target.value)}
                    className="w-full border rounded-lg py-2 px-3.5 text-sm focus:outline-none focus:border-black bg-white"
                  >
                    <option value="MEN">Men</option>
                    <option value="WOMEN">Women</option>
                    <option value="KIDS">Kids</option>
                    <option value="UNISEX">Unisex</option>
                    <option value="OTHERS">Others</option>
                    <option value="SCHOOL">School</option>
                    <option value="SPORTS">Sports</option>
                  </select>
                </div>

                {/* Images Section */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Product Images</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200 cursor-pointer"
                    />
                  </div>

                  {/* Previews of Existing Images (if editing) */}
                  {existingImages.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-500 uppercase">Existing Images ({existingImages.length})</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {existingImages.map((img, idx) => (
                          <div key={idx} className="relative aspect-square border rounded-lg overflow-hidden bg-gray-50 group">
                            <img src={img} alt="Product view" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingImage(idx)}
                              className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow cursor-pointer opacity-90 group-hover:opacity-100"
                              title="Remove image"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Previews of Newly Selected Uploads */}
                  {imagesFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-500 uppercase">New Uploads ({imagesFiles.length})</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {imagesFiles.map((file, idx) => {
                          const url = URL.createObjectURL(file);
                          return (
                            <div key={idx} className="relative aspect-square border rounded-lg overflow-hidden bg-gray-50 group">
                              <img src={url} alt="Selected upload" className="h-full w-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handleRemoveNewUpload(idx)}
                                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow cursor-pointer opacity-90 group-hover:opacity-100"
                                title="Remove image"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Product Description *</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Describe the product details, features, style, and utility parameters."
                  className="w-full border rounded-lg py-2 px-3.5 text-sm focus:outline-none focus:border-black"
                />
              </div>

              {/* Dynamic Variants Form */}
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase text-black tracking-wide">Product Variants *</h3>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="text-xs font-bold text-black border border-black rounded-full hover:bg-black hover:text-white py-1.5 px-4 transition cursor-pointer"
                  >
                    Add Variant Row
                  </button>
                </div>

                <div className="space-y-4">
                  {(() => {
                    const dynamicOpts = getDynamicOptions(categoryId, targetGroup);
                    return variants.map((v, idx) => {
                      return (
                        <div key={idx} className="bg-gray-50 border border-gray-200 p-5 rounded-xl relative space-y-4 shadow-sm">
                          {/* Remove Button in corner */}
                          {variants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveVariantRow(idx)}
                              className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition cursor-pointer"
                              title="Remove Variant"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Size selection */}
                            {dynamicOpts.hasSize ? (
                              <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase text-gray-700">
                                  {dynamicOpts.sizeLabel} * (Select multiple)
                                </label>
                                <div className="flex flex-wrap gap-1.5 p-1 bg-white border rounded-lg min-h-[40px] items-center">
                                  {dynamicOpts.sizes.map((s) => {
                                    const isSelected = v.size 
                                      ? v.size.split(",").map(x => x.trim()).includes(s) 
                                      : false;
                                    return (
                                      <button
                                        type="button"
                                        key={s}
                                        onClick={() => handleToggleSize(idx, s)}
                                        className={`px-2.5 py-1 text-xs border rounded-md font-semibold transition cursor-pointer ${
                                          isSelected
                                            ? "bg-black text-white border-black"
                                            : "bg-gray-50 text-gray-700 border-gray-200 hover:border-black"
                                        }`}
                                      >
                                        {s}
                                      </button>
                                    );
                                  })}
                                </div>
                                <input
                                  type="text"
                                  value={v.size || ""}
                                  placeholder="Or type custom size(s) separated by commas"
                                  onChange={(e) => handleVariantChange(idx, "size", e.target.value)}
                                  className="w-full bg-white border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-black"
                                />
                              </div>
                            ) : (
                              <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Size</label>
                                <div className="text-gray-400 text-xs py-2 px-3 bg-gray-100 rounded-lg border">Not applicable for watches</div>
                              </div>
                            )}

                            {/* Color selection */}
                            {dynamicOpts.hasColor ? (
                              <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase text-gray-700">
                                  {dynamicOpts.colorLabel} (optional, select multiple)
                                </label>
                                <div className="flex flex-wrap gap-1.5 p-1 bg-white border rounded-lg min-h-[40px] items-center">
                                  {dynamicOpts.colors.map((c) => {
                                    const isSelected = v.color 
                                      ? v.color.split(",").map(x => x.trim()).includes(c) 
                                      : false;
                                    return (
                                      <button
                                        type="button"
                                        key={c}
                                        onClick={() => handleToggleColor(idx, c)}
                                        className={`px-2.5 py-1 text-xs border rounded-md font-semibold transition cursor-pointer ${
                                          isSelected
                                            ? "bg-black text-white border-black"
                                            : "bg-gray-50 text-gray-700 border-gray-200 hover:border-black"
                                        }`}
                                      >
                                        {c}
                                      </button>
                                    );
                                  })}
                                </div>
                                <input
                                  type="text"
                                  value={v.color || ""}
                                  placeholder="Or type custom color(s) separated by commas"
                                  onChange={(e) => handleVariantChange(idx, "color", e.target.value)}
                                  className="w-full bg-white border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-black"
                                />
                              </div>
                            ) : (
                              <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Color</label>
                                <div className="text-gray-400 text-xs py-2 px-3 bg-gray-100 rounded-lg border">Not applicable for perfumes</div>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            {/* SKU */}
                            <div>
                              <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">SKU *</label>
                              <input
                                type="text"
                                required
                                value={v.sku}
                                placeholder="e.g. AM90-BLK-10"
                                onChange={(e) => handleVariantChange(idx, "sku", e.target.value)}
                                className="w-full bg-white border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-black"
                              />
                            </div>

                            {/* Stock */}
                            <div>
                              <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Stock *</label>
                              <input
                                type="number"
                                required
                                min="0"
                                value={v.stock}
                                onChange={(e) => handleVariantChange(idx, "stock", e.target.value)}
                                className="w-full bg-white border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-black"
                              />
                            </div>
                          </div>

                        </div>
                      );
                    });
                  })()}
                </div>
          </div>

              {/* Submit actions */}
              <div className="flex justify-end gap-3 border-t pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="border rounded-full border-black hover:bg-gray-50 py-3 px-8 text-xs font-bold uppercase transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="bg-black text-white hover:bg-zinc-800 transition py-3 px-8 text-xs font-bold uppercase rounded-full border border-black disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {(isCreating || isUpdating) && <Loader className="animate-spin h-3.5 w-3.5" />}
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Product</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to permanently delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingProductId(null)}
                className="border border-black rounded-full hover:bg-gray-50 py-2.5 px-6 text-xs font-bold uppercase transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="bg-red-600 text-white hover:bg-red-700 transition py-2.5 px-6 text-xs font-bold uppercase rounded-full border border-red-600 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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
