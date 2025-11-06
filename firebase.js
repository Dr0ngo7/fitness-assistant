// firebase.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import {
  getReactNativePersistence,
  initializeAuth
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// 🔹 senin Firebase config'ini buraya koy (console’dan)
const firebaseConfig = {
  apiKey: "AIzaSyBUEWArOVRuwD67CLUMYYH3FS6XapmvRF4",
  authDomain: "fitness-assistant-30490.firebaseapp.com",
  projectId: "fitness-assistant-30490",
  storageBucket: "fitness-assistant-30490.firebasestorage.app",
  messagingSenderId: "954065693191",
  appId: "1:954065693191:web:bc712892c2741ad23b58a2"
};

const app = initializeApp(firebaseConfig);

// 🔹 React Native’de kalıcı oturum
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app);
