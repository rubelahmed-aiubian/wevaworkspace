"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Swal from "sweetalert2";

type UserData = {
  name: string;
  position: string;
  id: string;
  photo?: string;
  email: string;
};

type ProfileComponentProps = {
  userData: UserData;
};

const ProfileComponent: React.FC<ProfileComponentProps> = ({ userData }) => {
  const [photoURL, setPhotoURL] = useState("/images/users/user.png");

  useEffect(() => {
    if (userData.photo) {
      setPhotoURL(`/images/users/${userData.email}/${userData.photo}`);
    }
  }, [userData.photo, userData.email]);

  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire("Error!", "Only JPG or PNG files are supported.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userEmail", userData.email);

    try {
      const response = await fetch("/api/upload-photo", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        const fileName = result.fileName;
        setPhotoURL(`/images/users/${userData.email}/${fileName}`);
        Swal.fire("Success!", "Profile photo updated successfully.", "success");
      } else {
        Swal.fire("Error!", result.error || "Failed to upload file.", "error");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      Swal.fire("Error!", "Failed to update profile photo.", "error");
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <div className="relative group">
        <div className="relative w-[150px] h-[150px] rounded-full overflow-hidden border-4 border-gray-300">
          <Image
            src={photoURL}
            alt="Profile Photo"
            layout="fill"
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
      <h2 className="text-xl font-semibold mt-4">{userData.name}</h2>
      <p className="mt-2 py-2 px-4 bg-gray-200 text-gray-800 rounded-full">
        {userData.position}
      </p>
      <div className="w-full max-w-md mt-6">
        <table className="table-auto w-full text-left bg-white rounded-lg shadow-md overflow-hidden">
          <tbody>
            <tr>
              <td className="py-2 px-4 border-b font-semibold">ID:</td>
              <td className="py-2 px-4 border-b">{userData.id}</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b font-semibold">Full Name:</td>
              <td className="py-2 px-4 border-b">{userData.name}</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b font-semibold">Email:</td>
              <td className="py-2 px-4 border-b">{userData.email}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProfileComponent;
