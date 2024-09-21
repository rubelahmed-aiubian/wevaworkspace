"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "../../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Check localStorage for saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    const isRemembered = localStorage.getItem("rememberMe");

    if (savedEmail && isRemembered) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Fetch user data from Firestore
      const userDocRef = doc(db, "members", email); // Assuming the document ID is the email
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Use bcrypt to compare hashed password
        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (passwordMatch) {
          // Save email to localStorage if "Remember me" is checked
          if (rememberMe) {
            localStorage.setItem("savedEmail", email);
            localStorage.setItem("rememberMe", true);
          } else {
            localStorage.removeItem("savedEmail");
            localStorage.removeItem("rememberMe");
          }

          // Navigate to dashboard
          router.push("/dashboard");
        } else {
          setError("Invalid email or password.");
        }
      } else {
        setError("User not found.");
      }
    } catch (err) {
      setError("An error occurred during login.");
      console.error(err);
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
