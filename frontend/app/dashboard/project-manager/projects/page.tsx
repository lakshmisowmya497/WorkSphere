"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Calendar,
  User,
  Clock,
  X,
  ChevronDown,
  RefreshCw,
  FolderKanban,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";

interface ProjectManager {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  department?: string;
  jobTitle?: string;
  status?: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status:
    | "planning"
    | "active"
    | "on_hold"
    | "completed";
  projectManager?: ProjectManager | null;
  createdAt?: string;
  updatedAt?: string;
}

type StatusFilter =
  | "all"
  | "planning"
  | "active"
  | "on_hold"
  | "completed";

export default function ProjectManagerProjectsPage() {
  const [projects, setProjects] =
    useState<Project[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  const [statusMenu, setStatusMenu] =
    useState<string | null>(null);

  const [updatingStatus, setUpdatingStatus] =
    useState<string | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  const API_BASE = "http://localhost:5000/api";

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("user");

    window.location.href = "/login";
  };

  const fetchProjects = async (
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
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `${API_BASE}/project-managers/projects`,
        {
          method: "GET",
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
          data.message || "Unable to load projects"
        );
      }

      setProjects(data.projects || []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load projects"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        project.name.toLowerCase().includes(query) ||
        project.description
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const counts = {
    total: projects.length,

    planning: projects.filter(
      (project) => project.status === "planning"
    ).length,

    active: projects.filter(
      (project) => project.status === "active"
    ).length,

    completed: projects.filter(
      (project) => project.status === "completed"
    ).length,
  };

  const formatDate = (date: string) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatusLabel = (status: Project["status"]) => {
    const labels = {
      planning: "Planning",
      active: "Active",
      on_hold: "On Hold",
      completed: "Completed",
    };

    return labels[status];
  };

  const getStatusClass = (
    status: Project["status"]
  ) => {
    const classes = {
      planning:
        "bg-blue-500/10 text-blue-400 border-blue-500/20",
      active:
        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      on_hold:
        "bg-amber-500/10 text-amber-400 border-amber-500/20",
      completed:
        "bg-violet-500/10 text-violet-400 border-violet-500/20",
    };

    return classes[status];
  };

  const updateStatus = async (
    projectId: string,
    status: Project["status"]
  ) => {
    try {
      setUpdatingStatus(projectId);
      setStatusMenu(null);

      const token = getToken();

      if (!token) {
        handleLogout();
        return;
      }

      const response = await fetch(
        `${API_BASE}/project-managers/projects/${projectId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
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
            "Unable to update project status"
        );
      }

      setProjects((current) =>
        current.map((project) =>
          project._id === projectId
            ? {
                ...project,
                status,
              }
            : project
        )
      );

      setSelectedProject((current) =>
        current?._id === projectId
          ? {
              ...current,
              status,
            }
          : current
      );
    } catch (err) {
      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "Unable to update project status"
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050509] text-white">
      {/* HEADER */}

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
                Projects
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-bold">
              Projects
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View and manage projects assigned to you.
            </p>
          </div>

          <Link
            href="/dashboard/project-manager"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="p-8">
        {/* STATS */}

        <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-xs text-gray-500">
              Total Projects
            </p>

            <p className="mt-2 text-3xl font-bold">
              {counts.total}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-xs text-gray-500">
              Active
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-400">
              {counts.active}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-xs text-gray-500">
              Planning
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-400">
              {counts.planning}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-xs text-gray-500">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold text-violet-400">
              {counts.completed}
            </p>
          </div>
        </div>

        {/* FILTERS */}

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
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search projects..."
                className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-600 focus:border-violet-500/50"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as StatusFilter
                )
              }
              className="rounded-xl border border-white/10 bg-[#0c0c12] px-4 py-3 text-sm text-gray-300 outline-none focus:border-violet-500/50"
            >
              <option value="all">
                All Status
              </option>

              <option value="planning">
                Planning
              </option>

              <option value="active">
                Active
              </option>

              <option value="on_hold">
                On Hold
              </option>

              <option value="completed">
                Completed
              </option>
            </select>

            <button
              type="button"
              onClick={() => fetchProjects(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
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
          </div>
        </div>

        {/* LOADING */}

        {loading && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex items-center gap-3 text-gray-400">
              <Loader2
                size={24}
                className="animate-spin text-violet-500"
              />
              Loading projects...
            </div>
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
            <AlertCircle
              size={38}
              className="mx-auto mb-4 text-red-400"
            />

            <h2 className="font-semibold">
              Unable to load projects
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => fetchProjects()}
              className="mt-5 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium hover:bg-violet-500"
            >
              Try Again
            </button>
          </div>
        )}

        {/* PROJECTS */}

        {!loading && !error && (
          <>
            {filteredProjects.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] py-20 text-center">
                <FolderKanban
                  size={42}
                  className="mx-auto mb-4 text-gray-700"
                />

                <h2 className="text-lg font-semibold">
                  No projects found
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  Try changing your search or status
                  filter.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 xl:grid-cols-2">
                {filteredProjects.map((project) => (
                  <div
                    key={project._id}
                    className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:border-violet-500/20"
                  >
                    {/* PROJECT HEADER */}

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                          <FolderKanban
                            size={20}
                            className="text-violet-400"
                          />
                        </div>

                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-semibold">
                            {project.name}
                          </h2>

                          <p className="mt-1 text-xs text-gray-600">
                            Project
                          </p>
                        </div>
                      </div>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setStatusMenu(
                              statusMenu ===
                                project._id
                                ? null
                                : project._id
                            )
                          }
                          disabled={
                            updatingStatus ===
                            project._id
                          }
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${getStatusClass(
                            project.status
                          )}`}
                        >
                          {getStatusLabel(
                            project.status
                          )}

                          <ChevronDown size={13} />
                        </button>

                        {statusMenu ===
                          project._id && (
                          <div className="absolute right-0 top-10 z-30 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#101018] p-1 shadow-2xl">
                            {(
                              [
                                "planning",
                                "active",
                                "on_hold",
                                "completed",
                              ] as Project["status"][]
                            ).map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() =>
                                  updateStatus(
                                    project._id,
                                    status
                                  )
                                }
                                className="w-full rounded-lg px-3 py-2 text-left text-xs text-gray-300 transition hover:bg-white/5 hover:text-white"
                              >
                                {getStatusLabel(
                                  status
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* DESCRIPTION */}

                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-400">
                      {project.description}
                    </p>

                    {/* DETAILS */}

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/5 bg-black/10 p-3">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Calendar size={14} />
                          Start Date
                        </div>

                        <p className="mt-1 text-sm text-gray-300">
                          {formatDate(
                            project.startDate
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/5 bg-black/10 p-3">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Clock size={14} />
                          End Date
                        </div>

                        <p className="mt-1 text-sm text-gray-300">
                          {formatDate(
                            project.endDate
                          )}
                        </p>
                      </div>
                    </div>

                    {/* FOOTER */}

                    <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-5">
                      <div className="flex min-w-0 items-center gap-2">
                        <User
                          size={15}
                          className="shrink-0 text-gray-600"
                        />

                        <span className="truncate text-xs text-gray-500">
                          {project.projectManager
                            ?.name ||
                            "Project Manager"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedProject(
                            project
                          )
                        }
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 transition hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-300"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* PROJECT DETAILS MODAL */}

      {selectedProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0c0c13] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-violet-400">
                  Project Details
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {selectedProject.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedProject(null)
                }
                className="rounded-lg p-2 text-gray-500 transition hover:bg-white/5 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-600">
                  Description
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  {selectedProject.description}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                  <p className="text-xs text-gray-600">
                    Status
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full border px-3 py-1.5 text-xs font-medium ${getStatusClass(
                      selectedProject.status
                    )}`}
                  >
                    {getStatusLabel(
                      selectedProject.status
                    )}
                  </span>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                  <p className="text-xs text-gray-600">
                    Project Manager
                  </p>

                  <p className="mt-2 text-sm text-gray-300">
                    {selectedProject.projectManager
                      ?.name || "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                  <p className="text-xs text-gray-600">
                    Start Date
                  </p>

                  <p className="mt-2 text-sm text-gray-300">
                    {formatDate(
                      selectedProject.startDate
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                  <p className="text-xs text-gray-600">
                    End Date
                  </p>

                  <p className="mt-2 text-sm text-gray-300">
                    {formatDate(
                      selectedProject.endDate
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 px-6 py-4 text-right">
              <button
                type="button"
                onClick={() =>
                  setSelectedProject(null)
                }
                className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLICK OUTSIDE STATUS MENU */}

      {statusMenu && (
        <button
          type="button"
          aria-label="Close status menu"
          onClick={() => setStatusMenu(null)}
          className="fixed inset-0 z-20 cursor-default"
        />
      )}
    </div>
  );
}