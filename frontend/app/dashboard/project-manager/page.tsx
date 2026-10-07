"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  ShieldCheck,
  Users,
  FolderKanban,
  CheckSquare,
  CalendarDays,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface ProjectManager {
  _id?: string;
  id?: string;
  employeeId?: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  department?: string;
  designation?: string;
  jobTitle?: string;
  role?: string;
  status?: string;
}

interface DashboardData {
  teamMembers?: number;
  activeProjects?: number;
  pendingTasks?: number;
  pendingLeaves?: number;

  team?: {
    totalMembers?: number;
  };

  projects?: {
    active?: number;
    total?: number;
  };

  tasks?: {
    pending?: number;
    total?: number;
  };

  leaves?: {
    pending?: number;
    total?: number;
  };
}

export default function ProjectManagerDashboard() {
  const [profile, setProfile] =
    useState<ProjectManager | null>(null);

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [actualTeamCount, setActualTeamCount] =
    useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const API_BASE = "http://localhost:5000/api";

  // =====================================================
  // TOKEN
  // =====================================================

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

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("user");

    window.location.href = "/login";
  };

  // =====================================================
  // FETCH ALL DASHBOARD DATA
  // =====================================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const [
        profileResponse,
        dashboardResponse,
        teamResponse,
      ] = await Promise.all([
        fetch(`${API_BASE}/project-managers/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch(`${API_BASE}/project-managers/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch(`${API_BASE}/project-managers/team`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      // =====================================================
      // AUTH CHECK
      // =====================================================

      if (
        profileResponse.status === 401 ||
        dashboardResponse.status === 401 ||
        teamResponse.status === 401
      ) {
        handleLogout();
        return;
      }

      // =====================================================
      // READ RESPONSES
      // =====================================================

      const profileData =
        await profileResponse.json();

      const dashboardData =
        await dashboardResponse.json();

      const teamData =
        await teamResponse.json();

      // =====================================================
      // ERROR CHECK
      // =====================================================

      if (!profileResponse.ok) {
        throw new Error(
          profileData.message ||
            "Unable to load profile"
        );
      }

      if (!dashboardResponse.ok) {
        throw new Error(
          dashboardData.message ||
            "Unable to load dashboard"
        );
      }

      if (!teamResponse.ok) {
        throw new Error(
          teamData.message ||
            "Unable to load team"
        );
      }

      // =====================================================
      // SET PROFILE
      // =====================================================

      setProfile(
        profileData.projectManager ||
          profileData.user ||
          null
      );

      // =====================================================
      // SET DASHBOARD
      // =====================================================

      setDashboard(
        dashboardData.dashboard ||
          dashboardData
      );

      // =====================================================
      // IMPORTANT:
      // GET ACTUAL TEAM MEMBERS
      // =====================================================

      if (Array.isArray(teamData.teamMembers)) {
        setActualTeamCount(
          teamData.teamMembers.length
        );
      } else {
        setActualTeamCount(0);
      }
    } catch (err) {
      console.error(
        "Dashboard loading error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchData();
  }, []);

  // =====================================================
  // DASHBOARD VALUES
  // =====================================================

  // Use actual /team API count
  const teamMembers = actualTeamCount;

  const activeProjects =
    dashboard?.activeProjects ??
    dashboard?.projects?.active ??
    0;

  const pendingTasks =
    dashboard?.pendingTasks ??
    dashboard?.tasks?.pending ??
    0;

  const pendingLeaves =
    dashboard?.pendingLeaves ??
    dashboard?.leaves?.pending ??
    0;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#050509] text-white">
      {/* =================================================
          TOP HEADER
      ================================================= */}

      <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-white/10 bg-[#050509]/95 px-8 backdrop-blur-xl">
        <div>
          <h1 className="text-xl font-semibold">
            Project Manager Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your team, projects and tasks
          </p>
        </div>

        {/* PROFILE DROPDOWN */}

        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setProfileOpen(!profileOpen)
            }
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 transition hover:bg-white/[0.06]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600/20 font-semibold text-violet-400">
              {profile?.name
                ? profile.name
                    .charAt(0)
                    .toUpperCase()
                : "P"}
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-white">
                {profile?.name ||
                  "Project Manager"}
              </p>

              <p className="text-xs text-gray-500">
                Project Manager
              </p>
            </div>

            <ChevronDown
              size={16}
              className="text-gray-500"
            />
          </button>

          {/* PROFILE MENU */}

          {profileOpen && (
            <div className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d15] shadow-2xl">
              <div className="border-b border-white/10 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600/20 text-lg font-bold text-violet-400">
                    {profile?.name
                      ? profile.name
                          .charAt(0)
                          .toUpperCase()
                      : "P"}
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      {profile?.name ||
                        "Project Manager"}
                    </h3>

                    <p className="text-xs text-violet-400">
                      {profile?.role ||
                        "project_manager"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-5">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Mail size={16} />
                  <span>
                    {profile?.email ||
                      "Not available"}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Phone size={16} />
                  <span>
                    {profile?.phone ||
                      "Not available"}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <MapPin size={16} />
                  <span>
                    {profile?.location ||
                      "Not available"}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Briefcase size={16} />
                  <span>
                    {profile?.department ||
                      "Not available"}
                  </span>
                </div>
              </div>

              <div className="border-t border-white/10 p-3">
                <Link
                  href="/dashboard/project-manager/profile"
                  onClick={() =>
                    setProfileOpen(false)
                  }
                  className="block rounded-xl px-4 py-3 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
                >
                  Edit Profile
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-xl px-4 py-3 text-left text-sm text-red-400 transition hover:bg-red-500/10"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="p-8">
        {/* LOADING */}

        {loading && (
          <div className="flex min-h-[500px] items-center justify-center">
            <div className="flex items-center gap-3 text-gray-400">
              <Loader2
                size={24}
                className="animate-spin text-violet-500"
              />

              Loading dashboard...
            </div>
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="mx-auto mt-20 max-w-xl rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
            <AlertCircle
              size={40}
              className="mx-auto mb-4 text-red-400"
            />

            <h2 className="text-lg font-semibold">
              Unable to load dashboard
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchData}
              className="mt-6 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium transition hover:bg-violet-500"
            >
              Try Again
            </button>
          </div>
        )}

        {/* DASHBOARD */}

        {!loading && !error && (
          <>
            {/* WELCOME */}

            <div className="mb-8 rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-600/10 via-transparent to-transparent p-7">
              <div className="flex items-center justify-between gap-6">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <ShieldCheck
                      size={18}
                      className="text-violet-400"
                    />

                    <span className="text-sm font-medium text-violet-400">
                      Project Manager Workspace
                    </span>
                  </div>

                  <h2 className="text-3xl font-bold">
                    Welcome back,{" "}
                    <span className="text-violet-400">
                      {profile?.name || "Manager"}
                    </span>
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm text-gray-400">
                    Monitor your team, manage projects,
                    assign tasks and keep your work moving
                    forward.
                  </p>
                </div>

                <div className="hidden h-20 w-20 items-center justify-center rounded-3xl bg-violet-600/10 md:flex">
                  <Briefcase
                    size={38}
                    className="text-violet-400"
                  />
                </div>
              </div>
            </div>

            {/* =================================================
                STAT CARDS
            ================================================= */}

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {/* TEAM */}

              <Link
                href="/dashboard/project-manager/team"
                className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:border-violet-500/30 hover:bg-violet-500/[0.04]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10">
                    <Users
                      size={21}
                      className="text-violet-400"
                    />
                  </div>

                  <ArrowRight
                    size={17}
                    className="text-gray-600 transition group-hover:translate-x-1 group-hover:text-violet-400"
                  />
                </div>

                <p className="mt-5 text-sm text-gray-500">
                  Team Members
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {teamMembers}
                </p>
              </Link>

              {/* PROJECTS */}

              <Link
                href="/dashboard/project-manager/projects"
                className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:border-violet-500/30 hover:bg-violet-500/[0.04]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
                    <FolderKanban
                      size={21}
                      className="text-blue-400"
                    />
                  </div>

                  <ArrowRight
                    size={17}
                    className="text-gray-600 transition group-hover:translate-x-1 group-hover:text-violet-400"
                  />
                </div>

                <p className="mt-5 text-sm text-gray-500">
                  Active Projects
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {activeProjects}
                </p>
              </Link>

              {/* TASKS */}

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10">
                  <CheckSquare
                    size={21}
                    className="text-amber-400"
                  />
                </div>

                <p className="mt-5 text-sm text-gray-500">
                  Pending Tasks
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {pendingTasks}
                </p>
              </div>

              {/* LEAVES */}

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
                  <CalendarDays
                    size={21}
                    className="text-emerald-400"
                  />
                </div>

                <p className="mt-5 text-sm text-gray-500">
                  Pending Leave Requests
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {pendingLeaves}
                </p>
              </div>
            </div>

            {/* =================================================
                QUICK ACCESS
            ================================================= */}

            <div className="mt-8">
              <h3 className="mb-4 text-lg font-semibold">
                Quick Access
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <Link
                  href="/dashboard/project-manager/team"
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-violet-500/30 hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10">
                      <Users
                        size={20}
                        className="text-violet-400"
                      />
                    </div>

                    <div>
                      <h4 className="font-medium">
                        Manage My Team
                      </h4>

                      <p className="mt-1 text-sm text-gray-500">
                        View and manage your team members
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    size={18}
                    className="text-gray-500"
                  />
                </Link>

                <Link
                  href="/dashboard/project-manager/projects"
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-violet-500/30 hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
                      <FolderKanban
                        size={20}
                        className="text-blue-400"
                      />
                    </div>

                    <div>
                      <h4 className="font-medium">
                        View Projects
                      </h4>

                      <p className="mt-1 text-sm text-gray-500">
                        Monitor your assigned projects
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    size={18}
                    className="text-gray-500"
                  />
                </Link>
              </div>
            </div>

            {/* =================================================
                WORKSPACE INFORMATION
            ================================================= */}

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck
                  size={20}
                  className="text-violet-400"
                />

                <h3 className="font-semibold">
                  Workspace Information
                </h3>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-600">
                    Name
                  </p>

                  <p className="mt-1 text-sm text-gray-300">
                    {profile?.name || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-600">
                    Department
                  </p>

                  <p className="mt-1 text-sm text-gray-300">
                    {profile?.department || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-600">
                    Job Title
                  </p>

                  <p className="mt-1 text-sm text-gray-300">
                    {profile?.jobTitle ||
                      profile?.designation ||
                      "Project Manager"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-600">
                    Status
                  </p>

                  <p className="mt-1 flex items-center gap-2 text-sm text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />

                    {profile?.status || "active"}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}