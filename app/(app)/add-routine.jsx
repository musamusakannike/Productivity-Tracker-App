import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { saveData, loadData } from "../../utils/storage";
import CustomAlert from "../../components/UI/CustomAlert";
import { useTheme } from "../../context/ThemeContext";

export default function AddRoutine() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const { theme } = useTheme();
  const router = useRouter();

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

  const handleAddTask = () => {
    if (taskInput.trim()) {
      setTasks([...tasks, { id: Date.now().toString(), name: taskInput }]);
      setTaskInput("");
    }
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const handleSaveRoutine = async () => {
    if (!name || tasks.length === 0) {
      showAlert(
        "Error",
        "Please provide a routine name and at least one task.",
        () => {
          setAlertVisible(false);
        },
        "OK"
      );
      return;
    }

    const newRoutine = {
      id: Date.now().toString(),
      name,
      description,
      tasks: tasks.map((task) => ({ ...task, completed: false })),
      startDate: new Date().toISOString().split("T")[0], // Add the start date
      history: {}, // Start with no history
      frequency: "Daily", // Default to daily
    };

    const existingRoutines = await loadData("routines");
    const updatedRoutines = [...existingRoutines, newRoutine];
    await saveData("routines", updatedRoutines);

    router.replace("/routines");
  };

  return (
    <SafeAreaView
      className={`flex-1 ${
        theme === "light" ? "bg-gray-100" : "bg-gray-900"
      } px-6`}
    >
      <Text
        className={`text-lg font-bold ${
          theme === "light" ? "text-gray-800" : "text-gray-100"
        } mt-6 mb-4`}
      >
        Add a New Routine
      </Text>

      {/* Routine Name */}
      <TextInput
        placeholder="Routine Name"
        placeholderTextColor={"#aaa"}
        value={name}
        onChangeText={setName}
        className={` ${
          theme === "light"
            ? "text-gray-800 bg-white"
            : "text-gray-100 bg-gray-800"
        } p-4 rounded-lg shadow-sm mt-4`}
      />

      {/* Routine Description */}
      <TextInput
        placeholder="Optional Description"
        placeholderTextColor={"#aaa"}
        value={description}
        onChangeText={setDescription}
        multiline
        className={` ${
          theme === "light"
            ? "text-gray-800 bg-white"
            : "text-gray-100 bg-gray-800"
        } p-4 rounded-lg shadow-sm mt-4`}
      />

      {/* Tasks */}
      <Text
        className={`text-sm font-semibold ${
          theme === "light" ? "text-gray-600" : "text-gray-400"
        } mt-4`}
      >
        Add Tasks
      </Text>
      <View className="flex-row items-center mt-2">
        <TextInput
          placeholder="Task Name"
          placeholderTextColor={"#aaa"}
          value={taskInput}
          onChangeText={setTaskInput}
          className={`flex-1 ${
            theme === "light"
              ? "bg-white text-gray-800"
              : "bg-gray-800 text-gray-100"
          } p-4 rounded-lg shadow-sm`}
        />
        <TouchableOpacity
          onPress={handleAddTask}
          className="ml-2 bg-[#800020] p-4 rounded-lg"
        >
          <Text className="text-white font-bold">Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            className={`flex-row w-full gap-1 justify-between items-center mt-4 ${
              theme === "light" ? "bg-white" : "bg-gray-800"
            } p-4 rounded-lg shadow-sm`}
          >
            <Text
              className={`w-[80%] ${
                theme === "light" ? "text-gray-800" : "text-gray-100"
              }`}
            >
              {item.name}
            </Text>
            <TouchableOpacity onPress={() => handleDeleteTask(item.id)} className="w-[16%]">
              <Text className="text-red-500 font-bold">Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Save Routine */}
      <TouchableOpacity
        onPress={handleSaveRoutine}
        className="mt-6 bg-[#800020] py-3 px-4 rounded-lg"
      >
        <Text className="text-white text-center font-bold">Save Routine</Text>
      </TouchableOpacity>
      {/* Custom Alert */}
      <CustomAlert
        isVisible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onConfirm={alertAction}
        confirmText={alertConfirmText}
        onCancel={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}
