"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();

    // Backend OTP sending will be connected later.
    console.log("Send OTP to:", email);

    // Temporary frontend navigation
    window.location.href = "/forgot-password/verify";
  };

  return (
    <main className="min-h-screen bg-[#050509] text-white px-4 py-10 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Back to Login - top left of page */}
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

          {/* Forgot Password Card */}
          <div className="border border-white/10 bg-[#09090f]/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">

            {/* Heading */}
            <div className="text-center mb-8">

              <h1 className="text-3xl font-bold tracking-tight">
                Forgot Password?
              </h1>

              <p className="text-gray-400 mt-3 text-sm leading-6">
                Enter your registered email address
                <br />
                and we will send you a verification code.
              </p>

            </div>

            <form onSubmit={handleSendOTP} className="space-y-6">

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

              {/* Send OTP */}
              <button
                type="submit"
                className="w-full h-14 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-600/20"
              >
                Send OTP
                <ArrowRight size={19} />
              </button>

            </form>

            {/* Back to Login */}
            <div className="mt-7 text-center">

              <Link
                href="/login"
                className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
              >
                Back to Login
              </Link>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}