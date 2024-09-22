"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";
import { db } from "@/utils/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext"; // Assuming you have AuthContext

export default function Profile() {
  const { user, userData, loading } = useAuth();
  const [photoURL, setPhotoURL] = useState("/images/user.png");
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      setPosition(userData.position || "");
      setUserId(userData.id || "");
      setEmail(user || ""); // Assuming user is the email
      if (userData.photo) {
        setPhotoURL(`/images/users/${userData.photo}`);
      }
    }
  }, [userData, user]);

  const handlePhotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Send the file to the API route
      const response = await fetch("/api/upload-photo", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        const fileName = result.fileName;

        // Update Firestore with the photo name
        const userDoc = doc(db, "members", email);
        await updateDoc(userDoc, { photo: fileName });

        // Update the photo URL to reflect the new file
        setPhotoURL(`/images/users/${fileName}`);

        Swal.fire("Success!", "Profile photo updated successfully.", "success");
      } else {
        Swal.fire("Error!", result.error || "Failed to upload file.", "error");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      Swal.fire("Error!", "Failed to update profile photo.", "error");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center p-6">
      {/* Profile Photo */}
      <div className="relative group">
        <div className="relative w-[150px] h-[150px] rounded-full overflow-hidden border-4 border-gray-300">
          <Image
            src={photoURL}
            alt="Profile Photo"
            layout="fill" // Ensures the image fills the container
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <label className="cursor-pointer text-white">
            <span className="text-sm">Edit</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handlePhotoChange}
            />
          </label>
        </div>
      </div>

      {/* Name and Position */}
      <h2 className="text-xl font-semibold mt-4">{name}</h2>
      <p className="mt-2 py-2 px-4 bg-gray-200 text-gray-800 rounded-full">
        {position}
      </p>

      {/* Profile Info Table */}
      <div className="w-full max-w-md mt-6">
        <table className="table-auto w-full text-left bg-white rounded-lg shadow-md overflow-hidden">
          <tbody>
            <tr>
              <td className="py-2 px-4 border-b font-semibold">ID:</td>
              <td className="py-2 px-4 border-b">{userId}</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b font-semibold">Full Name:</td>
              <td className="py-2 px-4 border-b">{name}</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b font-semibold">Email:</td>
              <td className="py-2 px-4 border-b">{email}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Change Password Button */}
      <div className="mt-6">
        <Link href="/forgot-password">
          <p className="bg-teal-500 text-white py-2 px-4 rounded-full shadow hover:bg-teal-600">
            Change Password
          </p>
        </Link>
      </div>
    </div>
  );
}
