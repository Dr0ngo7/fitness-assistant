// app/_layout.js
import { Stack, useRouter, useSegments } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { auth } from '../firebase';

export default function RootLayout() {
  const [user, setUser] = useState(undefined); // undefined: kontrol
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u ?? null));
    return unsub;
  }, []);

  useEffect(() => {
    if (user === undefined) return;
    const inAuth = segments[0] === 'auth';
    if (!user && !inAuth) router.replace('/auth/login');
    if (user && inAuth) router.replace('/(tabs)/musclemap');
  }, [user, segments]);

  if (user === undefined) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator />
      </View>
    );
  }
  return <Stack screenOptions={{ headerShown:false }} />;
}
