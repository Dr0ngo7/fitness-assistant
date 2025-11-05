import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { db } from "../../firebase";

export default function TestFirestore() {
  const [data, setData] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "muscle_groups"));
        setData(snap.docs.map(d => d.id));
      } catch (e) {
        console.log("🔥 Firestore error:", e);
      }
    })();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontWeight: "bold", fontSize: 18 }}>Test Firestore</Text>
      {data.length > 0 ? (
        data.map((id) => <Text key={id}>✅ {id}</Text>)
      ) : (
        <Text>Veri okunamadı</Text>
      )}
    </View>
  );
}
