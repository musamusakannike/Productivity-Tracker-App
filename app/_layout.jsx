import React from "react";
import { Stack, useRouter, usePathname } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "react-native"; 
import Ionicons from "@expo/vector-icons/Ionicons";
import "../global.css"
import { StatusBar } from "expo-status-bar";

export default function Layout() {
  const router = useRouter();
  const pathname = usePathname();
  console.log("pathname: " +pathname)
  const colorScheme = useColorScheme(); // Detect light or dark mode
  const isDarkMode = colorScheme === "dark";

  const tabs = [
    { name: "Home", icon: "home-outline", route: "/" },
    { name: "Habits", icon: "checkmark-done-outline", route: "/habits" },
    { name: "Routines", icon: "calendar-outline", route: "/routines" },
    { name: "Goals", icon: "trophy-outline", route: "/goals" },
    { name: "Profile", icon: "person-outline", route: "/profile" },
  ];

  return (
    <SafeAreaView
      className={`flex-1 h-[100%] bg-white dark:bg-gray-900`}
    >
        <StatusBar />
      {/* Header */}
      <View
        className={`py-4 px-6 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } shadow-md`}
      >
        <Text
          className={`text-xl font-extrabold ${
            isDarkMode ? "text-gray-100" : "text-gray-800"
          }`}
        >
          My Life
        </Text>
      </View>

      {/* Main Content */}
      <View className="flex-1">
        <Stack name="index" screenOptions={{headerShown: false}} />
      </View>

      {/* Bottom Navigation */}
      <View
        className={`py-2 flex-row justify-around ${
          isDarkMode ? "bg-gray-800 border-t border-gray-700" : "bg-white border-t border-gray-300"
        }`}
      >
        {tabs.map((tab, index) => {
          const isActive = pathname.startsWith(tab.route);

          return (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(tab.route)}
              className="items-center"
            >
              <Ionicons
                name={isActive ? tab.icon.replace("-outline", "") : tab.icon}
                size={24}
                color={isActive ? "#800020" : isDarkMode ? "#ffffff" : "#808080"}
              />
              <Text
                className={`text-xs mt-1 ${
                  isActive
                    ? "text-[#800020] font-bold"
                    : isDarkMode
                    ? "text-gray-400"
                    : "text-gray-600"
                }`}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
