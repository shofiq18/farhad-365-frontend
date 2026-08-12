"use client";

import { useState } from "react";
import {
  useGetAllQuotationsQuery,
  useUpdateQuotationStatusMutation,
} from "@/redux/api/quotation/quotationApi";
import {
  Loader,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  X,
  Printer,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

const STATUS_STYLES: Record<string, string> = {
  Submit: "bg-blue-50 text-blue-700 border border-blue-200",
  Approve: "bg-green-50 text-green-700 border border-green-200",
  Cancel: "bg-red-50 text-red-700 border border-red-200",
};

export default function QuotationAdminPage() {
  const { data, isLoading, error } = useGetAllQuotationsQuery();
  const [updateStatus, { isLoading: updating }] = useUpdateQuotationStatusMutation();
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const quotations = data?.data || [];

  const handleStatusUpdate = async (id: string, status: "Approve" | "Cancel") => {
    setActionId(id);
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Quotation ${status}d successfully!`);
      if (selectedQuotation?.id === id) {
        setSelectedQuotation((prev: any) => ({ ...prev, status }));
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update quotation.");
    } finally {
      setActionId(null);
    }
  };

  // Filter quotations
  const filteredQuotations = quotations.filter((q: any) => {
    const matchesSearch =
      q.quotationNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || q.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate paginated slices
  const totalItems = filteredQuotations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedQuotations = filteredQuotations.slice(startIndex, endIndex);

  // Reset page when filters change
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (val: number) => {
    setItemsPerPage(val);
    setCurrentPage(1);
  };

  // Print Quotation Handler
  const handlePrint = (q: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup blocker prevented opening the print window.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Quotation #${q.quotationNo}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 40px; line-height: 1.4; }
            .header { border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 25px; }
            .header-table { width: 100%; border-collapse: collapse; }
            .header-title { font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 25px; }
            .section-title { font-size: 11px; font-weight: 900; text-transform: uppercase; color: #666; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 0.5px; }
            .info-text { font-size: 13px; line-height: 1.6; }
            .items-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .items-table th { background: #f8f9fa; font-size: 11px; text-transform: uppercase; padding: 10px 12px; border: 1px solid #dee2e6; font-weight: 800; text-align: left; }
            .items-table td { padding: 10px 12px; border: 1px solid #dee2e6; font-size: 12px; }
            .footer { margin-top: 80px; display: flex; justify-content: space-between; }
            .sig-line { width: 220px; border-top: 1.5px solid #000; text-align: center; padding-top: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-top: 50px; }
          </style>
        </head>
        <body>
          <div class="header">
            <table class="header-table">
              <tr>
                <td class="header-title">Quotation Sheet</td>
                <td style="text-align: right; font-size: 13px; font-weight: bold; line-height: 1.5;">
                  Quotation #: <span style="font-family: monospace;">${q.quotationNo}</span><br/>
                  Date: ${q.createdAt ? new Date(q.createdAt).toLocaleDateString() : "N/A"}<br/>
                  Status: <span style="text-transform: uppercase; color: ${q.status === "Approve" ? "green" : q.status === "Cancel" ? "red" : "blue"}">${q.status}</span>
                </td>
              </tr>
            </table>
          </div>

          <div class="grid">
            <div>
              <div class="section-title">Client Information</div>
              <div class="info-text">
                <strong>Company:</strong> ${q.companyName || "—"}<br/>
                <strong>Contact Person:</strong> ${q.contactPerson || "—"}<br/>
                <strong>Email:</strong> ${q.email || "—"}<br/>
                <strong>Mobile:</strong> ${q.mobile || "—"}
              </div>
            </div>
            <div>
              <div class="section-title">Delivery Details</div>
              <div class="info-text">
                <strong>Billing Address:</strong><br/>
                ${q.billingAddress || "—"}<br/><br/>
                <strong>Shipping Address:</strong><br/>
                ${q.shippingAddress || "—"}
              </div>
            </div>
          </div>

          ${q.comment ? `
            <div style="margin-bottom: 25px;">
              <div class="section-title">Comment / Remarks</div>
              <div style="font-size: 13px; color: #555;">${q.comment}</div>
            </div>
          ` : ""}

          <div class="section-title">Requested Items List</div>
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 20%;">SKU</th>
                <th style="width: 55%;">Description</th>
                <th style="width: 15%;">UOM</th>
                <th style="width: 10%; text-align: center;">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${q.items?.map((item: any) => `
                <tr>
                  <td style="font-weight: bold; font-family: monospace;">${item.sku}</td>
                  <td>${item.description || "—"}</td>
                  <td>${item.uom || "—"}</td>
                  <td style="text-align: center; font-weight: bold;">${item.quantity}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="footer">
            <div class="sig-line">Requested By</div>
            <div class="sig-line">Authorized signature</div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-10 poppins-regular">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">Admin Panel</p>
        <h1 className="text-3xl font-black text-black uppercase tracking-tight">Quotation Requests</h1>
        <p className="text-sm text-zinc-500 mt-1">Review, approve or cancel incoming quotation requests.</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-48">
          <Loader className="animate-spin h-8 w-8 text-zinc-400" />
        </div>
      )}

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 p-6 text-sm font-semibold">
          Failed to load quotations.
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Filters Toolbar */}
          <div className="border border-zinc-200 bg-white p-4 mb-6 flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by Quotation #, company, name or email..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[#006CF9] focus:bg-white transition placeholder-zinc-400"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="bg-white border border-zinc-200 text-xs font-bold text-black py-2 px-3 focus:outline-none focus:border-[#006CF9] cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="Submit">Submitted</option>
                <option value="Approve">Approved</option>
                <option value="Cancel">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="border border-zinc-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-950 text-white text-xs uppercase tracking-widest font-black">
                  <tr>
                    <th className="px-5 py-4 text-left font-black">Quotation #</th>
                    <th className="px-5 py-4 text-left font-black">Company</th>
                    <th className="px-5 py-4 text-left font-black">Contact</th>
                    <th className="px-5 py-4 text-left font-black">Email</th>
                    <th className="px-5 py-4 text-left font-black">Items</th>
                    <th className="px-5 py-4 text-left font-black">Status</th>
                    <th className="px-5 py-4 text-left font-black">Date</th>
                    <th className="px-5 py-4 text-left font-black">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedQuotations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-16 text-center text-zinc-400 font-semibold">
                        No quotation requests match the filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedQuotations.map((q: any) => (
                      <tr key={q.id} className="border-t border-zinc-100 hover:bg-zinc-50 transition">
                        <td className="px-5 py-4 font-black text-black">{q.quotationNo}</td>
                        <td className="px-5 py-4 font-bold text-black">{q.companyName}</td>
                        <td className="px-5 py-4 text-zinc-600">{q.contactPerson}</td>
                        <td className="px-5 py-4 text-zinc-500 text-xs">{q.email}</td>
                        <td className="px-5 py-4 text-zinc-500">{q.items?.length || 0} item(s)</td>
                        <td className="px-5 py-4">
                          <span className={`inline-block px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full ${STATUS_STYLES[q.status] || STATUS_STYLES.Submit}`}>
                            {q.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-zinc-400 text-xs">
                          {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedQuotation(q)}
                              className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-full border border-zinc-200 transition cursor-pointer"
                              title="View details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            {q.status === "Submit" && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(q.id, "Approve")}
                                  disabled={actionId === q.id}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-full border border-green-100 transition cursor-pointer disabled:opacity-50"
                                  title="Approve"
                                >
                                  {actionId === q.id ? <Loader className="animate-spin h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(q.id, "Cancel")}
                                  disabled={actionId === q.id}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-full border border-red-100 transition cursor-pointer disabled:opacity-50"
                                  title="Cancel"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
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
                    Showing {startIndex + 1}–{endIndex} of {totalItems} quotations
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

      {/* Detail Modal */}
      {selectedQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white border border-zinc-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 space-y-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setSelectedQuotation(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">Quotation Details</p>
                <h2 className="text-xl font-black text-black uppercase">{selectedQuotation.quotationNo}</h2>
                <span className={`inline-block mt-2 px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full ${STATUS_STYLES[selectedQuotation.status] || STATUS_STYLES.Submit}`}>
                  {selectedQuotation.status}
                </span>
              </div>
              {/* Print Button */}
              <button
                onClick={() => handlePrint(selectedQuotation)}
                className="flex items-center gap-1.5 bg-[#006CF9] hover:bg-[#0056c6] text-white font-bold text-xs uppercase tracking-wider py-2 px-4 transition rounded-none cursor-pointer self-start"
              >
                <Printer className="h-4 w-4" /> Print
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 pt-6">
              {[
                ["Company", selectedQuotation.companyName],
                ["Contact Person", selectedQuotation.contactPerson],
                ["Mobile", selectedQuotation.mobile],
                ["Email", selectedQuotation.email],
                ["Billing Address", selectedQuotation.billingAddress],
                ["Shipping Address", selectedQuotation.shippingAddress],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-sm font-bold text-black">{value || "—"}</p>
                </div>
              ))}
            </div>

            {selectedQuotation.comment && (
              <div className="border-t border-zinc-100 pt-4">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Comment</p>
                <p className="text-sm text-zinc-600">{selectedQuotation.comment}</p>
              </div>
            )}

            {selectedQuotation.items?.length > 0 && (
              <div className="border-t border-zinc-100 pt-4">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Items</p>
                <table className="w-full text-xs border border-zinc-200">
                  <thead className="bg-zinc-100">
                    <tr>
                      {["SKU", "Description", "UOM", "Qty"].map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-black text-zinc-600 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedQuotation.items.map((item: any, i: number) => (
                      <tr key={i} className="border-t border-zinc-100">
                        <td className="px-3 py-2 font-bold text-black">{item.sku}</td>
                        <td className="px-3 py-2 text-zinc-600">{item.description}</td>
                        <td className="px-3 py-2 text-zinc-500">{item.uom}</td>
                        <td className="px-3 py-2 font-black text-black">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedQuotation.status === "Submit" && (
              <div className="flex gap-3 border-t border-zinc-100 pt-5">
                <button
                  onClick={() => handleStatusUpdate(selectedQuotation.id, "Approve")}
                  disabled={!!actionId}
                  className="flex-1 flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-wider py-3 transition cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" /> Approve
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedQuotation.id, "Cancel")}
                  disabled={!!actionId}
                  className="flex-1 flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-black uppercase tracking-wider py-3 transition cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" /> Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
