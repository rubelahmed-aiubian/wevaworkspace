import React, { useState, useEffect } from "react";
import { db } from "@/utils/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { AiTwotoneDelete } from "react-icons/ai";

function AddEmployeeRoles() {
  const [role, setRole] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      setFetching(true);
      const docRef = doc(db, "settings", "employee_roles");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRoles(data.roles || []);
      } else {
        console.log("No such document!");
      }
      setFetching(false);
    };
    fetchRoles();
  }, []);

  const handleAddRole = async () => {
    setAdding(true);
    const docRef = doc(db, "settings", "employee_roles");
    await updateDoc(docRef, {
      roles: arrayUnion(role),
    });
    setRoles([...roles, role]);
    setRole("");
    setAdding(false);
  };

  const handleDeleteRole = async (roleToDelete: string) => {
    setLoading(roleToDelete);
    const docRef = doc(db, "settings", "employee_roles");
    await updateDoc(docRef, {
      roles: arrayRemove(roleToDelete),
    });
    setRoles(roles.filter((r) => r !== roleToDelete));
    setLoading(null);
  };

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-md">
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Enter role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none"
        />
        <button
          onClick={handleAddRole}
          className="bg-gray-800 text-white p-2 rounded-r-md hover:bg-gray-900 transition w-32"
        >
          {adding ? (
            <div className="animate-spin inline-block w-5 h-5 border-4 border-t-transparent border-white rounded-full" />
          ) : (
            "Add Role"
          )}
        </button>
      </div>

      {fetching ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="w-full">
          <table className="min-w-full border border-gray-200 rounded-md">
            <tbody className="bg-white">
              {roles.map((role, index) => (
                <tr key={index} className="odd:bg-gray-100 even:bg-white">
                  <td className="p-2 text-left" style={{ width: "90%" }}>
                    {role}
                  </td>
                  <td className="p-2 text-center" style={{ width: "10%" }}>
                    <button onClick={() => handleDeleteRole(role)}>
                      {loading === role ? (
                        <div className="animate-spin inline-block w-5 h-5 border-4 border-t-transparent border-red-400 rounded-full" />
                      ) : (
                        <AiTwotoneDelete
                          className="text-red-400"
                          style={{ fontSize: "20px" }}
                        />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AddEmployeeRoles;
