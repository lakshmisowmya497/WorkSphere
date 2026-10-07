"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Users,
  Save,
  LogOut,
  UserCog,
} from "lucide-react";

interface ProjectManager {
  _id: string;
  name: string;
  email: string;
  department?: string;
  jobTitle?: string;
  status?: string;
}

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  department?: string;
  jobTitle?: string;
  status: string;
  projectManager?: ProjectManager | null;
}

export default function EditEmployeePage() {
  const params = useParams();

  const employeeId = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [projectManagers, setProjectManagers] = useState<
    ProjectManager[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    department: "",
    jobTitle: "",
    projectManager: "",
  });

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  // =========================================
  // FETCH EMPLOYEE + PROJECT MANAGERS
  // =========================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          window.location.href = "/login";
          return;
        }

        // -------------------------------------
        // FETCH ALL EMPLOYEES
        // -------------------------------------

        const employeeResponse = await fetch(
          "http://localhost:5000/api/admin/employees",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const employeeData = await employeeResponse.json();

        if (!employeeResponse.ok) {
          throw new Error(
            employeeData.message ||
              "Failed to fetch employees"
          );
        }

        const employees: Employee[] =
          employeeData.employees || [];

        const selectedEmployee = employees.find(
          (item) => item._id === employeeId
        );

        if (!selectedEmployee) {
          throw new Error("Employee not found");
        }

        setEmployee(selectedEmployee);

        // -------------------------------------
        // SET FORM DATA
        // -------------------------------------

        setFormData({
          name: selectedEmployee.name || "",
          email: selectedEmployee.email || "",
          phone: selectedEmployee.phone || "",
          location: selectedEmployee.location || "",
          department: selectedEmployee.department || "",
          jobTitle: selectedEmployee.jobTitle || "",
          projectManager:
            selectedEmployee.projectManager?._id || "",
        });

        // -------------------------------------
        // FETCH PROJECT MANAGERS
        // -------------------------------------

        const managerResponse = await fetch(
          "http://localhost:5000/api/admin/project-managers",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const managerData = await managerResponse.json();

        if (!managerResponse.ok) {
          throw new Error(
            managerData.message ||
              "Failed to fetch Project Managers"
          );
        }

        setProjectManagers(
          managerData.projectManagers || []
        );
      } catch (err) {
        console.error("Edit employee fetch error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load employee"
        );
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchData();
    }
  }, [employeeId]);

  // =========================================
  // HANDLE INPUT
  // =========================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================
  // SAVE EMPLOYEE
  // =========================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      // -------------------------------------
      // UPDATE BASIC EMPLOYEE INFORMATION
      // -------------------------------------

      const updateResponse = await fetch(
        `http://localhost:5000/api/admin/employees/${employeeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            location: formData.location,
            department: formData.department,
            jobTitle: formData.jobTitle,
          }),
        }
      );

      const updateData = await updateResponse.json();

      if (!updateResponse.ok) {
        throw new Error(
          updateData.message ||
            "Failed to update employee"
        );
      }

      // -------------------------------------
      // UPDATE PROJECT MANAGER
      // -------------------------------------

      const managerResponse = await fetch(
        `http://localhost:5000/api/admin/employees/${employeeId}/manager`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            projectManager:
              formData.projectManager || null,
          }),
        }
      );

      const managerData =
        await managerResponse.json();

      if (!managerResponse.ok) {
        throw new Error(
          managerData.message ||
            "Failed to update Project Manager"
        );
      }

      // -------------------------------------
      // SUCCESS
      // -------------------------------------

      setEmployee(managerData.employee);

      setSuccess(
        "Employee updated successfully."
      );
    } catch (err) {
      console.error("Update employee error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update employee"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================
  // LOADING SCREEN
  // =========================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050509] text-white">
        <header className="h-20 border-b border-white/10 bg-[#09090f] flex items-center justify-between px-8">
          <div>
            <h1 className="text-2xl font-bold text-violet-400">
              WorkSphere
            </h1>

            <p className="text-xs text-gray-500">
              Organization Administration
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </header>

        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <p className="text-gray-500">
            Loading employee...
          </p>
        </div>
      </main>
    );
  }

  // =========================================
  // MAIN UI
  // =========================================

  return (
    <main className="min-h-screen bg-[#050509] text-white">
      {/* =========================================
          HEADER
      ========================================= */}

      <header className="h-20 border-b border-white/10 bg-[#09090f] flex items-center justify-between px-8">
        <div>
          <h1 className="text-2xl font-bold text-violet-400">
            WorkSphere
          </h1>

          <p className="text-xs text-gray-500">
            Organization Administration
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </header>

      {/* =========================================
          MAIN
      ========================================= */}

      <section className="p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Back */}

          <Link
            href="/dashboard/admin/employees"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-violet-400 transition-colors mb-8"
          >
            <ArrowLeft size={18} />
            Back to Employees
          </Link>

          {/* Heading */}

          <div className="mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-violet-600/20 flex items-center justify-center">
                <UserCog
                  size={26}
                  className="text-violet-400"
                />
              </div>

              <div>
                <h2 className="text-3xl font-bold">
                  Edit Employee
                </h2>

                <p className="text-gray-400 mt-1">
                  Update employee information and
                  project manager assignment.
                </p>
              </div>
            </div>
          </div>

          {/* Employee status */}

          {employee && (
            <div className="mb-6 border border-white/10 bg-[#09090f] rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Current Employee
                </p>

                <p className="text-lg font-semibold mt-1">
                  {employee.name}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs ${
                  employee.status === "active"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {employee.status}
              </span>
            </div>
          )}

          {/* Form Card */}

          <div className="border border-white/10 bg-[#09090f] rounded-2xl p-8">
            {/* Error */}

            {error && (
              <div className="mb-6 border border-red-500/30 bg-red-500/10 rounded-xl p-4 text-red-400">
                {error}
              </div>
            )}

            {/* Success */}

            {success && (
              <div className="mb-6 border border-green-500/30 bg-green-500/10 rounded-xl p-4 text-green-400">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* =========================================
                  PERSONAL INFORMATION
              ========================================= */}

              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-5">
                  Employee Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Full Name
                    </label>

                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                      />

                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#06060a] border border-white/10 text-white outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>

                  {/* Email */}

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Email
                    </label>

                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                      />

                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#06060a] border border-white/10 text-white outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>

                  {/* Phone */}

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Phone
                    </label>

                    <div className="relative">
                      <Phone
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                      />

                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#06060a] border border-white/10 text-white outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>

                  {/* Location */}

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Location
                    </label>

                    <div className="relative">
                      <MapPin
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                      />

                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#06060a] border border-white/10 text-white outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>

                  {/* Department */}

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Department
                    </label>

                    <div className="relative">
                      <Building2
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                      />

                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#06060a] border border-white/10 text-white outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>

                  {/* Job Title */}

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Job Title
                    </label>

                    <div className="relative">
                      <Briefcase
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                      />

                      <input
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#06060a] border border-white/10 text-white outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* =========================================
                  PROJECT MANAGER
              ========================================= */}

              <div className="border-t border-white/10 pt-8">
                <h3 className="text-lg font-semibold mb-2">
                  Team Assignment
                </h3>

                <p className="text-sm text-gray-500 mb-6">
                  Assign or reassign this employee to
                  an active Project Manager.
                </p>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Project Manager
                  </label>

                  <div className="relative">
                    <Users
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                    />

                    <select
                      name="projectManager"
                      value={formData.projectManager}
                      onChange={handleChange}
                      className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#06060a] border border-white/10 text-white outline-none focus:border-violet-500"
                    >
                      <option
                        value=""
                        className="bg-[#09090f]"
                      >
                        No Project Manager
                      </option>

                      {projectManagers.map(
                        (manager) => (
                          <option
                            key={manager._id}
                            value={manager._id}
                            className="bg-[#09090f]"
                            disabled={
                              manager.status ===
                              "inactive"
                            }
                          >
                            {manager.name}
                            {manager.status ===
                            "inactive"
                              ? " (Inactive)"
                              : ""}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                {/* Current manager */}

                {employee?.projectManager && (
                  <div className="mt-4 p-4 rounded-xl bg-violet-500/5 border border-violet-500/10">
                    <p className="text-xs text-gray-500">
                      Current Project Manager
                    </p>

                    <p className="text-sm font-medium text-violet-400 mt-1">
                      {employee.projectManager.name}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {employee.projectManager.email}
                    </p>
                  </div>
                )}
              </div>

              {/* =========================================
                  BUTTONS
              ========================================= */}

              <div className="flex items-center justify-end gap-4 mt-8">
                <Link
                  href="/dashboard/admin/employees"
                  className="px-5 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors shadow-lg shadow-violet-600/20"
                >
                  <Save size={18} />

                  {saving
                    ? "Saving Changes..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}