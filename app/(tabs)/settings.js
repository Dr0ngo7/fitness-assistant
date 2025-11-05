import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';

export default function Settings() {
  const [plan, setPlan] = useState([]);
  const loadPlan = async () => {
    const raw = await AsyncStorage.getItem('@plan');
    setPlan(raw ? JSON.parse(raw) : []);
  };
  useEffect(() => { loadPlan(); }, []);

  const clearAll = async () => {
    await AsyncStorage.multiRemove(['@plan']);
    Alert.alert('Temizlendi', 'Tüm demo verileri silindi.');
    setPlan([]);
  };

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:20, fontWeight:'700', marginBottom:8 }}>Ayarlar</Text>

      <TouchableOpacity
        onPress={clearAll}
        style={{ backgroundColor:'#ef4444', padding:12, borderRadius:10, alignSelf:'flex-start', marginBottom:16 }}
      >
        <Text style={{ color:'#fff', fontWeight:'700' }}>Verileri Sıfırla</Text>
      </TouchableOpacity>

      <Text style={{ fontSize:16, fontWeight:'700', marginBottom:8 }}>Programa Eklenen Hareketler</Text>
      <FlatList
        data={plan}
        keyExtractor={(i,idx)=>String(i.addedAt ?? idx)}
        renderItem={({item}) => (
          <View style={{ borderWidth:1, borderColor:'#eee', borderRadius:10, padding:10, marginBottom:8 }}>
            <Text style={{ fontWeight:'700' }}>{item.name}</Text>
            <Text style={{ opacity:0.7 }}>{item.group} • {item.level}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ opacity:0.6 }}>Henüz eklenmiş hareket yok.</Text>}
      />
    </View>
  );
}
