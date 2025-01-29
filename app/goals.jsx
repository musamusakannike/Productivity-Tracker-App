import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { loadData, saveData } from "../utils/storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import CustomAlert from "../components/UI/CustomAlert";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [theme, setTheme] = useState("light");
  const router = useRouter();

  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertAction, setAlertAction] = useState(() => {});
  const [alertConfirmText, setAlertConfirmText] = useState("Confirm");

  // Fetch goals from storage
  useEffect(() => {
    const fetchTheme = async () => {
      const storedTheme = await AsyncStorage.getItem("appTheme");
      if (storedTheme) {
        setTheme(storedTheme);
      } else {
        await AsyncStorage.setItem("appTheme", "light");
      }
      console.log("Goals page theme set to:", storedTheme);
    };
    const fetchGoals = async () => {
      const storedGoals = await loadData("goals");
      setGoals(storedGoals || []);
    };
    fetchTheme();
    fetchGoals();
  }, []);

  const showAlert = (title, message, action, alertText) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertAction(() => action);
    setAlertVisible(true);
    setAlertConfirmText(alertText);
  };

  const deleteGoal = async (goalId) => {
    showAlert(
      "Delete Goal",
      "Are you sure you want to delete this goal?",
      async () => {
        const updatedGoals = goals.filter((goal) => goal.id !== goalId);
        setGoals(updatedGoals);
        await saveData("goals", updatedGoals);
        setAlertVisible(false); // Hide alert after action
      },
      "Delete"
    );
  };

  const toggleMilestone = async (goalId, milestoneId) => {
    const updatedGoals = goals.map((goal) => {
      if (goal.id === goalId) {
        const updatedMilestones = goal.milestones.map((milestone) =>
          milestone.id === milestoneId
            ? { ...milestone, completed: !milestone.completed }
            : milestone
        );
        const allMilestonesCompleted = updatedMilestones.every(
          (milestone) => milestone.completed
        );
        return {
          ...goal,
          milestones: updatedMilestones,
          completed: allMilestonesCompleted,
        };
      }
      return goal;
    });
    setGoals(updatedGoals);
    await saveData("goals", updatedGoals);
  };

  const calculateProgress = (milestones) => {
    const completed = milestones.filter(
      (milestone) => milestone.completed
    ).length;
    return Math.round((completed / milestones.length) * 100);
  };

  const completedGoals = goals.filter((goal) => goal.completed);
  const uncompletedGoals = goals.filter((goal) => !goal.completed);

  return (
    <SafeAreaView
      className={`flex-1 ${
        theme === "light" ? "bg-gray-100" : "bg-gray-900"
      } px-6`}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Uncompleted Goals */}
        <Text
          className={`text-lg font-bold ${
            theme === "light" ? "text-gray-800" : "text-gray-100"
          } mt-6 mb-4`}
        >
          Uncompleted Goals
        </Text>
        {uncompletedGoals.length > 0 ? (
          uncompletedGoals.map((goal) => (
            <View
              key={goal.id}
              className={` ${
                theme === "light" ? "bg-white" : "bg-gray-800"
              } p-4 rounded-lg mb-4`}
            >
              <Text
                className={`text-lg font-bold ${
                  theme === "light" ? "text-gray-800" : "text-gray-100"
                }`}
              >
                {goal.name}
              </Text>
              <Text
                className={`text-sm ${
                  theme === "light" ? "text-gray-600" : "text-gray-400"
                }`}
              >
                {goal.description}
              </Text>
              <Text
                className={`text-sm ${
                  theme === "light" ? "text-gray-600" : "text-gray-400"
                } mt-2`}
              >
                Deadline: {goal.deadline}
              </Text>
              <View className="mt-4">
                <Text
                  className={`text-sm font-bold ${
                    theme === "light" ? "text-gray-800" : "text-gray-100"
                  } mb-2`}
                >
                  Milestones ({calculateProgress(goal.milestones)}% completed)
                </Text>
                {goal.milestones.map((milestone) => (
                  <View
                    key={milestone.id}
                    className="flex-row items-center justify-between mb-2"
                  >
                    <Text
                      className={`${
                        theme === "light" ? "text-gray-800" : "text-gray-100"
                      }`}
                    >
                      {milestone.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => toggleMilestone(goal.id, milestone.id)}
                      className={`px-4 py-2 rounded-lg ${
                        milestone.completed
                          ? "bg-green-500"
                          : theme === "light"
                          ? "bg-gray-300"
                          : "bg-gray-700"
                      }`}
                    >
                      <Text className="text-white font-bold">
                        {milestone.completed ? "Done" : "Pending"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                onPress={() => deleteGoal(goal.id)}
                className="mt-4 bg-red-500 py-2 px-4 rounded-lg"
              >
                <Text className="text-white font-bold text-center">Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View className="items-center mt-10">
            <Ionicons name="list-outline" size={64} color="gray" />
            <Text
              className={`text-lg ${
                theme === "light" ? "text-gray-600" : "text-gray-400"
              } mt-4`}
            >
              No uncompleted goals.
            </Text>
          </View>
        )}

        {/* Completed Goals */}
        <Text
          className={`text-lg font-bold ${
            theme === "light" ? "text-gray-800" : "text-gray-100"
          } mt-6 mb-4`}
        >
          Completed Goals
        </Text>
        {completedGoals.length > 0 ? (
          completedGoals.map((goal) => (
            <View
              key={goal.id}
              className={` ${
                theme === "light" ? "bg-white" : "bg-gray-800"
              } p-4 rounded-lg mb-4`}
            >
              <Text
                className={`text-lg font-bold ${
                  theme === "light" ? "text-gray-800" : "text-gray-100"
                }`}
              >
                {goal.name}
              </Text>
              <Text
                className={`text-sm ${
                  theme === "light" ? "text-gray-600" : "text-gray-400"
                }`}
              >
                {goal.description}
              </Text>
              <Text
                className={`text-sm ${
                  theme === "light" ? "text-gray-600" : "text-gray-400"
                } mt-2`}
              >
                Completed On: {goal.deadline}
              </Text>
            </View>
          ))
        ) : (
          <View className="items-center mt-10">
            <Ionicons name="checkmark-circle-outline" size={64} color="gray" />
            <Text
              className={`text-lg ${
                theme === "light" ? "text-gray-600" : "text-gray-400"
              } mt-4`}
            >
              No completed goals.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => router.push("/add-goal")}
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
