"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProfileInput from "../Components/ProfileInput";

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    const existingToken = localStorage.getItem("token");
    if (existingToken) {
      router.push("/feed");
    }
  }, [router]);

  // Step 1: Email & Password
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/signup/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.email?.[0] || "Signup failed");
      }

      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: OTP Verification
  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify-otp/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );

      if (!res.ok) throw new Error("Invalid OTP");

      const data = await res.json();
      localStorage.setItem("token", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      setToken(data.access);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed");
    } finally {
      setLoading(false);
    }
  }

  // Step 3: Profile Completion
  function handleProfileComplete() {
    // Token already saved in localStorage
    router.push("/feed");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">VegaStack</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSignup}>
            <h2 className="text-xl font-bold mb-4">Create Account</h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
            />
            <input
              type="password"
              placeholder="Password (min 8 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Sign Up"}
            </button>
            <p className="text-center mt-4 text-gray-600">
              Already have an account?{" "}
              <a href="/signin" className="text-blue-600 hover:underline">
                Sign In
              </a>
            </p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit}>
            <h2 className="text-xl font-bold mb-4">Verify Email</h2>
            <p className="text-gray-600 mb-4">Enter the OTP sent to {email}</p>
            <input
              type="text"
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {step === 3 && (
          <ProfileInput
            token={token}
            onComplete={handleProfileComplete}
          />
        )}
      </div>
    </div>
  );
}