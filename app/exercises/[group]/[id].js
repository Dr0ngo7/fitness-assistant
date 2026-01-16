import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Alert, Image, ScrollView, Text,
  TouchableOpacity, View, ActivityIndicator, StyleSheet, SafeAreaView, Linking
} from 'react-native';
import { db } from '../../../firebase';
import { Ionicons } from '@expo/vector-icons';
import AddToPlanModal from '../../../components/AddToPlanModal';

export default function ExerciseDetailScreen() {
  const { id, group } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [exercise, setExercise] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const docRef = doc(db, 'exercises', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setExercise({ id: snap.id, ...snap.data() });
        } else {
          Alert.alert("Hata", "Egzersiz bulunamadı.");
          router.back();
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Hata", "Veri yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };
    fetchExercise();
  }, [id]);

  const openVideo = () => {
    if (exercise?.video) {
      Linking.openURL(exercise.video);
    } else {
      Alert.alert("Video Yok", "Bu egzersiz için video bulunamadı.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!exercise) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{exercise.name}</Text>
        <TouchableOpacity onPress={() => setAddModalVisible(true)} style={styles.addBtnHeader}>
          <Ionicons name="add-circle-outline" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image/Video Placeholder */}
        {exercise.thumb ? (
          <Image source={{ uri: exercise.thumb }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={64} color="#ccc" />
            <Text style={{ color: '#999', marginTop: 10 }}>Görsel Yok</Text>
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoCard}>
          <View style={[styles.badge, styles.badgeBlue]}>
            <Text style={styles.badgeText}>{group?.toUpperCase()}</Text>
          </View>

          <Text style={styles.sectionTitle}>Talimatlar</Text>
          <Text style={styles.description}>
            {exercise.description || "Açıklama bulunmuyor."}
          </Text>

          <TouchableOpacity style={styles.videoBtn} onPress={openVideo}>
            <Ionicons name="logo-youtube" size={24} color="#fff" />
            <Text style={styles.videoBtnText}>Videolu Anlatım İzle</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AddToPlanModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        exerciseData={exercise}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  backBtn: { padding: 4 },
  addBtnHeader: { padding: 4 },

  scrollContent: { paddingBottom: 40 },

  image: { width: '100%', height: 250, backgroundColor: '#f0f0f0' },
  imagePlaceholder: { width: '100%', height: 250, backgroundColor: '#f9f9f9', justifyContent: 'center', alignItems: 'center' },

  infoCard: { padding: 20 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 16 },
  badgeBlue: { backgroundColor: '#eef2ff' },
  badgeText: { color: '#007AFF', fontWeight: '700', fontSize: 12 },

  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  description: { fontSize: 16, lineHeight: 24, color: '#444', marginBottom: 20 },

  videoBtn: {
    backgroundColor: '#FF0000', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 16, borderRadius: 12
  },
  videoBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 10 }
});
