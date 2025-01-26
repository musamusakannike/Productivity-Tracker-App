import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";

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
  console.log(`Background fetch called at: ${new Date(now).toISOString()}`);

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

  // State for Timer
  const [activeTab, setActiveTab] = useState("Timer");
  const [title, setTitle] = useState("");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // Time left in seconds
  const [sessions, setSessions] = useState([]);

  const intervalRef = useRef(null); // For Timer

  // Request notification permissions on app start
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Notification permissions not granted!");
      }
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
            Alert.alert("Time's up!", "Great job completing your session!");
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
      Alert.alert(
        "Invalid Duration",
        "Please set a valid duration for the timer."
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
  }, []);

  // Delete a session
  const deleteSession = async (index) => {
    Alert.alert(
      "Delete Session",
      "Are you sure you want to delete this session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedSessions = sessions.filter((_, i) => i !== index);
            setSessions(updatedSessions);
            await AsyncStorage.setItem(
              "timerSessions",
              JSON.stringify(updatedSessions)
            );
          },
        },
      ]
    );
  };

  // Clear all sessions
  const clearAllSessions = async () => {
    Alert.alert(
      "Clear All Sessions",
      "Are you sure you want to clear all saved sessions?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            setSessions([]);
            await AsyncStorage.removeItem("timerSessions");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className={`flex-1 bg-gray-100 dark:bg-gray-900`}>
      {/* Tabs */}
      <View className="flex-row justify-around border-b border-gray-300 dark:border-gray-700">
        <TouchableOpacity onPress={() => setActiveTab("Timer")}>
          <Text
            className={`text-lg font-bold py-2 ${
              activeTab === "Timer"
                ? "text-gray-800 dark:text-gray-100"
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
                ? "text-gray-800 dark:text-gray-100"
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
                ? "text-gray-800 dark:text-gray-100"
                : "text-gray-400"
            }`}
          >
            Sessions
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "Timer" && (
        <ScrollView className="flex-1 px-6 py-4 bg-gray-100 dark:bg-gray-900">
          {/* Timer UI */}
          <View className="mt-6">
            {/* Timer Display */}
            {timeLeft > 0 && (
              <Text className="text-4xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">
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
              } bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100`}
            />

            {/* Time Pickers */}
            <View
              contentContainerStyle={{ paddingBottom: 40 }}
              className="flex-row justify-between items-center mt-6"
            >
              {/* Hours Picker */}
              <View className="flex-1 flex flex-col mx-1 justify-center">
                <Text className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 mx-auto">
                  Hours
                </Text>
                <Picker
                  selectedValue={hours.toString()}
                  onValueChange={(itemValue) =>
                    setHours(parseInt(itemValue, 10))
                  }
                  
                  style={{
                    backgroundColor: isDarkMode ? "#374151" : "#eee",
                    borderRadius: 10,
                    color: isDarkMode ? "#fff" : "#000",
                  }}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <Picker.Item
                      key={i}
                      label={i.toString()}
                      value={i.toString()}
                    />
                  ))}
                </Picker>
              </View>

              {/* Minutes Picker */}
              <View className="flex-1 flex flex-col mx-1 justify-center">
                <Text className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 mx-auto">
                  Minutes
                </Text>
                <Picker
                  selectedValue={minutes.toString()}
                  onValueChange={(itemValue) =>
                    setMinutes(parseInt(itemValue, 10))
                  }
                  style={{
                    backgroundColor: isDarkMode ? "#374151" : "#eee",
                    borderRadius: 10,
                    color: isDarkMode ? "#fff" : "#000",
                  }}
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <Picker.Item
                      key={i}
                      label={i.toString()}
                      value={i.toString()}
                    />
                  ))}
                </Picker>
              </View>

              {/* Seconds Picker */}
              <View className="flex-1 flex flex-col mx-1 justify-center">
                <Text className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 mx-auto">
                  Seconds
                </Text>
                <Picker
                  selectedValue={seconds.toString()}
                  onValueChange={(itemValue) =>
                    setSeconds(parseInt(itemValue, 10))
                  }
                  style={{
                    backgroundColor: isDarkMode ? "#374151" : "#eee",
                    borderRadius: 10,
                    color: isDarkMode ? "#fff" : "#000",
                  }}
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <Picker.Item
                      key={i}
                      label={i.toString()}
                      value={i.toString()}
                    />
                  ))}
                </Picker>
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
            {/* Pomodoro Buttons */}
            <View className="flex-row justify-between mt-4">
              <TouchableOpacity
                onPress={() => {
                  setHours(0);
                  setMinutes(25);
                  setSeconds(0);
                }}
                className="flex-1 bg-[#800020] py-3 rounded-lg mr-2"
              >
                <Text className="text-white font-bold text-center">
                  Pomodoro
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setHours(0);
                  setMinutes(5);
                  setSeconds(0);
                }}
                className="flex-1 bg-gray-300 dark:bg-gray-700 py-3 rounded-lg"
              >
                <Text className="text-gray-800 dark:text-gray-100 font-bold text-center">
                  Rest
                </Text>
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
            <View className="w-64 h-64 p-3 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center shadow-md">
              <Text className="text-5xl font-bold text-gray-800 dark:text-gray-100">
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
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-6 mb-4">
            Saved Sessions
          </Text>
          {sessions.length > 0 ? (
            sessions.map((session, index) => (
              <View
                key={index}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-4"
              >
                <Text className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  {session.title}
                </Text>
                <Text className="text-gray-600 dark:text-gray-300">
                  Duration: {session.duration}
                </Text>
                <Text className="text-gray-600 dark:text-gray-300">
                  Started: {session.startTime}
                </Text>
                <Text className="text-gray-600 dark:text-gray-300">
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
            <Text className="text-center text-gray-500 dark:text-gray-400">
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
