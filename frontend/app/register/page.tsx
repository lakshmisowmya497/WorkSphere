"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");

    console.log("Registration:", {
      name,
      email,
      password,
    });

    // Backend registration will be connected later.
  };

  return (
    <main className="min-h-screen bg-[#050509] text-white flex items-center justify-center px-4 py-10">

      {/* Background glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md">

        {/* Back to Login */}
        <div className="mb-8">
          <Link
            href="/login"
            className="text-sm text-gray-400 hover:text-violet-400 transition-colors"
          >
            ← Back to Login
          </Link>
        </div>

        {/* Register Card */}
        <div className="border border-white/10 bg-[#09090f]/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              Create an Account
            </h1>

            <p className="text-gray-400 mt-2 text-sm">
              Create your WorkSphere account
            </p>
          </div>

          <form
            onSubmit={handleRegister}
            className="space-y-5"
          >

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Full Name
              </label>

              <div className="relative">

                <User
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full h-14 pl-12 pr-4 rounded-xl bg-[#06060a] border border-white/10 text-white placeholder:text-gray-600 outline-none transition-all focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />

              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email
              </label>

              <div className="relative">

                <Mail
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full h-14 pl-12 pr-4 rounded-xl bg-[#06060a] border border-white/10 text-white placeholder:text-gray-600 outline-none transition-all focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />

              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Password
              </label>

              <div className="relative">

                <Lock
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Create a password"
                  required
                  className="w-full h-14 pl-12 pr-12 rounded-xl bg-[#06060a] border border-white/10 text-white placeholder:text-gray-600 outline-none transition-all focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-violet-400 transition-colors"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <Eye size={21} />
                  ) : (
                    <EyeOff size={21} />
                  )}
                </button>

              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Confirm Password
              </label>

              <div className="relative">

                <Lock
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Confirm your password"
                  required
                  className="w-full h-14 pl-12 pr-12 rounded-xl bg-[#06060a] border border-white/10 text-white placeholder:text-gray-600 outline-none transition-all focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-violet-400 transition-colors"
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <Eye size={21} />
                  ) : (
                    <EyeOff size={21} />
                  )}
                </button>

              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-400">
                {error}
              </p>
            )}

            {/* Register Button */}
            <button
              type="submit"
              className="w-full h-14 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-600/20"
            >
              Create Account
              <ArrowRight size={19} />
            </button>

          </form>

          {/* Login */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">

            <p className="text-sm text-gray-400">
              Already have an account?
            </p>

            <Link
              href="/login"
              className="mt-3 inline-flex items-center text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              Login
            </Link>

          </div>

        </div>

        {/* Bottom text */}
        <p className="text-center text-xs text-gray-600 mt-6">
          Secure access to your workspace
        </p>

      </div>
    </main>
  );
}