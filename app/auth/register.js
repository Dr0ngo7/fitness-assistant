import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebase';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  const onRegister = async () => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      await setDoc(doc(db, 'users', cred.user.uid), {
        email: email.trim(),
        createdAt: Date.now()
      });
      Alert.alert('Başarılı', 'Kayıt tamamlandı');
      router.replace('/(tabs)/musclemap');
    } catch (e) {
      Alert.alert('Kayıt hatası', e.message || 'Hata');
    }
  };

  return (
    <View style={{ flex:1, justifyContent:'center', padding:24 }}>
      <Text style={{ fontSize:26, fontWeight:'800', marginBottom:24 }}>Kayıt Ol</Text>

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

      <TouchableOpacity onPress={onRegister} style={{ backgroundColor:'#10b981', padding:14, borderRadius:10, marginTop:20 }}>
        <Text style={{ color:'#fff', fontWeight:'700', textAlign:'center' }}>Kayıt Ol</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={{ marginTop:20 }}>
        <Text style={{ textAlign:'center', color:'#0ea5e9' }}>Zaten hesabım var</Text>
      </TouchableOpacity>
    </View>
  );
}
