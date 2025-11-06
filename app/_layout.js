// app/_layout.js
import React from "react";
import { Slot, usePathname } from "expo-router";
import { StatusBar, View, Platform } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <SafeTopWrapper>
        <Slot />
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
