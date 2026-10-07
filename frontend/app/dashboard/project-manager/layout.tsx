"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BriefcaseBusiness,
  CheckSquare,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";

export default function ProjectManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard/project-manager",
      icon: LayoutDashboard,
    },
    {
      name: "My Team",
      href: "/dashboard/project-manager/team",
      icon: Users,
    },
    {
      name: "Projects",
      href: "/dashboard/project-manager/projects",
      icon: BriefcaseBusiness,
    },
    {
      name: "Tasks",
      href: "/dashboard/project-manager/tasks",
      icon: CheckSquare,
    },
    {
      name: "Leave Requests",
      href: "/dashboard/project-manager/leave-requests",
      icon: FileText,
    },
  ];

  const managementNavigation = [
    {
      name: "Reports",
      href: "/dashboard/project-manager/reports",
      icon: BarChart3,
    },
    {
      name: "Settings",
      href: "/dashboard/project-manager/settings",
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard/project-manager") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#08080d] text-white">
      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 bg-[#0d0d14]">
        {/* LOGO */}
        <div className="flex h-20 items-center border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 shadow-lg shadow-violet-900/30">
              <BriefcaseBusiness className="h-5 w-5 text-white" />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                WorkSphere
              </h1>

              <p className="text-[11px] text-slate-500">
                Project Manager
              </p>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            Workspace
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-violet-600/15 text-violet-300"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    active
                      ? "text-violet-400"
                      : "text-slate-500 group-hover:text-slate-300"
                  }`}
                />

                <span>{item.name}</span>

                {active && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-violet-400" />
                )}
              </Link>
            );
          })}

          {/* MANAGEMENT */}
          <div className="mt-6 border-t border-white/10 pt-6">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Management
            </p>

            {managementNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-violet-600/15 text-violet-300"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      active
                        ? "text-violet-400"
                        : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  />

                  <span>{item.name}</span>

                  {active && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-violet-400" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* LOGOUT */}
        <div className="border-t border-white/10 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}