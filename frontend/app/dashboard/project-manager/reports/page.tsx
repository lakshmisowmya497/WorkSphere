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
  RefreshCw,
  Search,
  TrendingUp,
  UserCheck,
  Users,
  Clock3,
  XCircle,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

// ======================================================
// TYPES
// ======================================================

interface Person {
  _id: string;
  name?: string;
  email?: string;
  department?: string;
  jobTitle?: string;
  role?: string;
  status?: string;
}

interface Project {
  _id: string;
  name?: string;
  description?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  projectManager?: Person | string | null;
  createdAt?: string;
}

interface TaskSubmission {
  submitted?: boolean;
  evidenceImage?: string;
  completionComment?: string;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: Person | string | null;
  reviewComment?: string;
  rejectionReason?: string;
}

interface Task {
  _id: string;
  title?: string;
  description?: string;
  project?: Project | null;
  projectManager?: Person | null;
  assignedEmployee?: Person | null;
  priority?: string;
  status?: string;
  dueDate?: string;
  createdAt?: string;
  submission?: TaskSubmission;
}

interface LeaveRequest {
  _id: string;
  requester?: Person | null;
  employee?: Person | null;
  projectManager?: Person | null;
  approvalLevel?: string;
  leaveType?: string;
  fromDate?: string;
  toDate?: string;
  reason?: string;
  status?: string;
  managerComment?: string;
  adminComment?: string;
  createdAt?: string;
}

interface AttendanceRecord {
  _id?: string;
  employee?: Person | null;
  date?: string;
  status?: string;
  checkIn?: string;
  checkOut?: string;
}

interface DashboardData {
  teamMembers?: Person[];
  activeProjects?: Project[];
  pendingTasks?: Task[];
  pendingLeaves?: number;
  team?: {
    totalMembers?: number;
  };
  projects?: {
    total?: number;
    active?: number;
  };
  tasks?: {
    total?: number;
    pending?: number;
  };
  leaves?: {
    pending?: number;
  };
}

// ======================================================
// HELPERS
// ======================================================

function getToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusLabel(status?: string) {
  if (!status) return "Unknown";

  const labels: Record<string, string> = {
    todo: "To Do",
    in_progress: "In Progress",
    "in-progress": "In Progress",
    review: "Under Review",
    completed: "Completed",
    planning: "Planning",
    planned: "Planning",
    active: "Active",
    on_hold: "On Hold",
    "on-hold": "On Hold",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    cancelled: "Cancelled",
    inactive: "Inactive",
  };

  return (
    labels[status.toLowerCase()] ||
    status.replaceAll("_", " ")
  );
}

function getProjectName(task: Task) {
  if (!task.project) {
    return "Unassigned";
  }

  if (typeof task.project === "string") {
    return task.project;
  }

  return task.project.name || "Unassigned";
}

function getPersonName(person?: Person | string | null) {
  if (!person) return "Unknown";

  if (typeof person === "string") {
    return person;
  }

  return person.name || "Unknown";
}

function getLeaveRequester(
  leave: LeaveRequest
) {
  return (
    leave.requester ||
    leave.employee ||
    leave.projectManager ||
    null
  );
}

function getStatusClass(status?: string) {
  switch (status) {
    case "completed":
    case "approved":
    case "active":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";

    case "review":
    case "pending":
    case "planning":
    case "todo":
      return "border-amber-500/20 bg-amber-500/10 text-amber-400";

    case "rejected":
    case "cancelled":
    case "on_hold":
    case "on-hold":
      return "border-red-500/20 bg-red-500/10 text-red-400";

    case "in_progress":
    case "in-progress":
      return "border-violet-500/20 bg-violet-500/10 text-violet-300";

    default:
      return "border-white/10 bg-white/5 text-slate-400";
  }
}

// ======================================================
// PAGE
// ======================================================

