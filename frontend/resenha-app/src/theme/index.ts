export const Colors = {
  bg: '#0d111f',
  surface: '#16213e',
  surface2: '#1d2b52',
  primary: '#4fc3f7',
  primarySoft: '#2b4966',
  gold: '#ffd700',
  silver: '#bdc3c7',
  bronze: '#cd6f32',
  danger: '#ef5350',
  success: '#66bb6a',
  text: '#f7f9ff',
  textMuted: '#9ca8c6',
  border: '#2a3a63',
};

export const gradients = {
  gold: ['#7d5a00', '#ffd700', '#c8960c'] as const,
  silver: ['#4a5568', '#bdc3c7', '#4a5568'] as const,
  bronze: ['#5c3317', '#cd6f32', '#5c3317'] as const,
  surface: ['#16213e', '#0f3460'] as const,
  header: ['#0d0d1a', '#16213e'] as const,
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
