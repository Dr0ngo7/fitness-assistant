import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert, Text, TouchableOpacity, View, StyleSheet, SafeAreaView, TextInput, ActivityIndicator
} from 'react-native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

const DAYS_OPTIONS = [
    { label: "1 Gün", value: 1 },
    { label: "2 Gün", value: 2 },
    { label: "3 Gün", value: 3 },
    { label: "4 Gün", value: 4 },
    { label: "5 Gün", value: 5 },
    { label: "6 Gün", value: 6 },
    { label: "7 Gün", value: 7 },
];

const DAY_NAMES = [
    { key: 'monday', tr: 'Pazartesi' },
    { key: 'tuesday', tr: 'Salı' },
    { key: 'wednesday', tr: 'Çarşamba' },
    { key: 'thursday', tr: 'Perşembe' },
    { key: 'friday', tr: 'Cuma' },
    { key: 'saturday', tr: 'Cumartesi' },
    { key: 'sunday', tr: 'Pazar' },
];

export default function ManualPlanScreen() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!title.trim()) {
            Alert.alert("Eksik Bilgi", "Lütfen plan için bir isim girin.");
            return;
        }

        setLoading(true);
        try {
            const uid = auth.currentUser?.uid;
            if (!uid) throw new Error("Kullanıcı oturumu bulunamadı.");

            // Her zaman 7 gün oluştur
            const weekPlan = Array.from({ length: 7 }, (_, i) => ({
                day: DAY_NAMES[i % 7].key,
                day_tr: DAY_NAMES[i % 7].tr,
                focus: 'Genel',
                exercises: []
            }));

            const docRef = await addDoc(collection(db, `users/${uid}/weekly_plans`), {
                title: title.trim(),
                createdAt: serverTimestamp(),
                data: weekPlan
            });

            // Başarılı, detay sayfasına git
            router.replace(`/plan/${docRef.id}`);

        } catch (error) {
            console.error(error);
            Alert.alert("Hata", "Plan oluşturulamadı: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.dark.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Boş Plan Oluştur</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Plan Adı</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Örn: Haftalık Split, Göğüs Odaklı..."
                        placeholderTextColor={Colors.dark.textSecondary}
                        value={title}
                        onChangeText={setTitle}
                        autoFocus
                    />
                </View>

                <TouchableOpacity
                    style={[styles.createBtn, loading && { opacity: 0.7 }]}
                    onPress={handleCreate}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={Colors.dark.background} />
                    ) : (
                        <Text style={styles.createBtnText}>Planı Oluştur</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color={Colors.dark.textSecondary} />
                    <Text style={styles.infoText}>
                        Plan oluşturulduktan sonra düzenleme modunu açarak egzersizleri manuel olarak ekleyebilirsiniz.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.dark.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 16, backgroundColor: Colors.dark.surface,
        borderBottomWidth: 1, borderBottomColor: Colors.dark.border
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark.text },
    backBtn: { padding: 8 },

    content: { padding: 24 },
    inputGroup: { marginBottom: 30 },
    label: { fontSize: 16, fontWeight: '600', color: Colors.dark.text, marginBottom: 12 },
    input: {
        backgroundColor: Colors.dark.surface,
        borderWidth: 1, borderColor: Colors.dark.border, borderRadius: 12,
        padding: 16, fontSize: 16, color: Colors.dark.text
    },

    daysContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    dayOption: {
        width: 44, height: 44, borderRadius: 22,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: Colors.dark.border, backgroundColor: Colors.dark.surface
    },
    dayOptionActive: {
        backgroundColor: Colors.dark.primary, borderColor: Colors.dark.primary
    },
    dayOptionText: { fontSize: 16, fontWeight: '600', color: Colors.dark.textSecondary },
    dayOptionTextActive: { color: Colors.dark.background },

    createBtn: {
        backgroundColor: Colors.dark.primary, borderRadius: 16,
        paddingVertical: 18, alignItems: 'center', justifyContent: 'center',
        marginTop: 10
    },
    createBtnText: { color: Colors.dark.background, fontSize: 18, fontWeight: 'bold' },

    infoBox: {
        flexDirection: 'row', marginTop: 24, padding: 16,
        backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12,
        alignItems: 'center', gap: 10
    },
    infoText: { flex: 1, color: Colors.dark.textSecondary, fontSize: 13, lineHeight: 18 }
});
