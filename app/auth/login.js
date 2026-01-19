import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { auth } from '../../firebase';
import { migrateLocalPlanToFS } from '../../lib/migrate';
import Colors from '../../constants/Colors';
import { getFriendlyErrorMessage } from '../../utils/AuthErrors';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  const onLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      await migrateLocalPlanToFS();
      router.replace('/(tabs)/musclemap');
    } catch (e) {
      const message = getFriendlyErrorMessage(e.code);
      Alert.alert('Giriş Başarısız', message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'flex-start', paddingTop: 60, paddingHorizontal: 24, backgroundColor: Colors.dark.background }}>
      <View style={{ alignItems: 'center', marginBottom: 10 }}>
        <Image
          source={require('../../assets/images/icon.png')}
          style={{ width: 260, height: 260, borderRadius: 50 }}
        />
      </View>
      <Text style={{ fontSize: 26, fontWeight: '800', marginBottom: 24, color: Colors.dark.text }}>Giriş Yap</Text>

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

      <TouchableOpacity onPress={onLogin} style={{ backgroundColor: Colors.dark.primary, padding: 14, borderRadius: 10, marginTop: 20 }}>
        <Text style={{ color: Colors.dark.background, fontWeight: '700', textAlign: 'center', fontSize: 16 }}>Giriş Yap</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/auth/register')} style={{ marginTop: 20 }}>
        <Text style={{ textAlign: 'center', color: Colors.dark.primary }}>Hesabın yok mu? Kayıt ol</Text>
      </TouchableOpacity>
    </View>
  );
}
