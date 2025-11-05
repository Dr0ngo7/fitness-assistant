// firebase.js
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// 🔑 Firebase web config (Firebase Console'dan kopyala)
const firebaseConfig = {
  apiKey: "AIzaSyBUEWArOVRuwD67CLUMYYH3FS6XapmvRF4",
  authDomain: "fitness-assistant-30490.firebaseapp.com",
  projectId: "fitness-assistant-30490",
  storageBucket: "fitness-assistant-30490.firebasestorage.app",
  messagingSenderId: "954065693191",
  appId: "1:954065693191:web:bc712892c2741ad23b58a2"
};

// Eğer zaten initializeApp çağrıldıysa yeniden oluşturma hatasını engelle
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Modülleri dışa aktar
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
