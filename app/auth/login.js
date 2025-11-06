import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../../firebase';
import { migrateLocalPlanToFS } from '../../lib/migrate';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  const onLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      await migrateLocalPlanToFS();
        router.replace('/(tabs)/musclemap');

      router.replace('/(tabs)/musclemap');
    } catch (e) {
      Alert.alert('Giriş başarısız', e.message || 'Hata');
    }
  };

  return (
    <View style={{ flex:1, justifyContent:'center', padding:24 }}>
      <Text style={{ fontSize:26, fontWeight:'800', marginBottom:24 }}>Giriş Yap</Text>

      <TextInput
        placeholder="E-posta"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth:1, borderColor:'#ccc', borderRadius:10, padding:12, marginBottom:12 }}
      />
      <TextInput
        placeholder="Şifre"
        secureTextEntry
        value={pass}
        onChangeText={setPass}
        style={{ borderWidth:1, borderColor:'#ccc', borderRadius:10, padding:12 }}
      />

      <TouchableOpacity onPress={onLogin} style={{ backgroundColor:'#0ea5e9', padding:14, borderRadius:10, marginTop:20 }}>
        <Text style={{ color:'#fff', fontWeight:'700', textAlign:'center' }}>Giriş Yap</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/auth/register')} style={{ marginTop:20 }}>
        <Text style={{ textAlign:'center', color:'#0ea5e9' }}>Hesabın yok mu? Kayıt ol</Text>
      </TouchableOpacity>
    </View>
  );
}
