import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { db } from '../../firebase';

// Helper to generate correct image URL from English name
// Source: https://github.com/yuhonas/free-exercise-db
// Format: https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Name_Of_Exercise/0.jpg
// Spaces are replaced by underscores. Case sensitive (mostly PascalCase).
const getImgUrl = (nameEn) => {
    if (!nameEn) return '';
    // Ensure it matches folder structure: "Barbell Bench Press" -> "Barbell_Bench_Press"
    // Some might differ, but this covers 90% of standard names.
    const formatted = nameEn.trim().split(' ').join('_');
    return `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${formatted}/0.jpg`;
};

// FULL LIST (MERGED PARTS 1, 2, 3)
const FULL_EXERCISES = [
    // --- CHEST ---
    {
        name: 'Barbell Bench Press', name_en: 'Barbell Bench Press', slug: 'bench-press',
        group: 'chest', secondaryGroups: ['triceps', 'shoulders'],
        level: 'Orta Seviye', mechanic: 'Bileşik', equipment: 'Barbell', force: 'Push',
        desc: 'Göğüs kaslarını geliştirmek için temel egzersiz.',
        cues: ['Ayakları yere sabitle', 'Barı göğüs ucuna indir'],
        steps: ['Sehpaya uzanın', 'Barı indirin', 'Yukarı itin'],
        status: true
    },
    {
        name: 'Incline Barbell Bench Press', name_en: 'Incline Barbell Bench Press', slug: 'incline-bench-press',
        group: 'chest', secondaryGroups: ['shoulders', 'triceps'],
        level: 'Orta Seviye', mechanic: 'Bileşik', equipment: 'Barbell', force: 'Push',
        desc: 'Üst göğüs kaslarını hedefleyen press varyasyonu.',
        cues: ['30-45 derece eğim', 'Barı üst göğse indirin'],
        steps: ['Eğimli sehpaya yatın', 'Barı yukarı itin', 'Kontrollü indirin'],
        status: true
    },
    {
        name: 'Decline Barbell Bench Press', name_en: 'Decline Barbell Bench Press', slug: 'decline-bench-press',
        group: 'chest', secondaryGroups: ['triceps', 'lats'],
        level: 'Orta Seviye', mechanic: 'Bileşik', equipment: 'Barbell', force: 'Push',
        desc: 'Alt göğüs kaslarını vurgulayan press hareketi.',
        cues: ['Bacakları sabitleyin', 'Barı alt göğse indirin'],
        steps: ['Aşağı eğimli sehpaya yatın', 'Barı kaldırın ve indirin'],
        status: true
    },
    {
        name: 'Dumbbell Bench Press', name_en: 'Dumbbell Bench Press', slug: 'dumbbell-bench-press',
        group: 'chest', secondaryGroups: ['triceps', 'shoulders'],
        level: 'Başlangıç', mechanic: 'Bileşik', equipment: 'Dumbbell', force: 'Push',
        desc: 'Dambıl ile yapılan, dengeleyici kasları daha çok çalıştıran press.',
        cues: ['Dambılları birbirine değdirmeyin', 'Tam hareket aralığı kullanın'],
        steps: ['Düz sehpaya uzanın', 'Dambılları yukarı itin', 'Göğüs hizasına kadar indirin'],
        status: true
    },
    {
        name: 'Incline Dumbbell Press', name_en: 'Incline Dumbbell Press', slug: 'incline-dumbbell-press',
        group: 'chest', secondaryGroups: ['shoulders', 'triceps'],
        level: 'Orta Seviye', mechanic: 'Bileşik', equipment: 'Dumbbell', force: 'Push',
        desc: 'Üst göğüs için dambıl ile yapılan temel hareket.',
        cues: ['Dirsekleri kitlemeyin', 'Üst noktada sıkın'],
        steps: ['Eğimli sehpada dambılları omuz hizasına alın', 'Yukarı itin'],
        status: true
    },
    {
        name: 'Decline Dumbbell Press', name_en: 'Decline Dumbbell Press', slug: 'decline-dumbbell-press',
        group: 'chest', secondaryGroups: ['triceps'],
        level: 'Orta Seviye', mechanic: 'Bileşik', equipment: 'Dumbbell', force: 'Push',
        desc: 'Alt göğüs için dambıl press varyasyonu.',
        cues: ['Baş aşağı pozisyonda dikkatli olun', 'Kontrollü indirin'],
        steps: ['Decline sehpaya uzanın', 'Dambılları göğüs hizasında tutun ve itin'],
        status: true
    },
    {
        name: 'Dumbbell Fly', name_en: 'Dumbbell Fly', slug: 'dumbbell-fly',
        group: 'chest', secondaryGroups: ['shoulders'],
        level: 'Orta Seviye', mechanic: 'İzole', equipment: 'Dumbbell', force: 'Push',
        desc: 'Göğüs kaslarını esneterek büyütmeye odaklanan izole hareket.',
        cues: ['Kolları hafif bükük tutun', 'Bir ağaca sarılıyor gibi hareket edin'],
        steps: ['Sehpaya uzanın', 'Dambılları yana doğru açın', 'Göğsü sıkarak birleştirin'],
        status: true
    },
    {
        name: 'Incline Dumbbell Fly', name_en: 'Incline Dumbbell Fly', slug: 'incline-dumbbell-fly',
        group: 'chest', secondaryGroups: ['shoulders'],
        level: 'Orta Seviye', mechanic: 'İzole', equipment: 'Dumbbell', force: 'Push',
        desc: 'Üst göğüs liflerini hedefleyen açış hareketi.',
        cues: ['Göğsü yukarıda tutun', 'Yavaşça açın'],
        steps: ['Eğimli sehpada kolları yana açın', 'Yukarıda birleştirin'],
        status: true
    },
    {
        name: 'Cable Crossover', name_en: 'Cable Crossover', slug: 'cable-crossover',
        group: 'chest', secondaryGroups: ['shoulders'],
        level: 'Orta Seviye', mechanic: 'İzole', equipment: 'Cable', force: 'Push',
        desc: 'Kablo istasyonunda yapılan, sürekli gerilim sağlayan göğüs egzersizi.',
        cues: ['Öne hafif eğilin', 'Elleri göbek hizasında birleştirin'],
        steps: ['İki makara arasında durun', 'Kabloları çekip birleştirin', 'Yavaşça geri salın'],
        status: true
    },
    {
        name: 'Push Up', name_en: 'Push Up', slug: 'push-up',
        group: 'chest', secondaryGroups: ['triceps', 'abs'],
        level: 'Başlangıç', mechanic: 'Bileşik', equipment: 'Bodyweight', force: 'Push',
        desc: 'Her yerde yapılabilen temel vücut ağırlığı egzersizi.',
        cues: ['Vücut düz bir çizgi olsun', 'Tam inip tam kalkın'],
        steps: ['Yere yüzüstü uzanın', 'Eller omuz hizasında', 'Yeri itin'],
        status: true
    },
    {
        name: 'Dips', name_en: 'Dips', slug: 'chest-dips',
        group: 'chest', secondaryGroups: ['triceps', 'shoulders'],
        level: 'İleri Seviye', mechanic: 'Bileşik', equipment: 'Bodyweight', force: 'Push',
        desc: 'Alt göğüs için çok etkili vücut ağırlığı egzersizi.',
        cues: ['Gövdeyi öne eğin', 'Dirsekleri dışa doğru açın'],
        steps: ['Paralel barlara tutunun', 'Öne eğilerek inin', 'Kendinizi yukarı itin'],
        status: true
    },
    {
        name: 'Machine Chest Press', name_en: 'Lever Chest Press', slug: 'machine-chest-press', // changed name_en for db match
        group: 'chest', secondaryGroups: ['triceps'],
        level: 'Başlangıç', mechanic: 'Bileşik', equipment: 'Machine', force: 'Push',
        desc: 'Makine yardımıyla güvenli şekilde yapılan göğüs press.',
        cues: ['Sırtı pedden ayırmayın', 'Kontrollü itin'],
        steps: ['Makineye oturun', 'Kolları kavrayın', 'İleri doğru itin'],
        status: true
    },
    {
        name: 'Pec Deck Fly', name_en: 'Lever Pec Deck Fly', slug: 'pec-deck',
        group: 'chest', secondaryGroups: ['shoulders'],
        level: 'Başlangıç', mechanic: 'İzole', equipment: 'Machine', force: 'Push',
        desc: 'Göğüs kaslarını izole etmek için ideal makine egzersizi.',
        cues: ['Dirsekler omuz hizasında', 'En içte iyice sıkın'],
        steps: ['Makineye oturun', 'Kolları yanlara yerleştirin', 'Önde birleştirin'],
        status: true
    },
    {
        name: 'Dumbbell Pullover', name_en: 'Dumbbell Pullover', slug: 'dumbbell-pullover',
        group: 'chest', secondaryGroups: ['lats', 'triceps'],
        level: 'Orta Seviye', mechanic: 'Bileşik', equipment: 'Dumbbell', force: 'Push',
        desc: 'Göğüs kafesini genişleten ve serratus kaslarını da çalıştıran hareket.',
        cues: ['Kalçayı düşük tutun', 'Dirsekleri çok bükmeyin'],
        steps: ['Sırt üstü uzanın', 'Dambılı baş arkasına indirin', 'Göğüs hizasına çekin'],
        status: true
    },
    {
        name: 'Smith Machine Bench Press', name_en: 'Smith Machine Bench Press', slug: 'smith-bench-press',
        group: 'chest', secondaryGroups: ['triceps', 'shoulders'],
        level: 'Başlangıç', mechanic: 'Bileşik', equipment: 'Machine', force: 'Push',
        desc: 'Smith makinesinde yapılan stabil bench press.',
        cues: ['Barı göğüs hizasına ayarlayın', 'Kilitleri açıp indirin'],
        steps: ['Sehpaya uzanın', 'Barı indirin ve kaldırın'],
        status: true
    },

    // --- BACK ---
    {
        name: 'Pull Up', name_en: 'Pull-up', slug: 'pull-up', // hyphenated in dataset
        group: 'back', secondaryGroups: ['biceps'],
        level: 'Orta Seviye', mechanic: 'Bileşik', equipment: 'Bodyweight', force: 'Pull',
        desc: 'Üst vücut genişliği için en iyi hareket.',
        cues: ['Çenenizi barın üstüne çıkarın', 'Sallanmayın'],
        steps: ['Barı geniş tutun', 'Kendinizi yukarı çekin', 'Yavaşça inin'],
        status: true
    },
    {
        name: 'Chin Up', name_en: 'Chin-up', slug: 'chin-up', // hyphenated
        group: 'back', secondaryGroups: ['biceps'],
        level: 'Orta Seviye', mechanic: 'Bileşik', equipment: 'Bodyweight', force: 'Pull',
        desc: 'Avuç içleri size bakacak şekilde yapılan, biceps odaklı barfiks.',
        cues: ['Kolları tam uzatın', 'Göğsü bara çekin'],
        steps: ['Barı dar ve ters tutun', 'Yukarı çekilin', 'İnin'],
        status: true
    },
    {
        name: 'Lat Pulldown', name_en: 'Cable Pulldown', slug: 'lat-pulldown', // Cable Pulldown is the generic name there
        group: 'back', secondaryGroups: ['biceps'],
        level: 'Başlangıç', mechanic: 'Bileşik', equipment: 'Machine', force: 'Pull',
        desc: 'Barfiks çekemeyenler için en iyi alternatif.',
        cues: ['Barı göğsünüze çekin', 'Geriye aşırı yatmayın'],
        steps: ['Makineye oturun', 'Barı geniş tutun', 'Aşağı çekin'],
        status: true
    },
    {
        name: 'Bent Over Barbell Row', name_en: 'Barbell Bent Over Row', slug: 'bent-over-row',
        group: 'back', secondaryGroups: ['biceps', 'lower_back'],
        level: 'Orta Seviye', mechanic: 'Bileşik', equipment: 'Barbell', force: 'Pull',
        desc: 'Sırt kalınlığı ve kuvveti için temel row egzersizi.',
        cues: ['Sırtı düz tutun', 'Barı mide boşluğuna çekin'],
        steps: ['Öne eğilin', 'Barı tutun', 'Karnınıza çekin'],
        status: true
    },
    {
        name: 'Pendlay Row', name_en: 'Barbell Pendlay Row', slug: 'pendlay-row',
        group: 'back', secondaryGroups: ['lower_back', 'hamstrings'],
        level: 'İleri Seviye', mechanic: 'Bileşik', equipment: 'Barbell', force: 'Pull',
        desc: 'Her tekrarda barın yere bırakıldığı patlayıcı row hareketi.',
        cues: ['Belinizi sabit kilitleyin', 'Yerden patlayıcı şekilde çekin'],
        steps: ['Bar yerdeyken pozisyon alın', 'Hızla karna çekin', 'Yere bırakın'],
        status: true
    },
    {
        name: 'Seated Cable Row', name_en: 'Cable Seated Row', slug: 'seated-cable-row',
        group: 'back', secondaryGroups: ['biceps'],
        level: 'Başlangıç', mechanic: 'Bileşik', equipment: 'Cable', force: 'Pull',
        desc: 'Oturarak yapılan, orta sırtı hedefleyen makine çekişi.',
        cues: ['Omuzları öne salmayın', 'Göğsü dışarı çıkarın'],
        steps: ['Ayakları koyun', 'Kolu çekin', 'Kontrollü uzatın'],
        status: true
    },
    {
        name: 'One Arm Dumbbell Row', name_en: 'Dumbbell One Arm Row', slug: 'dumbbell-row',
        group: 'back', secondaryGroups: ['biceps'],
        level: 'Başlangıç', mechanic: 'Bileşik', equipment: 'Dumbbell', force: 'Pull',
        desc: 'Tek kolla yapılan ve kanat kaslarını çok iyi izole eden hareket.',
        cues: ['Gövdeyi döndürmeyin', 'Dambılı kalçaya doğru çekin'],
        steps: ['Bir elinizi sehpaya dayayın', 'Diğer elle dambılı çekin'],
        status: true
    },
    {
        name: 'T-Bar Row', name_en: 'Lever T-bar Row', slug: 't-bar-row',
        group: 'back', secondaryGroups: ['biceps', 'lower_back'],
        level: 'Orta Seviye', mechanic: 'Bileşik', equipment: 'Machine', force: 'Pull',
        desc: 'Sırtın hem ortasını hem dışını vuran güçlü bir egzersiz.',
        cues: ['Sırt açısını koruyun', 'Ağırlığı göğse çekin'],
        steps: ['T-Bar makinesine geçin', 'Tutun ve çekin'],
        status: true
    },
    {
        name: 'Face Pull', name_en: 'Cable Face Pull', slug: 'face-pull',
        group: 'back', secondaryGroups: ['shoulders'],
        level: 'Başlangıç', mechanic: 'İzole', equipment: 'Cable', force: 'Pull',
        desc: 'Arka omuz ve üst sırt duruşu için kritik egzersiz.',
        cues: ['Dirsekleri yukarıda tutun', 'Halatı alna çekin'],
        steps: ['Halatı üst makaraya takın', 'Yüzünüze doğru çekin'],
        status: true
    },
    {
        name: 'Deadlift', name_en: 'Barbell Deadlift', slug: 'deadlift',
        group: 'back', secondaryGroups: ['legs', 'glutes', 'core'],
        level: 'İleri Seviye', mechanic: 'Bileşik', equipment: 'Barbell', force: 'Pull',
        desc: 'Tüm posterior chain (arka zincir) kaslarını çalıştıran en büyük hareket.',
        cues: ['Bel düz', 'Bar bacaklara değerek kalkmalı'],
        steps: ['Barın ortasına geçin', 'Eğilip tutun', 'Yeri iterek kalkın'],
        status: true
    },
    {
        name: 'Rack Pull', name_en: 'Barbell Rack Pull', slug: 'rack-pull',
        group: 'back', secondaryGroups: ['traps', 'lower_back'],
        level: 'Orta Seviye', mechanic: 'Bileşik', equipment: 'Barbell', force: 'Pull',
        desc: 'Deadliftin üst kısmına odaklanan, sırt kalınlığı sağlayan hareket.',
        cues: ['Barı diz hizasından başlatın', 'Omuzları geriye çekin'],
        steps: ['Güç kafesinde pinleri ayarlayın', 'Ağırlığı buradan kaldırın'],
        status: true
    },
    {
        name: 'Straight Arm Pulldown', name_en: 'Cable Straight Arm Pulldown', slug: 'straight-arm-pulldown',
        group: 'back', secondaryGroups: ['triceps'],
        level: 'Başlangıç', mechanic: 'İzole', equipment: 'Cable', force: 'Pull',
        desc: 'Kanat kaslarını izole eden, biceps devre dışı bırakan hareket.',
        cues: ['Kolları bükmeyin', 'Kalçaya kadar indirin'],
        steps: ['Kabloyu yukarı takın', 'Kolları düz tutarak aşağı bastırın'],
        status: true
    },
    {
        name: 'Shrug', name_en: 'Dumbbell Shrug', slug: 'dumbbell-shrug',
        group: 'back', secondaryGroups: ['traps'],
        level: 'Başlangıç', mechanic: 'İzole', equipment: 'Dumbbell', force: 'Pull',
        desc: 'Trap (trapez) kaslarını geliştirmek için omuz silkme hareketi.',
        cues: ['Kolları bükmeyin', 'Omuzları kulaklara çekin'],
        steps: ['Dambılları yanlarda tutun', 'Omuzları yukarı kaldırın', 'İndirin'],
        status: true
    },
    {
        name: 'Back Extension', name_en: 'Hyperextension', slug: 'back-extension',
        group: 'back', secondaryGroups: ['glutes', 'hamstrings'],
        level: 'Başlangıç', mechanic: 'İzole', equipment: 'Machine', force: 'Pull',
        desc: 'Alt bel kaslarını güçlendiren egzersiz.',
        cues: ['Belinizi aşırı bükmeyin', 'Kontrollü inip kalkın'],
        steps: ['Sehpaya yerleşin', 'Öne eğilin', 'Vücut düz olana kadar kalkın'],
        status: true
    },

    // --- LEGS ---
    {
        name: 'Barbell Squat', name_en: 'Barbell Squat', slug: 'squat',
        group: 'legs', secondaryGroups: ['glutes', 'lower_back', 'core'],
        level: 'İleri Seviye', mechanic: 'Bileşik', equipment: 'Barbell', force: 'Push',
        desc: 'Tüm alt vücudu çalıştıran en temel egzersiz.',
        cues: ['Topuklar yerde kalsın', 'Dizler içe göçmesin', 'Gövde dik dursun'],
        steps: ['Barı trapez üstüne yerleştirin', 'Derin nefes alıp çömelin', 'Paraleli kırınca kalkın'],
        status: true
    },
    {
        name: 'Front Squat', name_en: 'Barbell Front Squat', slug: 'front-squat',
        group: 'legs', secondaryGroups: ['quads', 'core'],
        level: 'İleri Seviye', mechanic: 'Bileşik', equipment: 'Barbell', force: 'Push',
        desc: 'Ön bacaklara (quadriceps) daha çok odaklanan squat varyasyonu.',
        cues: ['Dirsekleri yüksek tutun', 'Gövdeyi dik tutmaya zorlayın'],
        steps: ['Barı ön omuz başlarına alın', 'Çömelin ve kalkın'],
        status: true
    },
    {
        name: 'Leg Press', name_en: 'Sled 45 Degree Leg Press', slug: 'leg-press', // Specific
        group: 'legs', secondaryGroups: ['glutes'],
        level: 'Başlangıç', mechanic: 'Bileşik', equipment: 'Machine', force: 'Push',
        desc: 'Ağır kilolarla bacak çalışmak için güvenli makine egzersizi.',
        cues: ['Dizleri kilitlemeyin', 'Kalça kalkmasın'],
        steps: ['Sırtı dayayın', 'Platformu itin', 'Kontrollü indirin'],
        status: true
    },
    {
        name: 'Walking Lunge', name_en: 'Dumbbell Walking Lunge', slug: 'walking-lunge',
        group: 'legs', secondaryGroups: ['glutes', 'hamstrings'],
        level: 'Orta Seviye', mechanic: 'Bileşik', equipment: 'Dumbbell', force: 'Push',
        desc: 'Dinamik bir bacak egzersizi, dengeyi ve kas dayanıklılığını artırır.',
        cues: ['Gövdeyi dik tutun', 'Adımlar uzun olsun'],
        steps: ['Dambılları alın', 'İleri adım atıp çökün', 'Diğer ayağı ileri atın'],
        status: true
    },
    {
        name: 'Romanian Deadlift', name_en: 'Barbell Romanian Deadlift', slug: 'romanian-deadlift',
        group: 'legs', secondaryGroups: ['hamstrings', 'glutes', 'lower_back'],
        level: 'Orta Seviye', mechanic: 'Bileşik', equipment: 'Barbell', force: 'Pull',
        desc: 'Arka bacak (hamstring) esnekliği ve gücü için temel hareket.',
        cues: ['Dizleri hafif bükük sabitleyin', 'Kalçayı geriye itin'],
        steps: ['Barı ayakta tutun', 'Kalçayı iterek öne eğilin', 'Hamstring gerilince kalkın'],
        status: true
    },
    {
        name: 'Lying Leg Curl', name_en: 'Lever Lying Leg Curl', slug: 'lying-leg-curl',
        group: 'legs', secondaryGroups: ['hamstrings'],
        level: 'Başlangıç', mechanic: 'İzole', equipment: 'Machine', force: 'Pull',
        desc: 'Arka bacak kaslarını izole eden en popüler makine.',
        cues: ['Kalçayı sehpadan kaldırmayın', 'Tam bükün'],
        steps: ['Yüzüstü yatın', 'Pedleri bileklere getirin', 'Bacakları kalçaya çekin'],
        status: true
    },
    {
        name: 'Leg Extension', name_en: 'Lever Leg Extension', slug: 'leg-extension',
        group: 'legs', secondaryGroups: ['quads'],
        level: 'Başlangıç', mechanic: 'İzole', equipment: 'Machine', force: 'Push',
        desc: 'Ön bacak kaslarını (quadriceps) detaylandıran izole hareket.',
        cues: ['Tepe noktada quadricepsleri sıkın', 'Hızlı bırakmayın'],
        steps: ['Makineye oturun', 'Bacakları yukarı kaldırıp kitleyin'],
        status: true
    },
    {
        name: 'Calf Raise (Standing)', name_en: 'Lever Standing Calf Raise', slug: 'standing-calf-raise',
        group: 'legs', secondaryGroups: ['calves'],
        level: 'Başlangıç', mechanic: 'İzole', equipment: 'Machine', force: 'Push',
        desc: 'Baldır kaslarını büyütmek için temel egzersiz.',
        cues: ['Topukları iyice düşürün', 'Parmak ucunda en tepeye çıkın'],
        steps: ['Omuzlukların altına girin', 'Parmak uçlarında yükselin'],
        status: true
    },
    {
        name: 'Goblet Squat', name_en: 'Dumbbell Goblet Squat', slug: 'goblet-squat',
        group: 'legs', secondaryGroups: ['quads', 'glutes'],
        level: 'Başlangıç', mechanic: 'Bileşik', equipment: 'Dumbbell', force: 'Push',
        desc: 'Yeni başlayanlar için squatı öğrenmenin en iyi yolu.',
        cues: ['Dambılı göğsünüze yapıştırın', 'Dirsekler dizlerin içine girsin'],
        steps: ['Dambılı kadeh gibi tutun', 'Çömelin ve kalkın'],
        status: true
    },
    {
        name: 'Sumo Deadlift', name_en: 'Barbell Sumo Deadlift', slug: 'sumo-deadlift',
        group: 'legs', secondaryGroups: ['glutes', 'adductors', 'back'],
        level: 'İleri Seviye', mechanic: 'Bileşik', equipment: 'Barbell', force: 'Pull',
        desc: 'İç bacak ve kalçayı daha çok devreye sokan geniş duruşlu deadlift.',
        cues: ['Ayakları geniş açın', 'Eller bacakların içinde olsun'],
        steps: ['Geniş duruş alın', 'Barı tutun', 'Kalça ve bacakla kalkın'],
        status: true
    },

    // --- SHOULDERS ---
    {
        name: 'Overhead Press', name_en: 'Barbell Standing Military Press', slug: 'overhead-press',
        group: 'shoulders', secondaryGroups: ['triceps', 'core'],
        level: 'Orta Seviye', mechanic: 'Bileşik', equipment: 'Barbell', force: 'Push',
        desc: 'Omuz ve üst vücut kuvveti için temel press.',
        cues: ['Kalçayı sıkın', 'Barı düz bir çizgide itin'],
        steps: ['Barı göğüse alın', 'Başın üstüne itin', 'Kontrollü indirin'],
        status: true
    },
    {
        name: 'Seated Dumbbell Press', name_en: 'Dumbbell Seated Shoulder Press', slug: 'seated-dumbbell-press',
        group: 'shoulders', secondaryGroups: ['triceps'],
        level: 'Başlangıç', mechanic: 'Bileşik', equipment: 'Dumbbell', force: 'Push',
        desc: 'Oturarak yapılan, omuzları izole eden press.',
        cues: ['Bel boşluğunu koruyun', 'Dambılları tepede çarptırmayın'],
        steps: ['Sehpaya oturun', 'Dambılları kulak hizasından yukarı itin'],
        status: true
    },
    {
        name: 'Arnold Press', name_en: 'Dumbbell Arnold Press', slug: 'arnold-press',
        group: 'shoulders', secondaryGroups: ['triceps'],
        level: 'Orta Seviye', mechanic: 'Bileşik', equipment: 'Dumbbell', force: 'Push',
        desc: 'Ön ve yan omuzları aynı anda çalıştıran rotasyonlu press.',
        cues: ['Avuç içleri başta size baksın', 'Yukarı iterken çevirin'],
        steps: ['Dambılları göğüs önünde tutun', 'Çevirerek yukarı itin'],
        status: true
    },
    {
        name: 'Lateral Raise', name_en: 'Dumbbell Lateral Raise', slug: 'lateral-raise',
        group: 'shoulders', secondaryGroups: [],
        level: 'Başlangıç', mechanic: 'İzole', equipment: 'Dumbbell', force: 'Push',
        desc: 'Omuzlara genişlik veren yan açış hareketi.',
        cues: ['Serçe parmak yukarı baksın', 'Sallanmayın'],
        steps: ['Ayakta dambılları tutun', 'Yanlara doğru açın', 'Yavaşça indirin'],
        status: true
    },
    {
        name: 'Front Raise', name_en: 'Dumbbell Front Raise', slug: 'front-raise',
        group: 'shoulders', secondaryGroups: [],
        level: 'Başlangıç', mechanic: 'İzole', equipment: 'Dumbbell', force: 'Push',
        desc: 'Ön omuz başlarını hedefleyen egzersiz.',
        cues: ['Kolları kilitlemeyin', 'Omuz hizasına kadar kaldırın'],
        steps: ['Dambılları önde tutun', 'Öne doğru kaldırın'],
        status: true
    },
    {
        name: 'Face Pull', name_en: 'Cable Face Pull', slug: 'face-pull',
        group: 'shoulders', secondaryGroups: ['rear_delt', 'rotator_cuff'],
        level: 'Başlangıç', mechanic: 'İzole', equipment: 'Cable', force: 'Pull',
        desc: 'Omuz sağlığı ve arka omuz için vazgeçilmez egzersiz.',
        cues: ['Dirsekleri yukarı çekin', 'Elleri kulaklara götürün'],
        steps: ['Halatı alna doğru çekin', 'Geri salın'],
        status: true
    },
    {
        name: 'Upright Row', name_en: 'Barbell Upright Row', slug: 'upright-row',
        group: 'shoulders', secondaryGroups: ['traps'],
        level: 'Orta Seviye', mechanic: 'Bileşik', equipment: 'Barbell', force: 'Pull',
        desc: 'Yan omuz ve trapezleri çalıştıran çekiş.',
        cues: ['Dirsekleri omuzlardan yukarı çıkarın', 'Barı vücuda yakın tutun'],
        steps: ['Barı dar/orta tutun', 'Çeneye doğru çekin', 'İndirin'],
        status: true
    },
    {
        name: 'Machine Shoulder Press', name_en: 'Lever Shoulder Press', slug: 'machine-shoulder-press',
        group: 'shoulders', secondaryGroups: ['triceps'],
        level: 'Başlangıç', mechanic: 'Bileşik', equipment: 'Machine', force: 'Push',
        desc: 'Yeni başlayanlar için güvenli omuz press.',
        cues: ['Sırtı dayayın', 'Tam yukarı itin'],
        steps: ['Makineye oturun', 'Kolları yukarı itin'],
        status: true
    },
    {
        name: 'Reverse Pec Deck', name_en: 'Lever Pec Deck Rear Delt Fly', slug: 'reverse-pec-deck',
        group: 'shoulders', secondaryGroups: ['rear_delt'],
        level: 'Başlangıç', mechanic: 'İzole', equipment: 'Machine', force: 'Pull',
        desc: 'Arka omuz için makinede yapılan izole hareket.',
        cues: ['Dirsekleri hafif bükük tutun', 'Geriye kadar açın'],
        steps: ['Makineye ters oturun', 'Kolları geriye itin'],
        status: true
    },

    // --- ARMS ---
    {
        name: 'Barbell Curl', name_en: 'Barbell Curl', slug: 'barbell-curl',
        group: 'arms', secondaryGroups: ['forearms'],
        level: 'Başlangıç', mechanic: 'İzole', equipment: 'Barbell', force: 'Pull',
        desc: 'Biceps gelişimi için en temel ve etkili egzersiz.',
        cues: ['Dirsekleri vücuda yapıştırın', 'Sallanmayın'],
        steps: ['Barı omuz genişliğinde tutun', 'Göğse doğru kaldırın', 'Yavaşça indirin'],
        status: true
    },
    {
        name: 'Dumbbell Curl', name_en: 'Dumbbell Curl', slug: 'dumbbell-curl',
        group: 'arms', secondaryGroups: ['forearms'],
        level: 'Başlangıç', mechanic: 'İzole', equipment: 'Dumbbell', force: 'Pull',
        desc: 'Bilekleri döndürerek bicepsleri tam sıkıştıran hareket.',
        cues: ['Avuç içlerini yukarı çevirin (supinasyon)', 'Kontrollü indirin'],
        steps: ['Dambılları yanlarda tutun', 'Kaldırırken çevirin'],
        status: true
    },
    {
        name: 'Hammer Curl', name_en: 'Dumbbell Hammer Curl', slug: 'hammer-curl',
        group: 'arms', secondaryGroups: ['forearms', 'brachialis'],
        level: 'Başlangıç', mechanic: 'İzole', equipment: 'Dumbbell', force: 'Pull',
        desc: 'Ön kol ve bicepsin dış kısmını geliştiren tutuş.',
        cues: ['Avuçlar birbirine baksın', 'Dirsekler sabit'],
        steps: ['Çekiç tutuşu ile kaldırın', 'İndirin'],
        status: true
    },
    {
        name: 'Preacher Curl', name_en: 'Barbell Preacher Curl', slug: 'preacher-curl',
        group: 'arms', secondaryGroups: ['forearms'],
        level: 'Orta Seviye', mechanic: 'İzole', equipment: 'Barbell', force: 'Pull',
        desc: 'Hile yapmayı engelleyen ve bicepsi izole eden sehpa egzersizi.',
        cues: ['Koltuk altını pede dayayın', 'Kolları tam açın'],
        steps: ['Preacher sehpasına oturun', 'Barı kaldırıp indirin'],
        status: true
    },
    {
        name: 'Concentration Curl', name_en: 'Dumbbell Concentration Curl', slug: 'concentration-curl',
        group: 'arms', secondaryGroups: [],
        level: 'Başlangıç', mechanic: 'İzole', equipment: 'Dumbbell', force: 'Pull',
        desc: 'Biceps zirvesini (peak) oluşturmak için harika bir hareket.',
        cues: ['Dirseği bacağın içine yaslayın', 'Tepe noktada sıkın'],
        steps: ['Sehpaya oturun', 'Tek kolla dambılı kıvırın'],
        status: true
    },
    {
        name: 'Cable Curl', name_en: 'Cable Curl', slug: 'cable-curl',
        group: 'arms', secondaryGroups: ['forearms'],
        level: 'Başlangıç', mechanic: 'İzole', equipment: 'Cable', force: 'Pull',
        desc: 'Sürekli direnç sağlayan kablo egzersizi.',
        cues: ['Dirsekleri geriye kaçırmayın', 'Vücudu dik tutun'],
        steps: ['Kablo barını tutun', 'Kaldırın ve sıkın'],
        status: true
    },
    {
        name: 'Triceps Pushdown', name_en: 'Cable Triceps Pushdown', slug: 'triceps-pushdown',
        group: 'arms', secondaryGroups: [],
        level: 'Başlangıç', mechanic: 'İzole', equipment: 'Cable', force: 'Push',
        desc: 'Arka kol gelişimi için en popüler hareket.',
        cues: ['Sadece dirsekler çalışsın', 'Bilekleri bükmeyin'],
        steps: ['Barı veya halatı tutun', 'Aşağı itin', 'Yavaşça yukarı salın'],
        status: true
    },
    {
        name: 'Skull Crusher', name_en: 'Barbell Lying Triceps Extension', slug: 'skull-crusher',
        group: 'arms', secondaryGroups: [],
        level: 'Orta Seviye', mechanic: 'İzole', equipment: 'Barbell', force: 'Push',
        desc: 'Triceps kütlesi için en etkili egzersizlerden biri.',
        cues: ['Dirsekleri dışa açmayın', 'Barı alna veya baş arkasına indirin'],
        steps: ['Sehpaya uzanın', 'Barı alna indirin', 'Yukarı itin'],
        status: true
    },
    {
        name: 'Dips', name_en: 'Dips', slug: 'triceps-dips',
        group: 'arms', secondaryGroups: ['chest', 'shoulders'],
        level: 'Orta Seviye', mechanic: 'Bileşik', equipment: 'Bodyweight', force: 'Push',
        desc: 'Vücut ağırlığı ile arka kolları patlatın.',
        cues: ['Gövdeyi dik tutun (göğüs için değil)', 'Kolları tam kilitleyin'],
        steps: ['Paralel barda inip kalkın'],
        status: true
    },

    // --- ABS ---
    {
        name: 'Plank', name_en: 'Plank', slug: 'plank',
        group: 'core', secondaryGroups: ['core', 'shoulders'],
        level: 'Başlangıç', mechanic: 'İzometrik', equipment: 'Bodyweight', force: 'Static',
        desc: 'Merkez bölge dayanıklılığı için kral egzersiz.',
        cues: ['Kalçayı düşürmeyin', 'Karnı sıkın'],
        steps: ['Dirsekler üzerinde durun', 'Vücudu düz hat yapın', 'Bekleyin'],
        status: true
    },
    {
        name: 'Crunch', name_en: 'Crunch', slug: 'crunch',
        group: 'core', secondaryGroups: [],
        level: 'Başlangıç', mechanic: 'İzole', equipment: 'Bodyweight', force: 'Pull',
        desc: 'Üst karın kaslarını hedefleyen temel mekik.',
        cues: ['Boynu çekmeyin', 'Kürek kemiklerini yerden kesin'],
        steps: ['Sırt üstü yatın', 'Karnı sıkarak yükselin'],
        status: true
    },
    {
        name: 'Leg Raise', name_en: 'Lying Leg Raise', slug: 'leg-raise', // Lying Leg Raise
        group: 'core', secondaryGroups: ['hip_flexors'],
        level: 'Orta Seviye', mechanic: 'İzole', equipment: 'Bodyweight', force: 'Pull',
        desc: 'Alt karın kasları için etkili hareket.',
        cues: ['Bel boşluğunu yere bastırın', 'Bacakları düz tutun'],
        steps: ['Sırt üstü yatın', 'Bacakları kaldırın ve indirin'],
        status: true
    },
    {
        name: 'Russian Twist', name_en: 'Russian Twist', slug: 'russian-twist',
        group: 'core', secondaryGroups: ['obliques'],
        level: 'Orta Seviye', mechanic: 'Bileşik', equipment: 'Bodyweight', force: 'Pull',
        desc: 'Yan karın (oblique) kaslarını çalıştırır.',
        cues: ['Sırt düz dursun', 'Gövdeyi komple döndürün'],
        steps: ['V şeklinde oturun', 'Sağa ve sola dönün'],
        status: true
    },
    {
        name: 'Hanging Leg Raise', name_en: 'Hanging Leg Raise', slug: 'hanging-leg-raise',
        group: 'core', secondaryGroups: ['hip_flexors', 'forearms'],
        level: 'İleri Seviye', mechanic: 'Bileşik', equipment: 'Bodyweight', force: 'Pull',
        desc: 'Barda asılarak yapılan en zorlu karın egzersizlerinden biri.',
        cues: ['Sallanmamaya çalışın', 'Dizleri göğse çekin'],
        steps: ['Bara asılın', 'Bacakları yukarı kaldırın'],
        status: true
    },
    {
        name: 'Mountain Climber', name_en: 'Mountain Climber', slug: 'mountain-climber',
        group: 'core', secondaryGroups: ['shoulders', 'cardio'],
        level: 'Başlangıç', mechanic: 'Bileşik', equipment: 'Bodyweight', force: 'Push',
        desc: 'Kardiyo etkisi olan dinamik karın egzersizi.',
        cues: ['Kalçayı sabit tutun', 'Dizleri hızla çekin'],
        steps: ['Şınav pozisyonu alın', 'Dizleri sırayla karna çekin'],
        status: true
    },
    {
        name: 'Bicycle Crunch', name_en: 'Bicycle Crunch', slug: 'bicycle-crunch',
        group: 'core', secondaryGroups: ['obliques'],
        level: 'Orta Seviye', mechanic: 'İzole', equipment: 'Bodyweight', force: 'Pull',
        desc: 'Tüm karın duvarını çalıştıran etkili bir mekik varyasyonu.',
        cues: ['Dirseği zıt dize değdirin', 'Kürek kemikleri havada'],
        steps: ['Sırt üstü yatın', 'Pedal çevirir gibi hareket edin'],
        status: true
    },
    {
        name: 'Cable Woodchopper', name_en: 'Cable Woodchopper', slug: 'cable-woodchopper',
        group: 'core', secondaryGroups: ['obliques', 'shoulders'],
        level: 'Orta Seviye', mechanic: 'Bileşik', equipment: 'Cable', force: 'Pull',
        desc: 'Gövde rotasyonu ile yan karınları çalıştırır.',
        cues: ['Kolları düz tutun', 'Gövdeyle dönün'],
        steps: ['Kabloyu yanınıza alın', 'Çapraz şekilde aşağı/yukarı çekin'],
        status: true
    },
    {
        name: 'Ab Wheel Rollout', name_en: 'Ab Wheel Rollout', slug: 'ab-wheel',
        group: 'core', secondaryGroups: ['core', 'lats'],
        level: 'İleri Seviye', mechanic: 'Bileşik', equipment: 'Other', force: 'Static',
        desc: 'Karın kaslarını uzatarak çok sert çalıştıran aletli hareket.',
        cues: ['Belin çökmesine izin vermeyin', 'Karnı hep sıkı tutun'],
        steps: ['Dizler üzerinde durun', 'Tekerleği ileri sürün', 'Geri çekin'],
        status: true
    },
    {
        name: 'Side Plank', name_en: 'Side Plank', slug: 'side-plank',
        group: 'core', secondaryGroups: ['obliques'],
        level: 'Başlangıç', mechanic: 'İzometrik', equipment: 'Bodyweight', force: 'Static',
        desc: 'Yan karın ve bel dengesi için statik duruş.',
        cues: ['Vücut düz çizgi olsun', 'Kalça düşmesin'],
        steps: ['Yan dirsek üzerinde durun', 'Kalçayı kaldırın'],
        status: true
    },
    {
        name: 'V-Up', name_en: 'V-up', slug: 'v-up', // lowercase u in dataset generally
        group: 'core', secondaryGroups: ['hip_flexors'],
        level: 'İleri Seviye', mechanic: 'Bileşik', equipment: 'Bodyweight', force: 'Pull',
        desc: 'Hem alt hem üst karnı aynı anda vuran hareket.',
        cues: ['Belden kuvvet alarak "V" şekli oluşturun'],
        steps: ['Sırt üstü yatın', 'El ve ayakları aynı anda yukarıda buluşturun'],
        status: true
    },
    {
        name: 'Flutter Kicks', name_en: 'Flutter Kicks', slug: 'flutter-kicks',
        group: 'core', secondaryGroups: ['hip_flexors'],
        level: 'Başlangıç', mechanic: 'İzole', equipment: 'Bodyweight', force: 'Pull',
        desc: 'Alt karın için makas hareketi.',
        cues: ['Beli yere bastırın', 'Hızlı ve kısa tekmeler atın'],
        steps: ['Sırt üstü yatın', 'Bacakları az kaldırıp tekme atın'],
        status: true
    },
    {
        name: 'Heel Touch', name_en: 'Heel Touch', slug: 'heel-touch',
        group: 'core', secondaryGroups: ['obliques'],
        level: 'Başlangıç', mechanic: 'İzole', equipment: 'Bodyweight', force: 'Pull',
        desc: 'Yan karınları sıkıştırmak için basit ve etkili.',
        cues: ['Omuzlar havada olsun', 'Topuklara uzanın'],
        steps: ['Sırt üstü yatın dizler bükük', 'Sırayla topuklara dokunun'],
        status: true
    },
    {
        name: 'Reverse Crunch', name_en: 'Reverse Crunch', slug: 'reverse-crunch',
        group: 'core', secondaryGroups: [],
        level: 'Başlangıç', mechanic: 'İzole', equipment: 'Bodyweight', force: 'Pull',
        desc: 'Kalçayı yerden kaldırarak alt karnı çalıştırır.',
        cues: ['Kontrollü yapın', 'Sallanarak hız almayın'],
        steps: ['Sırt üstü yatın', 'Dizleri karna çekip kalçayı kaldırın'],
        status: true
    },
    {
        name: 'Decline Crunch', name_en: 'Decline Crunch', slug: 'decline-crunch',
        group: 'core', secondaryGroups: [],
        level: 'Orta Seviye', mechanic: 'İzole', equipment: 'Machine', force: 'Pull',
        desc: 'Eğimli sehpada yapılan daha zorlu mekik.',
        cues: ['Tam kalkmayın, karın gergin kalsın'],
        steps: ['Eğimli sehpaya bacakları takın', 'Geriye yatıp kalkın'],
        status: true
    }
];

