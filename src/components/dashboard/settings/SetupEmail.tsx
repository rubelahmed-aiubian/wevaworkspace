import { useState, useEffect } from "react";
import { db } from "@/utils/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const SetupEmail = () => {
  const [host, setHost] = useState("");
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [port, setPort] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchEmailSettings = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "settings", "email_route");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setHost(data.host || "");
          setUser(data.user || "");
          setPassword(data.password || "");
          setPort(data.port || "");
        }
      } catch (error) {
        console.error("Error fetching email settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmailSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, "settings", "email_route");
      await updateDoc(docRef, {
        host,
        user,
        password,
        port,
      });
      //   alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving email settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-md">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div>
            <label htmlFor="host">
              Host{" "}
              <span className="text-xs text-gray-400">
                (e.g. webmail.example.com)
              </span>
            </label>
            <input
              type="text"
              id="host"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="Enter host address"
              required
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label htmlFor="user">
              User{" "}
              <span className="text-xs text-gray-400">
                (e.g. someone@example.com)
              </span>
            </label>
            <input
              type="email"
              id="user"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Enter user address"
              required
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label htmlFor="password">
              Password{" "}
              <span className="text-xs text-gray-400">
                (Enter email password)
              </span>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label htmlFor="port">
              Port <span className="text-xs text-gray-400">(e.g. 465)</span>
            </label>
            <input
              type="number"
              id="port"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="Enter port number"
              required
              className="w-full p-2 border rounded-md"
            />
          </div>
          <button
            onClick={handleSave}
            className="mt-4 px-4 py-2 bg-gray-800 text-white rounded"
            disabled={saving}
          >
            {saving ? <div className="spinner">Saving...</div> : "Save Details"}
          </button>
        </>
      )}
    </div>
  );
};

export default SetupEmail;
