import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, Dimensions } from 'react-native';
import { useEffect, useState } from 'react';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../../firebase';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import Colors from '../../../constants/Colors';

const { width } = Dimensions.get('window');

export default function RecommendedPlanDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const docRef = doc(db, 'recommended_plans', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setPlan({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.error("No such document!");
                }
            } catch (error) {
                console.error("Error fetching plan:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlan();
    }, [id]);

    const handleSaveToMyPlans = async () => {
        if (!auth.currentUser) return;
        setSaving(true);
        try {
            // Create a simplified version for "My Plans" or copy it entirely
            // For now, let's just copy the title and make it a 'custom' plan type or similar
            // Or if the detailed content is structural, we'd need to parse it. 
            // Since 'my plans' structure expects weekly data, we might just save it as a reference 
            // or if this feature is "Reading", maybe just "Bookmark"?
            // But the user probably wants to "Do" this program.
            // For this MVP, let's assume we just adding it to their list with a special flag 
            // OR we just notify them this feature is coming.
            // User request said: "hazır açıklamalı yorumlu programlar olmasını istiyorum sanki makale bölümü gibi"
            // So maybe "Save" is just "Bookmark" for now. 
            // Let's implementing "Start this Plan" effectively cloning it if we knew the structure.
            // Given the seed data is text-heavy, let's just Add to 'weekly_plans' with 'isRecommended: true'

            await addDoc(collection(db, `users/${auth.currentUser.uid}/weekly_plans`), {
                title: plan.title,
                description: plan.subtitle,
                createdAt: serverTimestamp(),
                isFromRecommendation: true,
                recommendedId: plan.id,
                // We would ideally parse the days/exercises here if they were structured data.
                // For now, we save it as a placeholder for the user.
            });
            alert('Program planlarınıza eklendi!');
            router.push('/(tabs)/plan');
        } catch (error) {
            console.error("Error saving plan:", error);
            alert('Bir hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.dark.primary} />
            </View>
        );
    }

    if (!plan) {
        return (
            <View style={styles.center}>
                <Text>Program bulunamadı.</Text>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Hero Image */}
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: plan.image }} style={styles.image} />
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.imageOverlay} />
                        <View style={styles.titleContainer}>
                            <View style={styles.tagsRow}>
                                {plan.tags?.map((tag, i) => (
                                    <View key={i} style={styles.tagBadge}>
                                        <Text style={styles.tagText}>{tag}</Text>
                                    </View>
                                ))}
                            </View>
                            <Text style={styles.title}>{plan.title}</Text>
                            <Text style={styles.subtitle}>{plan.subtitle}</Text>
                        </View>
                    </View>

                    {/* Meta Info */}
                    <View style={styles.metaContainer}>
                        <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={20} color={Colors.dark.textSecondary} />
                            <Text style={styles.metaText}>{plan.duration}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="barbell-outline" size={20} color={Colors.dark.textSecondary} />
                            <Text style={styles.metaText}>{plan.difficulty}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="heart-outline" size={20} color={Colors.dark.textSecondary} />
                            <Text style={styles.metaText}>{plan.likes} Beğeni</Text>
                        </View>
                    </View>

                    {/* Author */}
                    <View style={styles.authorContainer}>
                        <View style={styles.authorAvatar}>
                            <Text style={styles.authorInitials}>{plan.author?.[0] || 'A'}</Text>
                        </View>
                        <View>
                            <Text style={styles.authorLabel}>Hazırlayan</Text>
                            <Text style={styles.authorName}>{plan.author}</Text>
                        </View>
                    </View>

                    {/* Content */}
                    <View style={styles.contentContainer}>
                        <Markdown style={markdownStyles}>
                            {plan.content}
                        </Markdown>
                    </View>

                    {/* Bottom Padding */}
                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Floating Action Button */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveToMyPlans} disabled={saving}>
                        {saving ? <ActivityIndicator color={Colors.dark.background} /> : <Text style={styles.saveButtonText}>Bu Programı Planlarıma Ekle</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.dark.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingBottom: 0 },

    imageContainer: { height: 400, width: '100%', position: 'relative' },
    image: { width: '100%', height: '100%' },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)', // Slightly darker overlay for text readability
    },

    backButton: {
        position: 'absolute', top: 50, left: 20,
        width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center', zIndex: 10
    },

    titleContainer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: 20,
        // Gradient fallback approach or just rely on overlay
    },
    tagsRow: { flexDirection: 'row', marginBottom: 12 },
    tagBadge: {
        backgroundColor: Colors.dark.primary, paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 6, marginRight: 8
    },
    tagText: { color: Colors.dark.background, fontSize: 12, fontWeight: '700' },
    title: { fontSize: 28, fontWeight: '800', color: Colors.dark.text, marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 10 },
    subtitle: { fontSize: 16, color: '#eee', lineHeight: 22, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 5 },

    metaContainer: {
        flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20,
        borderBottomWidth: 1, borderBottomColor: Colors.dark.border, marginHorizontal: 20
    },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaText: { fontSize: 14, color: Colors.dark.textSecondary, fontWeight: '500' },

    authorContainer: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 15 },
    authorAvatar: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.dark.surface,
        justifyContent: 'center', alignItems: 'center', marginRight: 12
    },
    authorInitials: { fontSize: 18, fontWeight: 'bold', color: Colors.dark.text },
    authorLabel: { fontSize: 12, color: Colors.dark.textSecondary },
    authorName: { fontSize: 15, fontWeight: '600', color: Colors.dark.text },

    contentContainer: { paddingHorizontal: 20 },

    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: 20, paddingTop: 10,
        backgroundColor: Colors.dark.surface, borderTopWidth: 1, borderTopColor: Colors.dark.border,
        elevation: 20, shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.3, shadowRadius: 10
    },
    saveButton: {
        backgroundColor: Colors.dark.primary, borderRadius: 16, paddingVertical: 16,
        alignItems: 'center', justifyContent: 'center'
    },
    saveButtonText: { color: Colors.dark.background, fontSize: 16, fontWeight: 'bold' }
});

const markdownStyles = {
    body: { fontSize: 16, lineHeight: 26, color: Colors.dark.textSecondary },
    heading1: { fontSize: 24, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: Colors.dark.text },
    heading2: { fontSize: 20, fontWeight: 'bold', marginTop: 15, marginBottom: 8, color: Colors.dark.text },
    heading3: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 6, color: Colors.dark.text },
    paragraph: { marginVertical: 8 },
    list_item: { marginVertical: 4 },
    strong: { fontWeight: 'bold', color: Colors.dark.primary },
};
