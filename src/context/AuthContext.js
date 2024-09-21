"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const savedEmail = localStorage.getItem("savedEmail");
      if (savedEmail) {
        // Fetch user data from Firestore using the saved email as the document ID
        const userDocRef = doc(db, "members", savedEmail);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUser(savedEmail); // Set the email as the user
          setUserData(userDoc.data()); // Set the user data
        } else {
          console.log("No user data found for:", savedEmail);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
