"use client";

import { useState } from "react";
import {
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} from "@/redux/api/order/orderApi";
import {
  Search,
  Eye,
  X,
  AlertCircle,
  Loader,
  Calendar,
  User,
  Phone,
  MapPin,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: ordersData, isLoading: isLoadingOrders, error: ordersError } = useGetAllOrdersQuery();
  const [updateOrderStatus, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusMutation();

  const handleOpenDetails = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      await updateOrderStatus({ id: selectedOrder.id, status: newStatus }).unwrap();
      toast.success("Order status updated successfully");
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to update order status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
      case "PROCESSING":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "SHIPPED":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "DELIVERED":
        return "bg-green-50 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-50 text-red-800 border-red-200";
      default:
        return "bg-gray-50 text-gray-800 border-gray-250";
    }
  };

  const orders = ordersData?.data || [];

  const isGiftCardOrder = (order: any) =>
    order?.giftCard ||
    order?.items?.some(
      (item: any) =>
        item.sku === "E-GIFT-CARD" ||
        item.title?.toLowerCase().includes("gift card")
    );

  // Filter orders
  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch =
      order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
    const matchesMethod =
      methodFilter === "ALL"
        ? true
        : methodFilter === "GIFTCARD"
        ? isGiftCardOrder(order)
        : order.paymentMethod === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  // Calculate paginated slices
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset page when filters change
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleMethodFilterChange = (val: string) => {
    setMethodFilter(val);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (val: number) => {
    setItemsPerPage(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 poppins-regular">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-sm text-gray-500">Track shipping, review sales details, and modify order stages.</p>
      </div>

      {/* Main orders section */}
      {isLoadingOrders ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="animate-spin text-black h-8 w-8" />
        </div>
      ) : ordersError ? (
        <div className="flex gap-2 items-center text-red-600 bg-red-50 p-4 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Failed to load order listings. Validate admin token permissions.</span>
        </div>
      ) : (
        <>
          {/* Filters Toolbar */}
          <div className="border border-gray-200 bg-white p-4 flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Order ID, name or email..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[#006CF9] focus:bg-white transition placeholder-zinc-400"
              />
            </div>

            {/* Status Select */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  className="bg-white border border-zinc-200 text-xs font-bold text-black py-2 px-3 focus:outline-none focus:border-[#006CF9] cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Method Select */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Method:</span>
                <select
                  value={methodFilter}
                  onChange={(e) => handleMethodFilterChange(e.target.value)}
                  className="bg-white border border-zinc-200 text-xs font-bold text-black py-2 px-3 focus:outline-none focus:border-[#006CF9] cursor-pointer"
                >
                  <option value="ALL">All Methods</option>
                  <option value="COD">Cash on Delivery</option>
                  <option value="DIGITAL">Digital Payment</option>
                  <option value="GIFTCARD">🎁 E-Gift Cards</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white border border-gray-200 rounded-none overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-950 text-white text-xs uppercase tracking-widest font-black">
                    <th className="py-4 px-6 font-black">Order ID</th>
                    <th className="py-4 px-6 font-black">Customer</th>
                    <th className="py-4 px-6 font-black">Total Amount</th>
                    <th className="py-4 px-6 font-black">Date</th>
                    <th className="py-4 px-6 font-black">Status</th>
                    <th className="py-4 px-6 text-right font-black">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 text-gray-800">
                  {paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 px-6 text-center text-zinc-400 font-semibold">
                        No orders match the filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition">
                        <td className="py-4 px-6 font-mono text-xs text-gray-500">
                          <div className="flex flex-col gap-1 items-start">
                            <span>{order.id}</span>
                            {isGiftCardOrder(order) && (
                              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                🎁 E-Gift Card
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-900">{order.user?.name || "Anonymous"}</div>
                          <div className="text-xs text-gray-500">{order.user?.email || ""}</div>
                        </td>
                        <td className="py-4 px-6 font-semibold">৳{order.totalAmount.toLocaleString()}</td>
                        <td className="py-4 px-6 text-xs font-medium text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleOpenDetails(order)}
                            className="flex items-center gap-1.5 ml-auto text-xs font-bold border border-black rounded-full hover:bg-black hover:text-white transition py-1.5 px-4 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Bar */}
            {totalItems > 0 && (
              <div className="border-t border-zinc-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
                <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <span>Rows per page:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="bg-white border border-zinc-200 text-black px-2.5 py-1 text-xs focus:outline-none focus:border-[#006CF9] cursor-pointer font-bold"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                  <span>
                    Showing {startIndex + 1}–{endIndex} of {totalItems} orders
                  </span>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-zinc-200 hover:border-black text-black transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 flex items-center justify-center text-xs font-bold border transition cursor-pointer ${
                        currentPage === page
                          ? "bg-[#006CF9] border-[#006CF9] text-white"
                          : "border-zinc-200 hover:border-black text-zinc-600 hover:text-black"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-zinc-200 hover:border-black text-black transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal for Order details & update status */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl animate-fade-in">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                <p className="text-xs text-gray-500 font-mono mt-1">ID: {selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-black transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left/Middle: Items & Address details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Gift Card Highlight Banner if applicable */}
                {isGiftCardOrder(selectedOrder) && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg text-amber-900 font-bold text-lg">🎁</div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black uppercase text-amber-900 tracking-wider">
                        Digital E-Gift Card Order (Auto-Delivered)
                      </h4>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        This is an electronic gift card purchase. The gift voucher code was automatically generated and sent via email directly to the recipient. No physical courier delivery is required.
                      </p>
                      {selectedOrder.giftCard && (
                        <div className="mt-2 pt-2 border-t border-amber-200 text-xs font-mono text-amber-950 flex flex-wrap gap-x-4 gap-y-1">
                          <span><strong>Voucher Code:</strong> {selectedOrder.giftCard.code}</span>
                          <span><strong>Sender:</strong> {selectedOrder.giftCard.senderName}</span>
                          <span><strong>Recipient:</strong> {selectedOrder.giftCard.recipientEmail}</span>
                          <span><strong>Balance:</strong> ৳{selectedOrder.giftCard.balance?.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Delivery info */}
                <div className={`border p-5 rounded-xl space-y-4 ${isGiftCardOrder(selectedOrder) ? "bg-amber-50/30 border-amber-200" : ""}`}>
                  <h3 className="text-xs font-extrabold uppercase text-black tracking-wider flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {isGiftCardOrder(selectedOrder) ? "Digital Delivery Info" : "Shipping & Delivery Address"}
                  </h3>
                  <div className="text-sm space-y-1 font-medium text-gray-700 pl-5.5">
                    <p className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      {selectedOrder.user?.name} ({selectedOrder.user?.email})
                    </p>
                    {isGiftCardOrder(selectedOrder) ? (
                      <>
                        <p className="text-xs font-bold text-amber-900 mt-2">
                          Recipient Email: {selectedOrder.giftCard?.recipientEmail || selectedOrder.shippingAddress?.street}
                        </p>
                        <p className="text-xs text-gray-500 italic">Electronic Delivery via Email (No physical shipping required)</p>
                      </>
                    ) : (
                      <>
                        <p>{selectedOrder.shippingAddress?.street}</p>
                        <p>
                          {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}
                        </p>
                        <p>{selectedOrder.shippingAddress?.country}</p>
                      </>
                    )}
                    <p className="flex items-center gap-2 mt-2 pt-2 border-t text-xs font-bold text-black">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      Phone Contact: {selectedOrder.shippingAddress?.phone}
                    </p>
                  </div>
                </div>

                {/* Products list details */}
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase text-black tracking-wider">Items Ordered</h3>
                  <div className="border rounded-xl overflow-hidden divide-y divide-gray-150">
                    {selectedOrder.items?.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-gray-50/30 hover:bg-gray-50/60 transition">
                        <div>
                          <div className="font-semibold text-gray-900">{item.title}</div>
                          <div className="text-xs text-gray-500 font-medium mt-0.5">
                            SKU: {item.sku} | Size: {item.size} | Color: {item.color}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">৳{(item.price * item.quantity).toLocaleString()}</div>
                          <div className="text-xs text-gray-500 font-medium">
                            ৳{item.price.toLocaleString()} x {item.quantity}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Payment status summary & Update Status */}
              <div className="space-y-6">
                {/* Summary */}
                <div className="border p-5 rounded-xl bg-zinc-50 space-y-4">
                  <h3 className="text-xs font-extrabold uppercase text-black tracking-wider">Payment & Status</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-500">Method</span>
                      <span className="text-gray-900 font-bold uppercase flex items-center gap-1">
                        <CreditCard className="h-3.5 w-3.5 text-gray-400" />
                        {selectedOrder.paymentMethod}
                      </span>
                    </div>
                    {selectedOrder.couponCode && (
                      <>
                        <div className="flex justify-between font-medium pt-2 border-t">
                          <span className="text-gray-500">Voucher Code</span>
                          <span className="text-gray-900 font-bold uppercase font-mono bg-gray-50 border px-2 py-0.5 rounded text-xs">
                            {selectedOrder.couponCode}
                          </span>
                        </div>
                        <div className="flex justify-between font-medium pt-2 border-t text-red-600">
                          <span className="text-red-500">Discount Amount</span>
                          <span className="font-bold">-৳{selectedOrder.discountAmount.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span className="text-gray-500">Total Price</span>
                      <span className="text-black font-black text-base">৳{selectedOrder.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span className="text-gray-500">Placed Date</span>
                      <span className="text-gray-900 font-bold flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        {new Date(selectedOrder.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Update Form */}
                <form onSubmit={handleUpdateStatus} className="border p-5 rounded-xl space-y-4">
                  <h3 className="text-xs font-extrabold uppercase text-black tracking-wider">Update Order Status</h3>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Selected Stage</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-black bg-white"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={isUpdatingStatus || selectedOrder.status === newStatus}
                    className="w-full bg-black text-white hover:bg-zinc-800 transition py-3 rounded-full text-xs font-bold uppercase disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isUpdatingStatus && <Loader className="animate-spin h-3.5 w-3.5" />}
                    Save New Status
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
