import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import api from '../api/api';
import { Colors, FontSize, Radius, Spacing, Typography, getInitials } from '../theme';
import { VoteStatus, VoteRound, VoteTally } from '../types';
import { AppStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'Vote'>;
  route: RouteProp<AppStackParamList, 'Vote'>;
};

const TYPE_LABEL = { MVP: 'MVP', BOLA_MURCHA: 'Bola Murcha' } as const;
const TYPE_ICON = { MVP: 'star-outline', BOLA_MURCHA: 'skull-outline' } as const;
const TYPE_COLOR = { MVP: Colors.gold, BOLA_MURCHA: Colors.danger } as const;

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  ABERTA: { label: 'ABERTA', color: Colors.success },
  APURADA: { label: 'APURADA', color: Colors.gold },
  APROVADA: { label: 'APROVADA', color: Colors.primary },
  ENCERRADA: { label: 'ENCERRADA', color: Colors.textMuted },
};

export default function VoteScreen({ route }: Props) {
  const { matchId, isAdmin } = route.params;
  const [voteStatus, setVoteStatus] = useState<VoteStatus | null>(null);
  const [semVotacao, setSemVotacao] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erroGeral, setErroGeral] = useState('');

  const [selectedMvp, setSelectedMvp] = useState<number | null>(null);
  const [selectedBm, setSelectedBm] = useState<number | null>(null);
  const [loadingTipo, setLoadingTipo] = useState<Record<string, boolean>>({});
  const [erroTipo, setErroTipo] = useState<Record<string, string>>({});

  async function carregar(silencioso = false) {
    if (!silencioso) setCarregando(true);
    setErroGeral('');
    try {
      const res = await api.get(`/api/matches/${matchId}/vote`);
      setVoteStatus(res.data);
      setSemVotacao(false);
    } catch (e: any) {
      const msg: string = e?.response?.data?.mensagem ?? '';
      const normalized = msg.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (normalized.includes('nao ha votacao')) {
        setSemVotacao(true);
        setVoteStatus(null);
      } else {
        setSemVotacao(false);
        setErroGeral(msg || 'Erro ao carregar votacao.');
      }
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [matchId])
  );

  async function executar(tipo: string, fn: () => Promise<void>) {
    setLoadingTipo((p) => ({ ...p, [tipo]: true }));
    setErroTipo((p) => ({ ...p, [tipo]: '' }));
    try {
      await fn();
      await carregar(true);
    } catch (e: any) {
      const msg = e?.response?.data?.mensagem || 'Operacao falhou.';
      setErroTipo((p) => ({ ...p, [tipo]: msg }));
    } finally {
      setLoadingTipo((p) => ({ ...p, [tipo]: false }));
    }
  }

  function abrirVotacao() {
    executar('open', () => api.post(`/api/matches/${matchId}/vote/open`));
  }

  function votar(tipo: 'MVP' | 'BOLA_MURCHA', idVotado: number) {
    executar(tipo, () => api.post(`/api/matches/${matchId}/vote`, { tipo, idUsuarioVotado: idVotado }));
  }

  function encerrar(tipo: 'MVP' | 'BOLA_MURCHA') {
    executar(`${tipo}_close`, () => api.post(`/api/matches/${matchId}/vote/close`, { tipo }));
  }

  function aprovar(tipo: 'MVP' | 'BOLA_MURCHA') {
    executar(`${tipo}_approve`, () => api.post(`/api/matches/${matchId}/vote/approve`, { tipo }));
  }

  function renderCandidatos(candidatos: VoteTally[], tipo: 'MVP' | 'BOLA_MURCHA', selecionavel: boolean) {
    const maxVotos = Math.max(...candidatos.map((c) => c.votos), 1);
    const selected = tipo === 'MVP' ? selectedMvp : selectedBm;
    const setSelected = tipo === 'MVP' ? setSelectedMvp : setSelectedBm;
    const cor = TYPE_COLOR[tipo];

    return candidatos.map((c) => {
      const isSel = selected === c.idUsuario;
      const pct = Math.round((c.votos / maxVotos) * 100);

      return (
        <TouchableOpacity
          key={c.idUsuario}
          style={[styles.candidateRow, isSel && { borderColor: cor }]}
          onPress={() => selecionavel && setSelected(isSel ? null : c.idUsuario)}
          activeOpacity={selecionavel ? 0.7 : 1}
        >
          <View style={[styles.avatarSmall, { backgroundColor: `${cor}33` }]}>
            <Text style={[styles.avatarSmallText, { color: cor }]}>{getInitials(c.nome)}</Text>
          </View>

          <View style={styles.candidateInfo}>
            <Text style={styles.candidateName}>{c.nome}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: cor }]} />
            </View>
          </View>

          <Text style={[styles.votesCount, { color: cor }]}>{c.votos}</Text>

          {selecionavel && (
            <View style={[styles.radio, isSel && { backgroundColor: cor, borderColor: cor }]} />
          )}
        </TouchableOpacity>
      );
    });
  }

  function renderSecao(round: VoteRound | undefined, tipo: 'MVP' | 'BOLA_MURCHA') {
    if (!round) return null;

    const cor = TYPE_COLOR[tipo];
    const icon = TYPE_ICON[tipo];
    const label = TYPE_LABEL[tipo];
    const isLoadingClose = !!loadingTipo[`${tipo}_close`];
    const isLoadingApprove = !!loadingTipo[`${tipo}_approve`];
    const isLoadingVote = !!loadingTipo[tipo];
    const erroVote = erroTipo[tipo] || '';
    const erroAcao = erroTipo[`${tipo}_close`] || erroTipo[`${tipo}_approve`] || '';
    const selected = tipo === 'MVP' ? selectedMvp : selectedBm;
    const badge = STATUS_BADGE[round.status] ?? { label: round.status, color: Colors.textMuted };

    return (
      <View style={[styles.sectionCard, { borderColor: `${cor}55` }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleWrap}>
            <Ionicons name={icon} size={16} color={cor} />
            <Text style={[styles.sectionTitle, { color: cor }]}>{label} - Rodada {round.rodada}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${badge.color}22`, borderColor: badge.color }]}>
            <Text style={[styles.statusText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        </View>

        {round.status === 'APROVADA' && round.nomeVencedorProvisorio && (
          <View style={[styles.winnerCard, { borderColor: cor }]}>
            <Ionicons name="trophy-outline" size={30} color={cor} />
            <Text style={[styles.winnerName, { color: cor }]}>{round.nomeVencedorProvisorio.toUpperCase()}</Text>
            <Text style={styles.winnerLabel}>{label} da partida</Text>
          </View>
        )}

        {round.status === 'APURADA' && (
          <>
            {renderCandidatos(round.candidatos, tipo, false)}
            {round.nomeVencedorProvisorio && (
              <View style={[styles.provisionalCard, { borderColor: `${cor}88` }]}>
                <Text style={[styles.provisionalText, { color: cor }]}>
                  Vencedor provisório: {round.nomeVencedorProvisorio}
                </Text>
              </View>
            )}
            {isAdmin && (
              <TouchableOpacity style={[styles.primaryButton, { backgroundColor: cor }]} onPress={() => aprovar(tipo)} disabled={isLoadingApprove}>
                {isLoadingApprove ? <ActivityIndicator color={Colors.bg} /> : <Text style={styles.primaryButtonText}>Aprovar {label}</Text>}
              </TouchableOpacity>
            )}
          </>
        )}

        {round.status === 'ABERTA' && (
          <>
            {renderCandidatos(round.candidatos, tipo, true)}
            {erroVote !== '' && <Text style={styles.errorText}>{erroVote}</Text>}

            {selected !== null && (
              <TouchableOpacity style={[styles.primaryButton, { backgroundColor: cor }]} onPress={() => votar(tipo, selected)} disabled={isLoadingVote}>
                {isLoadingVote ? (
                  <ActivityIndicator color={Colors.bg} />
                ) : (
                  <Text style={styles.primaryButtonText}>Confirmar voto {label}</Text>
                )}
              </TouchableOpacity>
            )}

            {isAdmin && (
              <>
                {erroAcao !== '' && <Text style={styles.errorText}>{erroAcao}</Text>}
                <TouchableOpacity style={[styles.secondaryButton, { borderColor: cor }]} onPress={() => encerrar(tipo)} disabled={isLoadingClose}>
                  {isLoadingClose ? <ActivityIndicator color={cor} /> : <Text style={[styles.secondaryButtonText, { color: cor }]}>Encerrar {label}</Text>}
                </TouchableOpacity>
              </>
            )}
          </>
        )}

        {round.status === 'ENCERRADA' && (
          <Text style={styles.infoText}>Rodada encerrada por empate. Uma nova rodada foi aberta.</Text>
        )}
      </View>
    );
  }

  function renderHistorico(tipo: 'MVP' | 'BOLA_MURCHA', historico: VoteRound[] | undefined) {
    if (!historico || historico.length === 0) return null;
    const cor = TYPE_COLOR[tipo];
    const label = TYPE_LABEL[tipo];

    return (
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <Ionicons name={TYPE_ICON[tipo]} size={16} color={cor} />
          <Text style={[styles.historyTitle, { color: cor }]}>Histórico {label}</Text>
        </View>
        {historico.map((round) => {
          const badge = STATUS_BADGE[round.status] ?? { label: round.status, color: Colors.textMuted };
          return (
            <View key={round.idVotacao} style={styles.historyItem}>
              <View style={styles.historyLine}>
                <Text style={styles.historyRound}>Rodada {round.rodada}</Text>
                <Text style={[styles.historyStatus, { color: badge.color }]}>{badge.label}</Text>
              </View>
              <Text style={styles.historyDetail}>
                {round.nomeVencedorProvisorio ? `Vencedor: ${round.nomeVencedorProvisorio}` : 'Sem vencedor definido'}
              </Text>
            </View>
          );
        })}
      </View>
    );
  }

  if (carregando) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const podeAbrirVotacao = isAdmin && (semVotacao || (!voteStatus?.mvp && !voteStatus?.bolaMurcha));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={atualizando}
          onRefresh={() => {
            setAtualizando(true);
            carregar(true);
          }}
          tintColor={Colors.primary}
        />
      }
    >
      {podeAbrirVotacao && (
        <TouchableOpacity style={styles.openButton} onPress={abrirVotacao} disabled={!!loadingTipo.open}>
          <Ionicons name="megaphone-outline" size={16} color={Colors.bg} />
          {loadingTipo.open ? (
            <ActivityIndicator color={Colors.bg} />
          ) : (
            <Text style={styles.openButtonText}>Abrir votacao (MVP + Bola Murcha)</Text>
          )}
        </TouchableOpacity>
      )}

      {!isAdmin && semVotacao && (
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>A votacao ainda nao foi aberta pelo admin.</Text>
        </View>
      )}

      {erroTipo.open !== '' && <Text style={styles.errorText}>{erroTipo.open}</Text>}
      {erroGeral !== '' && <Text style={styles.errorText}>{erroGeral}</Text>}

      {voteStatus && (
        <>
          {renderSecao(voteStatus.mvp, 'MVP')}
          {renderSecao(voteStatus.bolaMurcha, 'BOLA_MURCHA')}
          {renderHistorico('MVP', voteStatus.mvpHistorico)}
          {renderHistorico('BOLA_MURCHA', voteStatus.bolaMurchaHistorico)}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },

  openButton: {
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  openButtonText: { color: Colors.bg, fontWeight: '800', fontSize: FontSize.md },

  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '800' },
  statusBadge: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: { fontSize: FontSize.xs, fontWeight: '700' },

  candidateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: Spacing.sm,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSmallText: { fontWeight: '900', fontSize: FontSize.sm },
  candidateInfo: { flex: 1 },
  candidateName: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '600', marginBottom: 4 },
  progressTrack: {
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  progressFill: { height: 3, borderRadius: Radius.sm },
  votesCount: { fontSize: FontSize.sm, fontWeight: '800', minWidth: 20, textAlign: 'right' },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.border,
  },

  winnerCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  winnerName: { fontSize: FontSize.lg, fontWeight: '900', letterSpacing: 0.7, marginTop: 6 },
  winnerLabel: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: 4 },

  provisionalCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  provisionalText: { fontSize: FontSize.sm, fontWeight: '700' },

  primaryButton: {
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: { color: Colors.bg, fontWeight: '800', fontSize: FontSize.sm },
  secondaryButton: {
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: { fontWeight: '800', fontSize: FontSize.sm },

  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  infoText: { color: Colors.textMuted, fontSize: FontSize.sm, textAlign: 'center', fontStyle: 'italic' },
  errorText: { color: Colors.danger, fontSize: FontSize.xs, textAlign: 'center' },

  historyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  historyHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  historyTitle: { fontSize: FontSize.sm, fontWeight: '800' },
  historyItem: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
  historyLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyRound: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '700' },
  historyStatus: { fontSize: FontSize.xs, fontWeight: '700' },
  historyDetail: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
});
