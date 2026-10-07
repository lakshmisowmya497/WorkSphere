"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Download,
  FileBarChart,
  FolderKanban,
  Loader2,
  PieChart,
  RefreshCw,
  Search,
  TrendingUp,
  UserCog,
  Users,
  UsersRound,
  XCircle,
  Clock3,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

// ======================================================
// TYPES
// ======================================================

type AnyRecord = Record<string, any>;

type ReportFilters = {
  reportType: string;
  department: string;
  project: string;
  status: string;
};

type LeaveRequest = {
  _id: string;
  requester?: AnyRecord | null;
  employee?: AnyRecord | null;
  projectManager?: AnyRecord | null;
  approvalLevel?: string;
  leaveType?: string;
  fromDate?: string;
  toDate?: string;
  reason?: string;
  status?: string;
  createdAt?: string;
};

type Employee = {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
  department?: string;
  jobTitle?: string;
  status?: string;
  createdAt?: string;
};

type Project = {
  _id: string;
  name?: string;
  description?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  projectManager?: AnyRecord | null;
  createdAt?: string;
};

type Task = {
  _id: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  createdAt?: string;
  project?: AnyRecord | null;
  assignedEmployee?: AnyRecord | null;
  projectManager?: AnyRecord | null;
  submission?: {
    submitted?: boolean;
    submittedAt?: string | null;
    reviewedAt?: string | null;
  };
};

type AttendanceRecord = {
  _id?: string;
  employee?: AnyRecord | null;
  date?: string;
  status?: string;
  checkIn?: string;
  checkOut?: string;
  createdAt?: string;
};

// ======================================================
// HELPERS
// ======================================================

function getToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

