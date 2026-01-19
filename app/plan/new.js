import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert, Text, TouchableOpacity, View, ScrollView,
    ActivityIndicator, StyleSheet, SafeAreaView, Modal, FlatList
} from 'react-native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { askGeminiJSON } from '../../services/gemini';
import { Ionicons } from '@expo/vector-icons';
import PlanChatModal from '../../components/PlanChatModal';
import { findExerciseByName } from '../../services/exerciseService';
import ExerciseSelectionModal from '../../components/ExerciseSelectionModal';
import Colors from '../../constants/Colors';

const GOALS = [
    "Kilo Vermek",
    "Kas Yapmak (Hipertrofi)",
    "Kilo Korumak",
    "Güç Kazanmak",
    "Esneklik ve Mobilite"
];

const DAYS = Array.from({ length: 7 }, (_, i) => `${i + 1}`);

const LEVELS = [
    { label: "Başlangıç (Beginner)", value: "Beginner" },
    { label: "Orta (Intermediate)", value: "Intermediate" },
    { label: "İleri (Advanced)", value: "Advanced" }
];

const EQUIPMENT = [
    { label: "Spor Salonu (Gym)", value: "Gym" },
    { label: "Sadece Dambıl", value: "Dumbbells" },
    { label: "Vücut Ağırlığı", value: "Bodyweight" },
    { label: "Ev Ekipmanı", value: "Home Equipment" }
];

