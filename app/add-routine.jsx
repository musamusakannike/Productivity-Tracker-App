import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { saveData, loadData } from "../utils/storage";

export default function AddRoutine() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const router = useRouter();

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
      alert("Please provide a routine name and at least one task.");
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

    router.push("/routines");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900 px-6">
      <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-6 mb-4">
        Add a New Routine
      </Text>

      {/* Routine Name */}
      <TextInput
        placeholder="Routine Name"
        value={name}
        onChangeText={setName}
        className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-4 rounded-lg shadow-sm mt-4"
      />

      {/* Routine Description */}
      <TextInput
        placeholder="Optional Description"
        value={description}
        onChangeText={setDescription}
        multiline
        className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-4 rounded-lg shadow-sm mt-4"
      />

      {/* Tasks */}
      <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mt-4">
        Add Tasks
      </Text>
      <View className="flex-row items-center mt-2">
        <TextInput
          placeholder="Task Name"
          value={taskInput}
          onChangeText={setTaskInput}
          className="flex-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-4 rounded-lg shadow-sm"
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
          <View className="flex-row justify-between items-center mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <Text className="text-gray-800 dark:text-gray-100">{item.name}</Text>
            <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
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
    </SafeAreaView>
  );
}