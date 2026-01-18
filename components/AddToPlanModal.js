import React, { useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, Alert, SafeAreaView, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, query, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import Colors from "../constants/Colors";

export default function AddToPlanModal({ visible, onClose, exerciseData }) {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Pick Plan, 2: Pick Day, 3: Config

    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);

    // Config
    const [sets, setSets] = useState("3");
    const [reps, setReps] = useState("10");
    const [rest, setRest] = useState("60");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (visible && auth.currentUser) {
            fetchPlans();
        } else {
            setStep(1);
            setSelectedPlan(null);
            setSelectedDay(null);
        }
    }, [visible]);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const q = collection(db, `users/${auth.currentUser.uid}/weekly_plans`);
            const snap = await getDocs(q);
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setPlans(data);
        } catch (e) {
            console.error(e);
            Alert.alert("Hata", "Planlar yüklenemedi.");
        } finally {
            setLoading(false);
        }
    };

    const handlePlanSelect = (plan) => {
        setSelectedPlan(plan);
        setStep(2);
    };

    const handleDaySelect = (day) => {
        setSelectedDay(day);
        setStep(3);
    };

    const handleSave = async () => {
        if (!selectedPlan || !selectedDay) return;

        try {
            setLoading(true);
            const updatedPlanData = [...selectedPlan.data];
            const dayIndex = updatedPlanData.findIndex(d => d.day === selectedDay.day);

            if (dayIndex !== -1) {
                const newExercise = {
                    id: exerciseData.id,
                    group: exerciseData.group,
                    name: exerciseData.name,
                    sets: parseInt(sets) || 3,
                    reps: reps || "10",
                    rest_sec: parseInt(rest) || 60,
                    notes: notes
                };

                updatedPlanData[dayIndex].exercises.push(newExercise);

                await updateDoc(doc(db, `users/${auth.currentUser.uid}/weekly_plans/${selectedPlan.id}`), {
                    data: updatedPlanData,
                    updatedAt: serverTimestamp()
                });

                Alert.alert("Başarılı", `"${exerciseData.name}" başarıyla eklendi!`);
                onClose();
            } else {
                Alert.alert("Hata", "Gün bulunamadı.");
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Hata", "Kaydedilemedi.");
        } finally {
            setLoading(false);
        }
    };

    const renderPlanList = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.title}>Hangi Programa Eklensin?</Text>
            {loading ? <ActivityIndicator color="#007AFF" /> : (
                <FlatList
                    data={plans}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.listItem} onPress={() => handlePlanSelect(item)}>
                            <View style={styles.iconBox}>
                                <Ionicons name="calendar" size={20} color="#007AFF" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.listTitle}>{item.title}</Text>
                                <Text style={styles.listSub}>{item.data.length} Günlük Program</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#ccc" />
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>Hiç programın yok. Önce bir plan oluştur.</Text>}
                />
            )}
        </View>
    );

    const renderDayList = () => (
        <View style={styles.stepContainer}>
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => setStep(1)}><Ionicons name="arrow-back" size={24} color={Colors.dark.text} /></TouchableOpacity>
                <Text style={styles.title}>Hangi Güne?</Text>
                <View style={{ width: 24 }} />
            </View>
            <FlatList
                data={selectedPlan?.data || []}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.listItem} onPress={() => handleDaySelect(item)}>
                        <Text style={[styles.listTitle, { flex: 1 }]}>{item.day_tr}</Text>
                        <Text style={styles.listSub}>{item.focus}</Text>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" style={{ marginLeft: 10 }} />
                    </TouchableOpacity>
                )}
            />
        </View>
    );

    const renderConfig = () => (
        <View style={styles.stepContainer}>
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => setStep(2)}><Ionicons name="arrow-back" size={24} color={Colors.dark.text} /></TouchableOpacity>
                <Text style={styles.title}>Ayarlar</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.configContent}>
                <Text style={styles.planTarget}>Hedef: {selectedPlan.title} / {selectedDay.day_tr}</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Set Sayısı</Text>
                    <TextInput style={styles.input} value={sets} onChangeText={setSets} keyboardType="numeric" />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Tekrar (Reps)</Text>
                    <TextInput style={styles.input} value={reps} onChangeText={setReps} placeholder="Örn: 10-12" />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Dinlenme (Sn)</Text>
                    <TextInput style={styles.input} value={rest} onChangeText={setRest} keyboardType="numeric" />
                </View>

                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Kaydet</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <SafeAreaView style={styles.container}>
                <View style={styles.modalHeader}>
                    <Text style={styles.headerTitle}>Programa Ekle</Text>
                    <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={Colors.dark.text} /></TouchableOpacity>
                </View>
                {step === 1 && renderPlanList()}
                {step === 2 && renderDayList()}
                {step === 3 && renderConfig()}
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.dark.surface },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.dark.border },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.dark.text },

    stepContainer: { flex: 1, padding: 16 },
    title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: Colors.dark.text },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },

    listItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.dark.border },
    iconBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: Colors.dark.background, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
    listTitle: { fontSize: 16, fontWeight: '600', color: Colors.dark.text },
    listSub: { fontSize: 14, color: Colors.dark.textSecondary },

    configContent: { marginTop: 10 },
    planTarget: { textAlign: 'center', color: Colors.dark.primary, fontWeight: '600', marginBottom: 20 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', color: Colors.dark.textSecondary, marginBottom: 6 },
    input: { borderWidth: 1, borderColor: Colors.dark.border, borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: Colors.dark.background, color: Colors.dark.text },

    saveBtn: { backgroundColor: Colors.dark.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
    saveBtnText: { color: Colors.dark.background, fontWeight: 'bold', fontSize: 16 }
});
