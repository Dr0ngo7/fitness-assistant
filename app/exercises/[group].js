// app/exercises/[group].js
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../firebase';
import Colors from '../../constants/Colors';

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

        // Basitleştirilmiş sorgu: Doğrudan grup eşleşmesi
        const q = query(
          col,
          where('group', '==', g),
          where('status', '==', true)
        );

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

  if (loading && !items) return <ActivityIndicator style={{ marginTop: 24 }} color={Colors.dark.primary} />;
  if (err) return <Text style={{ color: Colors.dark.error, padding: 16 }}>Hata: {String(err.message || err)}</Text>;
  if (!items || !items.length) return <Text style={{ padding: 16, color: Colors.dark.textSecondary }}>Bu kas grubu için egzersiz bulunamadı.</Text>;

  return (
    <FlatList
      data={items}
      keyExtractor={(it) => it.id}
      contentContainerStyle={{ padding: 16, gap: 12, backgroundColor: Colors.dark.background, flexGrow: 1 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => router.push(`/exercises/${item.group || group}/${item.id}`)}
          style={{
            flexDirection: 'row',
            gap: 10,
            borderWidth: 1,
            borderColor: Colors.dark.border,
            borderRadius: 12,
            padding: 12,
            backgroundColor: Colors.dark.surface
          }}
        >
          {!!item.thumb && (
            <Image source={{ uri: item.thumb }} style={{ width: 56, height: 56, borderRadius: 8 }} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '800', fontSize: 16, color: Colors.dark.text }}>{item.name}</Text>
            {!!item.desc && <Text style={{ opacity: 0.8, marginTop: 4, color: Colors.dark.textSecondary }} numberOfLines={2}>{item.desc}</Text>}
            <Text style={{ opacity: 0.6, marginTop: 6, fontSize: 12, color: Colors.dark.textSecondary }}>Seviye: {prettyLevel(item.level)}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}
