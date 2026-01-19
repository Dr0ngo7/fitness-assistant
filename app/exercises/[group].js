// app/exercises/[group].js
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../firebase';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

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

export default function GroupListScreen() {
  const { group } = useLocalSearchParams(); // e.g., "chest"
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Normalize group param for title
  const groupTitle = GROUP_LABELS[Object.keys(GROUP_LABELS).find(k => k.toLowerCase() === (group || '').toLowerCase())] || group;

  useEffect(() => {
    // Listen to all exercises and filter client-side for best results
    const unsub = onSnapshot(collection(db, 'exercises'), (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const targetGroup = (group || '').toLowerCase();

      const filtered = data.filter(item => {
        const g = (item.group || '').toLowerCase();
        // Simple direct match
        return g === targetGroup;
      });

      setItems(filtered);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsub();
  }, [group]);


  const getDifficultyColor = (lvl) => {
    const normalized = (lvl || '').toLowerCase();
    if (['beginner', 'easy', 'yeni', 'başlangıç'].includes(normalized)) return '#26A69A';
    if (['intermediate', 'medium', 'orta', 'orta seviye'].includes(normalized)) return '#AB47BC';
    if (['advanced', 'hard', 'ileri', 'ileri seviye'].includes(normalized)) return '#EF5350';
    return Colors.dark.textSecondary;
  };

  const getDifficultyLabel = (lvl) => {
    if (!lvl) return '-';
    return LEVEL_LABEL[lvl.toLowerCase()] || lvl;
  };

  const Header = (
    <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.dark.primary} />
        <Text style={{ color: Colors.dark.primary, fontSize: 16, marginLeft: 6, fontWeight: '600' }}>Geri Dön</Text>
      </TouchableOpacity>
      <Text style={{ fontSize: 28, fontWeight: '800', color: Colors.dark.text }}>
        {groupTitle} Egzersizleri
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dark.background }} edges={['top']}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
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
              <Text style={{ fontSize: 13, color: Colors.dark.textSecondary, marginTop: 4 }}>Bu bölge için egzersiz eklenmemiş.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
