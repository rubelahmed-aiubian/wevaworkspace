import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { RiExchange2Line } from "react-icons/ri";
import DatePicker from "react-datepicker"; // Import DatePicker
import "react-datepicker/dist/react-datepicker.css"; // Import styles

interface ProjectDateProps {
  projectNo: string;
  setEndDate: (date: Date | null) => void;
}

const ProjectDate: React.FC<ProjectDateProps> = ({ projectNo }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null); // Temporary state for start date
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null); // Temporary state for end date

  // Fetch project start and end dates from Firebase
  useEffect(() => {
    const fetchProjectDates = async () => {
      const docRef = doc(db, "projects", projectNo);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const projectData = docSnap.data();
        setStartDate(
          projectData.startDate ? new Date(projectData.startDate) : null
        );
        setEndDate(projectData.endDate ? new Date(projectData.endDate) : null);
      }
    };

    if (projectNo) {
      fetchProjectDates();
    }
  }, [projectNo]);

  // Save updated start and end dates to Firebase
  const handleSaveDates = async () => {
    setLoading(true); // Set loading to true
    const docRef = doc(db, "projects", projectNo);
    await updateDoc(docRef, {
      startDate: tempStartDate?.toISOString(), // Use temporary state
      endDate: tempEndDate?.toISOString(), // Use temporary state
    });
    setStartDate(tempStartDate); // Update the main state after saving
    setEndDate(tempEndDate); // Update the main state after saving
    setLoading(false); // Set loading to false
    setIsDatePickerOpen(false); // Close the date picker after saving
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  return (
    <>
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Due Date
      </label>
      <div className="flex items-center justify-between border px-6 py-4 rounded-lg flex-1 relative">
        {startDate && endDate ? (
          <div className="text-gray-800 flex-1">
            <p>
              <span className="font-semibold text-sm">Starts At:</span>{" "}
              {formatDate(startDate)}
            </p>
            <p>
              <span className="font-semibold text-sm">Ends On:</span>{" "}
              {formatDate(endDate)}
            </p>
          </div>
        ) : (
          <div className="flex-1 flex justify-center items-center">
            <button
              className="bg-gray-200 text-indigo-600 px-4 py-1 rounded-full text-sm"
              onClick={() => setIsDatePickerOpen(true)} // Open the date picker on click
            >
              Set Project Timeline
            </button>
          </div>
        )}

        {/* Conditional rendering of Change button */}
        {startDate && endDate && (
          <button
            className="flex items-center bg-indigo-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-800"
            onClick={() => {
              setTempStartDate(startDate); // Set tempStartDate to current startDate
              setTempEndDate(endDate); // Set tempEndDate to current endDate
              setIsDatePickerOpen(true); // Open the date picker on click
            }}
          >
            <RiExchange2Line className="mr-1" />
            Change
          </button>
        )}

        {isDatePickerOpen && (
          <div
            className="absolute z-10 mt-1 bg-white border border-gray-300 rounded shadow-lg p-4"
            style={{ top: "100%" }}
          >
            <h3 className="mb-2 text-gray-800 text-sm font-semibold text-center">
              Select Date Range
            </h3>
            <div className="flex flex-col mb-2">
              <DatePicker
                selected={tempStartDate} // Use temporary state
                onChange={(date) => setTempStartDate(date)} // Update temporary state
                selectsStart
                startDate={tempStartDate}
                endDate={tempEndDate}
                minDate={new Date()} // Prevent selection of past dates
                placeholderText="Start Date"
                className="mb-2 border border-gray-300 rounded p-2"
              />
              <DatePicker
                selected={tempEndDate} // Use temporary state
                onChange={(date) => setTempEndDate(date)} // Update temporary state
                selectsEnd
                startDate={tempStartDate}
                endDate={tempEndDate}
                minDate={tempStartDate || new Date()} // Prevent selection of past dates and ensure end date is after start date
                placeholderText="End Date"
                className="border border-gray-300 rounded p-2"
              />
            </div>
            <div className="flex justify-center mt-4">
              {" "}
              {/* Flex container for button alignment */}
              <button
                className="bg-indigo-600 text-white px-4 py-1 rounded flex items-center justify-center"
                onClick={handleSaveDates}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                    &nbsp; Saving...
                  </>
                ) : (
                  "Save"
                )}
              </button>
              <button
                className="ml-2 bg-gray-300 text-gray-700 px-4 py-1 rounded"
                onClick={() => setIsDatePickerOpen(false)} // Close the date picker
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProjectDate;
