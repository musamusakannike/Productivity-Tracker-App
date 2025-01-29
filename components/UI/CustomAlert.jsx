import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";

export default function CustomAlert({
  isVisible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const fetchTheme = async () => {
      const storedTheme = await AsyncStorage.getItem("appTheme");
      if (storedTheme) {
        setTheme(storedTheme);
      } else {
        await AsyncStorage.setItem("appTheme", "light");
        setTheme("light");
      }
      console.log("Custom alert theme set to:", storedTheme);
    };
    fetchTheme();
  }, []);
  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50 min-w-52">
        <View
          className={`${
            theme === "light" ? "bg-white" : "bg-gray-800"
          } rounded-lg p-6 w-4/5 shadow-lg`}
        >
          <Text
            className={`text-lg font-bold ${
              theme === "light" ? "text-gray-800" : "text-gray-100"
            } mb-4`}
          >
            {title}
          </Text>
          <Text
            className={`text-sm ${
              theme === "light" ? "text-gray-600" : "text-gray-400"
            } mb-6`}
          >
            {message}
          </Text>
          <View className="flex-row justify-end space-x-4 gap-1">
            <TouchableOpacity
              onPress={onCancel}
              className={`px-4 py-2 ${
                theme === "light" ? "bg-gray-300" : "bg-gray-700"
              } rounded-lg mx-1`}
            >
              <Text
                className={`${
                  theme === "light" ? "text-gray-800" : "text-gray-100"
                }`}
              >
                {cancelText}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              className="px-4 py-2 bg-red-500 rounded-lg mx-1"
            >
              <Text className="text-white">{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
