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
import CustomAlert from "../../components/UI/CustomAlert";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

export default function Notes() {
  const { isAuthenticated, setAuthenticated, notesPassword, setNotesPassword } =
    useAuth();
  const [notes, setNotes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    moment().format("YYYY-MM-DD")
  );
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isSettingNewPassword, setIsSettingNewPassword] = useState(false);
  const { theme } = useTheme();

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
      return value ? value : null;
    } catch (error) {
      console.error(`Error loading data for key "${key}":`, error);
      return null;
    }
  };

  const saveData = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  useEffect(() => {
    const checkPassword = async () => {
      const storedPassword = await loadData("notesPassword");
      // console.log("Stored Password:", storedPassword);
      if (!storedPassword) {
        setIsSettingNewPassword(true);
        setIsPasswordModalVisible(true);
      } else {
        setIsSettingNewPassword(false);
        setIsPasswordModalVisible(true);
      }
    };

    if (!isAuthenticated) {
      checkPassword();
      // console.log("You're not authenticated.");
    } else {
      fetchNotes();
      // console.log("You're authenticated.");
    }
  }, []);

  const handlePasswordSubmit = async () => {
    if (passwordInput.trim() === "") {
      alert("Password cannot be empty.");
      return;
    }

    if (isSettingNewPassword) {
      try {
        await saveData("notesPassword", passwordInput);
        setNotesPassword(passwordInput);
        setAuthenticated(true);
        setIsSettingNewPassword(false);
        setIsPasswordModalVisible(false);
      } catch (error) {
        console.error("Error saving password:", error);
        alert("Could not save password. Try again.");
      }
    } else {
      // console.log("Password input:", passwordInput, typeof passwordInput);
      // console.log("Notes password:", notesPassword, typeof notesPassword);

      if (`${passwordInput}` === notesPassword) {
        setAuthenticated(true);
        setIsPasswordModalVisible(false);
      } else {
        alert("Incorrect password. Please try again.");
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
        <View
          className={`${
            theme === "light" ? "bg-white" : "bg-gray-800"
          } p-6 rounded-lg w-80`}
        >
          <Text
            className={`${
              theme === "light" ? "text-gray-600" : "text-gray-400"
            } mb-4`}
          >
            {isSettingNewPassword
              ? "Please set a secure password for your notes."
              : "Enter your password to access your notes."}
          </Text>
          <TextInput
            className={`border ${
              theme === "light" ? "border-gray-300" : "border-gray-700"
            } p-2 rounded-lg mb-4`}
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
    setNotes(Array.isArray(storedNotes) ? storedNotes : []);
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
                : theme === "light"
                ? "bg-gray-200"
                : "bg-gray-700"
            }`}
          >
            <Text
              className={`text-xs font-light ${
                date === selectedDate
                  ? "text-white"
                  : theme === "light"
                  ? "text-gray-800"
                  : "text-gray-100"
              }`}
            >
              {new Date(date).toDateString().slice(0, 3)} {/* Day */}
            </Text>
            <Text
              className={`text-lg font-bold ${
                date === selectedDate
                  ? "text-white"
                  : theme === "light"
                  ? "text-gray-800"
                  : "text-gray-100"
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
    <SafeAreaView
      className={`flex-1 ${
        theme === "light" ? "bg-gray-100" : "bg-gray-900"
      } px-6`}
    >
      {renderPasswordModal()}
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <Text
          className={`text-lg font-bold ${
            theme === "light" ? "text-gray-800" : "text-gray-100"
          } my-2`}
        >
          Diary
        </Text>

        {renderDateScroll()}

        {notesForSelectedDate.length > 0 ? (
          notesForSelectedDate.map((note) => (
            <View
              key={note.id}
              className={`${
                theme === "light" ? "bg-white" : "bg-gray-800"
              } p-4 rounded-lg mb-4 mt-4`}
            >
              {note.heading ? (
                <Text
                  className={`text-lg font-bold ${
                    theme === "light" ? "text-gray-800" : "text-gray-100"
                  } mb-2`}
                >
                  {note.heading}
                </Text>
              ) : null}
              <Text
                className={`${
                  theme === "light" ? "text-gray-600" : "text-gray-400"
                } mb-2`}
              >
                {note.body}
              </Text>
              <Text
                className={`text-sm ${
                  theme === "light" ? "text-gray-400" : "text-gray-500"
                }`}
              >
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
            <Text
              className={`text-lg font-semibold text-center mt-4 ${
                theme === "light" ? "text-gray-600" : "text-gray-400"
              }`}
            >
              {" "}
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
