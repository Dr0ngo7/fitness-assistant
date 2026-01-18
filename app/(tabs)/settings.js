// app/(tabs)/settings.js
import React, { useMemo, useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { useRouter } from "expo-router";
import { auth } from "../../firebase";
import {
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail,
} from "firebase/auth";
import Colors from '../../constants/Colors';

// Android'de LayoutAnimation'ı aç
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/* ========= HOISTED COMPONENTS (focus kaybını önlemek için dışarıda) ========= */
const Card = ({ children, style }) => (
  <View
    style={[
      {
        backgroundColor: Colors.dark.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: Colors.dark.border,
      },
      style,
    ]}
  >
    {children}
  </View>
);

const Chevron = ({ open, color }) => (
  <Text style={{ fontSize: 18, opacity: 0.6, color: color || Colors.dark.text }}>{open ? "▾" : "▸"}</Text>
);

const HeaderButton = ({ title, open, onPress, color }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
  >
    <Text style={{ fontSize: 18, fontWeight: "700", color: color || Colors.dark.text }}>{title}</Text>
    <Chevron open={open} color={color} />
  </TouchableOpacity>
);
/* ========================================================================= */

export default function SettingsScreen() {
  const router = useRouter();
  const user = auth.currentUser;
  const email = useMemo(() => user?.email ?? "—", [user?.email]);

  const [busy, setBusy] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);
  const [openAccount, setOpenAccount] = useState(false);

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const animate = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  const togglePassword = () => { animate(); setOpenPassword((s) => !s); };
  const toggleAccount = () => { animate(); setOpenAccount((s) => !s); };

  const handleSignOut = async () => {
    try {
      setBusy(true);
      await signOut(auth);
      Alert.alert("Çıkış yapıldı", "Giriş ekranına yönlendiriliyorsunuz.");
      router.replace("/auth/login");
    } catch (e) {
      Alert.alert("Hata", e?.message ?? "Çıkış sırasında bir sorun oluştu.");
    } finally {
      setBusy(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!user?.email) return Alert.alert("Hata", "Kullanıcı bulunamadı.");
    if (!currentPass || !newPass || !confirmPass)
      return Alert.alert("Eksik alan", "Lütfen tüm şifre alanlarını doldurun.");
    if (newPass.length < 6)
      return Alert.alert("Zayıf şifre", "Yeni şifre en az 6 karakter olmalıdır.");
    if (newPass !== confirmPass)
      return Alert.alert("Uyarı", "Yeni şifre ile tekrar aynı değil.");

    try {
      setBusy(true);
      const credential = EmailAuthProvider.credential(user.email, currentPass);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPass);
      setCurrentPass(""); setNewPass(""); setConfirmPass("");
      Alert.alert("Başarılı", "Şifreniz güncellendi.");
    } catch (e) {
      const msg =
        e?.code === "auth/wrong-password" ? "Mevcut şifre yanlış."
          : e?.code === "auth/too-many-requests" ? "Çok fazla deneme. Bir süre sonra tekrar deneyin."
            : e?.code === "auth/requires-recent-login" ? "Güvenlik için tekrar giriş yapın ve yeniden deneyin."
              : e?.message ?? "Şifre güncellenemedi.";
      Alert.alert("Hata", msg);
    } finally {
      setBusy(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!user?.email) return Alert.alert("Hata", "Kullanıcı e-postası bulunamadı.");
    try {
      setBusy(true);
      await sendPasswordResetEmail(auth, user.email);
      Alert.alert("E-posta gönderildi", "Sıfırlama bağlantısı e-postanıza gönderildi.");
    } catch (e) {
      Alert.alert("Hata", e?.message ?? "E-posta gönderilemedi.");
    } finally {
      setBusy(false);
    }
  };

  const inputBase = {
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: Colors.dark.surface,
    color: Colors.dark.text
  };

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={{ flex: 1, backgroundColor: Colors.dark.background }}>
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 12, color: Colors.dark.text }}>Ayarlar</Text>

        {/* Kullanıcı Bilgileri */}
        <Card style={{ backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border }}>
          <Text style={{ fontSize: 14, color: Colors.dark.textSecondary, marginBottom: 4 }}>E-posta</Text>
          <Text style={{ fontSize: 16, fontWeight: "600", color: Colors.dark.text }}>{email}</Text>
        </Card>

        {/* Şifre Değiştir */}
        <Card style={{ backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border }}>
          <HeaderButton title="Şifre Değiştir" open={openPassword} onPress={togglePassword} color={Colors.dark.text} />
          {openPassword && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 13, marginBottom: 6, color: Colors.dark.textSecondary }}>Mevcut Şifre</Text>
              <TextInput
                value={currentPass}
                onChangeText={setCurrentPass}
                secureTextEntry
                placeholder="Mevcut şifreniz"
                placeholderTextColor={Colors.dark.textSecondary}
                blurOnSubmit={false}
                style={inputBase}
              />

              <Text style={{ fontSize: 13, marginBottom: 6, color: Colors.dark.textSecondary }}>Yeni Şifre</Text>
              <TextInput
                value={newPass}
                onChangeText={setNewPass}
                secureTextEntry
                placeholder="Yeni şifre"
                placeholderTextColor={Colors.dark.textSecondary}
                blurOnSubmit={false}
                style={inputBase}
              />

              <Text style={{ fontSize: 13, marginBottom: 6, color: Colors.dark.textSecondary }}>Yeni Şifre (Tekrar)</Text>
              <TextInput
                value={confirmPass}
                onChangeText={setConfirmPass}
                secureTextEntry
                placeholder="Yeni şifre tekrar"
                placeholderTextColor={Colors.dark.textSecondary}
                blurOnSubmit={false}
                style={[inputBase, { marginBottom: 16 }]}
              />

              <TouchableOpacity
                onPress={handlePasswordUpdate}
                disabled={busy}
                style={{
                  backgroundColor: Colors.dark.primary,
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: "center",
                  marginBottom: 10,
                  opacity: busy ? 0.7 : 1,
                }}
              >
                {busy ? <ActivityIndicator color={Colors.dark.background} /> : <Text style={{ color: Colors.dark.background, fontWeight: "700" }}>Şifreyi Güncelle</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSendResetEmail}
                disabled={busy}
                style={{
                  backgroundColor: Colors.dark.surface,
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: Colors.dark.border
                }}
              >
                <Text style={{ fontWeight: "700", color: Colors.dark.text }}>E-posta ile Sıfırlama Bağlantısı Gönder</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>


        <Card style={{ backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border }}>
          <HeaderButton title="Hesap" open={openAccount} onPress={toggleAccount} color={Colors.dark.text} />
          {openAccount && (
            <View style={{ marginTop: 12 }}>
              <TouchableOpacity
                onPress={handleSignOut}
                disabled={busy}
                style={{
                  backgroundColor: Colors.dark.error,
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: "center",
                  opacity: busy ? 0.7 : 1,
                }}
              >
                {busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "white", fontWeight: "700" }}>Çıkış Yap</Text>}
              </TouchableOpacity>

              <Text style={{ fontSize: 12, color: Colors.dark.textSecondary, textAlign: "center", marginTop: 8 }}>
                Güvenlik notu: Bazı işlemler için sistem sizden yakın zamanda tekrar giriş yapmanızı isteyebilir.
              </Text>
            </View>
          )}
        </Card>

        {/* Geliştirici Araçları */}
        <Card style={{ backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border }}>
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12, color: Colors.dark.text }}>Geliştirici Araçları</Text>
          <TouchableOpacity
            onPress={() => router.push("/dev/seed-exercises")}
            style={{
              backgroundColor: "#6366f1",
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "white", fontWeight: "700" }}>Egzersiz Seed Ekranı</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/dev/seed-recommended-page")}
            style={{
              backgroundColor: "#8b5cf6",
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "700" }}>Önerilen Programları Seed Et</Text>
          </TouchableOpacity>
        </Card>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
