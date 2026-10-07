"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckSquare,
  Clock3,
  RefreshCw,
  User,
} from "lucide-react";

type UserProfile = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  department?: string;
  jobTitle?: string;
  role?: string;
  status?: string;

  projectManager?: {
    _id?: string;
    name?: string;
    email?: string;
  } | null;
};

type DashboardData = {
  assignedTasks?: number;
  completedTasks?: number;
  pendingTasks?: number;
  activeProjects?: number;
  pendingLeaves?: number;

  tasks?: {
    total?: number;
    completed?: number;
    pending?: number;
  };

  projects?: {
    total?: number;
    active?: number;
  };

  leaves?: {
    total?: number;
    pending?: number;
    approved?: number;
    rejected?: number;
  };
};

type Task = {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  dueDate?: string;

  project?: {
    name?: string;
  } | null;
};

const API_BASE = "http://127.0.0.1:5000/api";

export default function EmployeeDashboard() {
  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);

  const [loading, setLoading] = useState(true);

  // =========================================================
  // INITIALS
  // =========================================================

  const getInitials = (name?: string) => {
    if (!name) {
      return "E";
    }

    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (date?: string) => {
    if (!date) {
      return "-";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // TASK STATUS LABEL
  // =========================================================

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "todo":
        return "Not Started";

      case "pending":
        return "Pending";

      case "in_progress":
        return "In Progress";

      case "in-progress":
        return "In Progress";

      case "review":
        return "Review";

      case "completed":
        return "Completed";

      default:
        return status || "Pending";
    }
  };

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusClass = (status?: string) => {
    switch (status) {
      case "completed":
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";

      case "in_progress":
      case "in-progress":
        return "border-blue-500/20 bg-blue-500/10 text-blue-400";

      case "review":
        return "border-violet-500/20 bg-violet-500/10 text-violet-400";

      default:
        return "border-amber-500/20 bg-amber-500/10 text-amber-400";
    }
  };

  // =========================================================
  // PRIORITY STYLE
  // =========================================================

  const getPriorityClass = (priority?: string) => {
    switch (priority) {
      case "critical":
        return "text-red-400";

      case "high":
        return "text-orange-400";

      case "medium":
        return "text-amber-400";

      case "low":
        return "text-emerald-400";

      default:
        return "text-slate-400";
    }
  };

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  useEffect(() => {
    const loadDashboard = async () => {
      if (typeof window === "undefined") {
        return;
      }

      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      // =====================================================
      // LOAD STORED USER FIRST
      // =====================================================

      try {
        const storedUser =
          localStorage.getItem("user");

        if (storedUser) {
          const parsedUser =
            JSON.parse(storedUser) as UserProfile;

          setProfile(parsedUser);
        }
      } catch (error) {
        console.log(
          "Unable to read stored employee:",
          error
        );
      }

      const headers: HeadersInit = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // =====================================================
      // PROFILE
      // =====================================================

      try {
        const response = await fetch(
          `${API_BASE}/employees/me`,
          {
            method: "GET",
            headers,
            cache: "no-store",
          }
        );

        if (response.ok) {
          const data = await response.json();

          const employee =
            data.employee ||
            data.user ||
            data.profile ||
            null;

          if (employee) {
            setProfile(employee);
          }
        } else {
          console.log(
            "Employee profile API returned:",
            response.status
          );
        }
      } catch (error) {
        console.log(
          "Employee profile request unavailable.",
          error
        );
      }

      // =====================================================
      // DASHBOARD
      // =====================================================

      try {
        const response = await fetch(
          `${API_BASE}/employees/dashboard`,
          {
            method: "GET",
            headers,
            cache: "no-store",
          }
        );

        if (response.ok) {
          const data = await response.json();

          setDashboard(
            data.dashboard ||
              data.data ||
              data
          );
        } else {
          console.log(
            "Employee dashboard API returned:",
            response.status
          );
        }
      } catch (error) {
        console.log(
          "Employee dashboard request unavailable.",
          error
        );
      }

      // =====================================================
      // TASKS
      // =====================================================

      try {
        const response = await fetch(
          `${API_BASE}/employees/tasks`,
          {
            method: "GET",
            headers,
            cache: "no-store",
          }
        );

        if (response.ok) {
          const data = await response.json();

          setTasks(
            data.tasks ||
              data.data ||
              []
          );
        } else {
          console.log(
            "Employee tasks API returned:",
            response.status
          );
        }
      } catch (error) {
        console.log(
          "Employee tasks request unavailable.",
          error
        );
      }

      setLoading(false);
    };

    loadDashboard();
  }, []);

  // =========================================================
  // STATISTICS
  // =========================================================

  const assignedTasks =
    dashboard?.assignedTasks ??
    dashboard?.tasks?.total ??
    tasks.length ??
    0;

  const completedTasks =
    dashboard?.completedTasks ??
    dashboard?.tasks?.completed ??
    tasks.filter(
      (task) => task.status === "completed"
    ).length;

  const pendingTasks =
    dashboard?.pendingTasks ??
    dashboard?.tasks?.pending ??
    tasks.filter(
      (task) => task.status !== "completed"
    ).length;

  const activeProjects =
    dashboard?.activeProjects ??
    dashboard?.projects?.active ??
    0;

  const pendingLeaves =
    dashboard?.pendingLeaves ??
    dashboard?.leaves?.pending ??
    0;

  const displayTasks = tasks
    .filter(
      (task) => task.status !== "completed"
    )
    .slice(0, 5);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08080d] text-white">

        <div className="text-center">

          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-violet-400" />

          <p className="mt-4 text-sm text-slate-400">
            Loading your workspace...
          </p>

        </div>

      </div>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div className="min-h-screen bg-[#08080d] text-white">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-[#09090f]/95 px-8 backdrop-blur">

        <div>

          <p className="text-xs uppercase tracking-[0.18em] text-slate-600">
            Employee Workspace
          </p>

          <h1 className="mt-1 text-lg font-semibold text-white">
            My Dashboard
          </h1>

        </div>

        {/* PROFILE TOP RIGHT */}

        <div className="flex items-center gap-3">

          <div className="hidden text-right sm:block">

            <p className="text-sm font-semibold text-white">
              {profile?.name || "Employee"}
            </p>

            <p className="text-xs text-slate-500">
              {profile?.jobTitle || "Employee"}
            </p>

          </div>

          <Link
            href="/dashboard/employee/profile"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-sm font-bold text-violet-300 transition hover:border-violet-500/40 hover:bg-violet-500/20"
          >
            {getInitials(profile?.name)}
          </Link>

        </div>

      </header>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="p-8">

        {/* ===================================================
            WELCOME
        ==================================================== */}

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <p className="mb-2 text-sm text-violet-400">
              Welcome back 👋
            </p>

            <h2 className="text-3xl font-bold tracking-tight">
              {profile?.name || "Employee"}
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Stay focused and keep making
              progress in your workspace.
            </p>

          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#11111a] px-4 py-3 text-sm text-slate-300">

            <CalendarDays className="h-4 w-4 text-violet-400" />

            {new Date().toLocaleDateString(
              "en-IN",
              {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            )}

          </div>

        </div>

        {/* ===================================================
            PROFILE STRIP
        ==================================================== */}

        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#11111a] p-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600/15 text-lg font-bold text-violet-300">
              {getInitials(profile?.name)}
            </div>

            <div>

              <h3 className="font-semibold text-white">
                {profile?.name || "Employee"}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {profile?.department ||
                  "Department"}

                {profile?.jobTitle
                  ? ` • ${profile.jobTitle}`
                  : ""}
              </p>

            </div>

          </div>

          <div className="flex flex-wrap items-center gap-3">

            {profile?.projectManager && (
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-slate-400">

                <User className="h-4 w-4 text-violet-400" />

                PM:

                <span className="font-medium text-slate-200">
                  {profile.projectManager.name}
                </span>

              </div>
            )}

            <Link
              href="/dashboard/employee/profile"
              className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-white"
            >
              <User className="h-4 w-4" />

              View Profile
            </Link>

          </div>

        </div>

        {/* ===================================================
            STATISTICS
        ==================================================== */}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* MY TASKS */}

          <div className="rounded-2xl border border-white/10 bg-[#11111a] p-5">

            <div className="mb-4 flex items-center justify-between">

              <span className="text-sm text-slate-400">
                My Tasks
              </span>

              <CheckSquare className="h-5 w-5 text-violet-400" />

            </div>

            <div className="text-3xl font-bold">
              {assignedTasks}
            </div>

            <p className="mt-1 text-xs text-slate-500">
              {completedTasks} completed
            </p>

          </div>

          {/* PENDING */}

          <div className="rounded-2xl border border-white/10 bg-[#11111a] p-5">

            <div className="mb-4 flex items-center justify-between">

              <span className="text-sm text-slate-400">
                Pending Tasks
              </span>

              <Clock3 className="h-5 w-5 text-amber-400" />

            </div>

            <div className="text-3xl font-bold">
              {pendingTasks}
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Tasks requiring attention
            </p>

          </div>

          {/* ACTIVE PROJECTS */}

          <div className="rounded-2xl border border-white/10 bg-[#11111a] p-5">

            <div className="mb-4 flex items-center justify-between">

              <span className="text-sm text-slate-400">
                Active Projects
              </span>

              <BriefcaseBusiness className="h-5 w-5 text-blue-400" />

            </div>

            <div className="text-3xl font-bold">
              {activeProjects}
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Projects currently active
            </p>

          </div>

          {/* LEAVES */}

          <div className="rounded-2xl border border-white/10 bg-[#11111a] p-5">

            <div className="mb-4 flex items-center justify-between">

              <span className="text-sm text-slate-400">
                Leave Requests
              </span>

              <CalendarDays className="h-5 w-5 text-emerald-400" />

            </div>

            <div className="text-3xl font-bold">
              {pendingLeaves}
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Pending requests
            </p>

          </div>

        </div>

        {/* ===================================================
            MY TASKS
        ==================================================== */}

        <div className="rounded-2xl border border-white/10 bg-[#11111a]">

          <div className="flex flex-col gap-4 border-b border-white/10 p-6 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h3 className="text-lg font-semibold text-white">
                My Tasks
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Tasks assigned by your Project Manager.
              </p>

            </div>

            <Link
              href="/dashboard/employee/tasks"
              className="flex items-center gap-2 text-sm font-medium text-violet-400 transition hover:text-violet-300"
            >
              View All

              <ArrowRight className="h-4 w-4" />

            </Link>

          </div>

          {displayTasks.length === 0 ? (

            <div className="px-6 py-14 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02]">

                <CheckSquare className="h-6 w-6 text-slate-600" />

              </div>

              <h4 className="mt-4 font-medium text-slate-300">
                No active tasks
              </h4>

              <p className="mt-1 text-sm text-slate-600">
                Your assigned tasks will appear
                here.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-white/10">

              {displayTasks.map((task) => (

                <div
                  key={
                    task._id ||
                    task.id ||
                    task.title
                  }
                  className="flex flex-col gap-4 p-5 transition hover:bg-white/[0.02] lg:flex-row lg:items-center lg:justify-between"
                >

                  <div className="min-w-0">

                    <h4 className="font-medium text-white">
                      {task.title}
                    </h4>

                    <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                      {task.description ||
                        "No description"}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">

                      <span className="text-slate-500">
                        {task.project?.name ||
                          "Project"}
                      </span>

                      <span className="text-slate-700">
                        •
                      </span>

                      <span className="text-slate-500">
                        Due{" "}
                        {formatDate(
                          task.dueDate
                        )}
                      </span>

                      <span
                        className={`font-medium capitalize ${getPriorityClass(
                          task.priority
                        )}`}
                      >
                        {task.priority ||
                          "medium"}
                      </span>

                    </div>

                  </div>

                  <span
                    className={`w-fit rounded-lg border px-3 py-1.5 text-xs font-medium ${getStatusClass(
                      task.status
                    )}`}
                  >
                    {getStatusLabel(
                      task.status
                    )}
                  </span>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* ===================================================
            QUICK ACTIONS
        ==================================================== */}

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* LEAVE */}

          <Link
            href="/dashboard/employee/leave-requests"
            className="group rounded-2xl border border-white/10 bg-[#11111a] p-5 transition hover:border-violet-500/30 hover:bg-violet-500/[0.04]"
          >

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">

                <CalendarDays className="h-5 w-5" />

              </div>

              <ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-1 group-hover:text-violet-400" />

            </div>

            <h3 className="mt-4 font-semibold text-white">
              Leave Requests
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Apply for leave and track approval
              status.
            </p>

          </Link>

          {/* PROFILE */}

          <Link
            href="/dashboard/employee/profile"
            className="group rounded-2xl border border-white/10 bg-[#11111a] p-5 transition hover:border-violet-500/30 hover:bg-violet-500/[0.04]"
          >

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">

                <User className="h-5 w-5" />

              </div>

              <ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-1 group-hover:text-violet-400" />

            </div>

            <h3 className="mt-4 font-semibold text-white">
              My Profile
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              View and manage your employee
              information.
            </p>

          </Link>

        </div>

      </div>

    </div>
  );
}