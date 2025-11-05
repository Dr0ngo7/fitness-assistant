import { useRouter } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function Login() {
  const router = useRouter();
  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center', gap:12 }}>
      <Text style={{ fontSize:22, fontWeight:'700' }}>Login Sayfası</Text>
      <Button title="Kas Haritasına Git" onPress={() => router.replace('/(tabs)/musclemap')} />
    </View>
  );
}
