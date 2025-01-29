import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";
import CustomAlert from "../../components/UI/CustomAlert";
import { useTheme } from "../../context/ThemeContext";

// Define the background task name
const BACKGROUND_FETCH_TASK = "background-timer-task";

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Define the background task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  const now = Date.now();

  // Retrieve the timer state from AsyncStorage
  const timerState = await AsyncStorage.getItem("timerState");
  if (timerState) {
    const { timeLeft, isRunning } = JSON.parse(timerState);

    if (isRunning && timeLeft > 0) {
      const newTimeLeft = timeLeft - 1;
      await AsyncStorage.setItem(
        "timerState",
        JSON.stringify({ timeLeft: newTimeLeft, isRunning: newTimeLeft > 0 })
      );

      if (newTimeLeft <= 0) {
        // Timer completed, send a notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Time's up!",
            body: "Great job completing your session!",
            sound: true,
          },
          trigger: null, // Send immediately
        });
      }
    }
  }

  return BackgroundFetch.Result.NewData;
});

// Register the background task
async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 60, // 1 minute (minimum interval in seconds)
    stopOnTerminate: false, // Continue task even if app is terminated
    startOnBoot: true, // Start task when device boots
  });
}

// Unregister the background task
async function unregisterBackgroundFetchAsync() {
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
}

