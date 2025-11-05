// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Auth (RN & Web uyumlu)
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBUEWArOVRuwD67CLUMYYH3FS6XapmvRF4",
  authDomain: "fitness-assistant-30490.firebaseapp.com",
  projectId: "fitness-assistant-30490",
  storageBucket: "fitness-assistant-30490.appspot.com",
  messagingSenderId: "786002060502",
  appId: "1:786002060502:web:9ec49f390d51e83d6f1e6d",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

// RN'de kalıcı oturum, Web'de fallback
let _auth;
try {
  _auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  _auth = getAuth(app);
}
export const auth = _auth;
