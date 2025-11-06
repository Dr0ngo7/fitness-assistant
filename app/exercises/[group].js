import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity } from 'react-native';
import { EXERCISES } from '../../constants/exercises';
import { db } from '../../firebase';

const prettyLevel = (lvl) => {
  const s = String(lvl || '').toLowerCase();
  return s === 'beginner' ? 'Yeni' : s === 'intermediate' ? 'Orta' : s === 'advanced' ? 'İleri' : lvl;
};

// tıklanan 'sanal' grupları gerçek slugs dizisine çevir
const GROUP_MAP = {
  arms: ['biceps', 'triceps', 'onkol'],
  sirt: ['sirt', 'lat', 'ust_sirt', 'alt_sirt'],
  omuz: ['omuz', 'omuz_on', 'omuz_orta', 'omuz_arka'],
  bacak: ['bacak', 'quad', 'ham', 'baldir', 'kalca'],
};

export default function GroupListScreen() {
  const { group } = useLocalSearchParams(); // 'gogus' | 'arms' | 'sirt' ...
  const router = useRouter();

  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const groups = GROUP_MAP[group] || [String(group)];
        let list = [];

        // Firestore 'in' maximum 10 eleman (bizimkiler 3-5 zaten)
        const q = query(collection(db, 'exercises'), where('group', 'in', groups), where('status', '==', true));
        const snap = await getDocs(q);
        list = snap.docs.map(d => ({
          id: d.id,
          name: d.data().name || d.data().name_en || 'Egzersiz',
          desc: d.data().desc || '',
          level: (d.data().level || 'Beginner').toString().toLowerCase(),
        }));

        if (alive) setItems(list);
      } catch (e) {
        if (alive) setErr(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [group]);

  const fallback = useMemo(() => {
    const slugs = GROUP_MAP[group] || [String(group)];
    const res = [];
    slugs.forEach((g) => {
      const byLevel = EXERCISES[g] || {};
      Object.entries(byLevel).forEach(([lvl, arr]) => {
        (arr || []).forEach(x => res.push({
          id: String(x.id), name: x.name, desc: x.desc || '', level: String(lvl).toLowerCase(),
        }));
      });
    });
    return res;
  }, [group]);

  const data = items ?? fallback;

  if (loading && !items) return <ActivityIndicator style={{ marginTop:24 }} />;
  if (err && !fallback.length) return <Text style={{ color:'red', padding:16 }}>Hata: {String(err.message || err)}</Text>;
  if (!data.length) return <Text style={{ padding:16 }}>Bu kas grubu için egzersiz bulunamadı.</Text>;

  return (
    <FlatList
      data={data}
      keyExtractor={(it) => it.id}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => router.push(`/exercises/${group}/${item.id}`)}
          style={{ borderWidth:1, borderColor:'#e5e7eb', borderRadius:12, padding:12 }}
        >
          <Text style={{ fontWeight:'800', fontSize:16 }}>{item.name}</Text>
          {!!item.desc && <Text style={{ opacity:0.8, marginTop:4 }}>{item.desc}</Text>}
          <Text style={{ opacity:0.6, marginTop:6, fontSize:12 }}>Seviye: {prettyLevel(item.level)}</Text>
        </TouchableOpacity>
      )}
    />
  );
}
