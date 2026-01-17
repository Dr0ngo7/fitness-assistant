import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Body from "../../components/BodyHighlighter";

/** --- Muscle Grouping Configuration --- */

// 1. Definition of Groups: Which muscles belong to which group?
// This helps us highlight ALL muscles in a group when one is clicked.
// Note: We map detailed parts like 'tibialis', 'knees' to 'Legs' so they function as part of the leg.
const MUSCLE_GROUPS = {
  Chest: ["chest"],
  Back: ["upper-back", "lower-back", "trapezius"],
  Shoulders: ["deltoids", "neck"],
  Arms: ["biceps", "triceps", "forearm"],
  Legs: ["quadriceps", "hamstring", "calves", "gluteal", "adductors", "knees", "tibialis", "ankles"],
  Core: ["abs", "obliques"],
};

// 2. Route Mapping: Group Name -> Route Parameter (Slug in your DB)
// 2. Route Mapping: Group Name -> Route Parameter (Slug in your DB)
const GROUP_TO_ROUTE = {
  Chest: "chest",
  Back: "back",
  Shoulders: "shoulders",
  Arms: "arms",
  Legs: "legs",
  Core: "core",
};

// 3. Reverse Lookup: Muscle Slug -> Group Name
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

// 4. Disabled Parts: These are completely unclickable.
const DISABLED_PARTS = [
  "head",
  "hair",
  "face", // if exists in SVG
  "hands",
  "feet",
];

export default function MuscleMap() {
  const [side, setSide] = useState("front");
  const [selectedGroup, setSelectedGroup] = useState(null); // Track selected GROUP
  const router = useRouter();

  const handleBodyPartPress = (bodyPart) => {
    const { slug } = bodyPart;

    // Check if the part is in our "Disabled" list (Redundant if Body component works right, but good safety)
    if (DISABLED_PARTS.includes(slug)) return;

    // Find which group this muscle belongs to
    const groupName = MUSCLE_TO_GROUP[slug];

    if (groupName) {
      setSelectedGroup(groupName);

      const routeParam = GROUP_TO_ROUTE[groupName];
      console.log(`Muscle selected: ${slug} -> Group: ${groupName} -> Route: ${routeParam}`);

      // Navigate immediately or after a short delay
      setTimeout(() => {
        router.push({ pathname: "/exercises/[group]", params: { group: routeParam } });
      }, 100);
    } else {
      // Fallback: If map is missing, prevent crash/navigation
      console.log("Clicked unmapped muscle:", slug);
    }
  };

  // Construct bodyData array to highlight ALL muscles in the selected group
  const getBodyData = () => {
    if (!selectedGroup) return [];

    const musclesInGroup = MUSCLE_GROUPS[selectedGroup] || [];

    return musclesInGroup.map((muscleSlug) => ({
      slug: muscleSlug,
      intensity: 2,
      color: "#0ea5e9", // Highlight color (Blue)
    }));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#eef2f7" }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Başlık */}
        <View style={{ padding: 16, paddingBottom: 8 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "700" }}>Kas Haritası</Text>
            <TouchableOpacity
              onPress={() => router.push("/exercises/all")}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                backgroundColor: "#0ea5e9",
                borderRadius: 10,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "800" }}>
                Tüm Hareketler
              </Text>
            </TouchableOpacity>
          </View>

          {/* Ön / Arka Toggle */}
          <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            {["front", "back"].map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setSide(s)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 20,
                  backgroundColor: side === s ? "#0ea5e9" : "#eef2ff",
                }}
              >
                <Text
                  style={{
                    color: side === s ? "#fff" : "#0f172a",
                    fontWeight: "700",
                  }}
                >
                  {s === "front" ? "Ön Gövde" : "Arka Gövde"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Interactive SVG Map */}
        <View
          style={{
            marginHorizontal: 12,
            borderRadius: 16,
            overflow: "hidden",
            backgroundColor: "#fff",
            alignItems: "center",
            paddingVertical: 20,
            minHeight: 450,
            justifyContent: "center"
          }}
        >
          <Body
            data={getBodyData()}
            onBodyPartPress={handleBodyPartPress}
            side={side}
            scale={1.3}
            gender="male"
            disabledParts={DISABLED_PARTS} // Pass the list of non-clickable parts
          />
        </View>

        <Text
          style={{
            opacity: 0.7,
            paddingHorizontal: 16,
            paddingTop: 12,
            marginTop: 12,
            textAlign: "center",
          }}
        >
          {side === "front"
            ? "Ön gövdede bölgeye dokun → egzersiz listesi."
            : "Arka gövdede bölgeye dokun → egzersiz listesi."}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
