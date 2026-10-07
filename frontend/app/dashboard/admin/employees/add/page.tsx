"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  UserPlus,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Users,
  LogOut,
} from "lucide-react";

interface ProjectManager {
  _id: string;
  name: string;
  email: string;
}

export default function AddEmployeePage() {
  const [projectManagers, setProjectManagers] = useState<ProjectManager[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    department: "",
    jobTitle: "",
    projectManager: "",
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  useEffect(() => {
    const fetchProjectManagers = async () => {
      try {
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
        console.error("Project Manager fetch error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load Project Managers"
        );
      } finally {
        setLoadingManagers(false);
      }
    };

    fetchProjectManagers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/admin/employees",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            location: formData.location,
            department: formData.department,
            jobTitle: formData.jobTitle,
            projectManager: formData.projectManager || null,
            role: "employee",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create employee"
        );
      }

      setSuccess("Employee created successfully.");

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        location: "",
        department: "",
        jobTitle: "",
        projectManager: "",
      });
    } catch (err) {
      console.error("Add employee error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create employee"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050509] text-white">

      {/* Header */}
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

      {/* Main Content */}
      <section className="p-8 overflow-y-auto">

        {/* Outer container */}
        <div className="max-w-5xl mx-auto">

          {/* Back - left aligned */}
          <Link
            href="/dashboard/admin/employees"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-violet-400 transition-colors mb-8"
          >
            <ArrowLeft size={18} />
            Back to Employees
          </Link>

          {/* Centered content */}
          <div className="max-w-4xl mx-auto">

            {/* Heading */}
            <div className="mb-8">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-violet-600/20 flex items-center justify-center">
                  <UserPlus
                    size={26}
                    className="text-violet-400"
                  />
                </div>

                <div>
                  <h2 className="text-3xl font-bold">
                    Add Employee
                  </h2>

                  <p className="text-gray-400 mt-1">
                    Create a new employee account and assign them to a
                    project manager.
                  </p>
                </div>

              </div>

            </div>

            {/* Form Card */}
            <div className="w-full border border-white/10 bg-[#09090f] rounded-2xl p-8">

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

                {/* Personal Information */}
                <div className="mb-8">

                  <h3 className="text-lg font-semibold mb-5">
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Full Name */}
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
                          placeholder="Enter employee name"
                          required
                          className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#06060a] border border-white/10 text-white placeholder:text-gray-600 outline-none focus:border-violet-500"
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
                          placeholder="employee@worksphere.com"
                          required
                          className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#06060a] border border-white/10 text-white placeholder:text-gray-600 outline-none focus:border-violet-500"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">
                        Password
                      </label>

                      <div className="relative">
                        <Lock
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                        />

                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Create password"
                          required
                          className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#06060a] border border-white/10 text-white placeholder:text-gray-600 outline-none focus:border-violet-500"
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
                          placeholder="Enter phone number"
                          required
                          className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#06060a] border border-white/10 text-white placeholder:text-gray-600 outline-none focus:border-violet-500"
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
                          placeholder="Enter location"
                          className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#06060a] border border-white/10 text-white placeholder:text-gray-600 outline-none focus:border-violet-500"
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
                          placeholder="e.g. Engineering"
                          className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#06060a] border border-white/10 text-white placeholder:text-gray-600 outline-none focus:border-violet-500"
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
                          placeholder="e.g. Developer"
                          className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#06060a] border border-white/10 text-white placeholder:text-gray-600 outline-none focus:border-violet-500"
                        />
                      </div>
                    </div>

                    {/* Project Manager */}
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
                          className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#06060a] border border-white/10 text-white outline-none focus:border-violet-500 appearance-none"
                        >
                          <option
                            value=""
                            className="bg-[#09090f]"
                          >
                            {loadingManagers
                              ? "Loading managers..."
                              : "Select Project Manager"}
                          </option>

                          {projectManagers.map((manager) => (
                            <option
                              key={manager._id}
                              value={manager._id}
                              className="bg-[#09090f]"
                            >
                              {manager.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Account Information */}
                <div className="border-t border-white/10 pt-8">

                  <h3 className="text-lg font-semibold mb-2">
                    Account Information
                  </h3>

                  <p className="text-sm text-gray-500 mb-6">
                    The employee will use these credentials to log in to
                    WorkSphere.
                  </p>

                  <div className="flex items-center gap-3 p-4 rounded-xl bg-violet-500/5 border border-violet-500/10">

                    <UserPlus
                      size={20}
                      className="text-violet-400"
                    />

                    <div>
                      <p className="text-sm font-medium">
                        Account Role
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        Employee
                      </p>
                    </div>

                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-4 mt-8">

                  <Link
                    href="/dashboard/admin/employees"
                    className="px-5 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors shadow-lg shadow-violet-600/20"
                  >
                    <UserPlus size={18} />

                    {submitting
                      ? "Creating Employee..."
                      : "Create Employee"}
                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}