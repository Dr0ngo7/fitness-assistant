import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../firebase';

const ARMS_SEED = [
  // BICEPS
  {
    name: 'Barbell Curl',
    group: 'biceps',
    level: 'beginner',
    status: true,
    desc: 'Düz bar ile biceps curl.',
    metrics: { defaultSets: 3, defaultReps: '10-12', defaultRestSec: 60 },
    imageUrls: ['https://i.imgur.com/9u0QeJm.jpeg'],
    videoUrl: 'https://www.youtube.com/watch?v=kwG2ipFRgfo',
  },
  {
    name: 'Dumbbell Hammer Curl',
    group: 'biceps',
    level: 'intermediate',
    status: true,
    desc: 'Nötr tutuşla biceps ve brachialis odaklı.',
    metrics: { defaultSets: 3, defaultReps: '8-10', defaultRestSec: 75 },
    imageUrls: ['https://i.imgur.com/lm7kz0U.jpeg'],
    videoUrl: 'https://www.youtube.com/watch?v=zC3nLlEvin4',
  },

  // TRICEPS
  {
    name: 'Triceps Pushdown',
    group: 'triceps',
    level: 'beginner',
    status: true,
    desc: 'Kablo istasyonunda triceps izolasyonu.',
    metrics: { defaultSets: 3, defaultReps: '10-12', defaultRestSec: 60 },
    imageUrls: ['https://i.imgur.com/7zZQv9W.jpeg'],
    videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU',
  },
  {
    name: 'Overhead Dumbbell Extension',
    group: 'triceps',
    level: 'intermediate',
    status: true,
    desc: 'Baş üstü dambıl uzatma, uzun baş vurgusu.',
    metrics: { defaultSets: 3, defaultReps: '10-12', defaultRestSec: 75 },
    imageUrls: ['https://i.imgur.com/6k0k0vS.jpeg'],
    videoUrl: 'https://www.youtube.com/watch?v=6SS6K3lAwZ8',
  },

  // ÖNKOL (onkol)
  {
    name: 'Wrist Curl',
    group: 'onkol',
    level: 'beginner',
    status: true,
    desc: 'Önkol fleksörleri için bilek curl.',
    metrics: { defaultSets: 3, defaultReps: '12-15', defaultRestSec: 45 },
    imageUrls: ['https://i.imgur.com/4kzWq1C.jpeg'],
    videoUrl: 'https://www.youtube.com/watch?v=KJ3Z8Jx0H3E',
  },
  {
    name: 'Reverse Wrist Curl',
    group: 'onkol',
    level: 'beginner',
    status: true,
    desc: 'Önkol ekstansörleri için ters bilek curl.',
    metrics: { defaultSets: 3, defaultReps: '12-15', defaultRestSec: 45 },
    imageUrls: ['https://i.imgur.com/3k2X3JY.jpeg'],
    videoUrl: 'https://www.youtube.com/watch?v=Vxx9b5XfTvk',
  },
];

export default function SeedArms() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const seed = async () => {
    try {
      setBusy(true);
      const col = collection(db, 'exercises');
      for (const ex of ARMS_SEED) {
        await addDoc(col, {
          ...ex,
          createdAt: serverTimestamp(),
        });
      }
      Alert.alert('Tamam', 'Arms (biceps+triceps+onkol) egzersizleri eklendi.');
      router.replace('/exercises/arms');
    } catch (e) {
      Alert.alert('Hata', String(e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding:16 }}>
      <Text style={{ fontSize:20, fontWeight:'800', marginBottom:12 }}>Seed: Arms</Text>
      <Text style={{ opacity:0.8, marginBottom:12 }}>
        Bu sayfa biceps, triceps ve önkol için örnek egzersizleri Firestore’a ekler.
      </Text>

      <TouchableOpacity
        onPress={seed}
        disabled={busy}
        style={{
          backgroundColor: busy ? '#94a3b8' : '#0ea5e9',
          padding:14,
          borderRadius:10
        }}
      >
        <Text style={{ color:'#fff', fontWeight:'800', textAlign:'center' }}>
          {busy ? 'Yükleniyor…' : 'Arms Egzersizlerini Ekle'}
        </Text>
      </TouchableOpacity>

      <View style={{ height:16 }} />

      <TouchableOpacity
        onPress={() => router.push('/exercises/arms')}
        style={{ padding:12, borderRadius:10, backgroundColor:'#f1f5f9' }}
      >
        <Text style={{ fontWeight:'700', textAlign:'center' }}>Arms Listesine Git</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
