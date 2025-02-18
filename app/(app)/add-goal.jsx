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
import { saveData, loadData } from "../../utils/storage";
import { useRouter } from "expo-router";
import CustomAlert from "../../components/UI/CustomAlert";
import { useTheme } from "../../context/ThemeContext";

export default function AddGoal() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [milestoneInput, setMilestoneInput] = useState("");
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();

  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertAction, setAlertAction] = useState(() => {});
  const [alertConfirmText, setAlertConfirmText] = useState("Confirm");

  const showAlert = (title, message, action, alertText) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertAction(() => action);
    setAlertVisible(true);
    setAlertConfirmText(alertText);
  };

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
          { name: "Hobby", icon: "brush-outline", color: "#9C27B0" },
          { name: "Quit a Bad Habit", icon: "ban-outline", color: "#E53935" },
          { name: "Art", icon: "color-palette-outline", color: "#673AB7" },
          { name: "Meditation", icon: "flower-outline", color: "#00ACC1" },
          { name: "Study", icon: "school-outline", color: "#3F51B5" },
          {
            name: "Entertainment",
            icon: "musical-notes-outline",
            color: "#F44336",
          },
          { name: "Sports", icon: "football-outline", color: "#4CAF50" },
          { name: "Social", icon: "people-outline", color: "#03A9F4" },
          { name: "Nutrition", icon: "nutrition-outline", color: "#FF9800" },
          { name: "Finance", icon: "wallet-outline", color: "#795548" },
          {
            name: "Other",
            icon: "ellipsis-horizontal-outline",
            color: "#9E9E9E",
          },
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
      showAlert(
        "Error",
        "Please fill all required fields and add at least one milestone.",
        () => {
          setAlertVisible(false);
        },
        "OK"
      );
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
    showAlert(
      "Updated goals",
      "Goal added successfully!",
      () => {
        setAlertVisible(false);
      },
      "OK"
    );
    router.replace("/goals");
  };

  return (
    <SafeAreaView
      className={`flex-1 ${
        theme === "light" ? "bg-gray-100" : "bg-gray-900"
      } px-4`}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <Text
          className={`text-lg font-bold ${
            theme === "light" ? "text-gray-800" : "text-gray-100"
          } mt-6 mb-4`}
        >
          Add a New Goal
        </Text>

        {/* Goal Name */}
        <TextInput
          placeholder="Goal Name"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
          className={`${
            theme === "light"
              ? "bg-white text-gray-800"
              : "bg-gray-800 text-gray-100"
          } p-4 rounded-lg shadow-sm mt-4`}
        />

        {/* Goal Description */}
        <TextInput
          placeholder="Optional Description"
          placeholderTextColor="#aaa"
          value={description}
          onChangeText={setDescription}
          multiline
          className={`${
            theme === "light"
              ? "bg-white text-gray-800"
              : "bg-gray-800 text-gray-100"
          } p-4 rounded-lg shadow-sm mt-4`}
        />

        {/* Category Selector */}
        <Text
          className={`text-sm font-semibold ${
            theme === "light" ? "text-gray-600" : "text-gray-400"
          } mt-4`}
        >
          Select Category
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginTop: 8,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
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
          className={`${
            theme === "light"
              ? "bg-white text-gray-800"
              : "bg-gray-800 text-gray-100"
          } p-4 rounded-lg shadow-sm mt-4`}
        >
          <Text className={`${theme === "dark" && "text-gray-400"}`}>
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
        <Text
          className={`text-sm font-semibold ${
            theme === "light" ? "text-gray-600" : "text-gray-400"
          } mt-4`}
        >
          Add Milestones
        </Text>
        <View className="flex-row items-center mt-2">
          <TextInput
            placeholder="Milestone Name"
            placeholderTextColor="#aaa"
            value={milestoneInput}
            onChangeText={setMilestoneInput}
            className={`flex-1 ${
              theme === "light"
                ? "bg-white text-gray-800"
                : "bg-gray-800 text-gray-100"
            } p-4 rounded-lg shadow-sm`}
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
              className={`flex-row justify-between items-center mt-4 ${
                theme === "light" ? "bg-white" : "bg-gray-800"
              } p-4 rounded-lg shadow-sm`}
            >
              <Text
                className={`max-w-[80%] ${
                  theme === "light" ? "text-gray-800" : "text-gray-100"
                } `}
              >
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

      {/* Custom Alert */}
      <CustomAlert
        isVisible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onConfirm={alertAction}
        onCancel={() => setAlertVisible(false)}
        confirmText={alertConfirmText}
      />
    </SafeAreaView>
  );
}