function normalizeArray(data: AnyRecord, keys: string[]) {
  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  if (Array.isArray(data)) {
    return data;
  }

  return [];
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name?: string) {
  if (!name) return "WS";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getProjectName(task: Task) {
  if (!task.project) return "Unassigned";

  if (typeof task.project === "string") {
    return task.project;
  }

  return task.project.name || "Unassigned";
}

function getRequester(leave: LeaveRequest) {
  return (
    leave.requester ||
    leave.employee ||
    leave.projectManager ||
    null
  );
}

function getRequesterName(leave: LeaveRequest) {
  return getRequester(leave)?.name || "Unknown User";
}

function getRequesterRole(leave: LeaveRequest) {
  const requester = getRequester(leave);

  if (
    requester?.role === "project_manager" ||
    leave.approvalLevel === "admin"
  ) {
    return "Project Manager";
  }

  if (
    requester?.role === "employee" ||
    leave.employee
  ) {
    return "Employee";
  }

  return "User";
}

function getStatusLabel(status?: string) {
  if (!status) return "Unknown";

  const labels: Record<string, string> = {
    planning: "Planning",
    planned: "Planning",
    active: "Active",
    in_progress: "In Progress",
    "in-progress": "In Progress",
    todo: "To Do",
    pending: "Pending",
    review: "Under Review",
    completed: "Completed",
    on_hold: "On Hold",
    "on-hold": "On Hold",
    rejected: "Rejected",
    approved: "Approved",
    cancelled: "Cancelled",
    inactive: "Inactive",
  };

  return (
    labels[status.toLowerCase()] ||
    status.replaceAll("_", " ")
  );
}

function statusClass(status?: string) {
  switch (status) {
    case "completed":
    case "approved":
    case "active":
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";

    case "review":
    case "pending":
    case "planning":
    case "todo":
      return "text-amber-400 bg-amber-500/10 border-amber-500/20";

    case "rejected":
    case "cancelled":
    case "on_hold":
    case "on-hold":
      return "text-red-400 bg-red-500/10 border-red-500/20";

    case "in_progress":
    case "in-progress":
      return "text-violet-300 bg-violet-500/10 border-violet-500/20";

    default:
      return "text-slate-400 bg-white/5 border-white/10";
  }
}

// ======================================================
// PAGE
// ======================================================

export default function AdminReportsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState<ReportFilters>({
    reportType: "overview",
    department: "all",
    project: "all",
    status: "all",
  });

  const [search, setSearch] = useState("");

  // ======================================================
  // FETCH
  // ======================================================

  const fetchReportData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = getToken();

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const endpoints = [
        `${API_BASE}/admin/employees`,
        `${API_BASE}/admin/projects`,
        `${API_BASE}/admin/tasks`,
        `${API_BASE}/leaves/all`,
        `${API_BASE}/admin/attendance`,
      ];

      const results = await Promise.allSettled(
        endpoints.map((url) =>
          fetch(url, {
            headers,
          }).then(async (response) => {
            const data = await response.json();

            if (!response.ok) {
              throw new Error(
                data.message || `Failed to fetch ${url}`
              );
            }

            return data;
          })
        )
      );

      const [
        employeeResult,
        projectResult,
        taskResult,
        leaveResult,
        attendanceResult,
      ] = results;

      if (employeeResult.status === "fulfilled") {
        setEmployees(
          normalizeArray(employeeResult.value, [
            "employees",
            "users",
            "data",
          ])
        );
      }

      if (projectResult.status === "fulfilled") {
        setProjects(
          normalizeArray(projectResult.value, [
            "projects",
            "data",
          ])
        );
      }

      if (taskResult.status === "fulfilled") {
        setTasks(
          normalizeArray(taskResult.value, [
            "tasks",
            "data",
          ])
        );
      }

      if (leaveResult.status === "fulfilled") {
        setLeaves(
          normalizeArray(leaveResult.value, [
            "leaveRequests",
            "requests",
            "leaves",
            "data",
          ])
        );
      }

      if (attendanceResult.status === "fulfilled") {
        setAttendance(
          normalizeArray(attendanceResult.value, [
            "attendance",
            "records",
            "data",
          ])
        );
      }

      const failedRequests = results.filter(
        (result) => result.status === "rejected"
      ).length;

      if (failedRequests >= 5) {
        setError(
          "Unable to load report data. Please make sure the backend is running."
        );
      }
    } catch (err: any) {
      console.error("Reports error:", err);

      setError(
        err?.message ||
          "Failed to load report data"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  // ======================================================
  // FILTER OPTIONS
  // ======================================================

  const departments = useMemo(() => {
    const values = employees
      .map((employee) => employee.department)
      .filter(Boolean) as string[];

    return Array.from(new Set(values)).sort();
  }, [employees]);

  const projectOptions = useMemo(() => {
    return projects
      .map((project) => ({
        id: project._id,
        name: project.name || "Unnamed Project",
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name)
      );
  }, [projects]);

  // ======================================================
  // FILTERED DATA
  // ======================================================

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesDepartment =
        filters.department === "all" ||
        employee.department === filters.department;

      const searchText = `
        ${employee.name || ""}
        ${employee.email || ""}
        ${employee.department || ""}
        ${employee.jobTitle || ""}
      `.toLowerCase();

      const matchesSearch =
        !search ||
        searchText.includes(search.toLowerCase());

      const matchesStatus =
        filters.status === "all" ||
        employee.status === filters.status;

      return (
        matchesDepartment &&
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    employees,
    filters.department,
    filters.status,
    search,
  ]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const managerName =
        typeof project.projectManager === "object"
          ? project.projectManager?.name || ""
          : "";

      const searchText = `
        ${project.name || ""}
        ${project.description || ""}
        ${managerName}
      `.toLowerCase();

      const matchesSearch =
        !search ||
        searchText.includes(search.toLowerCase());

      const matchesProject =
        filters.project === "all" ||
        project._id === filters.project;

      const matchesStatus =
        filters.status === "all" ||
        project.status === filters.status;

      return (
        matchesSearch &&
        matchesProject &&
        matchesStatus
      );
    });
  }, [
    projects,
    filters.project,
    filters.status,
    search,
  ]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const employeeName =
        typeof task.assignedEmployee === "object"
          ? task.assignedEmployee?.name || ""
          : "";

      const searchText = `
        ${task.title || ""}
        ${task.description || ""}
        ${getProjectName(task)}
        ${employeeName}
      `.toLowerCase();

      const matchesSearch =
        !search ||
        searchText.includes(search.toLowerCase());

      const matchesProject =
        filters.project === "all" ||
        (typeof task.project === "object" &&
          task.project?._id === filters.project);

      const matchesStatus =
        filters.status === "all" ||
        task.status === filters.status;

      return (
        matchesSearch &&
        matchesProject &&
        matchesStatus
      );
    });
  }, [
    tasks,
    filters.project,
    filters.status,
    search,
  ]);

  // ======================================================
  // KPI DATA
  // ======================================================

  const totalEmployees = filteredEmployees.length;

  const activeEmployees = filteredEmployees.filter(
    (employee) =>
      !employee.status ||
      employee.status === "active"
  ).length;

  const totalProjects = filteredProjects.length;

  const completedProjects =
    filteredProjects.filter(
      (project) =>
        project.status === "completed"
    ).length;

  const pendingTasks = filteredTasks.filter(
    (task) =>
      task.status !== "completed"
  ).length;

  const totalLeaves = leaves.length;

  const pendingLeaves = leaves.filter(
    (leave) => leave.status === "pending"
  ).length;

  // ======================================================
  // PROJECT STATUS
  // ======================================================

  const projectStatusData = useMemo(() => {
    const completed = filteredProjects.filter(
      (project) =>
        project.status === "completed"
    ).length;

    const active = filteredProjects.filter(
      (project) =>
        project.status === "active"
    ).length;

    const planning = filteredProjects.filter(
      (project) =>
        project.status === "planning" ||
        project.status === "planned"
    ).length;

    const onHold = filteredProjects.filter(
      (project) =>
        project.status === "on_hold" ||
        project.status === "on-hold"
    ).length;

    return [
      {
        label: "Completed",
        value: completed,
        className: "bg-emerald-400",
      },
      {
        label: "Active",
        value: active,
        className: "bg-violet-500",
      },
      {
        label: "Planning",
        value: planning,
        className: "bg-blue-400",
      },
      {
        label: "On Hold",
        value: onHold,
        className: "bg-amber-400",
      },
    ];
  }, [filteredProjects]);

  const projectTotal = projectStatusData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  // ======================================================
  // TASK STATUS
  // ======================================================

  const taskStatusData = useMemo(() => {
    return [
      {
        label: "Completed",
        value: filteredTasks.filter(
          (task) => task.status === "completed"
        ).length,
        className: "bg-emerald-400",
      },
      {
        label: "Under Review",
        value: filteredTasks.filter(
          (task) => task.status === "review"
        ).length,
        className: "bg-amber-400",
      },
      {
        label: "In Progress",
        value: filteredTasks.filter(
          (task) =>
            task.status === "in_progress" ||
            task.status === "in-progress"
        ).length,
        className: "bg-violet-500",
      },
      {
        label: "To Do",
        value: filteredTasks.filter(
          (task) => task.status === "todo"
        ).length,
        className: "bg-blue-400",
      },
    ];
  }, [filteredTasks]);

  const taskTotal = taskStatusData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  // ======================================================
  // LEAVE STATUS
  // ======================================================

  const leaveStatusData = useMemo(() => {
    return [
      {
        label: "Approved",
        value: leaves.filter(
          (leave) => leave.status === "approved"
        ).length,
        className: "bg-emerald-400",
      },
      {
        label: "Pending",
        value: leaves.filter(
          (leave) => leave.status === "pending"
        ).length,
        className: "bg-amber-400",
      },
      {
        label: "Rejected",
        value: leaves.filter(
          (leave) => leave.status === "rejected"
        ).length,
        className: "bg-red-400",
      },
    ];
  }, [leaves]);

  // ======================================================
  // DEPARTMENT DATA
  // ======================================================

  const departmentData = useMemo(() => {
    const map: Record<string, number> = {};

    filteredEmployees.forEach((employee) => {
      const department =
        employee.department || "Unassigned";

      map[department] =
        (map[department] || 0) + 1;
    });

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [filteredEmployees]);

  // ======================================================
  // RECENT ACTIVITY
  // ======================================================

  const recentActivities = useMemo(() => {
    const activities: {
      title: string;
      detail: string;
      date: string;
      icon: any;
    }[] = [];

    projects.forEach((project) => {
      activities.push({
        title: "Project created",
        detail:
          project.name || "Unnamed Project",
        date:
          project.createdAt ||
          project.startDate ||
          "",
        icon: FolderKanban,
      });
    });

    employees.forEach((employee) => {
      activities.push({
        title: "Employee added",
        detail:
          employee.name || "Unknown Employee",
        date: employee.createdAt || "",
        icon: UsersRound,
      });
    });

    tasks.forEach((task) => {
      if (task.submission?.submitted) {
        activities.push({
          title: "Task submitted for review",
          detail:
            task.title || "Unnamed Task",
          date:
            task.submission.submittedAt ||
            task.createdAt ||
            "",
          icon: ClipboardList,
        });
      }
    });

    leaves.forEach((leave) => {
      activities.push({
        title:
          leave.status === "approved"
            ? "Leave request approved"
            : leave.status === "rejected"
            ? "Leave request rejected"
            : "Leave request submitted",
        detail: `${getRequesterName(leave)} • ${getStatusLabel(
          leave.status
        )}`,
        date:
          leave.createdAt ||
          leave.fromDate ||
          "",
        icon: CalendarDays,
      });
    });

    return activities
      .filter((activity) => activity.date)
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      )
      .slice(0, 7);
  }, [projects, employees, tasks, leaves]);

  // ======================================================
  // EXPORT CSV
  // ======================================================

  const exportReport = () => {
    const rows = [
      [
        "WorkSphere Admin Report",
        "",
        "",
        "",
      ],
      [
        "Generated",
        new Date().toLocaleString("en-IN"),
        "",
        "",
      ],
      [],
      [
        "Metric",
        "Value",
        "",
        "",
      ],
      [
        "Total Employees",
        totalEmployees,
        "",
        "",
      ],
      [
        "Active Employees",
        activeEmployees,
        "",
        "",
      ],
      [
        "Total Projects",
        totalProjects,
        "",
        "",
      ],
      [
        "Completed Projects",
        completedProjects,
        "",
        "",
      ],
      [
        "Pending Tasks",
        pendingTasks,
        "",
        "",
      ],
      [
        "Total Leave Requests",
        totalLeaves,
        "",
        "",
      ],
      [
        "Pending Leave Requests",
        pendingLeaves,
        "",
        "",
      ],
      [],
      [
        "PROJECTS",
        "",
        "",
        "",
      ],
      [
        "Project",
        "Status",
        "Start Date",
        "End Date",
      ],
      ...filteredProjects.map((project) => [
        project.name || "",
        getStatusLabel(project.status),
        formatDate(project.startDate),
        formatDate(project.endDate),
      ]),
      [],
      [
        "TASKS",
        "",
        "",
        "",
      ],
      [
        "Task",
        "Project",
        "Status",
        "Due Date",
      ],
      ...filteredTasks.map((task) => [
        task.title || "",
        getProjectName(task),
        getStatusLabel(task.status),
        formatDate(task.dueDate),
      ]),
      [],
      [
        "LEAVE REQUESTS",
        "",
        "",
        "",
      ],
      [
        "Requester",
        "Role",
        "Leave Type",
        "Status",
      ],
      ...leaves.map((leave) => [
        getRequesterName(leave),
        getRequesterRole(leave),
        leave.leaveType || "",
        getStatusLabel(leave.status),
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => {
            const value = String(cell ?? "");
            return `"${value.replaceAll('"', '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `worksphere-admin-report-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ======================================================
  // DONUT
  // ======================================================

  const getDonutBackground = (
    items: { value: number; className: string }[]
  ) => {
    if (!items.length) {
      return "conic-gradient(#27272a 0deg 360deg)";
    }

    const total = items.reduce(
      (sum, item) => sum + item.value,
      0
    );

    if (total === 0) {
      return "conic-gradient(#27272a 0deg 360deg)";
    }

    // Use violet/green/blue/amber values.
    const colors = [
      "#34d399",
      "#8b5cf6",
      "#60a5fa",
      "#fbbf24",
      "#f87171",
    ];

    let current = 0;

    const parts = items.map((item, index) => {
      const degrees =
        (item.value / total) * 360;

      const start = current;

      current += degrees;

      return `${colors[index % colors.length]} ${start}deg ${current}deg`;
    });

    return `conic-gradient(${parts.join(", ")})`;
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080d] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600/15">
              <Loader2 className="h-7 w-7 animate-spin text-violet-400" />
            </div>

            <div className="text-sm text-slate-400">
              Loading WorkSphere reports...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="min-h-screen bg-[#08080d] text-white">
      <main className="min-h-screen px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-[1600px]">
          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-violet-400">
                <FileBarChart className="h-4 w-4" />
                Analytics & Insights
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Reports
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                View organization-wide insights across employees,
                projects, tasks and leave management.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => fetchReportData(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>

              <button
                onClick={exportReport}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-500"
              >
                <Download className="h-4 w-4" />
                Export Report
              </button>
            </div>
          </div>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* ==================================================
              SEARCH + FILTERS
          ================================================== */}

          <section className="mb-7 rounded-2xl border border-white/10 bg-[#101017] p-4 shadow-xl shadow-black/10">
            <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search employees, projects, tasks..."
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/50"
                />
              </div>

              <select
                value={filters.reportType}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    reportType: event.target.value,
                  }))
                }
                className="h-11 rounded-xl border border-white/10 bg-[#0b0b11] px-3 text-sm text-slate-200 outline-none focus:border-violet-500/50"
              >
                <option value="overview">
                  Overview Report
                </option>
                <option value="employees">
                  Employee Report
                </option>
                <option value="projects">
                  Project Report
                </option>
                <option value="tasks">
                  Task Report
                </option>
                <option value="leaves">
                  Leave Report
                </option>
              </select>

              <select
                value={filters.department}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    department: event.target.value,
                  }))
                }
                className="h-11 rounded-xl border border-white/10 bg-[#0b0b11] px-3 text-sm text-slate-200 outline-none focus:border-violet-500/50"
              >
                <option value="all">
                  All Departments
                </option>

                {departments.map((department) => (
                  <option
                    key={department}
                    value={department}
                  >
                    {department}
                  </option>
                ))}
              </select>

              <select
                value={filters.project}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    project: event.target.value,
                  }))
                }
                className="h-11 rounded-xl border border-white/10 bg-[#0b0b11] px-3 text-sm text-slate-200 outline-none focus:border-violet-500/50"
              >
                <option value="all">
                  All Projects
                </option>

                {projectOptions.map((project) => (
                  <option
                    key={project.id}
                    value={project.id}
                  >
                    {project.name}
                  </option>
                ))}
              </select>

              <select
                value={filters.status}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: event.target.value,
                  }))
                }
                className="h-11 rounded-xl border border-white/10 bg-[#0b0b11] px-3 text-sm text-slate-200 outline-none focus:border-violet-500/50"
              >
                <option value="all">
                  All Status
                </option>
                <option value="active">
                  Active
                </option>
                <option value="planning">
                  Planning
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
                <option value="pending">
                  Pending
                </option>
                <option value="approved">
                  Approved
                </option>
                <option value="rejected">
                  Rejected
                </option>
              </select>
            </div>
          </section>

          {/* ==================================================
              KPI CARDS
          ================================================== */}

          <section className="mb-7 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <MetricCard
              title="Total Employees"
              value={totalEmployees}
              subtitle="Organization employees"
              icon={Users}
              iconClass="bg-violet-500/10 text-violet-400"
            />

            <MetricCard
              title="Active Employees"
              value={activeEmployees}
              subtitle="Currently active"
              icon={UserCog}
              iconClass="bg-emerald-500/10 text-emerald-400"
            />

            <MetricCard
              title="Total Projects"
              value={totalProjects}
              subtitle="All organization projects"
              icon={FolderKanban}
              iconClass="bg-blue-500/10 text-blue-400"
            />

            <MetricCard
              title="Completed Projects"
              value={completedProjects}
              subtitle="Successfully completed"
              icon={CheckCircle2}
              iconClass="bg-emerald-500/10 text-emerald-400"
            />

            <MetricCard
              title="Pending Tasks"
              value={pendingTasks}
              subtitle="Not completed yet"
              icon={ClipboardList}
              iconClass="bg-amber-500/10 text-amber-400"
            />

            <MetricCard
              title="Leave Requests"
              value={totalLeaves}
              subtitle={`${pendingLeaves} pending approval`}
              icon={CalendarDays}
              iconClass="bg-pink-500/10 text-pink-400"
            />
          </section>

          {/* ==================================================
              MAIN CHARTS
          ================================================== */}

          <section className="mb-7 grid gap-5 xl:grid-cols-3">
            {/* PROJECT STATUS */}

            <ChartCard
              title="Project Status Distribution"
              subtitle="Current organization projects"
              icon={FolderKanban}
            >
              <div className="flex items-center justify-center gap-8 py-5">
                <div className="relative flex h-40 w-40 shrink-0 items-center justify-center rounded-full">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        getDonutBackground(
                          projectStatusData
                        ),
                    }}
                  />

                  <div className="relative flex h-24 w-24 flex-col items-center justify-center rounded-full bg-[#101017]">
                    <span className="text-2xl font-bold">
                      {projectTotal}
                    </span>

                    <span className="text-[10px] uppercase tracking-wider text-slate-500">
                      Projects
                    </span>
                  </div>
                </div>

                <div className="min-w-0 space-y-3">
                  {projectStatusData.map(
                    (item, index) => {
                      const percentage =
                        projectTotal > 0
                          ? Math.round(
                              (item.value /
                                projectTotal) *
                                100
                            )
                          : 0;

                      return (
                        <div
                          key={item.label}
                          className="flex items-center justify-between gap-5"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${item.className}`}
                            />

                            <span className="text-xs text-slate-400">
                              {item.label}
                            </span>
                          </div>

                          <span className="text-xs font-semibold text-white">
                            {percentage}%
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </ChartCard>

            {/* TASK STATUS */}

            <ChartCard
              title="Task Progress"
              subtitle="Organization-wide task completion"
              icon={BarChart3}
            >
              <div className="space-y-5 py-3">
                {taskStatusData.map((item) => {
                  const percentage =
                    taskTotal > 0
                      ? Math.round(
                          (item.value / taskTotal) *
                            100
                        )
                      : 0;

                  return (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${item.className}`}
                          />

                          <span className="text-xs text-slate-400">
                            {item.label}
                          </span>
                        </div>

                        <span className="text-xs font-semibold text-white">
                          {item.value}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${item.className}`}
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ChartCard>

            {/* LEAVES */}

            <ChartCard
              title="Leave Requests Status"
              subtitle="Employee and Project Manager leaves"
              icon={CalendarDays}
            >
              <div className="flex items-center justify-center gap-8 py-5">
                <div className="relative flex h-40 w-40 shrink-0 items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        getDonutBackground(
                          leaveStatusData
                        ),
                    }}
                  />

                  <div className="relative flex h-24 w-24 flex-col items-center justify-center rounded-full bg-[#101017]">
                    <span className="text-2xl font-bold">
                      {totalLeaves}
                    </span>

                    <span className="text-[10px] uppercase tracking-wider text-slate-500">
                      Requests
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {leaveStatusData.map((item) => {
                    const percentage =
                      totalLeaves > 0
                        ? Math.round(
                            (item.value /
                              totalLeaves) *
                              100
                          )
                        : 0;

                    return (
                      <div
                        key={item.label}
                        className="flex items-center justify-between gap-6"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${item.className}`}
                          />

                          <span className="text-xs text-slate-400">
                            {item.label}
                          </span>
                        </div>

                        <span className="text-xs font-semibold text-white">
                          {percentage}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ChartCard>
          </section>

          {/* ==================================================
              SECOND ROW
          ================================================== */}

          <section className="mb-7 grid gap-5 xl:grid-cols-2">
            {/* DEPARTMENT DISTRIBUTION */}

            <ChartCard
              title="Employees by Department"
              subtitle="Current employee distribution"
              icon={UsersRound}
            >
              {departmentData.length === 0 ? (
                <EmptyChartState text="No department data available" />
              ) : (
                <div className="space-y-4 py-2">
                  {departmentData.map(
                    ([department, count]) => {
                      const max =
                        departmentData[0]?.[1] || 1;

                      const width =
                        (count / Number(max)) * 100;

                      return (
                        <div key={department}>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="max-w-[70%] truncate text-xs text-slate-400">
                              {department}
                            </span>

                            <span className="text-xs font-semibold text-white">
                              {count}
                            </span>
                          </div>

                          <div className="h-2 rounded-full bg-white/5">
                            <div
                              className="h-2 rounded-full bg-violet-500"
                              style={{
                                width: `${width}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </ChartCard>

           
          </section>

          {/* ==================================================
              RECENT ACTIVITY + REPORT SUMMARY
          ================================================== */}

          <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
            {/* RECENT ACTIVITY */}

            <div className="rounded-2xl border border-white/10 bg-[#101017] shadow-xl shadow-black/10">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Recent Activity Summary
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Latest organization activity
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  <Activity className="h-4 w-4" />
                </div>
              </div>

              <div className="divide-y divide-white/5">
                {recentActivities.length === 0 ? (
                  <div className="px-5 py-12 text-center text-sm text-slate-500">
                    No recent activity available.
                  </div>
                ) : (
                  recentActivities.map(
                    (activity, index) => {
                      const Icon = activity.icon;

                      return (
                        <div
                          key={`${activity.title}-${index}`}
                          className="flex items-center gap-4 px-5 py-4 transition hover:bg-white/[0.02]"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/10 bg-violet-500/10 text-violet-400">
                            <Icon className="h-4 w-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-200">
                              {activity.title}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {activity.detail}
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-[11px] text-slate-500">
                              {formatDate(
                                activity.date
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    }
                  )
                )}
              </div>
            </div>

            {/* REPORT SUMMARY */}

            <div className="rounded-2xl border border-white/10 bg-[#101017] shadow-xl shadow-black/10">
              <div className="border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                    <FileBarChart className="h-4 w-4" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      Report Summary
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Current organization snapshot
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1 p-4">
                <SummaryRow
                  label="Employee utilization"
                  value={
                    totalEmployees > 0
                      ? `${Math.round(
                          (activeEmployees /
                            totalEmployees) *
                            100
                        )}% active`
                      : "No data"
                  }
                />

                <SummaryRow
                  label="Project completion"
                  value={
                    totalProjects > 0
                      ? `${Math.round(
                          (completedProjects /
                            totalProjects) *
                            100
                        )}% completed`
                      : "No data"
                  }
                />

                <SummaryRow
                  label="Task completion"
                  value={
                    taskTotal > 0
                      ? `${Math.round(
                          (taskStatusData.find(
                            (item) =>
                              item.label ===
                              "Completed"
                          )?.value || 0) /
                            taskTotal *
                            100
                        )}% completed`
                      : "No data"
                  }
                />

                <SummaryRow
                  label="Pending leaves"
                  value={`${pendingLeaves}`}
                />

                <SummaryRow
                  label="Attendance records"
                  value={`${attendance.length}`}
                />
              </div>

              <div className="border-t border-white/10 p-4">
                <button
                  onClick={exportReport}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/20"
                >
                  <Download className="h-4 w-4" />
                  Download CSV Report
                </button>
              </div>
            </div>
          </section>

          {/* ==================================================
              FOOTER INFO
          ================================================== */}

          <div className="mt-7 flex flex-col gap-2 border-t border-white/5 pt-5 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>
              WorkSphere Organization Reports
            </span>

            <span>
              Generated {formatDate(new Date().toISOString())}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

// ======================================================
// COMPONENTS
// ======================================================

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: any;
  iconClass: string;
}) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-[#101017] p-5 transition hover:border-violet-500/20 hover:bg-[#11111a]">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-white">
            {formatNumber(value)}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="text-[11px] text-slate-600">
        {subtitle}
      </p>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#101017] p-5 shadow-xl shadow-black/10">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">
            {title}
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {subtitle}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-400">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      {children}
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: number;
  icon: any;
  className: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/20 p-3">
      <div
        className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${className}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <p className="text-lg font-bold text-white">
        {formatNumber(value)}
      </p>

      <p className="mt-1 text-[11px] text-slate-500">
        {label}
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl px-3 py-3 transition hover:bg-white/[0.03]">
      <span className="text-xs text-slate-400">
        {label}
      </span>

      <span className="text-xs font-semibold text-white">
        {value}
      </span>
    </div>
  );
}

function EmptyChartState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex h-40 items-center justify-center text-xs text-slate-600">
      {text}
    </div>
  );
}