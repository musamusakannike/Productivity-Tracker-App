import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";
import { useRouter } from "expo-router";
import CustomAlert from "../components/UI/CustomAlert";

export default function Settings() {
  const [userName, setUserName] = useState("");
  const [userAge, setUserAge] = useState("");
  const [editMode, setEditMode] = useState(false);

  // Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

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

  const router = useRouter();
  const { colorScheme, setColorScheme } = useColorScheme(); // NativeWind hook

  useEffect(() => {
    const fetchUserData = async () => {
      const account = await AsyncStorage.getItem("userAccount");
      if (account) {
        const { name, age } = JSON.parse(account);
        setUserName(name || "");
        setUserAge(age || "");
      }
    };

    fetchUserData();
  }, []);

  const saveUserDetails = async () => {
    if (!userName.trim()) {
      showAlert(
        "Invalid Input",
        "Name is required.",
        () => setAlertVisible(false),
        "OK"
      );
      return;
    }

    const updatedAccount = { name: userName.trim(), age: userAge.trim() };
    await AsyncStorage.setItem("userAccount", JSON.stringify(updatedAccount));
    setEditMode(false);
    showAlert(
      "Success",
      "User details updated successfully.",
      () => setAlertVisible(false),
      "OK"
    );
  };

  const toggleTheme = () => {
    const newTheme = colorScheme === "light" ? "dark" : "light";
    setColorScheme(newTheme);
    showAlert(
      "Theme Changed",
      `The app theme is now set to ${newTheme}.`,
      () => setAlertVisible(false),
      "OK"
    );
  };

  const clearAppMemory = async () => {
    showAlert(
      "Clear App Memory",
      "Are you sure you want to clear all data?",
      async () => {
        await AsyncStorage.clear();
        showAlert(
          "Success",
          "App memory cleared.",
          () => {
            router.push("/");
          },
          "OK"
        );
        setAlertVisible(false);
      },
      "Clear"
    );
  };

  const changePassword = async () => {
    const storedPassword = JSON.parse(await AsyncStorage.getItem("notesPassword"));
    // Validate current password
    if (storedPassword.trim() !== currentPassword.trim()) {
      showAlert(
        "Error",
        "Current password is incorrect.",
        () => setAlertVisible(false),
        "OK"
      );
      return;
    }

    // Validate new password and confirmation
    if (!newPassword.trim() || newPassword !== confirmNewPassword) {
      showAlert(
        "Error",
        "New password and confirmation do not match.",
        () => setAlertVisible(false),
        "OK"
      );
      return;
    }

    // Save new password
    await AsyncStorage.setItem("notesPassword", newPassword);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    showAlert(
      "Success",
      "Password changed successfully.",
      () => setAlertVisible(false),
      "OK"
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900 px-6 py-4">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Settings
        </Text>

        {/* User Details */}
        <View className="mb-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
            User Details
          </Text>
          {!editMode ? (
            <View>
              <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Name: {userName || "N/A"}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Age: {userAge || "N/A"}
              </Text>
              <TouchableOpacity
                onPress={() => setEditMode(true)}
                className="bg-blue-500 py-2 px-4 rounded-lg"
              >
                <Text className="text-white text-center font-bold">Edit</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <TextInput
                value={userName}
                onChangeText={setUserName}
                placeholder="Enter your name"
                placeholderTextColor={"#aaa"}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 p-3 rounded-lg mb-4"
              />
              <TextInput
                value={userAge}
                onChangeText={setUserAge}
                placeholder="Enter your age (optional)"
                placeholderTextColor={"#aaa"}
                keyboardType="number-pad"
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 p-3 rounded-lg mb-4"
              />
              <View className="flex-row justify-between">
                <TouchableOpacity
                  onPress={saveUserDetails}
                  className="bg-green-500 py-2 px-4 rounded-lg flex-1 mr-2"
                >
                  <Text className="text-white text-center font-bold">Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setEditMode(false)}
                  className="bg-red-500 py-2 px-4 rounded-lg flex-1 ml-2"
                >
                  <Text className="text-white text-center font-bold">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Password Management */}
        <View className="mb-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
            Password Management
          </Text>
          <TextInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Current Password"
            placeholderTextColor={"#aaa"}
            secureTextEntry
            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 p-3 rounded-lg mb-4"
          />
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New Password"
            placeholderTextColor={"#aaa"}
            secureTextEntry
            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 p-3 rounded-lg mb-4"
          />
          <TextInput
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            placeholder="Confirm New Password"
            placeholderTextColor={"#aaa"}
            secureTextEntry
            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 p-3 rounded-lg mb-4"
          />
          <TouchableOpacity
            onPress={changePassword}
            className="bg-green-500 py-2 px-4 rounded-lg"
          >
            <Text className="text-white text-center font-bold">
              Change Password
            </Text>
          </TouchableOpacity>
        </View>

        {/* Theme Toggle */}
        <View className="mb-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
            App Theme
          </Text>
          <TouchableOpacity
            onPress={toggleTheme}
            className="bg-[#800020] py-2 px-4 rounded-lg"
          >
            <Text className="text-white text-center font-bold">
              Toggle to {colorScheme === "light" ? "Dark" : "Light"} Mode
            </Text>
          </TouchableOpacity>
        </View>

        {/* Clear App Memory */}
        <View className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
            Clear App Memory
          </Text>
          <TouchableOpacity
            onPress={clearAppMemory}
            className="bg-red-500 py-2 px-4 rounded-lg"
          >
            <Text className="text-white text-center font-bold">
              Clear Memory
            </Text>
          </TouchableOpacity>
        </View>
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
