import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Alert, Image, ScrollView, Text,
  TouchableOpacity, View, ActivityIndicator, StyleSheet, SafeAreaView, Modal, StatusBar, Dimensions
} from 'react-native';
import { WebView } from 'react-native-webview';
import { db } from '../../../firebase';
import { Ionicons } from '@expo/vector-icons';
import AddToPlanModal from '../../../components/AddToPlanModal';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ExerciseDetailScreen() {
  const { id, group } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [exercise, setExercise] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [videoModalVisible, setVideoModalVisible] = useState(false);

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
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          {exercise.img ? (
            <Image source={{ uri: exercise.img }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Ionicons name="barbell-outline" size={80} color="#ccc" />
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.heroGradient}
          />

          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setAddModalVisible(true)} style={styles.addButton}>
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>

          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>{exercise.name}</Text>
            <Text style={styles.heroSubtitle}>{exercise.name_en}</Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>

          {/* Quick Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Zorluk</Text>
              <Text style={styles.statValue}>{exercise.level || '-'}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Ekipman</Text>
              <Text style={styles.statValue}>{exercise.equipment || '-'}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Tür</Text>
              <Text style={styles.statValue}>{exercise.mechanic || '-'}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Açıklama</Text>
            <Text style={styles.descriptionText}>
              {exercise.desc || exercise.description || "Açıklama bulunmuyor."}
            </Text>
          </View>

          {/* Muscles */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hedef Kaslar</Text>
            <View style={styles.tagContainer}>
              <View style={[styles.tag, styles.tagPrimary]}>
                <Text style={styles.tagTextPrimary}>{exercise.group?.toUpperCase()}</Text>
              </View>
              {exercise.secondaryGroups?.map((g, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{g}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Video Button */}
          {exercise.videoUrl && (
            <TouchableOpacity style={styles.videoButton} onPress={() => setVideoModalVisible(true)}>
              <LinearGradient
                colors={['#FF416C', '#FF4B2B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.videoGradient}
              >
                <Ionicons name="play-circle" size={28} color="#fff" />
                <Text style={styles.videoButtonText}>Videolu Anlatım İzle</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Steps */}
          {exercise.steps && exercise.steps.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nasıl Yapılır?</Text>
              {exercise.steps.map((step, index) => (
                <View key={index} style={styles.stepRow}>
                  <View style={styles.stepNumberContainer}>
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Cues (Püf Noktaları) */}
          {exercise.cues && exercise.cues.length > 0 && (
            <View style={[styles.section, styles.cuesSection]}>
              <Text style={styles.sectionTitle}>Püf Noktaları</Text>
              {exercise.cues.map((cue, index) => (
                <View key={index} style={styles.cueRow}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.cueText}>{cue}</Text>
                </View>
              ))}
            </View>
          )}

        </View>
      </ScrollView>

      {/* Add To Plan Modal */}
      <AddToPlanModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        exerciseData={exercise}
      />

      {/* Video Modal (WebView) */}
      <Modal
        visible={videoModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setVideoModalVisible(false)}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Egzersiz Videosu</Text>
          <TouchableOpacity onPress={() => setVideoModalVisible(false)} style={styles.closeModalButton}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.webViewContainer}>
          <WebView
            source={{ uri: exercise.videoUrl }}
            style={{ flex: 1 }}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.webViewLoading}>
                <ActivityIndicator size="large" color="#FF4B2B" />
              </View>
            )}
          />
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  scrollContent: { paddingBottom: 40 },

  heroContainer: {
    height: 350,
    width: '100%',
    position: 'relative',
    backgroundColor: '#000',
  },
  heroImage: { width: '100%', height: '100%' },
  heroPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#222' },
  heroGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 150,
  },
  backButton: { position: 'absolute', top: 50, left: 20, padding: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20 },
  addButton: { position: 'absolute', top: 50, right: 20, padding: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20 },
  heroTextContainer: {
    position: 'absolute', bottom: 30, left: 20, right: 20,
  },
  heroTitle: {
    fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4
  },
  heroSubtitle: {
    fontSize: 16, color: '#rgba(255,255,255,0.8)',
  },

  contentContainer: {
    marginTop: -20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 30,
    minHeight: 500,
  },

  statsGrid: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30,
    backgroundColor: '#f8f9fa', padding: 16, borderRadius: 16,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  statValue: { fontSize: 14, fontWeight: '700', color: '#333' },

  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 12 },
  descriptionText: { fontSize: 15, lineHeight: 24, color: '#555' },

  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f0f0f0', borderRadius: 8 },
  tagPrimary: { backgroundColor: '#eef2ff' },
  tagText: { fontSize: 13, color: '#555', fontWeight: '500' },
  tagTextPrimary: { fontSize: 13, color: '#007AFF', fontWeight: '700' },

  videoButton: { marginBottom: 30, borderRadius: 16, overflow: 'hidden', elevation: 4, shadowColor: '#FF4B2B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  videoGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  videoButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },

  stepRow: { flexDirection: 'row', marginBottom: 16 },
  stepNumberContainer: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#f0f0f0',
    justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2
  },
  stepNumber: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  stepText: { flex: 1, fontSize: 15, lineHeight: 22, color: '#444' },

  cuesSection: { backgroundColor: '#f0fcf4', padding: 16, borderRadius: 12 },
  cueRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cueText: { marginLeft: 10, fontSize: 14, color: '#2e7d32', flex: 1 },

  // Modal
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff', marginTop: 10
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  closeModalButton: { padding: 4 },
  webViewContainer: { flex: 1, backgroundColor: '#000' },
  webViewLoading: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }
});
