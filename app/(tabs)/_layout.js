import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown:false, tabBarActiveTintColor:'#0ea5e9' }}>
      <Tabs.Screen name="musclemap" options={{ title:'Kas Haritası', tabBarIcon:({color,size})=> <Ionicons name="body-outline" color={color} size={size}/> }} />
      <Tabs.Screen name="diet"      options={{ title:'Diyet',       tabBarIcon:({color,size})=> <Ionicons name="nutrition-outline" color={color} size={size}/> }} />
      <Tabs.Screen name="settings"  options={{ title:'Ayarlar',      tabBarIcon:({color,size})=> <Ionicons name="settings-outline" color={color} size={size}/> }} />
      <Tabs.Screen name="plan"      options={{ title:'Planım', tabBarIcon:({color,size}) => <Ionicons name="list-outline" color={color} size={size} /> }}
/>

    </Tabs>
  );
}
