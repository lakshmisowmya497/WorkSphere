"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCog,
  FolderKanban,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  AlertCircle,
  MoreHorizontal,
  LogOut,
  ChevronRight,
  BriefcaseBusiness,
} from "lucide-react";
import { useState } from "react";

const stats = [
  {
    title: "Total Employees",
    value: "128",
    change: "+12%",
    icon: Users,
  },
  {
    title: "Project Managers",
    value: "12",
    change: "+2",
    icon: UserCog,
  },
  {
    title: "Active Projects",
    value: "24",
    change: "+5%",
    icon: FolderKanban,
  },
  {
    title: "Departments",
    value: "8",
    change: "+1",
    icon: Building2,
  },
];

const projects = [
  {
    name: "WorkSphere Platform",
    manager: "Rahul Sharma",
    team: "5 Members",
    progress: 78,
    status: "On Track",
  },
  {
    name: "Transit Shield",
    manager: "Ananya Reddy",
    team: "5 Members",
    progress: 62,
    status: "On Track",
  },
  {
    name: "AI Traffic System",
    manager: "Vikram Kumar",
    team: "5 Members",
    progress: 45,
    status: "In Progress",
  },
  {
    name: "Student Activity Portal",
    manager: "Priya Singh",
    team: "5 Members",
    progress: 31,
    status: "Needs Attention",
  },
];