const normalizeLevel = (lvl) => {
    const s = String(lvl || '').trim().toLowerCase();
    if (s === 'beginner' || s === 'yeni' || s === 'başlangıç' || s.startsWith('beg')) return 'Başlangıç';
    if (s === 'intermediate' || s === 'orta' || s === 'orta seviye' || s.startsWith('int')) return 'Orta Seviye';
    if (s === 'advanced' || s === 'ileri' || s === 'ileri seviye' || s.startsWith('adv')) return 'İleri Seviye';
    return 'Başlangıç';
};

const normalizeExercise = (ex) => {
    const slug = String(ex.slug || '').trim();
    return {
        ...ex,
        slug,
        level: normalizeLevel(ex.level),
        status: ex.status ?? true,
        secondaryGroups: Array.isArray(ex.secondaryGroups) ? ex.secondaryGroups : [],
        cues: Array.isArray(ex.cues) ? ex.cues : [],
        steps: Array.isArray(ex.steps) ? ex.steps : [],
        metrics: ex.metrics ?? { defaultSets: 3, defaultReps: '10-12', defaultRestSec: 60 },
        tags: [],
        stabilizers: [],
        contraindications: [],
        // Use name_en to fetch image from github
        imageUrls: ex.img ? [ex.img] : (ex.name_en ? [getImgUrl(ex.name_en)] : []),
        img: ex.img ? ex.img : (ex.name_en ? getImgUrl(ex.name_en) : ''),
        videoUrl: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };
};

