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
    // Cyber-tech palette matching ardans.my.id obsidian theme with high contrast
    colors: ['#0284c7', '#0891b2', '#4f46e5', '#7c3aed', '#c026d3', '#059669', '#d97706', '#2563eb'],
  },
} as const
