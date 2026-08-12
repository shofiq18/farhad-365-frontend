"use client";

import { useState } from "react";
import { useGetAllOrdersQuery } from "@/redux/api/order/orderApi";
import { useGetProductsQuery } from "@/redux/api/product/productApi";
import { useGetAllUsersQuery } from "@/redux/api/auth/authApi";
import {
  Loader,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  ArrowUpRight,
  TrendingUp,
  Clock,
  PlusCircle,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";

const STATUS_BADGES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
  PROCESSING: "bg-blue-50 text-blue-700 border border-blue-200",
  SHIPPED: "bg-purple-50 text-purple-700 border border-purple-200",
  DELIVERED: "bg-green-50 text-green-700 border border-green-200",
  CANCELLED: "bg-rose-50 text-rose-700 border border-rose-200",
};

const MONTH_LABELS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

export default function DashboardOverview() {
  const { data: ordersData, isLoading: isOrdersLoading } = useGetAllOrdersQuery();
  const { data: productsData, isLoading: isProductsLoading } = useGetProductsQuery({});
  const { data: usersData, isLoading: isUsersLoading } = useGetAllUsersQuery();

  // Chart state
  const [activeRange, setActiveRange] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const orders = ordersData?.data || [];
  const products = productsData?.data || [];
  const users = usersData?.data || [];

  // Calculate static metrics
  const totalRevenue = orders
    .filter((order: any) => order.status !== "CANCELLED")
    .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

  const pendingOrders = orders.filter(
    (order: any) => order.status === "PENDING" || order.status === "PROCESSING"
  ).length;

  if (isOrdersLoading || isProductsLoading || isUsersLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader className="animate-spin h-8 w-8 text-zinc-400" />
      </div>
    );
  }

  // ----------------------------------------------------
  // CHART DATA CALCULATIONS
  // ----------------------------------------------------
  let chartLabels: string[] = [];
  let chartValues: number[] = [];

  if (activeRange === "MONTHLY") {
    chartLabels = MONTH_LABELS;
    chartValues = Array(12).fill(0);

    orders.forEach((order: any) => {
      if (order.status !== "CANCELLED" && order.createdAt) {
        const orderDate = new Date(order.createdAt);
        if (orderDate.getFullYear() === selectedYear) {
          const monthIndex = orderDate.getMonth();
          chartValues[monthIndex] += order.totalAmount || 0;
        }
      }
    });
  } else {
    // YEARLY ANALYSIS: Last 5 Years (e.g. 2022 to 2026)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);
    chartLabels = years.map(String);
    chartValues = Array(5).fill(0);

    orders.forEach((order: any) => {
      if (order.status !== "CANCELLED" && order.createdAt) {
        const orderYear = new Date(order.createdAt).getFullYear();
        const yearIdx = years.indexOf(orderYear);
        if (yearIdx !== -1) {
          chartValues[yearIdx] += order.totalAmount || 0;
        }
      }
    });
  }

  // SVG Coordinates mapping logic
  const svgWidth = 1000;
  const svgHeight = 300;
  const paddingX = 50;
  const paddingY = 60; // leave room for floating tooltip at top

  const maxVal = Math.max(...chartValues, 1000); // fallback min value to avoid division by 0

  // Helper functions to get X and Y coordinates
  const getX = (index: number) => {
    const totalPoints = chartValues.length;
    return paddingX + (index * (svgWidth - 2 * paddingX)) / (totalPoints - 1);
  };

  const getY = (val: number) => {
    const graphHeight = svgHeight - paddingY - 30; // 30px padding bottom
    return svgHeight - 30 - (val / maxVal) * graphHeight;
  };

  // Build the line path and gradient area
  const points = chartValues.map((val, idx) => ({ x: getX(idx), y: getY(val) }));
  const linePath = points.reduce(
    (acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ""
  );

  const fillAreaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${svgHeight - 30} L ${points[0].x} ${svgHeight - 30} Z`
    : "";

  // Get last 5 orders for the recent table
  const recentOrders = [...orders]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-10 poppins-regular">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">Overview</p>
          <h1 className="text-3xl font-black text-black uppercase tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">Real-time business performance analytics and statistics.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/products"
            className="flex items-center gap-1.5 border border-zinc-300 bg-white hover:bg-zinc-50 text-black font-bold text-xs uppercase tracking-wider py-3.5 px-5 transition rounded-none"
          >
            <PlusCircle className="h-4 w-4" /> Add Product
          </Link>
          <Link
            href="/dashboard/quotation"
            className="flex items-center gap-1.5 bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-5 transition rounded-none"
          >
            <FileSpreadsheet className="h-4 w-4" /> Quotations
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="border border-zinc-200 bg-white p-6 rounded-none relative overflow-hidden group hover:border-[#006CF9] transition">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Total Revenue</span>
              <span className="text-2xl font-black text-black block">৳{totalRevenue.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-zinc-100 text-black rounded-none group-hover:bg-[#006CF9] group-hover:text-white transition">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-[#006CF9] font-bold">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Active Sales flow</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="border border-zinc-200 bg-white p-6 rounded-none relative overflow-hidden group hover:border-[#006CF9] transition">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Total Orders</span>
              <span className="text-2xl font-black text-black block">{orders.length}</span>
            </div>
            <div className="p-3 bg-zinc-100 text-black rounded-none group-hover:bg-[#006CF9] group-hover:text-white transition">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-600 font-bold">
            <Clock className="h-3.5 w-3.5" />
            <span>{pendingOrders} active processing</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="border border-zinc-200 bg-white p-6 rounded-none relative overflow-hidden group hover:border-[#006CF9] transition">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Total Products</span>
              <span className="text-2xl font-black text-black block">{products.length}</span>
            </div>
            <div className="p-3 bg-zinc-100 text-black rounded-none group-hover:bg-[#006CF9] group-hover:text-white transition">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-zinc-500 font-bold">
            <span>In Inventory catalogue</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="border border-zinc-200 bg-white p-6 rounded-none relative overflow-hidden group hover:border-[#006CF9] transition">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Total Customers</span>
              <span className="text-2xl font-black text-black block">{users.length}</span>
            </div>
            <div className="p-3 bg-zinc-100 text-black rounded-none group-hover:bg-[#006CF9] group-hover:text-white transition">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-green-600 font-bold">
            <span>Registered accounts</span>
          </div>
        </div>
      </div>

      {/* Revenue Stream Custom Chart Card */}
      <div className="border border-zinc-200 bg-white p-6 md:p-8 rounded-none mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-black italic uppercase">
              Revenue Stream
            </h2>
            <p className="text-xs text-zinc-400 font-black uppercase tracking-widest mt-1">
              {activeRange === "MONTHLY" ? `Monthly Analysis for ${selectedYear}` : "Yearly Analysis Overview"}
            </p>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-center">
            {/* Toggle Range */}
            <div className="flex bg-zinc-100 p-0.5 rounded-none border border-zinc-200">
              <button
                onClick={() => {
                  setActiveRange("MONTHLY");
                  setHoveredIndex(null);
                }}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                  activeRange === "MONTHLY"
                    ? "bg-[#006CF9] text-white shadow-sm"
                    : "text-zinc-600 hover:text-black"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => {
                  setActiveRange("YEARLY");
                  setHoveredIndex(null);
                }}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                  activeRange === "YEARLY"
                    ? "bg-[#006CF9] text-white shadow-sm"
                    : "text-zinc-600 hover:text-black"
                }`}
              >
                Yearly
              </button>
            </div>

            {/* Selected Year Dropdown */}
            {activeRange === "MONTHLY" && (
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(Number(e.target.value));
                  setHoveredIndex(null);
                }}
                className="bg-white border border-zinc-200 text-xs font-black text-black px-4 py-2 focus:outline-none focus:border-[#006CF9] cursor-pointer"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
              </select>
            )}
          </div>
        </div>

        {/* Custom SVG Line Chart */}
        <div className="relative w-full overflow-hidden select-none">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto overflow-visible"
          >
            <defs>
              <linearGradient id="blueAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#006CF9" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#006CF9" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            <line x1={paddingX} y1={getY(0)} x2={svgWidth - paddingX} y2={getY(0)} stroke="#F4F4F5" strokeWidth="1" />
            <line x1={paddingX} y1={getY(maxVal * 0.5)} x2={svgWidth - paddingX} y2={getY(maxVal * 0.5)} stroke="#F4F4F5" strokeWidth="1" />
            <line x1={paddingX} y1={getY(maxVal)} x2={svgWidth - paddingX} y2={getY(maxVal)} stroke="#F4F4F5" strokeWidth="1" />

            {/* Gradient Fill Under Line */}
            {fillAreaPath && (
              <path d={fillAreaPath} fill="url(#blueAreaGradient)" />
            )}

            {/* Main Path Line */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="#006CF9"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Vertical Guide lines & circles on hover */}
            {hoveredIndex !== null && points[hoveredIndex] && (
              <>
                <line
                  x1={points[hoveredIndex].x}
                  y1={60}
                  x2={points[hoveredIndex].x}
                  y2={svgHeight - 30}
                  stroke="#006CF9"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <circle
                  cx={points[hoveredIndex].x}
                  cy={points[hoveredIndex].y}
                  r="9"
                  fill="#006CF9"
                  fillOpacity="0.2"
                />
              </>
            )}

            {/* Data Circles */}
            {points.map((p, idx) => (
              <circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r="6"
                fill="#FFFFFF"
                stroke="#006CF9"
                strokeWidth="3.5"
                onMouseEnter={() => setHoveredIndex(idx)}
                className="cursor-pointer transition duration-150 hover:r-7"
              />
            ))}

            {/* Floating Tooltip Box */}
            {hoveredIndex !== null && points[hoveredIndex] && (
              <foreignObject
                x={points[hoveredIndex].x - 65}
                y={points[hoveredIndex].y - 65}
                width="130"
                height="55"
                className="overflow-visible pointer-events-none"
              >
                <div className="bg-[#006CF9] shadow-lg text-white px-2.5 py-1.5 text-center text-xs font-black rounded-md relative select-none animate-in fade-in zoom-in duration-100">
                  ৳{chartValues[hoveredIndex].toLocaleString()}
                  <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#006CF9] rotate-45"></div>
                </div>
              </foreignObject>
            )}
          </svg>

          {/* X Axis Labels under SVG */}
          <div className="flex justify-between items-center px-[35px] pt-4 border-t border-zinc-100 text-[10px] font-black tracking-widest text-zinc-400">
            {chartLabels.map((lbl, idx) => (
              <span
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`cursor-pointer transition px-2 py-1 ${
                  hoveredIndex === idx ? "text-[#006CF9] font-black scale-110" : ""
                }`}
              >
                {lbl}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 border border-zinc-200 bg-white overflow-hidden">
          <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="text-sm font-black text-black uppercase tracking-widest">Recent Orders</h2>
            <Link
              href="/dashboard/orders"
              className="text-xs font-bold text-zinc-500 hover:text-black flex items-center gap-0.5 transition uppercase tracking-wider"
            >
              View All <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-950 text-white text-xs uppercase tracking-widest">
                <tr>
                  <th className="px-5 py-4 text-left font-black">Order ID</th>
                  <th className="px-5 py-4 text-left font-black">Amount</th>
                  <th className="px-5 py-4 text-left font-black">Payment</th>
                  <th className="px-5 py-4 text-left font-black">Status</th>
                  <th className="px-5 py-4 text-left font-black">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center text-zinc-400 font-semibold">
                      No recent orders placed.
                    </td>
                  </tr>
                )}
                {recentOrders.map((order: any) => (
                  <tr key={order.id || order._id} className="border-t border-zinc-100 hover:bg-zinc-50 transition">
                    <td className="px-5 py-4 font-bold text-black truncate max-w-[120px]" title={order.id || order._id}>
                      {order.id || order._id}
                    </td>
                    <td className="px-5 py-4 font-bold text-zinc-900">৳{(order.totalAmount || 0).toLocaleString()}</td>
                    <td className="px-5 py-4 text-zinc-500 text-xs font-semibold">{order.paymentMethod === "COD" ? "COD" : "bKash"}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${STATUS_BADGES[order.status] || STATUS_BADGES.PENDING}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-400 text-xs">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links & Info Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border border-zinc-200 bg-white p-6 rounded-none">
            <h2 className="text-sm font-black text-black uppercase tracking-widest pb-3 border-b border-zinc-100 mb-4">
              Quick Shortcuts
            </h2>
            <div className="grid grid-cols-1 gap-2.5">
              <Link
                href="/dashboard/products"
                className="w-full flex items-center justify-between p-3.5 border border-zinc-200 hover:border-[#006CF9] transition font-bold text-xs uppercase tracking-wider text-black bg-zinc-50/50 hover:bg-white"
              >
                Manage Inventory Catalog
                <ArrowUpRight className="h-4 w-4 text-zinc-400" />
              </Link>
              <Link
                href="/dashboard/orders"
                className="w-full flex items-center justify-between p-3.5 border border-zinc-200 hover:border-[#006CF9] transition font-bold text-xs uppercase tracking-wider text-black bg-zinc-50/50 hover:bg-white"
              >
                Process Orders Queue
                <ArrowUpRight className="h-4 w-4 text-zinc-400" />
              </Link>
              <Link
                href="/dashboard/user-management"
                className="w-full flex items-center justify-between p-3.5 border border-zinc-200 hover:border-[#006CF9] transition font-bold text-xs uppercase tracking-wider text-black bg-zinc-50/50 hover:bg-white"
              >
                Access User Management
                <ArrowUpRight className="h-4 w-4 text-zinc-400" />
              </Link>
              <Link
                href="/dashboard/profile"
                className="w-full flex items-center justify-between p-3.5 border border-zinc-200 hover:border-[#006CF9] transition font-bold text-xs uppercase tracking-wider text-black bg-zinc-50/50 hover:bg-white"
              >
                Update Admin Profile
                <ArrowUpRight className="h-4 w-4 text-zinc-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}