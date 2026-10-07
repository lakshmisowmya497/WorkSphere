"use client";

import { FormEvent, useEffect, useState } from "react";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Save,
  Settings,
  UserCog,
  UsersRound,
} from "lucide-react";

interface ProjectManager {
  _id: string;
  name: string;
  email: string;
  department?: string;
  jobTitle?: string;
  status?: string;
}

export default function AddProjectPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [projectManagers, setProjectManagers] = useState<
    ProjectManager[]
  >([]);

  const [loadingManagers, setLoadingManagers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    projectManager: "",
    status: "planning",
  });

  // FETCH PROJECT MANAGERS
  useEffect(() => {
    const fetchProjectManagers = async () => {
      try {
        setLoadingManagers(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Authentication token not found.");
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/admin/project-managers",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch Project Managers"
          );
        }

        const managers = (
          data.projectManagers || []
        ).filter(
          (manager: ProjectManager) =>
            manager.status === "active"
        );

        setProjectManagers(managers);
      } catch (err) {
        console.error(
          "Fetch Project Managers error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load Project Managers."
        );
      } finally {
        setLoadingManagers(false);
      }
    };

    fetchProjectManagers();
  }, []);

  // HANDLE INPUT
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // CREATE PROJECT
  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Project name is required.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Project description is required.");
      return;
    }

    if (!formData.startDate) {
      setError("Start date is required.");
      return;
    }

    if (!formData.endDate) {
      setError("End date is required.");
      return;
    }

    if (!formData.projectManager) {
      setError("Please select a Project Manager.");
      return;
    }

    if (
      new Date(formData.endDate) <
      new Date(formData.startDate)
    ) {
      setError(
        "End date cannot be earlier than start date."
      );
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication token not found.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/admin/projects",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            description: formData.description.trim(),
            startDate: formData.startDate,
            endDate: formData.endDate,
            projectManager: formData.projectManager,
            status: formData.status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create project."
        );
      }

      setSuccess("Project created successfully.");

      setFormData({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        projectManager: "",
        status: "planning",
      });

      setTimeout(() => {
        window.location.href =
          "/dashboard/admin/projects";
      }, 1000);
    } catch (err) {
      console.error("Create project error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create project."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08050f] text-white">
      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen border-r border-white/10 bg-[#0d0918] transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* LOGO */}
          <div className="flex h-20 items-center border-b border-white/10 px-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20">
              <Building2 className="h-5 w-5 text-violet-400" />
            </div>

            {sidebarOpen && (
              <div className="ml-3">
                <h1 className="text-lg font-bold">
                  Work
                  <span className="text-violet-400">
                    Sphere
                  </span>
                </h1>

                <p className="text-xs text-gray-500">
                  Admin Panel
                </p>
              </div>
            )}
          </div>

          {/* NAVIGATION */}
          <nav className="flex-1 space-y-1 p-3">
            <button
              onClick={() =>
                (window.location.href =
                  "/dashboard/admin")
              }
              className="flex w-full items-center rounded-xl px-3 py-3 text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              <LayoutDashboard className="h-5 w-5" />

              {sidebarOpen && (
                <span className="ml-3 text-sm">
                  Dashboard
                </span>
              )}
            </button>

            <button
              onClick={() =>
                (window.location.href =
                  "/dashboard/admin/project-managers")
              }
              className="flex w-full items-center rounded-xl px-3 py-3 text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              <UserCog className="h-5 w-5" />

              {sidebarOpen && (
                <span className="ml-3 text-sm">
                  Project Managers
                </span>
              )}
            </button>

            <button
              onClick={() =>
                (window.location.href =
                  "/dashboard/admin/employees")
              }
              className="flex w-full items-center rounded-xl px-3 py-3 text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              <UsersRound className="h-5 w-5" />

              {sidebarOpen && (
                <span className="ml-3 text-sm">
                  Employees
                </span>
              )}
            </button>

            {/* PROJECTS */}
            <button
              onClick={() =>
                (window.location.href =
                  "/dashboard/admin/projects")
              }
              className="flex w-full items-center rounded-xl bg-violet-600/15 px-3 py-3 text-violet-400"
            >
              <FolderKanban className="h-5 w-5" />

              {sidebarOpen && (
                <span className="ml-3 text-sm font-medium">
                  Projects
                </span>
              )}
            </button>

            <button
              onClick={() =>
                (window.location.href =
                  "/dashboard/admin/tasks")
              }
              className="flex w-full items-center rounded-xl px-3 py-3 text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              <ClipboardList className="h-5 w-5" />

              {sidebarOpen && (
                <span className="ml-3 text-sm">
                  Tasks
                </span>
              )}
            </button>

            <button
              onClick={() =>
                (window.location.href =
                  "/dashboard/admin/leave-requests")
              }
              className="flex w-full items-center rounded-xl px-3 py-3 text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              <CalendarDays className="h-5 w-5" />

              {sidebarOpen && (
                <span className="ml-3 text-sm">
                  Leave Requests
                </span>
              )}
            </button>

            <button
              onClick={() =>
                (window.location.href =
                  "/dashboard/admin/reports")
              }
              className="flex w-full items-center rounded-xl px-3 py-3 text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              <FileText className="h-5 w-5" />

              {sidebarOpen && (
                <span className="ml-3 text-sm">
                  Reports
                </span>
              )}
            </button>

            <button
              onClick={() =>
                (window.location.href =
                  "/dashboard/admin/settings")
              }
              className="flex w-full items-center rounded-xl px-3 py-3 text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              <Settings className="h-5 w-5" />

              {sidebarOpen && (
                <span className="ml-3 text-sm">
                  Settings
                </span>
              )}
            </button>
          </nav>

          {/* BOTTOM */}
          <div className="border-t border-white/10 p-3">
            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
              className="flex w-full items-center rounded-xl px-3 py-3 text-gray-400 transition hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut className="h-5 w-5" />

              {sidebarOpen && (
                <span className="ml-3 text-sm">
                  Logout
                </span>
              )}
            </button>

            <button
              onClick={() =>
                setSidebarOpen(!sidebarOpen)
              }
              className="mt-2 flex w-full items-center justify-center rounded-xl border border-white/10 py-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  sidebarOpen
                    ? "rotate-90"
                    : "-rotate-90"
                }`}
              />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main
        style={{
          marginLeft: sidebarOpen ? "256px" : "80px",
        }}
        className="min-h-screen transition-all duration-300"
      >
        {/* HEADER */}
        <header className="border-b border-white/10 bg-[#08050f]/90 px-8 py-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                (window.location.href =
                  "/dashboard/admin/projects")
              }
              title="Back to Projects"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div>
              <h2 className="text-2xl font-bold">
                Create New Project
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Create a project and assign it to a
                Project Manager.
              </p>
            </div>
          </div>
        </header>

        {/* FORM */}
        {/* FORM */}
<div className="px-4 py-8">
  <div className="w-full">
    <div className="rounded-2xl border border-white/10 bg-[#100b1d] p-7 lg:p-8">
      <form onSubmit={handleSubmit}>
                {/* PROJECT INFORMATION */}
                <div className="mb-7">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                      <FolderKanban className="h-5 w-5 text-violet-400" />
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        Project Information
                      </h3>

                      <p className="text-xs text-gray-500">
                        Enter the basic project details.
                      </p>
                    </div>
                  </div>

                  {/* NAME */}
                  <div className="mb-5">
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium text-gray-300"
                    >
                      Project Name
                      <span className="ml-1 text-red-400">
                        *
                      </span>
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter project name"
                      className="w-full rounded-xl border border-white/10 bg-[#0b0713] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-violet-500/50"
                    />
                  </div>

                  {/* DESCRIPTION */}
                  <div>
                    <label
                      htmlFor="description"
                      className="mb-2 block text-sm font-medium text-gray-300"
                    >
                      Description
                      <span className="ml-1 text-red-400">
                        *
                      </span>
                    </label>

                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the project..."
                      rows={5}
                      className="w-full resize-none rounded-xl border border-white/10 bg-[#0b0713] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-violet-500/50"
                    />
                  </div>
                </div>

                {/* TIMELINE */}
                <div className="mb-7">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                      <CalendarDays className="h-5 w-5 text-blue-400" />
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        Project Timeline
                      </h3>

                      <p className="text-xs text-gray-500">
                        Set the project start and end dates.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="startDate"
                        className="mb-2 block text-sm font-medium text-gray-300"
                      >
                        Start Date
                        <span className="ml-1 text-red-400">
                          *
                        </span>
                      </label>

                      <input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-[#0b0713] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-500/50"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="endDate"
                        className="mb-2 block text-sm font-medium text-gray-300"
                      >
                        End Date
                        <span className="ml-1 text-red-400">
                          *
                        </span>
                      </label>

                      <input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-[#0b0713] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-500/50"
                      />
                    </div>
                  </div>
                </div>

                {/* ASSIGNMENT */}
                <div className="mb-7">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                      <UserCog className="h-5 w-5 text-violet-400" />
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        Assignment
                      </h3>

                      <p className="text-xs text-gray-500">
                        Assign the project to an active
                        Project Manager.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* PROJECT MANAGER */}
                    <div>
                      <label
                        htmlFor="projectManager"
                        className="mb-2 block text-sm font-medium text-gray-300"
                      >
                        Project Manager
                        <span className="ml-1 text-red-400">
                          *
                        </span>
                      </label>

                      <div className="relative">
                        <select
                          id="projectManager"
                          name="projectManager"
                          value={
                            formData.projectManager
                          }
                          onChange={handleChange}
                          disabled={loadingManagers}
                          className="w-full appearance-none rounded-xl border border-white/10 bg-[#0b0713] px-4 py-3 pr-10 text-sm text-white outline-none transition focus:border-violet-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option
                            value=""
                            className="bg-[#100b1d]"
                          >
                            {loadingManagers
                              ? "Loading Project Managers..."
                              : projectManagers.length ===
                                0
                              ? "No active managers available"
                              : "Select Project Manager"}
                          </option>

                          {projectManagers.map(
                            (manager) => (
                              <option
                                key={manager._id}
                                value={manager._id}
                                className="bg-[#100b1d]"
                              >
                                {manager.name}
                                {manager.department
                                  ? ` — ${manager.department}`
                                  : ""}
                              </option>
                            )
                          )}
                        </select>

                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      </div>

                      {projectManagers.length === 0 &&
                        !loadingManagers && (
                          <p className="mt-2 text-xs text-yellow-400">
                            No active Project Managers
                            are available. Create or
                            activate a Project Manager
                            first.
                          </p>
                        )}
                    </div>

                    {/* STATUS */}
                    <div>
                      <label
                        htmlFor="status"
                        className="mb-2 block text-sm font-medium text-gray-300"
                      >
                        Initial Status
                      </label>

                      <div className="relative">
                        <select
                          id="status"
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full appearance-none rounded-xl border border-white/10 bg-[#0b0713] px-4 py-3 pr-10 text-sm text-white outline-none transition focus:border-violet-500/50"
                        >
                          <option
                            value="planning"
                            className="bg-[#100b1d]"
                          >
                            Planning
                          </option>

                          <option
                            value="active"
                            className="bg-[#100b1d]"
                          >
                            Active
                          </option>

                          <option
                            value="on_hold"
                            className="bg-[#100b1d]"
                          >
                            On Hold
                          </option>

                          <option
                            value="completed"
                            className="bg-[#100b1d]"
                          >
                            Completed
                          </option>
                        </select>

                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ERROR */}
                {error && (
                  <div className="mb-5 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                {/* SUCCESS */}
                {success && (
                  <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-400/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    {success}
                  </div>
                )}

                {/* BUTTONS */}
                <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      (window.location.href =
                        "/dashboard/admin/projects")
                    }
                    className="rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-gray-400 transition hover:bg-white/5 hover:text-white"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />

                    {submitting
                      ? "Creating..."
                      : "Create Project"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}