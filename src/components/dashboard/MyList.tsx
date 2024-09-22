import React from "react";
import { FaCheck, FaFilter, FaSort, FaChevronRight } from "react-icons/fa";

export default function MyList() {
  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <button className="bg-gray-900 text-white px-4 py-2 rounded">
          Add New Task
        </button>
        <div className="flex items-center gap-4">
          <FaFilter />
          <select className="p-2 border border-gray-300 rounded">
            <option value="In Queue">In Queue</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-100 rounded shadow p-4 mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Add new task..."
          className="w-2/4 p-2 border border-gray-300 rounded focus:border-gray-400"
        />
        <input
          type="date"
          className="w-1/4 p-2 border border-gray-300 rounded focus:border-gray-400"
        />
        <select className="w-1/4 p-2 border border-gray-300 rounded focus:border-gray-400">
          <option value="">Select Collaborator</option>
          <option value="John Doe">John Doe</option>
          <option value="Jane Smith">Jane Smith</option>
          <option value="Ryan Howard">Ryan Howard</option>
          <option value="Pam Beesly">Pam Beesly</option>
        </select>
      </div>

      <table className="w-full border-collapse">
        <thead className="text-left">
          <tr>
            <th className="border-gray-300 font-semibold p-2 w-6/12 flex items-center">
              <FaSort className="mr-1" />
              Task
            </th>
            <th className="border-gray-300 font-semibold p-2 w-2/12 text-center">
              Due Date
            </th>
            <th className="border-gray-300 font-semibold p-2 w-2/12 text-center">
              Collaborator
            </th>
            <th className="border-gray-300 font-semibold p-2 w-2/12 text-center">
              Details
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Sample Row */}
          <tr className="h-auto">
            <td className="border-t border-gray-200 p-2 relative break-words w-6/12">
              <FaCheck className="text-gray-700 bg-gray-200 rounded-full p-1 text-xl cursor-pointer absolute left-0 top-1/2 transform -translate-y-1/2 hover:bg-green-600 hover:text-white" />
              <p className="ml-6">
                Sample Task with a longer description to demonstrate wrapping.
              </p>
            </td>
            <td className="border-t border-gray-200 p-2 text-center relative w-2/12">
              18 Sep 2024
            </td>
            <td className="border-t border-gray-200 p-2 text-center relative w-2/12">
              <span className="bg-gray-900 rounded-full px-3 py-1 text-white">
                John Doe
              </span>
            </td>
            <td className="border-t border-gray-200 text-center w-2/12">
              <FaChevronRight className="cursor-pointer bg-teal-600 p-2 text-3xl text-white mx-auto" />
            </td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4 border-t border-gray-200 pt-2">
        <span>Showing 1 to 1 of 1 results</span>
        <div>
          <button className="px-4 py-2 bg-gray-200 rounded mr-2">
            Previous
          </button>
          <button className="px-4 py-2 bg-gray-200 rounded">Next</button>
        </div>
      </div>
    </div>
  );
}
