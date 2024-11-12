import React, { useState } from "react";
import { db } from "@/utils/firebase";
import { useAuth } from "@/context/AuthContext";
import bcrypt from "bcryptjs";
import { doc, updateDoc } from "firebase/firestore";
import { BiError } from "react-icons/bi";
import { FaCheckCircle } from "react-icons/fa";

function UpdatePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { userData } = useAuth();

  const handleCurrentPasswordChange = async (e) => {
    const inputPassword = e.target.value;
    setCurrentPassword(inputPassword);

    // Verify current password
    const isMatch = await bcrypt.compare(inputPassword, userData.password);
    setIsPasswordVerified(isMatch);
  };

  const handleNewPasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);

    // Validate new password requirements
    const isValid =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password);

    setIsValidPassword(isValid);
    setErrorMessage(
      isValid
        ? ""
        : "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
    );
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
        alert("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setIsPasswordVerified(false);
      } catch (error) {
        setIsLoading(false); // Set loading state to false on error
        setErrorMessage("Error updating password. Please try again.");
      }
    } else {
      setErrorMessage("New password does not meet the requirements.");
    }
  };

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-md">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            type="password"
            value={currentPassword}
            onChange={handleCurrentPasswordChange}
            placeholder="Current Password"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
          />
          {currentPassword && (
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
              {isPasswordVerified ? (
                <FaCheckCircle className="text-green-500" />
              ) : (
                <BiError className="text-red-500" />
              )}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1">
        <input
          type="password"
          value={newPassword}
          onChange={handleNewPasswordChange}
          placeholder="New Password"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
          disabled={!isPasswordVerified}
        />
        {errorMessage && (
          <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
        )}
      </div>

      <button
        onClick={handleSavePassword}
        className="px-4 py-2 bg-gray-800 text-white rounded-md"
        disabled={!isPasswordVerified || !isValidPassword || isLoading}
      >
        {isLoading ? "Saving..." : "Save Password"}
      </button>
    </div>
  );
}

export default UpdatePassword;
