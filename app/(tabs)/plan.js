import { useRouter, useFocusEffect } from 'expo-router';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useCallback, useState, useEffect } from 'react';
import { FlatList, Text, TouchableOpacity, View, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { auth, db } from '../../firebase';
import { Ionicons } from '@expo/vector-icons';

export default function PlanDashboard() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, `users/${uid}/weekly_plans`), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPlans = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlans(fetchedPlans);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  if (!uid) {
    return (
      <View style={styles.center}>
        <Text>Planlarınızı görmek için giriş yapın.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Programlarım</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : plans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="fitness-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Henüz kayıtlı bir programın yok.</Text>
          <Text style={styles.emptySubText}>Yapay zeka ile kendine özel bir program oluştur!</Text>
        </View>
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/plan/${item.id}`)}
            >
              <View style={styles.cardIcon}>
                <Ionicons name="barbell" size={24} color="#007AFF" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDate}>
                  Oluşturulma: {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('tr-TR') : 'Bugün'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/plan/new')}
      >
        <Ionicons name="add" size={30} color="#fff" />
        <Text style={styles.fabText}>Yeni Plan</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  headerContainer: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  header: { fontSize: 28, fontWeight: 'bold', color: '#111' },

  listContent: { padding: 20, paddingBottom: 100 },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4
  },
  cardIcon: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: '#eef6ff',
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 4 },
  cardDate: { fontSize: 13, color: '#888' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#333', marginTop: 20 },
  emptySubText: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8 },

  fab: {
    position: 'absolute', bottom: 30, alignSelf: 'center',
    backgroundColor: '#007AFF', borderRadius: 30,
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 24,
    elevation: 5, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8
  },
  fabText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }
});
