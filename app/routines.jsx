import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { loadData, saveData } from "../utils/storage";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import CustomAlert from "../components/UI/CustomAlert";

const generateDates = (days) => {
  return [...Array(days)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split("T")[0];
  });
};

export default function Routines() {
  const [routines, setRoutines] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const dates = generateDates(30);

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

  useEffect(() => {
    const fetchRoutines = async () => {
      const storedRoutines = await loadData("routines");
      setRoutines(storedRoutines || []);
    };
    fetchRoutines();
  }, []);

  const deleteRoutine = async (routineId) => {
    showAlert(
      "Delete Routine",
      "Are you sure you want to delete this routine?",
      async () => {
        const updatedRoutines = routines.filter(
          (routine) => routine.id !== routineId
        );
        setRoutines(updatedRoutines);
        await saveData("routines", updatedRoutines);
        setAlertVisible(false); // Hide alert after action
      },
      "Delete"
    );
  };

  // Filter routines based on their startDate
  const filteredRoutines = routines.filter(
    (routine) => new Date(routine.startDate) <= new Date(selectedDate)
  );

  const toggleTaskCompletion = async (routineId, taskId) => {
    const today = new Date().toISOString().split("T")[0];

    if (selectedDate !== today) {
      showAlert(
        "Invalid Action",
        "You can only toggle tasks for today's date.",
        () => {
          setAlertVisible(false);
        },
        "OK"
      );
      return;
    }

    const updatedRoutines = routines.map((routine) => {
      if (routine.id === routineId) {
        const updatedHistory = {
          ...routine.history,
          [selectedDate]: {
            ...routine.history[selectedDate],
            [taskId]: !routine.history?.[selectedDate]?.[taskId],
          },
        };
        return { ...routine, history: updatedHistory };
      }
      return routine;
    });

    setRoutines(updatedRoutines);
    await saveData("routines", updatedRoutines);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Calendar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 mt-4"
        >
          {dates.map((date) => (
            <TouchableOpacity
              key={date}
              onPress={() => setSelectedDate(date)}
              className={`w-16 h-16 rounded-lg mx-1 flex items-center justify-center ${
                date === selectedDate
                  ? "bg-[#800020]"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <Text
                className={`text-xs font-light ${
                  date === selectedDate
                    ? "text-white"
                    : "text-gray-800 dark:text-gray-100"
                }`}
              >
                {new Date(date).toDateString().slice(0, 3)}
              </Text>
              <Text
                className={`text-lg font-bold ${
                  date === selectedDate
                    ? "text-white"
                    : "text-gray-800 dark:text-gray-100"
                }`}
              >
                {new Date(date).getDate()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Routines List */}
        <View className="px-4 mt-6">
          {filteredRoutines.length > 0 ? (
            filteredRoutines.map((routine) => (
              <View
                key={routine.id}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4"
              >
                <Text className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  {routine.name}
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  {routine.description}
                </Text>
                <View className="mt-4">
                  {routine.tasks.map((task) => (
                    <View
                      key={task.id}
                      className="flex-row items-center justify-between mb-2"
                    >
                      <Text className="text-gray-800 dark:text-gray-100">
                        {task.name}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          toggleTaskCompletion(routine.id, task.id)
                        }
                        disabled={
                          selectedDate !==
                          new Date().toISOString().split("T")[0]
                        }
                        className={`px-4 py-2 rounded-lg ${
                          routine.history?.[selectedDate]?.[task.id]
                            ? "bg-green-500"
                            : "bg-gray-300 dark:bg-gray-700"
                        }`}
                      >
                        <Text className="text-white font-bold">
                          {routine.history?.[selectedDate]?.[task.id]
                            ? "Done"
                            : "Pending"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                {/* Delete Routine */}
                <TouchableOpacity
                  onPress={() => deleteRoutine(routine.id)}
                  className="mt-4 bg-red-500 py-2 px-4 rounded-lg"
                >
                  <Text className="text-white font-bold text-center">
                    Delete Routine
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            // Empty State Display
            <View className="mt-10 items-center">
              <Ionicons
                name="calendar-outline"
                size={64}
                color="gray"
                className="mb-4"
              />
              <Text className="text-lg font-semibold text-gray-600 dark:text-gray-400 text-center">
                No routines found for the selected date.
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                Try selecting a different date or add a new routine.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/add-routine")}
                className="mt-6 bg-[#800020] py-3 px-4 rounded-lg"
              >
                <Text className="text-white font-bold text-center">
                  Add Routine
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => router.push("/add-routine")}
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
