"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      alert("Password must contain at least 8 characters.");
      return;
    }

    console.log("Reset password");

    // Backend password reset will be connected later.

    window.location.href = "/forgot-password/success";
  };

  return (
    <main className="min-h-screen bg-[#050509] text-white px-4 py-10 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Back to Login */}
      <div className="absolute top-8 left-8 z-10">
        <Link
          href="/login"
          className="text-sm text-gray-400 hover:text-violet-400 transition-colors"
        >
          ← Back to Login
        </Link>
      </div>

      {/* Center content */}
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">

        <div className="relative w-full max-w-md">

          {/* Reset Password Card */}
          <div className="border border-white/10 bg-[#09090f]/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">

            {/* Heading */}
            <div className="text-center mb-8">

              <h1 className="text-3xl font-bold tracking-tight">
                Reset Password
              </h1>

              <p className="text-gray-400 mt-3 text-sm">
                Create a new password for your account.
              </p>

            </div>

            <form
              onSubmit={handleResetPassword}
              className="space-y-6"
            >

              {/* New Password */}
              <div>

                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  New Password
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
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className="w-full h-14 pl-12 pr-12 rounded-xl bg-[#06060a] border border-white/10 text-white placeholder:text-gray-600 outline-none transition-all focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-violet-400 transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
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

              {/* Password requirements */}
              <div className="space-y-2 text-sm text-gray-500">

                <p className={password.length >= 8 ? "text-green-400" : ""}>
                  ○ At least 8 characters
                </p>

                <p
                  className={
                    /[A-Za-z]/.test(password) &&
                    /\d/.test(password)
                      ? "text-green-400"
                      : ""
                  }
                >
                  ○ Include a letter and a number
                </p>

                <p
                  className={
                    /[^A-Za-z0-9]/.test(password)
                      ? "text-green-400"
                      : ""
                  }
                >
                  ○ Include a special character (optional)
                </p>

              </div>

              {/* Confirm Password */}
              <div>

                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Confirm New Password
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
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Confirm new password"
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

              {/* Reset Button */}
              <button
                type="submit"
                className="w-full h-14 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-600/20"
              >
                Reset Password
                <ArrowRight size={19} />
              </button>

            </form>

          </div>

        </div>

      </div>

    </main>
  );
}