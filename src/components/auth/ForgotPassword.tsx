"use client";

import Link from "next/link";
import Swal from "sweetalert2";
import React, { useState, useEffect } from "react";
import { db } from "../../utils/firebase";
import { useRouter } from "next/navigation";
import bcrypt from "bcryptjs";
import { IoIosRefreshCircle } from "react-icons/io";
import { IoReturnDownBack } from "react-icons/io5";

import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [resetCode, setResetCode] = useState("");
  const [verificationStage, setVerificationStage] = useState(false);
  const [newPasswordStage, setNewPasswordStage] = useState(false);
  const [timer, setTimer] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (timer > 0 && resendDisabled) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setResendDisabled(false);
    }
  }, [timer, resendDisabled]);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    const isValidEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
    setIsButtonDisabled(!isValidEmail);
  };

  const handleSendResetCode = async () => {
    const memberRef = collection(db, "members");
    const querySnapshot = await getDocs(
      query(memberRef, where("email", "==", email))
    );

    if (querySnapshot.empty) {
      setError("No email found. Please check and try again.");
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      sessionStorage.setItem("resetCode", code);
      setVerificationStage(true);
      setTimer(60);
      setError("");

      Swal.fire({
        title: "Success",
        text: "A password reset code has been sent to your email.",
        icon: "success",
        confirmButtonColor: "#02122b",
      });
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to send email. Please try again later.");
    }
  };

  const handleVerifyCode = () => {
    const storedCode = sessionStorage.getItem("resetCode");
    if (resetCode === storedCode) {
      setNewPasswordStage(true);
      setVerificationStage(false);
    } else {
      setError("Incorrect reset code. Please try again.");
    }
  };

  const handleSetNewPassword = async () => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
      await setDoc(
        doc(db, "members", email),
        { password: hashedPassword },
        { merge: true }
      );

      Swal.fire({
        title: "Success",
        text: "Your password has been reset successfully!",
        icon: "success",
        confirmButtonColor: "#02122b",
      }).then(() => {
        router.push("/login");
      });
    } catch (error) {
      console.error("Error updating password:", error);
      setError("Error updating password. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-800 w-full h-screen px-4">
      <div className="bg-white p-6 rounded-lg shadow-lg sm:w-1/3">
        <h1 className="text-1xl font-bold mb-4 text-center">Forgot Password</h1>

        {/* Email Field */}
        {!verificationStage && !newPasswordStage && (
          <>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              className={`w-full text-sm p-3 border ${
                error ? "border-red-500" : "border-gray-300"
              } rounded-lg mb-4`}
            />
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button
              onClick={handleSendResetCode}
              disabled={isButtonDisabled}
              className={`w-full ${
                isButtonDisabled ? "bg-gray-400" : "bg-teal-500"
              } text-white p-3 rounded-lg`}
            >
              Send Reset Code
            </button>
          </>
        )}

        {/* Reset Code Field */}
        {verificationStage && (
          <>
            <input
              type="text"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              placeholder="Enter reset code"
              className={`w-full text-sm p-3 border ${
                error ? "border-red-500" : "border-gray-300"
              } rounded-lg mb-4`}
            />
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm">
                Resend Code in: {resendDisabled ? `${timer}s` : "00s"}
              </p>

              {/* Icon replacing the button */}
              <IoIosRefreshCircle
                onClick={!resendDisabled ? handleSendResetCode : null}
                className={`text-2xl cursor-pointer ${
                  resendDisabled
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-teal-400"
                }`}
              />
            </div>
            <button
              onClick={handleVerifyCode}
              className="w-full bg-teal-500 text-white p-3 rounded-lg mb-4"
            >
              Verify Code
            </button>
          </>
        )}

        {/* New Password Field */}
        {newPasswordStage && (
          <>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Set new password"
              className={`w-full text-sm p-3 border ${
                error ? "border-red-500" : "border-gray-300"
              } rounded-lg mb-4`}
            />
            <button
              onClick={handleSetNewPassword}
              className="w-full bg-teal-500 text-white p-3 rounded-lg"
            >
              Save New Password
            </button>
          </>
        )}
        <p className="text-center mt-4">
          <Link
            href="/login"
            className="flex justify-center items-center text-teal-500 hover:text-black no-underline"
          >
            <IoReturnDownBack className="mr-1" /> Back to login page
          </Link>
        </p>
      </div>
    </div>
  );
}