export default function SeedFullExercisesScreen() {
    const [busy, setBusy] = useState(false);
    const [log, setLog] = useState('');

    const runSeed = async () => {
        try {
            setBusy(true);
            setLog('FULL SEED BAŞLIYOR...');

            const col = collection(db, 'exercises');
            let successCount = 0;

            for (const ex of FULL_EXERCISES) {
                const clean = normalizeExercise(ex);
                if (!clean.slug) continue;

                const ref = doc(col, clean.slug);
                const { createdAt, ...dataToUpdate } = clean;

                // Merge true ile upsert
                await setDoc(ref, {
                    ...dataToUpdate,
                    updatedAt: serverTimestamp()
                }, { merge: true });

                successCount++;
                if (successCount % 5 === 0) setLog(l => l + `\n${successCount} işlendi...`);
            }

            setLog(l => l + `\nTAMAMLANDI. Toplam ${successCount} egzersiz yüklendi.`);
            Alert.alert('Başarılı', `Tüm egzersizler güncellendi. (${successCount} kayıt)`);

        } catch (e) {
            console.error(e);
            setLog(l => l + `\nHATA: ${e.message}`);
            Alert.alert('Hata', String(e.message));
        } finally {
            setBusy(false);
        }
    };

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 20 }}>Full Exercise Seed</Text>
            <Text style={{ marginBottom: 16, color: '#444' }}>
                Göğüs, Sırt, Bacak, Omuz, Kol, Karın egzersizlerini tek seferde yükler.
                Resimler "yuhonas/free-exercise-db" kaynağından çekilir.
            </Text>

            <Pressable
                disabled={busy}
                onPress={runSeed}
                style={({ pressed }) => ({
                    backgroundColor: pressed ? '#0062cc' : '#007aff',
                    padding: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    opacity: busy ? 0.6 : 1
                })}
            >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                    {busy ? 'Yükleniyor...' : 'Veritabanını Doldur'}
                </Text>
            </Pressable>

            <ScrollView style={{ marginTop: 20, flex: 1, backgroundColor: '#f0f0f0', borderRadius: 8, padding: 10 }}>
                <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>{log}</Text>
            </ScrollView>
        </View>
    );
}
