import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { saveData, loadData } from "../utils/storage";

export default function Home() {
  const [habits, setHabits] = useState([]);

  // Load habits on mount
  useEffect(() => {
    const loadHabitsFromStorage = async () => {
      const storedHabits = await loadData("habits");
      setHabits(storedHabits);
    };
    loadHabitsFromStorage();
  }, []);

  // Save habits whenever they change
  useEffect(() => {
    saveData("habits", habits);
  }, [habits]);

  const toggleHabitCompletion = (id) => {
    const updatedHabits = habits.map((habit) =>
      habit.id === id ? { ...habit, completed: !habit.completed } : habit
    );
    setHabits(updatedHabits);
  };

  const deleteHabit = (id) => {
    const updatedHabits = habits.filter((habit) => habit.id !== id);
    setHabits(updatedHabits);
  };

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

      {/* Main Content */}
      <ScrollView
        className="flex-1 px-6 mt-6"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
          Today's Habits
        </Text>
        <View className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {habits.map((habit) => (
            <TouchableOpacity
              key={habit.id}
              className="flex-row items-center justify-between mb-3"
              onPress={() => toggleHabitCompletion(habit.id)}
            >
              <Text
                className={`text-base ${
                  habit.completed
                    ? "line-through text-gray-500"
                    : "text-gray-800 dark:text-gray-100"
                }`}
              >
                {habit.name}
              </Text>
              <Ionicons
                name={
                  habit.completed
                    ? "checkmark-circle"
                    : "checkmark-circle-outline"
                }
                size={24}
                color={habit.completed ? "#800020" : "#808080"}
              />
              <TouchableOpacity onPress={() => deleteHabit(habit.id)}>
                <Ionicons name="trash-outline" size={20} color="red" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
