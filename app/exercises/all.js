import { useRouter } from 'expo-router';
import { useMemo, useState, useEffect } from 'react';
import { FlatList, ScrollView, Text, TouchableOpacity, View, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import Colors from '../../constants/Colors';
import { GROUPS } from '../../constants/exercises';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const LEVEL_LABEL = {
  beginner: 'Yeni', easy: 'Yeni', yeni: 'Yeni', başlangıç: 'Yeni',
  intermediate: 'Orta', medium: 'Orta', orta: 'Orta', 'orta seviye': 'Orta',
  advanced: 'İleri', hard: 'İleri', ileri: 'İleri', 'ileri seviye': 'İleri'
};

const GROUP_LABELS = {
  Chest: 'Göğüs',
  Back: 'Sırt',
  Shoulders: 'Omuz',
  Arms: 'Kollar',
  Legs: 'Bacak',
  Core: 'Karın'
};

const ALL = 'Tümü';

export default function AllExercises() {
  const router = useRouter();
  const [group, setGroup] = useState(ALL);
  const [level, setLevel] = useState(ALL);
  const [search, setSearch] = useState('');

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Exercises from Firestore (Real-time)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'exercises'), (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExercises(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching exercises:", error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Robust Filtering
  const filtered = exercises.filter(it => {
    const itemGroup = (it.group || 'general').toLowerCase();
    const itemLevel = (it.level || 'beginner').toLowerCase();
    const itemName = (it.name || '').toLowerCase();

    const filterGroup = group === ALL ? ALL : group.toLowerCase();
    const filterLevel = level === ALL ? ALL : level.toLowerCase();
    const filterSearch = search.toLowerCase();

    // Helper to normalize levels for comparison
    const normalizeLevel = (lvl) => {
      if (['easy', 'yeni', 'başlangıç'].includes(lvl)) return 'beginner';
      if (['medium', 'orta', 'orta seviye'].includes(lvl)) return 'intermediate';
      if (['hard', 'ileri', 'ileri seviye'].includes(lvl)) return 'advanced';
      return lvl;
    };

    return (
      (filterGroup === ALL || itemGroup === filterGroup) &&
      (filterLevel === ALL || normalizeLevel(itemLevel) === normalizeLevel(filterLevel)) &&
      (itemName.includes(filterSearch))
    );
  });

  const getDifficultyLabel = (lvl) => {
    if (!lvl) return '-';
    // Normalize input like "Beginner" -> "beginner"
    const normalized = lvl.toLowerCase();
    return LEVEL_LABEL[normalized] || lvl;
  };

  const getDifficultyColor = (lvl) => {
    const normalized = (lvl || '').toLowerCase();

    // Beginner / Green - Teal
    if (['beginner', 'easy', 'yeni', 'başlangıç'].includes(normalized)) return '#26A69A';

    // Intermediate / Orange - Purple
    if (['intermediate', 'medium', 'orta', 'orta seviye'].includes(normalized)) return '#AB47BC';

    // Advanced / Red
    if (['advanced', 'hard', 'ileri', 'ileri seviye'].includes(normalized)) return '#EF5350';

    // Default Gray
    return Colors.dark.textSecondary;
  };

  const getGroupLabel = (grp) => {
    if (!grp) return '';
    // Capitalize first letter to match keys just in case, or check case-insensitively
    const match = Object.keys(GROUP_LABELS).find(k => k.toLowerCase() === grp.toLowerCase());
    return match ? GROUP_LABELS[match] : grp;
  };

  const Header = (
    <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 }}>

      {/* Title & Search */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: '800', marginBottom: 12, color: Colors.dark.text }}>Antrenman Rehberi</Text>

        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: '#1c1c1e', borderRadius: 12,
          paddingHorizontal: 12, height: 46,
          borderWidth: 1, borderColor: '#333'
        }}>
          <Ionicons name="search" size={20} color={Colors.dark.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Egzersiz ara..."
            placeholderTextColor={Colors.dark.textSecondary}
            style={{ flex: 1, color: Colors.dark.text, fontSize: 16 }}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.dark.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontWeight: '700', fontSize: 13, color: Colors.dark.textSecondary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Bölge</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ alignItems: 'center', paddingRight: 8 }}>
          {[ALL, ...GROUPS].map(g => (
            <TouchableOpacity key={g} onPress={() => setGroup(g)}
              style={{
                marginRight: 8, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 24,
                backgroundColor: group === g ? Colors.dark.primary : '#2c2c2e',
                // Removed border for easier reading, added subtle shadow for depth
              }}>
              <Text style={{ color: group === g ? Colors.dark.background : Colors.dark.text, fontWeight: '700', fontSize: 13 }}>
                {g === ALL ? ALL : (GROUP_LABELS[g] || g)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontWeight: '700', fontSize: 13, color: Colors.dark.textSecondary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Zorluk Seviyesi</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[ALL, 'beginner', 'intermediate', 'advanced'].map(l => (
            <TouchableOpacity key={l} onPress={() => setLevel(l)}
              style={{
                paddingVertical: 8, paddingHorizontal: 20, borderRadius: 24,
                backgroundColor: level === l ? Colors.dark.primary : '#2c2c2e',
              }}>
              <Text style={{ color: level === l ? Colors.dark.background : Colors.dark.text, fontWeight: '700', fontSize: 13 }}>
                {l === ALL ? ALL : LEVEL_LABEL[l]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dark.background }} edges={['top']}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
          <Text style={{ color: Colors.dark.textSecondary, marginTop: 10 }}>Veriler yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(it) => it.id}
          ListHeaderComponent={Header}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/exercises/[group]/[id]', params: { group: item.group || 'general', id: item.id } })}
              activeOpacity={0.8}
              style={{
                marginBottom: 12,
                backgroundColor: '#1c1c1e',
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: '#333',
                // Shadow
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 5,
                elevation: 3
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ fontSize: 17, fontWeight: '700', color: Colors.dark.text, lineHeight: 22, marginBottom: 4 }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: Colors.dark.textSecondary }} numberOfLines={2}>
                    {item.desc || item.description || "Açıklama yok"}
                  </Text>
                </View>

                {/* Difficulty Indicator - Pill Style */}
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  {item.group && (
                    <View style={{ paddingVertical: 4, paddingHorizontal: 8, backgroundColor: '#2c2c2e', borderRadius: 6, borderWidth: 1, borderColor: '#333' }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.dark.textSecondary, textTransform: 'uppercase' }}>{getGroupLabel(item.group)}</Text>
                    </View>
                  )}
                  {item.level && (
                    <View style={{
                      paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6,
                      backgroundColor: getDifficultyColor(item.level)
                    }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff', textTransform: 'uppercase' }}>
                        {getDifficultyLabel(item.level)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60, opacity: 0.5 }}>
              <Ionicons name="barbell-outline" size={48} color={Colors.dark.textSecondary} />
              <Text style={{ fontSize: 16, color: Colors.dark.textSecondary, marginTop: 12, fontWeight: '600' }}>Sonuç Bulunamadı</Text>
              <Text style={{ fontSize: 13, color: Colors.dark.textSecondary, marginTop: 4 }}>Arama kriterlerini değiştirin</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
