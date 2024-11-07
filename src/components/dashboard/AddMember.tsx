"use client";

import bcrypt from "bcryptjs";
import Swal from "sweetalert2";
import React, { useState } from "react";
import { db } from "../../utils/firebase";
import { useAuth } from "../../context/AuthContext"; // Import the useAuth hook
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";

const validateEmail = (email) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);

// Function to generate a random 8-character password
const generateRandomPassword = () => {
  return Math.random().toString(36).slice(-8);
};

export default function AddMember({ onClose, onMemberAdded }) {
  const { user, userData } = useAuth(); // Use the auth context
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [errors, setErrors] = useState({
    id: false,
    name: false,
    email: false,
    position: false,
    emailExists: false,
    idExists: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const validateFields = async () => {
    const newErrors = {
      id: !id.trim(),
      name: !name.trim(),
      email: !email.trim() || !validateEmail(email),
      position: !position.trim(),
      emailExists: false,
      idExists: false,
    };

    // Check if the email is already registered in Firestore
    if (!newErrors.email) {
      const emailQuery = query(
        collection(db, "members"),
        where("email", "==", email)
      );
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        newErrors.emailExists = true;
      }
    }

    // Check if the ID is already registered in Firestore
    if (!newErrors.id) {
      const idQuery = query(collection(db, "members"), where("id", "==", id));
      const idSnapshot = await getDocs(idQuery);
      if (!idSnapshot.empty) {
        newErrors.idExists = true;
      }
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleAddMember = async () => {
    setIsLoading(true);
    const isValid = await validateFields();
    if (!isValid) {
      setIsLoading(false);
      return;
    }

    // Check if the user is authenticated and is an admin
    if (!user || userData?.position !== "Admin") {
      Swal.fire({
        title: "Error",
        text: "You don't have permission to add members.",
        icon: "error",
        confirmButtonColor: "#02122b",
      });
      setIsLoading(false);
      return;
    }

    // Fire SweetAlert for confirmation
    Swal.fire({
      title: "Are you sure?",
      width: 400,
      text: "You want to add this member!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#02122b",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirm",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Generate random password
          const password = generateRandomPassword();

          // Hash the password using bcryptjs
          const hashedPassword = await bcrypt.hash(password, 10); // Hashing with saltRounds = 10

          // Add member details to Firestore using email as document ID
          await setDoc(doc(db, "members", email), {
            id,
            name,
            email,
            position,
            photo: "",
            password: hashedPassword,
            createdAt: new Date(),
            status: "Pending",
          });

          // Send email with the plain text password (using fetch)
          await fetch("/api/send-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              name,
              password, // Send the plain text password in the email
            }),
          });

          Swal.fire({
            title: "Success",
            text: "Member has been added and email sent successfully!",
            width: 400,
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: true,
            confirmButtonColor: "#02122b",
            confirmButtonText: "OK",
          }).then(() => {
            if (onMemberAdded) {
              onMemberAdded(); // Call the refresh function passed as a prop
            }
            onClose();
          });
        } catch (error) {
          console.error("Error adding member:", error);
          Swal.fire({
            title: "Error",
            text: "Failed to add member or send email.",
            icon: "error",
            confirmButtonColor: "#02122b",
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    });
  };

  const handleInputChange = (setter, field) => (e) => {
    setter(e.target.value);
    if (errors[field]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [field]: false,
        idExists: field === "id" ? false : prevErrors.idExists,
        emailExists: field === "email" ? false : prevErrors.emailExists,
      }));
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-gray-800 opacity-70 z-40"
        onClick={handleCancel}
      ></div>
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md relative">
          <div className="p-8">
            <h2 className="text-md font-semibold mb-4 text-center">
              Add New Member
            </h2>

            <div className="mb-4">
              <input
                type="text"
                value={id}
                maxLength={6}
                onChange={handleInputChange(setId, "id")}
                className={`mt-1 block w-full p-2 border ${
                  errors.id || errors.idExists
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded`}
                placeholder="Enter ID (e.g. IT0123)"
              />
              {errors.idExists && (
                <p className="text-red-500 text-sm">ID is already registered</p>
              )}
            </div>

            <div className="mb-4">
              <input
                type="text"
                value={name}
                onChange={handleInputChange(setName, "name")}
                className={`mt-1 block w-full p-2 border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } rounded`}
                placeholder="Enter Name"
              />
            </div>

            <div className="mb-4">
              <input
                type="email"
                value={email}
                onChange={handleInputChange(setEmail, "email")}
                className={`mt-1 block w-full p-2 border ${
                  errors.email || errors.emailExists
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded`}
                placeholder="Enter Email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">Invalid email format</p>
              )}
              {errors.emailExists && (
                <p className="text-red-500 text-sm">
                  Email is already registered
                </p>
              )}
            </div>

            <div className="mb-4">
              <select
                value={position}
                onChange={handleInputChange(setPosition, "position")}
                className={`mt-1 block w-full p-2 border ${
                  errors.position ? "border-red-500" : "border-gray-300"
                } rounded`}
              >
                <option value="">Select Position</option>
                <option value="Employee">Employee</option>
                <option value="Developer">Developer</option>
                <option value="Project Manager">Project Manager</option>
              </select>
            </div>

            <div className="flex justify-center gap-4 mb-4">
              <button
                onClick={handleAddMember}
                className=" bg-gray-800 text-white px-4 py-2 rounded flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    &nbsp;Adding...
                  </>
                ) : (
                  "Add Member"
                )}
              </button>
              <button
                onClick={handleCancel}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>

            <p className="text-sm text-gray-500 text-center">
              Members will get login info in their email.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
