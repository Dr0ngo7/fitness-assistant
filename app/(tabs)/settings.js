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

// Android'de LayoutAnimation'ı aç
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/* ========= HOISTED COMPONENTS (focus kaybını önlemek için dışarıda) ========= */
const Card = ({ children, style }) => (
  <View
    style={[
      {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: "#e5e7eb",
      },
      style,
    ]}
  >
    {children}
  </View>
);

const Chevron = ({ open }) => (
  <Text style={{ fontSize: 18, opacity: 0.6 }}>{open ? "▾" : "▸"}</Text>
);

const HeaderButton = ({ title, open, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
  >
    <Text style={{ fontSize: 18, fontWeight: "700" }}>{title}</Text>
    <Chevron open={open} />
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
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  };

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 12 }}>Ayarlar</Text>

        {/* Kullanıcı Bilgileri */}
        <Card>
          <Text style={{ fontSize: 14, opacity: 0.6, marginBottom: 4 }}>E-posta</Text>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>{email}</Text>

        </Card>


        {/* Şifre Değiştir */}
        <Card>
          <HeaderButton title="Şifre Değiştir" open={openPassword} onPress={togglePassword} />
          {openPassword && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 13, marginBottom: 6 }}>Mevcut Şifre</Text>
              <TextInput
                value={currentPass}
                onChangeText={setCurrentPass}
                secureTextEntry
                placeholder="Mevcut şifreniz"
                blurOnSubmit={false}
                style={inputBase}
              />

              <Text style={{ fontSize: 13, marginBottom: 6 }}>Yeni Şifre</Text>
              <TextInput
                value={newPass}
                onChangeText={setNewPass}
                secureTextEntry
                placeholder="Yeni şifre"
                blurOnSubmit={false}
                style={inputBase}
              />

              <Text style={{ fontSize: 13, marginBottom: 6 }}>Yeni Şifre (Tekrar)</Text>
              <TextInput
                value={confirmPass}
                onChangeText={setConfirmPass}
                secureTextEntry
                placeholder="Yeni şifre tekrar"
                blurOnSubmit={false}
                style={[inputBase, { marginBottom: 16 }]}
              />

              <TouchableOpacity
                onPress={handlePasswordUpdate}
                disabled={busy}
                style={{
                  backgroundColor: "#0ea5e9",
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: "center",
                  marginBottom: 10,
                  opacity: busy ? 0.7 : 1,
                }}
              >
                {busy ? <ActivityIndicator /> : <Text style={{ color: "white", fontWeight: "700" }}>Şifreyi Güncelle</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSendResetEmail}
                disabled={busy}
                style={{
                  backgroundColor: "#f3f4f6",
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "700" }}>E-posta ile Sıfırlama Bağlantısı Gönder</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>


        <Card>
          <HeaderButton title="Hesap" open={openAccount} onPress={toggleAccount} />
          {openAccount && (
            <View style={{ marginTop: 12 }}>
              <TouchableOpacity
                onPress={handleSignOut}
                disabled={busy}
                style={{
                  backgroundColor: "#ef4444",
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: "center",
                  opacity: busy ? 0.7 : 1,
                }}
              >
                {busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "white", fontWeight: "700" }}>Çıkış Yap</Text>}
              </TouchableOpacity>

              <Text style={{ fontSize: 12, opacity: 0.6, textAlign: "center", marginTop: 8 }}>
                Güvenlik notu: Bazı işlemler için sistem sizden yakın zamanda tekrar giriş yapmanızı isteyebilir.
              </Text>
            </View>
          )}
        </Card>

        {/* Geliştirici Araçları */}
        <Card>
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>Geliştirici Araçları</Text>
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
