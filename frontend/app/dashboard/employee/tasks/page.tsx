"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  Clock3,
  FileImage,
  Flag,
  FolderKanban,
  Loader2,
  Search,
  Upload,
  User,
  X,
  RotateCcw,
  Save,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

type Project = {
  _id?: string;
  id?: string;
  name?: string;
};

type ProjectManager = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
};

type Employee = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
};

type Submission = {
  submitted?: boolean;
  evidenceImage?: string;
  completionComment?: string;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
  } | null;
  reviewComment?: string;
  rejectionReason?: string;
};

type Task = {
  _id: string;
  title: string;
  description?: string;
  project?: Project | null;
  projectManager?: ProjectManager | null;
  assignedEmployee?: Employee | null;
  priority: "low" | "medium" | "high" | "critical";
  status: "todo" | "in_progress" | "review" | "completed";
  dueDate: string;
  submission?: Submission | null;
};

type Profile = {
  name: string;
  email: string;
  department?: string;
  jobTitle?: string;
};

function getInitials(name: string) {
  return (
    name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "E"
  );
}

function formatDate(date?: string | null) {
  if (!date) return "No date";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date?: string | null) {
  if (!date) return "Not available";

  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status: Task["status"]) {
  switch (status) {
    case "todo":
      return "Todo";
    case "in_progress":
      return "In Progress";
    case "review":
      return "Under Review";
    case "completed":
      return "Completed";
    default:
      return status;
  }
}

