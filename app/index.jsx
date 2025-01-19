// file: pages/home.js
import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Home() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
        <Text className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Hello, John!
        </Text>
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          {new Date().toLocaleDateString()}
        </Text>
      </View>

      {/* Quick Overview Section */}
      <View className="px-6 mt-4">
        <View className="flex-row justify-between">
          {[
            { label: "Habits", value: "5/7", note: "71% Completed" },
            { label: "Routines", value: "3", note: "Pending Today" },
            { label: "Goals", value: "2", note: "Active Goals" },
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
              <Text className="text-xs text-[#800020] dark:text-[#e26685d4]">{item.note}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        className="flex-1 px-6 mt-6"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Today's Habits */}
        <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
          Today's Habits
        </Text>
        <View className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {["Morning Walk", "Meditation"].map((habit, index) => (
            <TouchableOpacity
              key={index}
              className="flex-row items-center justify-between mb-3"
            >
              <Text className="text-base text-gray-800 dark:text-gray-100">
                {habit}
              </Text>
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color="#800020"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Active Goals */}
        <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-6 mb-2">
          Active Goals
        </Text>
        <View className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <Text className="text-base text-gray-800 dark:text-gray-100 mb-2">
            Read 5 Books
          </Text>
          <View className="h-2 bg-gray-300 rounded-full overflow-hidden">
            <View className="h-full w-2/5 bg-[#800020]" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
