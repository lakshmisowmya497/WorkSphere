"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  UserCog,
  Users,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FolderKanban,
  CheckCircle2,
  Clock3,
  PauseCircle,
  UsersRound,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

interface ProjectManager {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  location?: string;
  department?: string;
  jobTitle?: string;
  role: string;
  status: string;
  teamSize?: number;
}

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  location?: string;
  department?: string;
  jobTitle?: string;
  role: string;
  status: string;
  projectManager?: {
    _id?: string;
    name?: string;
    email?: string;
  } | null;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "planning" | "active" | "on_hold" | "completed";
  projectManager?: {
    _id?: string;
    name?: string;
    email?: string;
    department?: string;
    jobTitle?: string;
    status?: string;
  } | null;
  teamSize?: number;
}

export default function AdminDashboard() {
  const [projectManagers, setProjectManagers] = useState<
    ProjectManager[]
  >([]);

  const [employees, setEmployees] = useState<Employee[]>([]);

  const [projects, setProjects] = useState<Project[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token") ||
          sessionStorage.getItem("token");

        if (!token) {
          window.location.href = "/login";
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [
          projectManagersResponse,
          employeesResponse,
          projectsResponse,
        ] = await Promise.all([
          fetch(`${API_BASE}/admin/project-managers`, {
            method: "GET",
            headers,
            cache: "no-store",
          }),

          fetch(`${API_BASE}/admin/employees`, {
            method: "GET",
            headers,
            cache: "no-store",
          }),

          fetch(`${API_BASE}/admin/projects`, {
            method: "GET",
            headers,
            cache: "no-store",
          }),
        ]);

        const [
          projectManagersData,
          employeesData,
          projectsData,
        ] = await Promise.all([
          projectManagersResponse.json(),
          employeesResponse.json(),
          projectsResponse.json(),
        ]);

        if (!projectManagersResponse.ok) {
          throw new Error(
            projectManagersData.message ||
              "Failed to fetch Project Managers"
          );
        }

        if (!employeesResponse.ok) {
          throw new Error(
            employeesData.message ||
              "Failed to fetch Employees"
          );
        }

        if (!projectsResponse.ok) {
          throw new Error(
            projectsData.message ||
              "Failed to fetch Projects"
          );
        }

        setProjectManagers(
          projectManagersData.projectManagers || []
        );

        setEmployees(
          employeesData.employees || []
        );

        setProjects(
          projectsData.projects || []
        );
      } catch (err) {
        console.error(
          "Admin Dashboard fetch error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statistics = useMemo(() => {
    const activeEmployees = employees.filter(
      (employee) => employee.status === "active"
    ).length;

    const activeManagers = projectManagers.filter(
      (manager) => manager.status === "active"
    ).length;

    const activeProjects = projects.filter(
      (project) => project.status === "active"
    ).length;

    const completedProjects = projects.filter(
      (project) => project.status === "completed"
    ).length;

    const planningProjects = projects.filter(
      (project) => project.status === "planning"
    ).length;

    const onHoldProjects = projects.filter(
      (project) => project.status === "on_hold"
    ).length;

    return {
      totalManagers: projectManagers.length,
      activeManagers,
      totalEmployees: employees.length,
      activeEmployees,
      totalProjects: projects.length,
      activeProjects,
      completedProjects,
      planningProjects,
      onHoldProjects,
      totalTeams: projectManagers.length,
    };
  }, [projectManagers, employees, projects]);

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Admin Dashboard
        </h1>

        <p className="text-gray-400 mt-2">
          Manage your organization, teams, projects and employees.
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 border border-red-500/30 bg-red-500/10 rounded-xl p-4 text-red-400">
          {error}
        </div>
      )}

      {/* MAIN STATISTICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {/* PROJECT MANAGERS */}
        <div className="border border-white/10 bg-[#09090f] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">
                Project Managers
              </p>

              <h2 className="text-3xl font-bold mt-2 text-violet-400">
                {loading
                  ? "..."
                  : statistics.totalManagers}
              </h2>

              <p className="text-xs text-gray-500 mt-2">
                {statistics.activeManagers} active managers
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <UserCog
                size={22}
                className="text-violet-400"
              />
            </div>
          </div>
        </div>

        {/* EMPLOYEES */}
        <div className="border border-white/10 bg-[#09090f] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">
                Employees
              </p>

              <h2 className="text-3xl font-bold mt-2 text-white">
                {loading
                  ? "..."
                  : statistics.totalEmployees}
              </h2>

              <p className="text-xs text-gray-500 mt-2">
                {statistics.activeEmployees} active employees
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Users
                size={22}
                className="text-blue-400"
              />
            </div>
          </div>
        </div>

        {/* PROJECTS */}
        <div className="border border-white/10 bg-[#09090f] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">
                Projects
              </p>

              <h2 className="text-3xl font-bold mt-2 text-white">
                {loading
                  ? "..."
                  : statistics.totalProjects}
              </h2>

              <p className="text-xs text-gray-500 mt-2">
                {statistics.activeProjects} currently active
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <FolderKanban
                size={22}
                className="text-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* TEAMS */}
        <div className="border border-white/10 bg-[#09090f] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">
                Teams
              </p>

              <h2 className="text-3xl font-bold mt-2 text-white">
                {loading
                  ? "..."
                  : statistics.totalTeams}
              </h2>

              <p className="text-xs text-gray-500 mt-2">
                One team per Project Manager
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 flex items-center justify-center">
              <UsersRound
                size={22}
                className="text-fuchsia-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* PROJECT STATUS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {/* ACTIVE */}
        <div className="border border-white/10 bg-[#09090f] rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2
                size={20}
                className="text-green-400"
              />
            </div>

            <div>
              <p className="text-sm text-gray-400">
                Active Projects
              </p>

              <p className="text-2xl font-bold text-green-400">
                {loading
                  ? "..."
                  : statistics.activeProjects}
              </p>
            </div>
          </div>
        </div>

        {/* COMPLETED */}
        <div className="border border-white/10 bg-[#09090f] rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <CheckCircle2
                size={20}
                className="text-violet-400"
              />
            </div>

            <div>
              <p className="text-sm text-gray-400">
                Completed Projects
              </p>

              <p className="text-2xl font-bold text-violet-400">
                {loading
                  ? "..."
                  : statistics.completedProjects}
              </p>
            </div>
          </div>
        </div>

        {/* PLANNING */}
        <div className="border border-white/10 bg-[#09090f] rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Clock3
                size={20}
                className="text-yellow-400"
              />
            </div>

            <div>
              <p className="text-sm text-gray-400">
                Planning
              </p>

              <p className="text-2xl font-bold text-yellow-400">
                {loading
                  ? "..."
                  : statistics.planningProjects}
              </p>
            </div>
          </div>
        </div>

        {/* ON HOLD */}
        <div className="border border-white/10 bg-[#09090f] rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <PauseCircle
                size={20}
                className="text-orange-400"
              />
            </div>

            <div>
              <p className="text-sm text-gray-400">
                On Hold
              </p>

              <p className="text-2xl font-bold text-orange-400">
                {loading
                  ? "..."
                  : statistics.onHoldProjects}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PROJECT MANAGERS */}
      <div className="border border-white/10 bg-[#09090f] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Project Managers
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Manage your organization's project managers
            </p>
          </div>

          <Link
            href="/dashboard/admin/project-managers/add"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors"
          >
            <UserPlus size={18} />
            Add Project Manager
          </Link>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="py-12 text-center text-gray-500">
            Loading organization data...
          </div>
        )}

        {/* MANAGER CARDS */}
        {!loading &&
          projectManagers.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {projectManagers.map((manager) => (
                <div
                  key={manager._id || manager.id}
                  className="border border-white/10 rounded-xl p-5 bg-[#07070c] hover:border-violet-500/30 transition-all"
                >
                  {/* NAME + STATUS */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-violet-600/20 flex items-center justify-center text-violet-400 font-bold text-lg">
                        {manager.name
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg text-white">
                          {manager.name}
                        </h3>

                        <p className="text-sm text-gray-500">
                          {manager.jobTitle ||
                            "Project Manager"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        manager.status === "active"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {manager.status}
                    </span>
                  </div>

                  {/* DETAILS */}
                  <div className="mt-5 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <Mail
                        size={16}
                        className="text-gray-500"
                      />
                      {manager.email}
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <Phone
                        size={16}
                        className="text-gray-500"
                      />
                      {manager.phone}
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <MapPin
                        size={16}
                        className="text-gray-500"
                      />
                      {manager.location ||
                        "Location not specified"}
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <Briefcase
                        size={16}
                        className="text-gray-500"
                      />
                      {manager.department ||
                        "Engineering"}
                    </div>
                  </div>

                  {/* TEAM */}
                  <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">
                        Team Members
                      </p>

                      <p className="text-xl font-semibold text-violet-400 mt-1">
                        {manager.teamSize || 0}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const managerId =
                          manager._id ||
                          manager.id;

                        if (!managerId) {
                          alert(
                            "Project Manager ID not found"
                          );
                          return;
                        }

                        window.location.href = `/dashboard/admin/project-managers/${managerId}/team`;
                      }}
                      className="px-4 py-2 rounded-lg border border-white/10 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      View Team
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        {/* NO MANAGERS */}
        {!loading &&
          projectManagers.length === 0 &&
          !error && (
            <div className="py-12 text-center">
              <UserCog
                size={40}
                className="mx-auto text-gray-600"
              />

              <p className="text-gray-400 mt-4">
                No Project Managers found.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}