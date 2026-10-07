"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  ClipboardList,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  UserCog,
  UsersRound,
  FolderKanban,
} from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";

interface Project {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface Person {
  _id: string;
  name: string;
  email: string;
  department?: string;
  jobTitle?: string;
  status: string;
  projectManager?: {
    _id: string;
    name: string;
  } | null;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  project: Project | null;
  projectManager: Person | null;
  assignedEmployee: Person | null;
  priority: "low" | "medium" | "high" | "critical";
  status: "todo" | "in_progress" | "review" | "completed";
  dueDate: string;
}

export default function EditTaskPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const taskId = params.id as string;

  const assignMode =
    searchParams.get("assign") === "employee";

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [task, setTask] = useState<Task | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [managers, setManagers] = useState<Person[]>([]);
  const [employees, setEmployees] = useState<Person[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [project, setProject] = useState("");
  const [projectManager, setProjectManager] =
    useState("");
  const [assignedEmployee, setAssignedEmployee] =
    useState("");

  const [priority, setPriority] = useState<
    "low" | "medium" | "high" | "critical"
  >("medium");

  const [status, setStatus] = useState<
    "todo" | "in_progress" | "review" | "completed"
  >("todo");

  const [dueDate, setDueDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  // ---------------------------------------------
  // LOAD TASK + PROJECTS + MANAGERS + EMPLOYEES
  // ---------------------------------------------

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Authentication token not found.");
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [
          taskResponse,
          projectsResponse,
          managersResponse,
          employeesResponse,
        ] = await Promise.all([
          fetch(
            `http://localhost:5000/api/admin/tasks/${taskId}`,
            { headers }
          ),

          fetch(
            "http://localhost:5000/api/admin/projects",
            { headers }
          ),

          fetch(
            "http://localhost:5000/api/admin/project-managers",
            { headers }
          ),

          fetch(
            "http://localhost:5000/api/admin/employees",
            { headers }
          ),
        ]);

        const taskData = await taskResponse.json();
        const projectsData =
          await projectsResponse.json();
        const managersData =
          await managersResponse.json();
        const employeesData =
          await employeesResponse.json();

        if (!taskResponse.ok) {
          throw new Error(
            taskData.message ||
              "Failed to load task."
          );
        }

        if (!projectsResponse.ok) {
          throw new Error(
            projectsData.message ||
              "Failed to load projects."
          );
        }

        if (!managersResponse.ok) {
          throw new Error(
            managersData.message ||
              "Failed to load project managers."
          );
        }

        if (!employeesResponse.ok) {
          throw new Error(
            employeesData.message ||
              "Failed to load employees."
          );
        }

        const loadedTask =
          taskData.task || taskData;

        setTask(loadedTask);

        setProjects(
          projectsData.projects ||
            projectsData ||
            []
        );

        setManagers(
          managersData.projectManagers ||
            managersData.managers ||
            managersData ||
            []
        );

        setEmployees(
          employeesData.employees ||
            employeesData ||
            []
        );

        // -----------------------------------------
        // FILL FORM
        // -----------------------------------------

        setTitle(loadedTask.title || "");

        setDescription(
          loadedTask.description || ""
        );

        setProject(
          loadedTask.project?._id ||
            loadedTask.project ||
            ""
        );

        setProjectManager(
          loadedTask.projectManager?._id ||
            loadedTask.projectManager ||
            ""
        );

        setAssignedEmployee(
          loadedTask.assignedEmployee?._id ||
            loadedTask.assignedEmployee ||
            ""
        );

        setPriority(
          loadedTask.priority || "medium"
        );

        setStatus(
          loadedTask.status || "todo"
        );

        if (loadedTask.dueDate) {
          setDueDate(
            new Date(loadedTask.dueDate)
              .toISOString()
              .split("T")[0]
          );
        }
      } catch (err) {
        console.error(
          "Load edit task error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load task."
        );
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      loadData();
    }
  }, [taskId]);

  // ---------------------------------------------
  // AVAILABLE EMPLOYEES
  // ---------------------------------------------

  const availableEmployees = employees.filter(
    (employee) => {
      if (employee.status !== "active") {
        return false;
      }

      if (!projectManager) {
        return false;
      }

      return (
        employee.projectManager?._id ===
        projectManager
      );
    }
  );

  // ---------------------------------------------
  // PROJECT CHANGE
  // ---------------------------------------------

  const handleProjectChange = (
    projectId: string
  ) => {
    setProject(projectId);

    const selectedProject = projects.find(
      (item) => item._id === projectId
    );

    if (
      selectedProject &&
      task?.projectManager?._id
    ) {
      const currentManager =
        selectedProject as Project & {
          projectManager?: {
            _id: string;
            name: string;
          };
        };

      if (currentManager.projectManager?._id) {
        setProjectManager(
          currentManager.projectManager._id
        );
      } else {
        setProjectManager("");
      }
    }

    setAssignedEmployee("");
  };

  // ---------------------------------------------
  // UPDATE TASK
  // ---------------------------------------------

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    if (!description.trim()) {
      alert("Please enter a task description.");
      return;
    }

    if (!project) {
      alert("Please select a project.");
      return;
    }

    if (!projectManager) {
      alert(
        "Please select a Project Manager."
      );
      return;
    }

    if (!dueDate) {
      alert("Please select a due date.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Authentication token not found.");
        return;
      }

      // -----------------------------------------
      // UPDATE BASIC TASK DETAILS
      // -----------------------------------------

      const response = await fetch(
        `http://localhost:5000/api/admin/tasks/${taskId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            project,
            projectManager,
            assignedEmployee:
              assignedEmployee || null,
            priority,
            status,
            dueDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update task."
        );
      }

      alert("Task updated successfully.");

      window.location.href =
        "/dashboard/admin/tasks";
    } catch (err) {
      console.error(
        "Update task error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update task."
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------
  // ASSIGN EMPLOYEE
  // ---------------------------------------------

  const handleAssignEmployee = async () => {
    try {
      setAssigning(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Authentication token not found.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/admin/tasks/${taskId}/employee`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            assignedEmployee:
              assignedEmployee || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to assign employee."
        );
      }

      alert(
        assignedEmployee
          ? "Employee assigned successfully."
          : "Employee assignment removed successfully."
      );

      window.location.href =
        "/dashboard/admin/tasks";
    } catch (err) {
      console.error(
        "Assign employee error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to assign employee."
      );
    } finally {
      setAssigning(false);
    }
  };

  // ---------------------------------------------
  // ASSIGN PROJECT MANAGER
  // ---------------------------------------------

  const handleAssignManager = async () => {
    try {
      setAssigning(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Authentication token not found.");
        return;
      }

      if (!projectManager) {
        alert(
          "Please select a Project Manager."
        );
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/admin/tasks/${taskId}/manager`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            projectManager,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to assign Project Manager."
        );
      }

      alert(
        "Project Manager assigned successfully."
      );

      window.location.href =
        "/dashboard/admin/tasks";
    } catch (err) {
      console.error(
        "Assign manager error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to assign Project Manager."
      );
    } finally {
      setAssigning(false);
    }
  };

  // ---------------------------------------------
  // LOADING
  // ---------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08050f] text-white">
        <p className="text-gray-500">
          Loading task...
        </p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#08050f] text-white">
        <p className="text-gray-400">
          Task not found.
        </p>

        <button
          onClick={() =>
            (window.location.href =
              "/dashboard/admin/tasks")
          }
          className="mt-5 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold hover:bg-violet-500"
        >
          Back to Tasks
        </button>
      </div>
    );
  }

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

            <button
              onClick={() =>
                (window.location.href =
                  "/dashboard/admin/projects")
              }
              className="flex w-full items-center rounded-xl px-3 py-3 text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              <FolderKanban className="h-5 w-5" />

              {sidebarOpen && (
                <span className="ml-3 text-sm">
                  Projects
                </span>
              )}
            </button>

            <button
              onClick={() =>
                (window.location.href =
                  "/dashboard/admin/tasks")
              }
              className="flex w-full items-center rounded-xl bg-violet-600/15 px-3 py-3 text-violet-400"
            >
              <ClipboardList className="h-5 w-5" />

              {sidebarOpen && (
                <span className="ml-3 text-sm font-medium">
                  Tasks
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

      {/* MAIN */}

      <main
        style={{
          marginLeft: sidebarOpen
            ? "256px"
            : "80px",
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
                  "/dashboard/admin/tasks")
              }
              title="Back to Tasks"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div>
              <h2 className="text-2xl font-bold">
                {assignMode
                  ? "Assign Task"
                  : "Edit Task"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {assignMode
                  ? "Manage the Project Manager and employee assigned to this task."
                  : "Update task details, assignments and progress."}
              </p>
            </div>

          </div>
        </header>

        <div className="p-8">

          {/* FIXED: removed mx-auto max-w-4xl */}

          <div className="w-full max-w-[1400px]">

            {/* ERROR */}

            {error && (
              <div className="mb-6 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-white/10 bg-[#100b1d] p-7"
            >

              {/* TITLE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Task Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#0b0712] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50"
                />
              </div>

              {/* DESCRIPTION */}

              <div className="mt-5">

                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  rows={5}
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#0b0712] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50"
                />

              </div>

              {/* PROJECT + MANAGER */}

              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Project
                  </label>

                  <select
                    value={project}
                    onChange={(e) =>
                      handleProjectChange(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#0b0712] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50"
                  >

                    <option value="">
                      Select Project
                    </option>

                    {projects.map((item) => (
                      <option
                        key={item._id}
                        value={item._id}
                      >
                        {item.name}
                      </option>
                    ))}

                  </select>

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Project Manager
                  </label>

                  <select
                    value={projectManager}
                    onChange={(e) => {
                      setProjectManager(
                        e.target.value
                      );

                      setAssignedEmployee("");
                    }}
                    className="w-full rounded-xl border border-white/10 bg-[#0b0712] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50"
                  >

                    <option value="">
                      Select Project Manager
                    </option>

                    {managers
                      .filter(
                        (manager) =>
                          manager.status ===
                          "active"
                      )
                      .map((manager) => (
                        <option
                          key={manager._id}
                          value={manager._id}
                        >
                          {manager.name}
                        </option>
                      ))}

                  </select>

                </div>

              </div>

              {/* EMPLOYEE + DATE */}

              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Assigned Employee
                  </label>

                  <select
                    value={assignedEmployee}
                    onChange={(e) =>
                      setAssignedEmployee(
                        e.target.value
                      )
                    }
                    disabled={!projectManager}
                    className="w-full rounded-xl border border-white/10 bg-[#0b0712] px-4 py-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-50 focus:border-violet-500/50"
                  >

                    <option value="">
                      {projectManager
                        ? "Not assigned"
                        : "Select Project Manager First"}
                    </option>

                    {availableEmployees.map(
                      (employee) => (
                        <option
                          key={employee._id}
                          value={employee._id}
                        >
                          {employee.name}
                        </option>
                      )
                    )}

                  </select>

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Due Date
                  </label>

                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) =>
                      setDueDate(e.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#0b0712] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50"
                  />

                </div>

              </div>

              {/* PRIORITY + STATUS */}

              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Priority
                  </label>

                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(
                        e.target.value as
                          | "low"
                          | "medium"
                          | "high"
                          | "critical"
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#0b0712] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50"
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
                    Status
                  </label>

                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value as
                          | "todo"
                          | "in_progress"
                          | "review"
                          | "completed"
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#0b0712] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50"
                  >

                    <option value="todo">
                      To Do
                    </option>

                    <option value="in_progress">
                      In Progress
                    </option>

                    <option value="review">
                      Review
                    </option>

                    <option value="completed">
                      Completed
                    </option>

                  </select>

                </div>

              </div>

              {/* ACTIONS */}

              <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">

                <button
                  type="button"
                  onClick={() =>
                    (window.location.href =
                      "/dashboard/admin/tasks")
                  }
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-gray-400 transition hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </button>

                <div className="flex gap-3">

                  {assignMode && (
                    <>

                      <button
                        type="button"
                        disabled={assigning}
                        onClick={
                          handleAssignManager
                        }
                        className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-5 py-3 text-sm font-semibold text-violet-400 transition hover:bg-violet-500/20 disabled:opacity-50"
                      >
                        {assigning
                          ? "Saving..."
                          : "Assign Manager"}
                      </button>

                      <button
                        type="button"
                        disabled={assigning}
                        onClick={
                          handleAssignEmployee
                        }
                        className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500 disabled:opacity-50"
                      >
                        {assigning
                          ? "Saving..."
                          : "Assign Employee"}
                      </button>

                    </>
                  )}

                  {!assignMode && (
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving
                        ? "Saving..."
                        : "Save Changes"}
                    </button>
                  )}

                </div>

              </div>

            </form>

          </div>

        </div>

      </main>

    </div>
  );
}