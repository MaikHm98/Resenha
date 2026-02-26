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
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import api from '../api/api';
import { Colors, FontSize, Spacing, getInitials } from '../theme';
import { VoteStatus, VoteRound, VoteTally } from '../types';
import { AppStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'Vote'>;
  route: RouteProp<AppStackParamList, 'Vote'>;
};

const TIPO_LABEL = { MVP: 'MVP', BOLA_MURCHA: 'Bola Murcha' };
const TIPO_EMOJI = { MVP: '⭐', BOLA_MURCHA: '💀' };
const TIPO_COLOR = { MVP: Colors.gold, BOLA_MURCHA: Colors.danger };

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

  // Seleção local por tipo
  const [selectedMvp, setSelectedMvp] = useState<number | null>(null);
  const [selectedBm, setSelectedBm] = useState<number | null>(null);

  // Loading e erro por tipo
  const [loadingTipo, setLoadingTipo] = useState<Record<string, boolean>>({});
  const [erroTipo, setErroTipo] = useState<Record<string, string>>({});

  async function carregar(silencioso = false) {
    if (!silencioso) setCarregando(true);
    try {
      const res = await api.get(`/api/matches/${matchId}/vote`);
      setVoteStatus(res.data);
      setSemVotacao(false);
    } catch (e: any) {
      const msg: string = e?.response?.data?.mensagem ?? '';
      if (e?.response?.status === 400) {
        setSemVotacao(true);
        setVoteStatus(null);
      }
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  useFocusEffect(useCallback(() => { carregar(); }, [matchId]));

  async function executar(tipo: string, fn: () => Promise<void>) {
    setLoadingTipo((p) => ({ ...p, [tipo]: true }));
    setErroTipo((p) => ({ ...p, [tipo]: '' }));
    try {
      await fn();
      await carregar(true);
    } catch (e: any) {
      const msg = e?.response?.data?.mensagem || 'Operação falhou.';
      setErroTipo((p) => ({ ...p, [tipo]: msg }));
    } finally {
      setLoadingTipo((p) => ({ ...p, [tipo]: false }));
    }
  }

  function abrirVotacao() {
    executar('open', () => api.post(`/api/matches/${matchId}/vote/open`));
  }

  function votar(tipo: 'MVP' | 'BOLA_MURCHA', idVotado: number) {
    executar(tipo, () =>
      api.post(`/api/matches/${matchId}/vote`, { tipo, idUsuarioVotado: idVotado })
    );
  }

  function encerrar(tipo: string) {
    executar(tipo + '_close', () =>
      api.post(`/api/matches/${matchId}/vote/close`, { tipo })
    );
  }

  function aprovar(tipo: string) {
    executar(tipo + '_approve', () =>
      api.post(`/api/matches/${matchId}/vote/approve`, { tipo })
    );
  }

  function renderCandidatos(
    candidatos: VoteTally[],
    tipo: 'MVP' | 'BOLA_MURCHA',
    selecionavel: boolean
  ) {
    const maxVotos = Math.max(...candidatos.map((c) => c.votos), 1);
    const selected = tipo === 'MVP' ? selectedMvp : selectedBm;
    const setSelected = tipo === 'MVP' ? setSelectedMvp : setSelectedBm;
    const cor = TIPO_COLOR[tipo];

    return candidatos.map((c) => {
      const isSel = selected === c.idUsuario;
      const pct = Math.round((c.votos / maxVotos) * 100);
      return (
        <TouchableOpacity
          key={c.idUsuario}
          style={[styles.candidatoRow, isSel && { borderColor: cor, borderWidth: 1 }]}
          onPress={() => selecionavel && setSelected(isSel ? null : c.idUsuario)}
          activeOpacity={selecionavel ? 0.7 : 1}
        >
          <View style={[styles.avatarSmall, { backgroundColor: cor + '33' }]}>
            <Text style={[styles.avatarSmallText, { color: cor }]}>
              {getInitials(c.nome)}
            </Text>
          </View>
          <View style={styles.candidatoInfo}>
            <Text style={styles.candidatoNome}>{c.nome}</Text>
            <View style={styles.barraFundoSmall}>
              <View style={[styles.barraFillSmall, { width: `${pct}%` as any, backgroundColor: cor }]} />
            </View>
          </View>
          <Text style={[styles.votosNum, { color: cor }]}>{c.votos}</Text>
          {selecionavel && (
            <View style={[styles.radio, isSel && { backgroundColor: cor, borderColor: cor }]} />
          )}
        </TouchableOpacity>
      );
    });
  }

  function renderSecao(round: VoteRound | undefined, tipo: 'MVP' | 'BOLA_MURCHA') {
    const cor = TIPO_COLOR[tipo];
    const emoji = TIPO_EMOJI[tipo];
    const label = TIPO_LABEL[tipo];
    const isLoadingClose = loadingTipo[tipo + '_close'];
    const isLoadingApprove = loadingTipo[tipo + '_approve'];
    const isLoadingVote = loadingTipo[tipo];
    const erroVote = erroTipo[tipo] || '';
    const erroAcao = erroTipo[tipo + '_close'] || erroTipo[tipo + '_approve'] || '';
    const selected = tipo === 'MVP' ? selectedMvp : selectedBm;

    if (!round) return null;

    const badge = STATUS_BADGE[round.status] ?? { label: round.status, color: Colors.textMuted };

    return (
      <View style={[styles.secao, { borderColor: cor + '44' }]}>
        {/* Header da seção */}
        <View style={styles.secaoHeader}>
          <Text style={[styles.secaoTitulo, { color: cor }]}>{emoji} {label} · Rodada {round.rodada}</Text>
          <View style={[styles.statusBadge, { backgroundColor: badge.color + '22', borderColor: badge.color }]}>
            <Text style={[styles.statusText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        </View>

        {/* APROVADA */}
        {round.status === 'APROVADA' && round.nomeVencedorProvisorio && (
          <View style={[styles.vencedorCard, { borderColor: cor }]}>
            <Text style={styles.trofeu}>🏆</Text>
            <Text style={[styles.vencedorNome, { color: cor }]}>
              {round.nomeVencedorProvisorio.toUpperCase()}
            </Text>
            <Text style={styles.vencedorLabel}>{label} da partida</Text>
          </View>
        )}

        {/* APURADA */}
        {round.status === 'APURADA' && (
          <>
            {renderCandidatos(round.candidatos, tipo, false)}
            {round.nomeVencedorProvisorio && (
              <View style={[styles.provisorioCard, { borderColor: cor + '88' }]}>
                <Text style={[styles.provisorioLabel, { color: cor }]}>
                  Vencedor provisório: {round.nomeVencedorProvisorio}
                </Text>
              </View>
            )}
            {isAdmin && (
              <TouchableOpacity
                style={[styles.botaoAcao, { backgroundColor: cor }]}
                onPress={() => aprovar(tipo)}
                disabled={!!isLoadingApprove}
              >
                {isLoadingApprove
                  ? <ActivityIndicator color={Colors.bg} />
                  : <Text style={styles.botaoAcaoText}>Aprovar {label}</Text>
                }
              </TouchableOpacity>
            )}
          </>
        )}

        {/* ABERTA */}
        {round.status === 'ABERTA' && (
          <>
            {renderCandidatos(round.candidatos, tipo, true)}
            {erroVote !== '' && <Text style={styles.erroText}>{erroVote}</Text>}
            {selected !== null && (
              <TouchableOpacity
                style={[styles.botaoAcao, { backgroundColor: cor }]}
                onPress={() => votar(tipo, selected)}
                disabled={!!isLoadingVote}
              >
                {isLoadingVote
                  ? <ActivityIndicator color={Colors.bg} />
                  : <Text style={styles.botaoAcaoText}>Confirmar Voto {label}</Text>
                }
              </TouchableOpacity>
            )}
            {isAdmin && (
              <>
                {erroAcao !== '' && <Text style={styles.erroText}>{erroAcao}</Text>}
                <TouchableOpacity
                  style={[styles.botaoSecundario, { borderColor: cor }]}
                  onPress={() => encerrar(tipo)}
                  disabled={!!isLoadingClose}
                >
                  {isLoadingClose
                    ? <ActivityIndicator color={cor} />
                    : <Text style={[styles.botaoSecundarioText, { color: cor }]}>Encerrar {label}</Text>
                  }
                </TouchableOpacity>
              </>
            )}
          </>
        )}

        {/* ENCERRADA por empate */}
        {round.status === 'ENCERRADA' && (
          <Text style={styles.encerradaText}>Rodada encerrada por empate — nova rodada aberta.</Text>
        )}
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
          onRefresh={() => { setAtualizando(true); carregar(true); }}
          tintColor={Colors.primary}
        />
      }
    >
      {podeAbrirVotacao && (
        <TouchableOpacity
          style={styles.botaoAbrir}
          onPress={abrirVotacao}
          disabled={!!loadingTipo['open']}
        >
          {loadingTipo['open']
            ? <ActivityIndicator color={Colors.bg} />
            : <Text style={styles.botaoAbrirText}>Abrir Votação (MVP + Bola Murcha)</Text>
          }
        </TouchableOpacity>
      )}

      {!isAdmin && semVotacao && (
        <View style={styles.center}>
          <Text style={styles.infoText}>A votação ainda não foi aberta pelo admin.</Text>
        </View>
      )}

      {erroTipo['open'] !== '' && erroTipo['open'] !== undefined && (
        <Text style={styles.erroText}>{erroTipo['open']}</Text>
      )}

      {voteStatus && (
        <>
          {renderSecao(voteStatus.mvp, 'MVP')}
          {renderSecao(voteStatus.bolaMurcha, 'BOLA_MURCHA')}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.md, gap: Spacing.md },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },

  botaoAbrir: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botaoAbrirText: { color: Colors.bg, fontWeight: 'bold', fontSize: FontSize.md },

  secao: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  secaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  secaoTitulo: { fontSize: FontSize.md, fontWeight: '800', letterSpacing: 0.3 },
  statusBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  statusText: { fontSize: FontSize.xs, fontWeight: '700' },

  candidatoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface2,
    borderRadius: 8,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  avatarSmallText: { fontWeight: '900', fontSize: FontSize.sm },
  candidatoInfo: { flex: 1, marginRight: Spacing.sm },
  candidatoNome: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '600', marginBottom: 4 },
  barraFundoSmall: {
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barraFillSmall: { height: 3, borderRadius: 2 },
  votosNum: { fontSize: FontSize.sm, fontWeight: '800', minWidth: 20, textAlign: 'right' },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.border,
    marginLeft: Spacing.sm,
  },

  vencedorCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  trofeu: { fontSize: 40, marginBottom: 4 },
  vencedorNome: { fontSize: FontSize.xl, fontWeight: '900', letterSpacing: 1 },
  vencedorLabel: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: 4 },

  provisorioCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  provisorioLabel: { fontSize: FontSize.sm, fontWeight: '700' },

  botaoAcao: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  botaoAcaoText: { color: Colors.bg, fontWeight: 'bold', fontSize: FontSize.sm },

  botaoSecundario: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  botaoSecundarioText: { fontWeight: 'bold', fontSize: FontSize.sm },

  encerradaText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  infoText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  erroText: {
    color: Colors.danger,
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
});
