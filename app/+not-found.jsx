// file: pages/+not-found.jsx
import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useColorScheme } from "react-native";
import Image404 from "../assets/images/404.png";

export default function NotFound() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  return (
    <View
      className={`flex-1 w-full h-full justify-center items-center ${
        isDarkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      {/* Image or Illustration */}
      <Image
        source={Image404}
        resizeMode="contain"
        className="w-72 h-72 mb-6 rounded"
      />

      {/* Error Text */}
      <Text
        className={`text-4xl font-bold ${
          isDarkMode ? "text-gray-100" : "text-gray-800"
        }`}
      >
        Oops!
      </Text>
      <Text
        className={`text-lg text-center mt-2 ${
          isDarkMode ? "text-gray-400" : "text-gray-600"
        }`}
      >
        The page you&apos;re looking for doesn&apos;t exist.
      </Text>

      {/* Go Home Button */}
      <TouchableOpacity
        onPress={() => router.push("/")}
        className={`mt-6 px-6 py-3 rounded-lg ${
          isDarkMode ? "bg-[#800020]" : "bg-[#800020]"
        }`}
      >
        <Text className="text-white font-semibold text-lg">Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
}
