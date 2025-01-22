import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { loadData, saveData } from "../utils/storage";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchNotes = async () => {
      const storedNotes = await loadData("notes");
      setNotes(storedNotes || []);
    };
    fetchNotes();
  }, []);

  const deleteNote = async (noteId) => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const updatedNotes = notes.filter((note) => note.id !== noteId);
          setNotes(updatedNotes);
          await saveData("notes", updatedNotes);
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900 px-6">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-6 mb-4">
          Notes
        </Text>

        {notes.length > 0 ? (
          notes.map((note) => (
            <View
              key={note.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4"
            >
              {note.heading ? (
                <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
                  {note.heading}
                </Text>
              ) : null}
              <Text className="text-gray-600 dark:text-gray-400 mb-2">
                {note.body}
              </Text>
              <Text className="text-gray-400 dark:text-gray-500 text-sm">
                {new Date(note.date).toLocaleDateString()}{" "}
                {/* Display note date */}
              </Text>

              {/* Actions */}
              <View className="flex-row justify-end gap-x-2 space-x-4 mt-2">
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/add-notes",
                      params: { noteId: note.id },
                    })
                  }
                  className="bg-blue-500 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-bold">Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => deleteNote(note.id)}
                  className="bg-red-500 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-bold">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View className="mt-10 items-center">
            <Ionicons name="document-outline" size={64} color="gray" />
            <Text className="text-lg font-semibold text-gray-600 dark:text-gray-400 text-center mt-4">
              No notes found.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/add-notes")}
              className="mt-6 bg-[#800020] py-3 px-4 rounded-lg"
            >
              <Text className="text-white font-bold text-center">Add Note</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => router.push("/add-notes")}
        className="absolute bottom-6 right-6 bg-[#800020] p-4 rounded-full shadow-lg"
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