export default function ProjectManagerReportsPage() {
  const [profile, setProfile] =
    useState<Person | null>(null);

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [teamMembers, setTeamMembers] =
    useState<Person[]>([]);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [leaves, setLeaves] =
    useState<LeaveRequest[]>([]);

  const [attendance, setAttendance] =
    useState<AttendanceRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [projectFilter, setProjectFilter] =
    useState("all");

  // ======================================================
  // SAFE RESPONSE
  // ======================================================

  const readResponse = async (
    response: Response
  ) => {
    const text = await response.text();

    try {
      return JSON.parse(text);
    } catch {
      console.error(
        "Backend returned non-JSON:",
        text.substring(0, 300)
      );

      throw new Error(
        `Backend returned ${response.status}. Check the API route.`
      );
    }
  };

  // ======================================================
  // FETCH
  // ======================================================

  const fetchReports = async (
    isRefresh = false
  ) => {
    try {
      if (isRefresh) {
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

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [
        profileResponse,
        dashboardResponse,
        teamResponse,
        projectsResponse,
        tasksResponse,
        leavesResponse,
      ] = await Promise.allSettled([
        fetch(
          `${API_BASE}/project-managers/me`,
          {
            headers,
            cache: "no-store",
          }
        ),
        fetch(
          `${API_BASE}/project-managers/dashboard`,
          {
            headers,
            cache: "no-store",
          }
        ),
        fetch(
          `${API_BASE}/project-managers/team`,
          {
            headers,
            cache: "no-store",
          }
        ),
        fetch(
          `${API_BASE}/project-managers/projects`,
          {
            headers,
            cache: "no-store",
          }
        ),
        fetch(
          `${API_BASE}/admin/tasks`,
          {
            headers,
            cache: "no-store",
          }
        ),
        fetch(
          `${API_BASE}/project-manager/leaves/team`,
          {
            headers,
            cache: "no-store",
          }
        ),
      ]);

      // ==================================================
      // PROFILE
      // ==================================================

      if (
        profileResponse.status ===
        "fulfilled"
      ) {
        const data =
          await readResponse(
            profileResponse.value
          );

        if (
          profileResponse.value.ok
        ) {
          setProfile(
            data.projectManager ||
              data.profile ||
              data.user ||
              data
          );
        }
      }

      // ==================================================
      // DASHBOARD
      // ==================================================

      if (
        dashboardResponse.status ===
        "fulfilled"
      ) {
        const data =
          await readResponse(
            dashboardResponse.value
          );

        if (
          dashboardResponse.value.ok
        ) {
          setDashboard(
            data.dashboard ||
              data.data ||
              data
          );
        }
      }

      // ==================================================
      // TEAM
      // ==================================================

      if (
        teamResponse.status ===
        "fulfilled"
      ) {
        const data =
          await readResponse(
            teamResponse.value
          );

        if (teamResponse.value.ok) {
          setTeamMembers(
            data.team ||
              data.teamMembers ||
              data.employees ||
              data.data ||
              []
          );
        }
      }

      // ==================================================
      // PROJECTS
      // ==================================================

      if (
        projectsResponse.status ===
        "fulfilled"
      ) {
        const data =
          await readResponse(
            projectsResponse.value
          );

        if (
          projectsResponse.value.ok
        ) {
          setProjects(
            data.projects ||
              data.data ||
              []
          );
        }
      }

      // ==================================================
      // TASKS
      // ==================================================

      if (
        tasksResponse.status ===
        "fulfilled"
      ) {
        const data =
          await readResponse(
            tasksResponse.value
          );

        if (tasksResponse.value.ok) {
          const allTasks =
            data.tasks ||
            data.data ||
            [];

          const managerId =
            profile?._id;

          if (managerId) {
            setTasks(
              allTasks.filter(
                (task: Task) =>
                  task.projectManager?._id ===
                  managerId
              )
            );
          } else {
            setTasks(allTasks);
          }
        }
      }

      // ==================================================
      // LEAVES
      // ==================================================

      if (
        leavesResponse.status ===
        "fulfilled"
      ) {
        const data =
          await readResponse(
            leavesResponse.value
          );

        if (
          leavesResponse.value.ok
        ) {
          setLeaves(
            data.leaves ||
              data.requests ||
              data.data ||
              []
          );
        }
      }

      // ==================================================
      // ATTENDANCE
      //
      // Attendance is optional because the current
      // PM backend dashboard already exposes team data.
      // ==================================================

      try {
        const attendanceResponse =
          await fetch(
            `${API_BASE}/attendance/team`,
            {
              headers,
              cache: "no-store",
            }
          );

        if (attendanceResponse.ok) {
          const data =
            await readResponse(
              attendanceResponse
            );

          setAttendance(
            data.attendance ||
              data.records ||
              data.data ||
              []
          );
        }
      } catch {
        setAttendance([]);
      }
    } catch (err) {
      console.error(
        "Project Manager reports error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load reports."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // ======================================================
  // FILTERED DATA
  // ======================================================

  const filteredProjects =
    useMemo(() => {
      return projects.filter(
        (project) => {
          const searchText = `
            ${project.name || ""}
            ${project.description || ""}
          `.toLowerCase();

          const matchesSearch =
            !search ||
            searchText.includes(
              search.toLowerCase()
            );

          const matchesStatus =
            statusFilter === "all" ||
            project.status ===
              statusFilter;

          const matchesProject =
            projectFilter === "all" ||
            project._id === projectFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesProject
          );
        }
      );
    }, [
      projects,
      search,
      statusFilter,
      projectFilter,
    ]);

  const filteredTasks =
    useMemo(() => {
      return tasks.filter((task) => {
        const searchText = `
          ${task.title || ""}
          ${task.description || ""}
          ${getProjectName(task)}
          ${getPersonName(
            task.assignedEmployee
          )}
        `.toLowerCase();

        const matchesSearch =
          !search ||
          searchText.includes(
            search.toLowerCase()
          );

        const matchesStatus =
          statusFilter === "all" ||
          task.status === statusFilter;

        const matchesProject =
          projectFilter === "all" ||
          (typeof task.project ===
            "object" &&
            task.project?._id ===
              projectFilter);

        return (
          matchesSearch &&
          matchesStatus &&
          matchesProject
        );
      });
    }, [
      tasks,
      search,
      statusFilter,
      projectFilter,
    ]);

  // ======================================================
  // KPIs
  // ======================================================

  const totalTeamMembers =
    teamMembers.length ||
    dashboard?.team?.totalMembers ||
    0;

  const activeTeamMembers =
    teamMembers.filter(
      (member) =>
        !member.status ||
        member.status === "active"
    ).length;

  const activeProjects =
    projects.filter(
      (project) =>
        project.status === "active"
    ).length;

  const completedProjects =
    projects.filter(
      (project) =>
        project.status === "completed"
    ).length;

  const totalTasks =
    filteredTasks.length;

  const completedTasks =
    filteredTasks.filter(
      (task) =>
        task.status === "completed"
    ).length;

  const pendingReviews =
    filteredTasks.filter(
      (task) =>
        task.status === "review" &&
        task.submission?.submitted
    ).length;

  const pendingLeaves =
    leaves.filter(
      (leave) =>
        leave.status === "pending"
    ).length;

  // ======================================================
  // TASK STATUS
  // ======================================================

  const taskStatusData = useMemo(() => {
    return [
      {
        label: "Completed",
        value: filteredTasks.filter(
          (task) =>
            task.status === "completed"
        ).length,
        className:
          "bg-emerald-400",
      },
      {
        label: "In Progress",
        value: filteredTasks.filter(
          (task) =>
            task.status ===
              "in_progress" ||
            task.status ===
              "in-progress"
        ).length,
        className:
          "bg-violet-500",
      },
      {
        label: "Under Review",
        value: filteredTasks.filter(
          (task) =>
            task.status === "review"
        ).length,
        className:
          "bg-amber-400",
      },
      {
        label: "To Do",
        value: filteredTasks.filter(
          (task) =>
            task.status === "todo"
        ).length,
        className:
          "bg-blue-400",
      },
    ];
  }, [filteredTasks]);

  const taskTotal =
    taskStatusData.reduce(
      (sum, item) =>
        sum + item.value,
      0
    );

  // ======================================================
  // PROJECT STATUS
  // ======================================================

  const projectStatusData = useMemo(() => {
    return [
      {
        label: "Completed",
        value: filteredProjects.filter(
          (project) =>
            project.status ===
            "completed"
        ).length,
        className:
          "bg-emerald-400",
      },
      {
        label: "Active",
        value: filteredProjects.filter(
          (project) =>
            project.status === "active"
        ).length,
        className:
          "bg-violet-500",
      },
      {
        label: "Planning",
        value: filteredProjects.filter(
          (project) =>
            project.status ===
              "planning" ||
            project.status === "planned"
        ).length,
        className:
          "bg-blue-400",
      },
      {
        label: "On Hold",
        value: filteredProjects.filter(
          (project) =>
            project.status ===
              "on_hold" ||
            project.status ===
              "on-hold"
        ).length,
        className:
          "bg-amber-400",
      },
    ];
  }, [filteredProjects]);

  const projectTotal =
    projectStatusData.reduce(
      (sum, item) =>
        sum + item.value,
      0
    );

  // ======================================================
  // LEAVE STATUS
  // ======================================================

  const leaveStatusData = [
    {
      label: "Approved",
      value: leaves.filter(
        (leave) =>
          leave.status === "approved"
      ).length,
      className:
        "bg-emerald-400",
    },
    {
      label: "Pending",
      value: leaves.filter(
        (leave) =>
          leave.status === "pending"
      ).length,
      className:
        "bg-amber-400",
    },
    {
      label: "Rejected",
      value: leaves.filter(
        (leave) =>
          leave.status === "rejected"
      ).length,
      className:
        "bg-red-400",
    },
  ];

  // ======================================================
  // TEAM DEPARTMENTS
  // ======================================================

  const departmentData =
    useMemo(() => {
      const map: Record<
        string,
        number
      > = {};

      teamMembers.forEach(
        (member) => {
          const department =
            member.department ||
            "Unassigned";

          map[department] =
            (map[department] || 0) +
            1;
        }
      );

      return Object.entries(map)
        .sort(
          (a, b) => b[1] - a[1]
        )
        .slice(0, 6);
    }, [teamMembers]);

  // ======================================================
  // RECENT ACTIVITY
  // ======================================================

  const recentActivity =
    useMemo(() => {
      const activities: {
        title: string;
        detail: string;
        date: string;
        icon: any;
      }[] = [];

      tasks.forEach((task) => {
        if (task.submission?.submitted) {
          activities.push({
            title:
              "Task submitted for review",
            detail:
              task.title ||
              "Unnamed task",
            date:
              task.submission
                .submittedAt ||
              task.createdAt ||
              "",
            icon: ClipboardList,
          });
        }

        if (
          task.status ===
          "completed"
        ) {
          activities.push({
            title:
              "Task completed",
            detail:
              task.title ||
              "Unnamed task",
            date:
              task.submission
                ?.reviewedAt ||
              task.createdAt ||
              "",
            icon: CheckCircle2,
          });
        }
      });

      projects.forEach(
        (project) => {
          activities.push({
            title:
              "Project activity",
            detail:
              `${project.name || "Project"} • ${getStatusLabel(
                project.status
              )}`,
            date:
              project.createdAt ||
              project.startDate ||
              "",
            icon: FolderKanban,
          });
        }
      );

      leaves.forEach((leave) => {
        const requester =
          getLeaveRequester(
            leave
          );

        activities.push({
          title:
            "Leave request",
          detail:
            `${getPersonName(
              requester
            )} • ${getStatusLabel(
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
        .filter(
          (item) => item.date
        )
        .sort(
          (a, b) =>
            new Date(
              b.date
            ).getTime() -
            new Date(
              a.date
            ).getTime()
        )
        .slice(0, 8);
    }, [
      tasks,
      projects,
      leaves,
    ]);

  // ======================================================
  // DONUT BACKGROUND
  // ======================================================

  const getDonutBackground = (
    items: {
      value: number;
    }[]
  ) => {
    const total =
      items.reduce(
        (sum, item) =>
          sum + item.value,
        0
      );

    if (total === 0) {
      return "conic-gradient(#27272a 0deg 360deg)";
    }

    const colors = [
      "#34d399",
      "#8b5cf6",
      "#fbbf24",
      "#60a5fa",
      "#f87171",
    ];

    let current = 0;

    const parts =
      items.map(
        (item, index) => {
          const degrees =
            (item.value /
              total) *
            360;

          const start =
            current;

          current += degrees;

          return `${
            colors[
              index %
                colors.length
            ]
          } ${start}deg ${current}deg`;
        }
      );

    return `conic-gradient(${parts.join(
      ", "
    )})`;
  };

  // ======================================================
  // EXPORT
  // ======================================================

  const exportReport = () => {
    const rows = [
      [
        "WorkSphere Project Manager Report",
      ],
      [
        "Project Manager",
        profile?.name ||
          "Project Manager",
      ],
      [
        "Generated",
        new Date().toLocaleString(
          "en-IN"
        ),
      ],
      [],
      [
        "Metric",
        "Value",
      ],
      [
        "Total Team Members",
        totalTeamMembers,
      ],
      [
        "Active Team Members",
        activeTeamMembers,
      ],
      [
        "Active Projects",
        activeProjects,
      ],
      [
        "Completed Projects",
        completedProjects,
      ],
      [
        "Total Tasks",
        totalTasks,
      ],
      [
        "Completed Tasks",
        completedTasks,
      ],
      [
        "Pending Reviews",
        pendingReviews,
      ],
      [
        "Pending Leave Requests",
        pendingLeaves,
      ],
      [],
      [
        "PROJECTS",
      ],
      [
        "Project",
        "Status",
        "Start Date",
        "End Date",
      ],
      ...filteredProjects.map(
        (project) => [
          project.name ||
            "",
          getStatusLabel(
            project.status
          ),
          formatDate(
            project.startDate
          ),
          formatDate(
            project.endDate
          ),
        ]
      ),
      [],
      [
        "TASKS",
      ],
      [
        "Task",
        "Project",
        "Assigned Employee",
        "Status",
        "Due Date",
      ],
      ...filteredTasks.map(
        (task) => [
          task.title ||
            "",
          getProjectName(
            task
          ),
          getPersonName(
            task.assignedEmployee
          ),
          getStatusLabel(
            task.status
          ),
          formatDate(
            task.dueDate
          ),
        ]
      ),
      [],
      [
        "LEAVE REQUESTS",
      ],
      [
        "Employee",
        "Leave Type",
        "From",
        "To",
        "Status",
      ],
      ...leaves.map(
        (leave) => [
          getPersonName(
            getLeaveRequester(
              leave
            )
          ),
          leave.leaveType ||
            "",
          formatDate(
            leave.fromDate
          ),
          formatDate(
            leave.toDate
          ),
          getStatusLabel(
            leave.status
          ),
        ]
      ),
    ];

    const csv =
      rows
        .map((row) =>
          row
            .map((cell) => {
              const value =
                String(
                  cell ??
                    ""
                );

              return `"${value.replaceAll(
                '"',
                '""'
              )}"`;
            })
            .join(",")
        )
        .join("\n");

    const blob =
      new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `worksphere-pm-report-${new Date()
        .toISOString()
        .slice(
          0,
          10
        )}.csv`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );
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

            <p className="text-sm text-slate-400">
              Loading team reports...
            </p>
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
                Team Analytics
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Reports
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                Analyze your team performance, projects,
                tasks, submissions and leave activity.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() =>
                  fetchReports(true)
                }
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.07] disabled:opacity-50"
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
              FILTERS
          ================================================== */}

          <section className="mb-7 rounded-2xl border border-white/10 bg-[#101017] p-4">
            <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr_1fr]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search team members, projects, tasks..."
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/50"
                />
              </div>

              <select
                value={projectFilter}
                onChange={(event) =>
                  setProjectFilter(
                    event.target.value
                  )
                }
                className="h-11 rounded-xl border border-white/10 bg-[#0b0b11] px-3 text-sm text-slate-200 outline-none focus:border-violet-500/50"
              >
                <option value="all">
                  All Projects
                </option>

                {projects.map(
                  (project) => (
                    <option
                      key={
                        project._id
                      }
                      value={
                        project._id
                      }
                    >
                      {project.name ||
                        "Unnamed Project"}
                    </option>
                  )
                )}
              </select>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="h-11 rounded-xl border border-white/10 bg-[#0b0b11] px-3 text-sm text-slate-200 outline-none focus:border-violet-500/50"
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
                <option value="todo">
                  To Do
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
            </div>
          </section>

          {/* ==================================================
              KPI CARDS
          ================================================== */}

          <section className="mb-7 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <MetricCard
              title="Team Members"
              value={
                totalTeamMembers
              }
              subtitle={`${activeTeamMembers} active`}
              icon={Users}
              iconClass="bg-violet-500/10 text-violet-400"
            />

            <MetricCard
              title="Active Members"
              value={
                activeTeamMembers
              }
              subtitle="Currently active"
              icon={UserCheck}
              iconClass="bg-emerald-500/10 text-emerald-400"
            />

            <MetricCard
              title="Active Projects"
              value={
                activeProjects
              }
              subtitle={`${completedProjects} completed`}
              icon={FolderKanban}
              iconClass="bg-blue-500/10 text-blue-400"
            />

            <MetricCard
              title="Total Tasks"
              value={totalTasks}
              subtitle={`${completedTasks} completed`}
              icon={ClipboardList}
              iconClass="bg-violet-500/10 text-violet-400"
            />

            <MetricCard
              title="Pending Reviews"
              value={
                pendingReviews
              }
              subtitle="Awaiting your approval"
              icon={Clock3}
              iconClass="bg-amber-500/10 text-amber-400"
            />

            <MetricCard
              title="Leave Requests"
              value={
                pendingLeaves
              }
              subtitle="Pending team requests"
              icon={CalendarDays}
              iconClass="bg-pink-500/10 text-pink-400"
            />
          </section>

          {/* ==================================================
              CHARTS
          ================================================== */}

          <section className="mb-7 grid gap-5 xl:grid-cols-3">

            {/* TASK STATUS */}

            <ChartCard
              title="Task Status"
              subtitle="Current team task progress"
              icon={BarChart3}
            >
              <div className="flex items-center justify-center gap-8 py-5">
                <div className="relative flex h-40 w-40 items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        getDonutBackground(
                          taskStatusData
                        ),
                    }}
                  />

                  <div className="relative flex h-24 w-24 flex-col items-center justify-center rounded-full bg-[#101017]">
                    <span className="text-2xl font-bold text-white">
                      {taskTotal}
                    </span>

                    <span className="text-[10px] uppercase tracking-wider text-slate-500">
                      Tasks
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {taskStatusData.map(
                    (item) => {
                      const percentage =
                        taskTotal >
                        0
                          ? Math.round(
                              (item.value /
                                taskTotal) *
                                100
                            )
                          : 0;

                      return (
                        <div
                          key={
                            item.label
                          }
                          className="flex items-center justify-between gap-5"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${item.className}`}
                            />

                            <span className="text-xs text-slate-400">
                              {
                                item.label
                              }
                            </span>
                          </div>

                          <span className="text-xs font-semibold text-white">
                            {
                              item.value
                            }{" "}
                            ({percentage}%)
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </ChartCard>

            {/* PROJECT STATUS */}

            <ChartCard
              title="Project Progress"
              subtitle="Projects assigned to you"
              icon={FolderKanban}
            >
              <div className="flex items-center justify-center gap-8 py-5">
                <div className="relative flex h-40 w-40 items-center justify-center">
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
                    <span className="text-2xl font-bold text-white">
                      {
                        projectTotal
                      }
                    </span>

                    <span className="text-[10px] uppercase tracking-wider text-slate-500">
                      Projects
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {projectStatusData.map(
                    (item) => {
                      const percentage =
                        projectTotal >
                        0
                          ? Math.round(
                              (item.value /
                                projectTotal) *
                                100
                            )
                          : 0;

                      return (
                        <div
                          key={
                            item.label
                          }
                          className="flex items-center justify-between gap-5"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${item.className}`}
                            />

                            <span className="text-xs text-slate-400">
                              {
                                item.label
                              }
                            </span>
                          </div>

                          <span className="text-xs font-semibold text-white">
                            {
                              item.value
                            }{" "}
                            ({percentage}%)
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </ChartCard>

            {/* LEAVE STATUS */}

            <ChartCard
              title="Team Leave Status"
              subtitle="Leave requests from your team"
              icon={CalendarDays}
            >
              <div className="flex items-center justify-center gap-8 py-5">
                <div className="relative flex h-40 w-40 items-center justify-center">
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
                    <span className="text-2xl font-bold text-white">
                      {
                        leaves.length
                      }
                    </span>

                    <span className="text-[10px] uppercase tracking-wider text-slate-500">
                      Requests
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {leaveStatusData.map(
                    (item) => {
                      const percentage =
                        leaves.length >
                        0
                          ? Math.round(
                              (item.value /
                                leaves.length) *
                                100
                            )
                          : 0;

                      return (
                        <div
                          key={
                            item.label
                          }
                          className="flex items-center justify-between gap-5"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${item.className}`}
                            />

                            <span className="text-xs text-slate-400">
                              {
                                item.label
                              }
                            </span>
                          </div>

                          <span className="text-xs font-semibold text-white">
                            {
                              item.value
                            }{" "}
                            ({percentage}%)
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </ChartCard>
          </section>

          {/* ==================================================
              TEAM + ATTENDANCE
          ================================================== */}

          <section className="mb-7 grid gap-5 xl:grid-cols-2">

            {/* TEAM DEPARTMENT */}

            <ChartCard
              title="Team Distribution"
              subtitle="Employees grouped by department"
              icon={Users}
            >
              {departmentData.length ===
              0 ? (
                <div className="flex h-40 items-center justify-center text-sm text-slate-600">
                  No team distribution
                  data available.
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  {departmentData.map(
                    ([
                      department,
                      count,
                    ]) => {
                      const maximum =
                        departmentData[0]?.[1] ||
                        1;

                      const width =
                        (count /
                          Number(
                            maximum
                          )) *
                        100;

                      return (
                        <div
                          key={
                            department
                          }
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs text-slate-400">
                              {
                                department
                              }
                            </span>

                            <span className="text-xs font-semibold text-white">
                              {
                                count
                              }
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-white/5">
                            <div
                              className="h-full rounded-full bg-violet-500 transition-all duration-700"
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
              RECENT ACTIVITY + PROJECT PERFORMANCE
          ================================================== */}

          <section className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">

            {/* RECENT ACTIVITY */}

            <div className="rounded-2xl border border-white/10 bg-[#101017]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Recent Team Activity
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Latest team, task and leave activity
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  <Activity className="h-4 w-4" />
                </div>
              </div>

              <div className="divide-y divide-white/5">
                {recentActivity.length ===
                0 ? (
                  <div className="px-5 py-12 text-center text-sm text-slate-600">
                    No recent activity
                    available.
                  </div>
                ) : (
                  recentActivity.map(
                    (
                      activity,
                      index
                    ) => {
                      const Icon =
                        activity.icon;

                      return (
                        <div
                          key={`${activity.title}-${index}`}
                          className="flex items-center gap-4 px-5 py-4 transition hover:bg-white/[0.02]"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                            <Icon className="h-4 w-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-200">
                              {
                                activity.title
                              }
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {
                                activity.detail
                              }
                            </p>
                          </div>

                          <span className="shrink-0 text-[11px] text-slate-600">
                            {
                              formatDate(
                                activity.date
                              )
                            }
                          </span>
                        </div>
                      );
                    }
                  )
                )}
              </div>
            </div>

            {/* PROJECT PERFORMANCE */}

            <div className="rounded-2xl border border-white/10 bg-[#101017]">
              <div className="border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                    <BarChart3 className="h-4 w-4" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      Project Performance
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Current project completion
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5">
                {filteredProjects.length ===
                0 ? (
                  <div className="py-10 text-center text-sm text-slate-600">
                    No projects available.
                  </div>
                ) : (
                  filteredProjects
                    .slice(0, 6)
                    .map(
                      (
                        project
                      ) => {
                        const projectTasks =
                          tasks.filter(
                            (
                              task
                            ) =>
                              typeof task.project ===
                                "object" &&
                              task.project?._id ===
                                project._id
                          );

                        const completed =
                          projectTasks.filter(
                            (
                              task
                            ) =>
                              task.status ===
                              "completed"
                          ).length;

                        const percentage =
                          projectTasks.length >
                          0
                            ? Math.round(
                                (completed /
                                  projectTasks.length) *
                                  100
                              )
                            : project.status ===
                              "completed"
                            ? 100
                            : project.status ===
                              "active"
                            ? 50
                            : 0;

                        return (
                          <div
                            key={
                              project._id
                            }
                          >
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-200">
                                  {
                                    project.name
                                  }
                                </p>

                                <p className="mt-1 text-[11px] text-slate-600">
                                  {
                                    projectTasks.length
                                  }{" "}
                                  tasks
                                </p>
                              </div>

                              <span className="text-xs font-semibold text-violet-300">
                                {
                                  percentage
                                }%
                              </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-white/5">
                              <div
                                className="h-full rounded-full bg-violet-500 transition-all duration-700"
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      }
                    )
                )}
              </div>
            </div>
          </section>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <div className="mt-7 flex flex-col gap-2 border-t border-white/5 pt-5 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>
              WorkSphere Project Manager Reports
            </span>

            <span>
              Manager:{" "}
              {profile?.name ||
                "Project Manager"}
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
    <div className="rounded-2xl border border-white/10 bg-[#101017] p-5 transition hover:border-violet-500/20 hover:bg-[#11111a]">
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
    <div className="rounded-2xl border border-white/10 bg-[#101017] p-5">
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