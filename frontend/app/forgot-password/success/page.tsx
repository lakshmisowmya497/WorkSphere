"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function PasswordResetSuccessPage() {
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

          {/* Success Card */}
          <div className="border border-white/10 bg-[#09090f]/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl text-center">

            {/* Success Icon */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-violet-600/10 border border-violet-500/30">
              <CheckCircle2
                size={48}
                className="text-violet-400"
              />
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold tracking-tight">
              Password Reset Successful!
            </h1>

            {/* Description */}
            <p className="text-gray-400 mt-4 text-sm leading-6">
              Your password has been updated successfully.
              <br />
              You can now login to your WorkSphere account.
            </p>

            {/* Login Button */}
            <Link
              href="/login"
              className="mt-8 w-full h-14 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-600/20"
            >
              Go to Login
              <ArrowRight size={19} />
            </Link>

          </div>

        </div>

      </div>

    </main>
  );
}