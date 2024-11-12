import { useState, useEffect } from "react";
import SetupEmail from "@/components/dashboard/settings/SetupEmail";
import AddEmployeeRoles from "@/components/dashboard/settings/AddEmployeeRoles";
import UpdatePassword from "@/components/common/UpdatePassword";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("SetupEmail");

  useEffect(() => {
    setActiveTab("SetupEmail");
  }, []);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "SetupEmail":
        return <SetupEmail />;
      case "AddEmployeeRoles":
        return <AddEmployeeRoles />;
      case "ChangePassword":
        return <UpdatePassword />;
      default:
        return <SetupEmail />;
    }
  };

  return (
    <div className="settings-container">
      <nav className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("SetupEmail")}
          className={`py-2 px-4 ${
            activeTab === "SetupEmail" ? "border-b-2 border-gray-800" : ""
          }`}
        >
          Setup Email
        </button>
        <button
          onClick={() => setActiveTab("AddEmployeeRoles")}
          className={`py-2 px-4 ${
            activeTab === "AddEmployeeRoles" ? "border-b-2 border-gray-800" : ""
          }`}
        >
          Add Employee Roles
        </button>
        <button
          onClick={() => setActiveTab("ChangePassword")}
          className={`py-2 px-4 ${
            activeTab === "ChangePassword" ? "border-b-2 border-gray-800" : ""
          }`}
        >
          Change Password
        </button>
      </nav>
      <div className="mt-4">{renderActiveTab()}</div>
    </div>
  );
};

export default Settings;
