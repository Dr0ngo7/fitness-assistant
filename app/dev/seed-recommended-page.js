import { collection, doc, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { db } from '../../firebase';

const RECOMMENDED_PLANS = [
    {
        title: "5x5 Güç Programı: Temel ve Etkili",
        subtitle: "Yeni başlayanlar için güç kazanmanın en sağlam yolu.",
        image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop",
        tags: ["Güç", "Beginner", "Full Body"],
        difficulty: "Başlangıç",
        duration: "45-60 dk",
        author: "Fitness Assistant Ekibi",
        summary: "Sadece 3 ana hareketle tüm vücudu çalıştıran, klasikleşmiş güç programı. Karmaşık izole hareketler yerine temel bileşik egzersizlere odaklanın.",
        content: `
## Neden 5x5?

5x5 antrenman sistemi, güç kazanmak isteyen herkesin en az bir kez denemesi gereken efsanevi bir protokoldür. Mantığı basittir: Her hareketi 5 set ve 5 tekrar yaparsınız. Ağırlığı her antrenmanda artırarak "progressive overload" (kademeli yüklenme) prensibini en saf haliyle uygularsınız.

### Programın Temelleri
Bu programda sadece serbest ağırlıklar kullanılır. Makinelere veda edin! Vücudunuzun dengeleyici kaslarını da devreye sokarak gerçek gücü inşa edeceğiz.

### Haftalık Plan
Haftada 3 gün antrenman yapmalısınız. Örneğin: Pazartesi, Çarşamba, Cuma.

**Antrenman A:**
1. Squat (5x5)
2. Bench Press (5x5)
3. Barbell Row (5x5)

**Antrenman B:**
1. Squat (5x5)
2. Overhead Press (5x5)
3. Deadlift (1x5)

### Dikkat Edilmesi Gerekenler
*   Her antrenmana **Squat** ile başlarsınız. Bu bacaklarınızı ve merkez bölgenizi ateşler.
*   **Dinlenme:** Setler arası 2-3 dakika dinlenin. Ağır setlerde bu süre 5 dakikaya çıkabilir.
*   **Beslenme:** Bu programda çok fazla enerji harcayacaksınız. Protein ve karbonhidrat alımınızı yüksek tutun.

Güç sizinle olsun!
    `,
        likes: 1240,
        // CreatedAt will be set on upload
    },
    {
        title: "Hipertrofi Odaklı: Üst/Alt Vücut Ayrımı",
        subtitle: "Kas kütlesini artırmak isteyen orta seviye sporcular için ideal.",
        image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop",
        tags: ["Hipertrofi", "Intermediate", "Split"],
        difficulty: "Orta",
        duration: "60-75 dk",
        author: "Mehmet Yılmaz, Antrenör",
        summary: "Vücudunuzu ikiye bölün, kazanımlarınızı ikiye katlayın. Haftada 4 gün ile hem yoğunluk hem de dinlenme dengesi.",
        content: `
## Üst/Alt (Upper/Lower) Split Nedir?

Bu programda vücudu "İtme/Çekme" değil, belden yukarısı ve belden aşağısı olarak ayırıyoruz. Bu sayede her kas grubunu haftada 2 kez çalıştırarak hipertrofi (kas büyümesi) için optimum frekansı yakalıyoruz.

### Program Akışı
*   **Pazartesi:** Üst Vücut (Güç Odaklı)
*   **Salı:** Alt Vücut (Güç Odaklı)
*   **Çarşamba:** Dinlenme
*   **Perşembe:** Üst Vücut (Hipertrofi Odaklı)
*   **Cuma:** Alt Vücut (Hipertrofi Odaklı)
*   **Haftasonu:** Dinlenme

### Örnek Üst Vücut Günü
1.  **Bench Press:** 3x8-10
2.  **Barbell Row:** 3x8-10
3.  **Incline Dumbbell Press:** 3x10-12
4.  **Lat Pulldown:** 3x10-12
5.  **Lateral Raise:** 3x15
6.  **Bicep Curl & Tricep Extension:** Süper Set 3x12

### İpuçları
*   Hacim (Volume) bu programın anahtarıdır. Hareketleri yavaş ve kontrollü yapın.
*   Kaslarınızı hissedin, sadece ağırlığı kaldırmaya odaklanmayın.
    `,
        likes: 856,
    },
    {
        title: "15 Dakika HIIT: Yağ Yakıcı Kardiyo",
        subtitle: "Zamanı olmayanlar için maksimum kalori yakımı.",
        image: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?q=80&w=1450&auto=format&fit=crop",
        tags: ["Kardiyo", "Yağ Yakımı", "Evde"],
        difficulty: "Tüm Seviyeler",
        duration: "15 dk",
        author: "Zeynep Fit",
        summary: "Ekipman yok, bahane yok. Nabzınızı yükseltecek ve metabolizmanızı ateşleyecek 15 dakikalık yoğun antrenman.",
        content: `
## HIIT (Yüksek Yoğunluklu Aralıklı Antrenman)

Kısa sürede, uzun koşulardan daha fazla etki yaratmak ister misiniz? HIIT antrenmanları, egzersiz bittikten sonra bile saatlerce kalori yakmanızı sağlayan "Afterburn Effect" (EPOC) yaratır.

### Protokol: 40sn Çalış / 20sn Dinlen
Aşağıdaki 5 hareketi arka arkaya yapın. Toplam 3 tur döneceğiz.

1.  **Jumping Jacks:** Isınmak ve nabzı yükseltmek için klasik.
2.  **High Knees:** Dizleri karnına çek, olduğun yerde koş!
3.  **Burpees:** Zor ama en etkilisi. Tüm vücut çalışır.
4.  **Mountain Climbers:** Karın kasları ve dayanıklılık için.
5.  **Squat Jumps:** Bacakları patlayıcı güçle çalıştır.

### Motivasyon
*   Sadece 15 dakika! Bir dizi bölümünden daha kısa.
*   Sabah aç karnına yaparak güne enerjik başlayabilirsiniz.
*   Yanma hissini sevin, o değişim demektir.

Haydi başlayalım!
    `,
        likes: 2100,
    },
    {
        title: "Push/Pull/Legs (PPL): İleri Seviye",
        subtitle: "Haftada 6 gün antrenman yapabilenler için en popüler ayrım.",
        image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1470&auto=format&fit=crop",
        tags: ["Advanced", "PPL", "Hypertrophy"],
        difficulty: "İleri Seviye",
        duration: "60-90 dk",
        author: "Pro Trainer Can",
        summary: "Vücudu İtiş, Çekiş ve Bacak olarak üç ana fonksiyona ayırın. Maksimum frekans ve hacim için ideal.",
        content: `
## Push / Pull / Legs Nedir?

Bu sistemde kas grupları fonksiyonlarına göre çalıştırılır:
*   **Push (İtiş):** Göğüs, Omuz, Arka Kol (Triceps)
*   **Pull (Çekiş):** Sırt, Arka Omuz, Ön Kol (Biceps)
*   **Legs (Bacak):** Ön Bacak (Quads), Arka Bacak (Hamstrings), Kalça (Glutes), Kalf

### Haftalık Program
*   Pazartesi: Push
*   Salı: Pull
*   Çarşamba: Legs
*   Perşembe: Push
*   Cuma: Pull
*   Cumartesi: Legs
*   Pazar: Dinlenme

### Antrenman Detayları (Push Günü Örneği)
1.  **Barbell Bench Press:** 4x6-8
2.  **Overhead Press:** 3x8-10
3.  **Incline Dumbbell Press:** 3x10-12
4.  **Lateral Raise:** 4x15-20
5.  **Tricep Pushdown:** 3x12-15
6.  **Overhead Tricep Ext:** 3x12-15

### Kimler İçin Uygun?
Bu program yüksek iyileşme kapasitesi gerektirir. Uykunuza ve beslenmenize dikkat etmiyorsanız "overtraining" (sürantrenman) riski oluşabilir.
    `,
        likes: 3100,
    },
    {
        title: "Sabah Yogası: Güne Enerjik Başla",
        subtitle: "Uyandığında vücudunu açmak ve zihnini hazırlamak için 20 dakika.",
        image: "https://images.unsplash.com/photo-1544367563-12123d8965cd?q=80&w=1470&auto=format&fit=crop",
        tags: ["Yoga", "Mobility", "Wellness"],
        difficulty: "Herkes İçin",
        duration: "20 dk",
        author: "Yoga Eğitmeni Elif",
        summary: "Sert antrenmanlardan yorulan kasları esnetmek ve güne pozitif başlamak için akışlar.",
        content: `
## Neden Sabah Yogası?

Sabahları vücudumuz genelde sert ve tutuk olur. Hafif bir yoga akışı kan dolaşımını hızlandırır, omurgayı esnetir ve stres hormonlarını düşürür.

### Akış (Flow)
1.  **Child's Pose (Çocuk Duruşu):** 2 dakika. Nefesine odaklan.
2.  **Cat-Cow (Kedi-İnek):** 10 tekrar. Omurganı dalgalandır.
3.  **Downward Dog (Aşağı Bakan Köpek):** Bacak arkalarını esnet.
4.  **Sun Salutation A (Güneşe Selam):** 3 tur.
5.  **Warrior II (Savaşçı 2):** Güç ve denge için.
6.  **Savasana:** Son 2 dakika tam rahatlama.

### Faydaları
*   Daha iyi postür.
*   Azalan sırt ağrıları.
*   Zihinsel berraklık.

Matını ser ve kendine bu iyiliği yap!
    `,
        likes: 540,
    },
    {
        title: "Kettlebell Full Body Blast",
        subtitle: "Tek bir ekipmanla tüm vücudu çalıştır.",
        image: "https://images.unsplash.com/photo-1517963879466-e1b54ebd6694?q=80&w=1470&auto=format&fit=crop",
        tags: ["Kettlebell", "Functional", "Conditioning"],
        difficulty: "Orta",
        duration: "30 dk",
        author: "CrossFit Coach Burak",
        summary: "Kettlebell'in dinamik yapısını kullanarak hem güçlenin hem de kondisyonunuzu artırın.",
        content: `
## Kettlebell Egzersizleri

Kettlebell (Girya), ağırlık merkezi elinizden uzakta olduğu için dengeleyici kasları çok aktif çalıştırır.

### Antrenman (AMRAP 20 dk)
"As Many Rounds As Possible" - 20 dakika boyunca aşağıdaki döngüyü yapabildiğin kadar yap.

1.  **Kettlebell Swing:** 15 tekrar. Kalçadan patlayıcı güç!
2.  **Goblet Squat:** 10 tekrar. Göğsünde tut, derin çök.
3.  **Clean & Press:** Her kol için 8 tekrar.
4.  **Russian Twist:** 20 tekrar (toplam). Karın kasları için.

### İpucu
Swing yaparken beli bükmediğinden emin ol. Güç belden değil, kalça itişinden gelmeli.
    `,
        likes: 920,
    },
    {
        title: "Six-Pack Garantili Karın Antrenmanı",
        subtitle: "Sadece 10 dakikada merkez bölgeni ateşe ver.",
        image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop",
        tags: ["Abs", "Core", "No Equipment"],
        difficulty: "Orta-İleri",
        duration: "10 dk",
        author: "Fitness Assistant",
        summary: "Kısa ama çok etkili. Dinlenme sürelerini kısa tutarak karın kaslarını maksimum seviyede uyaracağız.",
        content: `
## Karın Kası Mutfakta Yapılır Ama...

Antrenmanla onları belirginleştirmek ve güçlendirmek şarttır. Güçlü bir "core" (merkez), tüm diğer hareketlerde performansınızı artırır.

### Dev Set (3 Tur Döneceksiniz)
Hareketler arası dinlenme yok! Tur bitince 1 dakika dinlen.

1.  **Crunch:** 15 tekrar. Klasik mekik.
2.  **Leg Raise:** 12 tekrar. Alt karın odaklı.
3.  **Bicycle Crunch:** 20 tekrar (toplam). Yan karınlar yanacak.
4.  **Plank:** Maksimum süre bekle! (En az 45 saniye hedefle).

### Dikkat
Boynunuzu çekmeyin, gücü karnınızdan alın. Hareketi hızlı yapmak değil, kasılarak yapmak önemlidir.
    `,
        likes: 1850,
    }
];

export default function SeedRecommendedPage() {
    const [busy, setBusy] = useState(false);
    const [log, setLog] = useState([]);

    const addToLog = (msg) => setLog(prev => [...prev, msg]);

    const runSeed = async () => {
        if (busy) return;
        setBusy(true);
        setLog([]);
        addToLog("Seeding başlatılıyor...");

        try {
            const colRef = collection(db, "recommended_plans");

            // Idsi title'dan üretelim ki tekrar tekrar eklemesin (idempotent olsun)
            const generateId = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

            for (const plan of RECOMMENDED_PLANS) {
                const id = generateId(plan.title);
                const docRef = doc(colRef, id);

                await setDoc(docRef, {
                    ...plan,
                    createdAt: serverTimestamp() // Firestore sunucu zamanı
                }, { merge: true }); // Merge true varsa günceller, yoksa oluşturur

                addToLog(`✅ Eklendi/Güncellendi: ${plan.title}`);
            }

            addToLog("🎉 Seeding tamamlandı!");
            Alert.alert("Başarılı", "Örnek programlar veritabanına eklendi.");

        } catch (error) {
            console.error(error);
            addToLog(`❌ Hata: ${error.message}`);
            Alert.alert("Hata", error.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <View style={{ flex: 1, padding: 20, backgroundColor: '#f9f9f9' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Recommended Plans Seeder</Text>

            <Pressable
                onPress={runSeed}
                style={({ pressed }) => ({
                    backgroundColor: pressed ? '#0056b3' : '#007AFF',
                    padding: 15,
                    borderRadius: 10,
                    alignItems: 'center',
                    marginBottom: 20
                })}
            >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                    {busy ? 'İşleniyor...' : 'Veritabanını Doldur (Seed)'}
                </Text>
            </Pressable>

            <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 10, borderRadius: 10 }}>
                {log.map((msg, i) => (
                    <Text key={i} style={{ marginBottom: 5, fontSize: 14, color: '#333' }}>{msg}</Text>
                ))}
            </ScrollView>
        </View>
    );
}
