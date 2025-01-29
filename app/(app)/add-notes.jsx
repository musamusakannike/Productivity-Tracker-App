import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { loadData, saveData } from "../../utils/storage";
import moment from "moment";
import CustomAlert from "../../components/UI/CustomAlert";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../context/ThemeContext";

export default function AddNotes() {
  const { noteId, date } = useLocalSearchParams();
  const [heading, setHeading] = useState("");
  const [body, setBody] = useState("");
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
    setAlertAction(() => action); // Ensure action is a function
    setAlertVisible(true);
    setAlertConfirmText(alertText);
  };

  useEffect(() => {
    const fetchNote = async () => {
      if (noteId) {
        const storedNotes = await loadData("notes");
        const noteToEdit = storedNotes.find((n) => n.id === noteId);
        if (noteToEdit) {
          setHeading(noteToEdit.heading || "");
          setBody(noteToEdit.body || "");
        }
      }
    };
    fetchNote();
  }, [noteId]);

  const handleSaveNote = async () => {
    if (!body.trim()) {
      showAlert(
        "Error",
        "Note body is required.",
        () => setAlertVisible(false), // Pass a function to close the alert
        "OK"
      );
      return;
    }

    const newNote = {
      id: noteId || Date.now().toString(),
      heading: heading.trim(),
      body: body.trim(),
      date: date || moment().format("YYYY-MM-DD"),
    };

    const existingNotes = await loadData("notes");
    const updatedNotes = noteId
      ? existingNotes.map((n) => (n.id === noteId ? newNote : n))
      : [...existingNotes, newNote];

    await saveData("notes", updatedNotes);
    router.push("/notes");
  };

  return (
    <SafeAreaView
      className={`flex-1 px-6 ${
        theme === "light" ? "bg-gray-100" : "bg-gray-900"
      }`}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <Text
          className={`text-lg font-bold ${
            theme === "light" ? "text-gray-800" : "text-gray-100"
          } mt-6 mb-4`}
        >
          {noteId ? "Edit Entry" : "Add Entry"}
        </Text>

        {/* Note Heading */}
        <TextInput
          placeholder="Heading (Optional)"
          placeholderTextColor="#aaa"
          value={heading}
          onChangeText={setHeading}
          className={`p-4 rounded-lg shadow-sm mt-4 ${
            theme === "light"
              ? "bg-white text-gray-800"
              : "bg-gray-800 text-gray-100"
          }`}
        />

        {/* Note Body */}
        <TextInput
          placeholder="Note Body"
          placeholderTextColor="#aaa"
          value={body}
          onChangeText={setBody}
          multiline
          className={`p-4 rounded-lg shadow-sm mt-4 ${
            theme === "light"
              ? "bg-white text-gray-800"
              : "bg-gray-800 text-gray-100"
          }`}
          style={{ minHeight: 100 }}
        />

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSaveNote}
          className="mt-6 bg-[#800020] py-3 px-4 rounded-lg"
        >
          <Text className="text-white font-bold text-center">
            {noteId ? "Save Changes" : "Add Entry"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Custom Alert */}
      <CustomAlert
        isVisible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        confirmText={alertConfirmText}
        onCancel={() => setAlertVisible(false)} // Close on cancel
        onConfirm={() => {
          setAlertVisible(false); // Close the alert
        }}
      />
    </SafeAreaView>
  );
}
