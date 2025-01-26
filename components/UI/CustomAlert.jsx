import React from "react";
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
  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50 min-w-52">
        <View className="bg-white dark:bg-gray-800 rounded-lg p-6 w-4/5 shadow-lg">
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
            {title}
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </Text>
          <View className="flex-row justify-end space-x-4 gap-1">
            <TouchableOpacity
              onPress={onCancel}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg mx-1"
            >
              <Text className="text-gray-800 dark:text-gray-100">{cancelText}</Text>
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
