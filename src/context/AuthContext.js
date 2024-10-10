//src/context/AuthContext.js
import bcrypt from "bcryptjs";
import { db } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    const currentUser = sessionStorage.getItem("currentUser");

    if (currentUser) {
      const email = currentUser;
      const userDocRef = doc(db, "members", email);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setUser(email);
        setUserData(userDoc.data());
      } else {
        console.log("No user data found for:", email);
        setUser(null);
        setUserData(null);
      }
    } else {
      setUser(null);
      setUserData(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkUser();
  }, []);

  const login = async (email, password) => {
    const userDocRef = doc(db, "members", email);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        setUser(email);
        setUserData(userData);

        // Only store the current user's email
        sessionStorage.setItem("currentUser", email);
        return true;
      }
    }

    sessionStorage.removeItem("currentUser");
    return false;
  };

  const logout = () => {
    setUser(null);
    setUserData(null);
    sessionStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, userData, setUser, setUserData, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
