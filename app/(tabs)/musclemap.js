// app/(tabs)/musclemap.js
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  PanResponder,
  Animated,
  StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Body from "../../components/BodyHighlighter";
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

/** --- Muscle Grouping Configuration --- */
const MUSCLE_GROUPS = {
  Chest: ["chest"],
  Back: ["upper-back", "lower-back", "trapezius"],
  Shoulders: ["deltoids", "neck"],
  Arms: ["biceps", "triceps", "forearm"],
  Legs: ["quadriceps", "hamstring", "calves", "gluteal", "adductors", "knees", "tibialis", "ankles"],
  Core: ["abs", "obliques"],
};

const GROUP_TO_ROUTE = {
  Chest: "chest",
  Back: "back",
  Shoulders: "shoulders",
  Arms: "arms",
  Legs: "legs",
  Core: "core",
};

const MUSCLE_TO_GROUP = {
  chest: "Chest",
  "upper-back": "Back",
  "lower-back": "Back",
  trapezius: "Back",
  deltoids: "Shoulders",
  neck: "Shoulders",
  biceps: "Arms",
  triceps: "Arms",
  forearm: "Arms",
  quadriceps: "Legs",
  hamstring: "Legs",
  calves: "Legs",
  gluteal: "Legs",
  adductors: "Legs",
  knees: "Legs",
  tibialis: "Legs",
  ankles: "Legs",
  abs: "Core",
  obliques: "Core",
};

const DISABLED_PARTS = [
  "head", "hair", "face", "hands", "feet",
];

export default function MuscleMap() {
  // 'front' is 0 degrees, 'back' is 180 degrees
  // We use isFlipped (true = back) to track the state
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [selectedGroup, setSelectedGroup] = useState(null);
  const router = useRouter();

  // Reset selection when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setSelectedGroup(null);
    }, [])
  );

  // Handle Flip Animation
  useEffect(() => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 180 : 0,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  }, [isFlipped]);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  // PanResponder for Swipe Detection
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false, // Allow clicks to pass through to children
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Increase threshold to avoid stealing clicks
        return Math.abs(gestureState.dx) > 15 && Math.abs(gestureState.dy) < Math.abs(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx } = gestureState;
        if (dx > 50) {
          // Swipe Right -> Show Front
          setIsFlipped(false);
        } else if (dx < -50) {
          // Swipe Left -> Show Back
          setIsFlipped(true);
        }
      },
    })
  ).current;

  const handleBodyPartPress = (bodyPart) => {
    const { slug } = bodyPart;
    if (DISABLED_PARTS.includes(slug)) return;

    const groupName = MUSCLE_TO_GROUP[slug];
    if (groupName) {
      setSelectedGroup(groupName);
      const routeParam = GROUP_TO_ROUTE[groupName];
      setTimeout(() => {
        router.push({ pathname: "/exercises/[group]", params: { group: routeParam } });
      }, 100);
    }
  };

  const getBodyData = () => {
    if (!selectedGroup) return [];
    const musclesInGroup = MUSCLE_GROUPS[selectedGroup] || [];
    return musclesInGroup.map((muscleSlug) => ({
      slug: muscleSlug,
      intensity: 2,
      color: Colors.dark.primary,
    }));
  };

  const renderBodyMap = (side) => (
    <Body
      data={getBodyData()}
      onBodyPartPress={handleBodyPartPress}
      side={side}
      scale={1.3}
      gender="male"
      disabledParts={DISABLED_PARTS}
    />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dark.background }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }} scrollEnabled={true}>

        {/* Header */}
        <View style={{ padding: 16, paddingBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 24, fontWeight: "800", color: Colors.dark.text }}>Kas Haritası</Text>
          <TouchableOpacity
            onPress={() => router.push("/exercises/all")}
            style={{
              flexDirection: 'row', alignItems: 'center',
              paddingVertical: 6, paddingHorizontal: 12,
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 20,
            }}
          >
            <Text style={{ color: Colors.dark.text, fontWeight: "600", fontSize: 13, marginRight: 4 }}>Tüm Liste</Text>
            <Ionicons name="list" size={16} color={Colors.dark.text} />
          </TouchableOpacity>
        </View>

        {/* Info Hint */}
        <Text style={{
          color: Colors.dark.textSecondary,
          textAlign: 'center',
          fontSize: 13, marginTop: 5, marginBottom: 20
        }}>
          Vücudu döndürmek için sağa/sola kaydırın.
        </Text>

        {/* 3D Flip Container */}
        <View style={{ alignItems: 'center', justifyContent: 'center', minHeight: 540 }}>
          <View
            {...panResponder.panHandlers}
            style={{ width: '90%', height: 520 }}
          >
            {/* Front Side */}
            <Animated.View
              style={[styles.card, frontAnimatedStyle]}
              pointerEvents={isFlipped ? 'none' : 'auto'}
            >
              {renderBodyMap('front')}
            </Animated.View>

            {/* Back Side */}
            <Animated.View
              style={[styles.card, styles.cardBack, backAnimatedStyle]}
              pointerEvents={isFlipped ? 'auto' : 'none'}
            >
              {renderBodyMap('back')}
            </Animated.View>
          </View>
        </View>

        {/* Page Indicators (Dots) */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 10 }}>
          <View style={{
            width: 10, height: 10, borderRadius: 5,
            backgroundColor: !isFlipped ? Colors.dark.primary : '#444'
          }} />
          <View style={{
            width: 10, height: 10, borderRadius: 5,
            backgroundColor: isFlipped ? Colors.dark.primary : '#444'
          }} />
        </View>

        <Text style={{
          textAlign: 'center',
          color: !isFlipped ? Colors.dark.text : Colors.dark.textSecondary,
          marginTop: 8, fontWeight: '600'
        }}>
          {!isFlipped ? "ÖN GÖVDE" : "ARKA GÖVDE"}
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1c1c1e',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: "center",
    justifyContent: "center",
    backfaceVisibility: 'hidden', // Key for 3D flip
    position: 'absolute',
    top: 0,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
    paddingVertical: 20
  },
  cardBack: {

  }
});
