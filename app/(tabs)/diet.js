import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';

const keyFor = (dateStr) => `@calories:${dateStr}`;

export default function Diet() {
  const [kcal, setKcal] = useState('');
  const [items, setItems] = useState([]);
  const today = new Date().toISOString().slice(0,10); // YYYY-MM-DD

  const load = async () => {
    const raw = await AsyncStorage.getItem(keyFor(today));
    setItems(raw ? JSON.parse(raw) : []);
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    const val = parseInt(kcal, 10);
    if (isNaN(val) || val <= 0) return Alert.alert('Uyarı', 'Geçerli kalori girin.');
    const next = [{ id: Date.now().toString(), kcal: val }, ...items];
    setItems(next);
    await AsyncStorage.setItem(keyFor(today), JSON.stringify(next));
    setKcal('');
  };

  const total = items.reduce((a,b)=>a+b.kcal,0);

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:20, fontWeight:'700' }}>Günlük Kalori Takibi</Text>
      <Text style={{ opacity:0.7, marginBottom:12 }}>{today}</Text>

      <View style={{ flexDirection:'row', gap:8, marginBottom:12 }}>
        <TextInput
          placeholder="Örn: 350"
          keyboardType="number-pad"
          value={kcal}
          onChangeText={setKcal}
          style={{ flex:1, borderWidth:1, borderColor:'#ddd', borderRadius:10, padding:12 }}
        />
        <TouchableOpacity onPress={add} style={{ backgroundColor:'#0ea5e9', paddingHorizontal:16, borderRadius:10, justifyContent:'center' }}>
          <Text style={{ color:'#fff', fontWeight:'700' }}>Ekle</Text>
        </TouchableOpacity>
      </View>

      <Text style={{ fontSize:16, fontWeight:'700', marginBottom:8 }}>Toplam: {total} kcal</Text>

      <FlatList
        data={items}
        keyExtractor={(i)=>i.id}
        renderItem={({item}) => (
          <View style={{ borderWidth:1, borderColor:'#eee', borderRadius:10, padding:10, marginBottom:8 }}>
            <Text>{item.kcal} kcal</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ opacity:0.6 }}>Henüz giriş yok.</Text>}
      />
    </View>
  );
}
