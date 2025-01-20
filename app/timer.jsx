import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  // State for Stopwatch
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchTime, setStopwatchTime] = useState(0);

  const intervalRef = useRef(null); // For Timer
  const stopwatchIntervalRef = useRef(null); // For Stopwatch

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
  };

  // Reset Timer
  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTimeLeft(0);
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
      setSessions(JSON.parse(storedSessions) || []);
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
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          className="px-6"
        >
          {/* Timer UI */}
          {/* Title Input */}
          <TextInput
            placeholder="Session Title"
            placeholderTextColor={"#aaa"}
            value={title}
            onChangeText={setTitle}
            className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-4 rounded-lg shadow-sm mt-4"
          />

          {/* Time Picker */}
          <View className="flex-row justify-between mt-6">
            <TextInput
              placeholder="Hours"
              placeholderTextColor={"#aaa"}
              keyboardType="number-pad"
              value={hours.toString()}
              onChangeText={(text) => setHours(parseInt(text) || 0)}
              className="flex-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-4 rounded-lg shadow-sm mr-2"
            />
            <TextInput
              placeholder="Minutes"
              placeholderTextColor={"#aaa"}
              keyboardType="number-pad"
              value={minutes.toString()}
              onChangeText={(text) => setMinutes(parseInt(text) || 0)}
              className="flex-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-4 rounded-lg shadow-sm mr-2"
            />
            <TextInput
              placeholder="Seconds"
              placeholderTextColor={"#aaa"}
              keyboardType="number-pad"
              value={seconds.toString()}
              onChangeText={(text) => setSeconds(parseInt(text) || 0)}
              className="flex-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-4 rounded-lg shadow-sm"
            />
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
              <Text className="text-white font-bold text-center">Pomodoro</Text>
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

          {/* Timer Display */}
          {timeLeft > 0 && (
            <Text className="text-4xl font-bold text-center mt-6 text-gray-800 dark:text-gray-100">
              {`${Math.floor(timeLeft / 3600)
                .toString()
                .padStart(2, "0")}:${Math.floor((timeLeft % 3600) / 60)
                .toString()
                .padStart(2, "0")}:${(timeLeft % 60)
                .toString()
                .padStart(2, "0")}`}
            </Text>
          )}
        </ScrollView>
      )}

      {activeTab === "Stopwatch" && (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          className="px-6"
        >
          {/* Stopwatch UI */}
          <Text className="text-4xl font-bold text-center mt-6 text-gray-800 dark:text-gray-100">
            {`${Math.floor(stopwatchTime / 3600)
              .toString()
              .padStart(2, "0")}:${Math.floor((stopwatchTime % 3600) / 60)
              .toString()
              .padStart(2, "0")}:${(stopwatchTime % 60)
              .toString()
              .padStart(2, "0")}`}
          </Text>
          <View className="flex-row justify-between mt-6">
            <TouchableOpacity
              onPress={startStopwatch}
              className="flex-1 bg-green-500 py-3 rounded-lg mr-2"
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
                className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 shadow-sm"
              >
                <Text className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  {session.title}
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Duration: {session.duration}
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Started: {session.startTime}
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Ended: {session.endTime}
                </Text>
                <TouchableOpacity
                  onPress={() => deleteSession(index)}
                  className="mt-4 bg-red-500 py-2 px-4 rounded-lg"
                >
                  <Text className="text-white font-bold text-center">
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View className="items-center mt-10">
              <Ionicons name="time-outline" size={64} color="gray" />
              <Text className="text-lg text-gray-600 dark:text-gray-400 mt-4">
                No saved sessions yet.
              </Text>
            </View>
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
