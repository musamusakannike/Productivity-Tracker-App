import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomAlert from "../components/UI/CustomAlert";

const inBuiltCategories = [
  { name: "Health", icon: "fitness-outline", color: "#4CAF50" },
  { name: "Work", icon: "briefcase-outline", color: "#2196F3" },
  { name: "Personal", icon: "person-outline", color: "#FFC107" },
  { name: "Hobby", icon: "brush-outline", color: "#9C27B0" },
  { name: "Quit a Bad Habit", icon: "ban-outline", color: "#E53935" },
  { name: "Art", icon: "color-palette-outline", color: "#673AB7" },
  { name: "Meditation", icon: "flower-outline", color: "#00ACC1" },
  { name: "Study", icon: "school-outline", color: "#3F51B5" },
  { name: "Entertainment", icon: "musical-notes-outline", color: "#F44336" },
  { name: "Sports", icon: "football-outline", color: "#4CAF50" },
  { name: "Social", icon: "people-outline", color: "#03A9F4" },
  { name: "Nutrition", icon: "nutrition-outline", color: "#FF9800" },
  { name: "Finance", icon: "wallet-outline", color: "#795548" },
  { name: "Other", icon: "ellipsis-horizontal-outline", color: "#9E9E9E" },
];

const availableIcons = [
  "heart-outline",
  "car-outline",
  "home-outline",
  "school-outline",
  "briefcase-outline",
  "fitness-outline",
];

const availableColors = [
  "#E53935",
  "#4CAF50",
  "#2196F3",
  "#FFC107",
  "#673AB7",
  "#795548",
  "#03A9F4",
  "#FF9800",
];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [theme, setTheme] = useState("light");

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

  useEffect(() => {
    const fetchTheme = async () => {
      const storedTheme = await AsyncStorage.getItem("appTheme");
      if (storedTheme) {
        setTheme(storedTheme);
      } else {
        await AsyncStorage.setItem("appTheme", "light");
      }
      console.log("Categories page theme set to:", storedTheme);
    };
    const fetchCategories = async () => {
      const storedCategories = await AsyncStorage.getItem("categories");
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      } else {
        setCategories(inBuiltCategories);
        await AsyncStorage.setItem(
          "categories",
          JSON.stringify(inBuiltCategories)
        );
      }
    };

    fetchTheme();
    fetchCategories();
  }, []);

  const addCategory = async () => {
    if (!newCategoryName.trim() || !selectedIcon || !selectedColor) {
      showAlert(
        "Invalid Input",
        "Please fill all fields.",
        () => {
          setAlertVisible(false);
        },
        "OK"
      );
      return;
    }

    const newCategory = {
      name: newCategoryName.trim(),
      icon: selectedIcon,
      color: selectedColor,
    };

    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    await AsyncStorage.setItem("categories", JSON.stringify(updatedCategories));

    setNewCategoryName("");
    setSelectedIcon("");
    setSelectedColor("");
    showAlert(
      "Success",
      "Category added successfully!",
      () => {
        setAlertVisible(false);
      },
      "OK"
    );
  };

  const deleteCategory = async (categoryName) => {
    const isBuiltIn = inBuiltCategories.some(
      (category) => category.name === categoryName
    );
    if (isBuiltIn) {
      showAlert(
        "Error",
        "In-built categories cannot be deleted.",
        () => {
          setAlertVisible(false);
        },
        "OK"
      );
      return;
    }

    showAlert(
      "Delete Category",
      `Are you sure you want to delete the "${categoryName}" category?`,
      async () => {
        const updatedCategories = categories.filter(
          (category) => category.name !== categoryName
        );
        setCategories(updatedCategories);
        await AsyncStorage.setItem(
          "categories",
          JSON.stringify(updatedCategories)
        );
        setAlertVisible(false);
        showAlert(
          "Success",
          `"${categoryName}" category deleted successfully!`,
          () => {
            setAlertVisible(false);
          },
          "OK"
        );
      },
      "Delete"
    );
  };

  return (
    <SafeAreaView
      className={`flex-1 ${
        theme === "light" ? "bg-gray-100" : "bg-gray-900"
      } px-6`}
    >
      <Text
        className={`text-2xl font-bold ${
          theme === "light" ? "text-gray-800" : "text-gray-100"
        } mb-6`}
      >
        Categories
      </Text>

      {/* Display Categories */}
      <ScrollView className="mb-6">
        {categories.map((category, index) => (
          <View
            key={index}
            className={`flex-row justify-between items-center ${
              theme === "light" ? "bg-white" : "bg-gray-800"
            } p-4 rounded-lg mb-4`}
          >
            <View className="flex-row items-center">
              <Ionicons
                name={category.icon}
                size={24}
                color={category.color}
                className="mr-4"
              />
              <Text
                className={`${
                  theme === "light" ? "text-gray-800" : "text-gray-100"
                } text-lg`}
              >
                {category.name}
              </Text>
            </View>
            {!inBuiltCategories.some((item) => item.name === category.name) && (
              <TouchableOpacity
                onPress={() => deleteCategory(category.name)}
                className="bg-red-500 py-2 px-4 rounded-lg"
              >
                <Text className="text-white font-bold">Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Add Category */}
      <View
        className={`${
          theme === "light" ? "bg-white" : "bg-gray-800"
        } p-4 rounded-lg shadow-sm`}
      >
        <Text
          className={`text-lg font-bold ${
            theme === "light" ? "text-gray-800" : "text-gray-100"
          } mb-4`}
        >
          Add New Category
        </Text>
        <TextInput
          placeholder="Category Name"
          placeholderTextColor={"#aaa"}
          value={newCategoryName}
          onChangeText={setNewCategoryName}
          className={`${
            theme === "light"
              ? "text-gray-800 bg-gray-200"
              : "text-gray-100 bg-gray-700"
          } p-3 rounded-lg mb-4`}
        />
        <Text
          className={`text-sm ${
            theme === "light" ? "text-gray-600" : "text-gray-400"
          } mb-2`}
        >
          Select Icon
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {availableIcons.map((icon, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedIcon(icon)}
              className={`p-3 rounded-lg mr-2 ${
                selectedIcon === icon ? "bg-[#800020]" : "bg-gray-200"
              }`}
            >
              <Ionicons
                name={icon}
                size={24}
                color={selectedIcon === icon ? "#fff" : "#000"}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text
          className={`text-sm ${
            theme === "light" ? "text-gray-600" : "text-gray-400"
          } mt-4 mb-2`}
        >
          Select Color
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {availableColors.map((color, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedColor(color)}
              style={{
                backgroundColor: color,
                width: 40,
                height: 40,
                borderRadius: 20,
                marginRight: 10,
                borderWidth: selectedColor === color ? 3 : 0,
                borderColor: "#800020",
              }}
            />
          ))}
        </ScrollView>

        <TouchableOpacity
          onPress={addCategory}
          className="bg-[#800020] py-3 px-4 rounded-lg mt-6"
        >
          <Text className="text-white font-bold text-center">Add Category</Text>
        </TouchableOpacity>
      </View>
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
