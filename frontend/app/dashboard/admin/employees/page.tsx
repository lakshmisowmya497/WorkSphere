"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  UserPlus,
  Pencil,
  Power,
  Trash2,
} from "lucide-react";

interface ProjectManager {
  _id?: string;
  name: string;
  email: string;
  department?: string;
  jobTitle?: string;
}

interface Employee {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  department?: string;
  jobTitle?: string;
  status: string;
  projectManager?: ProjectManager | null;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // =========================================
  // FETCH EMPLOYEES
  // =========================================

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/admin/employees",
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
          data.message || "Failed to fetch employees"
        );
      }

      setEmployees(data.employees || []);
    } catch (err) {
      console.error("Employee fetch error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load employees"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // =========================================
  // TOGGLE EMPLOYEE STATUS
  // =========================================

  const handleToggleStatus = async (
    employee: Employee
  ) => {
    const employeeId =
      employee._id || employee.id;

    if (!employeeId) {
      alert("Employee ID not found");
      return;
    }

    const action =
      employee.status === "active"
        ? "deactivate"
        : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${employee.name}?`
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
        `http://localhost:5000/api/admin/employees/${employeeId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update employee status"
        );
      }

      setEmployees((previous) =>
        previous.map((item) => {
          const itemId =
            item._id || item.id;

          if (itemId !== employeeId) {
            return item;
          }

          return {
            ...item,
            status: data.status,
          };
        })
      );
    } catch (err) {
      console.error(
        "Employee status update error:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Failed to update employee status"
      );
    }
  };

  // =========================================
  // DELETE EMPLOYEE
  // =========================================

  const handleDelete = async (
    employee: Employee
  ) => {
    const employeeId =
      employee._id || employee.id;

    if (!employeeId) {
      alert("Employee ID not found");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${employee.name}?`
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
        `http://localhost:5000/api/admin/employees/${employeeId}`,
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
            "Failed to delete employee"
        );
      }

      setEmployees((previous) =>
        previous.filter((item) => {
          const itemId =
            item._id || item.id;

          return itemId !== employeeId;
        })
      );
    } catch (err) {
      console.error(
        "Delete employee error:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete employee"
      );
    }
  };

  // =========================================
  // SEARCH
  // =========================================

  const filteredEmployees = employees.filter(
    (employee) => {
      const searchText =
        search.toLowerCase().trim();

      if (!searchText) {
        return true;
      }

      return (
        employee.name
          ?.toLowerCase()
          .includes(searchText) ||
        employee.email
          ?.toLowerCase()
          .includes(searchText) ||
        employee.jobTitle
          ?.toLowerCase()
          .includes(searchText) ||
        employee.department
          ?.toLowerCase()
          .includes(searchText) ||
        employee.location
          ?.toLowerCase()
          .includes(searchText) ||
        employee.projectManager?.name
          ?.toLowerCase()
          .includes(searchText)
      );
    }
  );

  // =========================================
  // STATISTICS
  // =========================================

  const activeEmployees = employees.filter(
    (employee) => employee.status === "active"
  ).length;

  const unassignedEmployees = employees.filter(
    (employee) => !employee.projectManager
  ).length;

  const teams = new Set(
    employees
      .map(
        (employee) =>
          employee.projectManager?._id
      )
      .filter(Boolean)
  ).size;

  // =========================================
  // MAIN UI
  // =========================================

  return (
    <div className="min-h-screen bg-[#050509] text-white">
      <section className="p-8">

        {/* PAGE HEADING */}

        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold">
              Employees
            </h2>

            <p className="mt-2 text-gray-400">
              View and manage employees across
              all project teams.
            </p>
          </div>

          <Link
            href="/dashboard/admin/employees/add"
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-medium text-white shadow-lg shadow-violet-600/20 transition-colors hover:bg-violet-500"
          >
            <UserPlus size={18} />
            Add Employee
          </Link>
        </div>

        {/* STATISTICS */}

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">

          {/* Total */}

          <div className="rounded-2xl border border-white/10 bg-[#09090f] p-6">
            <p className="text-sm text-gray-400">
              Total Employees
            </p>

            <h3 className="mt-2 text-3xl font-bold text-violet-400">
              {loading
                ? "..."
                : employees.length}
            </h3>

            <p className="mt-2 text-xs text-gray-500">
              Employees in organization
            </p>
          </div>

          {/* Active */}

          <div className="rounded-2xl border border-white/10 bg-[#09090f] p-6">
            <p className="text-sm text-gray-400">
              Active Employees
            </p>

            <h3 className="mt-2 text-3xl font-bold text-green-400">
              {loading
                ? "..."
                : activeEmployees}
            </h3>

            <p className="mt-2 text-xs text-gray-500">
              Currently active
            </p>
          </div>

          {/* Teams */}

          <div className="rounded-2xl border border-white/10 bg-[#09090f] p-6">
            <p className="text-sm text-gray-400">
              Teams
            </p>

            <h3 className="mt-2 text-3xl font-bold">
              {loading ? "..." : teams}
            </h3>

            <p className="mt-2 text-xs text-gray-500">
              Project manager teams
            </p>
          </div>

          {/* Unassigned */}

          <div className="rounded-2xl border border-white/10 bg-[#09090f] p-6">
            <p className="text-sm text-gray-400">
              Unassigned
            </p>

            <h3 className="mt-2 text-3xl font-bold text-yellow-400">
              {loading
                ? "..."
                : unassignedEmployees}
            </h3>

            <p className="mt-2 text-xs text-gray-500">
              Without project manager
            </p>
          </div>
        </div>

        {/* SEARCH */}

        <div className="mb-6 rounded-2xl border border-white/10 bg-[#09090f] p-5">
          <div className="relative">

            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              type="text"
              placeholder="Search by name, email, department, job title or project manager..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="h-12 w-full rounded-xl border border-white/10 bg-[#06060a] pl-12 pr-4 text-white outline-none placeholder:text-gray-600 focus:border-violet-500"
            />

          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* EMPLOYEE DIRECTORY */}

        <div className="rounded-2xl border border-white/10 bg-[#09090f] p-6">

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">
                Employee Directory
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {loading
                  ? "Loading employees..."
                  : `${filteredEmployees.length} employees found`}
              </p>
            </div>
          </div>

          {/* LOADING */}

          {loading && (
            <div className="py-12 text-center text-gray-500">
              Loading employees...
            </div>
          )}

          {/* EMPLOYEE CARDS */}

          {!loading &&
            filteredEmployees.length > 0 && (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

                {filteredEmployees.map(
                  (employee) => {
                    const employeeId =
                      employee._id ||
                      employee.id;

                    return (
                      <div
                        key={employeeId}
                        className="rounded-xl border border-white/10 bg-[#07070c] p-5 transition-all hover:border-violet-500/30"
                      >

                        {/* NAME + STATUS */}

                        <div className="flex items-start justify-between">

                          <div className="flex items-center gap-4">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/20 text-lg font-bold text-violet-400">
                              {employee.name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <h4 className="text-lg font-semibold">
                                {employee.name}
                              </h4>

                              <p className="text-sm text-gray-500">
                                {employee.jobTitle ||
                                  "Employee"}
                              </p>
                            </div>

                          </div>

                          {/* STATUS */}

                          <span
                            className={`rounded-full px-3 py-1 text-xs ${
                              employee.status ===
                              "active"
                                ? "bg-green-500/10 text-green-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {employee.status}
                          </span>

                        </div>

                        {/* EMPLOYEE DETAILS */}

                        <div className="mt-5 space-y-3">

                          {/* EMAIL */}

                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <Mail
                              size={16}
                              className="text-gray-500"
                            />

                            {employee.email}
                          </div>

                          {/* PHONE */}

                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <Phone
                              size={16}
                              className="text-gray-500"
                            />

                            {employee.phone ||
                              "Phone not specified"}
                          </div>

                          {/* LOCATION */}

                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <MapPin
                              size={16}
                              className="text-gray-500"
                            />

                            {employee.location ||
                              "Location not specified"}
                          </div>

                          {/* DEPARTMENT */}

                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <Briefcase
                              size={16}
                              className="text-gray-500"
                            />

                            {employee.department ||
                              "Department not specified"}
                          </div>

                        </div>

                        {/* BOTTOM SECTION */}

                        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">

                          {/* PROJECT MANAGER */}

                          <div>
                            <p className="text-xs text-gray-500">
                              Project Manager
                            </p>

                            {employee.projectManager ? (
                              <div className="mt-1">
                                <p className="text-sm font-medium text-violet-400">
                                  {
                                    employee
                                      .projectManager
                                      .name
                                  }
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                  {
                                    employee
                                      .projectManager
                                      .jobTitle
                                  }
                                </p>
                              </div>
                            ) : (
                              <p className="mt-1 text-sm font-medium text-yellow-400">
                                Not assigned
                              </p>
                            )}
                          </div>

                          {/* ACTIONS */}

                          <div className="flex items-center gap-2">

                            {/* EDIT */}

                            <Link
                              href={`/dashboard/admin/employees/${employeeId}/edit`}
                              title="Edit Employee"
                              aria-label="Edit Employee"
                              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-gray-400 transition-all hover:bg-white/5 hover:text-white"
                            >
                              <Pencil size={17} />
                            </Link>

                            {/* ACTIVATE / DEACTIVATE */}

                            <button
                              type="button"
                              title={
                                employee.status ===
                                "active"
                                  ? "Deactivate Employee"
                                  : "Activate Employee"
                              }
                              aria-label={
                                employee.status ===
                                "active"
                                  ? "Deactivate Employee"
                                  : "Activate Employee"
                              }
                              onClick={() =>
                                handleToggleStatus(
                                  employee
                                )
                              }
                              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
                                employee.status ===
                                "active"
                                  ? "border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10"
                                  : "border-green-500/20 text-green-400 hover:bg-green-500/10"
                              }`}
                            >
                              <Power size={17} />
                            </button>

                            {/* DELETE */}

                            <button
                              type="button"
                              title="Delete Employee"
                              aria-label="Delete Employee"
                              onClick={() =>
                                handleDelete(
                                  employee
                                )
                              }
                              className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 text-red-400 transition-all hover:bg-red-500/10"
                            >
                              <Trash2 size={17} />
                            </button>

                          </div>
                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          {/* NO RESULTS */}

          {!loading &&
            filteredEmployees.length === 0 &&
            !error && (
              <div className="py-12 text-center">

                <Users
                  size={40}
                  className="mx-auto text-gray-600"
                />

                <p className="mt-4 text-gray-400">
                  {search
                    ? "No employees match your search."
                    : "No employees found."}
                </p>

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    className="mt-3 text-sm text-violet-400 hover:text-violet-300"
                  >
                    Clear Search
                  </button>
                )}

              </div>
            )}

        </div>
      </section>
    </div>
  );
}