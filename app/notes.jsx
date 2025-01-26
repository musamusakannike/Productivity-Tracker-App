import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import CustomAlert from "../components/UI/CustomAlert";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    moment().format("YYYY-MM-DD")
  );
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [notesPassword, setNotesPassword] = useState(null);
  const [isSettingNewPassword, setIsSettingNewPassword] = useState(false);

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

  const loadData = async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Error loading data:", error);
      return null;
    }
  };

  const saveData = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  useEffect(() => {
    const checkPassword = async () => {
      try {
        const storedPassword = await loadData("notesPassword");
        if (!storedPassword || storedPassword === null) {
          setIsSettingNewPassword(true);
          setIsPasswordModalVisible(true);
        } else {
          setNotesPassword(storedPassword);
          setIsPasswordModalVisible(true);
        }
      } catch (error) {
        console.error("Error loading password:", error);
      }
    };

    if (!isPasswordModalVisible && notesPassword) {
      fetchNotes();
    }

    checkPassword();
  }, [notesPassword]);

  const handlePasswordSubmit = async () => {
    if (passwordInput.trim() === "") {
      showAlert(
        "Invalid Password",
        "Password cannot be empty.",
        () => {
          setAlertVisible(false);
        },
        "OK"
      );
      return;
    }

    if (isSettingNewPassword) {
      try {
        await saveData("notesPassword", passwordInput);
        setNotesPassword(passwordInput);
        setIsSettingNewPassword(false);
        setIsPasswordModalVisible(false);
        showAlert(
          "Success",
          "Password has been set.",
          () => {
            setAlertVisible(false);
          },
          "OK"
        );
      } catch (error) {
        console.error("Error saving password:", error);
        showAlert(
          "Error",
          "Could not save password. Try again.",
          () => {
            setAlertVisible(false);
          },
          "OK"
        );
      }
    } else {
      if (passwordInput === notesPassword) {
        setIsPasswordModalVisible(false);
        fetchNotes();
      } else {
        showAlert(
          "Incorrect Password",
          "Please try again.",
          () => {
            setAlertVisible(false);
          },
          "OK"
        );
      }
    }

    setPasswordInput("");
  };

  const renderPasswordModal = () => (
    <Modal
      transparent={true}
      visible={isPasswordModalVisible}
      animationType="slide"
      onRequestClose={() => setIsPasswordModalVisible(false)}
    >
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="bg-white dark:bg-gray-800 p-6 rounded-lg w-80">
          <Text className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {isSettingNewPassword
              ? "Please set a secure password for your notes."
              : "Enter your password to access your notes."}
          </Text>
          <TextInput
            className="border border-gray-300 dark:border-gray-700 p-2 rounded-lg mb-4 text-gray-800 dark:text-gray-100"
            placeholder="Password"
            placeholderTextColor={"#aaa"}
            secureTextEntry
            value={passwordInput}
            onChangeText={setPasswordInput}
          />
          <TouchableOpacity
            onPress={handlePasswordSubmit}
            className="bg-[#800020] py-2 px-4 rounded-lg"
          >
            <Text className="text-white font-bold text-center">Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const fetchNotes = async () => {
    const storedNotes = await loadData("notes");
    setNotes(storedNotes || []);
  };

  const deleteNote = async (noteId) => {
    showAlert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      async () => {
        const updatedNotes = notes.filter((note) => note.id !== noteId);
        setNotes(updatedNotes);
        await saveData("notes", updatedNotes);
      },
      "Delete"
    );
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
      {renderPasswordModal()}
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 my-2">
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
                <Text className="text-white font-bold text-center">
                  Add Entry
                </Text>
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
