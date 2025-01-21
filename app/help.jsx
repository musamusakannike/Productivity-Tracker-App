import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Help() {
  const openSupportEmail = () => {
    Linking.openURL("mailto:support@mylifeapp.com");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900 px-6">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-6 mb-4">
          Help & Guide
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 mb-6">
          Learn how to use <Text className="text-[#800020] font-bold">My Life</Text> to improve your daily habits, routines, goals, and more.
        </Text>

        {/* Section: Overview */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
            Overview
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            <Text className="font-bold">My Life</Text> is your companion for building better habits, managing routines, achieving goals, and staying productive. Here's a step-by-step guide to help you make the most out of it.
          </Text>
        </View>

        {/* Section: Habits */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
            Habits
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 mb-2">
            Track and build better habits. Here's how:
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            1. Navigate to the <Text className="font-bold">Habits</Text> page.
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            2. Tap the <Text className="text-[#800020]">+</Text> button to add a new habit.
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            3. Fill in details like name, category, and frequency.
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            4. Mark habits as completed for the day to track progress.
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            5. Use the calendar to view habit history for previous days.
          </Text>
        </View>

        {/* Section: Routines */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
            Routines
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 mb-2">
            Manage your daily routines effectively:
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            1. Go to the <Text className="font-bold">Routines</Text> page.
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            2. Tap the <Text className="text-[#800020]">+</Text> button to add a routine.
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            3. Add tasks to the routine and set a start date.
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            4. Mark tasks as done for the current day.
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            5. Use the calendar to view past routines, but note they can't be modified.
          </Text>
        </View>

        {/* Section: Goals */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
            Goals
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 mb-2">
            Set long-term goals and track milestones:
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            1. Go to the <Text className="font-bold">Goals</Text> page.
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            2. Tap the <Text className="text-[#800020]">+</Text> button to add a goal.
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            3. Add milestones and set a deadline for the goal.
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            4. Track progress as milestones are completed.
          </Text>
        </View>

        {/* Section: Timer */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
            Timer & Stopwatch
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            Use the timer to stay focused on tasks:
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            1. Navigate to the <Text className="font-bold">Timer</Text> page.
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            2. Choose a timer or stopwatch mode.
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            3. Set the timer duration and start timing.
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            4. Save your sessions to review your productivity.
          </Text>
        </View>

        {/* Section: FAQs */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
            FAQs
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 mb-2">
            <Text className="font-bold">Q:</Text> Can I recover accidentally deleted data?
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 mb-4">
            <Text className="font-bold">A:</Text> Unfortunately, deleted data cannot be recovered.
          </Text>
          {/* <Text className="text-gray-600 dark:text-gray-400 mb-2">
            <Text className="font-bold">Q:</Text> Can I backup my data?
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            <Text className="font-bold">A:</Text> Yes, you can use the backup feature in the Settings page.
          </Text> */}
        </View>

        {/* Section: Contact Support */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
            Contact Support
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 mb-4">
            Need help? Contact our support team for assistance.
          </Text>
          <TouchableOpacity
            onPress={openSupportEmail}
            className="bg-[#800020] py-3 px-4 rounded-lg"
          >
            <Text className="text-white font-bold text-center">Email Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
