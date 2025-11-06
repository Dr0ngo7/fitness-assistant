// firebase.js (Cross-Platform Persistence)
import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  initializeAuth,
  setPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

// AsyncStorage sadece native'de gerekli:
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBUEWArOVRuwD67CLUMYYH3FS6XapmvRF4",
  authDomain: "fitness-assistant-30490.firebaseapp.com",
  projectId: "fitness-assistant-30490",
  storageBucket: "fitness-assistant-30490.firebasestorage.app",
  messagingSenderId: "954065693191",
  appId: "1:954065693191:web:bc712892c2741ad23b58a2"
};

const app = initializeApp(firebaseConfig);

let auth;
if (Platform.OS === 'web') {
  // Web: browserLocalPersistence
  auth = getAuth(app);
  // setPersistence async'tir; beklemeye gerek yok, arka planda ayarlanır.
  setPersistence(auth, browserLocalPersistence).catch(() => {});
} else {
  // Native: RN persistence
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);
