"use client";

import { useState } from "react";
import {
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} from "@/redux/api/auth/authApi";
import {
  Loader,
  Trash2,
  ShieldCheck,
  User,
  UserCog,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-rose-100 text-rose-700 border border-rose-200",
  MANAGER: "bg-amber-100 text-amber-700 border border-amber-200",
  USER: "bg-zinc-100 text-zinc-600 border border-zinc-200",
};

export default function UserManagementPage() {
  const { data, isLoading, error } = useGetAllUsersQuery();
  const [updateRole] = useUpdateUserRoleMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const users = data?.data || [];

  const handleRoleChange = async (id: string, role: string) => {
    setUpdatingId(id);
    try {
      await updateRole({ id, role }).unwrap();
      toast.success("Role updated successfully!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update role.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteUser(id).unwrap();
      toast.success("User suspended successfully.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to suspend user.");
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  // Filter users
  const filteredUsers = users.filter((user: any) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Calculate paginated slices
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset page when filters change
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (val: string) => {
    setRoleFilter(val);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (val: number) => {
    setItemsPerPage(val);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-10 poppins-regular">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">Admin Panel</p>
        <h1 className="text-3xl font-black text-black uppercase tracking-tight">User Management</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage registered users, update roles, or suspend accounts.</p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center h-48">
          <Loader className="animate-spin h-8 w-8 text-zinc-400" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 p-6 text-sm font-semibold rounded">
          Failed to load users. Please check your connection.
        </div>
      )}

      {/* Main content */}
      {!isLoading && !error && (
        <>
          {/* Filters Toolbar */}
          <div className="border border-zinc-200 bg-white p-4 mb-6 flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by ID, name or email..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[#006CF9] focus:bg-white transition placeholder-zinc-400"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => handleRoleFilterChange(e.target.value)}
                className="bg-white border border-zinc-200 text-xs font-bold text-black py-2 px-3 focus:outline-none focus:border-[#006CF9] cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                <option value="USER">USER</option>
                <option value="MANAGER">MANAGER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="border border-zinc-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-950 text-white text-xs uppercase tracking-widest font-black">
                  <tr>
                    <th className="px-5 py-4 text-left font-black">#</th>
                    <th className="px-5 py-4 text-left font-black">Name</th>
                    <th className="px-5 py-4 text-left font-black">Email</th>
                    <th className="px-5 py-4 text-left font-black">Role</th>
                    <th className="px-5 py-4 text-left font-black">Joined</th>
                    <th className="px-5 py-4 text-left font-black">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center text-zinc-400 font-semibold">
                        No users match the filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user: any, idx: number) => (
                      <tr key={user.id} className="border-t border-zinc-100 hover:bg-zinc-50 transition">
                        <td className="px-5 py-4 text-zinc-400 font-bold">{startIndex + idx + 1}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center shrink-0 overflow-hidden">
                              {user.profileImage ? (
                                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                              ) : (
                                <User className="h-4 w-4 text-zinc-500" />
                              )}
                            </div>
                            <span className="font-bold text-black">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-zinc-500">{user.email}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${ROLE_COLORS[user.role] || ROLE_COLORS.USER}`}>
                              {user.role}
                            </span>
                            {updatingId === user.id && <Loader className="animate-spin h-3.5 w-3.5 text-zinc-400" />}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-zinc-500 text-xs">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {/* Role Selector */}
                            <div className="relative">
                              <select
                                defaultValue={user.role}
                                disabled={updatingId === user.id}
                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                className="bg-zinc-50 border border-zinc-300 text-xs font-bold text-black px-3 py-2 pr-8 rounded-full focus:outline-none focus:border-black cursor-pointer appearance-none hover:bg-zinc-100 transition"
                              >
                                <option value="USER">USER</option>
                                <option value="MANAGER">MANAGER</option>
                                <option value="ADMIN">ADMIN</option>
                              </select>
                              <UserCog className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                            </div>
                            {/* Suspend Button */}
                            <button
                              onClick={() => setConfirmDelete(user.id)}
                              disabled={deletingId === user.id}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-full border border-red-100 transition cursor-pointer"
                              title="Suspend user"
                            >
                              {deletingId === user.id ? (
                                <Loader className="animate-spin h-3.5 w-3.5" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </button>
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
                    Showing {startIndex + 1}–{endIndex} of {totalItems} users
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

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white border border-zinc-200 p-8 max-w-sm w-full space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-black text-black text-base uppercase">Suspend User?</h3>
                <p className="text-sm text-zinc-500 mt-0.5">This user will no longer be able to log in.</p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-zinc-300 text-black text-xs font-bold py-3 hover:bg-zinc-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deletingId !== null}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-3 transition cursor-pointer disabled:opacity-50"
              >
                {deletingId ? "Suspending..." : "Yes, Suspend"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
