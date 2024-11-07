import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/utils/firebase";
import bcrypt from "bcryptjs";
import { doc, updateDoc } from "firebase/firestore";
import Link from "next/link"; // Correct import for Link
import { BiSolidError } from "react-icons/bi"; // Error icon
import { FaCircleCheck } from "react-icons/fa6"; // Success icon

const ChangePassword = () => {
  const { userData } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For loading state
  const [passwordMatch, setPasswordMatch] = useState(true); // Track if passwords match
  const spin = `w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin`;

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    return regex.test(password);
  };

  const handleCurrentPasswordChange = async () => {
    const isMatch = await bcrypt.compare(currentPassword, userData.password);
    setPasswordMatch(isMatch); // Update the password match status
    if (isMatch) {
      setShowNewPassword(true);
      setErrorMessage(""); // Reset error if password matches
    } else {
      setErrorMessage(""); // Reset error message if password doesn't match
    }
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setNewPassword(password);
    setIsValidPassword(validatePassword(password));
  };

  const handleSavePassword = async () => {
    if (isValidPassword) {
      setIsLoading(true); // Set loading state to true when saving
      try {
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const userRef = doc(db, "members", userData.email);

        await updateDoc(userRef, {
          password: hashedNewPassword,
        });

        setIsLoading(false); // Set loading state to false after saving
      } catch (error) {
        setIsLoading(false); // Set loading state to false on error
        setErrorMessage("Error updating password. Please try again.");
      }
    } else {
      setErrorMessage("New password does not meet the requirements.");
    }
  };

  return (
    <div
      className="flex justify-center items-center h-screen"
      style={{
        height: "calc(100vh - 10rem)",
        overflowY: "auto",
      }}
    >
      <div className="p-6 border rounded shadow-lg max-w-sm w-full">
        <h2 className="text-center text-md font-semibold mb-4">
          Update Password
        </h2>

        <div className="mb-4 relative">
          <input
            type="password"
            id="current-password"
            placeholder="Enter your current password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              handleCurrentPasswordChange(); // Call handleCurrentPasswordChange on change
              if (e.target.value === "") {
                setShowNewPassword(false); // Hide new password input if current password is empty
              }
            }}
            className="w-full px-4 py-2 border rounded focus:outline-none"
            onBlur={handleCurrentPasswordChange}
          />
          {/* Show error icon if password doesn't match */}
          {!passwordMatch && currentPassword && (
            <BiSolidError className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" />
          )}
          {/* Show success icon if password matches and currentPassword is not empty */}
          {passwordMatch && currentPassword && (
            <FaCircleCheck className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
          )}
        </div>

        {showNewPassword && passwordMatch && (
          <>
            <div className="mb-4">
              <input
                type="password"
                id="new-password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={handleNewPasswordChange}
                className="w-full px-4 py-2 border rounded focus:outline-none"
              />
              {!isValidPassword && newPassword && (
                <p className="text-red-500 text-sm mt-1">
                  Password must be at least 8 characters, include an uppercase
                  letter, a lowercase letter, a number, and a symbol.
                </p>
              )}
            </div>

            {/* Save button or loading spinner */}
            {isLoading ? (
              <button
                className="w-full py-2 bg-gray-800 text-white rounded"
                disabled
              >
                <div className="flex justify-center items-center">
                  <svg
                    className="w-6 h-6 text-white animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="opacity-25"
                    />
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 118 8A8 8 0 014 12zm8-4a4 4 0 100 8 4 4 0 000-8z"
                      className="opacity-75"
                    />
                  </svg>
                </div>
              </button>
            ) : (
              isValidPassword && (
                <button
                  onClick={handleSavePassword}
                  className="w-full py-2 bg-gray-800 text-white rounded"
                >
                  Save
                </button>
              )
            )}
          </>
        )}

        {/* Forgot password link */}
        <div className="mt-4 text-center">
          <Link href="/forgot-password" className="text-blue-500">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
