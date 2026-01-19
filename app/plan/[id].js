import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    Alert, Text, TouchableOpacity, View, ScrollView,
    ActivityIndicator, StyleSheet, SafeAreaView
} from 'react-native';
import { auth, db } from '../../firebase';
import { Ionicons } from '@expo/vector-icons';
import PlanChatModal from '../../components/PlanChatModal';
import { findExerciseByName } from '../../services/exerciseService';
import ExerciseSelectionModal from '../../components/ExerciseSelectionModal';
import ExercisePickerModal from '../../components/ExercisePickerModal';
import Colors from '../../constants/Colors';

export default function PlanDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);

    // Modals
    const [isChatVisible, setIsChatVisible] = useState(false);
    const [candidateModalVisible, setCandidateModalVisible] = useState(false);
    const [pickerVisible, setPickerVisible] = useState(false);
    const [candidates, setCandidates] = useState([]);

    const [findingExercise, setFindingExercise] = useState(false);

    useEffect(() => {
        const fetchPlan = async () => {
            if (!auth.currentUser?.uid || !id) return;
            try {
                const docRef = doc(db, `users/${auth.currentUser.uid}/weekly_plans/${id}`);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data();
                    setPlan(data);
                    // Set first day as default
                    if (data.data && data.data.length > 0) {
                        setSelectedDay(data.data[0]);
                    }
                } else {
                    Alert.alert("Hata", "Plan bulunamadı.");
                    router.back();
                }
            } catch (error) {
                console.error(error);
                Alert.alert("Hata", "Plan yüklenemedi.");
            } finally {
                setLoading(false);
            }
        };
        fetchPlan();
    }, [id]);

    const handleExercisePress = async (exerciseName) => {
        if (isEditing) return; // Editing modunda tıklama çalışmasın
        if (findingExercise) return;
        setFindingExercise(true);
        try {
            const result = await findExerciseByName(exerciseName);

            if (result?.match) {
                // Tam eşleşme
                router.push(`/exercises/${result.match.group}/${result.match.id}`);
            } else if (result?.candidates && result.candidates.length > 0) {
                // Adaylar var -> Modalı aç
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

    const handleDelete = async () => {
        Alert.alert("Sil", "Bu programı silmek istediğine emin misin?", [
            { text: "Vazgeç", style: "cancel" },
            {
                text: "Sil",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteDoc(doc(db, `users/${auth.currentUser.uid}/weekly_plans/${id}`));
                        router.back();
                    } catch (e) {
                        Alert.alert("Hata", "Silinemedi.");
                    }
                }
            }
        ]);
    };

    const handleSavedPlanUpdate = async (newPlanData) => {
        try {
            // Firestore'u güncelle
            await updateDoc(doc(db, `users/${auth.currentUser.uid}/weekly_plans/${id}`), {
                data: newPlanData,
                updatedAt: serverTimestamp()
            });

            // State'i güncelle
            setPlan(prev => ({ ...prev, data: newPlanData }));

            // Eğer seçili gün yeni planda varsa onu koru, yoksa ilk güne geç
            if (newPlanData.length > 0) {
                const currentDayExists = newPlanData.find(d => d.day === selectedDay?.day);
                setSelectedDay(currentDayExists || newPlanData[0]);
            }

        } catch (error) {
            console.error(error);
            Alert.alert("Hata", "Plan güncellenirken bir sorun oluştu.");
        }
    };

    // --- MANUAL EDITING FUNCTIONS ---

    const addExerciseToDay = async (newExercise) => {
        if (!plan || !selectedDay) return;

        // Mevcut plan kopyasını al
        const updatedPlanData = [...plan.data];
        // Seçili günü bul
        const dayIndex = updatedPlanData.findIndex(d => d.day === selectedDay.day);
        if (dayIndex === -1) return;

        // Egzersizi ekle
        updatedPlanData[dayIndex].exercises.push(newExercise);

        // State & DB güncelle
        await handleSavedPlanUpdate(updatedPlanData);
    };

    const removeExerciseFromDay = async (exIndex) => {
        const updatedPlanData = [...plan.data];
        const dayIndex = updatedPlanData.findIndex(d => d.day === selectedDay.day);
        if (dayIndex === -1) return;

        updatedPlanData[dayIndex].exercises.splice(exIndex, 1);
        await handleSavedPlanUpdate(updatedPlanData);
    };

    const moveExercise = async (exIndex, direction) => {
        const updatedPlanData = [...plan.data];
        const dayIndex = updatedPlanData.findIndex(d => d.day === selectedDay.day);
        if (dayIndex === -1) return;

        const exercises = updatedPlanData[dayIndex].exercises;

        if (direction === 'up') {
            if (exIndex === 0) return; // Zaten en üstte
            [exercises[exIndex - 1], exercises[exIndex]] = [exercises[exIndex], exercises[exIndex - 1]];
        } else {
            if (exIndex === exercises.length - 1) return; // Zaten en altta
            [exercises[exIndex + 1], exercises[exIndex]] = [exercises[exIndex], exercises[exIndex + 1]];
        }

        await handleSavedPlanUpdate(updatedPlanData);
    };

    // ----------------------------

    const clearDay = async () => {
        Alert.alert("Günü Sıfırla", "Bu günün tüm egzersizleri silinecek ve 'Dinlenme' olarak işaretlenecek. Emin misin?", [
            { text: "Vazgeç", style: "cancel" },
            {
                text: "Sıfırla",
                style: "destructive",
                onPress: async () => {
                    const updatedPlanData = [...plan.data];
                    const dayIndex = updatedPlanData.findIndex(d => d.day === selectedDay.day);
                    if (dayIndex === -1) return;

                    updatedPlanData[dayIndex].exercises = [];
                    updatedPlanData[dayIndex].focus = 'Dinlenme';

                    await handleSavedPlanUpdate(updatedPlanData);
                }
            }
        ]);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.dark.primary} />
            </View>
        );
    }

    if (!plan || !selectedDay) return null;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.dark.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{plan.title}</Text>

                <View style={{ flexDirection: 'row', gap: 5 }}>
                    {/* Toggle Edit Mode */}
                    <TouchableOpacity
                        onPress={() => setIsEditing(!isEditing)}
                        style={[styles.actionBtn, isEditing && styles.actionBtnActive]}
                    >
                        <Ionicons name={isEditing ? "checkmark" : "pencil"} size={22} color={isEditing ? Colors.dark.background : Colors.dark.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setIsChatVisible(true)} style={styles.actionBtn}>
                        <Ionicons name="chatbubbles" size={22} color={Colors.dark.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete} style={styles.actionBtn}>
                        <Ionicons name="trash-outline" size={22} color={Colors.dark.error} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Day Selector */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll}>
                    {plan.data.map((dayItem, index) => (
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

                {/* Day Details */}
                <View style={[styles.dayCard, isEditing && { borderColor: Colors.dark.primary, borderWidth: 2 }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.dayTitle}>{selectedDay.day_tr}</Text>
                        {isEditing && (
                            <TouchableOpacity onPress={clearDay} style={{ backgroundColor: 'rgba(255, 69, 58, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                                <Text style={{ color: Colors.dark.error, fontWeight: '600', fontSize: 13 }}>Günü Sıfırla</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <Text style={styles.dayFocus}>Odak: {selectedDay.focus}</Text>

                    {selectedDay.exercises.length === 0 ? (
                        <Text style={{ fontStyle: 'italic', marginTop: 10, color: Colors.dark.textSecondary }}>Bugün dinlenme günü.</Text>
                    ) : (
                        selectedDay.exercises.map((ex, idx) => (
                            <View key={idx} style={styles.exerciseRowWrapper}>
                                {isEditing && (
                                    <View style={styles.editControls}>
                                        <TouchableOpacity onPress={() => removeExerciseFromDay(idx)} style={styles.controlBtn}>
                                            <Ionicons name="remove-circle" size={24} color={Colors.dark.error} />
                                        </TouchableOpacity>
                                        <View>
                                            <TouchableOpacity onPress={() => moveExercise(idx, 'up')} style={styles.smallControl}>
                                                <Ionicons name="caret-up" size={16} color={Colors.dark.textSecondary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => moveExercise(idx, 'down')} style={styles.smallControl}>
                                                <Ionicons name="caret-down" size={16} color={Colors.dark.textSecondary} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={[styles.exerciseItem, isEditing && { flex: 1, borderBottomWidth: 0 }]}
                                    onPress={() => handleExercisePress(ex.name)}
                                    activeOpacity={isEditing ? 1 : 0.7}
                                >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={styles.exName}>{idx + 1}. {ex.name}</Text>
                                        {!isEditing && <Ionicons name="chevron-forward" size={16} color="#ccc" />}
                                    </View>

                                    <View style={styles.exDetails}>
                                        <Text style={styles.exMeta}>{ex.sets} Set x {ex.reps}</Text>
                                        <Text style={styles.exMeta}>{ex.rest_sec}sn Dinlenme</Text>
                                    </View>
                                    {ex.notes ? <Text style={styles.exNotes}>Not: {ex.notes}</Text> : null}
                                </TouchableOpacity>
                            </View>
                        ))
                    )}

                    {isEditing && (
                        <TouchableOpacity style={styles.addExerciseBtn} onPress={() => setPickerVisible(true)}>
                            <Ionicons name="add-circle" size={24} color={Colors.dark.primary} />
                            <Text style={styles.addExerciseText}>Egzersiz Ekle</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

            <PlanChatModal
                visible={isChatVisible}
                onClose={() => setIsChatVisible(false)}
                planData={plan.data}
                userGoal={plan.title}
                onUpdatePlan={handleSavedPlanUpdate}
            />

            <ExerciseSelectionModal
                visible={candidateModalVisible}
                candidates={candidates}
                onSelect={handleCandidateSelect}
                onClose={() => setCandidateModalVisible(false)}
            />

            <ExercisePickerModal
                visible={pickerVisible}
                onClose={() => setPickerVisible(false)}
                onSelect={(newEx) => addExerciseToDay(newEx)}
            />

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.dark.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 16, backgroundColor: Colors.dark.surface, borderBottomWidth: 1, borderBottomColor: Colors.dark.border
    },
    headerTitle: { fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center', marginHorizontal: 10, color: Colors.dark.text },
    backBtn: { padding: 8 },
    actionBtn: { padding: 8, marginLeft: 2 },
    actionBtnActive: { backgroundColor: Colors.dark.primary, borderRadius: 20 },

    scrollContent: { padding: 20 },

    dayScroll: { marginBottom: 20, flexDirection: 'row' },
    dayButton: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: Colors.dark.surface, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: Colors.dark.border },
    dayButtonActive: { backgroundColor: Colors.dark.primary, borderColor: Colors.dark.primary },
    dayText: { fontWeight: '600', color: Colors.dark.textSecondary },
    dayTextActive: { color: Colors.dark.background },

    dayCard: { backgroundColor: Colors.dark.surface, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: Colors.dark.border },
    dayTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 5, color: Colors.dark.text },
    dayFocus: { fontSize: 16, color: Colors.dark.primary, fontWeight: '600', marginBottom: 15 },

    exerciseRowWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Colors.dark.border,
        paddingVertical: 12
    },
    exerciseItem: { flex: 1 },
    exName: { fontSize: 17, fontWeight: '700', color: Colors.dark.text },
    exDetails: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
    exMeta: { color: Colors.dark.textSecondary, fontSize: 14, fontWeight: '500' },
    exNotes: { marginTop: 4, color: Colors.dark.textSecondary, fontStyle: 'italic', fontSize: 13, opacity: 0.8 },

    editControls: { marginRight: 10, flexDirection: 'row', alignItems: 'center' },
    controlBtn: { marginRight: 8 },
    smallControl: { padding: 2 },

    addExerciseBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, marginTop: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.dark.border, borderRadius: 12, backgroundColor: Colors.dark.background },
    addExerciseText: { fontWeight: 'bold', color: Colors.dark.textSecondary, marginLeft: 8 }
});
