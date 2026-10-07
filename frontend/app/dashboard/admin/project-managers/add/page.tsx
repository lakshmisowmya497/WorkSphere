"use client";

import { useState } from "react";
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
  LogOut,
} from "lucide-react";

export default function AddProjectManagerPage() {
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
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
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
        "http://localhost:5000/api/admin/project-managers",
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
            role: "project-manager",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create Project Manager"
        );
      }

      setSuccess(
        "Project Manager created successfully."
      );

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        location: "",
        department: "",
        jobTitle: "",
      });
    } catch (err) {
      console.error(
        "Add Project Manager error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create Project Manager"
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
      <section className="min-h-[calc(100vh-5rem)] overflow-y-auto">

        <div className="w-full max-w-4xl mx-auto px-6 py-8">

          {/* Back */}
          <Link
            href="/dashboard/admin/project-managers"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-violet-400 transition-colors mb-6"
          >
            <ArrowLeft size={18} />
            Back to Project Managers
          </Link>

          {/* Heading */}
          <div className="mb-8">

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-xl bg-violet-600/20 flex items-center justify-center">
                <UserPlus
                  size={27}
                  className="text-violet-400"
                />
              </div>

              <div>
                <h2 className="text-3xl font-bold">
                  Add Project Manager
                </h2>

                <p className="text-gray-400 mt-1">
                  Create a new Project Manager account.
                </p>
              </div>

            </div>

          </div>

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
                        placeholder="Enter full name"
                        required
                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#06060a] border border-white/10 text-white placeholder:text-gray-600 outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Email Address
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
                        placeholder="manager@worksphere.com"
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
                        minLength={8}
                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#06060a] border border-white/10 text-white placeholder:text-gray-600 outline-none focus:border-violet-500"
                      />
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      Minimum 8 characters.
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Phone Number
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
                  <div className="md:col-span-2">
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
                        placeholder="e.g. Project Manager"
                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#06060a] border border-white/10 text-white placeholder:text-gray-600 outline-none focus:border-violet-500"
                      />
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
                  The Project Manager will use these credentials
                  to log in to WorkSphere.
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
                      Project Manager
                    </p>
                  </div>

                </div>

              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-4 mt-8">

                <Link
                  href="/dashboard/admin/project-managers"
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
                    ? "Creating Project Manager..."
                    : "Create Project Manager"}
                </button>

              </div>

            </form>

          </div>

        </div>

      </section>

    </main>
  );
}