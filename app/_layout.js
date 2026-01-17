// app/_layout.js
import React from "react";
import { Stack, usePathname } from "expo-router";
import { StatusBar, View, Platform } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <SafeTopWrapper>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          {/* Other screens will default to headerShown: false due to screenOptions */}
        </Stack>
      </SafeTopWrapper>
    </SafeAreaProvider>
  );
}

function SafeTopWrapper({ children }) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  // sadece musclemap ekranında üst boşluk olmasın
  const exclude =
    pathname?.includes("/musclemap") || pathname === "/musclemap";

  // sade, sabit bir buffer
  const paddingTop = exclude ? 0 : 8;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#f8fafc",
        paddingTop,
      }}
    >
      {children}
    </View>
  );
}
