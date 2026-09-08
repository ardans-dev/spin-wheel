// [SPIN_CONFIG]
// Pengaturan utama animasi wheel. Ubah nilai di sini saat ingin menyesuaikan rasa spin.
export const APP_CONFIG = {
  spin: {
    desktopDuration: 7000,
    mobileDuration: 5000,
    // Tetap singkat untuk reduced-motion, tetapi masih memberi feedback gerak.
    reducedMotionDuration: 1800,
    minRotations: 5,
    maxRotations: 7,
    // Start cepat, lalu tahan laju lebih lama di bagian akhir.
    easing: 'cubic-bezier(0.08, 0.82, 0.14, 1)',
  },

  // [GROUP_CONFIG]
  group: {
    processingDuration: 3200,
    reducedMotionDuration: 700,
    minParticipants: 2,
    maxGroups: 50,
  },

  // [ANIMATION_CONFIG]
  animation: {
    cardStagger: 75,
    processingWheelDuration: 1000,
  },

  // [UI]
  wheel: {
    size: 600,
    // Wheel boleh lebih ekspresif daripada panel aplikasi, tetap dengan kontras yang aman.
    colors: ['#08758a', '#2559c7', '#5b43b5', '#963c78', '#a9572d', '#447b3f'],
  },
} as const