export default function NewPlanScreen() {
    const router = useRouter();

    // User Input State
    const [goal, setGoal] = useState(GOALS[1]);
    const [days, setDays] = useState('3');
    const [level, setLevel] = useState(LEVELS[0]);
    const [equipment, setEquipment] = useState(EQUIPMENT[0]);

    // App State
    const [loading, setLoading] = useState(false);
    const [weeklyPlan, setWeeklyPlan] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [isChatVisible, setIsChatVisible] = useState(false);
    const [candidateModalVisible, setCandidateModalVisible] = useState(false);
    const [candidates, setCandidates] = useState([]);
    const [findingExercise, setFindingExercise] = useState(false);


    // Modal State for Inputs
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalData, setModalData] = useState([]);
    const [onSelect, setOnSelect] = useState(null);

    const openSelection = (title, data, onSelectCallback) => {
        setModalTitle(title);
        setModalData(data);
        setOnSelect(() => (item) => {
            onSelectCallback(item);
            setModalVisible(false);
        });
        setModalVisible(true);
    };

    const handleExercisePress = async (exerciseName) => {
        if (findingExercise) return;
        setFindingExercise(true);
        try {
            const result = await findExerciseByName(exerciseName);
            if (result?.match) {
                router.push(`/exercises/${result.match.group}/${result.match.id}`);
            } else if (result?.candidates && result.candidates.length > 0) {
                setCandidates(result.candidates);
                setCandidateModalVisible(true);
            } else {
                Alert.alert(
                    "Egzersiz Bulunamadı",
                    `"${exerciseName}" veritabanımızda bulunamadı.`,
                    [{ text: "Tamam" }]
                );
            }
        } catch (e) {
            console.log(e);
        } finally {
            setFindingExercise(false);
        }
    };

    const handleCandidateSelect = (item) => {
        setCandidateModalVisible(false);
        router.push(`/exercises/${item.group}/${item.id}`);
    };

    const generatePlan = async () => {
        setLoading(true);
        setWeeklyPlan(null);

        try {
            const prompt = `
        Act as a professional fitness trainer. Create a ${days}-day weekly workout plan for a ${level.value} level user who wants to "${goal}".
        Equipment available: ${equipment.value}.

        IMPORTANT: Return the response in STRICT JSON format only.
        Do not use Markdown code blocks.
        Do not include any text outside the JSON object.
        Follow this strict schema:
        {
          "week_plan": [
            {
              "day": "monday",
              "day_tr": "Pazartesi",
              "focus": "Target Muscle Group",
              "exercises": [
                {
                  "name": "Exercise Name",
                  "sets": 3,
                  "reps": "10-12",
                  "rest_sec": 60,
                  "notes": "Brief tip"
                }
              ]
            }
          ]
        }
        Ensure the JSON is valid. Generate a plan for all 7 days (use "Rest" for rest days or non-workout days).
      `;

            const data = await askGeminiJSON(prompt);

            if (data && data.week_plan) {
                setWeeklyPlan(data.week_plan);
                setSelectedDay(data.week_plan[0]);
            } else {
                throw new Error("Geçersiz JSON formatı alındı.");
            }

        } catch (error) {
            console.error("Plan Error:", error);
            Alert.alert("Plan Oluşturulamadı", error.message);
        } finally {
            setLoading(false);
        }
    };

    const savePlan = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid || !weeklyPlan) return;

        try {
            setLoading(true);
            await addDoc(collection(db, `users/${uid}/weekly_plans`), {
                title: `${goal} (${days} Gün) - ${level.value}`,
                createdAt: serverTimestamp(),
                data: weeklyPlan
            });
            Alert.alert("Başarılı", "Programın kaydedildi!");
            router.back();
        } catch (error) {
            Alert.alert("Hata", "Kaydedilemedi: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderDaySelector = () => {
        if (!weeklyPlan) return null;
        return (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll}>
                {weeklyPlan.map((dayItem, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.dayButton, selectedDay === dayItem && styles.dayButtonActive]}
                        onPress={() => setSelectedDay(dayItem)}
                    >
                        <Text style={[styles.dayText, selectedDay === dayItem && styles.dayTextActive]}>
                            {dayItem.day_tr.slice(0, 3)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        );
    };

    const renderSelectInput = (label, value, onPress) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity style={styles.selectBtn} onPress={onPress}>
                <Text style={styles.selectBtnText}>{value}</Text>
                <Ionicons name="chevron-down" size={20} color={Colors.dark.textSecondary} />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Input Form */}
                {!weeklyPlan && !loading && (
                    <View style={styles.formContainer}>
                        <Text style={styles.header}>Yeni Program Oluştur</Text>

                        {renderSelectInput("Hedefiniz", goal, () =>
                            openSelection("Hedef Seçin", GOALS, setGoal)
                        )}

                        {renderSelectInput("Haftalık Gün Sayısı", `${days} Gün`, () =>
                            openSelection("Gün Sayısı Seçin", DAYS, setDays)
                        )}

                        {renderSelectInput("Seviye", level.label, () =>
                            openSelection("Seviye Seçin", LEVELS, setLevel)
                        )}

                        {renderSelectInput("Ekipman", equipment.label, () =>
                            openSelection("Ekipman Seçin", EQUIPMENT, setEquipment)
                        )}

                        <TouchableOpacity style={styles.generateButton} onPress={generatePlan}>
                            <Text style={styles.generateButtonText}>AI Programı Hazırla</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Loading State */}
                {loading && (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={Colors.dark.primary} />
                        <Text style={{ marginTop: 10, color: Colors.dark.text }}>Programın Hazırlanıyor...</Text>
                    </View>
                )}

                {/* Plan Preview & Save */}
                {weeklyPlan && selectedDay && !loading && (
                    <View>
                        <View style={styles.planHeader}>
                            <Text style={styles.planTitle}>Önizleme</Text>
                            <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                                <TouchableOpacity onPress={() => setWeeklyPlan(null)} style={{ padding: 8 }}>
                                    <Ionicons name="pencil" size={22} color={Colors.dark.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setIsChatVisible(true)} style={{ padding: 8 }}>
                                    <Ionicons name="chatbubbles" size={22} color={Colors.dark.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={savePlan} style={styles.primaryBtn}>
                                    <Text style={{ color: Colors.dark.background, fontWeight: 'bold' }}>Kaydet</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {renderDaySelector()}

                        <View style={styles.dayCard}>
                            <Text style={styles.dayTitle}>{selectedDay.day_tr}</Text>
                            <Text style={styles.dayFocus}>Odak: {selectedDay.focus}</Text>

                            {selectedDay.exercises.length === 0 ? (
                                <Text style={{ fontStyle: 'italic', marginTop: 10, color: Colors.dark.textSecondary }}>Bugün dinlenme günü.</Text>
                            ) : (
                                selectedDay.exercises.map((ex, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        style={styles.exerciseItem}
                                        onPress={() => handleExercisePress(ex.name)}
                                    >
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={styles.exName}>{idx + 1}. {ex.name}</Text>
                                            <Ionicons name="chevron-forward" size={16} color="#ccc" />
                                        </View>
                                        <View style={styles.exDetails}>
                                            <Text style={styles.exMeta}>{ex.sets} Set x {ex.reps}</Text>
                                            <Text style={styles.exMeta}>{ex.rest_sec}sn Dinlenme</Text>
                                        </View>
                                        {ex.notes ? <Text style={styles.exNotes}>Note: {ex.notes}</Text> : null}
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>

                        <TouchableOpacity onPress={savePlan} style={[styles.generateButton, { marginTop: 20, backgroundColor: Colors.dark.primary }]}>
                            <Text style={styles.generateButtonText}>Programı Kütüphaneme Ekle</Text>
                        </TouchableOpacity>
                    </View>
                )}

            </ScrollView>

            {/* Inputs Modal */}
            <Modal visible={modalVisible} transparent={true} animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{modalTitle}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={Colors.dark.text} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={modalData}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => onSelect && onSelect(item)}
                                >
                                    <Text style={styles.modalItemText}>{item.label || item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            <PlanChatModal
                visible={isChatVisible}
                onClose={() => setIsChatVisible(false)}
                planData={weeklyPlan}
                userGoal={goal}
                onUpdatePlan={(newPlan) => {
                    setWeeklyPlan(newPlan);
                    // Optionally update selectedDay if it still exists, otherwise default to first
                    if (newPlan.length > 0) setSelectedDay(newPlan[0]);
                }}
            />

            <ExerciseSelectionModal
                visible={candidateModalVisible}
                candidates={candidates}
                onSelect={handleCandidateSelect}
                onClose={() => setCandidateModalVisible(false)}
            />

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.dark.background },
    scrollContent: { padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 400 },

    formContainer: { backgroundColor: Colors.dark.surface, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: Colors.dark.border },
    header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: Colors.dark.text },

    inputGroup: { marginBottom: 16 },
    label: { fontSize: 15, fontWeight: '600', marginBottom: 8, color: Colors.dark.textSecondary },
    selectBtn: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderWidth: 1, borderColor: Colors.dark.border, borderRadius: 12, padding: 16,
        backgroundColor: Colors.dark.background
    },
    selectBtnText: { fontSize: 16, color: Colors.dark.text },

    generateButton: { backgroundColor: Colors.dark.primary, padding: 16, borderRadius: 12, marginTop: 10, alignItems: 'center' },
    generateButtonText: { color: Colors.dark.background, fontSize: 16, fontWeight: 'bold' },

    planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    planTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.dark.text },

    secondaryBtn: { padding: 8 },
    primaryBtn: { backgroundColor: Colors.dark.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },

    dayScroll: { marginBottom: 20, flexDirection: 'row' },
    dayButton: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: Colors.dark.surface, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: Colors.dark.border },
    dayButtonActive: { backgroundColor: Colors.dark.primary, borderColor: Colors.dark.primary },
    dayText: { fontWeight: '600', color: Colors.dark.textSecondary },
    dayTextActive: { color: Colors.dark.background },

    dayCard: { backgroundColor: Colors.dark.surface, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: Colors.dark.border },
    dayTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 5, color: Colors.dark.text },
    dayFocus: { fontSize: 16, color: Colors.dark.primary, fontWeight: '600', marginBottom: 15 },

    exerciseItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.dark.border },
    exName: { fontSize: 16, fontWeight: '700', color: Colors.dark.text },
    exDetails: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
    exMeta: { color: Colors.dark.textSecondary, fontSize: 13, fontWeight: '500' },
    exNotes: { marginTop: 4, color: Colors.dark.textSecondary, fontStyle: 'italic', fontSize: 13, opacity: 0.8 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: Colors.dark.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '50%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.dark.text },
    modalItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.dark.border },
    modalItemText: { fontSize: 16, color: Colors.dark.text }
});
