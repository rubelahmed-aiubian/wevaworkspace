"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { auth } from "../../utils/firebase";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [rememberMe, setRememberMe] = useState(false); // State for "Remember me" checkbox
  const [error, setError] = useState("");
  const router = useRouter();

  // Check localStorage for saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    const savedPassword = localStorage.getItem("savedPassword");
    const isRemembered = localStorage.getItem("rememberMe");

    if (savedEmail && savedPassword && isRemembered) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      if (rememberMe) {
        // Save email and password to localStorage
        localStorage.setItem("savedEmail", email);
        localStorage.setItem("savedPassword", password);
        localStorage.setItem("rememberMe", true);
      } else {
        // Clear localStorage if "Remember me" is not checked
        localStorage.removeItem("savedEmail");
        localStorage.removeItem("savedPassword");
        localStorage.removeItem("rememberMe");
      }

      router.push("/dashboard");
    } catch (err) {
      setError("Invalid email or password.");
    }
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
              priority // Added the priority property to handle LCP warning
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
              type={showPassword ? "text" : "password"} // Toggle between text and password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <span
              className="absolute right-3 top-3 cursor-pointer text-gray-500"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? "🙈" : "👁️"} {/* Eye icon */}
            </span>
            {error && (
              <p className="text-red-500 text-center mt-2">{error}</p>
            )}
          </div>

          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="rememberMe" className="text-gray-700">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            className={`w-full p-3 rounded-lg font-semibold transition-colors duration-300 ${
              isButtonDisabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-teal-500 text-white hover:bg-teal-700"
            }`}
            disabled={isButtonDisabled}
          >
            Sign In
          </button>

          <div className="mt-4 text-center">
            <Link href="/forgot-password" className="text-teal-500 hover:text-gray-800">
              Forgot Password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
