// constants/exercises.js
export const EXERCISES = {
  Chest: {
    beginner: [
      { id: 'pushup', name: 'Push-up', desc: 'Vücudu düz tut. Göğüs yere yaklaşınca it.', video: 'https://youtu.be/_l3ySVKYVJ8' },
      { id: 'incline-pushup', name: 'Incline Push-up', desc: 'Eller yükseltide, omuz genişliği.', video: 'https://youtu.be/8D_ItZBvbkg' },
    ],
    intermediate: [
      { id: 'bb-bench', name: 'Barbell Bench Press', desc: 'Skapulayı sabitle, ayaklar yerde.', video: 'https://youtu.be/rT7DgCr-3pg' },
    ],
    advanced: [
      { id: 'weighted-dip', name: 'Weighted Dip', desc: 'Öne hafif eğil, kontrollü tekrar.', video: 'https://youtu.be/2z8JmcrW-As' },
    ],
  },
  Back: {
    beginner: [{ id: 'lat-pulldown', name: 'Lat Pulldown', desc: 'Göğüse çek, bel sabit.', video: 'https://youtu.be/CAwf7n6Luuc' }],
    intermediate: [{ id: 'pullup', name: 'Pull-up', desc: 'Çeneyi barın üstüne getir.', video: 'https://youtu.be/eGo4IYlbE5g' }],
    advanced: [{ id: 'rack-pull', name: 'Rack Pull', desc: 'Sırt düz, omuzlar geride.', video: 'https://youtu.be/9Z8fF8QeQ9A' }],
  },
  Shoulders: {
    beginner: [{ id: 'db-press', name: 'DB Shoulder Press', desc: 'Bel boşluğunu abartma.', video: 'https://youtu.be/B-aVuyhvLHU' }],
    intermediate: [{ id: 'arnold', name: 'Arnold Press', desc: 'Dönüşte omuz ön/arka devrede.', video: 'https://youtu.be/6Z15_WdXmVw' }],
    advanced: [{ id: 'push-press', name: 'Push Press', desc: 'Dizden hafif yardım.', video: 'https://youtu.be/qv7q1Zx6R3k' }],
  },
  Arms: {
    beginner: [{ id: 'db-curl', name: 'DB Curl', desc: 'Dirsek sabit.', video: 'https://youtu.be/ykJmrZ5v0Oo' }],
    intermediate: [{ id: 'ez-curl', name: 'EZ-Bar Curl', desc: 'Omuzları kilitle.', video: 'https://youtu.be/kwG2ipFRgfo' }],
    advanced: [{ id: 'close-grip', name: 'Close-grip Bench', desc: 'Tricep odağı.', video: 'https://youtu.be/wxVRe9pmJdk' }],
  },
  Legs: {
    beginner: [{ id: 'bw-squat', name: 'Bodyweight Squat', desc: 'Topuklar yerde.', video: 'https://youtu.be/aclHkVaku9U' }],
    intermediate: [{ id: 'back-squat', name: 'Back Squat', desc: 'Paralel altı, kontrollü.', video: 'https://youtu.be/ultWZbUMPL8' }],
    advanced: [{ id: 'front-squat', name: 'Front Squat', desc: 'Dik torso.', video: 'https://youtu.be/EXZ1eHCW3C0' }],
  },
  Core: {
    beginner: [{ id: 'dead-bug', name: 'Dead Bug', desc: 'Bel yere yapışık.', video: 'https://youtu.be/g_N6vZK6lO0' }],
    intermediate: [{ id: 'cable-crunch', name: 'Cable Crunch', desc: 'Sırtı bük, kalçayı değil.', video: 'https://youtu.be/g_8X8ZQbYgI' }],
    advanced: [{ id: 'ab-wheel', name: 'Ab Wheel Rollout', desc: 'Bel oyulmasın.', video: 'https://youtu.be/E66oZ7YvGvE' }],
  },
};

// Grup isimlerini tek yerden kullanalım:
export const GROUPS = Object.keys(EXERCISES);
