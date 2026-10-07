"use client";

import { useEffect, useState } from "react";

import {
  Search,
  Plus,
  Pencil,
  Trash2,
  UserRound,
  UsersRound,
  FolderKanban,
} from "lucide-react";

interface ProjectManager {
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
  description: string;
  startDate: string;
  endDate: string;
  status: "planning" | "active" | "on_hold" | "completed";
  projectManager: ProjectManager | null;
  teamSize: number;
  createdAt?: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusMenu, setStatusMenu] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] =
    useState<string | null>(null);

  // ===============================
  // Fetch Projects
  // ===============================

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication token not found.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/admin/projects",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch projects"
        );
      }

      setProjects(data.projects || []);
    } catch (err) {
      console.error("Fetch projects error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // ===============================
  // Search
  // ===============================

  const filteredProjects = projects.filter((project) => {
    const searchText = search.toLowerCase();

    return (
      project.name.toLowerCase().includes(searchText) ||
      project.description
        .toLowerCase()
        .includes(searchText) ||
      project.projectManager?.name
        ?.toLowerCase()
        .includes(searchText) ||
      project.status.toLowerCase().includes(searchText)
    );
  });

  // ===============================
  // Date Formatting
  // ===============================

  const formatDate = (date: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ===============================
  // Status Label
  // ===============================

  const getStatusLabel = (status: Project["status"]) => {
    switch (status) {
      case "planning":
        return "Planning";

      case "active":
        return "Active";

      case "on_hold":
        return "On Hold";

      case "completed":
        return "Completed";

      default:
        return status;
    }
  };

  // ===============================
  // Status Style
  // ===============================

  const getStatusStyle = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "border-green-400/20 bg-green-500/10 text-green-400";

      case "completed":
        return "border-blue-400/20 bg-blue-500/10 text-blue-400";

      case "on_hold":
        return "border-yellow-400/20 bg-yellow-500/10 text-yellow-400";

      case "planning":
      default:
        return "border-violet-400/20 bg-violet-500/10 text-violet-400";
    }
  };

  // ===============================
  // Update Project Status
  // ===============================

  const updateStatus = async (
    projectId: string,
    status: Project["status"]
  ) => {
    try {
      setUpdatingStatus(projectId);
      setStatusMenu(null);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Authentication token not found.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/admin/projects/${projectId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update status"
        );
      }

      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project._id === projectId
            ? { ...project, status }
            : project
        )
      );
    } catch (err) {
      console.error("Update status error:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Failed to update project status."
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  // ===============================
  // Delete Project
  // ===============================

  const deleteProject = async (projectId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Authentication token not found.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/admin/projects/${projectId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete project"
        );
      }

      setProjects((currentProjects) =>
        currentProjects.filter(
          (project) => project._id !== projectId
        )
      );
    } catch (err) {
      console.error("Delete project error:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete project."
      );
    }
  };

  // ===============================
  // Statistics
  // ===============================

  const activeCount = projects.filter(
    (project) => project.status === "active"
  ).length;

  const planningCount = projects.filter(
    (project) => project.status === "planning"
  ).length;

  const completedCount = projects.filter(
    (project) => project.status === "completed"
  ).length;

  // ===============================
  // UI
  // ===============================

  return (
    <div className="min-h-screen bg-[#08050f] text-white">
      {/* HEADER */}

      <header className="border-b border-white/10 bg-[#08050f]/90 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Projects
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage organization projects and assignments.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              (window.location.href =
                "/dashboard/admin/projects/add")
            }
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500"
          >
            <Plus className="h-4 w-4" />
            Add Project
          </button>
        </div>
      </header>

      {/* CONTENT */}

      <div className="p-8">
        {/* STATISTICS */}

        <div className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Total */}

          <div className="rounded-2xl border border-white/10 bg-[#100b1d] p-5">
            <p className="text-sm text-gray-500">
              Total Projects
            </p>

            <p className="mt-2 text-3xl font-bold">
              {projects.length}
            </p>
          </div>

          {/* Active */}

          <div className="rounded-2xl border border-green-400/10 bg-[#100b1d] p-5">
            <p className="text-sm text-gray-500">
              Active
            </p>

            <p className="mt-2 text-3xl font-bold text-green-400">
              {activeCount}
            </p>
          </div>

          {/* Planning */}

          <div className="rounded-2xl border border-violet-400/10 bg-[#100b1d] p-5">
            <p className="text-sm text-gray-500">
              Planning
            </p>

            <p className="mt-2 text-3xl font-bold text-violet-400">
              {planningCount}
            </p>
          </div>

          {/* Completed */}

          <div className="rounded-2xl border border-blue-400/10 bg-[#100b1d] p-5">
            <p className="text-sm text-gray-500">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-400">
              {completedCount}
            </p>
          </div>
        </div>

        {/* SEARCH */}

        <div className="mb-7">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search projects, managers, status..."
              className="w-full rounded-xl border border-white/10 bg-[#100b1d] py-3 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-violet-500/50"
            />
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-sm text-gray-500">
              Loading projects...
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          /* NO PROJECTS */

          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#100b1d]">
            <FolderKanban className="mb-4 h-12 w-12 text-gray-600" />

            <h3 className="text-lg font-semibold">
              {search
                ? "No projects found"
                : "No projects yet"}
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              {search
                ? "Try a different search."
                : "Create your first project to get started."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={() =>
                  (window.location.href =
                    "/dashboard/admin/projects/add")
                }
                className="mt-5 flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-violet-500"
              >
                <Plus className="h-4 w-4" />
                Add Project
              </button>
            )}
          </div>
        ) : (
          /* PROJECT CARDS */

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="group rounded-2xl border border-white/10 bg-[#100b1d] p-6 transition hover:border-violet-500/30 hover:bg-[#120d21]"
              >
                {/* TOP */}

                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-white">
                      {project.name}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                      {project.description}
                    </p>
                  </div>

                  {/* STATUS */}

                  <div className="relative shrink-0">
                    <button
                      type="button"
                      disabled={
                        updatingStatus === project._id
                      }
                      onClick={() =>
                        setStatusMenu(
                          statusMenu === project._id
                            ? null
                            : project._id
                        )
                      }
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${getStatusStyle(
                        project.status
                      )}`}
                    >
                      {updatingStatus === project._id
                        ? "Updating..."
                        : getStatusLabel(
                            project.status
                          )}
                    </button>

                    {statusMenu === project._id && (
                      <div className="absolute right-0 top-10 z-20 w-36 overflow-hidden rounded-xl border border-white/10 bg-[#171024] p-1 shadow-2xl">
                        <button
                          type="button"
                          onClick={() =>
                            updateStatus(
                              project._id,
                              "planning"
                            )
                          }
                          className="w-full rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/5"
                        >
                          Planning
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateStatus(
                              project._id,
                              "active"
                            )
                          }
                          className="w-full rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/5"
                        >
                          Active
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateStatus(
                              project._id,
                              "on_hold"
                            )
                          }
                          className="w-full rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/5"
                        >
                          On Hold
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateStatus(
                              project._id,
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

                {/* DETAILS */}

                <div className="mt-6 grid grid-cols-2 gap-4">
                  {/* Start Date */}

                  <div>
                    <p className="text-xs text-gray-600">
                      Start Date
                    </p>

                    <p className="mt-1 text-sm text-gray-300">
                      {formatDate(project.startDate)}
                    </p>
                  </div>

                  {/* End Date */}

                  <div>
                    <p className="text-xs text-gray-600">
                      End Date
                    </p>

                    <p className="mt-1 text-sm text-gray-300">
                      {formatDate(project.endDate)}
                    </p>
                  </div>

                  {/* Project Manager */}

                  <div>
                    <p className="text-xs text-gray-600">
                      Project Manager
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/10">
                        <UserRound className="h-3.5 w-3.5 text-violet-400" />
                      </div>

                      <p className="truncate text-sm text-gray-300">
                        {project.projectManager?.name ||
                          "Not assigned"}
                      </p>
                    </div>
                  </div>

                  {/* Team Size */}

                  <div>
                    <p className="text-xs text-gray-600">
                      Team Size
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <UsersRound className="h-4 w-4 text-gray-500" />

                      <p className="text-sm text-gray-300">
                        {project.teamSize} employees
                      </p>
                    </div>
                  </div>
                </div>

                {/* DIVIDER */}

                <div className="my-5 border-t border-white/10" />

                {/* ACTIONS */}

                <div className="flex items-center justify-end gap-2">
                  {/* Edit */}

                  <button
                    type="button"
                    title="Edit Project"
                    onClick={() =>
                      (window.location.href = `/dashboard/admin/projects/${project._id}/edit`)
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-400 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-400"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  {/* Assign Manager */}

                  <button
                    type="button"
                    title="Assign Project Manager"
                    onClick={() =>
                      (window.location.href = `/dashboard/admin/projects/${project._id}/edit?assign=manager`)
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-400 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-400"
                  >
                    <UserRound className="h-4 w-4" />
                  </button>

                  {/* Delete */}

                  <button
                    type="button"
                    title="Delete Project"
                    onClick={() =>
                      deleteProject(project._id)
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-400 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}