import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center', gap:12 }}>
      <TouchableOpacity onPress={() => router.push('/auth/login')}
        style={{ backgroundColor:'#0ea5e9', padding:12, borderRadius:10 }}>
        <Text style={{ color:'#fff', fontWeight:'800' }}>Giriş Yap</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/auth/register')}
        style={{ backgroundColor:'#10b981', padding:12, borderRadius:10 }}>
        <Text style={{ color:'#fff', fontWeight:'800' }}>Kayıt Ol</Text>
      </TouchableOpacity>
    </View>
  );
}
