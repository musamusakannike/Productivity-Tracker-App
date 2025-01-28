import React, {useState, useEffect} from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import Image404 from "../assets/images/404.png";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function NotFound() {
  const router = useRouter();
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
      console.log("Theme set to:", storedTheme);
    }
    fetchTheme();
  }, [])

  return (
    <View
      className={`flex-1 w-full h-full justify-center items-center ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-100"
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
          theme === "dark" ? "text-gray-100" : "text-gray-800"
        }`}
      >
        Oops!
      </Text>
      <Text
        className={`text-lg text-center mt-2 ${
          theme === "dark" ? "text-gray-400" : "text-gray-600"
        }`}
      >
        The page you&apos;re looking for doesn&apos;t exist.
      </Text>

      {/* Go Home Button */}
      <TouchableOpacity
        onPress={() => router.push("/")}
        className={`mt-6 px-6 py-3 rounded-lg ${
          theme === "dark" ? "bg-[#800020]" : "bg-[#800020]"
        }`}
      >
        <Text className="text-white font-semibold text-lg">Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
}
