"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Mail,
  Phone,
  MapPin,
  BriefcaseBusiness,
  User,
  Eye,
  X,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Users,
} from "lucide-react";

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  department?: string;
  jobTitle?: string;
  role?: string;
  status?: string;
  projectManager?: string;
  createdAt?: string;
}

interface ProjectManager {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
}

export default function MyTeamPage() {
  const [teamMembers, setTeamMembers] =
    useState<TeamMember[]>([]);

  const [projectManager, setProjectManager] =
    useState<ProjectManager | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [selectedMember, setSelectedMember] =
    useState<TeamMember | null>(null);

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

  const fetchTeam = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `${API_BASE}/project-managers/team`,
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
          data.message || "Unable to load team"
        );
      }

      setTeamMembers(data.teamMembers || []);
      setProjectManager(data.projectManager || null);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load team"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const filteredMembers = useMemo(() => {
    return teamMembers.filter((member) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.department
          ?.toLowerCase()
          .includes(query) ||
        member.jobTitle
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        member.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [teamMembers, search, statusFilter]);

  const activeCount = teamMembers.filter(
    (member) => member.status === "active"
  ).length;

  const inactiveCount = teamMembers.filter(
    (member) => member.status === "inactive"
  ).length;

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
                My Team
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-bold">
              My Team
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage and view employees assigned to your
              team.
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
        {/* TEAM SUMMARY */}

        <div className="mb-7 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                <Users
                  size={19}
                  className="text-violet-400"
                />
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Total Members
                </p>

                <p className="text-2xl font-bold">
                  {teamMembers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-xs text-gray-500">
              Active
            </p>

            <p className="mt-1 text-2xl font-bold text-emerald-400">
              {activeCount}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-xs text-gray-500">
              Inactive
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-300">
              {inactiveCount}
            </p>
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
              Loading team...
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
              Unable to load team
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchTeam}
              className="mt-5 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium hover:bg-violet-500"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* SEARCH */}

            <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <div className="flex flex-col gap-3 md:flex-row">
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
                    placeholder="Search team members..."
                    className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-600 focus:border-violet-500/50"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className="rounded-xl border border-white/10 bg-[#0c0c12] px-4 py-3 text-sm text-gray-300 outline-none focus:border-violet-500/50"
                >
                  <option value="all">
                    All Status
                  </option>

                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>

                  <option value="pending">
                    Pending
                  </option>
                </select>
              </div>
            </div>

            {/* TABLE */}

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px]">
                  <thead>
                    <tr className="border-b border-white/10 text-left">
                      <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Employee
                      </th>

                      <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Department
                      </th>

                      <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Job Title
                      </th>

                      <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMembers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-16 text-center"
                        >
                          <Users
                            size={35}
                            className="mx-auto mb-3 text-gray-700"
                          />

                          <p className="text-gray-400">
                            No team members found
                          </p>

                          <p className="mt-1 text-sm text-gray-600">
                            Try changing your search or
                            filter.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredMembers.map((member) => (
                        <tr
                          key={member._id}
                          className="border-b border-white/5 transition hover:bg-white/[0.025]"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10 font-semibold text-violet-400">
                                {member.name
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <p className="font-medium text-white">
                                  {member.name}
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                  {member.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm text-gray-400">
                            {member.department || "—"}
                          </td>

                          <td className="px-6 py-5 text-sm text-gray-400">
                            {member.jobTitle || "—"}
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                member.status ===
                                "active"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : member.status ===
                                    "pending"
                                  ? "bg-amber-500/10 text-amber-400"
                                  : "bg-gray-500/10 text-gray-400"
                              }`}
                            >
                              {member.status ||
                                "active"}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedMember(
                                  member
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 transition hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-300"
                            >
                              <Eye size={15} />
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* MEMBER DETAILS MODAL */}

      {selectedMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[#0c0c13] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold">
                  Employee Details
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Team member information
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedMember(null)
                }
                className="rounded-lg p-2 text-gray-500 transition hover:bg-white/5 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10 text-xl font-bold text-violet-400">
                  {selectedMember.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedMember.name}
                  </h3>

                  <p className="mt-1 text-sm text-violet-400">
                    {selectedMember.jobTitle ||
                      "Employee"}
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Mail size={15} />
                    Email
                  </div>

                  <p className="mt-2 break-all text-sm text-gray-300">
                    {selectedMember.email}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone size={15} />
                    Phone
                  </div>

                  <p className="mt-2 text-sm text-gray-300">
                    {selectedMember.phone || "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <BriefcaseBusiness size={15} />
                    Department
                  </div>

                  <p className="mt-2 text-sm text-gray-300">
                    {selectedMember.department || "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin size={15} />
                    Location
                  </div>

                  <p className="mt-2 text-sm text-gray-300">
                    {selectedMember.location || "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <User size={15} />
                    Role
                  </div>

                  <p className="mt-2 text-sm text-gray-300">
                    {selectedMember.role || "employee"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                  <p className="text-xs text-gray-500">
                    Status
                  </p>

                  <p className="mt-2 text-sm text-emerald-400">
                    {selectedMember.status || "active"}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 px-6 py-4 text-right">
              <button
                type="button"
                onClick={() =>
                  setSelectedMember(null)
                }
                className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}