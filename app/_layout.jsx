import React from "react";
import { Stack } from "expo-router";
import { ThemeProvider } from "../context/ThemeContext";
import "../global.css";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </ThemeProvider>
  );
}
