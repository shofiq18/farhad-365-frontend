"use client";

import { useState } from "react";
import {
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} from "@/redux/api/order/orderApi";
import { Search, Eye, X, AlertCircle, Loader, Calendar, User, Phone, MapPin, CreditCard } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");

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

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-sm text-gray-500">Track shipping, review sales details, and modify order stages.</p>
      </div>

      {/* Main orders table */}
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
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 text-gray-800">
                {ordersData?.data?.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-6 font-mono text-xs text-gray-500">
                      {order.id}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">{order.user?.name || "Anonymous"}</div>
                      <div className="text-xs text-gray-500">{order.user?.email || ""}</div>
                    </td>
                    <td className="py-4 px-6 font-semibold">${order.totalAmount.toFixed(2)}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
                
                {/* Shipping info */}
                <div className="border p-5 rounded-xl space-y-4">
                  <h3 className="text-xs font-extrabold uppercase text-black tracking-wider flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    Shipping & Delivery Address
                  </h3>
                  <div className="text-sm space-y-1 font-medium text-gray-700 pl-5.5">
                    <p className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      {selectedOrder.user?.name}
                    </p>
                    <p>{selectedOrder.shippingAddress?.street}</p>
                    <p>
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}
                    </p>
                    <p>{selectedOrder.shippingAddress?.country}</p>
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
                          <div className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
                          <div className="text-xs text-gray-500 font-medium">
                            ${item.price.toFixed(2)} x {item.quantity}
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
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span className="text-gray-500">Total Price</span>
                      <span className="text-black font-black text-base">${selectedOrder.totalAmount.toFixed(2)}</span>
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
