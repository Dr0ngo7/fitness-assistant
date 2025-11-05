import { collection, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text } from 'react-native';
import { db } from '../../firebase';

const GROUPS = [
  // ÜST
  { key:'gogus', name:'Göğüs', order:10 },
  { key:'sirt', name:'Sırt', order:20 },
  { key:'omuz', name:'Omuz', order:30 },
  { key:'kol', name:'Kol', order:40 },
  { key:'bacak', name:'Bacak', order:50 },
  { key:'kalca', name:'Kalça / Glute', order:60 },
  { key:'karin', name:'Karın / Core', order:70 },
  { key:'trapez_boyun', name:'Trapez & Boyun', order:80 },
  { key:'baldir', name:'Baldır (Calves)', order:100 },
  { key:'fullbody', name:'Tüm Vücut / Compound', order:110 },
  { key:'kardiyo', name:'Kardiyo / Kondisyon', order:120 },
  // ALT
  { key:'lat', name:'Lat (Kanat)', parentKey:'sirt', order:21 },
  { key:'ust_sirt', name:'Üst Sırt', parentKey:'sirt', order:22 },
  { key:'alt_sirt', name:'Alt Sırt (Erector)', parentKey:'sirt', order:23 },
  { key:'omuz_on', name:'Ön Omuz', parentKey:'omuz', order:31 },
  { key:'omuz_orta', name:'Orta Omuz', parentKey:'omuz', order:32 },
  { key:'omuz_arka', name:'Arka Omuz', parentKey:'omuz', order:33 },
  { key:'biceps', name:'Biceps', parentKey:'kol', order:41 },
  { key:'triceps', name:'Triceps', parentKey:'kol', order:42 },
  { key:'onkol', name:'Önkol', parentKey:'kol', order:43 },
  { key:'quad', name:'Quadriceps (Ön Uyluk)', parentKey:'bacak', order:51 },
  { key:'ham', name:'Hamstrings (Arka Uyluk)', parentKey:'bacak', order:52 },
  { key:'glute', name:'Glute', parentKey:'kalca', order:61 },
  { key:'karin_ust', name:'Üst Karın', parentKey:'karin', order:71 },
  { key:'karin_alt', name:'Alt Karın', parentKey:'karin', order:72 },
  { key:'oblik', name:'Oblik', parentKey:'karin', order:73 },
];

export default function SeedGroupsScreen() {
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState(0);

  const runSeed = async () => {
    try {
      setBusy(true);
      const col = collection(db, 'muscle_groups');
      for (const g of GROUPS) {
        await setDoc(doc(col, g.key), {
          slug: g.key,
          name: g.name,
          parentKey: g.parentKey ?? null,
          order: g.order ?? 999,
          status: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
        console.log('GROUP:', g.key);
      }
      const snap = await getDocs(col);
      setCount(snap.size);
      Alert.alert('Tamam', `Kas grupları eklendi. Toplam: ${snap.size}`);
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', String(e?.message || e));
    } finally { setBusy(false); }
  };

  return (
    <ScrollView contentContainerStyle={{ padding:16, gap:12 }}>
      <Text style={{ fontSize:20, fontWeight:'700' }}>Kas Bölgeleri Seed</Text>
      <Pressable disabled={busy} onPress={runSeed}
        style={{ backgroundColor:'#0a84ff', opacity:busy?0.6:1, padding:14, borderRadius:12, alignItems:'center' }}>
        <Text style={{ color:'#fff', fontWeight:'700' }}>{busy?'Yazılıyor…':'Seed Et'}</Text>
      </Pressable>
      <Text>Toplam kayıt (yenile sonra güncellenir): {count}</Text>
    </ScrollView>
  );
}
