export const Colors = {
  bg: '#040b07',
  surface: '#0f2618',
  surface2: '#173425',
  primary: '#7CFF4F',
  primarySoft: '#1d3d2c',
  gold: '#D7FF5A',
  silver: '#bdc3c7',
  bronze: '#cd6f32',
  danger: '#ff6b6b',
  success: '#35F57B',
  text: '#f3fff4',
  textMuted: '#8fa890',
  border: '#2e5c44',
};

export const gradients = {
  gold: ['#7d8f20', '#d7ff5a', '#9cc41a'] as const,
  silver: ['#4a5568', '#bdc3c7', '#4a5568'] as const,
  bronze: ['#5c3317', '#cd6f32', '#5c3317'] as const,
  surface: ['#0f2618', '#0c1f14'] as const,
  header: ['#040b07', '#071710'] as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  hero: 36,
};

export const Typography = {
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.6,
  },
};

export function getCardTier(rank: number): 'gold' | 'silver' | 'bronze' {
  if (rank <= 3) return 'gold';
  if (rank <= 10) return 'silver';
  return 'bronze';
}

export function getInitials(nome: string): string {
  const parts = nome.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
