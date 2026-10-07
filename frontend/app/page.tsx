"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowRight,
  Users,
  ClipboardCheck,
  CalendarDays,
  BarChart3,
  CheckCircle2,
  Menu,
  X,
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  ShieldCheck,
  UserRound,
  Clock3,
  Activity,
  ChevronRight,
  Sparkles,
  Building2,
  Target,
  Zap,
  Mail,
} from "lucide-react";

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 35,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

const fadeLeft = {
  hidden: {
    opacity: 0,
    x: -45,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const fadeRight = {
  hidden: {
    opacity: 0,
    x: 45,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const features = [
  {
    icon: Users,
    title: "Team Management",
    description:
      "Organize project teams, manage members and keep responsibilities clearly defined.",
  },
  {
    icon: FolderKanban,
    title: "Project Management",
    description:
      "Create projects, assign managers and monitor project progress from one workspace.",
  },
  {
    icon: ListTodo,
    title: "Smart Task Tracking",
    description:
      "Assign tasks, track progress, submit work and manage completion through a clear workflow.",
  },
  {
    icon: CalendarDays,
    title: "Leave Management",
    description:
      "Employees can request leave while managers and admins handle approvals efficiently.",
  },
  {
    icon: BarChart3,
    title: "Reports & Insights",
    description:
      "Get a clear view of projects, tasks, teams and organizational performance.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    description:
      "Separate permissions for Admins, Project Managers and Employees keep workflows secure.",
  },
];

const workflow = [
  {
    number: "01",
    icon: Building2,
    title: "Admin",
    description:
      "Manage the organization, project managers, employees, projects and overall operations.",
  },
  {
    number: "02",
    icon: Users,
    title: "Project Manager",
    description:
      "Manage teams, create tasks, assign work and review employee submissions.",
  },
  {
    number: "03",
    icon: UserRound,
    title: "Employee",
    description:
      "Work on assigned tasks, submit evidence, request leave and track progress.",
  },
  {
    number: "04",
    icon: BarChart3,
    title: "Track Progress",
    description:
      "Turn daily work into measurable project and team progress.",
  },
];

const stats = [
  {
    value: "01",
    label: "Connected Workspace",
  },
  {
    value: "03",
    label: "Role-Based Dashboards",
  },
  {
    value: "24/7",
    label: "Work Visibility",
  },
  {
    value: "100%",
    label: "Centralized Workflow",
  },
];

export default function Home() {
  const [mobileMenu, setMobileMenu] = useState(false);

  const closeMenu = () => {
    setMobileMenu(false);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050509] text-white selection:bg-violet-500/30">
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
          scroll-padding-top: 88px;
        }

        body {
          margin: 0;
          background: #050509;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>

      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.07] bg-[#050509]/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          {/* Logo */}
          <Link
            href="#home"
            onClick={closeMenu}
            className="group flex items-center gap-3"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 shadow-lg shadow-violet-600/20 transition-all duration-300 group-hover:scale-105 group-hover:bg-violet-500">
              <LayoutDashboard size={20} />
              <span className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
            </div>

            <div>
              <span className="text-xl font-bold tracking-tight">
                Work<span className="text-violet-400">Sphere</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-9 md:flex">
            <a
              href="#home"
              className="text-sm font-medium text-gray-300 transition hover:text-white"
            >
              Home
            </a>

            <a
              href="#about"
              className="text-sm font-medium text-gray-400 transition hover:text-violet-400"
            >
              About
            </a>

            <a
              href="#features"
              className="text-sm font-medium text-gray-400 transition hover:text-violet-400"
            >
              Features
            </a>

            <a
              href="#workflow"
              className="text-sm font-medium text-gray-400 transition hover:text-violet-400"
            >
              Workflow
            </a>

            <a
              href="#contact"
              className="text-sm font-medium text-gray-400 transition hover:text-violet-400"
            >
              Contact
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-gray-200 transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:bg-violet-500 hover:shadow-violet-900/40"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="rounded-xl border border-white/10 p-2.5 text-gray-300 transition hover:border-violet-500/40 hover:bg-white/5 md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="border-t border-white/[0.07] bg-[#08080e]/95 px-5 py-5 backdrop-blur-xl md:hidden">
            <nav className="flex flex-col gap-2">
              <a
                href="#home"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-gray-300 transition hover:bg-white/5 hover:text-white"
              >
                Home
              </a>

              <a
                href="#about"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-gray-300 transition hover:bg-white/5 hover:text-white"
              >
                About
              </a>

              <a
                href="#features"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-gray-300 transition hover:bg-white/5 hover:text-white"
              >
                Features
              </a>

              <a
                href="#workflow"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-gray-300 transition hover:bg-white/5 hover:text-white"
              >
                Workflow
              </a>

              <a
                href="#contact"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-gray-300 transition hover:bg-white/5 hover:text-white"
              >
                Contact
              </a>

              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="rounded-xl border border-violet-500/40 py-3 text-center text-sm font-semibold text-violet-300"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="rounded-xl bg-violet-600 py-3 text-center text-sm font-semibold text-white"
                >
                  Get Started
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* =========================================================
          HERO
      ========================================================= */}

      <section
        id="home"
        className="relative flex min-h-screen items-center overflow-hidden pt-20"
      >
        {/* Background Effects */}
        <div className="pointer-events-none absolute left-[-180px] top-[15%] h-[500px] w-[500px] rounded-full bg-violet-700/10 blur-[140px]" />

        <div className="pointer-events-none absolute right-[-180px] top-[30%] h-[500px] w-[500px] rounded-full bg-indigo-700/10 blur-[140px]" />

        <div className="pointer-events-none absolute left-1/2 top-[20%] h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-violet-500/[0.05] blur-[100px]" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-16 px-5 py-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-28">
          {/* Hero Content */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            animate="visible"
          >
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/[0.08] px-4 py-2 text-sm text-violet-300">
              <Sparkles size={15} />
              Smart Workplace Management
            </div>

            <h1 className="max-w-3xl text-5xl font-bold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-[76px]">
              One workspace.
              <br />
              <span className="bg-gradient-to-r from-violet-300 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Every team.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-gray-400 sm:text-xl">
              WorkSphere connects people, projects, tasks and everyday
              workflows into one intelligent workspace built for modern teams.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="group flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 font-semibold shadow-xl shadow-violet-950/30 transition hover:bg-violet-500"
              >
                Enter WorkSphere
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <a
                href="#features"
                className="group flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3.5 font-semibold text-gray-200 transition hover:border-violet-500/40 hover:bg-violet-500/[0.08]"
              >
                Explore Features
                <ChevronRight
                  size={17}
                  className="text-gray-500 transition group-hover:translate-x-1 group-hover:text-violet-400"
                />
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-violet-400" />
                Role-based access
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-violet-400" />
                Real-time workflow
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-violet-400" />
                Centralized workspace
              </div>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            variants={fadeRight}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            <div className="absolute -inset-5 rounded-[30px] bg-violet-600/[0.08] blur-3xl" />

            <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0a0a11] p-3 shadow-2xl shadow-violet-950/30">
              {/* Browser Bar */}
              <div className="flex items-center justify-between border-b border-white/[0.07] px-3 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
                </div>

                <div className="h-2 w-32 rounded-full bg-white/[0.06]" />

                <div className="w-10" />
              </div>

              <div className="grid grid-cols-[68px_1fr] gap-3 p-2">
                {/* Mini Sidebar */}
                <div className="rounded-xl border border-white/[0.06] bg-[#07070c] p-2.5">
                  <div className="mb-7 flex justify-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 shadow-lg shadow-violet-900/30">
                      <LayoutDashboard size={17} />
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="mx-auto h-2 w-8 rounded-full bg-violet-500" />
                    <div className="mx-auto h-2 w-8 rounded-full bg-white/10" />
                    <div className="mx-auto h-2 w-8 rounded-full bg-white/10" />
                    <div className="mx-auto h-2 w-8 rounded-full bg-white/10" />
                    <div className="mx-auto h-2 w-8 rounded-full bg-white/10" />
                    <div className="mx-auto h-2 w-8 rounded-full bg-white/10" />
                  </div>
                </div>

                {/* Dashboard */}
                <div className="min-w-0">
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="h-4 w-32 rounded bg-white/10" />
                        <div className="mt-2 h-2 w-48 rounded bg-white/[0.05]" />
                      </div>

                      <div className="h-8 w-8 rounded-lg bg-violet-500/10" />
                    </div>
                  </div>

                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-xl border border-white/[0.07] bg-[#101018] p-3.5">
                      <div className="mb-3 flex items-center justify-between">
                        <FolderKanban
                          size={18}
                          className="text-violet-400"
                        />
                        <span className="text-[10px] text-green-400">
                          Active
                        </span>
                      </div>

                      <div className="text-2xl font-bold">24</div>
                      <div className="mt-1 text-[10px] text-gray-500">
                        Projects
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/[0.07] bg-[#101018] p-3.5">
                      <div className="mb-3 flex items-center justify-between">
                        <Users size={18} className="text-violet-400" />
                        <span className="text-[10px] text-green-400">
                          +8%
                        </span>
                      </div>

                      <div className="text-2xl font-bold">128</div>
                      <div className="mt-1 text-[10px] text-gray-500">
                        Team Members
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mt-2.5 rounded-xl border border-white/[0.07] bg-[#101018] p-4">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-white">
                          Project Progress
                        </p>
                        <p className="mt-1 text-[10px] text-gray-500">
                          Weekly overview
                        </p>
                      </div>

                      <BarChart3
                        size={18}
                        className="text-violet-400"
                      />
                    </div>

                    <div className="flex h-28 items-end gap-2">
                      {[42, 55, 38, 68, 58, 78, 66, 92].map(
                        (height, index) => (
                          <motion.div
                            key={index}
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{
                              duration: 0.8,
                              delay: 0.4 + index * 0.07,
                            }}
                            className="flex-1 rounded-t-md bg-gradient-to-t from-violet-700/40 to-violet-400/70"
                          />
                        )
                      )}
                    </div>

                    <div className="mt-3 flex justify-between text-[9px] text-gray-600">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>

                  {/* Activity */}
                  <div className="mt-2.5 rounded-xl border border-white/[0.07] bg-[#101018] p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Activity size={15} className="text-violet-400" />
                      <span className="text-xs font-semibold">
                        Recent Activity
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        "Task submitted for review",
                        "New project assigned",
                        "Leave request approved",
                      ].map((item, index) => (
                        <div
                          key={item}
                          className="flex items-center gap-2.5"
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              index === 0
                                ? "bg-violet-400"
                                : "bg-gray-600"
                            }`}
                          />
                          <span className="text-[10px] text-gray-500">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating notification */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-violet-500/20 bg-[#11111a] p-4 shadow-2xl shadow-violet-950/30 sm:block"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                  <CheckCircle2
                    size={20}
                    className="text-green-400"
                  />
                </div>

                <div>
                  <p className="text-[10px] text-gray-500">
                    Workflow update
                  </p>
                  <p className="text-sm font-semibold text-white">
                    Task approved
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================
          ABOUT
      ========================================================= */}

      <section
        id="about"
        className="scroll-mt-20 border-t border-white/[0.06] bg-[#08080e] py-28"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]"
          >
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
                About WorkSphere
              </p>

              <h2 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                Turn everyday work into
                <span className="text-violet-400">
                  {" "}
                  visible progress.
                </span>
              </h2>
            </div>

            <div>
              <p className="text-lg leading-8 text-gray-400">
                WorkSphere is a centralized workplace management platform
                designed to connect organizational administration,
                project management and employee execution in one system.
              </p>

              <p className="mt-5 leading-7 text-gray-500">
                Instead of managing projects, tasks, team responsibilities
                and leave workflows across disconnected tools, WorkSphere
                brings everything together with role-based dashboards and
                clear approval flows.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  "Centralized management",
                  "Clear ownership",
                  "Connected workflows",
                  "Progress visibility",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-gray-300"
                  >
                    <CheckCircle2
                      size={15}
                      className="text-violet-400"
                    />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Three pillars */}
          <div className="mt-20 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Target,
                title: "Clear Ownership",
                text: "Every project and task has a defined owner, manager and responsible team member.",
              },
              {
                icon: Zap,
                title: "Connected Workflow",
                text: "Task updates, submissions, reviews, approvals and leave requests follow a connected process.",
              },
              {
                icon: Activity,
                title: "Visible Progress",
                text: "Dashboards and reports give teams a clear picture of work and progress.",
              },
            ].map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.1 }}
                  className="group rounded-2xl border border-white/10 bg-[#0d0d14] p-7 transition duration-300 hover:-translate-y-1 hover:border-violet-500/30"
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 transition group-hover:bg-violet-600 group-hover:text-white">
                    <Icon size={23} />
                  </div>

                  <h3 className="text-xl font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-3 leading-7 text-gray-500">
                    {item.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          FEATURES
      ========================================================= */}

      <section
        id="features"
        className="scroll-mt-20 bg-[#050509] py-28"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
              Platform Capabilities
            </p>

            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Everything your organization needs
            </h2>

            <p className="mt-5 text-lg leading-8 text-gray-500">
              One platform for managing people, projects, tasks and
              operational workflows.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.07 }}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c12] p-7 transition duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-[#0f0f17]"
                >
                  <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-violet-600/[0.04] blur-2xl transition group-hover:bg-violet-600/[0.1]" />

                  <div className="relative">
                    <div className="mb-6 flex h-13 w-13 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 transition group-hover:bg-violet-600 group-hover:text-white">
                      <Icon size={25} />
                    </div>

                    <h3 className="text-xl font-semibold">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-gray-500">
                      {feature.description}
                    </p>

                    <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-violet-400 opacity-0 transition group-hover:opacity-100">
                      Explore capability
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          WORKFLOW
      ========================================================= */}

      <section
        id="workflow"
        className="scroll-mt-20 border-t border-white/[0.06] bg-[#08080e] py-28"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
              How WorkSphere Works
            </p>

            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              From planning to completion
            </h2>

            <p className="mt-5 text-lg leading-8 text-gray-500">
              A simple role-based workflow keeps everyone connected while
              preserving clear responsibilities.
            </p>
          </motion.div>

          <div className="relative mt-20 grid gap-10 md:grid-cols-4">
            {/* Connecting line */}
            <div className="absolute left-[12%] right-[12%] top-[56px] hidden h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent md:block" />

            {workflow.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.number}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative text-center"
                >
                  <div className="relative z-10 mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-violet-500/20 bg-[#0d0d15] shadow-xl shadow-violet-950/20">
                    <Icon
                      size={32}
                      className="text-violet-400"
                    />

                    <span className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-xs font-bold shadow-lg shadow-violet-900/30">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-7 text-lg font-semibold">
                    {step.title}
                  </h3>

                  <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-gray-500">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          STATS
      ========================================================= */}

      <section className="border-y border-white/[0.08] bg-[#050509]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className={`px-5 py-10 text-center ${
                index !== stats.length - 1
                  ? "border-r border-white/[0.08]"
                  : ""
              }`}
            >
              <div className="text-3xl font-bold text-violet-400 sm:text-4xl">
                {stat.value}
              </div>

              <div className="mt-2 text-sm text-gray-500">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* =========================================================
          CONTACT
      ========================================================= */}

      <section
        id="contact"
        className="scroll-mt-20 bg-[#08080e] py-28"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="relative overflow-hidden rounded-[28px] border border-violet-500/20 bg-[#0d0d15] p-8 text-center shadow-2xl shadow-violet-950/20 sm:p-14"
          >
            <div className="pointer-events-none absolute left-1/2 top-0 h-60 w-60 -translate-x-1/2 rounded-full bg-violet-600/10 blur-[90px]" />

            <div className="relative">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                <Mail size={25} />
              </div>

              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
                Contact WorkSphere
              </p>

              <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
                Have a question?
              </h2>

              <p className="mx-auto mt-5 max-w-2xl leading-7 text-gray-500">
                WorkSphere is built to simplify workplace management. Reach
                out for questions about the platform or its workflows.
              </p>

              <div className="mx-auto mt-9 grid max-w-2xl gap-4 sm:grid-cols-2">
                <a
                  href="mailto:support@worksphere.com"
                  className="group rounded-2xl border border-white/10 bg-[#08080d] p-6 transition hover:border-violet-500/30 hover:bg-violet-500/[0.04]"
                >
                  <Mail
                    size={20}
                    className="mx-auto text-violet-400"
                  />

                  <p className="mt-4 text-xs uppercase tracking-wider text-gray-600">
                    Email Support
                  </p>

                  <p className="mt-2 text-sm font-semibold text-white transition group-hover:text-violet-300">
                    support@worksphere.com
                  </p>
                </a>

                <div className="rounded-2xl border border-white/10 bg-[#08080d] p-6">
                  <Clock3
                    size={20}
                    className="mx-auto text-violet-400"
                  />

                  <p className="mt-4 text-xs uppercase tracking-wider text-gray-600">
                    Support Hours
                  </p>

                  <p className="mt-2 text-sm font-semibold text-white">
                    Monday – Friday
                  </p>

                  <p className="mt-1 text-xs text-gray-600">
                    9:00 AM – 6:00 PM
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}

      <section className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-violet-700 to-indigo-700 py-24">
        <div className="pointer-events-none absolute left-[-100px] top-[-100px] h-[350px] w-[350px] rounded-full bg-white/[0.08] blur-[100px]" />

        <div className="pointer-events-none absolute bottom-[-150px] right-[-100px] h-[400px] w-[400px] rounded-full bg-black/[0.15] blur-[100px]" />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative mx-auto max-w-4xl px-5 text-center"
        >
          <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-violet-100">
            <Sparkles size={15} />
            Built for better work
          </div>

          <h2 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Bring your entire
            <br />
            <span className="text-violet-100">
              workspace together.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-violet-100/80">
            Manage teams, projects, tasks and workplace workflows from one
            connected platform.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              href="/login"
              className="group flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-violet-700 shadow-xl transition hover:bg-gray-100"
            >
              Enter WorkSphere
              <ArrowRight
                size={18}
                className="transition group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/register"
              className="rounded-xl border border-white/30 px-7 py-3.5 font-semibold text-white transition hover:bg-white/10"
            >
              Create Account
            </Link>
          </div>
        </motion.div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="border-t border-white/10 bg-[#050509]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <Link
                href="#home"
                className="flex items-center gap-2 text-xl font-bold tracking-tight"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
                  <LayoutDashboard size={16} />
                </div>

                Work<span className="text-violet-400">Sphere</span>
              </Link>

              <p className="mt-3 text-sm text-gray-600">
                Manage · Collaborate · Achieve
              </p>
            </div>

            <div className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-gray-500">
              <a
                href="#home"
                className="transition hover:text-violet-400"
              >
                Home
              </a>

              <a
                href="#about"
                className="transition hover:text-violet-400"
              >
                About
              </a>

              <a
                href="#features"
                className="transition hover:text-violet-400"
              >
                Features
              </a>

              <a
                href="#workflow"
                className="transition hover:text-violet-400"
              >
                Workflow
              </a>

              <a
                href="#contact"
                className="transition hover:text-violet-400"
              >
                Contact
              </a>

              <Link
                href="/login"
                className="transition hover:text-violet-400"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="mt-10 border-t border-white/[0.06] pt-6 text-center text-xs text-gray-700">
            © {new Date().getFullYear()} WorkSphere. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}