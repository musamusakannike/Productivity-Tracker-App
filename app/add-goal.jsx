import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons
import { saveData, loadData } from "../utils/storage";
import { useRouter } from "expo-router";

export default function AddGoal() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [milestoneInput, setMilestoneInput] = useState("");
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const router = useRouter();

  // Fetch categories from AsyncStorage
  useEffect(() => {
    const fetchCategories = async () => {
      const storedCategories = await loadData("categories");
      if (storedCategories && storedCategories.length > 0) {
        setCategories(storedCategories);
      } else {
        const defaultCategories = [
          { name: "Health", icon: "fitness-outline", color: "#4CAF50" },
          { name: "Work", icon: "briefcase-outline", color: "#2196F3" },
          { name: "Personal", icon: "person-outline", color: "#FFC107" },
          // Add more categories here
        ];
        setCategories(defaultCategories);
        await saveData("categories", defaultCategories);
      }
    };
    fetchCategories();
  }, []);

  // Add a milestone to the list
  const handleAddMilestone = () => {
    if (milestoneInput.trim()) {
      setMilestones([
        ...milestones,
        { id: Date.now().toString(), name: milestoneInput, completed: false },
      ]);
      setMilestoneInput("");
    }
  };

  // Delete a milestone from the list
  const handleDeleteMilestone = (milestoneId) => {
    setMilestones(
      milestones.filter((milestone) => milestone.id !== milestoneId)
    );
  };

  // Save the goal to AsyncStorage
  const handleSaveGoal = async () => {
    if (!name || !selectedCategory || milestones.length === 0) {
      alert("Please fill all required fields and add at least one milestone.");
      return;
    }

    const newGoal = {
      id: Date.now().toString(),
      name,
      description,
      category: selectedCategory.name,
      startDate: new Date().toISOString().split("T")[0],
      deadline: deadline.toISOString().split("T")[0],
      milestones,
      completed: false,
    };

    const existingGoals = await loadData("goals");
    const updatedGoals = [...existingGoals, newGoal];
    await saveData("goals", updatedGoals);

    alert("Goal added successfully!");
    router.replace("/goals");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900 px-4">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-6 mb-4">
          Add a New Goal
        </Text>

        {/* Goal Name */}
        <TextInput
          placeholder="Goal Name"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
          className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-4 rounded-lg shadow-sm mt-4"
        />

        {/* Goal Description */}
        <TextInput
          placeholder="Optional Description"
          placeholderTextColor="#aaa"
          value={description}
          onChangeText={setDescription}
          multiline
          className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-4 rounded-lg shadow-sm mt-4"
        />

        {/* Category Selector */}
        <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mt-4">
          Select Category
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
          {categories.map((item) => (
            <TouchableOpacity
              key={item.name}
              onPress={() => setSelectedCategory(item)}
              className={`p-4 rounded-lg mx-2 ${
                selectedCategory?.name === item.name
                  ? "border-2 border-[#800020]"
                  : ""
              }`}
              style={{
                backgroundColor: item.color,
                alignItems: "center",
                justifyContent: "center",
                width: 95,
                height: 95,
                marginBottom: 8, // To add spacing between rows
              }}
            >
              <Ionicons name={item.icon} size={32} color="#FFF" />
              <Text className="text-white font-bold mt-2 text-center">
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Deadline Picker */}
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-4 rounded-lg shadow-sm mt-4"
        >
          <Text className="dark:text-gray-400">
            Deadline: {deadline.toDateString()}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={deadline}
            mode="date"
            display="calendar"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setDeadline(date);
            }}
          />
        )}

        {/* Milestones */}
        <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mt-4">
          Add Milestones
        </Text>
        <View className="flex-row items-center mt-2">
          <TextInput
            placeholder="Milestone Name"
            placeholderTextColor="#aaa"
            value={milestoneInput}
            onChangeText={setMilestoneInput}
            className="flex-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-4 rounded-lg shadow-sm"
          />
          <TouchableOpacity
            onPress={handleAddMilestone}
            className="ml-2 bg-[#800020] p-4 rounded-lg"
          >
            <Text className="text-white font-bold">Add</Text>
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: 16 }}>
          {milestones.map((item) => (
            <View
              key={item.id}
              className="flex-row justify-between items-center mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
            >
              <Text className="text-gray-800 dark:text-gray-100">
                {item.name}
              </Text>
              <TouchableOpacity onPress={() => handleDeleteMilestone(item.id)}>
                <Text className="text-red-500 font-bold">Delete</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Save Goal */}
        <TouchableOpacity
          onPress={handleSaveGoal}
          className="mt-6 bg-[#800020] py-3 px-4 rounded-lg"
        >
          <Text className="text-white text-center font-bold">Save Goal</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
