import React, { useState, useEffect } from "react";
import {
  Animated,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StyleSheet, Image } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { Stack, useRouter, usePathname } from "expo-router";
import { useTheme } from "../../context/ThemeContext";

// Get screen dimensions and adjust for notch/status bar
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const STATUS_BAR_HEIGHT =
  Platform.OS === "ios" ? 20 : StatusBar.currentHeight || 0;

export default function Layout() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState("User");

  // Sidebar animation and state
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const sidebarOffset = useState(new Animated.Value(-SCREEN_WIDTH))[0];

  // Effect to fetch user name
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const account = await AsyncStorage.getItem("userAccount");
        if (account) {
          const { name } = JSON.parse(account);
          if (name) {
            setUserName(name);
          }
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
      }
    };

    fetchUserName();
  }, [isSidebarOpen]);

  // Toggle sidebar visibility with improved animation
  const toggleSidebar = () => {
    Animated.timing(sidebarOffset, {
      toValue: isSidebarOpen ? -SCREEN_WIDTH : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setSidebarOpen(!isSidebarOpen);
  };

  // Rest of your existing code remains the same until the styles...
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
      activeRoutes: ["/timer"],
    },
  ];

  const sidebarItems = [
    { name: "Home", icon: "home-outline", route: "/" },
    { name: "Settings", icon: "settings-outline", route: "/settings" },
    { name: "Categories", icon: "grid-outline", route: "/categories" },
    { name: "Diary", icon: "book-outline", route: "/notes" },
    { name: "Help", icon: "help-outline", route: "/help" },
  ];

  return (
    <SafeAreaView
      className={`flex-1 h-[100%] ${
        theme === "light" ? "bg-gray-50" : "bg-gray-900 text-gray-200"
      }`}
    >
      <StatusBar
        animated
        backgroundColor={`${theme === "dark" ? "#111827" : "#f9fafb"}`}
      />
      {/* Sidebar with dynamic height */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: sidebarOffset }],
          },
        ]}
      >
        <View style={styles.sidebarContent}>
          {/* Header */}
          <View style={styles.sidebarHeader}>
            <Image
              source={require("../../assets/images/user.png")}
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
        </View>

        {/* Footer */}
        <View style={styles.sidebarFooter}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
        </View>
      </Animated.View>

      {/* Overlay */}
      {isSidebarOpen && (
        <TouchableOpacity style={styles.overlay} onPress={toggleSidebar} />
      )}

      {/* Header */}
      <View
        className={`pt-4 px-6 ${
          theme === "dark" ? "bg-gray-800" : "bg-gray-100"
        } ${
          pathname === "/welcome" || pathname === "/user-details"
            ? "hidden"
            : ""
        } shadow-md flex-row items-center justify-between`}
      >
        <TouchableOpacity onPress={toggleSidebar}>
          <Ionicons
            name="menu-outline"
            size={24}
            color={theme === "dark" ? "#ffffff" : "#808080"}
          />
        </TouchableOpacity>
        <Text
          className={`text-xl font-extrabold ${
            theme === "dark" ? "text-gray-100" : "text-gray-800"
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
          theme === "dark"
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
                  isActive
                    ? "#800020"
                    : theme === "dark"
                    ? "#ffffff"
                    : "#808080"
                }
              />
              <Text
                className={`text-xs mt-1 ${
                  isActive
                    ? "text-[#800020] font-bold"
                    : theme === "dark"
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
    width: SCREEN_WIDTH * 0.8,
    height: "108%",
    backgroundColor: "#800020",
    padding: 20,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    paddingTop: Platform.OS === "ios" ? 60 : STATUS_BAR_HEIGHT + 60,
    justifyContent: "space-between",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 5,
  },
  sidebarHeader: {
    alignItems: "center",
    marginBottom: 30,
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
  sidebarContent: {
    flex: 1,
  },
  menuItems: {
    marginTop: 30,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  menuItemText: {
    marginLeft: 15,
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "500",
  },
  sidebarFooter: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#ffffff",
    opacity: 0.8,
  },
});