export default function TimerPage() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const { theme } = useTheme();

  // State for Timer
  const [activeTab, setActiveTab] = useState("Timer");
  const [title, setTitle] = useState("");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // Time left in seconds
  const [sessions, setSessions] = useState([]);

  // State for Stopwatch
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);

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

  const intervalRef = useRef(null); // For Timer
  const stopwatchIntervalRef = useRef(null); // For Stopwatch

  // Request notification permissions on app start
  useEffect(() => {
    const requestPermissions = async () => {
      await Notifications.requestPermissionsAsync();
    };

    requestPermissions();
  }, []);

  // Load timer state from AsyncStorage on app start
  useEffect(() => {
    const loadTimerState = async () => {
      const timerState = await AsyncStorage.getItem("timerState");
      if (timerState) {
        const { timeLeft, isRunning } = JSON.parse(timerState);
        setTimeLeft(timeLeft);
        setIsRunning(isRunning);
      }
    };
    loadTimerState();
  }, []);

  // Update Timer Countdown
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            saveSession();
            showAlert(
              "Time's up!",
              "Great job completing your session!",
              () => {
                setAlertVisible(false);
              },
              "Close"
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // Update Stopwatch Time
  useEffect(() => {
    if (stopwatchRunning) {
      stopwatchIntervalRef.current = setInterval(() => {
        setStopwatchTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(stopwatchIntervalRef.current);
    }

    return () => clearInterval(stopwatchIntervalRef.current);
  }, [stopwatchRunning]);

  // Save timer state to AsyncStorage whenever it changes
  useEffect(() => {
    const saveTimerState = async () => {
      await AsyncStorage.setItem(
        "timerState",
        JSON.stringify({ timeLeft, isRunning })
      );
    };
    saveTimerState();
  }, [timeLeft, isRunning]);

  // Start Timer
  const startTimer = () => {
    if (hours === 0 && minutes === 0 && seconds === 0) {
      showAlert(
        "Invalid Duration",
        "Please set a valid duration for the timer.",
        () => {
          setAlertVisible(false);
        },
        "Close"
      );
      return;
    }

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    setTimeLeft(totalSeconds);
    setIsRunning(true);

    // Register the background task
    registerBackgroundFetchAsync();
  };

  // Reset Timer
  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTimeLeft(0);

    // Unregister the background task
    unregisterBackgroundFetchAsync();
  };

  // Save Completed Timer Session
  const saveSession = async () => {
    const session = {
      title: title || "Untitled",
      duration: `${hours}h ${minutes}m ${seconds}s`,
      startTime: new Date(
        Date.now() - (timeLeft + 1) * 1000
      ).toLocaleTimeString(),
      endTime: new Date().toLocaleTimeString(),
    };

    const storedSessions =
      (await AsyncStorage.getItem("timerSessions")) || "[]";
    const updatedSessions = [...JSON.parse(storedSessions), session];
    await AsyncStorage.setItem(
      "timerSessions",
      JSON.stringify(updatedSessions)
    );
  };

  // Stopwatch Controls
  const startStopwatch = () => setStopwatchRunning(true);
  const pauseStopwatch = () => setStopwatchRunning(false);
  const resetStopwatch = () => {
    setStopwatchRunning(false);
    setStopwatchTime(0);
  };

  // Load saved sessions
  useEffect(() => {
    const fetchSessions = async () => {
      const storedSessions = await AsyncStorage.getItem("timerSessions");
      const fetchedSessions = JSON.parse(storedSessions) || [];
      const sortedSessions = [...fetchedSessions].reverse();
      setSessions(sortedSessions);
    };
    fetchSessions();
  }, [activeTab]);

  // Delete a session
  const deleteSession = async (index) => {
    showAlert(
      "Delete session",
      "Are you sure you want to delete this session?",
      async () => {
        const updatedSessions = sessions.filter((_, i) => i !== index);
        setSessions(updatedSessions);
        await AsyncStorage.setItem(
          "timerSessions",
          JSON.stringify(updatedSessions)
        );
        setAlertVisible(false);
      },
      "Delete"
    );
  };

  // Clear all sessions
  const clearAllSessions = async () => {
    showAlert(
      "Clear All Sessions",
      "Are you sure you want to clear all saved sessions?",
      async () => {
        setSessions([]);
        await AsyncStorage.removeItem("timerSessions");
        setAlertVisible(false);
      },
      "Clear"
    );
  };

  return (
    <SafeAreaView
      className={`flex-1 ${theme === "light" ? "bg-gray-100" : "bg-gray-900"}`}
    >
      {/* Tabs */}
      <View
        className={`flex-row justify-around border-b ${
          theme === "light" ? "border-gray-300" : "border-gray-700"
        }`}
      >
        <TouchableOpacity onPress={() => setActiveTab("Timer")}>
          <Text
            className={`text-lg font-bold py-2 ${
              activeTab === "Timer"
                ? theme === "light"
                  ? "text-gray-800"
                  : "text-gray-100"
                : "text-gray-400"
            }`}
          >
            Timer
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("Stopwatch")}>
          <Text
            className={`text-lg font-bold py-2 ${
              activeTab === "Stopwatch"
                ? theme === "light"
                  ? "text-gray-800"
                  : "text-gray-100"
                : "text-gray-400"
            }`}
          >
            Stopwatch
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("Sessions")}>
          <Text
            className={`text-lg font-bold py-2 ${
              activeTab === "Sessions"
                ? theme === "light"
                  ? "text-gray-800"
                  : "text-gray-100"
                : "text-gray-400"
            }`}
          >
            Sessions
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "Timer" && (
        <ScrollView
          className={`flex-1 px-6 py-4 ${
            theme === "light" ? "bg-gray-100" : "bg-gray-900"
          }`}
        >
          <View className="mt-6">
            {/* Timer Display */}
            {timeLeft > 0 && (
              <Text
                className={`text-4xl font-bold text-center mb-6 ${
                  theme === "light" ? "text-gray-800" : "text-gray-100"
                }`}
              >
                {`${Math.floor(timeLeft / 3600)
                  .toString()
                  .padStart(2, "0")}:${Math.floor((timeLeft % 3600) / 60)
                  .toString()
                  .padStart(2, "0")}:${(timeLeft % 60)
                  .toString()
                  .padStart(2, "0")}`}
              </Text>
            )}

            {/* Title Input */}
            <TextInput
              placeholder="Session Title"
              placeholderTextColor="#aaa"
              value={title}
              onChangeText={setTitle}
              className={`p-4 rounded-lg shadow-sm ${
                title === ""
                  ? "border border-red-500"
                  : "border border-transparent"
              } ${
                theme === "light"
                  ? "bg-white text-gray-800"
                  : "bg-gray-800 text-gray-100"
              }`}
            />

            {/* Time Inputs */}
            <View className="flex-row justify-between mt-6">
              {/* Hours Input */}
              <View className="flex-1 mx-1">
                <Text
                  className={`text-sm font-medium text-center mb-2 ${
                    theme === "light" ? "text-gray-800" : "text-gray-200"
                  }`}
                >
                  Hours
                </Text>
                <TextInput
                  keyboardType="numeric"
                  maxLength={2}
                  value={hours}
                  onChangeText={setHours}
                  placeholder="HH"
                  placeholderTextColor="#aaa"
                  className={`text-center rounded-lg py-3 text-lg ${
                    theme === "light"
                      ? "text-gray-800 bg-white"
                      : "text-gray-100 bg-gray-800 "
                  }`}
                />
              </View>

              {/* Minutes Input */}
              <View className="flex-1 mx-1">
                <Text
                  className={`text-sm font-medium ${
                    theme === "light" ? "text-gray-800" : "text-gray-200"
                  } mb-2 text-center`}
                >
                  Minutes
                </Text>
                <TextInput
                  keyboardType="numeric"
                  maxLength={2}
                  value={minutes}
                  onChangeText={setMinutes}
                  placeholder="MM"
                  placeholderTextColor="#aaa"
                  className={`text-center rounded-lg py-3 text-lg ${
                    theme === "light"
                      ? "text-gray-800 bg-white"
                      : "text-gray-100 bg-gray-800"
                  }`}
                />
              </View>

              {/* Seconds Input */}
              <View className="flex-1 mx-1">
                <Text
                  className={`text-sm font-medium ${
                    theme === "light" ? "text-gray-800" : "text-gray-200"
                  } mb-2 text-center`}
                >
                  {" "}
                  Seconds
                </Text>
                <TextInput
                  keyboardType="numeric"
                  maxLength={2}
                  value={seconds}
                  onChangeText={setSeconds}
                  placeholder="SS"
                  placeholderTextColor="#aaa"
                  className={`text-center rounded-lg py-3 text-lg ${
                    theme === "light"
                      ? "text-gray-800 bg-white"
                      : "text-gray-100 bg-gray-800 "
                  }`}
                />
              </View>
            </View>

            {/* Timer Controls */}
            <View className="flex-row justify-between mt-6">
              <TouchableOpacity
                onPress={startTimer}
                className="flex-1 bg-green-500 py-3 rounded-lg mr-2"
              >
                <Text className="text-white font-bold text-center">Start</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={resetTimer}
                className="flex-1 bg-red-500 py-3 rounded-lg"
              >
                <Text className="text-white font-bold text-center">Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}

      {activeTab === "Stopwatch" && (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          className="px-6"
        >
          {/* Stopwatch UI */}
          <View className="flex items-center mt-16">
            <View
              className={`w-64 h-64 p-3 rounded-full ${
                theme === "light" ? "bg-gray-200" : "bg-gray-800"
              } flex items-center justify-center shadow-md`}
            >
              <Text
                className={`text-5xl font-bold ${
                  theme === "light" ? "text-gray-800" : "text-gray-100"
                }`}
              >
                {`${Math.floor(stopwatchTime / 3600)
                  .toString()
                  .padStart(2, "0")}:${Math.floor((stopwatchTime % 3600) / 60)
                  .toString()
                  .padStart(2, "0")}:${(stopwatchTime % 60)
                  .toString()
                  .padStart(2, "0")}`}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between mt-10">
            <TouchableOpacity
              onPress={startStopwatch}
              disabled={stopwatchRunning}
              className={`${
                stopwatchRunning
                  ? "flex-1 bg-green-400 py-3 rounded-lg mr-2"
                  : "flex-1 bg-green-500 py-3 rounded-lg mr-2"
              }`}
            >
              <Text className="text-white font-bold text-center">Start</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={pauseStopwatch}
              className="flex-1 bg-yellow-500 py-3 rounded-lg mr-2"
            >
              <Text className="text-white font-bold text-center">Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={resetStopwatch}
              className="flex-1 bg-red-500 py-3 rounded-lg"
            >
              <Text className="text-white font-bold text-center">Reset</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {activeTab === "Sessions" && (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          className="px-6"
        >
          <Text
            className={`text-lg font-bold ${
              theme === "light" ? "text-gray-800" : "text-gray-100"
            } mt-6 mb-4`}
          >
            Saved Sessions
          </Text>
          {sessions.length > 0 ? (
            sessions.map((session, index) => (
              <View
                key={index}
                className={`${
                  theme === "light" ? "bg-white" : "bg-gray-800"
                } p-4 rounded-lg shadow-sm mb-4`}
              >
                <Text
                  className={`text-lg font-bold ${
                    theme === "light" ? "text-gray-800" : "text-gray-100"
                  }`}
                >
                  {session.title}
                </Text>
                <Text
                  className={`text-gray-600 ${
                    theme === "light" ? "text-gray-600" : "text-gray-300"
                  }`}
                >
                  Duration: {session.duration}
                </Text>
                <Text
                  className={`text-gray-600 ${
                    theme === "light" ? "text-gray-600" : "text-gray-300"
                  }`}
                >
                  Started: {session.startTime}
                </Text>
                <Text
                  className={`text-gray-600 ${
                    theme === "light" ? "text-gray-600" : "text-gray-300"
                  }`}
                >
                  Ended: {session.endTime}
                </Text>
                <TouchableOpacity
                  onPress={() => deleteSession(index)}
                  className="mt-2 bg-red-500 py-2 rounded-lg"
                >
                  <Text className="text-white font-bold text-center">
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text
              className={`text-center ${
                theme === "light" ? "text-gray-500" : "text-gray-400"
              }`}
            >
              No sessions saved yet.
            </Text>
          )}
          {sessions.length > 0 && (
            <TouchableOpacity
              onPress={clearAllSessions}
              className="mt-6 bg-[#800020] py-3 px-6 rounded-lg"
            >
              <Text className="text-white font-bold text-center">
                Clear All Sessions
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  pickerStyle: {
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  textStyle: {
    color: "#000",
    fontSize: 18,
  },
});
