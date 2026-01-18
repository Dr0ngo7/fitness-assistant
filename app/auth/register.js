import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebase';
import { migrateLocalPlanToFS } from '../../lib/migrate';
import Colors from '../../constants/Colors';

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
      await migrateLocalPlanToFS();
      router.replace('/(tabs)/musclemap');
    } catch (e) {
      Alert.alert('Kayıt hatası', e.message || 'Hata');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: Colors.dark.background }}>
      <Text style={{ fontSize: 26, fontWeight: '800', marginBottom: 24, color: Colors.dark.text }}>Kayıt Ol</Text>

      <TextInput
        placeholder="E-posta"
        placeholderTextColor={Colors.dark.textSecondary}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, borderColor: Colors.dark.border, backgroundColor: Colors.dark.surface, color: Colors.dark.text, borderRadius: 10, padding: 12, marginBottom: 12 }}
      />
      <TextInput
        placeholder="Şifre"
        placeholderTextColor={Colors.dark.textSecondary}
        secureTextEntry
        value={pass}
        onChangeText={setPass}
        style={{ borderWidth: 1, borderColor: Colors.dark.border, backgroundColor: Colors.dark.surface, color: Colors.dark.text, borderRadius: 10, padding: 12 }}
      />

      <TouchableOpacity onPress={onRegister} style={{ backgroundColor: Colors.dark.primary, padding: 14, borderRadius: 10, marginTop: 20 }}>
        <Text style={{ color: Colors.dark.background, fontWeight: '700', textAlign: 'center', fontSize: 16 }}>Kayıt Ol</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
        <Text style={{ textAlign: 'center', color: Colors.dark.primary }}>Zaten hesabım var</Text>
      </TouchableOpacity>
    </View>
  );
}
