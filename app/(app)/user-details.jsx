import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import CustomAlert from "../../components/UI/CustomAlert";

export default function UserDetails() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
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

  const handleSaveDetails = async () => {
    if (!name.trim()) {
      showAlert(
        "Name Required",
        "Please enter your name to continue.",
        () => {
          setAlertVisible(false);
        },
        "OK"
      );
      return;
    }

    const userAccount = {
      name,
      age: age.trim() || null,
      dateJoined: new Date().toISOString(),
    };

    await AsyncStorage.setItem("userAccount", JSON.stringify(userAccount));
    router.replace("/"); // Navigate to the home page
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900 px-6">
      <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-8 mb-4">
        Tell Us About Yourself
      </Text>
      <Text className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Enter your name and age to personalize your experience.
      </Text>

      {/* Name Input */}
      <TextInput
        placeholder="Your Name *"
        placeholderTextColor={"#aaa"}
        value={name}
        onChangeText={setName}
        className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-4 rounded-lg shadow-sm mb-4"
      />

      {/* Age Input */}
      <TextInput
        placeholder="Your Age (Optional)"
        placeholderTextColor={"#aaa"}
        value={age}
        onChangeText={setAge}
        keyboardType="number-pad"
        className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-4 rounded-lg shadow-sm mb-6"
      />

      {/* Continue Button */}
      <TouchableOpacity
        onPress={handleSaveDetails}
        className="bg-[#800020] py-3 px-6 rounded-lg"
      >
        <Text className="text-white text-center font-bold">Continue</Text>
      </TouchableOpacity>
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
