"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  Search,
  Plus,
  CheckSquare,
  Calendar,
  User,
  FolderKanban,
  Clock,
  X,
  Edit3,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  MessageSquare,
  Eye,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

/* =====================================================
   TYPES
===================================================== */

interface ProjectManager {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
}

interface Project {
  _id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status?: string;
}

interface Employee {
  _id: string;
  name: string;
  email: string;
  department?: string;
  jobTitle?: string;
  status?: string;
}

interface TaskProject {
  _id?: string;
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

interface TaskEmployee {
  _id?: string;
  name?: string;
  email?: string;
  department?: string;
  jobTitle?: string;
  status?: string;
}

interface TaskManager {
  _id?: string;
  name?: string;
  email?: string;
}

interface TaskSubmission {
  submitted?: boolean;
  evidenceImage?: string;
  completionComment?: string;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewedBy?:
    | {
        _id?: string;
        name?: string;
        email?: string;
        role?: string;
      }
    | string
    | null;
  reviewComment?: string;
  rejectionReason?: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;

  project:
    | TaskProject
    | string
    | null;

  projectManager:
    | TaskManager
    | string
    | null;

  assignedEmployee:
    | TaskEmployee
    | string
    | null;

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

  submission?: TaskSubmission;

  createdAt?: string;
  updatedAt?: string;
}

type StatusFilter =
  | "all"
  | "todo"
  | "in_progress"
  | "review"
  | "completed";

type PriorityFilter =
  | "all"
  | "low"
  | "medium"
  | "high"
  | "critical";

/* =====================================================
   COMPONENT
===================================================== */

export default function ProjectManagerTasksPage() {
  /* =====================================================
     STATE
  ===================================================== */

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [profile, setProfile] =
    useState<ProjectManager | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [priorityFilter, setPriorityFilter] =
    useState<PriorityFilter>("all");

  /* CREATE / EDIT */
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] =
    useState<Task | null>(null);

  const [saving, setSaving] = useState(false);

  const [deletingTask, setDeletingTask] =
    useState<string | null>(null);

  /* REVIEW */
  const [reviewTask, setReviewTask] =
    useState<Task | null>(null);

  const [reviewMode, setReviewMode] =
    useState<"view" | "approve" | "reject">("view");

  const [reviewComment, setReviewComment] =
    useState("");

  const [rejectionReason, setRejectionReason] =
    useState("");

  const [reviewing, setReviewing] =
    useState(false);

  const API_BASE = "http://localhost:5000/api";

  /* =====================================================
     FORM STATE
  ===================================================== */

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [selectedProject, setSelectedProject] =
    useState("");

  const [selectedEmployee, setSelectedEmployee] =
    useState("");

  const [priority, setPriority] =
    useState<Task["priority"]>("medium");

  const [status, setStatus] =
    useState<Task["status"]>("todo");

  const [dueDate, setDueDate] = useState("");

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
     GET OBJECT ID
  ===================================================== */

