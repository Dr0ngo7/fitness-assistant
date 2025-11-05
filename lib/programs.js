import {
    addDoc,
    collection,
    doc, getDoc, getDocs,
    query,
    serverTimestamp,
    where
} from 'firebase/firestore';
import { auth, db } from '../firebase';

// Aktif program yoksa oluşturur, varsa id'sini döner
export async function ensureActiveProgram(uid) {
  const q = query(collection(db, 'users', uid, 'programs'), where('active','==', true));
  const snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].id;

  const ref = await addDoc(collection(db, 'users', uid, 'programs'), {
    title: 'Benim Programım',
    source: { type: 'custom' },
    active: true,
    weeks: null,
    daysPerWeek: null,
    status: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

// Detay ekrandan çağır: egzersizi programa ekler
export async function addExerciseToProgram(exerciseId, opts = {}) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Giriş gerekli');
  const programId = await ensureActiveProgram(uid);
  await addDoc(collection(db, 'users', uid, 'programs', programId, 'items'), {
    dayIndex: opts.dayIndex ?? 1,
    order: opts.order ?? Date.now(),
    exerciseId,
    targetSets: opts.targetSets ?? 3,
    targetReps: opts.targetReps ?? '10-12',
    restSec: opts.restSec ?? 60,
    tempo: opts.tempo ?? null,
    notes: opts.notes ?? null,
  });
}

// Planım ekranı: aktif program + item’ları + egzersiz detayları
export async function fetchActiveProgramWithExercises() {
  const uid = auth.currentUser?.uid;
  if (!uid) return null;

  const progs = await getDocs(collection(db, 'users', uid, 'programs'));
  const active = progs.docs.find(d => d.data().active);
  if (!active) return null;

  const itemsSnap = await getDocs(collection(db, 'users', uid, 'programs', active.id, 'items'));
  const items = itemsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  // exercise doc'larını çek (<=10 adet için 'in' query; daha fazlaysa döngü)
  const results = [];
  for (const it of items) {
    const ex = await getDoc(doc(db, 'exercises', it.exerciseId));
    results.push({ ...it, exercise: ex.exists() ? { id: ex.id, ...ex.data() } : null });
  }

  return { program: { id: active.id, ...active.data() }, items: results };
}
