"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  UserCog,
  Save,
  Loader2,
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
}

export default function EditProjectManagerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [managerId, setManagerId] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    department: "",
    jobTitle: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================
  // LOAD PROJECT MANAGER
  // =========================================

  useEffect(() => {
    const loadManager = async () => {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;

        setManagerId(id);

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
            data.message || "Failed to fetch project managers"
          );
        }

        const managers = data.projectManagers || [];

        const selectedManager = managers.find(
          (manager: ProjectManager) =>
            manager._id === id || manager.id === id
        );

        if (!selectedManager) {
          throw new Error("Project Manager not found");
        }

        setFormData({
          name: selectedManager.name || "",
          email: selectedManager.email || "",
          phone: selectedManager.phone || "",
          location: selectedManager.location || "",
          department: selectedManager.department || "",
          jobTitle: selectedManager.jobTitle || "",
        });
      } catch (err) {
        console.error("Load Project Manager error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load Project Manager"
        );
      } finally {
        setLoading(false);
      }
    };

    loadManager();
  }, [params]);

  // =========================================
  // HANDLE INPUT
  // =========================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================
  // UPDATE PROJECT MANAGER
  // =========================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
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

      const response = await fetch(
        `http://localhost:5000/api/admin/project-managers/${managerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update Project Manager"
        );
      }

      setSuccess("Project Manager updated successfully.");

      setTimeout(() => {
        window.location.href =
          "/dashboard/admin/project-managers";
      }, 1000);
    } catch (err) {
      console.error("Update Project Manager error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update Project Manager"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050509] text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2
            size={22}
            className="animate-spin"
          />
          Loading Project Manager...
        </div>
      </main>
    );
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <main className="min-h-screen bg-[#050509] text-white">
      {/* HEADER */}

      <header className="h-20 border-b border-white/10 bg-[#09090f] flex items-center px-8">
        <div>
          <h1 className="text-2xl font-bold text-violet-400">
            WorkSphere
          </h1>

          <p className="text-xs text-gray-500">
            Organization Administration
          </p>
        </div>
      </header>

      {/* MAIN */}

      <section className="p-8">
        <div className="max-w-3xl mx-auto">
          {/* BACK */}

          <Link
            href="/dashboard/admin/project-managers"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={18} />
            Back to Project Managers
          </Link>

          {/* TITLE */}

          <div className="mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-600/20 flex items-center justify-center text-violet-400">
                <UserCog size={24} />
              </div>

              <div>
                <h2 className="text-3xl font-bold">
                  Edit Project Manager
                </h2>

                <p className="text-gray-400 mt-1">
                  Update Project Manager information.
                </p>
              </div>
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-6 border border-red-500/30 bg-red-500/10 rounded-xl p-4 text-red-400">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="mb-6 border border-green-500/30 bg-green-500/10 rounded-xl p-4 text-green-400">
              {success}
            </div>
          )}

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="border border-white/10 bg-[#09090f] rounded-2xl p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NAME */}

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full h-12 px-4 rounded-xl bg-[#06060a] border border-white/10 text-white outline-none focus:border-violet-500"
                />
              </div>

              {/* EMAIL */}

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full h-12 px-4 rounded-xl bg-[#06060a] border border-white/10 text-white outline-none focus:border-violet-500"
                />
              </div>

              {/* PHONE */}

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Phone
                </label>

                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-xl bg-[#06060a] border border-white/10 text-white outline-none focus:border-violet-500"
                />
              </div>

              {/* LOCATION */}

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-xl bg-[#06060a] border border-white/10 text-white outline-none focus:border-violet-500"
                />
              </div>

              {/* DEPARTMENT */}

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Department
                </label>

                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-xl bg-[#06060a] border border-white/10 text-white outline-none focus:border-violet-500"
                />
              </div>

              {/* JOB TITLE */}

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Job Title
                </label>

                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-xl bg-[#06060a] border border-white/10 text-white outline-none focus:border-violet-500"
                />
              </div>
            </div>

            {/* BUTTONS */}

            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-white/10">
              <Link
                href="/dashboard/admin/project-managers"
                className="px-5 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}