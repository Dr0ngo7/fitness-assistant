import { signOut } from 'firebase/auth';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../../firebase';

export default function SettingsScreen() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert('Çıkış yapıldı', 'Tekrar görüşürüz!');
    } catch (e) {
      Alert.alert('Hata', e.message || 'Çıkış başarısız');
    }
  };

  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center', gap:12 }}>
      <Text style={{ fontSize:20, fontWeight:'700', marginBottom:8 }}>Ayarlar</Text>
      <TouchableOpacity onPress={handleLogout}
        style={{ backgroundColor:'#ef4444', paddingVertical:12, paddingHorizontal:24, borderRadius:10 }}>
        <Text style={{ color:'#fff', fontWeight:'800' }}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
}
