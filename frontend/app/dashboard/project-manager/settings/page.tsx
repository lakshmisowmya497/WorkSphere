"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  Eye,
  EyeOff,
  Lock,
  Monitor,
  Save,
  User,
  Globe,
  LogOut,
} from "lucide-react";

interface UserData {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
  jobTitle?: string;
  location?: string;
  status?: string;
}

export default function ProjectManagerSettingsPage() {
  const [user, setUser] = useState<UserData>({});
  const [activeTab, setActiveTab] = useState("account");
  const [saved, setSaved] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [notifications, setNotifications] = useState({
    taskAssignments: true,
    taskSubmissions: true,
    leaveRequests: true,
    projectUpdates: true,
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    compactMode: false,
  });

  useEffect(() => {
    try {
      const stored =
        localStorage.getItem("user") ||
        sessionStorage.getItem("user");

      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Unable to load user", error);
    }
  }, []);

  const saveSettings = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const updatePassword = async () => {
    setPasswordMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage(
        "New password and confirm password do not match."
      );
      return;
    }

    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        setPasswordMessage(
          "Your session has expired. Please login again."
        );
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/auth/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setPasswordMessage(
          data.message || "Unable to change password."
        );
        return;
      }

      setPasswordMessage(
        data.message || "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Change password error:", error);

      setPasswordMessage(
        "Unable to connect to the server. Please try again."
      );
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    window.location.href = "/login";
  };

  return (
    <main className="min-h-screen bg-[#08080d] text-white">
      <header className="border-b border-white/10 bg-[#09090f]">
        <div className="flex min-h-24 items-center justify-between px-8 py-5">
          <div>
            <div className="flex items-center gap-2 text-sm text-violet-400">
              <User className="h-4 w-4" />
              Project Manager
            </div>

            <h1 className="mt-1 text-3xl font-bold">
              Settings
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your account and WorkSphere preferences.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {saved && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
                <Check className="h-4 w-4" />
                Saved
              </div>
            )}

            <button
              onClick={saveSettings}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold hover:bg-violet-500"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-8 py-8">
        <div className="mb-8 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-[#0d0d14] p-2">
          <Tab
            active={activeTab === "account"}
            onClick={() => setActiveTab("account")}
            icon={User}
            text="Account"
          />

          <Tab
            active={activeTab === "security"}
            onClick={() => setActiveTab("security")}
            icon={Lock}
            text="Security"
          />

          <Tab
            active={activeTab === "notifications"}
            onClick={() => setActiveTab("notifications")}
            icon={Bell}
            text="Notifications"
          />

          <Tab
            active={activeTab === "preferences"}
            onClick={() => setActiveTab("preferences")}
            icon={Monitor}
            text="Preferences"
          />
        </div>

        {activeTab === "account" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <section className="rounded-2xl border border-white/10 bg-[#0d0d14] p-6">
              <div className="text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-violet-600/20 text-3xl font-bold text-violet-300 ring-4 ring-violet-600/10">
                  {(user.name || "PM")
                    .split(" ")
                    .map((x) => x[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>

                <h2 className="mt-5 text-xl font-bold">
                  {user.name || "Project Manager"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {user.email || "projectmanager@worksphere.com"}
                </p>

                <span className="mt-4 inline-block rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
                  Project Manager
                </span>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#0d0d14] p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold">
                Profile Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Information associated with your WorkSphere account.
              </p>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <Info
                  label="Full Name"
                  value={user.name || "Priya Reddy"}
                />

                <Info
                  label="Email"
                  value={
                    user.email ||
                    "projectmanager@worksphere.com"
                  }
                />

                <Info
                  label="Phone"
                  value={user.phone || "Not provided"}
                />

                <Info
                  label="Department"
                  value={user.department || "Management"}
                />

                <Info
                  label="Job Title"
                  value={user.jobTitle || "Project Manager"}
                />

                <Info
                  label="Location"
                  value={
                    user.location ||
                    "Bhimavaram, Andhra Pradesh"
                  }
                />
              </div>
            </section>
          </div>
        )}

        {activeTab === "security" && (
          <section className="max-w-3xl rounded-2xl border border-white/10 bg-[#0d0d14] p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-500/10 p-3">
                <Lock className="h-5 w-5 text-violet-400" />
              </div>

              <div>
                <h2 className="font-semibold">
                  Change Password
                </h2>

                <p className="text-sm text-slate-500">
                  Keep your Project Manager account secure.
                </p>
              </div>
            </div>

            <div className="mt-7 space-y-5">
              <Password
                label="Current Password"
                value={currentPassword}
                setValue={setCurrentPassword}
                visible={showCurrent}
                setVisible={setShowCurrent}
              />

              <Password
                label="New Password"
                value={newPassword}
                setValue={setNewPassword}
                visible={showNew}
                setVisible={setShowNew}
              />

              <Password
                label="Confirm New Password"
                value={confirmPassword}
                setValue={setConfirmPassword}
                visible={showConfirm}
                setVisible={setShowConfirm}
              />

              {passwordMessage && (
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-300">
                  {passwordMessage}
                </div>
              )}

              <button
                onClick={updatePassword}
                className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold hover:bg-violet-500"
              >
                Update Password
              </button>
            </div>
          </section>
        )}

        {activeTab === "notifications" && (
          <section className="rounded-2xl border border-white/10 bg-[#0d0d14] p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-500/10 p-3">
                <Bell className="h-5 w-5 text-violet-400" />
              </div>

              <div>
                <h2 className="font-semibold">
                  Notification Preferences
                </h2>

                <p className="text-sm text-slate-500">
                  Control the notifications you receive as a Project Manager.
                </p>
              </div>
            </div>

            <div className="mt-6 divide-y divide-white/10">
              <Notification
                title="Task Assignments"
                description="Notifications when tasks are assigned or reassigned."
                enabled={notifications.taskAssignments}
                onClick={() =>
                  setNotifications({
                    ...notifications,
                    taskAssignments:
                      !notifications.taskAssignments,
                  })
                }
              />

              <Notification
                title="Task Submissions"
                description="Notifications when employees submit completed work."
                enabled={notifications.taskSubmissions}
                onClick={() =>
                  setNotifications({
                    ...notifications,
                    taskSubmissions:
                      !notifications.taskSubmissions,
                  })
                }
              />

              <Notification
                title="Leave Requests"
                description="Notifications when team members request leave."
                enabled={notifications.leaveRequests}
                onClick={() =>
                  setNotifications({
                    ...notifications,
                    leaveRequests:
                      !notifications.leaveRequests,
                  })
                }
              />

              <Notification
                title="Project Updates"
                description="Notifications about project progress and status."
                enabled={notifications.projectUpdates}
                onClick={() =>
                  setNotifications({
                    ...notifications,
                    projectUpdates:
                      !notifications.projectUpdates,
                  })
                }
              />
            </div>
          </section>
        )}

        {activeTab === "preferences" && (
          <section className="rounded-2xl border border-white/10 bg-[#0d0d14] p-6">
            <h2 className="text-lg font-semibold">
              Preferences
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Customize your WorkSphere workspace.
            </p>

            <div className="mt-6 space-y-4">
              <Preference
                icon={Bell}
                title="Email Notifications"
                description="Receive important updates through email."
                enabled={preferences.emailNotifications}
                onClick={() =>
                  setPreferences({
                    ...preferences,
                    emailNotifications:
                      !preferences.emailNotifications,
                  })
                }
              />

              <Preference
                icon={Monitor}
                title="Compact Mode"
                description="Use a compact layout for dashboard information."
                enabled={preferences.compactMode}
                onClick={() =>
                  setPreferences({
                    ...preferences,
                    compactMode:
                      !preferences.compactMode,
                  })
                }
              />
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <SelectField
                label="Time Zone"
                options={[
                  "(GMT+05:30) India Standard Time",
                  "(GMT+00:00) UTC",
                ]}
              />

              <SelectField
                label="Date Format"
                options={[
                  "DD MMM YYYY",
                  "MM/DD/YYYY",
                  "YYYY-MM-DD",
                ]}
              />
            </div>
          </section>
        )}

        <section className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-6">
          <div className="flex items-center justify-between gap-5">
            <div>
              <h2 className="font-semibold text-red-400">
                Account
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Sign out from this Project Manager session.
              </p>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-xl border border-red-500/30 px-5 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

function Tab({
  active,
  onClick,
  icon: Icon,
  text,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  text: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium ${
        active
          ? "bg-violet-600 text-white"
          : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4" />
      {text}
    </button>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <div className="rounded-xl border border-white/10 bg-[#08080d] px-4 py-3 text-sm text-slate-200">
        {value}
      </div>
    </div>
  );
}

function Password({
  label,
  value,
  setValue,
  visible,
  setVisible,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  visible: boolean;
  setVisible: (value: boolean) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-400">
        {label}
      </label>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#08080d] px-4 py-3 pr-12 text-sm text-white outline-none focus:border-violet-500"
        />

        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

function Notification({
  title,
  description,
  enabled,
  onClick,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-5">
      <div>
        <h3 className="font-medium">{title}</h3>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <Toggle enabled={enabled} onClick={onClick} />
    </div>
  );
}

function Preference({
  icon: Icon,
  title,
  description,
  enabled,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#08080d] p-4">
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-violet-500/10 p-2">
          <Icon className="h-5 w-5 text-violet-400" />
        </div>

        <div>
          <h3 className="font-medium">{title}</h3>

          <p className="text-sm text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <Toggle enabled={enabled} onClick={onClick} />
    </div>
  );
}

function Toggle({
  enabled,
  onClick,
}: {
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative h-6 w-11 shrink-0 rounded-full ${
        enabled ? "bg-violet-600" : "bg-slate-700"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
          enabled ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

function SelectField({
  label,
  options,
}: {
  label: string;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-400">
        {label}
      </label>

      <select className="w-full rounded-xl border border-white/10 bg-[#08080d] px-4 py-3 text-sm text-white outline-none focus:border-violet-500">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}