import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text } from 'react-native';
import { db } from '../../firebase';

const EXERCISES = [
  // GÖĞÜS (CHEST)
  {
    name: 'Barbell Bench Press', name_en: 'Barbell Bench Press', slug: 'bench-press',
    group: 'chest', secondaryGroups: ['triceps', 'shoulders'],
    level: 'Orta Seviye', mechanic: 'Bileşik', equipment: 'Barbell', force: 'Push',
    desc: 'Göğüs kaslarını geliştirmek için temel egzersiz. Düz bir sehpada barı göğsünüze indirip kaldırın.',
    cues: ['Ayaklarınızı yere sağlam basın', 'Barı göğüs ucuna doğru indirin', 'Dirseklerinizi vücudunuza çok yaklaştırmayın'],
    steps: ['Sehpaya uzanın', 'Barı omuz genişliğinden biraz geniş tutun', 'Barı kontrollüce indirin', 'Nefes vererek yukarı itin'],
    img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    videoUrl: 'https://musclewiki.com/exercises/male/chest/barbell-bench-press',
    metrics: { defaultSets: 4, defaultReps: '8-10', defaultRestSec: 90 },
    status: true
  },
  {
    name: 'Incline Dumbbell Press', name_en: 'Incline Dumbbell Press', slug: 'incline-dumbbell-press',
    group: 'chest', secondaryGroups: ['triceps', 'shoulders'],
    level: 'Başlangıç', mechanic: 'Bileşik', equipment: 'Dumbbell', force: 'Push',
    desc: 'Üst göğüs kaslarını hedefler. Eğimli sehpada dambılları yukarı doğru itin.',
    cues: ['Sehpayı 30-45 derece eğime ayarlayın', 'Dambılları omuz hizasında tutun', 'Tepe noktada göğsü sıkın'],
    steps: ['Eğimli sehpaya oturun', 'Dambılları dizlerinizin yardımıyla omuz hizasına alın', 'Yukarı doğru itin', 'Kontrollüce indirin'],
    img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
    videoUrl: 'https://musclewiki.com/exercises/male/chest/incline-dumbbell-press-',
    metrics: { defaultSets: 3, defaultReps: '10-12', defaultRestSec: 60 },
    status: true
  },
  {
    name: 'Push Up', name_en: 'Push Up', slug: 'push-up',
    group: 'chest', secondaryGroups: ['triceps', 'abs'],
    level: 'Başlangıç', mechanic: 'Bileşik', equipment: 'Bodyweight', force: 'Push',
    desc: 'Vücut ağırlığı ile yapılan klasik göğüs egzersizi.',
    cues: ['Vücut dümdüz olmalı', 'Kalçayı düşürmeyin', 'Göğüs yere değmeli'],
    steps: ['Eller omuz genişliğinde yerde pozisyon alın', 'Dirsekleri kırarak alçalın', 'Yeri iterek yükselin'],
    img: 'https://images.unsplash.com/photo-1598971639058-211a74a96ded?w=800&q=80',
    videoUrl: 'https://musclewiki.com/exercises/male/chest/push-up',
    metrics: { defaultSets: 3, defaultReps: '15-20', defaultRestSec: 45 },
    status: true
  },

  // SIRT (BACK)
  {
    name: 'Pull Up', name_en: 'Pull Up', slug: 'pull-up',
    group: 'back', secondaryGroups: ['biceps'],
    level: 'Orta Seviye', mechanic: 'Bileşik', equipment: 'Bodyweight', force: 'Pull',
    desc: 'Sırt genişliğini artıran en etkili vücut ağırlığı egzersizi.',
    cues: ['Çenenizi barın üzerine çıkarın', 'Hareketi kollarla değil sırtla başlatın', 'Sallanmamaya çalışın'],
    steps: ['Barı omuz genişliğinden geniş tutun', 'Kendinizi yukarı çekin', 'Yavaşça aşağı inin'],
    img: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&q=80',
    videoUrl: 'https://musclewiki.com/exercises/male/lats/pullmas-pronated-grip',
    metrics: { defaultSets: 3, defaultReps: '8-12', defaultRestSec: 90 },
    status: true
  },
  {
    name: 'Bent Over Row', name_en: 'Barbell Bent Over Row', slug: 'bent-over-row',
    group: 'back', secondaryGroups: ['biceps', 'lower_back'],
    level: 'Orta Seviye', mechanic: 'Bileşik', equipment: 'Barbell', force: 'Pull',
    desc: 'Sırt kalınlığı için temel egzersiz.',
    cues: ['Sırt düz olmalı', 'Barı karın boşluğuna çekin', 'Beli bükmeyin'],
    steps: ['Dizleri hafif kırıp öne eğilin', 'Barı tutun ve karna doğru çekin', 'Kontrollüce salın'],
    img: 'https://images.unsplash.com/photo-1603287681836-e174ce71865e?w=800&q=80',
    videoUrl: 'https://musclewiki.com/exercises/male/lats/bent-over-row',
    metrics: { defaultSets: 4, defaultReps: '8-12', defaultRestSec: 90 },
    status: true
  },

  // BACAK (LEGS)
  {
    name: 'Squat', name_en: 'Barbell Squat', slug: 'squat',
    group: 'legs', secondaryGroups: ['glutes', 'lower_back'],
    level: 'İleri Seviye', mechanic: 'Bileşik', equipment: 'Barbell', force: 'Push',
    desc: 'Bacak ve kalça gelişimi için en önemli hareket.',
    cues: ['Dizler içe dönmemeli', 'Topuklar yerden kalkmamalı', 'Sırt dik olmalı'],
    steps: ['Barı sırtınıza alın', 'Kalçayı geriye vererek çömelin', 'Paralel seviyeye inip kalkın'],
    img: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80',
    videoUrl: 'https://musclewiki.com/exercises/male/quads/squat',
    metrics: { defaultSets: 4, defaultReps: '6-8', defaultRestSec: 120 },
    status: true
  },
  {
    name: 'Leg Press', name_en: 'Leg Press', slug: 'leg-press',
    group: 'legs', secondaryGroups: ['glutes'],
    level: 'Başlangıç', mechanic: 'Bileşik', equipment: 'Machine', force: 'Push',
    desc: 'Makinede yapılan güvenli bir bacak egzersizi.',
    cues: ['Dizleri kilitlemeyin', 'Bel boşluğu oluşmamalı'],
    steps: ['Makineye oturun', 'Ayakları platforma yerleştirin', 'İtin ve yavaşça indirin'],
    img: 'https://plus.unsplash.com/premium_photo-1661266393522-8356976cefc2?w=800&q=80',
    videoUrl: 'https://musclewiki.com/exercises/male/quads/leg-press',
    metrics: { defaultSets: 3, defaultReps: '12-15', defaultRestSec: 60 },
    status: true
  },

  // OMUZ (SHOULDERS)
  {
    name: 'Overhead Press', name_en: 'Overhead Press', slug: 'overhead-press',
    group: 'shoulders', secondaryGroups: ['triceps'],
    level: 'Orta Seviye', mechanic: 'Bileşik', equipment: 'Barbell', force: 'Push',
    desc: 'Omuz kütlesi için en etkili press hareketi.',
    cues: ['Belden kuvvet almayın', 'Barı başınızın üzerine dümdüz itin'],
    steps: ['Barı göğüs hizasında tutun', 'Yukarı doğru itin', 'Başınızı barın altından geçirin'],
    img: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&q=80',
    videoUrl: 'https://musclewiki.com/exercises/male/shoulders/overhead-press',
    metrics: { defaultSets: 4, defaultReps: '8-10', defaultRestSec: 90 },
    status: true
  },
  {
    name: 'Lateral Raise', name_en: 'Dumbbell Lateral Raise', slug: 'lateral-raise',
    group: 'shoulders', secondaryGroups: [],
    level: 'Başlangıç', mechanic: 'İzole', equipment: 'Dumbbell', force: 'Push',
    desc: 'Omuz genişliği sağlayan yan omuz egzersizi.',
    cues: ['Kolları tam yanlara açın', 'Dirsekleri hafif bükülü tutun'],
    steps: ['Dambılları yanlarda tutun', 'Kolları yere paralel olana kadar kaldırın', 'Yavaşça indirin'],
    img: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&q=80',
    videoUrl: 'https://musclewiki.com/exercises/male/shoulders/dumbbell-lateral-raise',
    metrics: { defaultSets: 3, defaultReps: '12-15', defaultRestSec: 45 },
    status: true
  },

  // KOL (ARMS)
  {
    name: 'Barbell Curl', name_en: 'Barbell Curl', slug: 'barbell-curl',
    group: 'arms', secondaryGroups: ['forearms'],
    level: 'Başlangıç', mechanic: 'İzole', equipment: 'Barbell', force: 'Pull',
    desc: 'Biceps gelişimi için temel hareket.',
    cues: ['Dirsekleri sabitleyin', 'Sadece ön kollar hareket etmeli'],
    steps: ['Barı omuz genişliğinde tutun', 'Kaldırın ve tepe noktada sıkın', 'Yavaşça indirin'],
    img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
    videoUrl: 'https://musclewiki.com/exercises/male/biceps/barbell-curl',
    metrics: { defaultSets: 3, defaultReps: '10-12', defaultRestSec: 60 },
    status: true
  },
  {
    name: 'Triceps Pushdown', name_en: 'Cable Triceps Pushdown', slug: 'triceps-pushdown',
    group: 'arms', secondaryGroups: [],
    level: 'Başlangıç', mechanic: 'İzole', equipment: 'Cable', force: 'Push',
    desc: 'Arka kol (triceps) için izole egzersiz.',
    cues: ['Dirsekler vücuda yapışık olmalı', 'Sadece dirsekler bükülmeli'],
    steps: ['Kablo barını tutun', 'Aşağı doğru itin', 'Kontrollüce bırakın'],
    img: 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=800&q=80',
    videoUrl: 'https://musclewiki.com/exercises/male/triceps/push-down',
    metrics: { defaultSets: 3, defaultReps: '12-15', defaultRestSec: 60 },
    status: true
  }
];

const normalizeLevel = (lvl) => {
  const s = String(lvl || '').trim().toLowerCase();
  if (s === 'beginner' || s === 'yeni' || s === 'başlangıç' || s.startsWith('beg')) return 'Başlangıç';
  if (s === 'intermediate' || s === 'orta' || s === 'orta seviye' || s.startsWith('int')) return 'Orta Seviye';
  if (s === 'advanced' || s === 'ileri' || s === 'ileri seviye' || s.startsWith('adv')) return 'İleri Seviye';
  return 'Başlangıç'; // Varsayılan
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
