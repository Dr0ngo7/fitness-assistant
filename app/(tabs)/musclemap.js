import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** --- slug eşlemesi --- */
const SLUGS = { Chest:"gogus", Back:"sirt", Shoulders:"omuz", Arms:"arms", Legs:"bacak", Core:"karin" };

/** Konumlar (aynen korunuyor) */
const FRONT_AREAS = [
  { key: "Shoulders", style: { top: "16%", left: "40%", width: "40%", height: "9%" } },
  { key: "Chest",     style: { top: "20%", left: "40%", width: "42%", height: "14%" } },
  { key: "Core",      style: { top: "33%", left: "47%", width: "25%", height: "20%" } },
  { key: "Arms",      style: { top: "30%", left: "30%", width: "12.5%", height: "21.5%" } },
  { key: "Arms",      style: { top: "30%", right:"11.5%", width: "12.5%", height: "21.5%" } },
  { key: "Legs",      style: { top: "55.5%", left: "35%", width: "52%", height: "34%" } },
];

const BACK_AREAS = [
  { key: "Shoulders", style: { top: "12.5%", left: "25%", width: "38%", height: "9%" } },
  { key: "Back",      style: { top: "21%", left: "24%", width: "42%", height: "20%" } },
  { key: "Core",      style: { top: "42%", left: "30%", width: "30%", height: "12%" } },
  { key: "Arms",      style: { top: "30%", left: "11.5%", width: "12.5%", height: "20%" } },
  { key: "Arms",      style: { top: "30%", right:"25%", width: "12.5%", height: "20%" } },
  { key: "Legs",      style: { top: "57.5%", left: "19%", width: "52%", height: "34%" } },
];

export default function MuscleMap() {
  const [side, setSide] = useState("front");
  const [selectedKey, setSelectedKey] = useState(null);
  const router = useRouter();

  const AREAS = side === "front" ? FRONT_AREAS : BACK_AREAS;
  const imgSrc =
    side === "front"
      ? require("../../assets/images/muscle_front.png")
      : require("../../assets/images/muscle_back.png");

  const onPick = (key) => {
    setSelectedKey(key); // highlight kalsın
    const group = SLUGS[key] || key;
    router.push({ pathname: "/exercises/[group]", params: { group } });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#eef2f7" }} edges={["top"]}>
      {/* Başlık */}
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 20, fontWeight: "700" }}>Kas Haritası</Text>
          <TouchableOpacity
            onPress={() => router.push("/exercises/all")}
            style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: "#0ea5e9", borderRadius: 10 }}
          >
            <Text style={{ color: "#fff", fontWeight: "800" }}>Tüm Hareketler</Text>
          </TouchableOpacity>
        </View>

        {/* Ön / Arka */}
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
              <Text style={{ color: side === s ? "#fff" : "#0f172a", fontWeight: "700" }}>
                {s === "front" ? "Ön Gövde" : "Arka Gövde"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Görsel + overlay */}
      <View style={{ marginHorizontal: 12, borderRadius: 16, overflow: "hidden", backgroundColor: "#fff" }}>
        <ImageBackground source={imgSrc} resizeMode="contain" style={{ width: "100%", aspectRatio: 3 / 4, position: "relative" }}>
          {AREAS.map((a, i) => (
            <TouchableOpacity
              key={`${side}-${i}`}
              activeOpacity={0.7}
              onPress={() => onPick(a.key)}
              style={[
                {
                  position: "absolute",
                  backgroundColor:
                    selectedKey === a.key ? "rgba(14,165,233,0.28)" : "rgba(14,165,233,0.12)",
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "rgba(14,165,233,0.35)",
                },
                a.style,
              ]}
            />
          ))}
        </ImageBackground>
      </View>

      <Text style={{ opacity: 0.7, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        {side === "front" ? "Ön gövdede bölgeye dokun → egzersiz listesi." : "Arka gövdede bölgeye dokun → egzersiz listesi."}
      </Text>
    </SafeAreaView>
  );
}