const activities = [
  {
    title: "New Project Manager added",
    description: "Ananya Reddy was added as Project Manager",
    time: "10 min ago",
    icon: UserCog,
  },
  {
    title: "Project created",
    description: "Transit Shield project was created",
    time: "1 hour ago",
    icon: FolderKanban,
  },
  {
    title: "Employee registered",
    description: "A new employee joined the organization",
    time: "2 hours ago",
    icon: Users,
  },
  {
    title: "Project completed",
    description: "Website Redesign was marked completed",
    time: "Yesterday",
    icon: CheckCircle2,
  },
];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <main className="min-h-screen bg-[#050509] text-white">

      {/* Background glow */}
      <div className="fixed top-0 left-1/3 w-96 h-96 bg-violet-600/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 border-r border-white/10 bg-[#08080d] transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >

        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">

          <Link
            href="/"
            className="text-2xl font-bold tracking-tight"
          >
            Work<span className="text-violet-500">Sphere</span>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X size={22} />
          </button>

        </div>

        {/* Admin Profile */}
        <div className="px-5 py-6">

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10">

            <div className="w-11 h-11 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <UserCog
                size={21}
                className="text-violet-400"
              />
            </div>

            <div className="min-w-0">
              <p className="font-semibold truncate">
                Organization Admin
              </p>

              <p className="text-xs text-gray-500 truncate">
                admin@worksphere.com
              </p>
            </div>

          </div>

        </div>

        {/* Navigation */}
        <nav className="px-4 space-y-1">

          <p className="px-3 mb-3 text-[11px] uppercase tracking-widest text-gray-600">
            Workspace
          </p>

          {/* Dashboard */}
          <Link
            href="/dashboard/admin"
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm bg-violet-600/15 text-violet-400 border border-violet-500/20"
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>

            <ChevronRight
              size={16}
              className="ml-auto"
            />
          </Link>

          {/* Organization */}
          <Link
            href="/dashboard/admin/organization"
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <Building2 size={19} />
            <span>Organization</span>
          </Link>

          {/* Project Managers */}
          <Link
            href="/dashboard/admin/project-managers"
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <UserCog size={19} />
            <span>Project Managers</span>
          </Link>

          {/* Employees */}
          <Link
            href="/dashboard/admin/employees"
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <Users size={19} />
            <span>Employees</span>
          </Link>

          {/* Projects */}
          <Link
            href="/dashboard/admin/projects"
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <FolderKanban size={19} />
            <span>Projects</span>
          </Link>

          {/* Settings */}
          <Link
            href="/dashboard/admin/settings"
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <Settings size={19} />
            <span>Settings</span>
          </Link>

        </nav>

        {/* Logout */}
        <div className="absolute bottom-5 left-4 right-4">

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <LogOut size={19} />
            Logout
          </button>

        </div>

      </aside>

      {/* ================= MAIN ================= */}
      <div className="lg:ml-72">

        {/* Topbar */}
        <header className="h-20 border-b border-white/10 bg-[#050509]/80 backdrop-blur-xl sticky top-0 z-30">

          <div className="h-full px-5 lg:px-8 flex items-center justify-between">

            <div className="flex items-center gap-4">

              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <Menu size={23} />
              </button>

              <div>
                <h1 className="text-lg font-semibold">
                  Dashboard
                </h1>

                <p className="text-xs text-gray-500 hidden sm:block">
                  Manage your organization from one place
                </p>
              </div>

            </div>

            <div className="flex items-center gap-3">

              {/* Search */}
              <button className="hidden sm:flex w-10 h-10 rounded-xl border border-white/10 items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.04]">
                <Search size={19} />
              </button>

              {/* Notification */}
              <button className="relative w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.04]">
                <Bell size={19} />

                <span className="absolute top-2 right-2 w-2 h-2 bg-violet-500 rounded-full" />
              </button>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center">
                <UserCog
                  size={18}
                  className="text-violet-400"
                />
              </div>

            </div>

          </div>

        </header>

        {/* ================= CONTENT ================= */}
        <section className="p-5 lg:p-8 max-w-[1600px] mx-auto">

          {/* Welcome */}
          <div className="mb-8">

            <p className="text-sm text-violet-400 mb-2">
              Organization Overview
            </p>

            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              Welcome back, Admin
            </h2>

            <p className="text-gray-500 mt-2">
              Here's what's happening across your organization.
            </p>

          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">

            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="group border border-white/10 bg-[#09090f]/80 rounded-2xl p-5 hover:border-violet-500/30 transition-all"
                >

                  <div className="flex items-start justify-between">

                    <div className="w-11 h-11 rounded-xl bg-violet-600/10 flex items-center justify-center">
                      <Icon
                        size={21}
                        className="text-violet-400"
                      />
                    </div>

                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                      {stat.change}
                    </span>

                  </div>

                  <p className="text-gray-500 text-sm mt-5">
                    {stat.title}
                  </p>

                  <h3 className="text-3xl font-bold mt-1">
                    {stat.value}
                  </h3>

                </div>
              );
            })}

          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Projects */}
            <div className="xl:col-span-2 border border-white/10 bg-[#09090f]/80 rounded-2xl overflow-hidden">

              <div className="p-5 border-b border-white/10 flex items-center justify-between">

                <div>
                  <h3 className="font-semibold text-lg">
                    Active Projects
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Projects currently managed by your organization
                  </p>
                </div>

                <Link
                  href="/dashboard/admin/projects"
                  className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300"
                >
                  View All
                  <ArrowUpRight size={16} />
                </Link>

              </div>

              <div className="divide-y divide-white/[0.06]">

                {projects.map((project) => (

                  <div
                    key={project.name}
                    className="p-5 hover:bg-white/[0.02] transition-colors"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex items-start gap-3">

                        <div className="w-10 h-10 rounded-xl bg-violet-600/10 flex items-center justify-center shrink-0">
                          <BriefcaseBusiness
                            size={18}
                            className="text-violet-400"
                          />
                        </div>

                        <div>
                          <h4 className="font-medium">
                            {project.name}
                          </h4>

                          <p className="text-xs text-gray-500 mt-1">
                            Manager: {project.manager}
                          </p>

                          <p className="text-xs text-gray-600 mt-1">
                            {project.team}
                          </p>
                        </div>

                      </div>

                      <button className="text-gray-500 hover:text-white">
                        <MoreHorizontal size={19} />
                      </button>

                    </div>

                    <div className="mt-4">

                      <div className="flex items-center justify-between mb-2">

                        <span className="text-xs text-gray-500">
                          Progress
                        </span>

                        <span className="text-xs font-medium">
                          {project.progress}%
                        </span>

                      </div>

                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">

                        <div
                          className="h-full bg-violet-500 rounded-full"
                          style={{
                            width: `${project.progress}%`,
                          }}
                        />

                      </div>

                    </div>

                    <div className="mt-4 flex items-center">

                      {project.status === "Needs Attention" ? (
                        <span className="flex items-center gap-1.5 text-xs text-amber-400">
                          <AlertCircle size={14} />
                          {project.status}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <CheckCircle2 size={14} />
                          {project.status}
                        </span>
                      )}

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* Recent Activity */}
            <div className="border border-white/10 bg-[#09090f]/80 rounded-2xl overflow-hidden">

              <div className="p-5 border-b border-white/10">

                <h3 className="font-semibold text-lg">
                  Recent Activity
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Latest organization updates
                </p>

              </div>

              <div className="p-5 space-y-6">

                {activities.map((activity) => {
                  const Icon = activity.icon;

                  return (
                    <div
                      key={activity.title}
                      className="flex gap-3"
                    >

                      <div className="w-9 h-9 rounded-lg bg-violet-600/10 flex items-center justify-center shrink-0">
                        <Icon
                          size={17}
                          className="text-violet-400"
                        />
                      </div>

                      <div className="min-w-0">

                        <p className="text-sm font-medium">
                          {activity.title}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {activity.description}
                        </p>

                        <p className="flex items-center gap-1 text-[11px] text-gray-600 mt-2">
                          <Clock3 size={12} />
                          {activity.time}
                        </p>

                      </div>

                    </div>
                  );
                })}

              </div>

            </div>

          </div>

          {/* ================= QUICK ACTIONS ================= */}
          <div className="mt-6 border border-white/10 bg-[#09090f]/80 rounded-2xl p-5">

            <div className="flex items-center justify-between mb-5">

              <div>
                <h3 className="font-semibold text-lg">
                  Quick Actions
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Frequently used administration actions
                </p>
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

              {/* Add Project */}
              <Link
                href="/dashboard/admin/projects/add"
                className="flex items-center gap-3 p-4 rounded-xl border border-white/10 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all text-left"
              >

                <div className="w-10 h-10 rounded-lg bg-violet-600/10 flex items-center justify-center">
                  <Plus
                    size={19}
                    className="text-violet-400"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Add Project
                  </p>

                  <p className="text-xs text-gray-600">
                    Create new project
                  </p>
                </div>

              </Link>

              {/* Add Manager */}
              <Link
                href="/dashboard/admin/project-managers/add"
                className="flex items-center gap-3 p-4 rounded-xl border border-white/10 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all text-left"
              >

                <div className="w-10 h-10 rounded-lg bg-violet-600/10 flex items-center justify-center">
                  <UserCog
                    size={19}
                    className="text-violet-400"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Add Manager
                  </p>

                  <p className="text-xs text-gray-600">
                    Add project manager
                  </p>
                </div>

              </Link>

              {/* View Employees */}
              <Link
                href="/dashboard/admin/employees"
                className="flex items-center gap-3 p-4 rounded-xl border border-white/10 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all text-left"
              >

                <div className="w-10 h-10 rounded-lg bg-violet-600/10 flex items-center justify-center">
                  <Users
                    size={19}
                    className="text-violet-400"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    View Employees
                  </p>

                  <p className="text-xs text-gray-600">
                    Manage employees
                  </p>
                </div>

              </Link>

              {/* Organization */}
              <Link
                href="/dashboard/admin/organization"
                className="flex items-center gap-3 p-4 rounded-xl border border-white/10 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all text-left"
              >

                <div className="w-10 h-10 rounded-lg bg-violet-600/10 flex items-center justify-center">
                  <Building2
                    size={19}
                    className="text-violet-400"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Organization
                  </p>

                  <p className="text-xs text-gray-600">
                    Manage organization
                  </p>
                </div>

              </Link>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}