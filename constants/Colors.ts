const neonLime = '#D4FF00';
const darkBg = '#121212';
const darkSurface = '#1E1E1E';
const textLight = '#FFFFFF';
const textGray = '#A0A0A0';

export default {
  // We are enforcing dark mode, so 'light' key can mirror dark or be unused.
  // But to be safe, we populate common keys.
  light: {
    text: textLight,
    background: darkBg,
    tint: neonLime,
    tabIconDefault: '#666',
    tabIconSelected: neonLime,
  },
  dark: {
    text: textLight,
    textSecondary: textGray,
    background: '#121212',
    surface: '#1E1E1E',
    primary: '#D4FF00', // Neon Lime
    border: '#333333',
    tint: neonLime,
    tabIconDefault: '#666',
    tabIconSelected: neonLime,
    error: '#FF453A',
  },
};
