"use client";

import {
  LayoutDashboard,
  UserCog,
  UsersRound,
  FolderKanban,
  ClipboardList,
  CalendarCheck,
  FileText,
  Settings,
  LogOut,
  Building2,
  ChevronDown,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Project Managers",
      path: "/dashboard/admin/project-managers",
      icon: UserCog,
    },
    {
      label: "Employees",
      path: "/dashboard/admin/employees",
      icon: UsersRound,
    },
    {
      label: "Projects",
      path: "/dashboard/admin/projects",
      icon: FolderKanban,
    },
    {
      label: "Tasks",
      path: "/dashboard/admin/tasks",
      icon: ClipboardList,
    },
    {
      label: "Leave Requests",
      path: "/dashboard/admin/leave-requests",
      icon: CalendarCheck,
    },
    {
      label: "Reports",
      path: "/dashboard/admin/reports",
      icon: FileText,
    },
    {
      label: "Settings",
      path: "/dashboard/admin/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-[#08050f] text-white">
      {/* FIXED ADMIN SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen border-r border-white/10 bg-[#0d0918] transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* LOGO */}
          <div className="flex h-20 items-center border-b border-white/10 px-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600/20">
              <Building2 className="h-5 w-5 text-violet-400" />
            </div>

            {sidebarOpen && (
              <div className="ml-3">
                <h1 className="text-lg font-bold">
                  Work
                  <span className="text-violet-400">
                    Sphere
                  </span>
                </h1>

                <p className="text-xs text-gray-500">
                  Organization Administration
                </p>
              </div>
            )}
          </div>

          {/* NAVIGATION */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                item.path === "/dashboard/admin"
                  ? pathname === item.path
                  : pathname.startsWith(item.path);

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => router.push(item.path)}
                  title={!sidebarOpen ? item.label : undefined}
                  className={`flex w-full items-center rounded-xl px-3 py-3 transition ${
                    isActive
                      ? "bg-violet-600/15 text-violet-400"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />

                  {sidebarOpen && (
                    <span
                      className={`ml-3 text-sm ${
                        isActive ? "font-medium" : ""
                      }`}
                    >
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* BOTTOM */}
          <div className="border-t border-white/10 p-3">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center rounded-xl px-3 py-3 text-gray-400 transition hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut className="h-5 w-5 shrink-0" />

              {sidebarOpen && (
                <span className="ml-3 text-sm">
                  Logout
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={
                sidebarOpen
                  ? "Collapse sidebar"
                  : "Expand sidebar"
              }
              className="mt-2 flex w-full items-center justify-center rounded-xl border border-white/10 py-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  sidebarOpen
                    ? "rotate-90"
                    : "-rotate-90"
                }`}
              />
            </button>
          </div>
        </div>
      </aside>

      {/* PAGE CONTENT */}
      <main
        className={`min-h-screen transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {children}
      </main>
    </div>
  );
}