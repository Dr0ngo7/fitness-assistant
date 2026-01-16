import React, { useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, Image, TextInput, Alert, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Body from "./BodyHighlighter"; // Assuming same folder structure for components
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../firebase";

/** --- Muscle Group Configuration (Copied for isolated modal logic) --- */
const MUSCLE_TO_GROUP = {
    chest: "gogus",
    "upper-back": "sirt",
    "lower-back": "sirt",
    trapezius: "sirt",
    deltoids: "omuz",
    neck: "omuz",
    biceps: "arms",
    triceps: "arms",
    forearm: "arms",
    quadriceps: "bacak",
    hamstring: "bacak",
    calves: "bacak",
    gluteal: "bacak",
    adductors: "bacak",
    knees: "bacak",
    tibialis: "bacak",
    ankles: "bacak",
    abs: "karin",
    obliques: "karin",
};

const DISABLED_PARTS = ["head", "hair", "face", "hands", "feet"];

export default function ExercisePickerModal({ visible, onClose, onSelect }) {
    const [step, setStep] = useState(1); // 1: Map, 2: List, 3: Config
    const [side, setSide] = useState("front");
    const [selectedGroupSlug, setSelectedGroupSlug] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState(null);

    // Config State
    const [sets, setSets] = useState("3");
    const [reps, setReps] = useState("10");
    const [rest, setRest] = useState("60");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (!visible) {
            // Reset when closed
            setStep(1);
            setExercises([]);
            setSelectedGroupSlug(null);
            setSelectedExercise(null);
        }
    }, [visible]);

    const handleBodyPartPress = async (bodyPart) => {
        const slug = bodyPart.slug;
        if (DISABLED_PARTS.includes(slug)) return;

        const groupSlug = MUSCLE_TO_GROUP[slug];
        if (groupSlug) {
            setSelectedGroupSlug(groupSlug);
            await fetchExercises(groupSlug);
        } else {
            Alert.alert("Bilgi", "Bu bölge için henüz egzersiz tanımlı değil.");
        }
    };

    const fetchExercises = async (groupSlug) => {
        setLoading(true);
        setStep(2); // Move to list view
        try {
            const q = query(
                collection(db, "exercises"),
                where("group", "==", groupSlug),
                limit(50) // Limit just in case
            );
            const snap = await getDocs(q);
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setExercises(data);
        } catch (e) {
            console.error(e);
            Alert.alert("Hata", "Egzersizler yüklenemedi.");
            setStep(1); // Go back
        } finally {
            setLoading(false);
        }
    };

    const handleExerciseSelect = (ex) => {
        setSelectedExercise(ex);
        setStep(3); // Move to config
    };

    const handleFinish = () => {
        if (!selectedExercise) return;

        const finalExercise = {
            name: selectedExercise.name,
            sets: parseInt(sets) || 3,
            reps: reps || "10",
            rest_sec: parseInt(rest) || 60,
            notes: notes,
            id: selectedExercise.id, // Keep ID for reference
            group: selectedExercise.group
        };

        onSelect(finalExercise);
        onClose();
    };

    const renderMap = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.title}>Bölge Seç</Text>
            <View style={styles.toggleRow}>
                <TouchableOpacity onPress={() => setSide("front")} style={[styles.toggleBtn, side === "front" && styles.toggleBtnActive]}>
                    <Text style={[styles.toggleText, side === "front" && styles.toggleTextActive]}>Ön</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSide("back")} style={[styles.toggleBtn, side === "back" && styles.toggleBtnActive]}>
                    <Text style={[styles.toggleText, side === "back" && styles.toggleTextActive]}>Arka</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.mapWrapper}>
                <Body
                    data={[]}
                    onBodyPartPress={handleBodyPartPress}
                    side={side}
                    scale={1.2}
                    gender="male"
                />
            </View>
            <Text style={styles.hint}>Listelemek istediğin kas grubuna dokun.</Text>
        </View>
    );

    const renderList = () => (
        <View style={styles.stepContainer}>
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Egzersiz Seç</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={exercises}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.listItem} onPress={() => handleExerciseSelect(item)}>
                            {item.thumb ? (
                                <Image source={{ uri: item.thumb }} style={styles.listThumb} />
                            ) : (
                                <View style={[styles.listThumb, styles.placeholderThumb]}>
                                    <Ionicons name="barbell" size={20} color="#ccc" />
                                </View>
                            )}
                            <View style={{ flex: 1 }}>
                                <Text style={styles.listName}>{item.name}</Text>
                                <Text style={styles.listSub}>{item.force ? item.force : item.group}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#ccc" />
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>Bu grupta egzersiz bulunamadı.</Text>}
                />
            )}
        </View>
    );

    const renderConfig = () => (
        <View style={styles.stepContainer}>
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => setStep(2)} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Ayarlar</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.configContent}>
                <Text style={styles.exerciseTitle}>{selectedExercise?.name}</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Set Sayısı</Text>
                    <TextInput style={styles.input} value={sets} onChangeText={setSets} keyboardType="numeric" />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Tekrar (Reps)</Text>
                    <TextInput style={styles.input} value={reps} onChangeText={setReps} placeholder="Örn: 10-12" />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Dinlenme (Saniye)</Text>
                    <TextInput style={styles.input} value={rest} onChangeText={setRest} keyboardType="numeric" />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Notlar</Text>
                    <TextInput style={styles.input} value={notes} onChangeText={setNotes} placeholder="İsteğe bağlı not..." />
                </View>

                <TouchableOpacity style={styles.addBtn} onPress={handleFinish}>
                    <Text style={styles.addBtnText}>Programa Ekle</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <SafeAreaView style={styles.container}>
                <View style={styles.modalHeader}>
                    <Text style={styles.headerTitle}>Egzersiz Ekle</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                {step === 1 && renderMap()}
                {step === 2 && renderList()}
                {step === 3 && renderConfig()}

            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    closeBtn: { padding: 4 },

    stepContainer: { flex: 1 },
    title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },

    toggleRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 10 },
    toggleBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0' },
    toggleBtnActive: { backgroundColor: '#007AFF' },
    toggleText: { fontWeight: '600', color: '#333' },
    toggleTextActive: { color: '#fff' },

    mapWrapper: { height: 450, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9', margin: 10, borderRadius: 16 },
    hint: { textAlign: 'center', color: '#888', marginTop: 10 },

    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 },
    backBtn: { padding: 4 },

    listItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    listThumb: { width: 50, height: 50, borderRadius: 8, marginRight: 12, backgroundColor: '#eee' },
    placeholderThumb: { justifyContent: 'center', alignItems: 'center' },
    listName: { fontSize: 16, fontWeight: '600', color: '#333' },
    listSub: { fontSize: 14, color: '#888' },

    configContent: { padding: 20 },
    exerciseTitle: { fontSize: 22, fontWeight: 'bold', color: '#007AFF', marginBottom: 20, textAlign: 'center' },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 6 },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fdfdfd' },

    addBtn: { backgroundColor: '#34C759', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
    addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
