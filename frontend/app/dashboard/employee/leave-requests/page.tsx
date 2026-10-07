"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Plus,
  RefreshCw,
  X,
  XCircle,
  MapPin,
  MessageSquare,
} from "lucide-react";

/* =====================================================
   TYPES
===================================================== */

interface LeaveReviewer {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
}

interface LeaveRequest {
  _id: string;

  leaveType:
    | "casual"
    | "sick"
    | "earned"
    | "work-from-home"
    | "other";

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

  reviewedBy?: LeaveReviewer | null;

  reviewedAt?: string | null;

  createdAt?: string;
}

/* =====================================================
   PAGE
===================================================== */

export default function EmployeeLeaveRequestsPage() {
  const API_BASE = "http://localhost:5000/api";

  /* ===================================================
     STATE
  =================================================== */

  const [leaves, setLeaves] =
    useState<LeaveRequest[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [activeTab, setActiveTab] =
    useState<
      "all" | "pending" | "approved" | "rejected"
    >("all");

  const [showApplyModal, setShowApplyModal] =
    useState(false);

  const [selectedLeave, setSelectedLeave] =
    useState<LeaveRequest | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  /* ===================================================
     FORM
  =================================================== */

  const [leaveType, setLeaveType] =
    useState<
      LeaveRequest["leaveType"]
    >("casual");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const [reason, setReason] =
    useState("");

  const [visitingLocation, setVisitingLocation] =
    useState("");

  const [additionalDetails, setAdditionalDetails] =
    useState("");

  /* ===================================================
     TOKEN
  =================================================== */

  const getToken = () => {
    if (typeof window === "undefined") {
      return null;
    }

    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("token")
    );
  };

  /* ===================================================
     LOGOUT
  =================================================== */

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("user");

    window.location.href = "/login";
  };

  /* ===================================================
     FETCH LEAVES
  =================================================== */

  const fetchLeaves = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = getToken();

      if (!token) {
        logout();
        return;
      }

      const response = await fetch(
        `${API_BASE}/leaves/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load leave requests."
        );
      }

      setLeaves(
        Array.isArray(data.leaves)
          ? data.leaves
          : []
      );
    } catch (err) {
      console.error(
        "Employee leaves error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load leave requests."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  /* ===================================================
     RESET FORM
  =================================================== */

  const resetForm = () => {
    setLeaveType("casual");
    setFromDate("");
    setToDate("");
    setReason("");
    setVisitingLocation("");
    setAdditionalDetails("");
  };

  /* ===================================================
     DAYS
  =================================================== */

  const calculateDays = (
    from: string,
    to: string
  ) => {
    if (!from || !to) {
      return 0;
    }

    const start = new Date(from);
    const end = new Date(to);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return 0;
    }

    const difference =
      end.getTime() -
      start.getTime();

    if (difference < 0) {
      return 0;
    }

    return (
      Math.floor(
        difference /
          (1000 * 60 * 60 * 24)
      ) + 1
    );
  };

  const selectedDays = calculateDays(
    fromDate,
    toDate
  );

  /* ===================================================
     SUBMIT LEAVE
  =================================================== */

  const submitLeave = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!fromDate || !toDate) {
      alert(
        "Please select both from and to dates."
      );
      return;
    }

    if (new Date(toDate) < new Date(fromDate)) {
      alert(
        "To date cannot be before from date."
      );
      return;
    }

    if (!reason.trim()) {
      alert(
        "Please provide a reason for leave."
      );
      return;
    }

    try {
      setSubmitting(true);

      const token = getToken();

      if (!token) {
        logout();
        return;
      }

      const response = await fetch(
        `${API_BASE}/leaves`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            leaveType,
            fromDate,
            toDate,
            reason: reason.trim(),
            visitingLocation:
              visitingLocation.trim(),
            additionalDetails:
              additionalDetails.trim(),
          }),
        }
      );

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to submit leave request."
        );
      }

      alert(
        "Leave request submitted successfully. It is now waiting for Project Manager approval."
      );

      setShowApplyModal(false);

      resetForm();

      await fetchLeaves();
    } catch (err) {
      console.error(
        "Submit leave error:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Failed to submit leave request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ===================================================
     FILTER
  =================================================== */

  const filteredLeaves = useMemo(() => {
    if (activeTab === "all") {
      return leaves;
    }

    return leaves.filter(
      (leave) =>
        leave.status === activeTab
    );
  }, [leaves, activeTab]);

  /* ===================================================
     COUNTS
  =================================================== */

  const pendingCount = leaves.filter(
    (leave) =>
      leave.status === "pending"
  ).length;

  const approvedCount = leaves.filter(
    (leave) =>
      leave.status === "approved"
  ).length;

  const rejectedCount = leaves.filter(
    (leave) =>
      leave.status === "rejected"
  ).length;

  /* ===================================================
     FORMAT DATE
  =================================================== */

  const formatDate = (
    date?: string | null
  ) => {
    if (!date) {
      return "—";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* ===================================================
     FORMAT DATE TIME
  =================================================== */

  const formatDateTime = (
    date?: string | null
  ) => {
    if (!date) {
      return "—";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  /* ===================================================
     LEAVE LABEL
  =================================================== */

  const getLeaveTypeLabel = (
    type: LeaveRequest["leaveType"]
  ) => {
    switch (type) {
      case "casual":
        return "Casual Leave";

      case "sick":
        return "Sick Leave";

      case "earned":
        return "Earned Leave";

      case "work-from-home":
        return "Work From Home";

      case "other":
        return "Other";

      default:
        return type;
    }
  };

  /* ===================================================
     STATUS
  =================================================== */

  const getStatusClass = (
    status: LeaveRequest["status"]
  ) => {
    switch (status) {
      case "approved":
        return "border-green-400/20 bg-green-500/10 text-green-400";

      case "rejected":
        return "border-red-400/20 bg-red-500/10 text-red-400";

      case "cancelled":
        return "border-gray-400/20 bg-gray-500/10 text-gray-400";

      case "pending":
      default:
        return "border-yellow-400/20 bg-yellow-500/10 text-yellow-400";
    }
  };

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div className="min-h-screen bg-[#08050f] text-white">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-white/10 bg-[#08050f]/95 px-8 py-5">

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-2xl font-bold">
              My Leave Requests
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Apply for leave and track your
              approval status.
            </p>

          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                fetchLeaves(true)
              }
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
            >

              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh

            </button>

            <button
              onClick={() =>
                setShowApplyModal(true)
              }
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500"
            >

              <Plus className="h-4 w-4" />

              Apply Leave

            </button>

          </div>

        </div>

      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="p-8">

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-4">

          <SummaryCard
            title="Total Requests"
            value={leaves.length}
            icon={
              <FileText className="h-5 w-5 text-violet-400" />
            }
          />

          <SummaryCard
            title="Pending"
            value={pendingCount}
            icon={
              <Clock3 className="h-5 w-5 text-yellow-400" />
            }
          />

          <SummaryCard
            title="Approved"
            value={approvedCount}
            icon={
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            }
          />

          <SummaryCard
            title="Rejected"
            value={rejectedCount}
            icon={
              <XCircle className="h-5 w-5 text-red-400" />
            }
          />

        </div>

        {/* =================================================
            TABS
        ================================================= */}

        <div className="mb-6 flex flex-wrap items-center gap-2">

          {(
            [
              ["all", `All (${leaves.length})`],
              [
                "pending",
                `Pending (${pendingCount})`,
              ],
              [
                "approved",
                `Approved (${approvedCount})`,
              ],
              [
                "rejected",
                `Rejected (${rejectedCount})`,
              ],
            ] as const
          ).map(
            ([key, label]) => (
              <button
                key={key}
                onClick={() =>
                  setActiveTab(key)
                }
                className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  activeTab === key
                    ? "bg-violet-600 text-white"
                    : "border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {label}
              </button>
            )
          )}

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* =================================================
            TABLE
        ================================================= */}

        {loading ? (

          <div className="flex min-h-[300px] items-center justify-center">

            <p className="text-sm text-gray-500">
              Loading leave requests...
            </p>

          </div>

        ) : filteredLeaves.length === 0 ? (

          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#100b1d]">

            <CalendarDays className="h-12 w-12 text-gray-700" />

            <h3 className="mt-4 text-lg font-semibold">
              No leave requests
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              You have no requests in this
              category.
            </p>

            <button
              onClick={() =>
                setShowApplyModal(true)
              }
              className="mt-5 flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold hover:bg-violet-500"
            >
              <Plus className="h-4 w-4" />

              Apply Leave
            </button>

          </div>

        ) : (

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#100b1d]">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[950px]">

                <thead className="border-b border-white/10 bg-white/[0.02]">

                  <tr>

                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      #
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      Leave Type
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      From
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      To
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      Days
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      Reason
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-600">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-white/5">

                  {filteredLeaves.map(
                    (leave, index) => {

                      const days =
                        calculateDays(
                          leave.fromDate,
                          leave.toDate
                        );

                      return (
                        <tr
                          key={leave._id}
                          className="transition hover:bg-white/[0.025]"
                        >

                          <td className="px-6 py-5 text-sm text-gray-600">
                            {index + 1}
                          </td>

                          <td className="px-6 py-5">

                            <p className="font-medium text-gray-200">
                              {getLeaveTypeLabel(
                                leave.leaveType
                              )}
                            </p>

                          </td>

                          <td className="px-6 py-5 text-sm text-gray-400">
                            {formatDate(
                              leave.fromDate
                            )}
                          </td>

                          <td className="px-6 py-5 text-sm text-gray-400">
                            {formatDate(
                              leave.toDate
                            )}
                          </td>

                          <td className="px-6 py-5 text-sm text-gray-300">
                            {days}
                          </td>

                          <td className="max-w-[250px] px-6 py-5">

                            <p className="truncate text-sm text-gray-400">
                              {leave.reason}
                            </p>

                          </td>

                          <td className="px-6 py-5">

                            <span
                              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${getStatusClass(
                                leave.status
                              )}`}
                            >
                              {leave.status
                                .charAt(0)
                                .toUpperCase() +
                                leave.status.slice(
                                  1
                                )}
                            </span>

                          </td>

                          <td className="px-6 py-5 text-right">

                            <button
                              onClick={() =>
                                setSelectedLeave(
                                  leave
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-400 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-400"
                            >

                              <Eye className="h-4 w-4" />

                              View

                            </button>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          </div>
        )}

      </main>

      {/* =================================================
          APPLY MODAL
      ================================================= */}

      {showApplyModal && (

        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() =>
            setShowApplyModal(false)
          }
        >

          <div
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0f0a19] shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

              <div>

                <h2 className="text-xl font-bold">
                  Apply for Leave
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Your request will be sent to your
                  Project Manager for approval.
                </p>

              </div>

              <button
                onClick={() =>
                  setShowApplyModal(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <form
              onSubmit={submitLeave}
              className="space-y-5 p-6"
            >

              {/* LEAVE TYPE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Leave Type
                </label>

                <select
                  value={leaveType}
                  onChange={(event) =>
                    setLeaveType(
                      event.target
                        .value as LeaveRequest["leaveType"]
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#171024] px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
                >

                  <option value="casual">
                    Casual Leave
                  </option>

                  <option value="sick">
                    Sick Leave
                  </option>

                  <option value="earned">
                    Earned Leave
                  </option>

                  <option value="work-from-home">
                    Work From Home
                  </option>

                  <option value="other">
                    Other
                  </option>

                </select>

              </div>

              {/* DATES */}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    From Date
                  </label>

                  <input
                    type="date"
                    value={fromDate}
                    onChange={(event) =>
                      setFromDate(
                        event.target.value
                      )
                    }
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#171024] px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    To Date
                  </label>

                  <input
                    type="date"
                    value={toDate}
                    min={fromDate || undefined}
                    onChange={(event) =>
                      setToDate(
                        event.target.value
                      )
                    }
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#171024] px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
                  />

                </div>

              </div>

              {/* DAYS */}

              {selectedDays > 0 && (

                <div className="rounded-xl border border-violet-400/10 bg-violet-500/5 px-4 py-3">

                  <p className="text-sm text-violet-300">
                    Leave duration:{" "}
                    <span className="font-semibold">
                      {selectedDays}{" "}
                      {selectedDays === 1
                        ? "day"
                        : "days"}
                    </span>
                  </p>

                </div>
              )}

              {/* REASON */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Reason
                </label>

                <textarea
                  value={reason}
                  onChange={(event) =>
                    setReason(
                      event.target.value
                    )
                  }
                  required
                  rows={4}
                  placeholder="Explain why you need leave..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#171024] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-violet-500"
                />

              </div>

              {/* VISITING LOCATION */}

              <div>

                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">

                  <MapPin className="h-4 w-4 text-violet-400" />

                  Visiting Location
                  <span className="text-xs text-gray-600">
                    Optional
                  </span>

                </label>

                <input
                  type="text"
                  value={visitingLocation}
                  onChange={(event) =>
                    setVisitingLocation(
                      event.target.value
                    )
                  }
                  placeholder="Where will you be during leave?"
                  className="w-full rounded-xl border border-white/10 bg-[#171024] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-violet-500"
                />

              </div>

              {/* ADDITIONAL DETAILS */}

              <div>

                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">

                  <MessageSquare className="h-4 w-4 text-violet-400" />

                  Additional Details
                  <span className="text-xs text-gray-600">
                    Optional
                  </span>

                </label>

                <textarea
                  value={additionalDetails}
                  onChange={(event) =>
                    setAdditionalDetails(
                      event.target.value
                    )
                  }
                  rows={3}
                  placeholder="Any additional information..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#171024] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-violet-500"
                />

              </div>

              {/* INFO */}

              <div className="rounded-xl border border-yellow-400/10 bg-yellow-500/5 p-4">

                <p className="text-sm font-medium text-yellow-300">
                  Approval workflow
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Your request will first be reviewed
                  by your assigned Project Manager.
                  The Admin can monitor the request
                  and use administrative override when
                  required.
                </p>

              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowApplyModal(false)
                  }
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold hover:bg-violet-500 disabled:opacity-50"
                >

                  {submitting
                    ? "Submitting..."
                    : "Submit Leave Request"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      {selectedLeave && (

        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() =>
            setSelectedLeave(null)
          }
        >

          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0f0a19] shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

              <div>

                <p className="text-xs uppercase tracking-[0.18em] text-violet-400">
                  Leave Request
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  {getLeaveTypeLabel(
                    selectedLeave.leaveType
                  )}
                </h2>

              </div>

              <button
                onClick={() =>
                  setSelectedLeave(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <div className="space-y-5 p-6">

              {/* STATUS */}

              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-4">

                <div>

                  <p className="text-xs text-gray-600">
                    Current Status
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full border px-3 py-1.5 text-xs font-medium ${getStatusClass(
                      selectedLeave.status
                    )}`}
                  >
                    {selectedLeave.status
                      .charAt(0)
                      .toUpperCase() +
                      selectedLeave.status.slice(
                        1
                      )}
                  </span>

                </div>

                <Clock3 className="h-5 w-5 text-gray-600" />

              </div>

              {/* DATES */}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                <DetailBox
                  label="From Date"
                  value={formatDate(
                    selectedLeave.fromDate
                  )}
                />

                <DetailBox
                  label="To Date"
                  value={formatDate(
                    selectedLeave.toDate
                  )}
                />

                <DetailBox
                  label="Days"
                  value={String(
                    calculateDays(
                      selectedLeave.fromDate,
                      selectedLeave.toDate
                    )
                  )}
                />

              </div>

              {/* REASON */}

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">

                <p className="text-xs text-gray-600">
                  Reason
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-300">
                  {selectedLeave.reason}
                </p>

              </div>

              {/* LOCATION */}

              {selectedLeave.visitingLocation && (

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">

                  <p className="text-xs text-gray-600">
                    Visiting Location
                  </p>

                  <p className="mt-2 text-sm text-gray-300">
                    {selectedLeave.visitingLocation}
                  </p>

                </div>
              )}

              {/* ADDITIONAL DETAILS */}

              {selectedLeave.additionalDetails && (

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">

                  <p className="text-xs text-gray-600">
                    Additional Details
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-300">
                    {
                      selectedLeave.additionalDetails
                    }
                  </p>

                </div>
              )}

              {/* MANAGER COMMENT */}

              {selectedLeave.managerComment && (

                <div className="rounded-xl border border-green-400/10 bg-green-500/5 p-4">

                  <p className="text-xs font-medium text-green-400">
                    Project Manager Response
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-300">
                    {
                      selectedLeave.managerComment
                    }
                  </p>

                </div>
              )}

              {/* ADMIN COMMENT */}

              {selectedLeave.adminComment && (

                <div className="rounded-xl border border-violet-400/10 bg-violet-500/5 p-4">

                  <p className="text-xs font-medium text-violet-400">
                    Admin Response
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-300">
                    {
                      selectedLeave.adminComment
                    }
                  </p>

                </div>
              )}

              {/* REVIEWED */}

              {selectedLeave.reviewedAt && (

                <div className="text-xs text-gray-600">
                  Reviewed on{" "}
                  {formatDateTime(
                    selectedLeave.reviewedAt
                  )}
                  {selectedLeave.reviewedBy
                    ?.name
                    ? ` by ${selectedLeave.reviewedBy.name}`
                    : ""}
                </div>
              )}

              {/* CREATED */}

              <div className="text-xs text-gray-600">
                Requested on{" "}
                {formatDateTime(
                  selectedLeave.createdAt
                )}
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

/* =====================================================
   SUMMARY CARD
===================================================== */

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#100b1d] p-5">

      <div className="flex items-center justify-between">

        <p className="text-sm text-gray-500">
          {title}
        </p>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
          {icon}
        </div>

      </div>

      <p className="mt-3 text-3xl font-bold">
        {value}
      </p>

    </div>
  );
}

/* =====================================================
   DETAIL BOX
===================================================== */

function DetailBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">

      <p className="text-xs text-gray-600">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium text-gray-300">
        {value}
      </p>

    </div>
  );
}