import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { loadData, saveData } from "../../utils/storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import CustomAlert from "../../components/UI/CustomAlert";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../context/ThemeContext";

const generateDates = (days) => {
  return [...Array(days)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split("T")[0]; // Return in YYYY-MM-DD format
  });
};

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const { theme } = useTheme();

  // Custom Alert States
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

  useEffect(() => {
    const fetchHabits = async () => {
      const storedHabits = await loadData("habits");
      setHabits(storedHabits || []);
    };

    fetchHabits();
  }, []);

  const dates = generateDates(30);

  // Filter habits based on whether the start date is before or equal to the selected date
  const filteredHabits = habits.filter(
    (habit) => new Date(habit.startDate) <= new Date(selectedDate)
  );

  // Calculate accuracy for a habit
  const calculateAccuracy = (habit) => {
    const { startDate, history } = habit;
    if (!startDate) return 0;

    // Get today's date and the start date
    const start = new Date(startDate);
    const today = new Date();

    // Calculate total days since the start date
    const totalDays = Math.max(
      Math.ceil((today - start) / (1000 * 60 * 60 * 24)),
      1 // Ensure at least 1 day
    );

    // Count completed days
    const completedDays = Object.values(history || {}).filter(Boolean).length;

    // Calculate accuracy percentage
    return Math.round((completedDays / totalDays) * 100);
  };

  const toggleCompletion = async (habitId) => {
    const today = new Date().toISOString().split("T")[0]; // Get today's date.

    // Check if the selected date is today.
    if (selectedDate !== today) {
      showAlert(
        "Invalid Action",
        "You can only toggle completion for today's date.",
        () => {
          setAlertVisible(false);
        },
        "OK"
      );
      return; // Exit the function if the selected date is not today.
    }

    // Proceed to toggle the completion status.
    const updatedHabits = habits.map((habit) => {
      if (habit.id === habitId) {
        const updatedHistory = {
          ...habit.history,
          [selectedDate]: !habit.history?.[selectedDate],
        };
        return { ...habit, history: updatedHistory };
      }
      return habit;
    });

    setHabits(updatedHabits);
    await saveData("habits", updatedHabits);
  };

  // Delete a habit
  const deleteHabit = async (habitId) => {
    showAlert(
      "Delete Habit",
      "Are you sure you want to delete this habit?",
      async () => {
        const updatedHabits = habits.filter((habit) => habit.id !== habitId);
        setHabits(updatedHabits);
        await saveData("habits", updatedHabits);
      },
      "Delete"
    );
  };

  return (
    <SafeAreaView
      className={`flex-1 ${theme === "light" ? "bg-gray-100" : "bg-gray-900"}`}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Calendar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 mt-4 max-h-[70px]"
        >
          {dates.map((date) => (
            <TouchableOpacity
              key={date}
              onPress={() => setSelectedDate(date)}
              className={`w-16 h-16 rounded-lg mx-1 flex items-center justify-center ${
                date === selectedDate
                  ? "bg-[#800020]"
                  : theme === "light"
                  ? "bg-gray-200"
                  : "bg-gray-700"
              }`}
            >
              <Text
                className={`text-xs font-light ${
                  date === selectedDate
                    ? "text-white"
                    : theme === "light"
                    ? "text-gray-800"
                    : "text-gray-100"
                }`}
              >
                {new Date(date).toDateString().slice(0, 3)} {/* Day */}
              </Text>
              <Text
                className={`text-lg font-bold ${
                  date === selectedDate
                    ? "text-white"
                    : theme === "light"
                    ? "text-gray-800"
                    : "text-gray-100"
                }`}
              >
                {new Date(date).getDate()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Habits List */}
        <View className="px-4 mt-6">
          {filteredHabits.length > 0 ? (
            filteredHabits.map((habit) => (
              <View
                key={habit.id}
                className={` ${
                  theme === "light" ? "bg-white" : "bg-gray-800"
                } p-4 rounded-lg mb-4`}
              >
                {/* Habit Header */}
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`text-lg font-bold ${
                      theme === "light" ? "text-gray-800" : "text-gray-100"
                    }`}
                  >
                    {habit.name}
                  </Text>
                  <Ionicons
                    name={habit.icon}
                    size={28}
                    color={habit.backgroundColor}
                  />
                </View>

                {/* Frequency Tag */}
                <Text
                  style={{ backgroundColor: habit.backgroundColor }}
                  className="text-white px-2 py-1 rounded-full text-xs font-bold mt-2 self-start"
                >
                  {habit.frequency}
                </Text>

                {/* Completion Status */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mt-4"
                >
                  {dates.map((date) => (
                    <View
                      key={date}
                      className={`w-10 h-10 rounded-full mx-1 flex items-center justify-center border-2 ${
                        habit.history && habit.history[date]
                          ? "border-green-500"
                          : "border-red-500"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          habit.history && habit.history[date]
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {new Date(date).getDate()}
                      </Text>
                    </View>
                  ))}
                </ScrollView>

                {/* Actions */}
                <View className="flex-row justify-between items-center mt-4">
                  {/* Mark as Done/Undone */}
                  <TouchableOpacity
                    onPress={() => toggleCompletion(habit.id)}
                    className="px-4 py-2 rounded-lg bg-[#800020]"
                  >
                    <Text className="text-white font-bold">
                      {habit.history?.[selectedDate]
                        ? "Mark Undone"
                        : "Mark Done"}
                    </Text>
                  </TouchableOpacity>

                  {/* Delete Button */}
                  <TouchableOpacity
                    onPress={() => deleteHabit(habit.id)}
                    className="px-4 py-2 rounded-lg bg-red-500"
                  >
                    <Text className="text-white font-bold">Delete</Text>
                  </TouchableOpacity>
                </View>

                {/* Accuracy */}
                <Text
                  className={`text-sm font-semibold ${
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  } mt-2`}
                >
                  Accuracy: {calculateAccuracy(habit)}%
                </Text>
              </View>
            ))
          ) : (
            // Empty State Display
            <View className="mt-10 items-center">
              <Ionicons
                name="sad-outline"
                size={64}
                color="gray"
                className="mb-4"
              />
              <Text
                className={`text-lg font-semibold ${
                  theme === "light" ? "text-gray-600" : "text-gray-400"
                } text-center`}
              >
                No habits found for the selected date.
              </Text>
              <Text
                className={`text-sm ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                } text-center mt-2`}
              >
                Try selecting a different date or add a new habit.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/add-habits")}
                className="mt-6 bg-[#800020] py-3 px-4 rounded-lg"
              >
                <Text className="text-white font-bold text-center">
                  Add Habit
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => router.push("/add-habits")}
        className="absolute bottom-6 right-6 bg-[#800020] p-4 rounded-full shadow-lg"
      >
        <Ionicons name="add" size={32} color="white" />
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
