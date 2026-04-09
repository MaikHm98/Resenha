export interface User {
  idUsuario: number;
  nome: string;
  email: string;
  goleiro?: boolean;
  timeCoracaoCodigo?: string;
  timeCoracaoNome?: string;
  timeCoracaoEscudoUrl?: string;
  posicaoPrincipal?: string;
  peDominante?: string;
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
  posicaoPrincipal?: string;
  peDominante?: string;
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

export interface AddGroupMemberResult {
  acao: 'ADDED' | 'INVITED';
  mensagem: string;
  membro?: GroupMember;
  codigoConvite?: string;
  inviteLink?: string;
  expiraEm?: string;
}

export interface PendingGroupInvite {
  idConvite: number;
  idGrupo: number;
  nomeGrupo: string;
  codigoConvite: string;
  expiraEm: string;
  criadoEm: string;
}

export interface GroupPendingInvite {
  idConvite: number;
  emailConvidado: string;
  codigoConvite: string;
  inviteLink: string;
  expiraEm: string;
  criadoEm: string;
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
  historico: CaptainHistoryEntry[];
  status: string;
  iniciadoEm: string;
}

export interface CaptainHistoryEntry {
  idHistorico: number;
  idPartida: number;
  idCapitao: number;
  nomeCapitao: string;
  idDesafiante: number;
  nomeDesafiante: string;
  idVencedor: number;
  nomeVencedor: string;
  idDerrotado: number;
  nomeDerrotado: string;
  resultado: string;
  registradoEm: string;
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

export interface ResumoPartidaHistorico {
  idPartida: number;
  dataHoraJogo: string;
  status: 'ABERTA' | 'EM_ANDAMENTO' | 'FINALIZADA' | 'CANCELADA';
  limiteVagas: number;
  totalConfirmados: number;
  golsTime1?: number;
  golsTime2?: number;
  nomeCapitaoTime1?: string;
  nomeCapitaoTime2?: string;
  numeroTimeVencedor?: number;
  nomeCapitaoVencedor?: string;
}

export interface JogadorPartidaDetalhe {
  idUsuario: number;
  nome: string;
  goleiro: boolean;
  gols: number;
  assistencias: number;
}

export interface TimePartidaDetalhe {
  numeroTime: number;
  idCapitao: number;
  nomeCapitao: string;
  jogadores: JogadorPartidaDetalhe[];
}

export interface PremioPartidaDetalhe {
  tipo: string;
  status: string;
  rodada: number;
  idVencedor?: number;
  nomeVencedor?: string;
}

export interface DetalhePartida {
  idPartida: number;
  idGrupo: number;
  dataHoraJogo: string;
  status: 'ABERTA' | 'EM_ANDAMENTO' | 'FINALIZADA' | 'CANCELADA';
  observacao?: string;
  limiteVagas: number;
  totalConfirmados: number;
  totalAusentes: number;
  golsTime1?: number;
  golsTime2?: number;
  numeroTimeVencedor?: number;
  nomeCapitaoVencedor?: string;
  time1?: TimePartidaDetalhe;
  time2?: TimePartidaDetalhe;
  confirmadosNomes: string[];
  ausentesNomes: string[];
  naoConfirmaramNomes: string[];
  premios: PremioPartidaDetalhe[];
}

export interface CapitaoDesafio {
  idUsuario: number;
  nome: string;
}

export interface ChallengeStatus {
  idPartida: number;
  idGrupo: number;
  dataHoraJogo: string;
  statusPartida: 'ABERTA' | 'EM_ANDAMENTO' | 'FINALIZADA' | 'CANCELADA';
  statusDesafio: string;
  totalConfirmados: number;
  minimoConfirmados: number;
  goleirosConfirmados: number;
  maximoGoleiros: number;
  horarioLimiteConfirmacao: string;
  confirmacoesEncerradas: boolean;
  podeIniciarMontagem: boolean;
  usuarioEhCapitao: boolean;
  usuarioEhCapitaoAtual: boolean;
  usuarioEhDesafiante: boolean;
  usuarioPodeInteragir: boolean;
  usuarioPodeEscolherParidade: boolean;
  usuarioPodeInformarNumero: boolean;
  usuarioPodeEscolherJogadorLinha: boolean;
  usuarioPodeEscolherParidadeGoleiro: boolean;
  usuarioPodeInformarNumeroGoleiro: boolean;
  usuarioPodeEscolherGoleiro: boolean;
  possuiDesafianteDefinido: boolean;
  requerDefinicaoManualGoleiro: boolean;
  paridadeCapitaoAtual?: string;
  paridadeDesafiante?: string;
  capitaoAtualJaInformouNumero: boolean;
  desafianteJaInformouNumero: boolean;
  numeroCapitaoAtual?: number;
  numeroDesafiante?: number;
  somaParImparLinha?: number;
  paridadeCapitaoAtualGoleiro?: string;
  paridadeDesafianteGoleiro?: string;
  capitaoAtualJaInformouNumeroGoleiro: boolean;
  desafianteJaInformouNumeroGoleiro: boolean;
  numeroCapitaoAtualGoleiro?: number;
  numeroDesafianteGoleiro?: number;
  somaParImparGoleiro?: number;
  alertas: string[];
  bloqueios: string[];
  capitaoAtual?: CapitaoDesafio;
  desafiante?: CapitaoDesafio;
  vencedorParImparLinha?: CapitaoDesafio;
  proximoCapitaoEscolha?: CapitaoDesafio;
  vencedorParImparGoleiro?: CapitaoDesafio;
  proximoCapitaoEscolhaGoleiro?: CapitaoDesafio;
  timeCapitaoAtual?: TimeMontagemDesafio;
  timeDesafiante?: TimeMontagemDesafio;
  jogadoresLinhaDisponiveis: JogadorDesafio[];
  goleirosDisponiveis: JogadorDesafio[];
}

export interface JogadorDesafio {
  idUsuario: number;
  nome: string;
  goleiro: boolean;
}

export interface TimeMontagemDesafio {
  numeroTime: number;
  idCapitao: number;
  nomeCapitao: string;
  jogadores: JogadorDesafio[];
}
