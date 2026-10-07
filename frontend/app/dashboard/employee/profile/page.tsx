"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  Building2,
  Save,
  Loader2,
} from "lucide-react";

type EmployeeProfile = {
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

  projectManager?: {
    _id?: string;
    name?: string;
    email?: string;
  } | null;
};

const API_BASE = "http://127.0.0.1:5000/api";

export default function EmployeeProfilePage() {
  const [profile, setProfile] =
    useState<EmployeeProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [location, setLocation] =
    useState("");

  // =========================================================
  // INITIALS
  // =========================================================

  const getInitials = (name?: string) => {
    if (!name) {
      return "E";
    }

    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // =========================================================
  // LOAD PROFILE
  // =========================================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          sessionStorage.getItem("token");

        if (!token) {
          window.location.href = "/login";
          return;
        }

        // -----------------------------------------------------
        // FIRST LOAD STORED USER
        // -----------------------------------------------------

        try {
          const storedUser =
            localStorage.getItem("user");

          if (storedUser) {
            const parsedUser =
              JSON.parse(
                storedUser
              ) as EmployeeProfile;

            setProfile(parsedUser);

            setPhone(
              parsedUser.phone || ""
            );

            setLocation(
              parsedUser.location || ""
            );
          }
        } catch (storageError) {
          console.log(
            "Unable to read stored employee:",
            storageError
          );
        }

        // -----------------------------------------------------
        // LOAD REAL PROFILE
        // -----------------------------------------------------

        const response = await fetch(
          `${API_BASE}/employees/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load employee profile"
          );
        }

        const employee =
          data.employee ||
          data.user ||
          data.profile ||
          null;

        if (!employee) {
          throw new Error(
            "Employee profile not found"
          );
        }

        setProfile(employee);

        setPhone(
          employee.phone || ""
        );

        setLocation(
          employee.location || ""
        );

        // -----------------------------------------------------
        // UPDATE LOCAL STORAGE
        // -----------------------------------------------------

        try {
          localStorage.setItem(
            "user",
            JSON.stringify(employee)
          );
        } catch {
          // Ignore storage errors
        }

      } catch (err) {
        console.error(
          "Employee profile error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load employee profile"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // =========================================================
  // SAVE PROFILE
  // =========================================================

  const handleSave = async () => {
    setMessage("");
    setError("");

    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      setSaving(true);

      const response = await fetch(
        `${API_BASE}/employees/me`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            phone,
            location,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update profile"
        );
      }

      const updatedEmployee =
        data.employee ||
        data.user ||
        data.profile ||
        data;

      setProfile(
        updatedEmployee
      );

      setPhone(
        updatedEmployee.phone ||
          phone
      );

      setLocation(
        updatedEmployee.location ||
          location
      );

      try {
        localStorage.setItem(
          "user",
          JSON.stringify(
            updatedEmployee
          )
        );
      } catch {
        // Ignore storage errors
      }

      setMessage(
        "Profile updated successfully."
      );

    } catch (err) {
      console.error(
        "Update profile error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08080d] text-white">

        <div className="text-center">

          <Loader2 className="mx-auto h-8 w-8 animate-spin text-violet-400" />

          <p className="mt-4 text-sm text-slate-400">
            Loading your profile...
          </p>

        </div>

      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-[#08080d] text-white">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-[#09090f]/95 px-8 backdrop-blur">

        <div>

          <p className="text-xs uppercase tracking-[0.18em] text-slate-600">
            Employee Workspace
          </p>

          <h1 className="mt-1 text-lg font-semibold">
            My Profile
          </h1>

        </div>

        <div className="flex items-center gap-3">

          <div className="hidden text-right sm:block">

            <p className="text-sm font-semibold">
              {profile?.name ||
                "Employee"}
            </p>

            <p className="text-xs text-slate-500">
              {profile?.role ===
              "employee"
                ? "Employee"
                : profile?.role ||
                  "Employee"}
            </p>

          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-sm font-bold text-violet-300">
            {getInitials(
              profile?.name
            )}
          </div>

        </div>

      </header>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="p-8">

        {/* BACK */}

        <Link
          href="/dashboard/employee"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* ===================================================
            TITLE
        ==================================================== */}

        <div className="mb-8">

          <h2 className="text-3xl font-bold">
            My Profile
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            View and manage your employee
            profile information.
          </p>

        </div>

        {/* ===================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* ===================================================
            SUCCESS
        ==================================================== */}

        {message && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">

            <CheckCircle2 className="h-4 w-4" />

            {message}

          </div>
        )}

        {/* ===================================================
            PROFILE HEADER CARD
        ==================================================== */}

        <div className="mb-6 rounded-2xl border border-white/10 bg-[#11111a] p-6">

          <div className="flex flex-col gap-6 md:flex-row md:items-center">

            {/* AVATAR */}

            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-violet-600/15 text-3xl font-bold text-violet-300 ring-1 ring-violet-500/20">

              {getInitials(
                profile?.name
              )}

            </div>

            {/* NAME */}

            <div className="flex-1">

              <div className="flex flex-wrap items-center gap-3">

                <h3 className="text-2xl font-bold">
                  {profile?.name ||
                    "Employee"}
                </h3>

                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">

                  {profile?.status ||
                    "active"}

                </span>

              </div>

              <p className="mt-2 text-sm text-slate-400">
                {profile?.jobTitle ||
                  "Employee"}
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {profile?.department ||
                  "Department"}
              </p>

            </div>

          </div>

        </div>

        {/* ===================================================
            INFORMATION GRID
        ==================================================== */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* =================================================
              PERSONAL INFORMATION
          ================================================== */}

          <div className="rounded-2xl border border-white/10 bg-[#11111a] p-6">

            <div className="mb-6 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">

                <User className="h-5 w-5" />

              </div>

              <div>

                <h3 className="font-semibold">
                  Personal Information
                </h3>

                <p className="text-xs text-slate-600">
                  Your basic employee details
                </p>

              </div>

            </div>

            <div className="space-y-5">

              {/* NAME */}

              <div>

                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-600">
                  Full Name
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">

                  <User className="h-4 w-4 text-slate-600" />

                  <span className="text-sm text-slate-200">
                    {profile?.name ||
                      "-"}
                  </span>

                </div>

              </div>

              {/* EMAIL */}

              <div>

                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-600">
                  Email Address
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">

                  <Mail className="h-4 w-4 text-slate-600" />

                  <span className="break-all text-sm text-slate-200">
                    {profile?.email ||
                      "-"}
                  </span>

                </div>

              </div>

              {/* PHONE */}

              <div>

                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-600">
                  Phone Number
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">

                  <Phone className="h-4 w-4 text-slate-600" />

                  <input
                    type="text"
                    value={phone}
                    onChange={(event) =>
                      setPhone(
                        event.target.value
                      )
                    }
                    placeholder="Enter phone number"
                    className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-700"
                  />

                </div>

              </div>

              {/* LOCATION */}

              <div>

                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-600">
                  Location
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">

                  <MapPin className="h-4 w-4 text-slate-600" />

                  <input
                    type="text"
                    value={location}
                    onChange={(event) =>
                      setLocation(
                        event.target.value
                      )
                    }
                    placeholder="Enter location"
                    className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-700"
                  />

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              WORK INFORMATION
          ================================================== */}

          <div className="rounded-2xl border border-white/10 bg-[#11111a] p-6">

            <div className="mb-6 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">

                <BriefcaseBusiness className="h-5 w-5" />

              </div>

              <div>

                <h3 className="font-semibold">
                  Work Information
                </h3>

                <p className="text-xs text-slate-600">
                  Your role and organization details
                </p>

              </div>

            </div>

            <div className="space-y-5">

              {/* ROLE */}

              <div>

                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-600">
                  Role
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">

                  <ShieldCheck className="h-4 w-4 text-violet-400" />

                  <span className="text-sm capitalize text-slate-200">
                    {profile?.role ===
                    "employee"
                      ? "Employee"
                      : profile?.role ||
                        "Employee"}
                  </span>

                </div>

              </div>

              {/* JOB TITLE */}

              <div>

                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-600">
                  Job Title
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">

                  <BriefcaseBusiness className="h-4 w-4 text-slate-600" />

                  <span className="text-sm text-slate-200">
                    {profile?.jobTitle ||
                      "-"}
                  </span>

                </div>

              </div>

              {/* DEPARTMENT */}

              <div>

                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-600">
                  Department
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">

                  <Building2 className="h-4 w-4 text-slate-600" />

                  <span className="text-sm text-slate-200">
                    {profile?.department ||
                      "-"}
                  </span>

                </div>

              </div>

              {/* PROJECT MANAGER */}

              <div>

                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-600">
                  Project Manager
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">

                  <User className="h-4 w-4 text-slate-600" />

                  <span className="text-sm text-slate-200">

                    {profile
                      ?.projectManager
                      ?.name ||
                      "Not assigned"}

                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ===================================================
            SAVE
        ==================================================== */}

        <div className="mt-6 flex justify-end">

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}

          </button>

        </div>

      </div>

    </div>
  );
}