"use client";

import { useState } from "react";
import { useGetAllOrdersQuery } from "@/redux/api/order/orderApi";
import {
  Loader,
  Search,
  CreditCard,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
  Receipt,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const METHOD_LABELS: Record<string, string> = {
  COD: "Cash on Delivery",
  DIGITAL: "Digital Payment (bKash/SSL)",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PAID: "bg-green-50 text-green-700 border border-green-200",
  PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
  FAILED: "bg-red-50 text-red-700 border border-red-200",
};

export default function PaymentHistoryPage() {
  const { data: ordersData, isLoading } = useGetAllOrdersQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const orders = ordersData?.data || [];

  // Helper to determine payment status based on order status & method
  const getPaymentStatus = (order: any) => {
    if (order.status === "CANCELLED") return "FAILED";
    if (order.paymentMethod === "COD") {
      // COD is paid on delivery, so if status is DELIVERED it is PAID, else it is PENDING
      return order.status === "DELIVERED" ? "PAID" : "PENDING";
    }
    // Digital payment is paid before processing, so if order status is anything but PENDING (like PROCESSING/SHIPPED/DELIVERED), it is PAID.
    return order.status === "PENDING" ? "PENDING" : "PAID";
  };

  // Filter orders based on query, payment method, and calculated payment status
  const filteredOrders = orders.filter((order: any) => {
    const paymentStatus = getPaymentStatus(order);
    const matchesSearch =
      order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.userId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMethod = methodFilter === "ALL" || order.paymentMethod === methodFilter;
    const matchesStatus = statusFilter === "ALL" || paymentStatus === statusFilter;

    return matchesSearch && matchesMethod && matchesStatus;
  });

  // Calculate paginated slices
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Calculate high level stats from all orders
  const totalProcessedCount = orders.length;
  const totalPaidRevenue = orders
    .filter((order: any) => getPaymentStatus(order) === "PAID")
    .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

  const totalPendingAmount = orders
    .filter((order: any) => getPaymentStatus(order) === "PENDING")
    .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

  // Reset page when filters change
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleMethodChange = (val: string) => {
    setMethodFilter(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (val: number) => {
    setItemsPerPage(val);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader className="animate-spin h-8 w-8 text-zinc-400" />
      </div>
    );
  }

  // Handle Export to CSV
  const handleExport = () => {
    const headers = ["Payment ID", "Customer Name", "Customer Email", "Method", "Amount", "Status", "Date"];
    const rows = filteredOrders.map((order: any) => [
      order.id || order._id,
      order.user?.name || "N/A",
      order.user?.email || "N/A",
      order.paymentMethod,
      order.totalAmount,
      getPaymentStatus(order),
      order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row: any[]) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payment_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-10 poppins-regular">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">Billing</p>
          <h1 className="text-3xl font-black text-black uppercase tracking-tight">Payment History</h1>
          <p className="text-sm text-zinc-500 mt-1">Audit and track customer payments, invoices, and transaction statuses.</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 bg-[#006CF9] hover:bg-[#0056c6] text-white font-bold text-xs uppercase tracking-wider py-3.5 px-6 transition rounded-none cursor-pointer self-start sm:self-center"
        >
          <Download className="h-4 w-4" /> Export Report
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Volume */}
        <div className="border border-zinc-200 bg-white p-6 rounded-none flex items-center gap-5">
          <div className="p-3.5 bg-blue-50 text-[#006CF9]">
            <Receipt className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Total Payments</span>
            <span className="text-xl font-black text-black block mt-0.5">{totalProcessedCount} Transactions</span>
          </div>
        </div>

        {/* Total Settled */}
        <div className="border border-zinc-200 bg-white p-6 rounded-none flex items-center gap-5">
          <div className="p-3.5 bg-green-50 text-green-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Succeeded / Paid</span>
            <span className="text-xl font-black text-black block mt-0.5">৳{totalPaidRevenue.toLocaleString()}</span>
          </div>
        </div>

        {/* Total Outstanding */}
        <div className="border border-zinc-200 bg-white p-6 rounded-none flex items-center gap-5">
          <div className="p-3.5 bg-amber-50 text-amber-600">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Unpaid / Outstanding</span>
            <span className="text-xl font-black text-black block mt-0.5">৳{totalPendingAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="border border-zinc-200 bg-white p-5 mb-8 flex flex-col md:flex-row md:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by Payment ID, customer name or email..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#006CF9] focus:bg-white transition placeholder-zinc-400"
          />
        </div>

        {/* Method filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Method:</span>
            <select
              value={methodFilter}
              onChange={(e) => handleMethodChange(e.target.value)}
              className="bg-white border border-zinc-200 text-xs font-bold text-black py-2.5 px-4 focus:outline-none focus:border-[#006CF9] cursor-pointer"
            >
              <option value="ALL">All Methods</option>
              <option value="COD">Cash on Delivery (COD)</option>
              <option value="DIGITAL">Digital (bKash/SSL)</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-white border border-zinc-200 text-xs font-bold text-black py-2.5 px-4 focus:outline-none focus:border-[#006CF9] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="border border-zinc-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-950 text-white text-xs uppercase tracking-widest">
              <tr>
                <th className="px-5 py-4 text-left font-black">Transaction ID</th>
                <th className="px-5 py-4 text-left font-black">Customer Name</th>
                <th className="px-5 py-4 text-left font-black">Payment Method</th>
                <th className="px-5 py-4 text-left font-black">Amount</th>
                <th className="px-5 py-4 text-left font-black">Status</th>
                <th className="px-5 py-4 text-left font-black">Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-zinc-400 font-semibold">
                    No transactions matching the criteria.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order: any) => {
                  const status = getPaymentStatus(order);
                  return (
                    <tr key={order.id || order._id} className="border-t border-zinc-100 hover:bg-zinc-50 transition">
                      <td className="px-5 py-4 font-bold text-[#006CF9] hover:underline cursor-pointer">
                        <Link href={`/dashboard/orders`}>
                          {order.id || order._id}
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-black">{order.user?.name || "Anonymous"}</span>
                          <span className="text-[11px] text-zinc-400">{order.user?.email || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-zinc-500 font-semibold text-xs">
                        {METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
                      </td>
                      <td className="px-5 py-4 font-black text-black">
                        ৳{(order.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full ${PAYMENT_STATUS_COLORS[status] || PAYMENT_STATUS_COLORS.PENDING}`}>
                          {status === "PAID" ? (
                            <CheckCircle2 className="h-3 w-3 text-green-700" />
                          ) : status === "FAILED" ? (
                            <XCircle className="h-3 w-3 text-red-700" />
                          ) : (
                            <HelpCircle className="h-3 w-3 text-amber-700" />
                          )}
                          {status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-zinc-400 text-xs font-semibold">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                  );
                })
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
                Showing {startIndex + 1}–{endIndex} of {totalItems} payments
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
    </div>
  );
}
