import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getDocs, onSnapshot } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebase';

export default function PlanScreen() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const uid = auth.currentUser?.uid;

  // 🔹 Canlı dinleme: users/{uid}/plan_items
  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    const colRef = collection(db, `users/${uid}/plan_items`);
    const unsub = onSnapshot(
      colRef,
      (snap) => {
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setItems(arr);
        setLoading(false);
      },
      (err) => {
        console.error('plan_items onSnapshot error:', err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [uid]);

  const onRefresh = useCallback(async () => {
    if (!uid) return;
    setRefreshing(true);
    try {
      const snap = await getDocs(collection(db, `users/${uid}/plan_items`));
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } finally {
      setRefreshing(false);
    }
  }, [uid]);

  const removeItem = async (itemId) => {
    if (!uid) return;
    Alert.alert('Sil', 'Bu egzersizi planınızdan kaldırmak istiyor musunuz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, `users/${uid}/plan_items/${itemId}`));
          } catch (e) {
            Alert.alert('Hata', 'Silinemedi: ' + (e?.message || e));
          }
        },
      },
    ]);
  };

  if (!auth.currentUser) {
    return (
      <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:16 }}>
        <Text>Planı görmek için giriş yapın.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
        <Text>Yükleniyor…</Text>
      </View>
    );
  }

  if (!items.length) {
    return (
      <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:16 }}>
        <Text>Planınızda egzersiz yok.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(it) => it.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={{ padding:16, gap:12 }}
      renderItem={({ item }) => (
        <View
          style={{
            borderWidth:1, borderColor:'#e5e7eb', borderRadius:12, padding:12,
            backgroundColor:'#fff'
          }}
        >
          <TouchableOpacity
            onPress={() => router.push(`/exercises/${item.group}/${item.exerciseId || item.id}`)}
          >
            <Text style={{ fontWeight:'800', fontSize:16 }}>{item.exerciseName || item.name || 'Egzersiz'}</Text>
            <Text style={{ opacity:0.7, marginTop:4 }}>
              {item.group} • {item.level || 'beginner'}
            </Text>
            {item.targetSets && item.targetReps ? (
              <Text style={{ opacity:0.6, marginTop:2 }}>
                Set: {item.targetSets} • Tekrar: {item.targetReps} • Dinlenme: {item.restSec ?? 60}s
              </Text>
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => removeItem(item.id)}
            style={{ alignSelf:'flex-end', marginTop:8, paddingVertical:6, paddingHorizontal:10, borderRadius:8, backgroundColor:'#fee2e2' }}
          >
            <Text style={{ color:'#b91c1c', fontWeight:'700' }}>Sil</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}
