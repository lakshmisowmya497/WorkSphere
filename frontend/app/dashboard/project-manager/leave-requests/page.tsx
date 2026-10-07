"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  Plus,
  RefreshCw,
  Send,
  X,
  XCircle,
} from "lucide-react";

interface LeaveUser {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
  role?: string;
  status?: string;
}

interface LeaveRequest {
  _id: string;

  requester?: LeaveUser | null;

  employee?: LeaveUser | null;

  projectManager?: LeaveUser | null;

  approvalLevel?: "project_manager" | "admin";

  leaveType:
    | "casual"
    | "sick"
    | "earned"
    | "work-from-home"
    | "other"
    | string;

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

  reviewedBy?: LeaveUser | null;

  reviewedAt?: string | null;

  createdAt: string;
}

interface LeaveForm {
  leaveType: string;
  fromDate: string;
  toDate: string;
  visitingLocation: string;
  reason: string;
  additionalDetails: string;
}

const API_BASE = "http://localhost:5000/api";

const initialForm: LeaveForm = {
  leaveType: "casual",
  fromDate: "",
  toDate: "",
  visitingLocation: "",
  reason: "",
  additionalDetails: "",
};

export default function ProjectManagerLeaveRequestsPage() {
  const [activeTab, setActiveTab] = useState<"mine" | "team">("mine");

  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [teamRequests, setTeamRequests] = useState<LeaveRequest[]>([]);

  const [form, setForm] = useState<LeaveForm>(initialForm);

  const [showForm, setShowForm] = useState(false);

  const [loadingMine, setLoadingMine] = useState(true);
  const [loadingTeam, setLoadingTeam] = useState(false);

  const [submitting, setSubmitting] = useState(false);

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
      Authorization: `Bearer ${token || ""}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  // =====================================================
  // HELPERS
  // =====================================================

  const getDateOnly = (date: string) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getLeaveTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      casual: "Casual Leave",
      sick: "Sick Leave",
      earned: "Earned Leave",
      "work-from-home": "Work From Home",
      other: "Other",
    };

    return labels[type] || type;
  };

  const getStatusClass = (status: string) => {
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

  // =====================================================
  // GET PM'S OWN LEAVE REQUESTS
  // CORRECT BACKEND ROUTE:
  // GET /api/leaves/my
  // =====================================================

  const fetchMyRequests = async () => {
    try {
      setLoadingMine(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/leaves/my`,
        {
          method: "GET",
          headers: authHeaders,
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load your leave requests"
        );
      }

      const requests =
        data.leaves ||
        data.leaveRequests ||
        data.requests ||
        [];

      setMyRequests(
        Array.isArray(requests) ? requests : []
      );
    } catch (err: any) {
      console.error(
        "Fetch PM leave requests error:",
        err
      );

      setError(
        err.message ||
          "Failed to load your leave requests"
      );

      setMyRequests([]);
    } finally {
      setLoadingMine(false);
    }
  };

  // =====================================================
  // GET EMPLOYEE TEAM LEAVE REQUESTS
  //
  // CORRECT BACKEND ROUTE:
  // GET /api/project-manager/leaves/team
  // =====================================================

  const fetchTeamRequests = async () => {
    try {
      setLoadingTeam(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/project-manager/leaves/team`,
        {
          method: "GET",
          headers: authHeaders,
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load team leave requests"
        );
      }

      const requests =
        data.leaves ||
        data.leaveRequests ||
        data.requests ||
        [];

      setTeamRequests(
        Array.isArray(requests) ? requests : []
      );
    } catch (err: any) {
      console.error(
        "Fetch team leave requests error:",
        err
      );

      setError(
        err.message ||
          "Failed to load team leave requests"
      );

      setTeamRequests([]);
    } finally {
      setLoadingTeam(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchMyRequests();
    fetchTeamRequests();
  }, []);

  // =====================================================
  // APPLY LEAVE
  //
  // CORRECT BACKEND ROUTE:
  // POST /api/leaves
  // =====================================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.fromDate || !form.toDate) {
      setError(
        "Please select both start and end dates."
      );
      return;
    }

    if (form.toDate < form.fromDate) {
      setError(
        "End date cannot be before start date."
      );
      return;
    }

    if (!form.reason.trim()) {
      setError(
        "Please enter a reason for the leave."
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `${API_BASE}/leaves`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            leaveType: form.leaveType,
            fromDate: form.fromDate,
            toDate: form.toDate,
            visitingLocation:
              form.visitingLocation.trim(),
            reason: form.reason.trim(),
            additionalDetails:
              form.additionalDetails.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to submit leave request"
        );
      }

      setSuccess(
        "Leave request submitted to Admin successfully."
      );

      setForm(initialForm);
      setShowForm(false);

      await fetchMyRequests();
    } catch (err: any) {
      console.error(
        "Submit PM leave error:",
        err
      );

      setError(
        err.message ||
          "Failed to submit leave request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // APPROVE / REJECT EMPLOYEE LEAVE
  //
  // APPROVE:
  // PATCH /api/project-manager/leaves/:id/approve
  //
  // REJECT:
  // PATCH /api/project-manager/leaves/:id/reject
  // =====================================================

  const handleTeamAction = async (
    id: string,
    action: "approve" | "reject"
  ) => {
    let managerComment = "";

    if (action === "reject") {
      managerComment =
        window.prompt(
          "Enter the reason for rejecting this leave request:"
        ) || "";

      if (!managerComment.trim()) {
        setError(
          "A rejection reason is required."
        );
        return;
      }
    } else {
      const confirmed = window.confirm(
        "Are you sure you want to approve this leave request?"
      );

      if (!confirmed) {
        return;
      }

      managerComment =
        window.prompt(
          "Optional approval comment (click Cancel to leave it blank):"
        ) || "";
    }

    try {
      setProcessingId(id);
      setError("");
      setSuccess("");

      const endpoint =
        action === "approve"
          ? `${API_BASE}/project-manager/leaves/${id}/approve`
          : `${API_BASE}/project-manager/leaves/${id}/reject`;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({
          managerComment:
            managerComment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to ${action} leave request`
        );
      }

      setSuccess(
        action === "approve"
          ? "Employee leave request approved successfully."
          : "Employee leave request rejected successfully."
      );

      // Reload both lists so counts/statuses are correct.
      await Promise.all([
        fetchTeamRequests(),
        fetchMyRequests(),
      ]);
    } catch (err: any) {
      console.error(
        "Team leave action error:",
        err
      );

      setError(
        err.message ||
          `Failed to ${action} leave request`
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =====================================================
  // COUNTS
  // =====================================================

  const pendingMine = myRequests.filter(
    (request) => request.status === "pending"
  ).length;

  const approvedMine = myRequests.filter(
    (request) => request.status === "approved"
  ).length;

  const pendingTeam = teamRequests.filter(
    (request) =>
      request.status === "pending" &&
      request.approvalLevel === "project_manager"
  ).length;

  // =====================================================
  // EMPTY STATE
  // =====================================================

  const renderEmptyState = (
    title: string,
    description: string
  ) => (
    <div className="rounded-2xl border border-white/10 bg-[#11111a] px-6 py-14 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10">
        <FileText className="h-6 w-6 text-violet-400" />
      </div>

      <h3 className="text-lg font-semibold text-white">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        {description}
      </p>
    </div>
  );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#08080d] px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-violet-400">
              <FileText className="h-4 w-4" />
              Leave Management
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              Leave Requests
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Submit your leave requests to Admin and
              manage leave requests from your team.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setError("");
                setSuccess("");

                if (activeTab === "mine") {
                  fetchMyRequests();
                } else {
                  fetchTeamRequests();
                }
              }}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

            <button
              onClick={() => {
                setError("");
                setSuccess("");
                setShowForm(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:bg-violet-500"
            >
              <Plus className="h-4 w-4" />
              Apply Leave
            </button>
          </div>
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
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-[#11111a] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">
                My Requests
              </span>

              <FileText className="h-5 w-5 text-violet-400" />
            </div>

            <div className="text-3xl font-bold">
              {myRequests.length}
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Total requests submitted
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#11111a] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">
                Pending My Requests
              </span>

              <Clock3 className="h-5 w-5 text-amber-400" />
            </div>

            <div className="text-3xl font-bold">
              {pendingMine}
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Waiting for Admin approval
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#11111a] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">
                Team Pending
              </span>

              <Clock3 className="h-5 w-5 text-orange-400" />
            </div>

            <div className="text-3xl font-bold">
              {pendingTeam}
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Team requests awaiting your action
            </p>
          </div>

        </div>

        {/* TABS */}
        <div className="mb-6 flex gap-2 rounded-2xl border border-white/10 bg-[#0d0d14] p-2">

          <button
            onClick={() => {
              setActiveTab("mine");
              setError("");
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === "mine"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-900/20"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <FileText className="h-4 w-4" />
            My Leave Requests

            {myRequests.length > 0 && (
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">
                {myRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("team");
              setError("");

              // Immediately load team requests.
              fetchTeamRequests();
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === "team"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-900/20"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            Team Requests

            {pendingTeam > 0 && (
              <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
                {pendingTeam}
              </span>
            )}
          </button>

        </div>

        {/* ================================================= */}
        {/* MY REQUESTS */}
        {/* ================================================= */}

        {activeTab === "mine" && (
          <>
            {loadingMine ? (
              <div className="rounded-2xl border border-white/10 bg-[#11111a] px-6 py-16 text-center">
                <RefreshCw className="mx-auto h-7 w-7 animate-spin text-violet-400" />

                <p className="mt-4 text-sm text-slate-400">
                  Loading your leave requests...
                </p>
              </div>
            ) : myRequests.length === 0 ? (
              renderEmptyState(
                "No leave requests yet",
                "You have not submitted any leave request. Click Apply Leave to submit one to Admin."
              )
            ) : (
              <div className="space-y-4">

                {myRequests.map((request) => (
                  <div
                    key={request._id}
                    className="rounded-2xl border border-white/10 bg-[#11111a] p-5 transition hover:border-violet-500/20"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                      <div className="min-w-0 flex-1">

                        <div className="mb-3 flex flex-wrap items-center gap-2">

                          <span className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-300">
                            {getLeaveTypeLabel(
                              request.leaveType
                            )}
                          </span>

                          <span
                            className={`rounded-lg border px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(
                              request.status
                            )}`}
                          >
                            {request.status}
                          </span>

                        </div>

                        <div className="grid gap-4 md:grid-cols-2">

                          <div>
                            <p className="mb-1 text-xs text-slate-500">
                              Leave Period
                            </p>

                            <div className="flex items-center gap-2 text-sm text-slate-200">
                              <CalendarDays className="h-4 w-4 text-violet-400" />

                              {getDateOnly(
                                request.fromDate
                              )}

                              <span className="text-slate-600">
                                →
                              </span>

                              {getDateOnly(
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

                        </div>

                        <div className="mt-5">
                          <p className="mb-1 text-xs text-slate-500">
                            Reason
                          </p>

                          <p className="text-sm leading-6 text-slate-300">
                            {request.reason}
                          </p>
                        </div>

                        {request.additionalDetails && (
                          <div className="mt-4">
                            <p className="mb-1 text-xs text-slate-500">
                              Additional Details
                            </p>

                            <p className="text-sm leading-6 text-slate-400">
                              {request.additionalDetails}
                            </p>
                          </div>
                        )}

                        {request.adminComment && (
                          <div className="mt-4 rounded-xl border border-violet-500/10 bg-violet-500/5 p-3">
                            <p className="mb-1 text-xs font-medium text-violet-400">
                              Admin Comment
                            </p>

                            <p className="text-sm text-slate-300">
                              {request.adminComment}
                            </p>
                          </div>
                        )}

                      </div>

                      <div className="shrink-0">
                        {request.status === "approved" && (
                          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" />
                            Approved by Admin
                          </div>
                        )}

                        {request.status === "pending" && (
                          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-400">
                            Waiting for Admin
                          </div>
                        )}

                        {request.status === "rejected" && (
                          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400">
                            Rejected by Admin
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                ))}

              </div>
            )}
          </>
        )}

        {/* ================================================= */}
        {/* TEAM REQUESTS */}
        {/* ================================================= */}

        {activeTab === "team" && (
          <>
            {loadingTeam ? (
              <div className="rounded-2xl border border-white/10 bg-[#11111a] px-6 py-16 text-center">
                <RefreshCw className="mx-auto h-7 w-7 animate-spin text-violet-400" />

                <p className="mt-4 text-sm text-slate-400">
                  Loading team leave requests...
                </p>
              </div>
            ) : teamRequests.length === 0 ? (
              renderEmptyState(
                "No team leave requests",
                "Leave requests submitted by your team members will appear here."
              )
            ) : (
              <div className="space-y-4">

                {teamRequests.map((request) => {
                  const employee =
                    request.employee ||
                    request.requester;

                  return (
                    <div
                      key={request._id}
                      className="rounded-2xl border border-white/10 bg-[#11111a] p-5 transition hover:border-violet-500/20"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                        <div className="flex min-w-0 flex-1 gap-4">

                          {/* AVATAR */}
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-sm font-bold text-violet-300">
                            {(employee?.name || "U")
                              .split(" ")
                              .map(
                                (part) =>
                                  part[0]
                              )
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="mb-2 flex flex-wrap items-center gap-2">

                              <h3 className="font-semibold text-white">
                                {employee?.name ||
                                  "Team Member"}
                              </h3>

                              <span
                                className={`rounded-lg border px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(
                                  request.status
                                )}`}
                              >
                                {request.status}
                              </span>

                            </div>

                            <p className="text-xs text-slate-500">
                              {employee?.jobTitle ||
                                employee?.department ||
                                employee?.email ||
                                "Team Member"}
                            </p>

                            <div className="mt-5 grid gap-4 md:grid-cols-2">

                              <div>
                                <p className="mb-1 text-xs text-slate-500">
                                  Leave Type
                                </p>

                                <p className="text-sm text-slate-200">
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

                                  {getDateOnly(
                                    request.fromDate
                                  )}

                                  <span className="text-slate-600">
                                    →
                                  </span>

                                  {getDateOnly(
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

                                <p className="text-sm text-slate-300">
                                  {getDateOnly(
                                    request.createdAt
                                  )}
                                </p>
                              </div>

                            </div>

                            <div className="mt-5">
                              <p className="mb-1 text-xs text-slate-500">
                                Reason
                              </p>

                              <p className="text-sm leading-6 text-slate-300">
                                {request.reason}
                              </p>
                            </div>

                            {request.additionalDetails && (
                              <div className="mt-4">
                                <p className="mb-1 text-xs text-slate-500">
                                  Additional Details
                                </p>

                                <p className="text-sm leading-6 text-slate-400">
                                  {request.additionalDetails}
                                </p>
                              </div>
                            )}

                            {request.managerComment && (
                              <div className="mt-4 rounded-xl border border-violet-500/10 bg-violet-500/5 p-3">
                                <p className="mb-1 text-xs font-medium text-violet-400">
                                  Manager Comment
                                </p>

                                <p className="text-sm text-slate-300">
                                  {request.managerComment}
                                </p>
                              </div>
                            )}

                          </div>
                        </div>

                        {/* ACTIONS */}
                        {request.status === "pending" && (
                          <div className="flex shrink-0 gap-2">

                            <button
                              onClick={() =>
                                handleTeamAction(
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

                              {processingId ===
                              request._id
                                ? "Processing..."
                                : "Reject"}
                            </button>

                            <button
                              onClick={() =>
                                handleTeamAction(
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

                              {processingId ===
                              request._id
                                ? "Processing..."
                                : "Approve"}
                            </button>

                          </div>
                        )}

                      </div>
                    </div>
                  );
                })}

              </div>
            )}
          </>
        )}

        {/* ================================================= */}
        {/* APPLY LEAVE MODAL */}
        {/* ================================================= */}

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#101018] shadow-2xl shadow-black/50">

              <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-[#101018] px-6 py-5">

                <div>
                  <h2 className="text-xl font-bold text-white">
                    Apply for Leave
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Your request will be sent to Admin for approval.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowForm(false)
                  }
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5 p-6"
              >

                {/* LEAVE TYPE */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Leave Type
                  </label>

                  <select
                    value={form.leaveType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        leaveType:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#0b0b11] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-500"
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
                <div className="grid gap-5 md:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      From Date
                    </label>

                    <input
                      type="date"
                      value={form.fromDate}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          fromDate:
                            e.target.value,
                        })
                      }
                      required
                      className="w-full rounded-xl border border-white/10 bg-[#0b0b11] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      To Date
                    </label>

                    <input
                      type="date"
                      value={form.toDate}
                      min={
                        form.fromDate ||
                        undefined
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          toDate:
                            e.target.value,
                        })
                      }
                      required
                      className="w-full rounded-xl border border-white/10 bg-[#0b0b11] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-500"
                    />
                  </div>

                </div>

                {/* LOCATION */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Visiting Location
                  </label>

                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                    <input
                      type="text"
                      value={
                        form.visitingLocation
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          visitingLocation:
                            e.target.value,
                        })
                      }
                      placeholder="e.g. Tadepalligudem, Andhra Pradesh"
                      className="w-full rounded-xl border border-white/10 bg-[#0b0b11] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500"
                    />
                  </div>
                </div>

                {/* REASON */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Reason
                  </label>

                  <textarea
                    value={form.reason}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        reason:
                          e.target.value,
                      })
                    }
                    required
                    rows={4}
                    placeholder="Explain the reason for your leave..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-[#0b0b11] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500"
                  />
                </div>

                {/* ADDITIONAL DETAILS */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Additional Details

                    <span className="ml-2 text-xs text-slate-600">
                      Optional
                    </span>
                  </label>

                  <textarea
                    value={
                      form.additionalDetails
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        additionalDetails:
                          e.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Any additional information..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-[#0b0b11] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500"
                  />
                </div>

                {/* BUTTONS */}
                <div className="flex justify-end gap-3 border-t border-white/10 pt-5">

                  <button
                    type="button"
                    onClick={() =>
                      setShowForm(false)
                    }
                    className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}

                    {submitting
                      ? "Submitting..."
                      : "Submit Request"}
                  </button>

                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}