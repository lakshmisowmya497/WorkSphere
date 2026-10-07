"use client";

import { useEffect, useState } from "react";

import {
  Search,
  Plus,
  Pencil,
  Trash2,
  UserRound,
  FolderKanban,
  Clock3,
  MessageSquare,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  X,
  UserCheck,
  UsersRound,
} from "lucide-react";

/* =====================================================
   TYPES
===================================================== */

interface Person {
  _id: string;
  name: string;
  email: string;
  department?: string;
  jobTitle?: string;
  status?: string;
}

interface Project {
  _id: string;
  name: string;
  status?: string;
}

interface TaskSubmission {
  submitted?: boolean;
  evidenceImage?: string;
  completionComment?: string;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  reviewComment?: string;
  rejectionReason?: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;

  project: Project | null;

  projectManager: Person | null;

  assignedEmployee: Person | null;

  priority:
    | "low"
    | "medium"
    | "high"
    | "critical";

  status:
    | "todo"
    | "in_progress"
    | "review"
    | "completed";

  dueDate: string;

  createdAt?: string;
  updatedAt?: string;

  submission?: TaskSubmission;
}

/* =====================================================
   PAGE
===================================================== */

export default function TasksPage() {
  const API_BASE = "http://localhost:5000/api";

  /* =====================================================
     STATE
  ===================================================== */

  const [tasks, setTasks] = useState<Task[]>([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [statusMenu, setStatusMenu] =
    useState<string | null>(null);

  const [priorityMenu, setPriorityMenu] =
    useState<string | null>(null);

  const [updating, setUpdating] =
    useState<string | null>(null);

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  /* =====================================================
     TOKEN
  ===================================================== */

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

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("user");

    window.location.href = "/login";
  };

  /* =====================================================
     FETCH TASKS
  ===================================================== */

  const fetchTasks = async (
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
        handleLogout();
        return;
      }

      const response = await fetch(
        `${API_BASE}/admin/tasks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch tasks."
        );
      }

      setTasks(
        Array.isArray(data.tasks)
          ? data.tasks
          : []
      );
    } catch (err) {
      console.error(
        "Fetch admin tasks error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load tasks."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredTasks = tasks.filter((task) => {
    const searchText = search
      .toLowerCase()
      .trim();

    if (!searchText) {
      return true;
    }

    return (
      task.title
        ?.toLowerCase()
        .includes(searchText) ||
      task.description
        ?.toLowerCase()
        .includes(searchText) ||
      task.project?.name
        ?.toLowerCase()
        .includes(searchText) ||
      task.projectManager?.name
        ?.toLowerCase()
        .includes(searchText) ||
      task.assignedEmployee?.name
        ?.toLowerCase()
        .includes(searchText) ||
      task.status
        ?.toLowerCase()
        .includes(searchText) ||
      task.priority
        ?.toLowerCase()
        .includes(searchText) ||
      task.submission?.completionComment
        ?.toLowerCase()
        .includes(searchText) ||
      task.submission?.reviewComment
        ?.toLowerCase()
        .includes(searchText) ||
      task.submission?.rejectionReason
        ?.toLowerCase()
        .includes(searchText)
    );
  });

  /* =====================================================
     DATE
  ===================================================== */

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

  /* =====================================================
     LABELS
  ===================================================== */

  const getStatusLabel = (
    status: Task["status"]
  ) => {
    switch (status) {
      case "todo":
        return "To Do";

      case "in_progress":
        return "In Progress";

      case "review":
        return "Under Review";

      case "completed":
        return "Completed";

      default:
        return status;
    }
  };

  const getPriorityLabel = (
    priority: Task["priority"]
  ) => {
    switch (priority) {
      case "low":
        return "Low";

      case "medium":
        return "Medium";

      case "high":
        return "High";

      case "critical":
        return "Critical";

      default:
        return priority;
    }
  };

  /* =====================================================
     STATUS STYLE
  ===================================================== */

  const getStatusStyle = (
    status: Task["status"]
  ) => {
    switch (status) {
      case "completed":
        return "border-green-400/20 bg-green-500/10 text-green-400";

      case "in_progress":
        return "border-blue-400/20 bg-blue-500/10 text-blue-400";

      case "review":
        return "border-yellow-400/20 bg-yellow-500/10 text-yellow-400";

      case "todo":
      default:
        return "border-violet-400/20 bg-violet-500/10 text-violet-400";
    }
  };

  /* =====================================================
     PRIORITY STYLE
  ===================================================== */

  const getPriorityStyle = (
    priority: Task["priority"]
  ) => {
    switch (priority) {
      case "critical":
        return "border-red-400/20 bg-red-500/10 text-red-400";

      case "high":
        return "border-orange-400/20 bg-orange-500/10 text-orange-400";

      case "medium":
        return "border-yellow-400/20 bg-yellow-500/10 text-yellow-400";

      case "low":
      default:
        return "border-gray-400/20 bg-gray-500/10 text-gray-400";
    }
  };

  /* =====================================================
     UPDATE STATUS
  ===================================================== */

  const updateStatus = async (
    taskId: string,
    status: Task["status"]
  ) => {
    try {
      setUpdating(taskId);
      setStatusMenu(null);

      const token = getToken();

      if (!token) {
        handleLogout();
        return;
      }

      const response = await fetch(
        `${API_BASE}/admin/tasks/${taskId}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            status,
          }),
        }
      );

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update task status."
        );
      }

      setTasks((current) =>
        current.map((task) =>
          task._id === taskId
            ? {
                ...task,
                status,
              }
            : task
        )
      );

      setSelectedTask((current) =>
        current?._id === taskId
          ? {
              ...current,
              status,
            }
          : current
      );
    } catch (err) {
      console.error(
        "Update task status error:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Failed to update task status."
      );
    } finally {
      setUpdating(null);
    }
  };

  /* =====================================================
     UPDATE PRIORITY
  ===================================================== */

  const updatePriority = async (
    taskId: string,
    priority: Task["priority"]
  ) => {
    try {
      setUpdating(taskId);
      setPriorityMenu(null);

      const token = getToken();

      if (!token) {
        handleLogout();
        return;
      }

      const response = await fetch(
        `${API_BASE}/admin/tasks/${taskId}/priority`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            priority,
          }),
        }
      );

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update task priority."
        );
      }

      setTasks((current) =>
        current.map((task) =>
          task._id === taskId
            ? {
                ...task,
                priority,
              }
            : task
        )
      );

      setSelectedTask((current) =>
        current?._id === taskId
          ? {
              ...current,
              priority,
            }
          : current
      );
    } catch (err) {
      console.error(
        "Update task priority error:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Failed to update task priority."
      );
    } finally {
      setUpdating(null);
    }
  };

  /* =====================================================
     DELETE
  ===================================================== */

  const deleteTask = async (
    taskId: string
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        handleLogout();
        return;
      }

      const response = await fetch(
        `${API_BASE}/admin/tasks/${taskId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete task."
        );
      }

      setTasks((current) =>
        current.filter(
          (task) =>
            task._id !== taskId
        )
      );

      if (
        selectedTask?._id === taskId
      ) {
        setSelectedTask(null);
      }
    } catch (err) {
      console.error(
        "Delete task error:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete task."
      );
    }
  };

  /* =====================================================
     COUNTS
  ===================================================== */

  const todoCount = tasks.filter(
    (task) => task.status === "todo"
  ).length;

  const inProgressCount = tasks.filter(
    (task) =>
      task.status === "in_progress"
  ).length;

  const reviewCount = tasks.filter(
    (task) =>
      task.status === "review" &&
      task.submission?.submitted
  ).length;

  const completedCount = tasks.filter(
    (task) =>
      task.status === "completed"
  ).length;

  /* =====================================================
     SUBMISSION
  ===================================================== */

  const hasSubmission = (
    task: Task
  ) => {
    return Boolean(
      task.submission?.submitted
    );
  };

  const getReviewDecision = (
    task: Task
  ) => {
    if (
      task.status === "completed" &&
      task.submission?.submitted
    ) {
      return "approved";
    }

    if (
      task.submission?.rejectionReason
    ) {
      return "rejected";
    }

    if (
      task.status === "review" &&
      task.submission?.submitted
    ) {
      return "pending";
    }

    return "none";
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#08050f] text-white">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-white/10 bg-[#08050f]/95 px-8 py-5">

        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold">
              Tasks
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Monitor tasks, assignments,
              submissions and project progress.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                fetchTasks(true)
              }
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
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
                (window.location.href =
                  "/dashboard/admin/tasks/add")
              }
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500"
            >
              <Plus className="h-4 w-4" />

              Add Task
            </button>

          </div>
        </div>
      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="p-8">

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-5">

          <div className="rounded-2xl border border-white/10 bg-[#100b1d] p-5">
            <p className="text-sm text-gray-500">
              Total Tasks
            </p>

            <p className="mt-2 text-3xl font-bold">
              {tasks.length}
            </p>
          </div>

          <div className="rounded-2xl border border-violet-400/10 bg-[#100b1d] p-5">
            <p className="text-sm text-gray-500">
              To Do
            </p>

            <p className="mt-2 text-3xl font-bold text-violet-400">
              {todoCount}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-400/10 bg-[#100b1d] p-5">
            <p className="text-sm text-gray-500">
              In Progress
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-400">
              {inProgressCount}
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-400/10 bg-[#100b1d] p-5">
            <p className="text-sm text-gray-500">
              Pending Reviews
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-400">
              {reviewCount}
            </p>
          </div>

          <div className="rounded-2xl border border-green-400/10 bg-[#100b1d] p-5">
            <p className="text-sm text-gray-500">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold text-green-400">
              {completedCount}
            </p>
          </div>

        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="mb-7">

          <div className="relative max-w-4xl">

            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search tasks, projects, managers, employees, comments..."
              className="w-full rounded-xl border border-white/10 bg-[#100b1d] py-3 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-violet-500/50"
            />

          </div>
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
            LOADING
        ================================================= */}

        {loading ? (

          <div className="flex min-h-[300px] items-center justify-center">

            <p className="text-sm text-gray-500">
              Loading tasks...
            </p>

          </div>

        ) : filteredTasks.length === 0 ? (

          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#100b1d]">

            <ClipboardListIcon />

            <h3 className="mt-4 text-lg font-semibold">
              {search
                ? "No tasks found"
                : "No tasks yet"}
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              {search
                ? "Try a different search."
                : "Create your first task to get started."}
            </p>

            {!search && (
              <button
                onClick={() =>
                  (window.location.href =
                    "/dashboard/admin/tasks/add")
                }
                className="mt-5 flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-violet-500"
              >
                <Plus className="h-4 w-4" />

                Add Task
              </button>
            )}

          </div>

        ) : (

          /* =================================================
             TASK CARDS
          ================================================= */

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

            {filteredTasks.map((task) => {

              const submissionExists =
                hasSubmission(task);

              const reviewDecision =
                getReviewDecision(task);

              return (
                <div
                  key={task._id}
                  className="group rounded-2xl border border-white/10 bg-[#100b1d] p-6 transition hover:border-violet-500/30 hover:bg-[#120d21]"
                >

                  {/* TOP */}

                  <div className="flex items-start justify-between gap-4">

                    <div className="min-w-0">

                      <h3 className="truncate text-lg font-semibold text-white">
                        {task.title}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                        {task.description}
                      </p>

                    </div>

                    {/* STATUS */}

                    <div className="relative shrink-0">

                      <button
                        type="button"
                        disabled={
                          updating ===
                          task._id
                        }
                        onClick={() =>
                          setStatusMenu(
                            statusMenu ===
                              task._id
                              ? null
                              : task._id
                          )
                        }
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${getStatusStyle(
                          task.status
                        )}`}
                      >
                        {updating ===
                        task._id
                          ? "Updating..."
                          : getStatusLabel(
                              task.status
                            )}
                      </button>

                      {statusMenu ===
                        task._id && (

                        <div className="absolute right-0 top-10 z-30 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#171024] p-1 shadow-2xl">

                          <button
                            onClick={() =>
                              updateStatus(
                                task._id,
                                "todo"
                              )
                            }
                            className="w-full rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/5"
                          >
                            To Do
                          </button>

                          <button
                            onClick={() =>
                              updateStatus(
                                task._id,
                                "in_progress"
                              )
                            }
                            className="w-full rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/5"
                          >
                            In Progress
                          </button>

                          <button
                            onClick={() =>
                              updateStatus(
                                task._id,
                                "review"
                              )
                            }
                            className="w-full rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/5"
                          >
                            Under Review
                          </button>

                          <button
                            onClick={() =>
                              updateStatus(
                                task._id,
                                "completed"
                              )
                            }
                            className="w-full rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/5"
                          >
                            Completed
                          </button>

                        </div>
                      )}

                    </div>
                  </div>

                  {/* PROJECT */}

                  <div className="mt-5 flex items-center gap-2">

                    <FolderKanban className="h-4 w-4 text-violet-400" />

                    <span className="text-sm text-gray-300">
                      {task.project?.name ||
                        "Project unavailable"}
                    </span>

                  </div>

                  {/* DETAILS */}

                  <div className="mt-5 grid grid-cols-2 gap-4">

                    {/* PRIORITY */}

                    <div>

                      <p className="text-xs text-gray-600">
                        Priority
                      </p>

                      <div className="relative mt-1">

                        <button
                          type="button"
                          disabled={
                            updating ===
                            task._id
                          }
                          onClick={() =>
                            setPriorityMenu(
                              priorityMenu ===
                                task._id
                                ? null
                                : task._id
                            )
                          }
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${getPriorityStyle(
                            task.priority
                          )}`}
                        >
                          {getPriorityLabel(
                            task.priority
                          )}
                        </button>

                        {priorityMenu ===
                          task._id && (

                          <div className="absolute left-0 top-8 z-30 w-32 overflow-hidden rounded-xl border border-white/10 bg-[#171024] p-1 shadow-2xl">

                            <button
                              onClick={() =>
                                updatePriority(
                                  task._id,
                                  "low"
                                )
                              }
                              className="w-full rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/5"
                            >
                              Low
                            </button>

                            <button
                              onClick={() =>
                                updatePriority(
                                  task._id,
                                  "medium"
                                )
                              }
                              className="w-full rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/5"
                            >
                              Medium
                            </button>

                            <button
                              onClick={() =>
                                updatePriority(
                                  task._id,
                                  "high"
                                )
                              }
                              className="w-full rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/5"
                            >
                              High
                            </button>

                            <button
                              onClick={() =>
                                updatePriority(
                                  task._id,
                                  "critical"
                                )
                              }
                              className="w-full rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/5"
                            >
                              Critical
                            </button>

                          </div>
                        )}

                      </div>
                    </div>

                    {/* DUE DATE */}

                    <div>

                      <p className="text-xs text-gray-600">
                        Due Date
                      </p>

                      <div className="mt-1 flex items-center gap-2">

                        <Clock3 className="h-4 w-4 text-gray-500" />

                        <p className="text-sm text-gray-300">
                          {formatDate(
                            task.dueDate
                          )}
                        </p>

                      </div>

                    </div>

                    {/* PROJECT MANAGER */}

                    <div>

                      <p className="text-xs text-gray-600">
                        Project Manager
                      </p>

                      <div className="mt-1 flex items-center gap-2">

                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/10">
                          <UserRound className="h-3.5 w-3.5 text-violet-400" />
                        </div>

                        <p className="truncate text-sm text-gray-300">
                          {task.projectManager
                            ?.name ||
                            "Not assigned"}
                        </p>

                      </div>

                    </div>

                    {/* EMPLOYEE */}

                    <div>

                      <p className="text-xs text-gray-600">
                        Assigned Employee
                      </p>

                      <div className="mt-1 flex items-center gap-2">

                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10">
                          <UsersRound className="h-3.5 w-3.5 text-blue-400" />
                        </div>

                        <p className="truncate text-sm text-gray-300">
                          {task.assignedEmployee
                            ?.name ||
                            "Not assigned"}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      SUBMISSION
                  ================================================= */}

                  {submissionExists ? (

                    <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">

                      <div className="flex items-center justify-between gap-3">

                        <div className="flex items-center gap-3">

                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                              reviewDecision ===
                              "approved"
                                ? "bg-green-500/10"
                                : reviewDecision ===
                                  "rejected"
                                ? "bg-red-500/10"
                                : "bg-yellow-500/10"
                            }`}
                          >

                            {reviewDecision ===
                            "approved" ? (

                              <CheckCircle2 className="h-5 w-5 text-green-400" />

                            ) : reviewDecision ===
                              "rejected" ? (

                              <XCircle className="h-5 w-5 text-red-400" />

                            ) : (

                              <MessageSquare className="h-5 w-5 text-yellow-400" />

                            )}

                          </div>

                          <div>

                            <p className="text-sm font-medium text-white">

                              {reviewDecision ===
                              "approved"
                                ? "Work Approved"
                                : reviewDecision ===
                                  "rejected"
                                ? "Work Rejected"
                                : "Work Under Review"}

                            </p>

                            <p className="text-xs text-gray-500">
                              Employee has submitted
                              work for this task.
                            </p>

                          </div>

                        </div>

                        <button
                          onClick={() =>
                            setSelectedTask(
                              task
                            )
                          }
                          className="flex items-center gap-2 rounded-lg border border-violet-400/20 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-300 transition hover:bg-violet-500/20"
                        >
                          <Eye className="h-4 w-4" />

                          View Submission
                        </button>

                      </div>

                    </div>

                  ) : (

                    <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/5 bg-black/20 px-4 py-3">

                      <MessageSquare className="h-4 w-4 text-gray-600" />

                      <p className="text-xs text-gray-600">
                        No employee submission yet.
                      </p>

                    </div>
                  )}

                  {/* DIVIDER */}

                  <div className="my-5 border-t border-white/10" />

                  {/* ACTIONS */}

                  <div className="flex items-center justify-between">

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedTask(
                          task
                        )
                      }
                      className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-400 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-400"
                    >
                      <Eye className="h-4 w-4" />

                      View Details
                    </button>

                    <div className="flex items-center gap-2">

                      <button
                        type="button"
                        title="Edit Task"
                        onClick={() =>
                          (window.location.href = `/dashboard/admin/tasks/${task._id}/edit`)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-400 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-400"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        title="Assign Task"
                        onClick={() =>
                          (window.location.href = `/dashboard/admin/tasks/${task._id}/edit?assign=employee`)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-400 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-400"
                      >
                        <UserRound className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        title="Delete Task"
                        onClick={() =>
                          deleteTask(
                            task._id
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-400 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                    </div>
                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

      {/* =====================================================
          SUBMISSION DETAILS MODAL
      ===================================================== */}

      {selectedTask && (

        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() =>
            setSelectedTask(null)
          }
        >

          <div
            className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0f0a19] shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0f0a19] px-6 py-5">

              <div>

                <p className="text-xs uppercase tracking-[0.18em] text-violet-400">
                  Task Activity
                </p>

                <h2 className="mt-1 text-xl font-bold text-white">
                  {selectedTask.title}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Employee submission and Project
                  Manager review history
                </p>

              </div>

              <button
                onClick={() =>
                  setSelectedTask(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-400 transition hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <div className="p-6">

              {/* TASK SUMMARY */}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                <InfoBox
                  label="Project"
                  icon={
                    <FolderKanban className="h-4 w-4 text-violet-400" />
                  }
                  value={
                    selectedTask.project
                      ?.name ||
                    "Unavailable"
                  }
                />

                <InfoBox
                  label="Project Manager"
                  icon={
                    <UserCheck className="h-4 w-4 text-violet-400" />
                  }
                  value={
                    selectedTask
                      .projectManager
                      ?.name ||
                    "Not assigned"
                  }
                />

                <InfoBox
                  label="Assigned Employee"
                  icon={
                    <UsersRound className="h-4 w-4 text-blue-400" />
                  }
                  value={
                    selectedTask
                      .assignedEmployee
                      ?.name ||
                    "Not assigned"
                  }
                />

              </div>

              {/* STATUS */}

              <div className="mt-5 flex flex-wrap items-center gap-3">

                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${getStatusStyle(
                    selectedTask.status
                  )}`}
                >
                  {getStatusLabel(
                    selectedTask.status
                  )}
                </span>

                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${getPriorityStyle(
                    selectedTask.priority
                  )}`}
                >
                  {getPriorityLabel(
                    selectedTask.priority
                  )}{" "}
                  Priority
                </span>

                <span className="text-xs text-gray-600">
                  Due:{" "}
                  {formatDate(
                    selectedTask.dueDate
                  )}
                </span>

              </div>

              {/* ACTIVITY */}

              <div className="mt-8">

                <div className="mb-5 flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                    <MessageSquare className="h-5 w-5 text-violet-400" />
                  </div>

                  <div>

                    <h3 className="font-semibold text-white">
                      Work Submission History
                    </h3>

                    <p className="text-xs text-gray-500">
                      Employee → Project Manager
                      communication
                    </p>

                  </div>

                </div>

                {/* EMPLOYEE */}

                {selectedTask.submission
                  ?.submitted ? (

                  <div className="rounded-2xl border border-blue-400/20 bg-blue-500/5 p-5">

                    <div className="flex items-start gap-4">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                        <UsersRound className="h-5 w-5 text-blue-400" />
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center justify-between gap-3">

                          <div>

                            <p className="font-semibold text-white">
                              Employee Submission
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {
                                selectedTask
                                  .assignedEmployee
                                  ?.name
                              }{" "}
                              submitted completed
                              work
                            </p>

                          </div>

                          <span className="text-xs text-gray-600">
                            {formatDateTime(
                              selectedTask
                                .submission
                                .submittedAt
                            )}
                          </span>

                        </div>

                        {/* COMMENT */}

                        <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">

                          <div className="mb-2 flex items-center gap-2">

                            <MessageSquare className="h-4 w-4 text-blue-400" />

                            <p className="text-xs font-medium text-gray-400">
                              Completion Comment
                            </p>

                          </div>

                          <p className="whitespace-pre-wrap text-sm leading-6 text-gray-300">
                            {selectedTask
                              .submission
                              .completionComment ||
                              "No completion comment provided."}
                          </p>

                        </div>

                        {/* EVIDENCE */}

                        {selectedTask
                          .submission
                          .evidenceImage && (

                          <div className="mt-5">

                            <div className="mb-3 flex items-center gap-2">

                              <ImageIcon className="h-4 w-4 text-blue-400" />

                              <p className="text-xs font-medium text-gray-400">
                                Submitted Evidence
                              </p>

                            </div>

                            <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30">

                              <img
                                src={
                                  selectedTask
                                    .submission
                                    .evidenceImage
                                }
                                alt="Employee submitted evidence"
                                className="max-h-[450px] w-full object-contain"
                              />

                            </div>

                          </div>
                        )}

                      </div>
                    </div>

                  </div>

                ) : (

                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-center">

                    <MessageSquare className="mx-auto h-8 w-8 text-gray-700" />

                    <p className="mt-3 text-sm text-gray-500">
                      The employee has not submitted
                      work for this task yet.
                    </p>

                  </div>
                )}

                {/* CONNECTOR */}

                {selectedTask.submission
                  ?.submitted && (
                  <div className="ml-5 h-8 border-l border-dashed border-white/20" />
                )}

                {/* PM REVIEW */}

                {selectedTask.submission
                  ?.submitted && (

                  <div
                    className={`rounded-2xl border p-5 ${
                      selectedTask.status ===
                      "completed"
                        ? "border-green-400/20 bg-green-500/5"
                        : selectedTask
                              .submission
                              .rejectionReason
                        ? "border-red-400/20 bg-red-500/5"
                        : "border-yellow-400/20 bg-yellow-500/5"
                    }`}
                  >

                    <div className="flex items-start gap-4">

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          selectedTask.status ===
                          "completed"
                            ? "bg-green-500/10"
                            : selectedTask
                                  .submission
                                  .rejectionReason
                            ? "bg-red-500/10"
                            : "bg-yellow-500/10"
                        }`}
                      >

                        {selectedTask.status ===
                        "completed" ? (

                          <CheckCircle2 className="h-5 w-5 text-green-400" />

                        ) : selectedTask
                            .submission
                            .rejectionReason ? (

                          <XCircle className="h-5 w-5 text-red-400" />

                        ) : (

                          <Clock3 className="h-5 w-5 text-yellow-400" />

                        )}

                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center justify-between gap-3">

                          <div>

                            <p className="font-semibold text-white">
                              Project Manager Review
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {
                                selectedTask
                                  .projectManager
                                  ?.name
                              }
                            </p>

                          </div>

                          <span className="text-xs text-gray-600">
                            {formatDateTime(
                              selectedTask
                                .submission
                                .reviewedAt
                            )}
                          </span>

                        </div>

                        {/* PENDING */}

                        {selectedTask.status ===
                          "review" &&
                          !selectedTask
                            .submission
                            .rejectionReason && (

                            <div className="mt-5 rounded-xl border border-yellow-400/10 bg-yellow-500/5 p-4">

                              <p className="text-sm text-yellow-300">
                                Submission is currently
                                waiting for Project
                                Manager review.
                              </p>

                            </div>
                          )}

                        {/* APPROVED */}

                        {selectedTask.status ===
                          "completed" && (

                          <div className="mt-5 rounded-xl border border-green-400/10 bg-green-500/5 p-4">

                            <div className="flex items-center gap-2">

                              <CheckCircle2 className="h-5 w-5 text-green-400" />

                              <p className="font-medium text-green-300">
                                Submission Approved
                              </p>

                            </div>

                            <p className="mt-2 text-sm text-gray-400">
                              The Project Manager
                              approved the employee's
                              submitted work and the
                              task was marked as
                              completed.
                            </p>

                          </div>
                        )}

                        {/* REJECTED */}

                        {selectedTask
                          .submission
                          .rejectionReason && (

                          <div className="mt-5 rounded-xl border border-red-400/10 bg-red-500/5 p-4">

                            <div className="flex items-center gap-2">

                              <XCircle className="h-5 w-5 text-red-400" />

                              <p className="font-medium text-red-300">
                                Submission Rejected
                              </p>

                            </div>

                            <p className="mt-4 text-xs font-medium text-gray-500">
                              Rejection Reason
                            </p>

                            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-300">
                              {
                                selectedTask
                                  .submission
                                  .rejectionReason
                              }
                            </p>

                          </div>
                        )}

                        {/* PM COMMENT */}

                        {selectedTask
                          .submission
                          .reviewComment && (

                          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">

                            <div className="mb-2 flex items-center gap-2">

                              <MessageSquare className="h-4 w-4 text-violet-400" />

                              <p className="text-xs font-medium text-gray-400">
                                Project Manager Comment
                              </p>

                            </div>

                            <p className="whitespace-pre-wrap text-sm leading-6 text-gray-300">
                              {
                                selectedTask
                                  .submission
                                  .reviewComment
                              }
                            </p>

                          </div>
                        )}

                      </div>
                    </div>

                  </div>
                )}

              </div>

              {/* ADMIN NOTE */}

              <div className="mt-8 rounded-xl border border-violet-400/10 bg-violet-500/5 p-4">

                <div className="flex items-start gap-3">

                  <Eye className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />

                  <div>

                    <p className="text-sm font-medium text-violet-300">
                      Admin Monitoring
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      This view is for organization-level
                      monitoring. The Project Manager is
                      responsible for approving or rejecting
                      employee submissions.
                    </p>

                  </div>

                </div>

              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   SMALL INFO BOX
===================================================== */

function InfoBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">

      <p className="text-xs text-gray-600">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-2">

        {icon}

        <p className="truncate text-sm text-gray-300">
          {value}
        </p>

      </div>

    </div>
  );
}

/* =====================================================
   EMPTY TASK ICON
===================================================== */

function ClipboardListIcon() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="text-violet-400"
      >
        <rect
          x="5"
          y="4"
          width="14"
          height="17"
          rx="2"
        />

        <path d="M9 4.5V3h6v1.5" />

        <path d="M8.5 9h7" />

        <path d="M8.5 13h7" />

        <path d="M8.5 17h4" />
      </svg>
    </div>
  );
}