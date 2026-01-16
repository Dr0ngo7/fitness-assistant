import { collection, query, where, getDocs, limit, orderBy, startAt, endAt } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Searches for an exercise. 
 * If exact match found -> returns { match: ... }
 * If candidates found -> returns { candidates: [...] }
 * If nothing -> returns null
 */
export const findExerciseByName = async (exerciseName) => {
    if (!exerciseName) return null;

    try {
        const col = collection(db, 'exercises');

        const simple = exerciseName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanName = exerciseName.trim();

        // 1. Exact slug/en-name/tr-name match attempt (Fastest)
        const exactChecks = [
            query(col, where('slug', '==', exerciseName.toLowerCase().replace(/\s+/g, '-')), limit(1)),
            query(col, where('name_en', '==', cleanName), limit(1)),
            query(col, where('name', '==', cleanName), limit(1))
        ];

        for (const q of exactChecks) {
            const snap = await getDocs(q);
            if (!snap.empty) return { match: getBasicData(snap.docs[0]) };
        }

        // 2. No exact match? Function as a "Smart Searcher"
        // Use the first meaningful word to find candidates
        const firstWord = cleanName.split(' ')[0].replace(/[^a-zA-Z]/g, '');
        if (firstWord.length < 3) return null; // Too short to search safely

        const candidates = await searchCandidates(firstWord);

        // Sort logic: put ones that contain the full search term higher?
        // For now, just return what we found.
        if (candidates.length > 0) {
            return { candidates };
        }

        return null;

    } catch (error) {
        console.error("Exercise lookup error:", error);
        return null;
    }
};

const searchCandidates = async (term) => {
    try {
        const col = collection(db, 'exercises');
        // Simple "Starts With" query on slug or name_en could work
        // Firestore "Starts With" pattern: where('name', '>=', term), where('name', '<=', term + '\uf8ff')
        // We'll search by Slug as it's normalized.
        const termSlug = term.toLowerCase();

        const q = query(
            col,
            where('slug', '>=', termSlug),
            where('slug', '<=', termSlug + '\uf8ff'),
            limit(10)
        );

        const snap = await getDocs(q);
        return snap.docs.map(getBasicData);

    } catch (error) {
        console.error("Candidate search error:", error);
        return [];
    }
};

const getBasicData = (doc) => {
    const d = doc.data();
    return {
        id: doc.id,
        group: d.group || 'other',
        name: d.name || d.name_en, // Show display name
        thumb: d.imageUrls?.[0] || null
    };
};
