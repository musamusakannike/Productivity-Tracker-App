import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // AsyncStorage.clear()
    const checkAccount = async () => {
      const account = await AsyncStorage.getItem("userAccount");
      console.log("Account", account);
      if (!account) {
        setLoading(false);
        router.replace("/welcome"); // Redirect to the welcome page
      }
      setLoading(false);
    };
    checkAccount();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-100 dark:bg-gray-900">
        <ActivityIndicator size="large" color="#800020" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Header */}
        <View className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
          <Text className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Hello, John!
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>

        {/* Quick Overview */}
        <View className="px-6 mt-4 flex-row justify-between">
          {[
            { label: "Habits Completed", value: "5/7" },
            { label: "Routines Pending", value: "2" },
            { label: "Goals Active", value: "3/5" },
            { label: "Streak", value: "10 Days" },
          ].map((item, index) => (
            <View
              key={index}
              className="flex-1 mx-1 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
            >
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                {item.label}
              </Text>
              <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Recent Activity */}
        <View className="px-6 mt-6">
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
            Recent Activity
          </Text>
          {[
            "Completed: Morning Walk (Habit)",
            'Milestone Achieved: "Lose 1 kg"',
          ].map((activity, index) => (
            <Text
              key={index}
              className="text-sm text-gray-600 dark:text-gray-400 mb-1"
            >
              {activity}
            </Text>
          ))}
        </View>

        {/* Motivation */}
        <View className="px-6 mt-6">
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
            🔥 Highlights
          </Text>
          <Text className="text-base font-semibold text-gray-800 dark:text-gray-100">
            You're on a 10-day streak! Keep it going! 🔥
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
            "Discipline is the bridge between goals and accomplishment." - Jim
            Rohn
          </Text>
        </View>

        {/* Navigation */}
        <View className="px-6 mt-6 flex-row justify-around">
          {[
            { label: "Habits", icon: "checkmark-circle", link: "/habits" },
            { label: "Routines", icon: "repeat", link: "/routines" },
            { label: "Goals", icon: "flag", link: "/goals" },
          ].map((navItem, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(navItem.link)}
              className="items-center"
            >
              <Ionicons
                name={navItem.icon}
                size={32}
                color="#800020"
                className="mb-1"
              />
              <Text className="text-sm text-gray-800 dark:text-gray-100">
                {navItem.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
