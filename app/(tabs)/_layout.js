import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '../../firebase';

export default function TabsLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return null;
  if (!user) return <Redirect href="/auth/login" />;

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#0ea5e9' }}>
      <Tabs.Screen
        name="musclemap"
        options={{
          title: 'Kas Haritası',
          tabBarIcon: ({ color, size }) => <Ionicons name="body-outline" color={color} size={size} />
        }}
      />

      <Tabs.Screen
        name="plan"
        options={{
          title: 'Planım',
          tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" color={color} size={size} />
        }}
      />
    </Tabs>
  );
}
