// app/exercises/[group].js
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../firebase';

const prettyLevel = (lvl) => {
  const s = String(lvl || '').toLowerCase();
  return s === 'beginner' ? 'Yeni'
       : s === 'intermediate' ? 'Orta'
       : s === 'advanced' ? 'İleri'
       : s;
};

// “arms” => birden çok gerçek grubu birlikte listele
const VIRTUAL = {
  arms: ['biceps', 'triceps', 'onkol'], // onkol = önkol
};

export default function GroupListScreen() {
  const { group } = useLocalSearchParams();  // örn: "gogus", "sirt", "arms"
  const router = useRouter();

  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);

        const col = collection(db, 'exercises');
        const g = String(group || '').toLowerCase();

        let q;
        if (VIRTUAL[g]) {
          // “arms” için biceps+triceps+onkol’u birlikte çekiyoruz
          q = query(
            col,
            where('group', 'in', VIRTUAL[g]),
            where('status', '==', true)
          );
        } else {
          // normal tek grup
          q = query(
            col,
            where('group', '==', g),
            where('status', '==', true)
          );
        }

        const snap = await getDocs(q);
        const list = snap.docs
          .map(d => {
            const data = d.data();
            return {
              id: d.id,
              name: data.name || data.name_en || 'Egzersiz',
              desc: data.desc || '',
              level: (data.level || 'beginner').toString().toLowerCase(),
              group: data.group || g,
              thumb: Array.isArray(data.imageUrls) ? data.imageUrls[0] : (data.thumb || null),
            };
          })
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        if (alive) setItems(list);
      } catch (e) {
        if (alive) setErr(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [group]);

  if (loading && !items) return <ActivityIndicator style={{ marginTop: 24 }} />;
  if (err) return <Text style={{ color:'red', padding:16 }}>Hata: {String(err.message || err)}</Text>;
  if (!items || !items.length) return <Text style={{ padding:16 }}>Bu kas grubu için egzersiz bulunamadı.</Text>;

  return (
    <FlatList
      data={items}
      keyExtractor={(it) => it.id}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => router.push(`/exercises/${item.group || group}/${item.id}`)}
          style={{
            flexDirection:'row',
            gap:10,
            borderWidth:1,
            borderColor:'#e5e7eb',
            borderRadius:12,
            padding:12,
            backgroundColor:'#fff'
          }}
        >
          {!!item.thumb && (
            <Image source={{ uri: item.thumb }} style={{ width:56, height:56, borderRadius:8 }} />
          )}
          <View style={{ flex:1 }}>
            <Text style={{ fontWeight:'800', fontSize:16 }}>{item.name}</Text>
            {!!item.desc && <Text style={{ opacity:0.8, marginTop:4 }} numberOfLines={2}>{item.desc}</Text>}
            <Text style={{ opacity:0.6, marginTop:6, fontSize:12 }}>Seviye: {prettyLevel(item.level)}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}
