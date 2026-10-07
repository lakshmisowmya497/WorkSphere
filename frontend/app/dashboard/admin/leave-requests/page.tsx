"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  RefreshCw,
  Search,
  Users,
  UserCog,
  XCircle,
} from "lucide-react";

type UserInfo = {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  department?: string;
  jobTitle?: string;
};

type LeaveRequest = {
  _id: string;

  requester?: UserInfo | null;

  employee?: UserInfo | null;

  projectManager?: UserInfo | null;

  approvalLevel?: "project_manager" | "admin";

  leaveType: string;

  fromDate: string;

  toDate: string;

  reason: string;

  visitingLocation?: string;

  additionalDetails?: string;

  status:
    | "pending"
    | "approved"
    | "rejected"
    | "cancelled";

  managerComment?: string;

  adminComment?: string;

  reviewedBy?: UserInfo | null;

  reviewedAt?: string | null;

  createdAt: string;
};

const API_BASE = "http://localhost:5000/api";

type MainTab = "all" | "project_manager" | "employee";

export default function AdminLeaveRequestsPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);

  const [activeTab, setActiveTab] =
    useState<MainTab>("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") ||
        sessionStorage.getItem("token")
      : null;

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  // ==========================================
  // HELPERS
  // ==========================================

  const getRequester = (request: LeaveRequest) => {
    return (
      request.requester ||
      request.employee ||
      request.projectManager ||
      null
    );
  };

  const getRequesterRole = (
    request: LeaveRequest
  ) => {
    const requester = getRequester(request);

    if (
      requester?.role === "project_manager" ||
      request.approvalLevel === "admin"
    ) {
      return "project_manager";
    }

    if (
      requester?.role === "employee" ||
      request.employee
    ) {
      return "employee";
    }

    return "unknown";
  };

  const getRequesterName = (
    request: LeaveRequest
  ) => {
    return (
      getRequester(request)?.name ||
      "Unknown User"
    );
  };

  const getRequesterEmail = (
    request: LeaveRequest
  ) => {
    return getRequester(request)?.email || "";
  };

  const getLeaveTypeLabel = (
    type: string
  ) => {
    const labels: Record<string, string> = {
      casual: "Casual Leave",
      sick: "Sick Leave",
      earned: "Earned Leave",
      "work-from-home":
        "Work From Home",
      other: "Other",
    };

    return labels[type] || type;
  };

  const formatDate = (date: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatusClass = (
    status: string
  ) => {
    switch (status) {
      case "approved":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";

      case "rejected":
        return "border-red-500/30 bg-red-500/10 text-red-400";

      case "cancelled":
        return "border-slate-500/30 bg-slate-500/10 text-slate-400";

      default:
        return "border-amber-500/30 bg-amber-500/10 text-amber-400";
    }
  };

  const getRoleBadge = (
    request: LeaveRequest
  ) => {
    const role = getRequesterRole(request);

    if (role === "project_manager") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-300">
          <UserCog className="h-3 w-3" />
          Project Manager
        </span>
      );
    }

    if (role === "employee") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-300">
          <Users className="h-3 w-3" />
          Employee
        </span>
      );
    }

    return (
      <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
        User
      </span>
    );
  };

  // ==========================================
  // FETCH REQUESTS
  // ==========================================

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/leaves/all`,
        {
          headers: authHeaders,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load leave requests"
        );
      }

      setRequests(
        data.leaveRequests ||
          data.requests ||
          []
      );
    } catch (err: any) {
      setError(
        err.message ||
          "Failed to load leave requests"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // ==========================================
  // ADMIN APPROVE / REJECT
  // ==========================================

  const handleAdminAction = async (
    id: string,
    action: "approve" | "reject"
  ) => {
    const actionText =
      action === "approve"
        ? "approve"
        : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} this leave request as Admin?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(id);
      setError("");
      setSuccess("");

      const endpoint =
        action === "approve"
          ? `${API_BASE}/leaves/${id}/admin-approve`
          : `${API_BASE}/leaves/${id}/admin-reject`;

      const response = await fetch(
        endpoint,
        {
          method: "PATCH",
          headers: authHeaders,
          body: JSON.stringify({}),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to ${actionText} leave request`
        );
      }

      setSuccess(
        action === "approve"
          ? "Leave request approved successfully."
          : "Leave request rejected successfully."
      );

      await fetchRequests();
    } catch (err: any) {
      setError(
        err.message ||
          `Failed to ${actionText} leave request`
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ==========================================
  // FILTER
  // ==========================================

  const filteredRequests =
    requests.filter((request) => {
      const requesterName =
        getRequesterName(request);

      const requesterEmail =
        getRequesterEmail(request);

      const role =
        getRequesterRole(request);

      const searchText =
        `${requesterName} ${requesterEmail} ${request.leaveType} ${request.reason} ${request.visitingLocation || ""}`.toLowerCase();

      const matchesSearch =
        searchText.includes(
          search.toLowerCase()
        );

      const matchesStatus =
        statusFilter === "all" ||
        request.status === statusFilter;

      const matchesTab =
        activeTab === "all" ||
        role === activeTab;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesTab
      );
    });

  // ==========================================
  // STATS
  // ==========================================

  const totalRequests = requests.length;

  const pendingRequests =
    requests.filter(
      (request) =>
        request.status === "pending"
    ).length;

  const projectManagerRequests =
    requests.filter(
      (request) =>
        getRequesterRole(request) ===
        "project_manager"
    ).length;

  const employeeRequests =
    requests.filter(
      (request) =>
        getRequesterRole(request) ===
        "employee"
    ).length;

  const approvedRequests =
    requests.filter(
      (request) =>
        request.status === "approved"
    ).length;

  const rejectedRequests =
    requests.filter(
      (request) =>
        request.status === "rejected"
    ).length;

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-[#08080d] px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-violet-400">
              <FileText className="h-4 w-4" />
              Administration
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              Leave Requests
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Centralized leave management for
              Project Managers and Employees.
              Admin has organization-level
              authority to review and act on
              leave requests.
            </p>
          </div>

          <button
            onClick={fetchRequests}
            className="flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-white"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />

            Refresh
          </button>
        </div>

        {/* ALERTS */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <span>{success}</span>
          </div>
        )}

        {/* STATS */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-white/10 bg-[#11111a] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">
                Total Requests
              </span>

              <FileText className="h-5 w-5 text-violet-400" />
            </div>

            <div className="text-3xl font-bold">
              {totalRequests}
            </div>

            <p className="mt-1 text-xs text-slate-500">
              All leave requests
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#11111a] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">
                Pending
              </span>

              <Clock3 className="h-5 w-5 text-amber-400" />
            </div>

            <div className="text-3xl font-bold">
              {pendingRequests}
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Awaiting action
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#11111a] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">
                Project Managers
              </span>

              <UserCog className="h-5 w-5 text-violet-400" />
            </div>

            <div className="text-3xl font-bold">
              {projectManagerRequests}
            </div>

            <p className="mt-1 text-xs text-slate-500">
              PM leave requests
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#11111a] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">
                Employees
              </span>

              <Users className="h-5 w-5 text-blue-400" />
            </div>

            <div className="text-3xl font-bold">
              {employeeRequests}
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Employee leave requests
            </p>
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="mb-4 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-[#0d0d14] p-2">

          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
              activeTab === "all"
                ? "bg-violet-600 text-white"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            All Requests
          </button>

          <button
            onClick={() =>
              setActiveTab("project_manager")
            }
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
              activeTab === "project_manager"
                ? "bg-violet-600 text-white"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <UserCog className="h-4 w-4" />

            Project Managers

            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">
              {projectManagerRequests}
            </span>
          </button>

          <button
            onClick={() =>
              setActiveTab("employee")
            }
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
              activeTab === "employee"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <Users className="h-4 w-4" />

            Employees

            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">
              {employeeRequests}
            </span>
          </button>
        </div>

        {/* SEARCH + STATUS */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#11111a] p-4 md:flex-row">

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

            <input
              type="text"
              placeholder="Search by name, email, leave type, reason or location..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-xl border border-white/10 bg-[#0b0b11] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-xl border border-white/10 bg-[#0b0b11] px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
          >
            <option value="all">
              All Status
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="approved">
              Approved
            </option>

            <option value="rejected">
              Rejected
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>
        </div>

        {/* REQUEST LIST */}
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-[#11111a] px-6 py-16 text-center">
            <RefreshCw className="mx-auto h-7 w-7 animate-spin text-violet-400" />

            <p className="mt-4 text-sm text-slate-400">
              Loading leave requests...
            </p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#11111a] px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10">
              <FileText className="h-6 w-6 text-violet-400" />
            </div>

            <h3 className="text-lg font-semibold text-white">
              No leave requests found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              No requests match the selected
              category, status or search.
            </p>
          </div>
        ) : (
          <div className="space-y-4">

            {filteredRequests.map(
              (request) => {
                const requesterName =
                  getRequesterName(request);

                const requesterEmail =
                  getRequesterEmail(request);

                const role =
                  getRequesterRole(request);

                const initials =
                  requesterName
                    .split(" ")
                    .map(
                      (part) => part[0]
                    )
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                const isPending =
                  request.status ===
                  "pending";

                return (
                  <div
                    key={request._id}
                    className="rounded-2xl border border-white/10 bg-[#11111a] p-5 transition hover:border-violet-500/20"
                  >

                    {/* TOP */}
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                      <div className="flex min-w-0 gap-4">

                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${
                            role ===
                            "project_manager"
                              ? "border-violet-500/20 bg-violet-500/10 text-violet-300"
                              : "border-blue-500/20 bg-blue-500/10 text-blue-300"
                          }`}
                        >
                          {initials}
                        </div>

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="font-semibold text-white">
                              {requesterName}
                            </h3>

                            {getRoleBadge(
                              request
                            )}

                            <span
                              className={`rounded-lg border px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(
                                request.status
                              )}`}
                            >
                              {request.status}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-slate-500">
                            {requesterEmail}
                          </p>
                        </div>
                      </div>

                      {/* ADMIN ACTIONS */}
                      {isPending && (
                        <div className="flex shrink-0 gap-2">

                          <button
                            onClick={() =>
                              handleAdminAction(
                                request._id,
                                "reject"
                              )
                            }
                            disabled={
                              processingId ===
                              request._id
                            }
                            className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <XCircle className="h-4 w-4" />

                            Reject
                          </button>

                          <button
                            onClick={() =>
                              handleAdminAction(
                                request._id,
                                "approve"
                              )
                            }
                            disabled={
                              processingId ===
                              request._id
                            }
                            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-4 w-4" />

                            Approve
                          </button>
                        </div>
                      )}
                    </div>

                    {/* DETAILS */}
                    <div className="mt-5 grid gap-4 border-t border-white/10 pt-5 md:grid-cols-2 lg:grid-cols-4">

                      <div>
                        <p className="mb-1 text-xs text-slate-500">
                          Leave Type
                        </p>

                        <p className="text-sm font-medium text-slate-200">
                          {getLeaveTypeLabel(
                            request.leaveType
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="mb-1 text-xs text-slate-500">
                          Leave Period
                        </p>

                        <div className="flex items-center gap-2 text-sm text-slate-200">
                          <CalendarDays className="h-4 w-4 text-violet-400" />

                          {formatDate(
                            request.fromDate
                          )}

                          <span className="text-slate-600">
                            →
                          </span>

                          {formatDate(
                            request.toDate
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="mb-1 text-xs text-slate-500">
                          Visiting Location
                        </p>

                        <div className="flex items-center gap-2 text-sm text-slate-200">
                          <MapPin className="h-4 w-4 text-violet-400" />

                          {request.visitingLocation ||
                            "Not specified"}
                        </div>
                      </div>

                      <div>
                        <p className="mb-1 text-xs text-slate-500">
                          Submitted
                        </p>

                        <p className="text-sm text-slate-200">
                          {formatDate(
                            request.createdAt
                          )}
                        </p>
                      </div>
                    </div>

                    {/* EMPLOYEE PM INFORMATION */}
                    {role === "employee" &&
                      request.projectManager && (
                        <div className="mt-4 rounded-xl border border-blue-500/10 bg-blue-500/5 p-4">

                          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-blue-400">
                            Assigned Project Manager
                          </p>

                          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-300">
                            <span>
                              <span className="text-slate-500">
                                Name:
                              </span>{" "}
                              {
                                request
                                  .projectManager
                                  .name
                              }
                            </span>

                            <span>
                              <span className="text-slate-500">
                                Email:
                              </span>{" "}
                              {
                                request
                                  .projectManager
                                  .email
                              }
                            </span>
                          </div>
                        </div>
                      )}

                    {/* REASON */}
                    <div className="mt-5 border-t border-white/10 pt-4">

                      <p className="mb-1 text-xs text-slate-500">
                        Reason
                      </p>

                      <p className="text-sm leading-6 text-slate-300">
                        {request.reason}
                      </p>
                    </div>

                    {/* ADDITIONAL DETAILS */}
                    {request.additionalDetails && (
                      <div className="mt-4">

                        <p className="mb-1 text-xs text-slate-500">
                          Additional Details
                        </p>

                        <p className="text-sm leading-6 text-slate-400">
                          {
                            request.additionalDetails
                          }
                        </p>
                      </div>
                    )}

                    {/* APPROVAL INFORMATION */}
                    {(request.managerComment ||
                      request.adminComment ||
                      request.reviewedAt) && (
                      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4">

                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Approval Information
                        </p>

                        <div className="space-y-2 text-sm">

                          {request.managerComment && (
                            <p className="text-slate-300">
                              <span className="text-slate-500">
                                Manager:
                              </span>{" "}
                              {
                                request.managerComment
                              }
                            </p>
                          )}

                          {request.adminComment && (
                            <p className="text-slate-300">
                              <span className="text-slate-500">
                                Admin:
                              </span>{" "}
                              {
                                request.adminComment
                              }
                            </p>
                          )}

                          {request.reviewedAt && (
                            <p className="text-xs text-slate-600">
                              Reviewed on{" "}
                              {formatDate(
                                request.reviewedAt
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
}