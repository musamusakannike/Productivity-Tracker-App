import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { loadData, saveData } from "../utils/storage";
import moment from "moment";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
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

  const renderDateScroll = () => {
    const dates = [];
    for (let i = 0; i < 30; i++) {
      const date = moment().subtract(i, "days").format("YYYY-MM-DD");
      dates.unshift(date);
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-1 mt-4 max-h-[70px]"
      >
        {dates.reverse().map((date) => (
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
              {new Date(date).toDateString().slice(0, 3)} {/* Day */}
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
    );
  };

  const notesForSelectedDate = notes.filter(
    (note) => note.date === selectedDate
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900 px-6">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-6 mb-4">
          Diary
        </Text>

        {renderDateScroll()}

        {notesForSelectedDate.length > 0 ? (
          notesForSelectedDate.map((note) => (
            <View
              key={note.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 mt-4"
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
                {moment(note.date).format("MMMM D, YYYY")}
              </Text>

              {/* Actions */}
              {moment(selectedDate).isSameOrAfter(moment(), "day") && (
                <View className="flex-row justify-end gap-x-2 space-x-4 mt-2">
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/add-notes",
                        params: { noteId: note.id, date: selectedDate },
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
              )}
            </View>
          ))
        ) : (
          <View className="mt-10 items-center">
            <Ionicons name="document-outline" size={64} color="gray" />
            <Text className="text-lg font-semibold text-gray-600 dark:text-gray-400 text-center mt-4">
              No entries for this day.
            </Text>
            {moment(selectedDate).isSameOrAfter(moment(), "day") && (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/add-notes",
                    params: { date: selectedDate },
                  })
                }
                className="mt-6 bg-[#800020] py-3 px-4 rounded-lg"
              >
                <Text className="text-white font-bold text-center">Add Entry</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      {moment(selectedDate).isSameOrAfter(moment(), "day") && (
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/add-notes",
              params: { date: selectedDate },
            })
          }
          className="absolute bottom-6 right-6 bg-[#800020] p-4 rounded-full shadow-lg"
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}