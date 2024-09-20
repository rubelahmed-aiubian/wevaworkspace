"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
import { db, auth } from "../../utils/firebase";
import { collection, query, where, getDocs, addDoc, doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

// Function to generate a random password
const generateRandomPassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export default function AddMember({ onClose, onMemberAdded }) {
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

  const validateFields = async () => {
    const newErrors = {
      id: !id.trim(),
      name: !name.trim(),
      email: !email.trim() || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email),
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
    const isValid = await validateFields();

    if (!isValid) {
      return;
    }

    const randomPassword = generateRandomPassword();

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
          // Register the user in Firebase Authentication with the random password
          const userCredential = await createUserWithEmailAndPassword(auth, email, randomPassword);
          const user = userCredential.user;

          // Send email verification to the new user
          await sendEmailVerification(user);

          // Add member details to Firestore with uid
          await setDoc(doc(db, "members", user.uid), {
            uid: user.uid, // Store uid
            id,
            name,
            email,
            position,
            photo: "", // Keeping this empty as per your earlier implementation
          });

          Swal.fire({
            title: "Success",
            text: "Member has been added successfully! A verification email has been sent.",
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
            text: "Failed to add member.",
            icon: "error",
            confirmButtonColor: "#02122b",
          });
        }
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
                onChange={handleInputChange(setId, "id")}
                className={`mt-1 block w-full p-2 border ${
                  errors.id || errors.idExists ? "border-red-500" : "border-gray-300"
                } rounded`}
                placeholder="Enter ID"
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
                <option value="Admin">Admin</option>
                <option value="Employee">Employee</option>
                <option value="Developer">Developer</option>
                <option value="Project Manager">Project Manager</option>
              </select>
            </div>

            <div className="flex justify-center gap-4 mb-4">
              <button
                onClick={handleAddMember}
                className="bg-gray-800 text-white px-4 py-2 rounded"
              >
                Add Member
              </button>
              <button
                onClick={handleCancel}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>

            <p className="text-sm text-gray-500 text-center">
              Registered members will receive an email verification link.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
