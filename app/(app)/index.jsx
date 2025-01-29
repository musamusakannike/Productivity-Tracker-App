import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import { quotes } from "../../utils/quotes";
import { useTheme } from "../../context/ThemeContext";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");
  const [randomQuote, setRandomQuote] = useState(null);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const checkAccount = async () => {
      const account = await AsyncStorage.getItem("userAccount");
      if (!account) {
        setLoading(false);
        router.replace("/welcome"); // Redirect to the welcome page
      }
      setLoading(false);
    };

    const fetchUserName = async () => {
      const account = await AsyncStorage.getItem("userAccount");
      if (account) {
        const { name } = JSON.parse(account);
        setUserName(name || "User");
      }
    };

    const pickRandomQuote = () => {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setRandomQuote(quotes[randomIndex]);
    };

    checkAccount();
    fetchUserName();
    pickRandomQuote();
  }, []);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <SafeAreaView
        className={`flex-1 justify-center items-center ${
          theme === "light" ? "bg-gray-100" : "bg-gray-900"
        }`}
      >
        <ActivityIndicator size="large" color="#800020" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className={`flex-1 ${
        theme === "light" ? "bg-gray-100" : "bg-gray-900"
      } px-6`}
    >
      {/* Header */}
      <View className="mt-6">
        <Text
          className={`text-2xl font-bold ${
            theme === "light" ? "text-gray-800" : "text-gray-100"
          }`}
        >
          Welcome, {userName}!
        </Text>
        <Text
          className={`text-sm ${
            theme === "light" ? "text-gray-600" : "text-gray-400"
          } mt-1`}
        >
          {today}
        </Text>
      </View>

      {/* Motivational Quote */}
      {randomQuote && (
        <View
          className={`mt-6 ${
            theme === "light" ? "bg-white" : "bg-gray-800"
          } p-4 rounded-lg shadow-sm`}
        >
          <Text
            className={`text-lg font-semibold ${
              theme === "light" ? "text-gray-800" : "text-gray-100"
            } text-center`}
          >
            "{randomQuote.quote}"
          </Text>
          <Text
            className={`text-sm ${
              theme === "light" ? "text-gray-600" : "text-gray-400"
            } text-center mt-2 italic`}
          >
            - {randomQuote.author}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View className="mt-10">
        <Text
          className={`text-lg font-bold ${
            theme === "light" ? "text-gray-800" : "text-gray-100"
          } mb-4`}
        >
          Quick Actions
        </Text>
        <View className="flex-row justify-between my-2">
          {[
            {
              title: "Add Habit",
              icon: "checkmark-done-outline",
              route: "/add-habits",
            },
            {
              title: "Add Routine",
              icon: "calendar-outline",
              route: "/add-routine",
            },
            {
              title: "Add Goal",
              icon: "trophy-outline",
              route: "/add-goal",
            },
          ].map((action, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(action.route)}
              className="flex-1 items-center mx-2 bg-[#800020] py-6 rounded-lg shadow-lg"
            >
              <Ionicons name={action.icon} size={32} color="white" />
              <Text className="text-white text-center font-bold mt-2">
                {action.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="flex-row justify-between my-2">
          {[
            {
              title: "Add Note",
              icon: "document-text-outline",
              route: "/add-notes",
            },
            {
              title: "Start Timer",
              icon: "watch-outline",
              route: "/timer",
            },
          ].map((action, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(action.route)}
              className="flex-1 items-center mx-2 bg-[#800020] py-6 rounded-lg shadow-lg"
            >
              <Ionicons name={action.icon} size={32} color="white" />
              <Text className="text-white text-center font-bold mt-2">
                {action.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
