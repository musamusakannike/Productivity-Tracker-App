import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [notesPassword, setNotesPassword] = useState(null);

  useEffect(() => {
    const loadPassword = async () => {
      try {
        const storedPassword = await AsyncStorage.getItem("notesPassword");
        if (storedPassword) {
          setNotesPassword(storedPassword);
        }
      } catch (error) {
        console.error("Error loading password:", error);
      }
    };

    loadPassword();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setAuthenticated,
        notesPassword,
        setNotesPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
