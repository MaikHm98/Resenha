export interface User {
  idUsuario: number;
  nome: string;
  email: string;
  goleiro?: boolean;
  timeCoracaoCodigo?: string;
  timeCoracaoNome?: string;
  timeCoracaoEscudoUrl?: string;
}

export interface AuthResponse {
  token: string;
  idUsuario: number;
  nome: string;
  email: string;
  goleiro?: boolean;
  timeCoracaoCodigo?: string;
  timeCoracaoNome?: string;
  timeCoracaoEscudoUrl?: string;
}

export interface Group {
  idGrupo: number;
  nome: string;
  limiteJogadores: number;
  perfil: 'ADMIN' | 'MEMBRO';
  totalMembros: number;
  criadoEm: string;
  diaSemana?: number;
  horarioFixo?: string;
}

export interface GroupMember {
  idUsuario: number;
  nome: string;
  email: string;
  perfil: 'ADMIN' | 'JOGADOR' | 'MEMBRO';
  goleiro: boolean;
  timeCoracaoCodigo?: string;
  timeCoracaoNome?: string;
  timeCoracaoEscudoUrl?: string;
  entrouEm: string;
}

export interface ClubOption {
  codigo: string;
  nome: string;
  escudoUrl: string;
}

export interface BlockedPlayer {
  idUsuario: number;
  nome: string;
}

export interface CaptainStatus {
  idCiclo: number;
  idCapitao: number;
  nomeCapitao: string;
  idDesafiante?: number;
  nomeDesafiante?: string;
  bloqueados: BlockedPlayer[];
  status: string;
  iniciadoEm: string;
}

export interface ClassificationEntry {
  posicao: number;
  idUsuario: number;
  nome: string;
  timeCoracaoCodigo?: string;
  timeCoracaoNome?: string;
  timeCoracaoEscudoUrl?: string;
  pontos: number;
  vitorias: number;
  derrotas: number;
  presencas: number;
  gols: number;
  assistencias: number;
  mvps: number;
  bolasMurchas: number;
}

export interface VoteTally {
  idUsuario: number;
  nome: string;
  votos: number;
}

export interface VoteRound {
  idVotacao: number;
  tipo: string;
  rodada: number;
  status: 'ABERTA' | 'APURADA' | 'APROVADA' | 'ENCERRADA';
  candidatos: VoteTally[];
  idVencedorProvisorio?: number;
  nomeVencedorProvisorio?: string;
}

export interface VoteStatus {
  mvp?: VoteRound;
  bolaMurcha?: VoteRound;
  mvpHistorico: VoteRound[];
  bolaMurchaHistorico: VoteRound[];
}

export interface Match {
  idPartida: number;
  idGrupo: number;
  idTemporada: number;
  dataHoraJogo: string;
  status: 'ABERTA' | 'EM_ANDAMENTO' | 'FINALIZADA' | 'CANCELADA';
  observacao?: string;
  totalConfirmados: number;
  limiteVagas: number;
  limiteCheio: boolean;
  usuarioConfirmado: boolean;
  usuarioAusente: boolean;
  confirmados: { nome: string; goleiro: boolean }[];
  ausentesNomes: string[];
  naoConfirmaramNomes: string[];
  nomeCapitaoVencedor?: string;
  jogadoresVencedores: string[];
  criadoEm: string;
}
