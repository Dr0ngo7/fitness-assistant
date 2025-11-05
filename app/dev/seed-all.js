import { signInAnonymously } from 'firebase/auth';
import {
    addDoc, collection, doc, serverTimestamp, writeBatch
} from 'firebase/firestore';
import { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebase';

const now = () => serverTimestamp();

/** ---------- KAS GRUPLARI (slug’lar Firestore 'group' alanıyla uyumlu) ---------- */
const MUSCLE_GROUPS = [
  { slug: 'gogus',      name: 'Göğüs',               parentKey: null, order: 1 },
  { slug: 'sirt',       name: 'Sırt',                parentKey: null, order: 2 },
  { slug: 'omuz',       name: 'Omuz',                parentKey: null, order: 3 },
  { slug: 'biceps',     name: 'Biceps',              parentKey: 'kol', order: 4 },
  { slug: 'triceps',    name: 'Triceps',             parentKey: 'kol', order: 5 },
  { slug: 'onkol',      name: 'Önkol',               parentKey: 'kol', order: 6 },
  { slug: 'karin',      name: 'Karın / Core',        parentKey: null, order: 7 },
  { slug: 'kalca',      name: 'Kalça / Glute',       parentKey: null, order: 8 },
  { slug: 'bacak',      name: 'Bacak (Genel)',       parentKey: null, order: 9 },
  { slug: 'quad',       name: 'Quadriceps',          parentKey: 'bacak', order:10 },
  { slug: 'ham',        name: 'Hamstrings',          parentKey: 'bacak', order:11 },
  { slug: 'baldir',     name: 'Baldır (Calves)',     parentKey: 'bacak', order:12 },
  { slug: 'lat',        name: 'Lat (Kanat)',         parentKey: 'sirt', order:13 },
  { slug: 'ust_sirt',   name: 'Üst Sırt',            parentKey: 'sirt', order:14 },
  { slug: 'alt_sirt',   name: 'Alt Sırt (Erector)',  parentKey: 'sirt', order:15 },
  { slug: 'omuz_on',    name: 'Ön Omuz',             parentKey: 'omuz', order:16 },
  { slug: 'omuz_orta',  name: 'Orta Omuz',           parentKey: 'omuz', order:17 },
  { slug: 'omuz_arka',  name: 'Arka Omuz',           parentKey: 'omuz', order:18 },
];

/** ---------- TEMEL EGZERSİZLER (her grup için 1–3 örnek) ---------- */
/** Şema tutarlılığı: name, slug, group, level, mechanic, equipment, force, desc, cues[], steps[], videoUrl, imageUrls[], metrics, tags[], status, version */
const EXS = [
  // Göğüs
  {
    name: 'Barbell Bench Press', slug:'bench-press', group:'gogus', level:'Intermediate',
    mechanic:'Compound', equipment:'Barbell', force:'Push',
    desc:'Düz sehpada bar ile bench press.',
    cues:['Omuzları ger','Dirsekleri çok açma'], steps:['Benche uzan','Barı kontrollü indir','Göğüsten it'],
    videoUrl:'https://youtu.be/vari1',
    imageUrls:['https://i.imgur.com/4ZQpGvE.jpeg'],
    metrics:{ defaultSets:4, defaultReps:'6-8', defaultRestSec:120, defaultTempo:'2-0-1' },
    tags:['strength','chest','compound'], status:true, version:1,
  },
  {
    name:'Push-Up', slug:'push-up', group:'gogus', level:'Beginner',
    mechanic:'Compound', equipment:'Bodyweight', force:'Push',
    desc:'Vücut ağırlığı ile şınav.',
    cues:['Vücudu düz tut','Dirsek çizgisine dikkat'], steps:['Kolları yerleştir','Göğsü indir','Yukarı it'],
    videoUrl:'https://youtu.be/vari2',
    imageUrls:['https://i.imgur.com/c1bJ7fH.jpeg'],
    metrics:{ defaultSets:3, defaultReps:'10-15', defaultRestSec:60, defaultTempo:'2-0-1' },
    tags:['bodyweight','home'], status:true, version:1,
  },
  {
    name:'Dumbbell Fly', slug:'dumbbell-fly', group:'gogus', level:'Intermediate',
    mechanic:'Isolation', equipment:'Dumbbell', force:'Push',
    desc:'Dumbbell ile açış hareketi.',
    cues:['Dirsekleri hafif bük','Kontrollü aç-kapat'], steps:['Dumbbell’ları yukarı al','Yana aç','Üste getir'],
    videoUrl:'https://youtu.be/vari3',
    imageUrls:['https://i.imgur.com/c6p9XvJ.jpeg'],
    metrics:{ defaultSets:3, defaultReps:'10-12', defaultRestSec:75, defaultTempo:'2-1-2' },
    tags:['isolation'], status:true, version:1,
  },

  // Sırt (genel/lat)
  {
    name:'Lat Pulldown', slug:'lat-pulldown', group:'lat', secondaryGroups:['sirt'],
    level:'Beginner', mechanic:'Compound', equipment:'Machine', force:'Pull',
    desc:'Lat kaslarını hedefleyen çekiş.',
    cues:['Skapulayı çek','Karnı kilitle'], steps:['Barı kavra','Göğüse doğru çek','Kontrollü bırak'],
    videoUrl:'https://youtu.be/vari4',
    imageUrls:['https://i.imgur.com/DP1d0iR.jpeg'],
    metrics:{ defaultSets:3, defaultReps:'8-12', defaultRestSec:90, defaultTempo:'2-1-2' },
    tags:['lat','machine'], status:true, version:1,
  },
  {
    name:'Barbell Row', slug:'barbell-row', group:'ust_sirt', secondaryGroups:['lat'],
    level:'Intermediate', mechanic:'Compound', equipment:'Barbell', force:'Pull',
    desc:'Öne eğilerek bar ile çekiş.',
    cues:['Sırtı düz tut','Çekişte omuzları birleştir'], steps:['Barı kavra','Karına doğru çek','Kontrollü indir'],
    videoUrl:'https://youtu.be/vari5',
    imageUrls:['https://i.imgur.com/PY0x3mG.jpeg'],
    metrics:{ defaultSets:4, defaultReps:'6-10', defaultRestSec:120, defaultTempo:'2-0-2' },
    tags:['back','compound'], status:true, version:1,
  },

  // Omuzlar
  {
    name:'Overhead Press', slug:'overhead-press', group:'omuz', level:'Intermediate',
    mechanic:'Compound', equipment:'Barbell', force:'Push',
    desc:'Ayakta barı baş üstüne itiş.',
    cues:['Karnı sık','Barı düz yukarı'], steps:['Rakıma al','Yukarı it','Kontrollü indir'],
    videoUrl:'https://youtu.be/vari6',
    imageUrls:['https://i.imgur.com/9xEo2vI.jpeg'],
    metrics:{ defaultSets:3, defaultReps:'5-8', defaultRestSec:120, defaultTempo:'2-0-2' },
    tags:['shoulder','compound'], status:true, version:1,
  },
  {
    name:'Lateral Raise', slug:'lateral-raise', group:'omuz_orta', level:'Beginner',
    mechanic:'Isolation', equipment:'Dumbbell', force:'Pull',
    desc:'Orta omuz için yana açış.',
    cues:['Omuzdan kaldır','Salınım yapma'], steps:['Dumbbell al','Yana kaldır','Kontrollü indir'],
    videoUrl:'https://youtu.be/vari7',
    imageUrls:['https://i.imgur.com/4bGJ4yW.jpeg'],
    metrics:{ defaultSets:3, defaultReps:'12-15', defaultRestSec:60, defaultTempo:'2-1-2' },
    tags:['shoulder','isolation'], status:true, version:1,
  },
  {
    name:'Rear-delt Fly', slug:'rear-delt-fly', group:'omuz_arka', level:'Beginner',
    mechanic:'Isolation', equipment:'Dumbbell', force:'Pull',
    desc:'Arka omuz için açış.',
    cues:['Göğsü sabit tut','Kambur yapma'], steps:['Eğil','Yana aç','İndir'],
    videoUrl:'https://youtu.be/vari8',
    imageUrls:['https://i.imgur.com/0xXWZJc.jpeg'],
    metrics:{ defaultSets:3, defaultReps:'12-15', defaultRestSec:60, defaultTempo:'2-1-2' },
    tags:['rear-delt'], status:true, version:1,
  },

  // Kol
  {
    name:'Barbell Curl', slug:'barbell-curl', group:'biceps', level:'Beginner',
    mechanic:'Isolation', equipment:'Barbell', force:'Pull',
    desc:'Biceps için bar curl.',
    cues:['Dirseği sabit tut','Sallama'], steps:['Barı kavra','Yukarı çek','Kontrollü indir'],
    videoUrl:'https://youtu.be/vari9',
    imageUrls:['https://i.imgur.com/1Qp6bQ2.jpeg'],
    metrics:{ defaultSets:3, defaultReps:'8-12', defaultRestSec:60, defaultTempo:'2-0-2' },
    tags:['biceps'], status:true, version:1,
  },
  {
    name:'Triceps Pushdown', slug:'triceps-pushdown', group:'triceps', level:'Beginner',
    mechanic:'Isolation', equipment:'Cable', force:'Push',
    desc:'Triceps için itiş.',
    cues:['Dirsekleri sabitle','Omuzları düşürme'], steps:['Barı kavra','Aşağı it','Kontrollü bırak'],
    videoUrl:'https://youtu.be/vari10',
    imageUrls:['https://i.imgur.com/Y9Jbq8B.jpeg'],
    metrics:{ defaultSets:3, defaultReps:'10-12', defaultRestSec:60, defaultTempo:'2-0-2' },
    tags:['triceps'], status:true, version:1,
  },

  // Karın
  {
    name:'Plank', slug:'plank', group:'karin', level:'Beginner',
    mechanic:'Isometric', equipment:'Bodyweight', force:'Hold',
    desc:'Core için izometrik plank.',
    cues:['Kalçayı düşürme','Nefesi kontrol et'], steps:['Pozisyona gir','Süre tut','Bırak'],
    videoUrl:'https://youtu.be/vari11',
    imageUrls:['https://i.imgur.com/Y6lq3ea.jpeg'],
    metrics:{ defaultSets:3, defaultReps:'30-45sn', defaultRestSec:45, defaultTempo:null },
    tags:['core','isometric'], status:true, version:1,
  },
  {
    name:'Hanging Leg Raise', slug:'hanging-leg-raise', group:'karin', level:'Intermediate',
    mechanic:'Isolation', equipment:'Bar', force:'Pull',
    desc:'Asılı şekilde bacak kaldırma.',
    cues:['Sallanmadan','Karından çek'], steps:['Bara asıl','Bacakları kaldır','Kontrollü indir'],
    videoUrl:'https://youtu.be/vari12',
    imageUrls:['https://i.imgur.com/9YlKp8o.jpeg'],
    metrics:{ defaultSets:3, defaultReps:'8-12', defaultRestSec:60, defaultTempo:'2-1-2' },
    tags:['core'], status:true, version:1,
  },

  // Kalça & Bacak
  {
    name:'Back Squat', slug:'back-squat', group:'quad', secondaryGroups:['glute','ham'],
    level:'Intermediate', mechanic:'Compound', equipment:'Barbell', force:'Push',
    desc:'Barbell ile squat.',
    cues:['Diz-ayak hizası','Sırtı nötr tut'], steps:['Rackten al','Çök','Yukarı kalk'],
    videoUrl:'https://youtu.be/vari13',
    imageUrls:['https://i.imgur.com/CYk5Qf7.jpeg'],
    metrics:{ defaultSets:4, defaultReps:'5-8', defaultRestSec:150, defaultTempo:'3-0-1' },
    tags:['legs','compound'], status:true, version:1,
  },
  {
    name:'Romanian Deadlift', slug:'romanian-deadlift', group:'ham', secondaryGroups:['glute'],
    level:'Intermediate', mechanic:'Compound', equipment:'Barbell', force:'Pull',
    desc:'Arka zincir için RDL.',
    cues:['Kalçadan menteşe','Sırtı sabit tut'], steps:['Barı kavra','Kalçayı geriye gönder','Yukarı gel'],
    videoUrl:'https://youtu.be/vari14',
    imageUrls:['https://i.imgur.com/0f0q1m9.jpeg'],
    metrics:{ defaultSets:3, defaultReps:'6-10', defaultRestSec:120, defaultTempo:'3-1-1' },
    tags:['hamstrings','hinge'], status:true, version:1,
  },
  {
    name:'Standing Calf Raise', slug:'standing-calf-raise', group:'baldir', level:'Beginner',
    mechanic:'Isolation', equipment:'Machine', force:'Push',
    desc:'Baldır için baldır yükseltme.',
    cues:['Tüm aralığı kullan','Atlama'], steps:['Platforma çık','Topukları indir','Yüksel'],
    videoUrl:'https://youtu.be/vari15',
    imageUrls:['https://i.imgur.com/3q8bqgS.jpeg'],
    metrics:{ defaultSets:4, defaultReps:'12-15', defaultRestSec:45, defaultTempo:'2-1-2' },
    tags:['calves'], status:true, version:1,
  },
];

export default function SeedAll() {
  const [busy, setBusy] = useState(false);

  const ensureAnon = async () => {
    if (!auth.currentUser) {
      await signInAnonymously(auth); // rules: write if request.auth != null ise yeterli
    }
  };

  const seedGroups = async () => {
    try {
      setBusy(true);
      await ensureAnon();
      const batch = writeBatch(db);
      MUSCLE_GROUPS.forEach((g) => {
        const ref = doc(collection(db, 'muscle_groups'), g.slug);
        batch.set(ref, {
          ...g,
          createdAt: now(),
          updatedAt: now(),
          status: true,
        });
      });
      await batch.commit();
      Alert.alert('OK', 'Kas grupları yüklendi.');
    } catch (e) {
      Alert.alert('Hata (groups)', String(e.message || e));
    } finally {
      setBusy(false);
    }
  };

  const seedExercises = async () => {
    try {
      setBusy(true);
      await ensureAnon();
      const col = collection(db, 'exercises');
      for (const ex of EXS) {
        await addDoc(col, {
          ...ex,
          createdAt: now(),
          updatedAt: now(),
        });
      }
      Alert.alert('OK', 'Egzersizler yüklendi.');
    } catch (e) {
      Alert.alert('Hata (exercises)', String(e.message || e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding:16, gap:12 }}>
      <Text style={{ fontSize:20, fontWeight:'800', marginBottom:8 }}>Seed – Tüm Veriler</Text>

      <TouchableOpacity disabled={busy} onPress={seedGroups}
        style={{ backgroundColor:'#0ea5e9', padding:14, borderRadius:12 }}>
        <Text style={{ color:'#fff', fontWeight:'800', textAlign:'center' }}>
          1) Kas Gruplarını Yükle
        </Text>
      </TouchableOpacity>

      <TouchableOpacity disabled={busy} onPress={seedExercises}
        style={{ backgroundColor:'#10b981', padding:14, borderRadius:12 }}>
        <Text style={{ color:'#fff', fontWeight:'800', textAlign:'center' }}>
          2) Egzersizleri Yükle
        </Text>
      </TouchableOpacity>

      <View style={{ height:16 }} />
      <Text style={{ opacity:0.7 }}>
        Not: Yazma yetkisi hatası alırsan ya rules’ta geçici write izni ver,
        ya da bu sayfadaki anonim giriş satırını bırak (aktif).
      </Text>
    </ScrollView>
  );
}
