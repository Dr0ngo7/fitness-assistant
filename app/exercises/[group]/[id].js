import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { EXERCISES } from '../../../constants/exercises';
import { auth, db } from '../../../firebase';
import { addPlanItemFS } from '../../../lib/programs';

const LEVEL_LABEL = { beginner:'Yeni', intermediate:'Orta', advanced:'İleri' };

export default function ExerciseDetail() {
  const { group, id } = useLocalSearchParams();
  const router = useRouter();
  const [fsData, setFsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'exercises', String(id)));
        if (alive && snap.exists()) {
          const d = snap.data();
          setFsData({
            id: snap.id,
            name: d.name || d.name_en || 'Egzersiz',
            desc: d.desc || '',
            group: d.group || String(group),
            level: (d.level || 'Beginner').toString().toLowerCase(),
            video: d.videoUrl || null,
            thumb: (d.imageUrls && d.imageUrls[0]) || d.image || null,
            raw: d,
          });
        }
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [id, group]);

  const localData = useMemo(() => {
    const byLevel = EXERCISES[group] || {};
    for (const [lvl, arr] of Object.entries(byLevel)) {
      const found = (arr || []).find((x) => String(x.id) === String(id));
      if (found) {
        return {
          id: found.id, name: found.name, desc: found.desc || '', group: String(group),
          level: String(lvl).toLowerCase(), video: found.video || null, thumb: found.image || null, raw: found
        };
      }
    }
    return null;
  }, [group, id]);

  const data = fsData || localData;

  const addToPlan = async () => {
  try {
    const payload = {
      exerciseId: String(data?.id ?? id),
      exerciseName: data?.name || 'Egzersiz',
      group: String(data?.group || group),
      level: data?.level || 'beginner',
      targetSets: data?.raw?.metrics?.defaultSets ?? 3,
      targetReps: data?.raw?.metrics?.defaultReps ?? '10-12',
      restSec: data?.raw?.metrics?.defaultRestSec ?? 60,
      tempo: data?.raw?.metrics?.defaultTempo ?? null,
      thumb: data?.thumb || null,
      addedAt: Date.now(),
      source: fsData ? 'firestore' : 'local',
    };

    if (auth.currentUser) {
      await addPlanItemFS(payload);      // → Firestore
    } else {
      const key='@plan';
      const raw = await AsyncStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      await AsyncStorage.setItem(key, JSON.stringify([payload, ...arr])); // → Local
    }

    Alert.alert('Eklendi', `"${payload.exerciseName}" programa eklendi.`);
  } catch (e) {
    Alert.alert('Hata', e.message || 'Programa eklenemedi.');
  }
};

  if (loading && !localData) {
    return (<View style={{ flex:1, justifyContent:'center', alignItems:'center', padding:16 }}>
      <ActivityIndicator /><Text style={{ marginTop:8 }}>Yükleniyor…</Text></View>);
  }

  if (!data) {
    return (<View style={{ flex:1, justifyContent:'center', alignItems:'center', padding:16 }}>
      <Text style={{ fontSize:16, fontWeight:'700', marginBottom:8 }}>Egzersiz bulunamadı</Text>
      <TouchableOpacity onPress={() => router.back()}
        style={{ padding:10, backgroundColor:'#0ea5e9', borderRadius:10 }}>
        <Text style={{ color:'#fff', fontWeight:'700' }}>Geri dön</Text>
      </TouchableOpacity>
    </View>);
  }

  return (
    <ScrollView contentContainerStyle={{ padding:16 }}>
      <Text style={{ fontSize:22, fontWeight:'800' }}>{data.name}</Text>

      <View style={{ flexDirection:'row', gap:8, marginTop:8 }}>
        <View style={{ paddingVertical:4, paddingHorizontal:10, backgroundColor:'#f1f5f9', borderRadius:999 }}>
          <Text style={{ fontWeight:'700' }}>{data.group}</Text>
        </View>
        <View style={{
          paddingVertical:4, paddingHorizontal:10, borderRadius:999,
          backgroundColor: data.level==='beginner'? '#dcfce7' : data.level==='intermediate'? '#e0e7ff' : '#fee2e2'
        }}>
          <Text style={{ fontWeight:'700' }}>{LEVEL_LABEL[data.level] || data.level}</Text>
        </View>
      </View>

      {!!data.thumb && (
        <Image source={{ uri: data.thumb }} style={{ width:'100%', height:200, borderRadius:12, marginTop:12 }} />
      )}

      {!!data.desc && <Text style={{ marginTop:14, fontSize:16, lineHeight:22 }}>{data.desc}</Text>}

      <View style={{ flexDirection:'row', gap:10, marginTop:16 }}>
        <TouchableOpacity onPress={addToPlan}
          style={{ backgroundColor:'#0ea5e9', paddingVertical:10, paddingHorizontal:12, borderRadius:10 }}>
          <Text style={{ color:'#fff', fontWeight:'800' }}>Programa Ekle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => (data.video ? Linking.openURL(data.video) : Alert.alert('Video yok', 'Bağlantı eklenmemiş.'))}
          style={{ backgroundColor:'#10b981', paddingVertical:10, paddingHorizontal:12, borderRadius:10 }}
        >
          <Text style={{ color:'#fff', fontWeight:'800' }}>Video</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height:24 }} />
    </ScrollView>
  );
}
