// lib/migrate.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addPlanItemFS } from './programs';

export async function migrateLocalPlanToFS() {
  try {
    const raw = await AsyncStorage.getItem('@plan');
    const arr = raw ? JSON.parse(raw) : [];
    if (!arr.length) return { moved: 0 };
    let moved = 0;
    for (const item of arr) {
      // minimal alanlar yeterli
      await addPlanItemFS({
        exerciseId: String(item.exerciseId ?? item.id ?? ''),
        exerciseName: item.exerciseName || item.name || 'Egzersiz',
        group: item.group || 'genel',
        level: item.level || 'beginner',
        targetSets: item.targetSets ?? 3,
        targetReps: item.targetReps ?? '10-12',
        restSec: item.restSec ?? 60,
        tempo: item.tempo ?? null,
        thumb: item.thumb || null,
        source: 'migrated',
      });
      moved++;
    }
    // taşıma bitti → local’i temizle
    await AsyncStorage.removeItem('@plan');
    return { moved };
  } catch (e) {
    return { moved: 0, error: String(e.message || e) };
  }
}
