import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  PanResponder,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import AppLogo from "../assets/images/logo.png";

const slides = [
  {
    image: AppLogo,
    title: "Welcome to My Life",
    description: "An app to help you build better habits, routines, and goals.",
  },
  {
    image: "https://undraw.co/illustrations-fitness_stats",
    title: "Build Better Habits",
    description: "Track and improve your daily habits effectively.",
  },
  {
    image: "https://undraw.co/illustrations-goals",
    title: "Stay Motivated",
    description: "Achieve your goals and unlock your potential.",
  },
];

export default function Welcome() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Swipe Gesture Handling
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) =>
        Math.abs(gestureState.dx) > 10, // Trigger swipe for horizontal movement
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -50 && currentIndex < slides.length - 1) {
          handleNext();
        } else if (gestureState.dx > 50 && currentIndex > 0) {
          handlePrevious();
        }
      },
    })
  ).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleContinue = () => {
    router.replace("/user-details");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={{ uri: "https://source.unsplash.com/random/1920x1080" }}
        style={styles.backgroundImage}
      />
      <View style={styles.overlay} />
      <Animated.View
        style={[styles.slideContainer, { opacity: fadeAnim }]}
        {...panResponder.panHandlers}
      >
        <Image
          source={slides[currentIndex].image}
          style={styles.slideImage}
        />
        <Text style={styles.slideTitle}>{slides[currentIndex].title}</Text>
        <Text style={styles.slideDescription}>
          {slides[currentIndex].description}
        </Text>
      </Animated.View>

      <View style={styles.progressContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              currentIndex === index && styles.activeDot,
            ]}
          />
        ))}
      </View>

      <TouchableOpacity
        onPress={
          currentIndex === slides.length - 1 ? handleContinue : handleNext
        }
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          {currentIndex === slides.length - 1 ? "Continue" : "Next"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#800020",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  slideContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  slideImage: {
    width: "80%",
    height: 200,
    resizeMode: "contain",
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
  },
  slideDescription: {
    fontSize: 16,
    color: "#ddd",
    textAlign: "center",
    marginTop: 10,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#555",
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: "center",
    marginBottom: 50,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#800020",
  },
});
