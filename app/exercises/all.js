import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EXERCISES, GROUPS } from '../../constants/exercises';
import Colors from '../../constants/Colors';

const LEVEL_LABEL = { beginner: 'Yeni', intermediate: 'Orta', advanced: 'İleri' };
const ALL = 'Tümü';

export default function AllExercises() {
  const router = useRouter();
  const [group, setGroup] = useState(ALL);
  const [level, setLevel] = useState(ALL);

  const all = useMemo(() => (
    Object.entries(EXERCISES).flatMap(([g, byLv]) =>
      Object.entries(byLv).flatMap(([lv, arr]) =>
        (arr || []).map(ex => ({ ...ex, group: g, level: lv }))
      )
    )
  ), []);

  const filtered = all.filter(it =>
    (group === ALL || it.group === group) &&
    (level === ALL || it.level === level)
  );

  const Header = (
    <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 }}>
      <Text style={{ fontSize: 20, fontWeight: '800', marginBottom: 6, color: Colors.dark.text }}>Tüm Hareketler</Text>

      <Text style={{ fontWeight: '700', marginTop: 4, color: Colors.dark.text }}>Bölge</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={{ height: 44, marginVertical: 8 }}
        contentContainerStyle={{ alignItems: 'center', paddingRight: 8 }}>
        {[ALL, ...GROUPS].map(g => (
          <TouchableOpacity key={g} onPress={() => setGroup(g)}
            style={{
              marginRight: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20,
              backgroundColor: group === g ? Colors.dark.primary : Colors.dark.surface,
              borderWidth: 1, borderColor: group === g ? Colors.dark.primary : Colors.dark.border
            }}>
            <Text style={{ color: group === g ? Colors.dark.background : Colors.dark.text, fontWeight: '700' }}>{g}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={{ fontWeight: '700', color: Colors.dark.text }}>Seviye</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginVertical: 8 }}>
        {[ALL, 'beginner', 'intermediate', 'advanced'].map(l => (
          <TouchableOpacity key={l} onPress={() => setLevel(l)}
            style={{
              paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20,
              backgroundColor: level === l ? Colors.dark.primary : Colors.dark.surface,
              borderWidth: 1, borderColor: level === l ? Colors.dark.primary : Colors.dark.border
            }}>
            <Text style={{ color: level === l ? Colors.dark.background : Colors.dark.text, fontWeight: '700' }}>
              {l === ALL ? ALL : LEVEL_LABEL[l]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dark.background }} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={(it) => `${it.group}-${it.id}`}
        ListHeaderComponent={Header}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/exercises/[group]/[id]', params: { group: item.group, id: item.id } })}
            style={{ borderWidth: 1, borderColor: Colors.dark.border, borderRadius: 12, padding: 12, marginBottom: 10, backgroundColor: Colors.dark.surface }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontWeight: '800', color: Colors.dark.text }}>{item.name}</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <View style={{ paddingVertical: 4, paddingHorizontal: 8, backgroundColor: '#333', borderRadius: 999 }}>
                  <Text style={{ fontWeight: '700', color: Colors.dark.textSecondary }}>{item.group}</Text>
                </View>
                <View style={{
                  paddingVertical: 4, paddingHorizontal: 8, borderRadius: 999,
                  backgroundColor: item.level === 'beginner' ? '#4aa' : item.level === 'intermediate' ? '#a4a' : '#d44'
                }}>
                  <Text style={{ fontWeight: '700', color: '#fff' }}>{LEVEL_LABEL[item.level]}</Text>
                </View>
              </View>
            </View>
            <Text style={{ opacity: 0.75, marginTop: 6, color: Colors.dark.textSecondary }} numberOfLines={2}>{item.desc}</Text>
            <Text style={{ marginTop: 6, opacity: 0.5, fontSize: 12, color: Colors.dark.textSecondary }}>Detay için dokun</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ opacity: 0.6, paddingHorizontal: 16, color: Colors.dark.textSecondary }}>Sonuç yok.</Text>}
      />
    </SafeAreaView>
  );
}
