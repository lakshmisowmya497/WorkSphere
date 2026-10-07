"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  ShieldCheck,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  BriefcaseBusiness,
} from "lucide-react";

interface ProjectManager {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  department?: string;
  jobTitle?: string;
  role?: string;
  status?: string;
  employeeId?: string;
  teamSize?: number;
}

export default function ProjectManagerProfilePage() {
  const [profile, setProfile] = useState<ProjectManager | null>(null);

  const [form, setForm] = useState({
    phone: "",
    location: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const API_BASE = "http://localhost:5000/api";

  useEffect(() => {
    fetchProfile();
  }, []);

  const getToken = () => {
    if (typeof window === "undefined") return null;

    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("token")
    );
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = getToken();

      const response = await fetch(
        `${API_BASE}/project-managers/me`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load profile"
        );
      }

      const manager =
        data.projectManager ||
        data.user ||
        data;

      setProfile(manager);

      setForm({
        phone: manager.phone || "",
        location: manager.location || "",
      });
    } catch (error) {
      console.error("Profile fetch error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: "phone" | "location",
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccessMessage("");
      setErrorMessage("");

      const token = getToken();

      const response = await fetch(
        `${API_BASE}/project-managers/me`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify({
            phone: form.phone,
            location: form.location,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update profile"
        );
      }

      const updatedProfile =
        data.projectManager ||
        data.user ||
        data;

      setProfile(updatedProfile);

      setForm({
        phone: updatedProfile.phone || form.phone,
        location:
          updatedProfile.location || form.location,
      });

      setSuccessMessage(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error("Profile update error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const getStatusDisplay = () => {
    if (!profile?.status) return "Active";

    return (
      profile.status.charAt(0).toUpperCase() +
      profile.status.slice(1)
    );
  };

  const getRoleDisplay = () => {
    if (!profile?.role) return "Project Manager";

    return profile.role
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  const getInitial = () => {
    if (!profile?.name) return "P";

    return profile.name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070b] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2
            size={36}
            className="animate-spin text-violet-500"
          />
          <p className="text-sm text-zinc-400">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage && !profile) {
    return (
      <div className="min-h-screen bg-[#07070b] text-white flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-[#111116] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
            <AlertCircle
              size={28}
              className="text-red-400"
            />
          </div>

          <h1 className="text-xl font-semibold">
            Unable to load profile
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            {errorMessage}
          </p>

          <button
            onClick={fetchProfile}
            className="mt-6 rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium transition hover:bg-violet-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0b0b10]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/project-manager"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-300 transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white"
            >
              <ArrowLeft size={19} />
            </Link>

            <div>
              <h1 className="text-xl font-semibold">
                Edit Profile
              </h1>

              <p className="text-sm text-zinc-500">
                Manage your WorkSphere profile
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300 sm:flex">
            <ShieldCheck size={16} />
            Project Manager
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Profile Summary */}
          <section className="rounded-2xl border border-white/10 bg-[#101016] p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-900 text-2xl font-bold shadow-lg shadow-violet-900/20">
                {getInitial()}
              </div>

              <h2 className="mt-5 text-xl font-semibold">
                {profile?.name || "Project Manager"}
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                {profile?.email || "No email"}
              </p>

              <div className="mt-4 flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {getStatusDisplay()}
              </div>
            </div>

            <div className="my-6 h-px bg-white/10" />

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <BriefcaseBusiness
                  size={18}
                  className="mt-0.5 text-violet-400"
                />

                <div>
                  <p className="text-xs text-zinc-500">
                    Role
                  </p>

                  <p className="mt-1 text-sm text-zinc-200">
                    {getRoleDisplay()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2
                  size={18}
                  className="mt-0.5 text-violet-400"
                />

                <div>
                  <p className="text-xs text-zinc-500">
                    Department
                  </p>

                  <p className="mt-1 text-sm text-zinc-200">
                    {profile?.department ||
                      "Not specified"}
                  </p>
                </div>
              </div>

              {profile?.jobTitle && (
                <div className="flex items-start gap-3">
                  <User
                    size={18}
                    className="mt-0.5 text-violet-400"
                  />

                  <div>
                    <p className="text-xs text-zinc-500">
                      Job Title
                    </p>

                    <p className="mt-1 text-sm text-zinc-200">
                      {profile.jobTitle}
                    </p>
                  </div>
                </div>
              )}

              {profile?.teamSize !== undefined && (
                <div className="flex items-start gap-3">
                  <User
                    size={18}
                    className="mt-0.5 text-violet-400"
                  />

                  <div>
                    <p className="text-xs text-zinc-500">
                      Team Size
                    </p>

                    <p className="mt-1 text-sm text-zinc-200">
                      {profile.teamSize} members
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Edit Form */}
          <section className="rounded-2xl border border-white/10 bg-[#101016] p-6 shadow-2xl md:p-8">
            <div className="mb-8">
              <h2 className="text-lg font-semibold">
                Personal Information
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Update the information that can be changed
                from your profile.
              </p>
            </div>

            {/* Success */}
            {successMessage && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                <CheckCircle2 size={18} />
                {successMessage}
              </div>
            )}

            {/* Error */}
            {errorMessage && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <AlertCircle size={18} />
                {errorMessage}
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {/* Full Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Full Name
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3.5">
                  <User
                    size={18}
                    className="text-zinc-500"
                  />

                  <input
                    type="text"
                    value={profile?.name || ""}
                    disabled
                    className="w-full bg-transparent text-sm text-zinc-400 outline-none"
                  />
                </div>

                <p className="mt-2 text-xs text-zinc-600">
                  Contact the administrator to change
                  your name.
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Email
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3.5">
                  <Mail
                    size={18}
                    className="text-zinc-500"
                  />

                  <input
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="w-full bg-transparent text-sm text-zinc-400 outline-none"
                  />
                </div>

                <p className="mt-2 text-xs text-zinc-600">
                  Email is managed by the organization.
                </p>
              </div>

              {/* Role */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Role
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3.5">
                  <ShieldCheck
                    size={18}
                    className="text-zinc-500"
                  />

                  <input
                    type="text"
                    value={getRoleDisplay()}
                    disabled
                    className="w-full bg-transparent text-sm text-zinc-400 outline-none"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Department
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3.5">
                  <Building2
                    size={18}
                    className="text-zinc-500"
                  />

                  <input
                    type="text"
                    value={
                      profile?.department || ""
                    }
                    disabled
                    className="w-full bg-transparent text-sm text-zinc-400 outline-none"
                  />
                </div>
              </div>

              {/* Employee ID - only if backend provides it */}
              {profile?.employeeId && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Employee ID
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3.5">
                    <User
                      size={18}
                      className="text-zinc-500"
                    />

                    <input
                      type="text"
                      value={profile.employeeId}
                      disabled
                      className="w-full bg-transparent text-sm text-zinc-400 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Phone */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Mobile Number
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0b0b10] px-4 py-3.5 transition focus-within:border-violet-500/50">
                  <Phone
                    size={18}
                    className="text-violet-400"
                  />

                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      handleChange(
                        "phone",
                        event.target.value
                      )
                    }
                    placeholder="Enter mobile number"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Location
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0b0b10] px-4 py-3.5 transition focus-within:border-violet-500/50">
                  <MapPin
                    size={18}
                    className="text-violet-400"
                  />

                  <input
                    type="text"
                    value={form.location}
                    onChange={(event) =>
                      handleChange(
                        "location",
                        event.target.value
                      )
                    }
                    placeholder="Enter location"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                  />
                </div>
              </div>
            </div>

            {/* Security Note */}
            <div className="mt-8 rounded-xl border border-violet-500/10 bg-violet-500/5 p-4">
              <div className="flex gap-3">
                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-violet-400"
                />

                <div>
                  <h3 className="text-sm font-medium text-violet-300">
                    Profile permissions
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Your name, email, role and department
                    are managed by the organization
                    administrator. You can update your
                    mobile number and location here.
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
              <Link
                href="/dashboard/project-manager"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                <ArrowLeft size={16} />
                Cancel
              </Link>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}