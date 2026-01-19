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
  Modal,
  StyleSheet,
  Switch,
  Image
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
import { Ionicons } from '@expo/vector-icons';


/* ================= COMPONENTLER ================= */

const Section = ({ title, children }) => (
  <View style={styles.sectionContainer}>
    {title && <Text style={styles.sectionHeader}>{title}</Text>}
    <View style={styles.sectionBody}>
      {children}
    </View>
  </View>
);

const SettingItem = ({ icon, title, value, onPress, isDestructive, rightComponent }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={!onPress && !rightComponent} // Disable visibility feedback if not clickable/interactive
    style={styles.itemContainer}
    activeOpacity={0.7}
  >
    <View style={styles.itemLeft}>
      <View style={[styles.iconBox, isDestructive && styles.destructiveIconBox]}>
        <Ionicons name={icon} size={20} color={isDestructive ? '#FF453A' : Colors.dark.text} />
      </View>
      <Text style={[styles.itemTitle, isDestructive && styles.destructiveText]}>{title}</Text>
    </View>

    <View style={styles.itemRight}>
      {value && <Text style={styles.itemValue}>{value}</Text>}
      {rightComponent}
      {!rightComponent && onPress && (
        <Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} style={{ marginLeft: 8 }} />
      )}
    </View>
  </TouchableOpacity>
);

/* ================= ANA EKRAN ================= */

export default function SettingsScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  // States
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Notification toggle mock
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Password Input States
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const handleSignOut = async () => {
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Çıkış Yap",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await signOut(auth);
              router.replace("/auth/login");
            } catch (e) {
              Alert.alert("Hata", e.message);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleChangePassword = async () => {
    if (!currentPass || !newPass || !confirmPass) {
      return Alert.alert("Eksik", "Lütfen tüm alanları doldurun.");
    }
    if (newPass.length < 6) return Alert.alert("Hata", "Yeni şifre en az 6 karakter olmalı.");
    if (newPass !== confirmPass) return Alert.alert("Hata", "Şifreler uyuşmuyor.");

    try {
      setLoading(true);
      const cred = EmailAuthProvider.credential(user.email, currentPass);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPass);

      Alert.alert("Başarılı", "Şifreniz güncellendi.");
      setModalVisible(false); // Close modal
      setCurrentPass(""); setNewPass(""); setConfirmPass("");
    } catch (e) {
      if (e.code === 'auth/wrong-password') Alert.alert("Hata", "Mevcut şifreniz yanlış.");
      else Alert.alert("Hata", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: Colors.dark.background }}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Header - Profile */}
        <Text style={styles.headerTitle}>Ayarlar</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{user?.email?.charAt(0).toUpperCase() || "U"}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Kullanıcı</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          <View style={{ alignItems: 'center', marginVertical: 20 }}>
            <Text style={{ color: Colors.dark.textSecondary, fontSize: 12 }}>GymPro v1.0.0</Text>
          </View>
        </View>

        {/* Section 1: Hesap */}
        <Section title="HESAP">
          <SettingItem
            icon="key-outline"
            title="Şifre Değiştir"
            onPress={() => setModalVisible(true)}
          />
          <SettingItem
            icon="notifications-outline"
            title="Bildirimler"
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#767577', true: Colors.dark.primary }}
                thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
              />
            }
          />
        </Section>

        {/* Section 2: Uygulama */}
        <Section title="UYGULAMA">
          <SettingItem icon="language-outline" title="Dil" value="Türkçe (TR)" />
          <SettingItem icon="moon-outline" title="Tema" value="Koyu Mod" />
          <SettingItem icon="information-circle-outline" title="Hakkında" value="v1.0.0" />
          <SettingItem
            icon="document-text-outline"
            title="Gizlilik Politikası"
            onPress={() => Alert.alert("Bilgi", "Web sitesine yönlendirileceksiniz.")}
          />
        </Section>

        {/* Section 3: Geliştirici (Geçici) */}
        <Section title="GELİŞTİRİCİ ARAÇLARI">
          <SettingItem
            icon="code-slash-outline"
            title="Egzersiz Seed"
            onPress={() => router.push("/dev/seed-exercises")}
          />
          <SettingItem
            icon="flask-outline"
            title="Program Seed"
            onPress={() => router.push("/dev/seed-recommended-page")}
          />
        </Section>

        {/* Section 4: Çıkış */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color="#FF453A" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>Fitness Assistant v1.0.0 (Build 124)</Text>
        </View>

      </ScrollView>

      {/* MODAL: Şifre Değiştirme */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Şifre Değiştir</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Mevcut Şifre</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={currentPass}
                onChangeText={setCurrentPass}
                placeholder="********"
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Yeni Şifre</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={newPass}
                onChangeText={setNewPass}
                placeholder="********"
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Yeni Şifre (Tekrar)</Text>
              <TextInput
                style={[styles.input, { marginBottom: 20 }]}
                secureTextEntry
                value={confirmPass}
                onChangeText={setConfirmPass}
                placeholder="********"
                placeholderTextColor="#666"
              />

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleChangePassword}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.saveButtonText}>Güncelle</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Global
  scrollContent: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 100 },
  headerTitle: { fontSize: 34, fontWeight: '800', color: Colors.dark.text, marginBottom: 20 },

  // Profile Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: '#333',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 15,
    borderWidth: 2, borderColor: Colors.dark.primary
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: Colors.dark.primary },
  profileInfo: { justifyContent: 'center' },
  profileName: { fontSize: 20, fontWeight: '700', color: Colors.dark.text },
  profileEmail: { fontSize: 14, color: Colors.dark.textSecondary, marginTop: 2 },

  // Sections
  sectionContainer: { marginBottom: 25 },
  sectionHeader: {
    fontSize: 12, fontWeight: '600',
    color: Colors.dark.textSecondary,
    marginBottom: 10, marginLeft: 10,
    letterSpacing: 1
  },
  sectionBody: {
    backgroundColor: '#1c1c1e', // Slightly lighter than black
    borderRadius: 16,
    overflow: 'hidden',
  },

  // Settings Item
  itemContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#2c2c2e' // Separator
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#2c2c2e',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12
  },
  destructiveIconBox: { backgroundColor: 'rgba(255, 69, 58, 0.15)' },
  itemTitle: { fontSize: 16, color: Colors.dark.text, fontWeight: '500' },
  destructiveText: { color: '#FF453A' },
  itemRight: { flexDirection: 'row', alignItems: 'center' },
  itemValue: { fontSize: 15, color: Colors.dark.textSecondary, marginRight: 8 },

  // Logout Area
  logoutContainer: { marginTop: 10, alignItems: 'center' },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    paddingVertical: 12, paddingHorizontal: 30,
    borderRadius: 20,
    marginBottom: 20
  },
  logoutText: { color: '#FF453A', fontSize: 16, fontWeight: '700' },
  versionText: { color: '#666', fontSize: 12 },

  // Modal Layout
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end', // Bottom sheet style or center
  },
  modalContent: {
    backgroundColor: '#1c1c1e',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 50,
    minHeight: '50%'
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: Colors.dark.text },
  closeButton: { padding: 5, backgroundColor: '#333', borderRadius: 15 },

  modalBody: {},
  inputLabel: { color: Colors.dark.textSecondary, marginBottom: 8, marginTop: 10, fontSize: 14, fontWeight: '600' },
  input: {
    backgroundColor: '#2c2c2e',
    borderRadius: 12,
    color: '#fff',
    padding: 14,
    fontSize: 16,
    borderWidth: 1, borderColor: '#3a3a3c'
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: Colors.dark.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  saveButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' }
});
