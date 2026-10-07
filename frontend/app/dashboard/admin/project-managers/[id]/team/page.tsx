"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  User,
  Loader2,
} from "lucide-react";

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  department?: string;
  jobTitle?: string;
  status?: string;
}

interface ProjectManager {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  department?: string;
  jobTitle?: string;
  status?: string;
  teamSize?: number;
}

export default function ProjectManagerTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [managerId, setManagerId] = useState("");

  const [manager, setManager] = useState<ProjectManager | null>(
    null
  );

  const [employees, setEmployees] = useState<Employee[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadPage = async () => {
      try {
        const resolvedParams = await params;

        setManagerId(resolvedParams.id);

        const token = localStorage.getItem("token");

        if (!token) {
          window.location.href = "/login";
          return;
        }

        /*
         * Get all project managers
         */
        const managersResponse = await fetch(
          "http://localhost:5000/api/admin/project-managers",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const managersData = await managersResponse.json();

        if (!managersResponse.ok) {
          throw new Error(
            managersData.message ||
              "Failed to load project managers"
          );
        }

        const managers =
          managersData.projectManagers || [];

        const selectedManager = managers.find(
          (item: ProjectManager) =>
            item._id === resolvedParams.id ||
            item.id === resolvedParams.id
        );

        if (!selectedManager) {
          throw new Error(
            "Project Manager not found"
          );
        }

        setManager(selectedManager);

        /*
         * Get employees
         */
        const employeesResponse = await fetch(
          "http://localhost:5000/api/admin/employees",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const employeesData =
          await employeesResponse.json();

        if (!employeesResponse.ok) {
          throw new Error(
            employeesData.message ||
              "Failed to load employees"
          );
        }

        const allEmployees =
          employeesData.employees || [];

        /*
         * Only employees assigned to this manager
         */
        const managerEmployees =
          allEmployees.filter(
            (employee: any) =>
              employee.projectManager ===
                resolvedParams.id ||
              employee.projectManager?._id ===
                resolvedParams.id
          );

        setEmployees(managerEmployees);
      } catch (err) {
        console.error("Team page error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load team"
        );
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [params]);

  return (
    <main className="min-h-screen bg-[#050509] text-white">

      {/* HEADER */}

      <header className="h-20 border-b border-white/10 bg-[#09090f] flex items-center justify-between px-8">

        <div>
          <h1 className="text-2xl font-bold text-violet-400">
            WorkSphere
          </h1>

          <p className="text-xs text-gray-500">
            Organization Administration
          </p>
        </div>

        <Link
          href="/dashboard/admin"
          className="text-gray-400 hover:text-white transition-colors"
          style={{ cursor: "pointer" }}
        >
          Dashboard
        </Link>

      </header>

      {/* MAIN */}

      <section className="max-w-6xl mx-auto px-6 py-10">

        {/* BACK */}

        <Link
          href="/dashboard/admin/project-managers"
          style={{ cursor: "pointer" }}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-violet-400 transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          Back to Project Managers
        </Link>

        {/* ERROR */}

        {error && (
          <div className="border border-red-500/30 bg-red-500/10 rounded-xl p-5 text-red-400 mb-6">
            {error}
          </div>
        )}

        {/* MANAGER HEADER */}

        {!loading && manager && (
          <div className="border border-white/10 bg-[#09090f] rounded-2xl p-7 mb-7">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-5">

                <div className="w-16 h-16 rounded-2xl bg-violet-600/20 flex items-center justify-center text-violet-400 text-2xl font-bold">
                  {manager.name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

                <div>

                  <h2 className="text-3xl font-bold">
                    {manager.name}
                  </h2>

                  <p className="text-gray-500 mt-1">
                    {manager.jobTitle ||
                      "Project Manager"}
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    {manager.email}
                  </p>

                </div>

              </div>

              <div className="text-right">

                <p className="text-sm text-gray-500">
                  Team Members
                </p>

                <p className="text-3xl font-bold text-violet-400">
                  {employees.length}
                </p>

              </div>

            </div>

          </div>
        )}

        {/* PAGE TITLE */}

        <div className="mb-6">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-violet-600/15 flex items-center justify-center">
              <Users
                size={21}
                className="text-violet-400"
              />
            </div>

            <div>

              <h3 className="text-2xl font-bold">
                Team Members
              </h3>

              <p className="text-sm text-gray-500">
                Employees assigned to this Project Manager
              </p>

            </div>

          </div>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="border border-white/10 bg-[#09090f] rounded-2xl p-12 text-center">

            <Loader2
              size={28}
              className="mx-auto text-violet-400 animate-spin"
            />

            <p className="text-gray-500 mt-4">
              Loading team members...
            </p>

          </div>
        )}

        {/* NO TEAM MEMBERS */}

        {!loading &&
          !error &&
          employees.length === 0 && (

            <div className="border border-white/10 bg-[#09090f] rounded-2xl p-14 text-center">

              <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-600/10 flex items-center justify-center">

                <Users
                  size={28}
                  className="text-violet-400"
                />

              </div>

              <h3 className="text-xl font-semibold mt-5">
                No Team Members
              </h3>

              <p className="text-gray-500 mt-2">
                This Project Manager currently has no employees assigned.
              </p>

            </div>
          )}

        {/* EMPLOYEES */}

        {!loading &&
          !error &&
          employees.length > 0 && (

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {employees.map((employee) => (

                <div
                  key={employee._id}
                  className="border border-white/10 bg-[#09090f] rounded-2xl p-6 hover:border-violet-500/30 transition-all"
                >

                  {/* NAME */}

                  <div className="flex items-start justify-between">

                    <div className="flex items-center gap-4">

                      <div className="w-12 h-12 rounded-xl bg-violet-600/20 flex items-center justify-center text-violet-400 font-bold text-lg">

                        {employee.name
                          ?.charAt(0)
                          .toUpperCase()}

                      </div>

                      <div>

                        <h4 className="font-semibold text-lg">
                          {employee.name}
                        </h4>

                        <p className="text-sm text-gray-500">
                          {employee.jobTitle ||
                            "Employee"}
                        </p>

                      </div>

                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        employee.status ===
                        "inactive"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-green-500/10 text-green-400"
                      }`}
                    >
                      {employee.status ||
                        "active"}
                    </span>

                  </div>

                  {/* DETAILS */}

                  <div className="mt-5 space-y-3">

                    <div className="flex items-center gap-3 text-sm text-gray-400">

                      <Mail
                        size={16}
                        className="text-gray-500"
                      />

                      {employee.email}

                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-400">

                      <Phone
                        size={16}
                        className="text-gray-500"
                      />

                      {employee.phone ||
                        "Phone not specified"}

                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-400">

                      <MapPin
                        size={16}
                        className="text-gray-500"
                      />

                      {employee.location ||
                        "Location not specified"}

                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-400">

                      <Briefcase
                        size={16}
                        className="text-gray-500"
                      />

                      {employee.department ||
                        "Engineering"}

                    </div>

                  </div>

                </div>

              ))}

            </div>
          )}

      </section>

    </main>
  );
}