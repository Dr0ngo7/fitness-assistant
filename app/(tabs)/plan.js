import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, View } from 'react-native';
import { auth } from '../../firebase';
import { fetchActiveProgramWithExercises } from '../../lib/programs';

export default function PlanScreen() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]); // normalize edilmiş liste

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        if (auth.currentUser) {
          // Firestore’dan (giriş varsa)
          const res = await fetchActiveProgramWithExercises();
          const norm = (res?.items || []).map((it) => ({
            id: it.id,
            exerciseId: it.exercise?.id || it.exerciseId,
            exerciseName: it.exercise?.name || it.exerciseName || 'Egzersiz',
            group: it.exercise?.group || it.group,
            level: (it.exercise?.level || it.level || 'beginner').toLowerCase(),
            targetSets: it.targetSets ?? 3,
            targetReps: it.targetReps ?? '10-12',
            restSec: it.restSec ?? 60,
            tempo: it.tempo ?? null,
            thumb:
              (it.exercise?.imageUrls && it.exercise.imageUrls[0]) ||
              it.thumb ||
              null,
          }));
          if (alive) setItems(norm);
        } else {
          // AsyncStorage’dan (giriş yoksa)
          const raw = await AsyncStorage.getItem('@plan');
          const arr = raw ? JSON.parse(raw) : [];
          if (alive) setItems(arr);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 24 }} />;

  if (!items.length) {
    return <Text style={{ padding: 16 }}>Programında henüz egzersiz yok.</Text>;
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(x, i) => String(x.id || x.exerciseId || i)}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={({ item }) => (
        <View style={{ flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12 }}>
          {item.thumb ? (
            <Image source={{ uri: item.thumb }} style={{ width: 64, height: 64, borderRadius: 8 }} />
          ) : (
            <View style={{ width: 64, height: 64, borderRadius: 8, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 12, opacity: 0.6 }}>no img</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '800' }}>{item.exerciseName}</Text>
            <Text style={{ opacity: 0.7, marginTop: 4 }}>Grup: {item.group} • Seviye: {item.level}</Text>
            <Text style={{ opacity: 0.6, marginTop: 4, fontSize: 12 }}>
              Set: {item.targetSets} • Tekrar: {item.targetReps} • Dinlenme: {item.restSec}s
            </Text>
          </View>
        </View>
      )}
    />
  );
}
