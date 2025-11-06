import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ImageBackground, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SLUGS = {
  Chest: 'gogus',
  Back: 'sirt',
  Shoulders: 'omuz',
  Arms: 'arms',
  Legs: 'bacak',
  Core: 'karin',
};

const FRONT_AREAS = [
  { key: 'Chest',     style: { top: '17%', left: '26%', width: '42%', height: '14%' } },
  { key: 'Core',      style: { top: '31%', left: '33%', width: '27%', height: '22%' } },
  { key: 'Arms',      style: { top: '19%', left: '12%', width: '12%', height: '22%' } },
  { key: 'Arms',      style: { top: '19%', right:'12%', width: '12%', height: '22%' } },
  { key: 'Legs',      style: { top: '56%', left: '23%', width: '50%', height: '34%' } },
  { key: 'Shoulders', style: { top: '10%', left: '28%', width: '38%', height: '10%' } },
];

const BACK_AREAS = [
  { key: 'Back',      style: { top: '18%', left: '26%', width: '42%', height: '22%' } },
  { key: 'Shoulders', style: { top: '12%', left: '28%', width: '38%', height: '10%' } },
  { key: 'Arms',      style: { top: '22%', left: '12%', width: '12%', height: '20%' } },
  { key: 'Arms',      style: { top: '22%', right:'12%', width: '12%', height: '20%' } },
  { key: 'Core',      style: { top: '40%', left: '36%', width: '24%', height: '12%' } },
  { key: 'Legs',      style: { top: '58%', left: '23%', width: '50%', height: '34%' } },
];

export default function MuscleMap() {
  const [side, setSide] = useState('front');
  const [selected, setSelected] = useState(null);
  const router = useRouter();

  const AREAS = side === 'front' ? FRONT_AREAS : BACK_AREAS;
  const imgSrc =
    side === 'front'
      ? require('../../assets/images/muscle_front.png')
      : require('../../assets/images/muscle_back.png');

  const onPick = (key) => {
    const group = SLUGS[key] || key;
    setSelected(group);
    Alert.alert('Seçildi', `${key} kas grubu seçildi`);
    router.push({ pathname: '/exercises/[group]', params: { group } });
  };

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:'#eef2f7' }} edges={['top']}>
      {/* Başlık */}
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
          <Text style={{ fontSize: 20, fontWeight: '700' }}>Kas Haritası</Text>
          <TouchableOpacity
            onPress={() => router.push('/exercises/all')}
            style={{ paddingVertical:8, paddingHorizontal:12, backgroundColor:'#0ea5e9', borderRadius:10 }}
          >
            <Text style={{ color:'#fff', fontWeight:'800' }}>Tüm Hareketler</Text>
          </TouchableOpacity>
        </View>

        {/* Ön / Arka butonları */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          {['front', 'back'].map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setSide(s)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 20,
                backgroundColor: side === s ? '#0ea5e9' : '#eef2ff',
              }}
            >
              <Text style={{ color: side === s ? '#fff' : '#0f172a', fontWeight: '700' }}>
                {s === 'front' ? 'Ön Gövde' : 'Arka Gövde'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Görsel ve dokunulabilir alanlar */}
      <View style={{ marginHorizontal: 12, borderRadius: 16, overflow: 'hidden', backgroundColor: '#fff' }}>
        <ImageBackground
          source={imgSrc}
          resizeMode="contain"
          style={{ width: '100%', aspectRatio: 3 / 4, position: 'relative' }}
        >
          {AREAS.map((a, i) => (
            <TouchableOpacity
              key={`${side}-${i}`}
              activeOpacity={0.65}
              onPress={() => onPick(a.key)}
              style={[
                {
                  position: 'absolute',
                  backgroundColor: selected === a.key ? 'rgba(14,165,233,0.28)' : 'rgba(14,165,233,0.12)',
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: 'rgba(14,165,233,0.35)',
                },
                a.style,
              ]}
            />
          ))}
        </ImageBackground>
      </View>

      <Text style={{ opacity: 0.7, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        {side === 'front'
          ? 'Ön gövdede bölgeye dokun → egzersiz listesi.'
          : 'Arka gövdede bölgeye dokun → egzersiz listesi.'}
      </Text>
    </SafeAreaView>
  );
}
