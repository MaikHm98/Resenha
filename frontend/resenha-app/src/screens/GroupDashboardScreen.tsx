import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import api from '../api/api';
import { Colors, FontSize, Spacing } from '../theme';
import { Match } from '../types';
import { AppStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'GroupDashboard'>;
  route: RouteProp<AppStackParamList, 'GroupDashboard'>;
};

const STATUS_LABEL: Record<Match['status'], string> = {
  ABERTA: 'ABERTA',
  EM_ANDAMENTO: 'EM ANDAMENTO',
  FINALIZADA: 'FINALIZADA',
  CANCELADA: 'CANCELADA',
};

const STATUS_COLOR: Record<Match['status'], string> = {
  ABERTA: Colors.success,
  EM_ANDAMENTO: '#ffd700',
  FINALIZADA: Colors.textMuted,
  CANCELADA: Colors.danger,
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }) + ' · ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function GroupDashboardScreen({ navigation, route }: Props) {
  const { groupId, isAdmin } = route.params;
  const [partidas, setPartidas] = useState<Match[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
  const [loadingAusenteIds, setLoadingAusenteIds] = useState<Set<number>>(new Set());
  const [showAusentes, setShowAusentes] = useState<Record<number, boolean>>({});

  async function carregarPartidas(silencioso = false) {
    if (!silencioso) setCarregando(true);
    try {
      const res = await api.get(`/api/groups/${groupId}/matches`);
      setPartidas(res.data);
    } catch {
      // mantém lista vazia
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregarPartidas();
    }, [groupId])
  );

  async function handlePresenca(partida: Match) {
    if (loadingIds.has(partida.idPartida)) return;
    setLoadingIds((prev) => new Set(prev).add(partida.idPartida));
    try {
      if (partida.usuarioConfirmado) {
        await api.delete(`/api/matches/${partida.idPartida}/confirm`);
      } else {
        await api.post(`/api/matches/${partida.idPartida}/confirm`);
      }
      await carregarPartidas(true);
    } catch {
      carregarPartidas(true);
    } finally {
      setLoadingIds((prev) => { const n = new Set(prev); n.delete(partida.idPartida); return n; });
    }
  }

  async function handleAusente(partida: Match) {
    if (loadingAusenteIds.has(partida.idPartida)) return;
    setLoadingAusenteIds((prev) => new Set(prev).add(partida.idPartida));
    try {
      if (partida.usuarioAusente) {
        await api.delete(`/api/matches/${partida.idPartida}/absent`);
      } else {
        await api.post(`/api/matches/${partida.idPartida}/absent`);
      }
      await carregarPartidas(true);
    } catch {
      carregarPartidas(true);
    } finally {
      setLoadingAusenteIds((prev) => { const n = new Set(prev); n.delete(partida.idPartida); return n; });
    }
  }

  function renderPartida({ item }: { item: Match }) {
    const isLoadingConfirm = loadingIds.has(item.idPartida);
    const isLoadingAusente = loadingAusenteIds.has(item.idPartida);
    const podeConfirmar = item.status === 'ABERTA' && (!item.limiteCheio || item.usuarioConfirmado);

    const vagasColor = item.usuarioConfirmado
      ? Colors.success
      : item.limiteCheio
      ? Colors.danger
      : Colors.primary;

    return (
      <View style={styles.card}>
        {/* Cabeçalho: data + badge status */}
        <View style={styles.cardHeader}>
          <Text style={styles.dataText}>{formatDate(item.dataHoraJogo)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] + '22', borderColor: STATUS_COLOR[item.status] }]}>
            <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>
              {STATUS_LABEL[item.status]}
            </Text>
          </View>
        </View>

        {/* ── PARTIDA ABERTA / EM ANDAMENTO ─────────────────────── */}
        {(item.status === 'ABERTA' || item.status === 'EM_ANDAMENTO') && (
          <>
            {/* Vagas */}
            <View style={styles.vagasRow}>
              <Text style={[styles.vagasText, { color: vagasColor }]}>
                {item.totalConfirmados}/{item.limiteVagas} confirmados
              </Text>
              {item.usuarioConfirmado && <Text style={styles.confirmadoTag}>✓ você confirmou</Text>}
              {item.usuarioAusente    && <Text style={styles.ausenteTag}>✗ você está ausente</Text>}
            </View>

            {/* Barra de progresso */}
            <View style={styles.barraFundo}>
              <View style={[styles.barraPreenchimento, {
                width: `${Math.min(100, (item.totalConfirmados / item.limiteVagas) * 100)}%` as any,
                backgroundColor: vagasColor,
              }]} />
            </View>

            {/* Lista de presença com seções goleiro / linha */}
            {item.confirmados.length > 0 && (
              <View style={styles.listaSection}>
                <Text style={styles.listaTitulo}>Lista de presença</Text>
                {(() => {
                  const goleiros = item.confirmados.filter(c => c.goleiro);
                  const linha    = item.confirmados.filter(c => !c.goleiro);
                  return (
                    <>
                      {goleiros.length > 0 && (
                        <>
                          <Text style={styles.posicaoLabel}>🧤 Goleiros</Text>
                          {goleiros.map((c, i) => (
                            <Text key={i} style={styles.listaItem}>{i + 1} - {c.nome}</Text>
                          ))}
                        </>
                      )}
                      {linha.length > 0 && (
                        <>
                          <Text style={styles.posicaoLabel}>⚽ Jogadores de Linha</Text>
                          {linha.map((c, i) => (
                            <Text key={i} style={styles.listaItem}>{goleiros.length + i + 1} - {c.nome}</Text>
                          ))}
                        </>
                      )}
                      {item.status === 'ABERTA' && goleiros.length === 1 && (
                        <Text style={styles.alertaGoleiro}>⚠ Apenas 1 goleiro confirmado</Text>
                      )}
                    </>
                  );
                })()}
              </View>
            )}

            {/* Botão Ausentes / Não confirmaram */}
            {(item.ausentesNomes.length > 0 || item.naoConfirmaramNomes.length > 0) && (
              <View style={styles.listaSection}>
                <TouchableOpacity
                  onPress={() => setShowAusentes(p => ({ ...p, [item.idPartida]: !p[item.idPartida] }))}
                  style={styles.botaoAusenteToggle}
                >
                  <Text style={styles.botaoAusenteToggleText}>
                    {showAusentes[item.idPartida] ? '▲ ' : '▼ '}
                    Ausentes ({item.ausentesNomes.length + item.naoConfirmaramNomes.length})
                  </Text>
                </TouchableOpacity>
                {showAusentes[item.idPartida] && (
                  <>
                    {item.ausentesNomes.map((nome, i) => (
                      <Text key={`a${i}`} style={[styles.listaItem, styles.listaItemAusente]}>✗ {nome}</Text>
                    ))}
                    {item.naoConfirmaramNomes.map((nome, i) => (
                      <Text key={`n${i}`} style={[styles.listaItem, styles.listaItemNaoConfirmado]}>? {nome}</Text>
                    ))}
                  </>
                )}
              </View>
            )}

            {/* Observação */}
            {!!item.observacao && (
              <Text style={styles.obs} numberOfLines={2}>{item.observacao}</Text>
            )}

            {/* Botões lado a lado */}
            {item.status === 'ABERTA' && (
              <View style={styles.botoesRow}>
                <TouchableOpacity
                  style={[
                    styles.botaoPresenca,
                    item.usuarioConfirmado ? styles.botaoConfirmarAtivo : styles.botaoConfirmarInativo,
                    (!podeConfirmar && !item.usuarioConfirmado) && styles.botaoDisabled,
                  ]}
                  onPress={() => handlePresenca(item)}
                  disabled={isLoadingConfirm || isLoadingAusente || (!podeConfirmar && !item.usuarioConfirmado)}
                >
                  {isLoadingConfirm
                    ? <ActivityIndicator size="small" color={Colors.bg} />
                    : <Text style={[styles.botaoText, !item.usuarioConfirmado && styles.botaoTextInativo]}>
                        {item.usuarioConfirmado ? '✓ Confirmado' : item.limiteCheio ? 'Lista Cheia' : '✓ Confirmar'}
                      </Text>
                  }
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.botaoPresenca,
                    item.usuarioAusente ? styles.botaoAusenteAtivo : styles.botaoAusenteInativo,
                    item.usuarioConfirmado && styles.botaoDisabled,
                  ]}
                  onPress={() => handleAusente(item)}
                  disabled={isLoadingConfirm || isLoadingAusente || item.usuarioConfirmado}
                >
                  {isLoadingAusente
                    ? <ActivityIndicator size="small" color={Colors.bg} />
                    : <Text style={[styles.botaoText, !item.usuarioAusente && styles.botaoTextInativo]}>
                        ✗ Ausente
                      </Text>
                  }
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* ── PARTIDA FINALIZADA ─────────────────────────────────── */}
        {item.status === 'FINALIZADA' && (
          <>
            {item.nomeCapitaoVencedor && item.jogadoresVencedores.length > 0 ? (
              <View style={styles.listaSection}>
                <Text style={styles.vitoriaTitle}>
                  Vitória do time de {item.nomeCapitaoVencedor}
                </Text>
                {item.jogadoresVencedores.map((nome, i) => (
                  <Text key={i} style={styles.listaItem}>{nome}</Text>
                ))}
              </View>
            ) : (
              <Text style={styles.obs}>Resultado não disponível.</Text>
            )}

            <TouchableOpacity
              style={styles.botaoVotacao}
              onPress={() => navigation.navigate('Vote', { matchId: item.idPartida, isAdmin })}
            >
              <Text style={styles.botaoVotacaoText}>Votação</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ── CANCELADA ─────────────────────────────────────────── */}
        {item.status === 'CANCELADA' && (
          <Text style={[styles.obs, { color: Colors.danger }]}>Partida cancelada.</Text>
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

  return (
    <View style={styles.container}>
      <View style={styles.subHeader}>
        <TouchableOpacity style={styles.botaoRanking} onPress={() => navigation.navigate('Classification', { groupId })}>
          <Text style={styles.botaoRankingText}>Ranking</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoCapitao} onPress={() => navigation.navigate('Captain', { groupId, isAdmin })}>
          <Text style={styles.botaoCapitaoText}>Capitão</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoDesempenho} onPress={() => navigation.navigate('MyPerformance', { groupId })}>
          <Text style={styles.botaoDesempenhoText}>Desempenho</Text>
        </TouchableOpacity>
        {isAdmin && (
          <TouchableOpacity style={styles.botaoNova} onPress={() => navigation.navigate('CreateMatch', { groupId, limiteGrupo: 100 })}>
            <Text style={styles.botaoNovaText}>+ Partida</Text>
          </TouchableOpacity>
        )}
      </View>

      {partidas.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vazioEmoji}>📅</Text>
          <Text style={styles.vazioTitulo}>Nenhuma partida</Text>
          <Text style={styles.vazioSub}>
            {isAdmin ? 'Crie a primeira partida do grupo.' : 'Aguarde o admin criar uma partida.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={partidas}
          keyExtractor={(item) => String(item.idPartida)}
          renderItem={renderPartida}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={() => { setAtualizando(true); carregarPartidas(true); }}
              tintColor={Colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { justifyContent: 'center', alignItems: 'center' },

  subHeader: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  botaoRanking: {
    borderRadius: 8, paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.primary, backgroundColor: 'transparent',
  },
  botaoRankingText: { color: Colors.primary, fontWeight: 'bold', fontSize: FontSize.sm },
  botaoCapitao: {
    borderRadius: 8, paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.gold, backgroundColor: Colors.surface2,
  },
  botaoCapitaoText: { color: Colors.gold, fontWeight: 'bold', fontSize: FontSize.sm },
  botaoDesempenho: {
    borderRadius: 8, paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.textMuted, backgroundColor: 'transparent',
  },
  botaoDesempenhoText: { color: Colors.textMuted, fontWeight: 'bold', fontSize: FontSize.sm },
  botaoNova: {
    borderRadius: 8, paddingHorizontal: Spacing.md, paddingVertical: 8,
    backgroundColor: Colors.primary,
  },
  botaoNovaText: { color: Colors.bg, fontWeight: 'bold', fontSize: FontSize.sm },

  lista: { padding: Spacing.md, gap: Spacing.sm },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  dataText: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '600', flex: 1, marginRight: Spacing.sm },
  statusBadge: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2 },
  statusText: { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.3 },

  vagasRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 6,
  },
  vagasText: { fontSize: FontSize.sm, fontWeight: '700' },
  confirmadoTag: { color: Colors.success, fontSize: FontSize.xs, fontWeight: '600' },
  ausenteTag: { color: Colors.danger, fontSize: FontSize.xs, fontWeight: '600' },

  barraFundo: {
    height: 4, backgroundColor: Colors.border, borderRadius: 2,
    marginBottom: Spacing.sm, overflow: 'hidden',
  },
  barraPreenchimento: { height: 4, borderRadius: 2 },

  listaSection: { marginBottom: Spacing.sm },
  listaTitulo: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  listaItem: {
    color: Colors.text,
    fontSize: FontSize.sm,
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  listaItemAusente: { color: Colors.textMuted, fontStyle: 'italic' },
  listaItemNaoConfirmado: { color: Colors.textMuted, fontStyle: 'italic', opacity: 0.6 },
  posicaoLabel: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 2,
  },
  alertaGoleiro: {
    color: '#ffd700',
    fontSize: FontSize.xs,
    fontStyle: 'italic',
    marginTop: 4,
  },
  botaoAusenteToggle: {
    paddingVertical: 4,
  },
  botaoAusenteToggleText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  vitoriaTitle: {
    color: Colors.gold,
    fontSize: FontSize.sm,
    fontWeight: '800',
    marginBottom: 8,
  },

  obs: { color: Colors.textMuted, fontSize: FontSize.xs, marginBottom: Spacing.sm, fontStyle: 'italic' },

  botoesRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: 4 },
  botaoPresenca: { flex: 1, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  botaoConfirmarAtivo: { backgroundColor: Colors.success },
  botaoConfirmarInativo: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.success },
  botaoAusenteAtivo: { backgroundColor: Colors.danger },
  botaoAusenteInativo: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.border },
  botaoDisabled: { opacity: 0.35 },
  botaoText: { color: Colors.bg, fontWeight: 'bold', fontSize: FontSize.sm },
  botaoTextInativo: { color: Colors.textMuted },

  botaoVotacao: {
    borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 4,
    borderWidth: 1, borderColor: Colors.gold, backgroundColor: 'transparent',
  },
  botaoVotacaoText: { color: Colors.gold, fontWeight: 'bold', fontSize: FontSize.sm },

  vazio: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  vazioEmoji: { fontSize: 48, marginBottom: Spacing.md },
  vazioTitulo: { color: Colors.text, fontSize: FontSize.xl, fontWeight: 'bold', marginBottom: Spacing.sm },
  vazioSub: { color: Colors.textMuted, fontSize: FontSize.sm, textAlign: 'center' },
});