  const getObjectId = (
    value:
      | string
      | { _id?: string }
      | null
      | undefined
  ) => {
    if (!value) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    return value._id || "";
  };

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (date?: string | null) => {
    if (!date) {
      return "—";
    }

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

  /* =====================================================
     FORMAT DATE + TIME
  ===================================================== */

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

    return parsed.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* =====================================================
     STATUS LABEL
  ===================================================== */

  const getStatusLabel = (
    value: Task["status"]
  ) => {
    const labels = {
      todo: "Todo",
      in_progress: "In Progress",
      review: "Under Review",
      completed: "Completed",
    };

    return labels[value];
  };

  /* =====================================================
     PRIORITY LABEL
  ===================================================== */

  const getPriorityLabel = (
    value: Task["priority"]
  ) => {
    const labels = {
      low: "Low",
      medium: "Medium",
      high: "High",
      critical: "Critical",
    };

    return labels[value];
  };

  /* =====================================================
     STATUS STYLE
  ===================================================== */

  const getStatusClass = (
    value: Task["status"]
  ) => {
    const classes = {
      todo:
        "bg-gray-500/10 text-gray-400 border-gray-500/20",

      in_progress:
        "bg-blue-500/10 text-blue-400 border-blue-500/20",

      review:
        "bg-amber-500/10 text-amber-400 border-amber-500/20",

      completed:
        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    };

    return classes[value];
  };

  /* =====================================================
     PRIORITY STYLE
  ===================================================== */

  const getPriorityClass = (
    value: Task["priority"]
  ) => {
    const classes = {
      low:
        "bg-gray-500/10 text-gray-400 border-gray-500/20",

      medium:
        "bg-blue-500/10 text-blue-400 border-blue-500/20",

      high:
        "bg-orange-500/10 text-orange-400 border-orange-500/20",

      critical:
        "bg-red-500/10 text-red-400 border-red-500/20",
    };

    return classes[value];
  };

  /* =====================================================
     FETCH DATA
  ===================================================== */

  const fetchData = async (
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

      const [
        profileResponse,
        projectsResponse,
        teamResponse,
        tasksResponse,
      ] = await Promise.all([
        fetch(
          `${API_BASE}/project-managers/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),

        fetch(
          `${API_BASE}/project-managers/projects`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),

        fetch(
          `${API_BASE}/project-managers/team`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),

        fetch(`${API_BASE}/admin/tasks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (
        profileResponse.status === 401 ||
        projectsResponse.status === 401 ||
        teamResponse.status === 401 ||
        tasksResponse.status === 401
      ) {
        handleLogout();
        return;
      }

      const profileData =
        await profileResponse.json();

      const projectsData =
        await projectsResponse.json();

      const teamData =
        await teamResponse.json();

      const tasksData =
        await tasksResponse.json();

      if (!profileResponse.ok) {
        throw new Error(
          profileData.message ||
            "Unable to load Project Manager"
        );
      }

      if (!projectsResponse.ok) {
        throw new Error(
          projectsData.message ||
            "Unable to load projects"
        );
      }

      if (!teamResponse.ok) {
        throw new Error(
          teamData.message ||
            "Unable to load team"
        );
      }

      if (!tasksResponse.ok) {
        throw new Error(
          tasksData.message ||
            "Unable to load tasks"
        );
      }

      const manager =
        profileData.projectManager ||
        profileData.user ||
        null;

      setProfile(manager);

      setProjects(
        Array.isArray(projectsData.projects)
          ? projectsData.projects
          : []
      );

      setEmployees(
        Array.isArray(teamData.teamMembers)
          ? teamData.teamMembers
          : []
      );

      const allTasks: Task[] =
        Array.isArray(tasksData.tasks)
          ? tasksData.tasks
          : [];

      const managerId =
        manager?._id || manager?.id || "";

      const myTasks = allTasks.filter(
        (task) => {
          const taskManagerId =
            getObjectId(
              task.projectManager
            );

          return (
            taskManagerId === managerId
          );
        }
      );

      setTasks(myTasks);
    } catch (err) {
      console.error(
        "Tasks page error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load tasks"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    fetchData();
  }, []);

  /* =====================================================
     FILTER TASKS
  ===================================================== */

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const query =
        search.toLowerCase().trim();

      const projectName =
        typeof task.project === "object" &&
        task.project
          ? task.project.name || ""
          : "";

      const employeeName =
        typeof task.assignedEmployee ===
          "object" &&
        task.assignedEmployee
          ? task.assignedEmployee.name || ""
          : "";

      const matchesSearch =
        !query ||
        task.title
          .toLowerCase()
          .includes(query) ||
        task.description
          .toLowerCase()
          .includes(query) ||
        projectName
          .toLowerCase()
          .includes(query) ||
        employeeName
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        task.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    tasks,
    search,
    statusFilter,
    priorityFilter,
  ]);

  /* =====================================================
     OPEN CREATE MODAL
  ===================================================== */

  const openCreateModal = () => {
    setEditingTask(null);

    setTitle("");
    setDescription("");
    setSelectedProject("");
    setSelectedEmployee("");
    setPriority("medium");
    setStatus("todo");
    setDueDate("");

    setShowModal(true);
  };

  /* =====================================================
     OPEN EDIT MODAL
  ===================================================== */

  const openEditModal = (task: Task) => {
    if (task.status === "review") {
      alert(
        "This task is currently under review. Review the employee submission before making changes."
      );
      return;
    }

    if (task.status === "completed") {
      alert(
        "Completed tasks cannot be edited."
      );
      return;
    }

    setEditingTask(task);

    setTitle(task.title);
    setDescription(task.description);

    setSelectedProject(
      getObjectId(task.project)
    );

    setSelectedEmployee(
      getObjectId(task.assignedEmployee)
    );

    setPriority(task.priority);
    setStatus(task.status);

    setDueDate(
      task.dueDate
        ? new Date(task.dueDate)
            .toISOString()
            .split("T")[0]
        : ""
    );

    setShowModal(true);
  };

  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingTask(null);
  };

  /* =====================================================
     SELECTED PROJECT
  ===================================================== */

  const currentProject = projects.find(
    (project) =>
      project._id === selectedProject
  );

  /* =====================================================
     SAVE TASK
  ===================================================== */

  const saveTask = async () => {
    try {
      if (!title.trim()) {
        alert("Please enter task title.");
        return;
      }

      if (!description.trim()) {
        alert(
          "Please enter task description."
        );
        return;
      }

      if (!selectedProject) {
        alert("Please select a project.");
        return;
      }

      if (!dueDate) {
        alert("Please select a due date.");
        return;
      }

      if (
        !profile?._id &&
        !profile?.id
      ) {
        alert(
          "Project Manager information is missing."
        );
        return;
      }

      const managerId =
        profile._id || profile.id;

      const token = getToken();

      if (!token) {
        handleLogout();
        return;
      }

      setSaving(true);

      const body = {
        title: title.trim(),
        description: description.trim(),
        project: selectedProject,
        projectManager: managerId,
        assignedEmployee:
          selectedEmployee || null,
        priority,
        status:
          status === "completed"
            ? "in_progress"
            : status,
        dueDate,
      };

      const url = editingTask
        ? `${API_BASE}/admin/tasks/${editingTask._id}`
        : `${API_BASE}/admin/tasks`;

      const response = await fetch(url, {
        method: editingTask
          ? "PUT"
          : "POST",

        headers: {
          "Content-Type":
            "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(body),
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save task"
        );
      }

      setShowModal(false);
      setEditingTask(null);

      await fetchData(true);
    } catch (err) {
      console.error(
        "Save task error:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Unable to save task"
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     UPDATE STATUS
     
     IMPORTANT:
     PM cannot manually mark a task completed.
     Completion happens only after approval.
  ===================================================== */

  const updateStatus = async (
    taskId: string,
    newStatus: Task["status"]
  ) => {
    const currentTask = tasks.find(
      (task) => task._id === taskId
    );

    if (!currentTask) {
      return;
    }

    if (currentTask.status === "review") {
      alert(
        "This task is under employee submission review. Approve or reject the submission instead."
      );
      return;
    }

    if (currentTask.status === "completed") {
      alert(
        "Completed tasks cannot be changed."
      );
      return;
    }

    if (newStatus === "completed") {
      alert(
        "A task becomes Completed only after the Project Manager approves the employee submission."
      );
      return;
    }

    if (newStatus === "review") {
      alert(
        "Review status is created automatically when an employee submits completed work."
      );
      return;
    }

    try {
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
            status: newStatus,
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
            "Unable to update status"
        );
      }

      setTasks((current) =>
        current.map((task) =>
          task._id === taskId
            ? {
                ...task,
                status: newStatus,
              }
            : task
        )
      );
    } catch (err) {
      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "Unable to update status"
      );
    }
  };

  /* =====================================================
     UPDATE PRIORITY
  ===================================================== */

  const updatePriority = async (
    taskId: string,
    newPriority: Task["priority"]
  ) => {
    const currentTask = tasks.find(
      (task) => task._id === taskId
    );

    if (
      currentTask?.status === "completed"
    ) {
      alert(
        "Completed tasks cannot be changed."
      );
      return;
    }

    try {
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
            priority: newPriority,
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
            "Unable to update priority"
        );
      }

      setTasks((current) =>
        current.map((task) =>
          task._id === taskId
            ? {
                ...task,
                priority: newPriority,
              }
            : task
        )
      );
    } catch (err) {
      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "Unable to update priority"
      );
    }
  };

  /* =====================================================
     DELETE TASK
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
      setDeletingTask(taskId);

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
            "Unable to delete task"
        );
      }

      setTasks((current) =>
        current.filter(
          (task) => task._id !== taskId
        )
      );
    } catch (err) {
      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "Unable to delete task"
      );
    } finally {
      setDeletingTask(null);
    }
  };

  /* =====================================================
     OPEN REVIEW MODAL
  ===================================================== */

  const openReviewModal = (
    task: Task
  ) => {
    setReviewTask(task);
    setReviewMode("view");

    setReviewComment(
      task.submission?.reviewComment ||
        ""
    );

    setRejectionReason(
      task.submission?.rejectionReason ||
        ""
    );
  };

  /* =====================================================
     CLOSE REVIEW MODAL
  ===================================================== */

  const closeReviewModal = () => {
    if (reviewing) {
      return;
    }

    setReviewTask(null);
    setReviewMode("view");
    setReviewComment("");
    setRejectionReason("");
  };

  /* =====================================================
     APPROVE SUBMISSION
  ===================================================== */

  const approveSubmission = async () => {
    if (!reviewTask) {
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        handleLogout();
        return;
      }

      setReviewing(true);

      const response = await fetch(
        `${API_BASE}/task-submissions/${reviewTask._id}/approve`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            reviewComment:
              reviewComment.trim(),
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
            "Unable to approve submission"
        );
      }

      alert(
        "Task submission approved. The task is now completed."
      );

      closeReviewModal();

      await fetchData(true);
    } catch (err) {
      console.error(
        "Approve submission error:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Unable to approve submission"
      );
    } finally {
      setReviewing(false);
    }
  };

  /* =====================================================
     REJECT SUBMISSION
  ===================================================== */

  const rejectSubmission = async () => {
    if (!reviewTask) {
      return;
    }

    if (!rejectionReason.trim()) {
      alert(
        "Please provide a rejection reason."
      );
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        handleLogout();
        return;
      }

      setReviewing(true);

      const response = await fetch(
        `${API_BASE}/task-submissions/${reviewTask._id}/reject`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            rejectionReason:
              rejectionReason.trim(),
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
            "Unable to reject submission"
        );
      }

      alert(
        "Submission rejected. The employee can correct the work and resubmit."
      );

      closeReviewModal();

      await fetchData(true);
    } catch (err) {
      console.error(
        "Reject submission error:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Unable to reject submission"
      );
    } finally {
      setReviewing(false);
    }
  };

  /* =====================================================
     COUNTS
  ===================================================== */

  const todoCount = tasks.filter(
    (task) => task.status === "todo"
  ).length;

  const progressCount = tasks.filter(
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
     UI
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#050509] text-white">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-white/10 bg-[#050509] px-8 py-6">

        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

          <div>

            <div className="flex items-center gap-2 text-sm text-gray-500">

              <Link
                href="/dashboard/project-manager"
                className="transition hover:text-violet-400"
              >
                Dashboard
              </Link>

              <span>/</span>

              <span className="text-gray-300">
                Tasks
              </span>

            </div>

            <h1 className="mt-3 text-2xl font-bold">
              Tasks
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Create, assign, monitor and review
              your team&apos;s work.
            </p>

          </div>

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                fetchData(true)
              }
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
            >

              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh

            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium transition hover:bg-violet-500"
            >

              <Plus size={18} />

              Create Task

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

        <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">

            <p className="text-xs text-gray-500">
              Total Tasks
            </p>

            <p className="mt-2 text-3xl font-bold">
              {tasks.length}
            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">

            <p className="text-xs text-gray-500">
              Todo
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-300">
              {todoCount}
            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">

            <p className="text-xs text-gray-500">
              In Progress
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-400">
              {progressCount}
            </p>

          </div>

          <div
            className={`rounded-2xl border p-5 ${
              reviewCount > 0
                ? "border-amber-500/30 bg-amber-500/5"
                : "border-white/10 bg-white/[0.025]"
            }`}
          >

            <p className="text-xs text-gray-500">
              Pending Reviews
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-400">
              {reviewCount}
            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">

            <p className="text-xs text-gray-500">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-400">
              {completedCount}
            </p>

          </div>

        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="flex min-h-[400px] items-center justify-center">

            <div className="flex items-center gap-3 text-gray-400">

              <Loader2
                size={24}
                className="animate-spin text-violet-500"
              />

              Loading tasks...

            </div>

          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">

            <AlertCircle
              size={40}
              className="mx-auto mb-4 text-red-400"
            />

            <h2 className="font-semibold">
              Unable to load tasks
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                fetchData()
              }
              className="mt-5 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium hover:bg-violet-500"
            >
              Try Again
            </button>

          </div>
        )}

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        {!loading && !error && (
          <>

            {/* =================================================
                FILTER BAR
            ================================================= */}

            <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.025] p-4">

              <div className="flex flex-col gap-3 lg:flex-row">

                <div className="relative flex-1">

                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search tasks, projects or employees..."
                    className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-600 focus:border-violet-500/50"
                  />

                </div>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target
                        .value as StatusFilter
                    )
                  }
                  className="rounded-xl border border-white/10 bg-[#0c0c12] px-4 py-3 text-sm text-gray-300 outline-none focus:border-violet-500/50"
                >

                  <option value="all">
                    All Status
                  </option>

                  <option value="todo">
                    Todo
                  </option>

                  <option value="in_progress">
                    In Progress
                  </option>

                  <option value="review">
                    Under Review
                  </option>

                  <option value="completed">
                    Completed
                  </option>

                </select>

                <select
                  value={priorityFilter}
                  onChange={(event) =>
                    setPriorityFilter(
                      event.target
                        .value as PriorityFilter
                    )
                  }
                  className="rounded-xl border border-white/10 bg-[#0c0c12] px-4 py-3 text-sm text-gray-300 outline-none focus:border-violet-500/50"
                >

                  <option value="all">
                    All Priority
                  </option>

                  <option value="low">
                    Low
                  </option>

                  <option value="medium">
                    Medium
                  </option>

                  <option value="high">
                    High
                  </option>

                  <option value="critical">
                    Critical
                  </option>

                </select>

              </div>

            </div>

            {/* =================================================
                EMPTY
            ================================================= */}

            {filteredTasks.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] py-20 text-center">

                <CheckSquare
                  size={42}
                  className="mx-auto mb-4 text-gray-700"
                />

                <h2 className="text-lg font-semibold">
                  No tasks found
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  Create a task or change
                  your filters.
                </p>

                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium hover:bg-violet-500"
                >

                  <Plus size={17} />

                  Create Task

                </button>

              </div>
            )}

            {/* =================================================
                TASK LIST
            ================================================= */}

            {filteredTasks.length > 0 && (
              <div className="space-y-4">

                {filteredTasks.map(
                  (task) => {

                    const projectName =
                      typeof task.project ===
                        "object" &&
                      task.project
                        ? task.project.name ||
                          "Unknown Project"
                        : "Unknown Project";

                    const employeeName =
                      typeof task.assignedEmployee ===
                        "object" &&
                      task.assignedEmployee
                        ? task.assignedEmployee
                            .name ||
                          "Unassigned"
                        : "Unassigned";

                    const isReview =
                      task.status ===
                        "review" &&
                      Boolean(
                        task.submission?.submitted
                      );

                    const isCompleted =
                      task.status ===
                      "completed";

                    return (
                      <div
                        key={task._id}
                        className={`rounded-2xl border bg-white/[0.025] p-6 transition ${
                          isReview
                            ? "border-amber-500/30 shadow-lg shadow-amber-950/10"
                            : "border-white/10 hover:border-violet-500/20"
                        }`}
                      >

                        {/* TASK TOP */}

                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">

                          <div className="flex min-w-0 gap-4">

                            <div
                              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                                isReview
                                  ? "bg-amber-500/10"
                                  : "bg-violet-500/10"
                              }`}
                            >

                              {isReview ? (
                                <Eye
                                  size={21}
                                  className="text-amber-400"
                                />
                              ) : (
                                <CheckSquare
                                  size={21}
                                  className="text-violet-400"
                                />
                              )}

                            </div>

                            <div className="min-w-0">

                              <div className="flex flex-wrap items-center gap-2">

                                <h2 className="text-lg font-semibold">
                                  {task.title}
                                </h2>

                                {isReview && (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-400">
                                    <Clock size={12} />
                                    Needs Review
                                  </span>
                                )}

                              </div>

                              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-400">
                                {task.description}
                              </p>

                            </div>

                          </div>

                          {/* STATUS */}

                          <span
                            className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-xs font-medium ${getStatusClass(
                              task.status
                            )}`}
                          >
                            {getStatusLabel(
                              task.status
                            )}
                          </span>

                        </div>

                        {/* META */}

                        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

                          <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/10 p-3">

                            <FolderKanban
                              size={16}
                              className="text-violet-400"
                            />

                            <div className="min-w-0">

                              <p className="text-[11px] text-gray-600">
                                Project
                              </p>

                              <p className="truncate text-sm text-gray-300">
                                {projectName}
                              </p>

                            </div>

                          </div>

                          <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/10 p-3">

                            <User
                              size={16}
                              className="text-blue-400"
                            />

                            <div className="min-w-0">

                              <p className="text-[11px] text-gray-600">
                                Assigned Employee
                              </p>

                              <p className="truncate text-sm text-gray-300">
                                {employeeName}
                              </p>

                            </div>

                          </div>

                          <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/10 p-3">

                            <Calendar
                              size={16}
                              className="text-emerald-400"
                            />

                            <div>

                              <p className="text-[11px] text-gray-600">
                                Due Date
                              </p>

                              <p className="text-sm text-gray-300">
                                {formatDate(
                                  task.dueDate
                                )}
                              </p>

                            </div>

                          </div>

                          <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/10 p-3">

                            <ShieldCheck
                              size={16}
                              className="text-orange-400"
                            />

                            <div>

                              <p className="text-[11px] text-gray-600">
                                Priority
                              </p>

                              <p className="text-sm text-gray-300">
                                {getPriorityLabel(
                                  task.priority
                                )}
                              </p>

                            </div>

                          </div>

                        </div>

                        {/* SUBMISSION SUMMARY */}

                        {isReview &&
                          task.submission && (
                            <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">

                              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                                <div className="min-w-0">

                                  <div className="flex items-center gap-2">

                                    <MessageSquare
                                      size={16}
                                      className="text-amber-400"
                                    />

                                    <p className="text-sm font-semibold text-amber-300">
                                      Employee submitted work for review
                                    </p>

                                  </div>

                                  <p className="mt-3 text-sm leading-6 text-gray-300">
                                    {task.submission
                                      .completionComment ||
                                      "No completion comment provided."}
                                  </p>

                                  <p className="mt-3 text-xs text-gray-600">
                                    Submitted{" "}
                                    {formatDateTime(
                                      task
                                        .submission
                                        .submittedAt
                                    )}
                                  </p>

                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openReviewModal(
                                      task
                                    )
                                  }
                                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-400"
                                >

                                  <Eye
                                    size={17}
                                  />

                                  Review Submission

                                </button>

                              </div>

                            </div>
                          )}

                        {/* REJECTION INFO */}

                        {!isReview &&
                          task.submission
                            ?.rejectionReason && (
                            <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">

                              <div className="flex items-start gap-3">

                                <RotateCcw
                                  size={18}
                                  className="mt-0.5 shrink-0 text-red-400"
                                />

                                <div>

                                  <p className="text-sm font-semibold text-red-300">
                                    Previous submission was rejected
                                  </p>

                                  <p className="mt-2 text-sm leading-6 text-gray-400">
                                    {
                                      task
                                        .submission
                                        .rejectionReason
                                    }
                                  </p>

                                </div>

                              </div>

                            </div>
                          )}

                        {/* ACTION BAR */}

                        <div className="mt-6 flex flex-col gap-4 border-t border-white/5 pt-5 lg:flex-row lg:items-center lg:justify-between">

                          <div className="flex flex-wrap items-center gap-3">

                            {/* STATUS SELECT */}

                            {!isReview &&
                              !isCompleted && (
                                <select
                                  value={
                                    task.status
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    updateStatus(
                                      task._id,
                                      event
                                        .target
                                        .value as Task["status"]
                                    )
                                  }
                                  className="rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-2 text-xs text-gray-300 outline-none focus:border-violet-500/50"
                                >

                                  <option value="todo">
                                    Todo
                                  </option>

                                  <option value="in_progress">
                                    In Progress
                                  </option>

                                </select>
                              )}

                            {/* PRIORITY */}

                            {!isCompleted && (
                              <select
                                value={
                                  task.priority
                                }
                                onChange={(
                                  event
                                ) =>
                                  updatePriority(
                                    task._id,
                                    event
                                      .target
                                      .value as Task["priority"]
                                  )
                                }
                                className={`rounded-xl border px-3 py-2 text-xs outline-none ${getPriorityClass(
                                  task.priority
                                )} bg-[#0c0c12]`}
                              >

                                <option value="low">
                                  Low
                                </option>

                                <option value="medium">
                                  Medium
                                </option>

                                <option value="high">
                                  High
                                </option>

                                <option value="critical">
                                  Critical
                                </option>

                              </select>
                            )}

                          </div>

                          <div className="flex flex-wrap items-center gap-2">

                            {isReview && (
                              <button
                                type="button"
                                onClick={() =>
                                  openReviewModal(
                                    task
                                  )
                                }
                                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-amber-400"
                              >

                                <Eye
                                  size={14}
                                />

                                Review

                              </button>
                            )}

                            {!isCompleted &&
                              !isReview && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditModal(
                                      task
                                    )
                                  }
                                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs text-gray-300 transition hover:bg-white/5 hover:text-white"
                                >

                                  <Edit3
                                    size={14}
                                  />

                                  Edit

                                </button>
                              )}

                            <button
                              type="button"
                              onClick={() =>
                                deleteTask(
                                  task._id
                                )
                              }
                              disabled={
                                deletingTask ===
                                task._id
                              }
                              className="inline-flex items-center gap-2 rounded-xl border border-red-500/10 px-4 py-2.5 text-xs text-red-400 transition hover:bg-red-500/5 disabled:opacity-50"
                            >

                              {deletingTask ===
                              task._id ? (
                                <Loader2
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2
                                  size={14}
                                />
                              )}

                              Delete

                            </button>

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </>
        )}

      </div>

      {/* =================================================
          CREATE / EDIT MODAL
      ================================================= */}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0c0c13] shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

              <div>

                <p className="text-xs uppercase tracking-wider text-violet-400">
                  Project Manager
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {editingTask
                    ? "Edit Task"
                    : "Create New Task"}
                </h2>

              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <div className="space-y-5 p-6">

              {/* TITLE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Task Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder="Enter task title"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-violet-500/50"
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  rows={4}
                  placeholder="Describe the task..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-violet-500/50"
                />

              </div>

              {/* PROJECT */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Project
                </label>

                <select
                  value={selectedProject}
                  onChange={(event) =>
                    setSelectedProject(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#0c0c12] px-4 py-3 text-sm text-gray-300 outline-none focus:border-violet-500/50"
                >

                  <option value="">
                    Select Project
                  </option>

                  {projects.map(
                    (project) => (
                      <option
                        key={project._id}
                        value={project._id}
                      >
                        {project.name}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* EMPLOYEE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Assign Employee
                </label>

                <select
                  value={selectedEmployee}
                  onChange={(event) =>
                    setSelectedEmployee(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#0c0c12] px-4 py-3 text-sm text-gray-300 outline-none focus:border-violet-500/50"
                >

                  <option value="">
                    Unassigned
                  </option>

                  {employees.map(
                    (employee) => (
                      <option
                        key={employee._id}
                        value={employee._id}
                      >
                        {employee.name}
                        {employee.jobTitle
                          ? ` — ${employee.jobTitle}`
                          : ""}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* PRIORITY + STATUS */}

              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Priority
                  </label>

                  <select
                    value={priority}
                    onChange={(event) =>
                      setPriority(
                        event.target
                          .value as Task["priority"]
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#0c0c12] px-4 py-3 text-sm text-gray-300 outline-none focus:border-violet-500/50"
                  >

                    <option value="low">
                      Low
                    </option>

                    <option value="medium">
                      Medium
                    </option>

                    <option value="high">
                      High
                    </option>

                    <option value="critical">
                      Critical
                    </option>

                  </select>

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Initial Status
                  </label>

                  <select
                    value={
                      status === "completed"
                        ? "in_progress"
                        : status
                    }
                    onChange={(event) =>
                      setStatus(
                        event.target
                          .value as Task["status"]
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#0c0c12] px-4 py-3 text-sm text-gray-300 outline-none focus:border-violet-500/50"
                  >

                    <option value="todo">
                      Todo
                    </option>

                    <option value="in_progress">
                      In Progress
                    </option>

                  </select>

                  <p className="mt-2 text-xs text-gray-600">
                    Completed status is set after
                    employee submission approval.
                  </p>

                </div>

              </div>

              {/* DUE DATE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Due Date
                </label>

                <input
                  type="date"
                  value={dueDate}
                  min={
                    currentProject?.startDate
                      ? new Date(
                          currentProject.startDate
                        )
                          .toISOString()
                          .split("T")[0]
                      : undefined
                  }
                  max={
                    currentProject?.endDate
                      ? new Date(
                          currentProject.endDate
                        )
                          .toISOString()
                          .split("T")[0]
                      : undefined
                  }
                  onChange={(event) =>
                    setDueDate(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50"
                />

                {currentProject && (
                  <p className="mt-2 text-xs text-gray-600">
                    Project period:{" "}
                    {formatDate(
                      currentProject.startDate
                    )}{" "}
                    →{" "}
                    {formatDate(
                      currentProject.endDate
                    )}
                  </p>
                )}

              </div>

              {/* MANAGER */}

              <div className="rounded-xl border border-violet-500/10 bg-violet-500/5 p-4">

                <p className="text-xs text-gray-500">
                  Project Manager
                </p>

                <p className="mt-1 text-sm font-medium text-violet-300">
                  {profile?.name ||
                    "Current Project Manager"}
                </p>

              </div>

            </div>

            {/* FOOTER */}

            <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-4">

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveTask}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-medium transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {saving && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                )}

                {editingTask
                  ? "Save Changes"
                  : "Create Task"}

              </button>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          REVIEW SUBMISSION MODAL
      ================================================= */}

      {reviewTask && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">

          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0b0b12] shadow-2xl">

            {/* REVIEW HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0b0b12] px-6 py-5">

              <div>

                <div className="flex items-center gap-2">

                  <ShieldCheck
                    size={20}
                    className="text-amber-400"
                  />

                  <p className="text-xs uppercase tracking-wider text-amber-400">
                    Task Review
                  </p>

                </div>

                <h2 className="mt-1 text-xl font-semibold">
                  {reviewTask.title}
                </h2>

              </div>

              <button
                type="button"
                onClick={closeReviewModal}
                disabled={reviewing}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
              >
                <X size={20} />
              </button>

            </div>

            {/* REVIEW CONTENT */}

            <div className="space-y-6 p-6">

              {/* TASK INFORMATION */}

              <div className="grid gap-4 sm:grid-cols-3">

                <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">

                  <p className="text-xs text-gray-600">
                    Employee
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-200">

                    {typeof reviewTask.assignedEmployee ===
                      "object" &&
                    reviewTask.assignedEmployee
                      ? reviewTask
                          .assignedEmployee
                          .name ||
                        "Employee"
                      : "Employee"}

                  </p>

                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">

                  <p className="text-xs text-gray-600">
                    Project
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-200">

                    {typeof reviewTask.project ===
                      "object" &&
                    reviewTask.project
                      ? reviewTask.project
                          .name ||
                        "Project"
                      : "Project"}

                  </p>

                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">

                  <p className="text-xs text-gray-600">
                    Submitted
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-200">
                    {formatDateTime(
                      reviewTask
                        .submission
                        ?.submittedAt
                    )}
                  </p>

                </div>

              </div>

              {/* COMPLETION COMMENT */}

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">

                <div className="flex items-center gap-2">

                  <MessageSquare
                    size={17}
                    className="text-violet-400"
                  />

                  <h3 className="text-sm font-semibold">
                    Employee Completion Comment
                  </h3>

                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-300">
                  {reviewTask
                    .submission
                    ?.completionComment ||
                    "No completion comment provided."}
                </p>

              </div>

              {/* EVIDENCE */}

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">

                <div className="flex items-center gap-2">

                  <ImageIcon
                    size={17}
                    className="text-violet-400"
                  />

                  <h3 className="text-sm font-semibold">
                    Work Evidence
                  </h3>

                </div>

                {reviewTask.submission
                  ?.evidenceImage ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/30">

                    <img
                      src={
                        reviewTask
                          .submission
                          .evidenceImage
                      }
                      alt="Employee submitted work evidence"
                      className="max-h-[520px] w-full object-contain"
                    />

                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-white/10 p-10 text-center">

                    <ImageIcon
                      size={35}
                      className="mx-auto text-gray-700"
                    />

                    <p className="mt-3 text-sm text-gray-500">
                      No evidence image was
                      submitted.
                    </p>

                  </div>
                )}

              </div>

              {/* REVIEW DECISION */}

              {reviewTask.status ===
                "review" && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">

                  <div className="flex items-center gap-2">

                    <ShieldCheck
                      size={18}
                      className="text-amber-400"
                    />

                    <h3 className="text-sm font-semibold text-amber-300">
                      Project Manager Decision
                    </h3>

                  </div>

                  {/* VIEW MODE */}

                  {reviewMode ===
                    "view" && (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">

                      <button
                        type="button"
                        onClick={() =>
                          setReviewMode(
                            "reject"
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                      >

                        <XCircle
                          size={17}
                        />

                        Reject Submission

                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setReviewMode(
                            "approve"
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
                      >

                        <CheckCircle2
                          size={17}
                        />

                        Approve & Complete

                      </button>

                    </div>
                  )}

                  {/* APPROVE MODE */}

                  {reviewMode ===
                    "approve" && (
                    <div className="mt-5">

                      <label className="mb-2 block text-sm font-medium text-gray-300">
                        Review Comment
                        <span className="ml-2 text-xs text-gray-600">
                          Optional
                        </span>
                      </label>

                      <textarea
                        value={
                          reviewComment
                        }
                        onChange={(event) =>
                          setReviewComment(
                            event.target
                              .value
                          )
                        }
                        rows={4}
                        placeholder="Add feedback for the employee..."
                        className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-emerald-500/40"
                      />

                      <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                        <button
                          type="button"
                          onClick={() =>
                            setReviewMode(
                              "view"
                            )
                          }
                          disabled={
                            reviewing
                          }
                          className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-50"
                        >
                          Back
                        </button>

                        <button
                          type="button"
                          onClick={
                            approveSubmission
                          }
                          disabled={
                            reviewing
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                        >

                          {reviewing ? (
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <CheckCircle2
                              size={16}
                            />
                          )}

                          Approve & Complete

                        </button>

                      </div>

                    </div>
                  )}

                  {/* REJECT MODE */}

                  {reviewMode ===
                    "reject" && (
                    <div className="mt-5">

                      <label className="mb-2 block text-sm font-medium text-gray-300">
                        Rejection Reason
                        <span className="ml-1 text-red-400">
                          *
                        </span>
                      </label>

                      <textarea
                        value={
                          rejectionReason
                        }
                        onChange={(event) =>
                          setRejectionReason(
                            event.target
                              .value
                          )
                        }
                        rows={5}
                        placeholder="Explain what the employee needs to correct before resubmitting..."
                        className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-red-500/40"
                      />

                      <p className="mt-2 text-xs text-gray-600">
                        This reason will be
                        visible to the employee
                        so they can correct the
                        work and resubmit.
                      </p>

                      <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                        <button
                          type="button"
                          onClick={() =>
                            setReviewMode(
                              "view"
                            )
                          }
                          disabled={
                            reviewing
                          }
                          className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-50"
                        >
                          Back
                        </button>

                        <button
                          type="button"
                          onClick={
                            rejectSubmission
                          }
                          disabled={
                            reviewing
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                        >

                          {reviewing ? (
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <XCircle
                              size={16}
                            />
                          )}

                          Reject Submission

                        </button>

                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* COMPLETED INFO */}

              {reviewTask.status ===
                "completed" && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">

                      <CheckCircle2
                        size={20}
                        className="text-emerald-400"
                      />

                    </div>

                    <div>

                      <p className="text-sm font-semibold text-emerald-300">
                        Submission Approved
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        This task has been marked
                        as completed.
                      </p>

                    </div>

                  </div>

                  {reviewTask.submission
                    ?.reviewComment && (
                    <div className="mt-4 rounded-xl border border-white/5 bg-black/20 p-4">

                      <p className="text-xs text-gray-600">
                        Project Manager Comment
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-300">
                        {
                          reviewTask
                            .submission
                            .reviewComment
                        }
                      </p>

                    </div>
                  )}

                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}