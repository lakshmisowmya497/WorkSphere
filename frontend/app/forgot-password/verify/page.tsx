"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState("");

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("OTP:", otp);

    // Backend OTP verification will be connected later.

    // Temporary frontend navigation
    window.location.href = "/forgot-password/reset";
  };

  const handleOTPChange = (value: string) => {
    // Allow only numbers
    const numericValue = value.replace(/\D/g, "");

    // Maximum 6 digits
    setOtp(numericValue.slice(0, 6));
  };

  return (
    <main className="min-h-screen bg-[#050509] text-white px-4 py-10 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Back to Forgot Password */}
      <div className="absolute top-8 left-8 z-10">
        <Link
          href="/forgot-password"
          className="text-sm text-gray-400 hover:text-violet-400 transition-colors"
        >
          ← Back
        </Link>
      </div>

      {/* Center content */}
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">

        <div className="relative w-full max-w-md">

          {/* Card */}
          <div className="border border-white/10 bg-[#09090f]/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">

            {/* Heading */}
            <div className="text-center mb-8">

              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-violet-600/10 border border-violet-500/20">
                <ShieldCheck
                  size={28}
                  className="text-violet-400"
                />
              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                Verify OTP
              </h1>

              <p className="text-gray-400 mt-3 text-sm leading-6">
                Enter the 6-digit verification code
                <br />
                sent to your email address.
              </p>

            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-6">

              {/* OTP */}
              <div>

                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Verification Code
                </label>

                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) => handleOTPChange(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  required
                  className="w-full h-14 px-4 rounded-xl bg-[#06060a] border border-white/10 text-white text-center text-xl tracking-[0.5em] placeholder:text-gray-600 placeholder:tracking-normal outline-none transition-all focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />

              </div>

              {/* Verify button */}
              <button
                type="submit"
                className="w-full h-14 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-600/20"
              >
                Verify OTP
                <ArrowRight size={19} />
              </button>

            </form>

            {/* Resend OTP */}
            <div className="mt-7 text-center">

              <p className="text-sm text-gray-500">
                Didn't receive the code?
              </p>

              <button
                type="button"
                className="mt-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
                onClick={() => {
                  console.log("Resend OTP");
                }}
              >
                Resend OTP
              </button>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}