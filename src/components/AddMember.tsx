"use client";

import React, { useState } from 'react';
import Swal from 'sweetalert2';

export default function AddMember({ onClose }) {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');

  const handleAddMember = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You want to add this member!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, add it!'
    }).then((result) => {
      if (result.isConfirmed) {
        // Handle member addition logic here
        Swal.fire(
          'Added!',
          'The member has been added.',
          'success'
        );
        onClose(); // Close the modal after adding member
      }
    });
  };

  const handleCancel = () => {
    onClose(); // Close the modal without adding a member
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 opacity-50 z-40" onClick={handleCancel}></div>
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md relative">
          <div className="p-6">
            <h2 className="text-md font-semibold mb-4 text-center">Add New Member</h2>
            <div className="mb-4">
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                placeholder="Enter ID"
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                placeholder="Enter Name"
              />
            </div>
            <div className="mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                placeholder="Enter Email"
              />
            </div>
            <div className="mb-4">
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select Position</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Developer">Developer</option>
                <option value="Employee">Employee</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-center gap-4 mb-4">
              <button
                onClick={handleAddMember}
                className="bg-teal-500 text-white px-4 py-2 rounded"
              >
                Add Member
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
            <p className="text-sm text-gray-500 text-center">
              Registered members will generate a password when they log in.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
