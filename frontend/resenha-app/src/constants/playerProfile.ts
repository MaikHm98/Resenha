export type PlayerPositionCode =
  | 'GOLEIRO'
  | 'ZAGUEIRO'
  | 'LATERAL'
  | 'VOLANTE'
  | 'MEIA'
  | 'PONTA'
  | 'ATACANTE';

export type DominantFootCode = 'DIREITO' | 'ESQUERDO' | 'AMBIDESTRO';

export type PlayerProfileOption<T extends string> = {
  code: T;
  label: string;
};

export const PLAYER_POSITION_OPTIONS: PlayerProfileOption<PlayerPositionCode>[] = [
  { code: 'GOLEIRO', label: 'Goleiro' },
  { code: 'ZAGUEIRO', label: 'Zagueiro' },
  { code: 'LATERAL', label: 'Lateral' },
  { code: 'VOLANTE', label: 'Volante' },
  { code: 'MEIA', label: 'Meia' },
  { code: 'PONTA', label: 'Ponta' },
  { code: 'ATACANTE', label: 'Atacante' },
];

export const DOMINANT_FOOT_OPTIONS: PlayerProfileOption<DominantFootCode>[] = [
  { code: 'DIREITO', label: 'Direito' },
  { code: 'ESQUERDO', label: 'Esquerdo' },
  { code: 'AMBIDESTRO', label: 'Ambidestro' },
];

export function getPlayerPositionLabel(value?: string) {
  return PLAYER_POSITION_OPTIONS.find((item) => item.code === value)?.label;
}

export function getDominantFootLabel(value?: string) {
  return DOMINANT_FOOT_OPTIONS.find((item) => item.code === value)?.label;
}
