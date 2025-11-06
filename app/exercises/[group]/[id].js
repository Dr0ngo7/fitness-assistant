import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../../firebase';

const LEVEL_LABEL = { beginner: 'Yeni', intermediate: 'Orta', advanced: 'İleri' };

export default function ExerciseDetail() {
  const { group, id } = useLocalSearchParams(); // group burada yalnızca geri linki/etiket için
  const router = useRouter();

  const [ex, setEx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // 🔹 Firestore’dan docId ile oku
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const snap = await getDoc(doc(db, 'exercises', String(id)));
        if (!snap.exists()) {
          throw new Error('not-found');
        }
        const data = { id: snap.id, ...snap.data() };
        // bazı alanları normalize et
        data.level = String(data.level || 'beginner').toLowerCase();
        data.group = String(data.group || group || 'genel');
        setEx(data);
      } catch (e) {
        setErr(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id, group]);

  const addToPlan = async () => {
    if (!auth.currentUser) {
      Alert.alert('Uyarı', 'Programa eklemek için giriş yapmalısınız.');
      return;
    }
    try {
      const uid = auth.currentUser.uid;
      await addDoc(collection(db, `users/${uid}/plan_items`), {
        exerciseId: ex.id,
        exerciseName: ex.name || 'Egzersiz',
        group: ex.group || 'genel',
        level: ex.level || 'beginner',
        targetSets: ex?.metrics?.defaultSets ?? 3,
        targetReps: ex?.metrics?.defaultReps ?? '10-12',
        restSec: ex?.metrics?.defaultRestSec ?? 60,
        tempo: ex?.metrics?.defaultTempo ?? null,
        thumb: Array.isArray(ex.imageUrls) ? ex.imageUrls[0] : (ex.thumb || null),
        createdAt: serverTimestamp(),
        source: 'firestore',
      });
      Alert.alert('Eklendi', `"${ex.name}" kişisel planınıza eklendi.`);
    } catch (e) {
      Alert.alert('Hata', 'Programa eklenemedi: ' + (e?.message || e));
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 24 }} />;

  if (!ex) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center', padding:16 }}>
        <Text style={{ fontSize:16, fontWeight:'700', marginBottom:8 }}>Egzersiz bulunamadı</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ padding:10, backgroundColor:'#0ea5e9', borderRadius:10 }}>
          <Text style={{ color:'#fff', fontWeight:'700' }}>Geri dön</Text>
        </TouchableOpacity>
        {!!err && <Text style={{ marginTop:10, opacity:0.7, fontSize:12 }}>Hata: {String(err.message || err)}</Text>}
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding:16 }}>
      {/* Kapak görseli (varsa) */}
      { (Array.isArray(ex.imageUrls) && ex.imageUrls[0]) ?
        <Image source={{ uri: ex.imageUrls[0] }} style={{ width:'100%', height:200, borderRadius:12, marginBottom:12 }} />
        : null
      }

      <Text style={{ fontSize:22, fontWeight:'800' }}>{ex.name}</Text>

      <View style={{ flexDirection:'row', gap:8, marginTop:8 }}>
        <View style={{ paddingVertical:4, paddingHorizontal:10, backgroundColor:'#f1f5f9', borderRadius:999 }}>
          <Text style={{ fontWeight:'700' }}>{ex.group}</Text>
        </View>
        <View style={{
          paddingVertical:4, paddingHorizontal:10, borderRadius:999,
          backgroundColor: ex.level==='beginner'? '#dcfce7' : ex.level==='intermediate'? '#e0e7ff' : '#fee2e2'
        }}>
          <Text style={{ fontWeight:'700' }}>{LEVEL_LABEL[ex.level] || ex.level}</Text>
        </View>
      </View>

      {!!ex.desc && <Text style={{ marginTop:14, fontSize:16, lineHeight:22 }}>{ex.desc}</Text>}

      <View style={{ flexDirection:'row', gap:10, marginTop:16 }}>
        <TouchableOpacity onPress={addToPlan}
          style={{ backgroundColor:'#0ea5e9', paddingVertical:10, paddingHorizontal:12, borderRadius:10 }}>
          <Text style={{ color:'#fff', fontWeight:'800' }}>Programa Ekle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            const url = ex.videoUrl || ex.video || null;
            url ? Linking.openURL(url) : Alert.alert('Video yok', 'Bağlantı eklenmemiş.');
          }}
          style={{ backgroundColor:'#10b981', paddingVertical:10, paddingHorizontal:12, borderRadius:10 }}
        >
          <Text style={{ color:'#fff', fontWeight:'800' }}>Video</Text>
        </TouchableOpacity>
      </View>

      {/* Varsayılan metrikleri göster */}
      <View style={{ marginTop:16 }}>
        <Text style={{ fontWeight:'700' }}>Önerilen:</Text>
        <Text style={{ opacity:0.7, marginTop:4 }}>
          Set: {ex?.metrics?.defaultSets ?? 3} • Tekrar: {ex?.metrics?.defaultReps ?? '10-12'} • Dinlenme: {ex?.metrics?.defaultRestSec ?? 60}s
        </Text>
      </View>

      <View style={{ height:24 }}/>
    </ScrollView>
  );
}
