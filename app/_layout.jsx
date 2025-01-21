import React, { useState, useEffect } from "react";
import {
  Animated,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme, StyleSheet, Image } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import "../global.css";
import { StatusBar } from "expo-status-bar";
import { Stack, useRouter, usePathname } from "expo-router";

// Get screen width for slide animation
const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function Layout() {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme(); // Detect light or dark mode
  const isDarkMode = colorScheme === "dark";
  const [userName, setUserName] = useState("User");

  // Sidebar animation and state
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const sidebarOffset = useState(new Animated.Value(-SCREEN_WIDTH))[0];

  useEffect(() => {
    const fetchUserName = async () => {
      const account = await AsyncStorage.getItem("userAccount");
      if (account) {
        const { userName } = JSON.parse(account);
        setUserName(userName || "User");
      }
    };
    fetchUserName();
  }, []);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    Animated.timing(sidebarOffset, {
      toValue: isSidebarOpen ? -SCREEN_WIDTH : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setSidebarOpen(!isSidebarOpen);
  };

  const tabs = [
    { name: "Home", icon: "home-outline", route: "/", activeRoutes: ["/"] },
    {
      name: "Habits",
      icon: "checkmark-done-outline",
      route: "/habits",
      activeRoutes: ["/habits", "/add-habits"],
    },
    {
      name: "Routines",
      icon: "calendar-outline",
      route: "/routines",
      activeRoutes: ["/routines", "/add-routine"],
    },
    {
      name: "Goals",
      icon: "trophy-outline",
      route: "/goals",
      activeRoutes: ["/goals", "/add-goal"],
    },
    {
      name: "Timer",
      icon: "stopwatch-outline",
      route: "/timer",
      activeRoutes: ["/timer", "/timer/settings"],
    },
  ];

  const sidebarItems = [
    { name: "Home", icon: "home-outline", route: "/" },
    { name: "Settings", icon: "settings-outline", route: "/settings" },
    { name: "Categories", icon: "grid-outline", route: "/categories" },
    { name: "Help", icon: "help-outline", route: "/help" },
  ];

  const getCurrentDate = () => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date().toLocaleDateString(undefined, options);
  };

  return (
    <SafeAreaView className={`flex-1 h-[100%] bg-gray-50 dark:bg-gray-900`}>
      <StatusBar />
      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: sidebarOffset }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.sidebarHeader}>
          <Image
            source={{
              uri: "https://i.pravatar.cc/150?img=2", // Replace with user's avatar if available
            }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuItems}>
          {sidebarItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                toggleSidebar();
                router.push(item.route);
              }}
              style={styles.menuItem}
            >
              <Ionicons name={item.icon} size={24} color="#ffffff" />
              <Text style={styles.menuItemText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.sidebarFooter}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
        </View>
      </Animated.View>

      {/* Overlay for closing sidebar */}
      {isSidebarOpen && (
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 5,
          }}
          onPress={toggleSidebar}
        />
      )}

      {/* Header */}
      <View
        className={`py-4 px-6 ${isDarkMode ? "bg-gray-800" : "bg-gray-100"} ${
          pathname === "/welcome" || pathname === "/user-details"
            ? "hidden"
            : ""
        } shadow-md flex-row items-center justify-between`}
      >
        <TouchableOpacity onPress={toggleSidebar}>
          <Ionicons
            name="menu-outline"
            size={24}
            color={isDarkMode ? "#ffffff" : "#808080"}
          />
        </TouchableOpacity>
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
        <Stack name="index" screenOptions={{ headerShown: false }} />
      </View>

      {/* Bottom Navigation */}
      <View
        className={`py-2 flex-row justify-around ${
          isDarkMode
            ? "bg-gray-800 border-t border-gray-700"
            : "bg-white border-t border-gray-300"
        } ${
          pathname === "/welcome" || pathname === "/user-details"
            ? "hidden"
            : ""
        }`}
      >
        {tabs.map((tab, index) => {
          const isActive =
            pathname === tab.route ||
            tab.activeRoutes.some((route) => pathname === route);

          return (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(tab.route)}
              className="items-center"
            >
              <Ionicons
                name={isActive ? tab.icon.replace("-outline", "") : tab.icon}
                size={24}
                color={
                  isActive ? "#800020" : isDarkMode ? "#ffffff" : "#808080"
                }
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

const styles = StyleSheet.create({
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH * 0.8,
    backgroundColor: "#800020",
    padding: 20,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  sidebarHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#ffffff",
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  date: {
    fontSize: 14,
    color: "#ffffff",
    marginTop: 5,
  },
  menuItems: {
    flex: 1,
    marginTop: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  menuItemText: {
    marginLeft: 15,
    fontSize: 16,
    color: "#ffffff",
  },
  sidebarFooter: {
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#ffffff",
    opacity: 0.8,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#f9f9f9",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#808080",
  },
});
