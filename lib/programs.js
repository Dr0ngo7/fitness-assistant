// lib/programs.js
import {
  addDoc, collection, doc, getDoc, getDocs,
  orderBy, query, serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const planCol = (uid) => collection(db, 'users', uid, 'plan_items');

export async function addPlanItemFS(item) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('login required');
  await addDoc(planCol(uid), {
    ...item,
    createdAt: serverTimestamp(),
  });
}

export async function fetchPlanWithExercisesFS() {
  const uid = auth.currentUser?.uid;
  if (!uid) return { items: [] };

  const q = query(planCol(uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  const items = [];
  for (const d of snap.docs) {
    const data = d.data();
    let exercise = null;
    if (data.exerciseId) {
      const exSnap = await getDoc(doc(db, 'exercises', String(data.exerciseId)));
      if (exSnap.exists()) exercise = { id: exSnap.id, ...exSnap.data() };
    }
    items.push({ id: d.id, ...data, exercise });
  }
  return { items };
}
