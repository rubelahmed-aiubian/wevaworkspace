"use client";

import Link from 'next/link';
import Swal from 'sweetalert2';
import React, { useState } from 'react';
import { auth } from '../../utils/firebase'; 
import { useRouter } from 'next/navigation';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const router = useRouter();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Validate email format and enable/disable reset button
    const isValidEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
    setIsButtonDisabled(!isValidEmail);
  };

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);

      // Show success SweetAlert
      Swal.fire({
        width: 400,
        title: 'Success',
        text: 'A password reset link has been sent to your email.',
        confirmButtonColor: '#02122b',
      }).then(() => {
        router.push('/login'); // Redirect to login page on success
      });
    } catch (err) {
      console.error("Error sending reset email:", err);
      setError("No email found. Please check and try again.");
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-800 w-full h-screen px-4">
      <div className="bg-white p-6 rounded-lg shadow-lg sm:w-1/3">
        <h1 className="text-1xl font-bold mb-4 text-center">Forgot Password</h1>
        <input
          type="email"
          name="email"
          id="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="Enter your email"
          className={`w-full text-sm p-3 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500`}
        />
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <button
          type="button"
          onClick={handleResetPassword}
          disabled={isButtonDisabled}
          className={`w-full ${isButtonDisabled ? 'bg-gray-400' : 'bg-teal-500 hover:bg-teal-700'} text-white p-3 rounded-lg font-semibold transition-colors duration-300`}
        >
          Reset Password
        </button>

        <div className="mt-4 text-center">
          <Link href="/login" className="text-teal-500 hover:text-gray-800">
            Go Back To Login
          </Link>
        </div>
      </div>
    </div>
  );
}