function priorityLabel(priority: Task["priority"]) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export default function EmployeeTasksPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [completionComment, setCompletionComment] = useState("");
  const [completionImage, setCompletionImage] = useState("");

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // =========================================================
  // LOAD PROFILE + TASKS
  // =========================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [profileResponse, tasksResponse] =
        await Promise.all([
          fetch(`${API_BASE}/employees/me`, {
            headers,
            cache: "no-store",
          }),
          fetch(`${API_BASE}/employees/tasks`, {
            headers,
            cache: "no-store",
          }),
        ]);

      const profileData =
        await profileResponse.json();

      const tasksData =
        await tasksResponse.json();

      if (!profileResponse.ok) {
        throw new Error(
          profileData.message ||
            "Unable to load employee profile"
        );
      }

      if (!tasksResponse.ok) {
        throw new Error(
          tasksData.message ||
            "Unable to load employee tasks"
        );
      }

      setProfile(
        profileData.employee ||
          profileData.user ||
          null
      );

      setTasks(tasksData.tasks || []);
    } catch (err) {
      console.error(
        "Employee tasks error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load tasks"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // FILTER TASKS
  // =========================================================

  const filteredTasks = useMemo(() => {
    const searchText =
      search.toLowerCase().trim();

    return tasks.filter((task) => {
      const matchesSearch =
        !searchText ||
        task.title
          ?.toLowerCase()
          .includes(searchText) ||
        task.description
          ?.toLowerCase()
          .includes(searchText) ||
        task.project?.name
          ?.toLowerCase()
          .includes(searchText);

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

  // =========================================================
  // STATS
  // =========================================================

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const reviewTasks = tasks.filter(
    (task) => task.status === "review"
  ).length;

  const pendingTasks = tasks.filter(
    (task) =>
      task.status !== "completed" &&
      task.status !== "review"
  ).length;

  // =========================================================
  // OPEN UPDATE WORK MODAL
  // =========================================================

  const openCompletionModal = (
    task: Task
  ) => {
    setSelectedTask(task);

    setCompletionComment(
      task.submission
        ?.completionComment || ""
    );

    setCompletionImage(
      task.submission
        ?.evidenceImage || ""
    );

    setSuccessMessage("");
    setError("");
  };

  const closeCompletionModal = () => {
    if (saving) return;

    setSelectedTask(null);
    setCompletionComment("");
    setCompletionImage("");
    setSuccessMessage("");
  };

  // =========================================================
  // IMAGE COMPRESSION
  // =========================================================

  const compressImage = (
    file: File
  ): Promise<string> => {
    return new Promise(
      (resolve, reject) => {
        const reader =
          new FileReader();

        reader.onload = () => {
          const image =
            new Image();

          image.onload = () => {
            const maxWidth = 1280;
            const maxHeight = 1280;

            let width =
              image.width;

            let height =
              image.height;

            if (
              width > maxWidth ||
              height > maxHeight
            ) {
              const ratio =
                Math.min(
                  maxWidth / width,
                  maxHeight / height
                );

              width = Math.round(
                width * ratio
              );

              height = Math.round(
                height * ratio
              );
            }

            const canvas =
              document.createElement(
                "canvas"
              );

            canvas.width = width;
            canvas.height = height;

            const context =
              canvas.getContext(
                "2d"
              );

            if (!context) {
              reject(
                new Error(
                  "Unable to process image"
                )
              );

              return;
            }

            context.drawImage(
              image,
              0,
              0,
              width,
              height
            );

            resolve(
              canvas.toDataURL(
                "image/jpeg",
                0.7
              )
            );
          };

          image.onerror = () => {
            reject(
              new Error(
                "Invalid image"
              )
            );
          };

          image.src =
            reader.result as string;
        };

        reader.onerror = () => {
          reject(
            new Error(
              "Unable to read image"
            )
          );
        };

        reader.readAsDataURL(file);
      }
    );
  };

  // =========================================================
  // IMAGE UPLOAD
  // =========================================================

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith("image/")
    ) {
      alert(
        "Please select an image file."
      );

      event.target.value = "";

      return;
    }

    if (
      file.size >
      6 * 1024 * 1024
    ) {
      alert(
        "Please select an image smaller than 6 MB."
      );

      event.target.value = "";

      return;
    }

    try {
      const processed =
        await compressImage(file);

      setCompletionImage(
        processed
      );
    } catch (err) {
      console.error(
        "Image processing error:",
        err
      );

      alert(
        "Unable to process the selected image."
      );
    }

    event.target.value = "";
  };

  // =========================================================
  // REMOVE IMAGE
  // =========================================================

  const removeImage = () => {
    setCompletionImage("");
  };

  // =========================================================
  // SAVE PROGRESS
  //
  // Screenshot is NOT required here.
  // Employee can save their progress without
  // submitting it for PM review.
  // =========================================================

  const saveProgress = async () => {
    if (!selectedTask) return;

    if (
      !completionComment.trim() &&
      !completionImage
    ) {
      setError(
        "Add a progress comment or upload a screenshot before saving."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        window.location.href =
          "/login";

        return;
      }

      const response =
        await fetch(
          `${API_BASE}/employees/tasks/${selectedTask._id}/status`,
          {
            method: "PATCH",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              status: "in_progress",

              completionComment:
                completionComment.trim(),

              completionImages:
                completionImage
                  ? [completionImage]
                  : [],
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save progress"
        );
      }

      const updatedTask =
        data.task as Task;

      setTasks((current) =>
        current.map((task) =>
          task._id ===
          selectedTask._id
            ? updatedTask
            : task
        )
      );

      setSelectedTask(
        updatedTask
      );

      setSuccessMessage(
        "Progress saved successfully. The task remains In Progress."
      );
    } catch (err) {
      console.error(
        "Save progress error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save progress"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // SUBMIT FOR REVIEW
  //
  // Screenshot + comment ARE required here.
  // This sends the submission to the new
  // task submission API.
  // =========================================================

  const submitForReview =
    async () => {
      if (!selectedTask) return;

      if (!completionImage) {
        setError(
          "Please upload a screenshot of your completed work before submitting for review."
        );

        return;
      }

      if (
        !completionComment.trim()
      ) {
        setError(
          "Please add a completion comment before submitting for review."
        );

        return;
      }

      try {
        setSaving(true);
        setError("");
        setSuccessMessage("");

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          window.location.href =
            "/login";

          return;
        }

        const response =
          await fetch(
            `${API_BASE}/task-submissions/${selectedTask._id}/submit`,
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                evidenceImage:
                  completionImage,

                completionComment:
                  completionComment.trim(),
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to submit task for review"
          );
        }

        const updatedTask =
          data.task as Task;

        setTasks((current) =>
          current.map((task) =>
            task._id ===
            selectedTask._id
              ? updatedTask
              : task
          )
        );

        setSelectedTask(
          updatedTask
        );

        setSuccessMessage(
          "Work submitted successfully. Your Project Manager will review it."
        );
      } catch (err) {
        console.error(
          "Submit for review error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to submit work for review"
        );
      } finally {
        setSaving(false);
      }
    };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    sessionStorage.clear();

    window.location.href =
      "/login";
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08080d] text-white">
        <div className="text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-violet-400" />

          <p className="mt-4 text-sm text-slate-400">
            Loading your tasks...
          </p>
        </div>
      </main>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="min-h-screen bg-[#08080d] text-white">
      <div className="min-h-screen">

        {/* HEADER */}

        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#08080d]/95 backdrop-blur-xl">
          <div className="flex h-20 items-center justify-between px-8">

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-500">
                Employee Workspace
              </p>

              <h1 className="mt-1 text-2xl font-bold">
                My Tasks
              </h1>
            </div>

            <div className="flex items-center gap-3">

              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">
                  {profile?.name ||
                    "Employee"}
                </p>

                <p className="text-xs text-slate-500">
                  {profile?.jobTitle ||
                    "Employee"}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 font-semibold text-violet-300">
                {getInitials(
                  profile?.name ||
                    "Employee"
                )}
              </div>

            </div>
          </div>
        </header>

        {/* CONTENT */}

        <div className="p-8">

          <Link
            href="/dashboard/employee"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          {/* ERROR */}

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">

              <AlertCircle className="h-5 w-5 shrink-0" />

              <span>
                {error}
              </span>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                className="ml-auto rounded-lg p-1 hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>

            </div>
          )}

          {/* INTRO */}

          <div className="mb-8">

            <h2 className="text-3xl font-bold">
              My Tasks
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              View your assigned work,
              save progress, and submit
              completed work for Project
              Manager approval.
            </p>

          </div>

          {/* STATS */}

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-2xl border border-white/10 bg-[#11111a] p-5">

              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Total Tasks
                </span>

                <CheckSquare className="h-5 w-5 text-violet-400" />
              </div>

              <div className="text-3xl font-bold">
                {totalTasks}
              </div>

              <p className="mt-1 text-xs text-slate-600">
                Assigned to you
              </p>

            </div>

            <div className="rounded-2xl border border-white/10 bg-[#11111a] p-5">

              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  In Progress
                </span>

                <Clock3 className="h-5 w-5 text-amber-400" />
              </div>

              <div className="text-3xl font-bold">
                {pendingTasks}
              </div>

              <p className="mt-1 text-xs text-slate-600">
                Work remaining
              </p>

            </div>

            <div className="rounded-2xl border border-white/10 bg-[#11111a] p-5">

              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Under Review
                </span>

                <Clock3 className="h-5 w-5 text-blue-400" />
              </div>

              <div className="text-3xl font-bold">
                {reviewTasks}
              </div>

              <p className="mt-1 text-xs text-slate-600">
                Waiting for PM approval
              </p>

            </div>

            <div className="rounded-2xl border border-white/10 bg-[#11111a] p-5">

              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Completed
                </span>

                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>

              <div className="text-3xl font-bold">
                {completedTasks}
              </div>

              <p className="mt-1 text-xs text-slate-600">
                Approved by PM
              </p>

            </div>

          </div>

          {/* SEARCH / FILTER */}

          <div className="mb-6 rounded-2xl border border-white/10 bg-[#11111a] p-4">

            <div className="flex flex-col gap-3 lg:flex-row">

              <div className="relative flex-1">

                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-600" />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search tasks or projects..."
                  className="w-full rounded-xl border border-white/10 bg-[#0b0b12] py-3 pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/50"
                />

              </div>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="rounded-xl border border-white/10 bg-[#0b0b12] px-4 py-3 text-sm text-slate-300 outline-none"
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
                onChange={(e) =>
                  setPriorityFilter(
                    e.target.value
                  )
                }
                className="rounded-xl border border-white/10 bg-[#0b0b12] px-4 py-3 text-sm text-slate-300 outline-none"
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

          {/* TASK LIST */}

          <div className="space-y-4">

            {filteredTasks.length ===
            0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#11111a] px-6 py-16 text-center">

                <CheckSquare className="mx-auto h-12 w-12 text-slate-700" />

                <h3 className="mt-4 text-lg font-semibold">
                  No tasks found
                </h3>

                <p className="mt-2 text-sm text-slate-600">
                  Your Project Manager's
                  assigned tasks will appear
                  here.
                </p>

              </div>
            ) : (
              filteredTasks.map(
                (task) => {

                  const isCompleted =
                    task.status ===
                    "completed";

                  const isReview =
                    task.status ===
                    "review";

                  const isRejected =
                    Boolean(
                      task.submission
                        ?.rejectionReason
                    ) &&
                    !isReview &&
                    !isCompleted;

                  return (
                    <div
                      key={task._id}
                      className={`rounded-2xl border bg-[#11111a] p-6 transition ${
                        isCompleted
                          ? "border-emerald-500/20"
                          : isReview
                          ? "border-blue-500/20"
                          : isRejected
                          ? "border-red-500/20"
                          : "border-white/10 hover:border-violet-500/30"
                      }`}
                    >

                      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">

                        {/* TASK INFO */}

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                              <CheckSquare className="h-5 w-5 text-violet-400" />
                            </div>

                            <div>

                              <h3 className="text-lg font-semibold">
                                {task.title}
                              </h3>

                              <p className="mt-1 text-sm text-slate-500">
                                {task.description ||
                                  "No description provided."}
                              </p>

                            </div>

                          </div>

                          {/* META */}

                          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                            <div className="rounded-xl border border-white/5 bg-[#0b0b12] p-3">

                              <div className="flex items-center gap-2 text-xs text-slate-600">
                                <FolderKanban className="h-4 w-4" />
                                Project
                              </div>

                              <p className="mt-2 text-sm text-slate-300">
                                {task.project
                                  ?.name ||
                                  "Unknown Project"}
                              </p>

                            </div>

                            <div className="rounded-xl border border-white/5 bg-[#0b0b12] p-3">

                              <div className="flex items-center gap-2 text-xs text-slate-600">
                                <User className="h-4 w-4" />
                                Assigned By
                              </div>

                              <p className="mt-2 text-sm text-slate-300">
                                {task
                                  .projectManager
                                  ?.name ||
                                  "Project Manager"}
                              </p>

                            </div>

                            <div className="rounded-xl border border-white/5 bg-[#0b0b12] p-3">

                              <div className="flex items-center gap-2 text-xs text-slate-600">
                                <CalendarDays className="h-4 w-4" />
                                Due Date
                              </div>

                              <p className="mt-2 text-sm text-slate-300">
                                {formatDate(
                                  task.dueDate
                                )}
                              </p>

                            </div>

                            <div className="rounded-xl border border-white/5 bg-[#0b0b12] p-3">

                              <div className="flex items-center gap-2 text-xs text-slate-600">
                                <Flag className="h-4 w-4" />
                                Priority
                              </div>

                              <p className="mt-2 text-sm text-slate-300">
                                {priorityLabel(
                                  task.priority
                                )}
                              </p>

                            </div>

                          </div>

                          {/* STATUS */}

                          <div className="mt-5 flex flex-wrap items-center gap-3">

                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                                isCompleted
                                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                  : isReview
                                  ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                                  : isRejected
                                  ? "border-red-500/20 bg-red-500/10 text-red-400"
                                  : "border-violet-500/20 bg-violet-500/10 text-violet-300"
                              }`}
                            >
                              {isRejected
                                ? "Rejected"
                                : statusLabel(
                                    task.status
                                  )}
                            </span>

                            {task.submission
                              ?.submittedAt && (
                              <span className="text-xs text-slate-600">
                                Submitted{" "}
                                {formatDateTime(
                                  task
                                    .submission
                                    .submittedAt
                                )}
                              </span>
                            )}

                            {isReview && (
                              <span className="flex items-center gap-1 text-xs text-blue-400">
                                <Clock3 className="h-3.5 w-3.5" />
                                Waiting for PM review
                              </span>
                            )}

                            {isCompleted && (
                              <span className="flex items-center gap-1 text-xs text-emerald-400">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Approved by PM
                              </span>
                            )}

                            {task.submission
                              ?.evidenceImage && (
                              <span className="flex items-center gap-1 text-xs text-violet-400">
                                <FileImage className="h-4 w-4" />
                                Proof attached
                              </span>
                            )}

                          </div>

                          {/* REJECTION */}

                          {isRejected &&
                            task.submission
                              ?.rejectionReason && (
                              <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4">

                                <div className="flex items-start gap-3">

                                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

                                  <div>

                                    <p className="text-xs font-semibold uppercase tracking-wider text-red-400">
                                      Rejected by Project Manager
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-slate-300">
                                      {
                                        task
                                          .submission
                                          .rejectionReason
                                      }
                                    </p>

                                    {task
                                      .submission
                                      .reviewedBy
                                      ?.name && (
                                      <p className="mt-2 text-xs text-slate-600">
                                        Reviewed by{" "}
                                        {
                                          task
                                            .submission
                                            .reviewedBy
                                            .name
                                        }
                                      </p>
                                    )}

                                  </div>

                                </div>

                              </div>
                            )}

                          {/* APPROVAL */}

                          {isCompleted &&
                            task.submission && (
                              <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">

                                <div className="flex items-start gap-3">

                                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />

                                  <div>

                                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                                      Work Approved
                                    </p>

                                    <p className="mt-2 text-sm text-slate-300">
                                      Your Project Manager
                                      approved this
                                      submission.
                                    </p>

                                    {task
                                      .submission
                                      .reviewComment && (
                                      <p className="mt-2 text-sm text-slate-400">
                                        {
                                          task
                                            .submission
                                            .reviewComment
                                        }
                                      </p>
                                    )}

                                    {task
                                      .submission
                                      .reviewedBy
                                      ?.name && (
                                      <p className="mt-2 text-xs text-slate-600">
                                        Approved by{" "}
                                        {
                                          task
                                            .submission
                                            .reviewedBy
                                            .name
                                        }
                                      </p>
                                    )}

                                  </div>

                                </div>

                              </div>
                            )}

                        </div>

                        {/* ACTION */}

                        <div className="flex shrink-0 flex-col gap-2 xl:w-48">

                          {!isCompleted && (
                            <button
                              type="button"
                              onClick={() =>
                                openCompletionModal(
                                  task
                                )
                              }
                              className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                                isRejected
                                  ? "bg-red-600 text-white hover:bg-red-500"
                                  : isReview
                                  ? "border border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                                  : "bg-violet-600 text-white hover:bg-violet-500"
                              }`}
                            >
                              {isRejected
                                ? "Update & Resubmit"
                                : isReview
                                ? "View Submission"
                                : "Update Work"}
                            </button>
                          )}

                          {isCompleted && (
                            <button
                              type="button"
                              onClick={() =>
                                openCompletionModal(
                                  task
                                )
                              }
                              className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/20"
                            >
                              View Approval
                            </button>
                          )}

                        </div>

                      </div>

                      {/* COMPLETION COMMENT */}

                      {task.submission
                        ?.completionComment && (
                        <div className="mt-6 rounded-xl border border-white/5 bg-[#0b0b12] p-4">

                          <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                            Employee Completion Comment
                          </p>

                          <p className="mt-2 text-sm leading-6 text-slate-300">
                            {
                              task
                                .submission
                                .completionComment
                            }
                          </p>

                        </div>
                      )}

                    </div>
                  );
                }
              )
            )}

          </div>

        </div>
      </div>

      {/* =====================================================
          UPDATE WORK MODAL
      ===================================================== */}

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">

          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-[#11111a] shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#11111a] p-6">

              <div>

                <p className="text-xs uppercase tracking-wider text-violet-400">
                  {selectedTask.status ===
                  "completed"
                    ? "Approved Submission"
                    : selectedTask.status ===
                      "review"
                    ? "Submitted Work"
                    : "Update Work"}
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  {selectedTask.title}
                </h2>

              </div>

              <button
                type="button"
                onClick={
                  closeCompletionModal
                }
                className="rounded-xl border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <div className="space-y-6 p-6">

              {/* TASK DETAILS */}

              <div className="rounded-2xl border border-white/10 bg-[#0b0b12] p-5">

                <div className="grid gap-4 sm:grid-cols-3">

                  <div>
                    <p className="text-xs text-slate-600">
                      Project
                    </p>

                    <p className="mt-1 text-sm text-slate-300">
                      {selectedTask
                        .project
                        ?.name ||
                        "Unknown Project"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-600">
                      Due Date
                    </p>

                    <p className="mt-1 text-sm text-slate-300">
                      {formatDate(
                        selectedTask.dueDate
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-600">
                      Status
                    </p>

                    <p className="mt-1 text-sm text-slate-300">
                      {statusLabel(
                        selectedTask.status
                      )}
                    </p>
                  </div>

                </div>

              </div>

              {/* REJECTION NOTICE */}

              {selectedTask.submission
                ?.rejectionReason &&
                selectedTask.status !==
                  "completed" && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">

                    <div className="flex items-start gap-3">

                      <RotateCcw className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

                      <div>

                        <p className="text-sm font-semibold text-red-400">
                          Changes requested by
                          Project Manager
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {
                            selectedTask
                              .submission
                              .rejectionReason
                          }
                        </p>

                      </div>

                    </div>

                  </div>
                )}

              {/* APPROVED NOTICE */}

              {selectedTask.status ===
                "completed" && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">

                  <div className="flex items-start gap-3">

                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />

                    <div>

                      <p className="text-sm font-semibold text-emerald-400">
                        Work Approved
                      </p>

                      <p className="mt-2 text-sm text-slate-400">
                        This task has been
                        approved by your
                        Project Manager and
                        is now completed.
                      </p>

                      {selectedTask
                        .submission
                        ?.reviewComment && (
                        <p className="mt-3 text-sm text-slate-300">
                          {
                            selectedTask
                              .submission
                              .reviewComment
                          }
                        </p>
                      )}

                    </div>

                  </div>

                </div>
              )}

              {/* COMPLETION COMMENT */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Work Progress / Completion
                  Comment
                  {selectedTask.status !==
                    "review" &&
                    selectedTask.status !==
                      "completed" && (
                      <span className="ml-1 text-red-400">
                        *
                      </span>
                    )}
                </label>

                <textarea
                  value={
                    completionComment
                  }
                  onChange={(e) =>
                    setCompletionComment(
                      e.target.value
                    )
                  }
                  disabled={
                    selectedTask.status ===
                      "review" ||
                    selectedTask.status ===
                      "completed"
                  }
                  rows={5}
                  placeholder="Explain what you completed or what progress you have made..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#0b0b12] p-4 text-sm text-white outline-none placeholder:text-slate-700 focus:border-violet-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                />

              </div>

              {/* SCREENSHOT */}

              <div>

                <div className="mb-3">

                  <label className="block text-sm font-medium text-slate-300">
                    Work Evidence / Screenshot
                    {selectedTask.status !==
                      "review" &&
                      selectedTask.status !==
                        "completed" && (
                        <span className="ml-1 text-slate-500">
                          (required for review)
                        </span>
                      )}
                  </label>

                  <p className="mt-1 text-xs text-slate-600">
                    Upload one screenshot or
                    photo showing your completed
                    work. It is required only
                    when you submit for PM
                    review.
                  </p>

                </div>

                {completionImage ? (
                  <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b12]">

                    <img
                      src={
                        completionImage
                      }
                      alt="Work evidence"
                      className="max-h-[420px] w-full object-contain"
                    />

                    {selectedTask.status !==
                      "review" &&
                      selectedTask.status !==
                        "completed" && (
                        <button
                          type="button"
                          onClick={
                            removeImage
                          }
                          className="absolute right-3 top-3 rounded-xl bg-black/80 p-2 text-white transition hover:bg-red-600"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}

                  </div>
                ) : (
                  selectedTask.status !==
                    "review" &&
                  selectedTask.status !==
                    "completed" && (
                    <label className="flex h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-[#0b0b12] text-center transition hover:border-violet-500/40 hover:bg-violet-500/5">

                      <Upload className="h-8 w-8 text-violet-400" />

                      <span className="mt-3 text-sm font-medium text-slate-300">
                        Upload Screenshot
                      </span>

                      <span className="mt-1 text-xs text-slate-600">
                        PNG, JPG or WEBP • Max
                        6 MB
                      </span>

                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={
                          handleImageUpload
                        }
                        className="hidden"
                      />

                    </label>
                  )
                )}

              </div>

              {/* SUBMISSION DATE */}

              {selectedTask.submission
                ?.submittedAt && (
                <div className="rounded-xl border border-white/5 bg-[#0b0b12] p-4">

                  <p className="text-xs uppercase tracking-wider text-slate-600">
                    Submitted
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    {formatDateTime(
                      selectedTask
                        .submission
                        .submittedAt
                    )}
                  </p>

                </div>
              )}

              {/* SUCCESS */}

              {successMessage && (
                <div className="flex gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">

                  <CheckCircle2 className="h-5 w-5 shrink-0" />

                  <p>
                    {successMessage}
                  </p>

                </div>
              )}

              {/* =================================================
                  ACTIONS

                  ONLY:
                  1. Save Progress
                  2. Submit for Review

                  NO Mark as Completed.
              ================================================= */}

              <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={
                    closeCompletionModal
                  }
                  disabled={saving}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
                >
                  Close
                </button>

                {/* SAVE PROGRESS */}

                {selectedTask.status !==
                  "review" &&
                  selectedTask.status !==
                    "completed" && (
                    <button
                      type="button"
                      onClick={
                        saveProgress
                      }
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-5 py-3 text-sm font-medium text-blue-400 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {saving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Save className="h-5 w-5" />
                      )}

                      Save Progress
                    </button>
                  )}

                {/* SUBMIT FOR REVIEW */}

                {selectedTask.status !==
                  "review" &&
                  selectedTask.status !==
                    "completed" && (
                    <button
                      type="button"
                      onClick={
                        submitForReview
                      }
                      disabled={
                        saving ||
                        !completionImage ||
                        !completionComment.trim()
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-5 w-5" />
                          Submit for Review
                        </>
                      )}
                    </button>
                  )}

                {/* UNDER REVIEW */}

                {selectedTask.status ===
                  "review" && (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-5 py-3 text-sm font-medium text-blue-400">
                    <Clock3 className="h-5 w-5" />
                    Waiting for PM Review
                  </div>
                )}

                {/* COMPLETED */}

                {selectedTask.status ===
                  "completed" && (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3 text-sm font-medium text-emerald-400">
                    <CheckCircle2 className="h-5 w-5" />
                    Approved & Completed
                  </div>
                )}

              </div>

            </div>
          </div>
        </div>
      )}
    </main>
  );
}