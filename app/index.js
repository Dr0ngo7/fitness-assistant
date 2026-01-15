// app/index.js
import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function Index() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setReady(true);
    });
    return unsub;
  }, []);

  if (!ready) return null; // istersen buraya loader koyarız

  return user ? (
    <Redirect href="/(tabs)/musclemap" />
  ) : (
    <Redirect href="/auth/login" />
  );
}
