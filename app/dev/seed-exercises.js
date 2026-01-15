import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text } from 'react-native';
import { db } from '../../firebase';

const EXERCISES = [
  {
    name:'Bench Press', name_en:'Barbell Bench Press', slug:'bench-press',
    group:'gogus', secondaryGroups:['triceps','omuz_on'],
    level:'Intermediate', mechanic:'Compound', equipment:'Barbell', force:'Push',
    stabilizers:['core'], unilateral:false,
    desc:'Düz sehpa bar press.', cues:['Omuzları ger','Dirsekleri çok açma'],
    steps:['Benche uzan','Barı kontrollü indir','Göğüsten it'],
    contraindications:['Omuz problemi'],
    videoUrl:'https://youtu.be/xxx',
    imageUrls:['https://.../bench-thumb.jpg'],
    metrics:{ defaultSets:4, defaultReps:'6-8', defaultRestSec:120, defaultTempo:'2-0-1' },
    tags:['strength','chest','compound'], status:true, version:1
  },
  {
    name:'Push-Up', name_en:'Push-Up', slug:'push-up',
    group:'gogus', secondaryGroups:['triceps','omuz_on'],
    level:'Beginner', mechanic:'Compound', equipment:'Bodyweight', force:'Push',
    stabilizers:['core'], unilateral:false,
    desc:'Vücut ağırlığıyla şınav.', cues:['Vücudu düz tut','Dirsek çizgisine dikkat'],
    steps:['Plank pozisyonu','Dirsekleri bük','Yukarı it'],
    contraindications:[],
    videoUrl:'https://youtu.be/yyy',
    imageUrls:[],
    metrics:{ defaultSets:3, defaultReps:'10-15', defaultRestSec:60, defaultTempo:'2-0-1' },
    tags:['bodyweight','chest'], status:true, version:1
  },
  {
    name:'Dumbbell Fly', name_en:'Dumbbell Fly', slug:'dumbbell-fly',
    group:'gogus', secondaryGroups:['omuz_on'],
    level:'Beginner', mechanic:'Isolation', equipment:'Dumbbell', force:'Push',
    stabilizers:[], unilateral:false,
    desc:'Dumbbell ile fly.', cues:['Kollar hafif bükük','Omuzları sıkıştır'],
    steps:['Benche uzan','Kolları aç','Kapat'],
    contraindications:['Omuz sıkışması'],
    videoUrl:'https://youtu.be/zzz',
    imageUrls:[],
    metrics:{ defaultSets:3, defaultReps:'10-12', defaultRestSec:60, defaultTempo:'2-1-2' },
    tags:['isolation','chest'], status:true, version:1
  },
];

const normalizeLevel = (lvl) => {
  const s = String(lvl || '').trim().toLowerCase();
  if (s === 'beginner' || s === 'yeni' || s.startsWith('beg')) return 'beginner';
  if (s === 'intermediate' || s === 'orta' || s.startsWith('int')) return 'intermediate';
  if (s === 'advanced' || s === 'ileri' || s.startsWith('adv')) return 'advanced';
  return 'beginner';
};

const normalizeExercise = (ex) => {
  const slug = String(ex.slug || '').trim();
  return {
    ...ex,
    slug,
    level: normalizeLevel(ex.level),
    status: ex.status ?? true,
    secondaryGroups: Array.isArray(ex.secondaryGroups) ? ex.secondaryGroups : [],
    stabilizers: Array.isArray(ex.stabilizers) ? ex.stabilizers : [],
    cues: Array.isArray(ex.cues) ? ex.cues : [],
    steps: Array.isArray(ex.steps) ? ex.steps : [],
    contraindications: Array.isArray(ex.contraindications) ? ex.contraindications : [],
    tags: Array.isArray(ex.tags) ? ex.tags : [],
    imageUrls: Array.isArray(ex.imageUrls) ? ex.imageUrls : [],
    metrics: ex.metrics ?? {},
  };
};

export default function SeedExercisesScreen() {
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState(0);

  const runSeed = async () => {
    try {
      setBusy(true);

      const col = collection(db, 'exercises');

      for (const ex of EXERCISES) {
        const clean = normalizeExercise(ex);
        if (!clean.slug) continue;

        // createdAt'ı ilk eklemede koymak için merge + fallback yaklaşımı:
        await setDoc(
          doc(col, clean.slug),
          {
            ...clean,
            // createdAt var ise dokunma, yoksa oluştur:
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        console.log('EX upsert:', clean.slug);
      }

      const snap = await getDocs(query(col, where('group', '==', 'gogus')));
      setCount(snap.size);
      Alert.alert('Tamam', `Egzersizler upsert edildi. Göğüs sayısı: ${snap.size}`);
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', String(e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '700' }}>Egzersiz Seed (Stabil Upsert)</Text>

      <Pressable
        disabled={busy}
        onPress={runSeed}
        style={{
          backgroundColor: '#0a84ff',
          opacity: busy ? 0.6 : 1,
          padding: 14,
          borderRadius: 12,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>{busy ? 'Yazılıyor…' : 'Seed Et (Upsert)'}</Text>
      </Pressable>

      <Text>Göğüs egzersizi sayısı: {count}</Text>
    </ScrollView>
  );
}
