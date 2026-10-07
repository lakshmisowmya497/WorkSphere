"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCog,
  Search,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  UserPlus,
  UsersRound,
  Pencil,
  Power,
  Trash2,
} from "lucide-react";

interface ProjectManager {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  department?: string;
  jobTitle?: string;
  status: string;
  teamSize?: number;
}

export default function ProjectManagersPage() {
  const [projectManagers, setProjectManagers] = useState<
    ProjectManager[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchProjectManagers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/admin/project-managers",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch Project Managers"
        );
      }

      setProjectManagers(data.projectManagers || []);
    } catch (err) {
      console.error(
        "Project Manager fetch error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load Project Managers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectManagers();
  }, []);

  const filteredManagers = projectManagers.filter(
    (manager) => {
      const searchText = search.toLowerCase();

      return (
        manager.name
          ?.toLowerCase()
          .includes(searchText) ||
        manager.email
          ?.toLowerCase()
          .includes(searchText) ||
        manager.department
          ?.toLowerCase()
          .includes(searchText) ||
        manager.jobTitle
          ?.toLowerCase()
          .includes(searchText) ||
        manager.location
          ?.toLowerCase()
          .includes(searchText)
      );
    }
  );

  const activeManagers = projectManagers.filter(
    (manager) => manager.status === "active"
  );

  const totalTeamMembers =
    projectManagers.reduce(
      (total, manager) =>
        total + (manager.teamSize || 0),
      0
    );

  const handleToggleStatus = async (
    manager: ProjectManager
  ) => {
    const managerId = manager._id || manager.id;

    if (!managerId) {
      alert("Project Manager ID not found");
      return;
    }

    const action =
      manager.status === "active"
        ? "deactivate"
        : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${manager.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/admin/project-managers/${managerId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status:
              manager.status === "active"
                ? "inactive"
                : "active",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update Project Manager status"
        );
      }

      setProjectManagers((previous) =>
        previous.map((item) => {
          const itemId = item._id || item.id;

          if (itemId !== managerId) {
            return item;
          }

          return {
            ...item,
            status:
              manager.status === "active"
                ? "inactive"
                : "active",
          };
        })
      );
    } catch (err) {
      console.error(
        "Toggle Project Manager status error:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Unable to update Project Manager status"
      );
    }
  };

  const handleDelete = async (
    manager: ProjectManager
  ) => {
    const managerId = manager._id || manager.id;

    if (!managerId) {
      alert("Project Manager ID not found");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${manager.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/admin/project-managers/${managerId}`,
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
          data.message ||
            "Failed to delete Project Manager"
        );
      }

      setProjectManagers((previous) =>
        previous.filter((item) => {
          const itemId = item._id || item.id;
          return itemId !== managerId;
        })
      );
    } catch (err) {
      console.error(
        "Delete Project Manager error:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Unable to delete Project Manager"
      );
    }
  };

  const handleViewTeam = (
    manager: ProjectManager
  ) => {
    const managerId = manager._id || manager.id;

    if (!managerId) {
      alert("Project Manager ID not found");
      return;
    }

    window.location.href =
      `/dashboard/admin/project-managers/${managerId}/team`;
  };

  return (
    <div className="w-full">
      {/* Page Heading */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Project Managers
          </h1>

          <p className="text-gray-400 mt-2">
            View and manage project managers across the
            organization.
          </p>
        </div>

        <Link
          href="/dashboard/admin/project-managers/add"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors shadow-lg shadow-violet-600/20"
        >
          <UserPlus size={18} />
          Add Project Manager
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total */}
        <div className="border border-white/10 bg-[#09090f] rounded-2xl p-6">
          <p className="text-gray-400 text-sm">
            Total Project Managers
          </p>

          <h2 className="text-3xl font-bold mt-2 text-violet-400">
            {loading ? "..." : projectManagers.length}
          </h2>

          <p className="text-xs text-gray-500 mt-2">
            Managers in the organization
          </p>
        </div>

        {/* Active */}
        <div className="border border-white/10 bg-[#09090f] rounded-2xl p-6">
          <p className="text-gray-400 text-sm">
            Active Managers
          </p>

          <h2 className="text-3xl font-bold mt-2 text-green-400">
            {loading ? "..." : activeManagers.length}
          </h2>

          <p className="text-xs text-gray-500 mt-2">
            Currently active
          </p>
        </div>

        {/* Team Members */}
        <div className="border border-white/10 bg-[#09090f] rounded-2xl p-6">
          <p className="text-gray-400 text-sm">
            Team Members
          </p>

          <h2 className="text-3xl font-bold mt-2 text-white">
            {loading ? "..." : totalTeamMembers}
          </h2>

          <p className="text-xs text-gray-500 mt-2">
            Employees assigned to teams
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 border border-red-500/30 bg-red-500/10 rounded-xl p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Directory */}
      <div className="border border-white/10 bg-[#09090f] rounded-2xl p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">
            Project Manager Directory
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {loading
              ? "Loading project managers..."
              : `${filteredManagers.length} project managers found`}
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            type="text"
            placeholder="Search by name, email, department, job title or location..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-[#06060a] border border-white/10 text-white placeholder:text-gray-600 outline-none focus:border-violet-500"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-12 text-center text-gray-500">
            Loading project managers...
          </div>
        )}

        {/* Cards */}
        {!loading &&
          filteredManagers.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {filteredManagers.map((manager) => (
                <div
                  key={manager._id || manager.id}
                  className="border border-white/10 rounded-xl p-5 bg-[#07070c] hover:border-violet-500/30 transition-all"
                >
                  {/* Name + Status */}
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

                  {/* Details */}
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
                      {manager.phone ||
                        "Phone not specified"}
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

                  {/* Team + Actions */}
                  <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-violet-600/10 flex items-center justify-center">
                        <UsersRound
                          size={18}
                          className="text-violet-400"
                        />
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Team Members
                        </p>

                        <p className="text-lg font-semibold text-violet-400">
                          {manager.teamSize || 0}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* View Team */}
                      <button
                        type="button"
                        title="View Team"
                        aria-label="View Team"
                        onClick={() =>
                          handleViewTeam(manager)
                        }
                        className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/30 transition-all"
                      >
                        <UsersRound size={18} />
                      </button>

                      {/* Edit */}
                      <Link
                        href={`/dashboard/admin/project-managers/${
                          manager._id || manager.id
                        }/edit`}
                        title="Edit Project Manager"
                        aria-label="Edit Project Manager"
                        className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <Pencil size={17} />
                      </Link>

                      {/* Activate / Deactivate */}
                      <button
                        type="button"
                        title={
                          manager.status === "active"
                            ? "Deactivate Project Manager"
                            : "Activate Project Manager"
                        }
                        aria-label={
                          manager.status === "active"
                            ? "Deactivate Project Manager"
                            : "Activate Project Manager"
                        }
                        onClick={() =>
                          handleToggleStatus(manager)
                        }
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                          manager.status === "active"
                            ? "border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10"
                            : "border-green-500/20 text-green-400 hover:bg-green-500/10"
                        }`}
                      >
                        <Power size={17} />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        title="Delete Project Manager"
                        aria-label="Delete Project Manager"
                        onClick={() =>
                          handleDelete(manager)
                        }
                        className="w-10 h-10 rounded-xl border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        {/* No Search Results */}
        {!loading &&
          filteredManagers.length === 0 &&
          projectManagers.length > 0 && (
            <div className="py-12 text-center">
              <Search
                size={40}
                className="mx-auto text-gray-600"
              />

              <p className="text-gray-400 mt-4">
                No Project Managers match your search.
              </p>

              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-3 text-sm text-violet-400 hover:text-violet-300"
              >
                Clear Search
              </button>
            </div>
          )}

        {/* No Project Managers */}
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