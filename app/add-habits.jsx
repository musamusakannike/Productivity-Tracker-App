import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { saveData, loadData } from "../utils/storage";
import Ionicons from "@expo/vector-icons/Ionicons";

const categories = [
  { name: "Health", icon: "fitness-outline", color: "#4CAF50" },
  { name: "Work", icon: "briefcase-outline", color: "#2196F3" },
  { name: "Personal", icon: "person-outline", color: "#FFC107" },
  { name: "Hobby", icon: "brush-outline", color: "#9C27B0" },
  { name: "Quit a Bad Habit", icon: "ban-outline", color: "#E53935" }, // Red for quitting bad habits
  { name: "Art", icon: "color-palette-outline", color: "#673AB7" }, // Purple for creativity
  { name: "Meditation", icon: "flower-outline", color: "#00ACC1" }, // Calm blue-green
  { name: "Study", icon: "school-outline", color: "#3F51B5" }, // Blue for education
  { name: "Entertainment", icon: "musical-notes-outline", color: "#F44336" }, // Red for fun and vibrancy
  { name: "Sports", icon: "football-outline", color: "#4CAF50" }, // Green for activity
  { name: "Social", icon: "people-outline", color: "#03A9F4" }, // Light blue for connections
  { name: "Nutrition", icon: "nutrition-outline", color: "#FF9800" }, // Orange for food
  { name: "Finance", icon: "wallet-outline", color: "#795548" }, // Brown for money management
  { name: "Other", icon: "ellipsis-horizontal-outline", color: "#9E9E9E" }, // Neutral grey
];


export default function AddHabit() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("Daily");
  const router = useRouter();

  const handleAddHabit = async () => {
    if (!name || !selectedCategory) {
      alert("Please fill all required fields");
      return;
    }

    const newHabit = {
      id: Date.now().toString(),
      name,
      description,
      category: selectedCategory.name,
      icon: selectedCategory.icon,
      backgroundColor: selectedCategory.color,
      frequency,
      startDate: new Date().toISOString().split("T")[0], // Save the current date in YYYY-MM-DD format
      history: {}, // Start with no history
    };

    const existingHabits = await loadData("habits");
    const updatedHabits = [...existingHabits, newHabit];
    await saveData("habits", updatedHabits);

    router.push("/habits");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900">
      <ScrollView className="px-6" contentContainerStyle={{ paddingBottom: 20 }}>
        <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-6 mb-4">
          Add a New Habit
        </Text>

        {/* Category Selector */}
        <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Select Category
        </Text>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.name}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          scrollEnabled={false} // Disable FlatList scrolling to rely on the parent ScrollView
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item)}
              className={`p-4 rounded-lg mb-4 flex-1 mx-2 ${
                selectedCategory?.name === item.name
                  ? "border-2 border-[#800020]"
                  : ""
              }`}
              style={{ backgroundColor: item.color }}
            >
              <Ionicons name={item.icon} size={32} color="white" />
              <Text className="text-white font-bold text-center mt-2">
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Habit Name */}
        <TextInput
          placeholder="Habit Name"
          value={name}
          onChangeText={setName}
          className="bg-white dark:bg-gray-800 dark:text-gray-100 p-4 rounded-lg shadow-sm mt-4 placeholder:text-gray-500"
        />

        {/* Habit Description */}
        <TextInput
          placeholder="Optional Description"
          value={description}
          onChangeText={setDescription}
          multiline
          className="bg-white dark:bg-gray-800 dark:text-gray-100 p-4 rounded-lg shadow-sm mt-4 placeholder:text-gray-500"
        />

        {/* Frequency Selector */}
        <View className="mt-4">
          <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Frequency
          </Text>
          {["Daily", "Weekly", "Monthly"].map((freq) => (
            <TouchableOpacity
              key={freq}
              onPress={() => setFrequency(freq)}
              className={`p-4 rounded-lg mb-2 ${
                frequency === freq
                  ? "bg-[#800020] text-white"
                  : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              }`}
            >
              <Text className={`font-bold text-center ${frequency === freq ? "text-gray-300 dark:text-gray-100" : "text-gray-800 dark:text-gray-400"}`}>{freq}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add Button */}
        <TouchableOpacity
          onPress={handleAddHabit}
          className="mt-6 bg-[#800020] py-3 px-4 rounded-lg"
        >
          <Text className="text-center text-white font-bold">Add Habit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
