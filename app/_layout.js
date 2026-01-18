// app/_layout.js
import React from "react";
import { Stack, usePathname } from "expo-router";
import { StatusBar, View, Platform } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import ThemedBackground from '../components/ThemedBackground';

export default function RootLayout() {
  return (
    <SafeAreaProvider style={{ backgroundColor: '#121212' }}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <ThemedBackground>
        <SafeTopWrapper>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: 'transparent' }, // Transparent to show ThemedBackground
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/register" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="plan/[id]" />
            <Stack.Screen name="plan/recommended/[id]" />
            <Stack.Screen name="exercise/[id]" />
          </Stack>
        </SafeTopWrapper>
      </ThemedBackground>
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
        backgroundColor: "transparent",
        paddingTop,
      }}
    >
      {children}
    </View>
  );
}
