"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; // Adjust the path as necessary

export default function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Clear any previous errors

    const isLoggedIn = await login(email, password); // No need to pass rememberMe

    if (isLoggedIn) {
      const userPosition = sessionStorage.getItem("userPosition"); // Retrieve userPosition
      if (userPosition === "Admin") {
        router.push("/dashboard"); // Redirect to admin dashboard
      } else {
        router.push("/user-dashboard"); // Redirect to user dashboard
      }
    } else {
      setError("Invalid email or password.");
    }

    setIsLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const isButtonDisabled = !email || !password;

  return (
    <div className="flex items-center justify-center bg-gray-800 w-full h-screen">
      <div className="bg-white p-6 pt-16 rounded-lg shadow-lg sm:w-1/4 relative">
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
          <div className="bg-white p-6 rounded-full shadow-md">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={80}
              height={60}
              className="object-contain"
              priority
            />
          </div>
          <div className="font-semibold text-center text-gray-700 mt-6">
            Weva Workspace
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-20">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <span
              className="absolute right-3 top-3 cursor-pointer text-gray-500"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
            {error && <p className="text-red-500 text-center mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            className={`w-full p-3 rounded-lg font-semibold transition-colors duration-300 ${
              isButtonDisabled || isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-teal-500 text-white hover:bg-teal-700"
            }`}
            disabled={isButtonDisabled || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="teal"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing In...
              </span>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="mt-4 text-center">
            <Link
              href="/forgot-password"
              className="text-teal-500 hover:text-gray-800"
            >
              Forgot Password?
            </Link>
          </div>
        </form>
        <div className="mt-4 text-center text-gray-600 text-sm">
          <p>
            &copy; 2024{" "}
            <Link
              href="https://wevaapp.com"
              className="text-blue-500 hover:text-gray-800"
            >
              Weva Trading And Services LLC
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
