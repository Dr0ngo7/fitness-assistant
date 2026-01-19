import { useRouter, useFocusEffect } from 'expo-router';
import { collection, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';
import { useCallback, useState, useEffect } from 'react';
import { FlatList, Text, TouchableOpacity, View, StyleSheet, SafeAreaView, ActivityIndicator, Image, ScrollView, Modal } from 'react-native';
import { auth, db } from '../../firebase';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

export default function PlanDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('my_plans'); // 'my_plans' | 'recommended'

  const [myPlans, setMyPlans] = useState([]);
  const [recommendedPlans, setRecommendedPlans] = useState([]);

  const [loadingMyPlans, setLoadingMyPlans] = useState(true);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const uid = auth.currentUser?.uid;

  // Fetch My Plans
  useEffect(() => {
    if (!uid) {
      setLoadingMyPlans(false);
      return;
    }

    const q = query(collection(db, `users/${uid}/weekly_plans`), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPlans = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMyPlans(fetchedPlans);
      setLoadingMyPlans(false);
    }, (error) => {
      console.error("Firestore Error (My Plans):", error);
      setLoadingMyPlans(false);
    });

    return () => unsubscribe();
  }, [uid]);

  // Fetch Recommended Plans (Only once or when tab changes if needed, but simple fetch here)
  useEffect(() => {
    const fetchRecommended = async () => {
      if (recommendedPlans.length > 0) return; // Don't refetch if already loaded
      setLoadingRecommended(true);
      try {
        const q = query(collection(db, 'recommended_plans'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecommendedPlans(fetched);
      } catch (error) {
        console.error("Firestore Error (Recommended):", error);
      } finally {
        setLoadingRecommended(false);
      }
    };

    if (activeTab === 'recommended') {
      fetchRecommended();
    }
  }, [activeTab]);

  const renderMyPlans = () => {
    if (loadingMyPlans) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
        </View>
      );
    }

    if (!uid) {
      return (
        <View style={styles.center}>
          <Text>Planlarınızı görmek için giriş yapın.</Text>
        </View>
      );
    }

    if (myPlans.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="fitness-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Henüz kayıtlı bir programın yok.</Text>
          <Text style={styles.emptySubText}>Yapay zeka ile kendine özel bir program oluştur!</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={myPlans}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/plan/${item.id}`)}
          >
            <View style={styles.cardIcon}>
              <Ionicons name="barbell" size={24} color={Colors.dark.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDate}>
                Oluşturulma: {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('tr-TR') : 'Bugün'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} />
          </TouchableOpacity>
        )}
      />
    );
  };

  const renderRecommended = () => {
    if (loadingRecommended) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
        </View>
      );
    }

    return (
      <FlatList
        data={recommendedPlans}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.recCard}
            onPress={() => router.push(`/plan/recommended/${item.id}`)}
          >
            <Image source={{ uri: item.image }} style={styles.recImage} />
            <View style={styles.recOverlay} />
            <View style={styles.recContent}>
              <View style={styles.recTags}>
                {item.tags?.slice(0, 2).map((tag, index) => (
                  <View key={index} style={styles.tagBadge}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.recTitle}>{item.title}</Text>
              <Text style={styles.recSubtitle} numberOfLines={2}>{item.subtitle}</Text>
              <View style={styles.recFooter}>
                <Text style={styles.recAuthor}>by {item.author}</Text>
                <Text style={styles.recDuration}>{item.duration}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'my_plans' && styles.activeTabButton]}
            onPress={() => setActiveTab('my_plans')}
          >
            <Text style={[styles.tabText, activeTab === 'my_plans' && styles.activeTabText]}>Planlarım</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'recommended' && styles.activeTabButton]}
            onPress={() => setActiveTab('recommended')}
          >
            <Text style={[styles.tabText, activeTab === 'recommended' && styles.activeTabText]}>Keşfet</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {activeTab === 'my_plans' ? renderMyPlans() : renderRecommended()}
      </View>

      {/* Floating Action Button (Only on My Plans tab) */}
      {activeTab === 'my_plans' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={30} color={Colors.dark.background} />
          <Text style={styles.fabText}>Yeni Plan</Text>
        </TouchableOpacity>
      )}

      {/* Create Plan Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showCreateModal}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCreateModal(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Plan Oluştur</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={Colors.dark.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Nasıl bir fitness planı oluşturmak istersin?</Text>

            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: '#2C2C2E', borderColor: Colors.dark.primary, borderWidth: 1 }]}
              onPress={() => {
                setShowCreateModal(false);
                router.push('/plan/new');
              }}
            >
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(212, 255, 0, 0.1)' }]}>
                <Ionicons name="sparkles" size={24} color={Colors.dark.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionTitle, { color: Colors.dark.primary }]}>Yapay Zeka ile</Text>
                <Text style={styles.optionDesc}>Sana özel, hedeflerine uygun otomatik bir plan hazırla.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: '#2C2C2E' }]}
              onPress={() => {
                setShowCreateModal(false);
                router.push('/plan/manual');
              }}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#3A3A3C' }]}>
                <Ionicons name="list" size={24} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionTitle, { color: '#fff' }]}>Boş Plan</Text>
                <Text style={styles.optionDesc}>Egzersizleri tek tek kendin seçerek plan oluştur.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} />
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  headerContainer: { backgroundColor: Colors.dark.surface, borderBottomWidth: 1, borderBottomColor: Colors.dark.border },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 10 },
  tabButton: {
    marginRight: 20,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: Colors.dark.primary,
  },
  tabText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  activeTabText: {
    color: Colors.dark.text,
  },

  listContent: { padding: 20, paddingBottom: 100 },

  // My Plans Card Styles
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.dark.surface, padding: 16, borderRadius: 16, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.dark.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 // Dark shadow
  },
  cardIcon: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: '#333',
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.dark.text, marginBottom: 4 },
  cardDate: { fontSize: 13, color: Colors.dark.textSecondary },

  // Recommended Card Styles
  recCard: {
    height: 200, borderRadius: 20, marginBottom: 20, overflow: 'hidden',
    backgroundColor: '#333',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8
  },
  recImage: { width: '100%', height: '100%', position: 'absolute', opacity: 0.6 }, // Dim image slightly
  recOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  recContent: { flex: 1, padding: 20, justifyContent: 'flex-end' },
  recTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  recSubtitle: { color: '#eee', fontSize: 14, marginBottom: 12, lineHeight: 20 },
  recTags: { flexDirection: 'row', marginBottom: 10 },
  tagBadge: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: Colors.dark.border },
  tagText: { color: Colors.dark.primary, fontSize: 12, fontWeight: '600' },
  recFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  recAuthor: { color: '#ddd', fontSize: 12 },
  recDuration: { color: Colors.dark.primary, fontSize: 12, fontWeight: 'bold' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 18, fontWeight: '600', color: Colors.dark.text, marginTop: 20 },
  emptySubText: { fontSize: 14, color: Colors.dark.textSecondary, textAlign: 'center', marginTop: 8 },

  fab: {
    position: 'absolute', bottom: 30, alignSelf: 'center',
    backgroundColor: Colors.dark.primary, borderRadius: 30,
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 24,
    elevation: 5, shadowColor: Colors.dark.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8
  },
  fabText: { color: Colors.dark.background, fontSize: 16, fontWeight: 'bold', marginLeft: 8 },

  // Modal Styles
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center', padding: 20
  },
  modalContent: {
    width: '100%', backgroundColor: '#1C1C1E', borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: '#333',
    shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  modalSubtitle: { fontSize: 14, color: Colors.dark.textSecondary, marginBottom: 24 },

  optionButton: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: 16, marginBottom: 12,
  },
  iconCircle: {
    width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16
  },
  optionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  optionDesc: { fontSize: 13, color: Colors.dark.textSecondary, lineHeight: 18, paddingRight: 10 }
});
