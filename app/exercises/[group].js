import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { EXERCISES } from '../../constants/exercises';
import { db } from '../../firebase';

const prettyLevel = (lvl) => {
  const s = String(lvl || '').toLowerCase();
  return s === 'beginner' ? 'Yeni' : s === 'intermediate' ? 'Orta' : s === 'advanced' ? 'İleri' : lvl;
};

export default function GroupListScreen() {
  const { group } = useLocalSearchParams();  // "gogus"
  const router = useRouter();

  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'exercises'),
          where('group', '==', String(group)),
          where('status', '==', true)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name || data.name_en || 'Egzersiz',
            desc: data.desc || '',
            level: (data.level || 'Beginner').toString().toLowerCase(),
            thumb: (data.imageUrls && data.imageUrls[0]) || data.image || null,
          };
        });
        if (alive) setItems(list);
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [group]);

  const fallback = useMemo(() => {
    const res = [];
    const byLevel = EXERCISES[group] || {};
    Object.entries(byLevel).forEach(([lvl, arr]) => {
      (arr || []).forEach((x) =>
        res.push({ id: String(x.id), name: x.name, desc: x.desc || '', level: String(lvl).toLowerCase(), thumb: x.image || null })
      );
    });
    return res;
  }, [group]);

  const data = items ?? fallback;

  if (loading && !items) return <ActivityIndicator style={{ marginTop: 24 }} />;
  if (!data.length) return <Text style={{ padding:16 }}>Bu kas grubu için egzersiz bulunamadı.</Text>;

  return (
    <FlatList
      data={data}
      keyExtractor={(it) => it.id}
      contentContainerStyle={{ padding:16, gap:12 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/exercises/[group]/[id]',
              params: { group: String(group), id: String(item.id) },
            })
          }
          style={{ flexDirection:'row', gap:12, borderWidth:1, borderColor:'#e5e7eb', borderRadius:12, padding:12 }}
        >
          {item.thumb ? (
            <Image source={{ uri: item.thumb }} style={{ width:64, height:64, borderRadius:8 }} />
          ) : (
            <View style={{ width:64, height:64, borderRadius:8, backgroundColor:'#f1f5f9', alignItems:'center', justifyContent:'center' }}>
              <Text style={{ fontSize:12, opacity:0.6 }}>no img</Text>
            </View>
          )}
          <View style={{ flex:1 }}>
            <Text style={{ fontWeight:'800', fontSize:16 }}>{item.name}</Text>
            {!!item.desc && <Text style={{ opacity:0.8, marginTop:4 }}>{item.desc}</Text>}
            <Text style={{ opacity:0.6, marginTop:6, fontSize:12 }}>Seviye: {prettyLevel(item.level)}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}
