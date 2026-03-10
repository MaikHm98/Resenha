import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import api from '../api/api';
import { AppStackParamList } from '../navigation/AppNavigator';
import { Colors, FontSize, Radius, Spacing, Typography } from '../theme';
import { Match } from '../types';

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
  EM_ANDAMENTO: Colors.gold,
  FINALIZADA: Colors.textMuted,
  CANCELADA: Colors.danger,
};

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

function formatDate(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${date} - ${time}`;
}

export default function GroupDashboardScreen({ navigation, route }: Props) {
  const { groupId, groupName, isAdmin, diaSemana, horarioFixo, limiteJogadores } = route.params;
  const [isAdminAtual, setIsAdminAtual] = useState(isAdmin);
  const [diaSemanaAtual, setDiaSemanaAtual] = useState<number | undefined>(diaSemana);
  const [horarioFixoAtual, setHorarioFixoAtual] = useState(horarioFixo ?? '');
  const [partidas, setPartidas] = useState<Match[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState('');

  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
  const [loadingAusenteIds, setLoadingAusenteIds] = useState<Set<number>>(new Set());
  const [deletingMatchIds, setDeletingMatchIds] = useState<Set<number>>(new Set());
  const [showAusentes, setShowAusentes] = useState<Record<number, boolean>>({});
  const [captainStatus, setCaptainStatus] = useState<{ nomeCapitao: string; nomeDesafiante?: string } | null>(null);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editDia, setEditDia] = useState<number | undefined>(diaSemanaAtual);
  const [editHorario, setEditHorario] = useState(horarioFixoAtual);
  const [savingSchedule, setSavingSchedule] = useState(false);

  async function carregarPartidas(silencioso = false) {
    if (!silencioso) setCarregando(true);
    setErro('');
    try {
      const [resPartidas, resCap] = await Promise.allSettled([
        api.get(`/api/groups/${groupId}/matches`),
        api.get(`/api/groups/${groupId}/captain`),
      ]);

      if (resPartidas.status === 'fulfilled') setPartidas(resPartidas.value.data);
      if (resCap.status === 'fulfilled') setCaptainStatus(resCap.value.data);
      else setCaptainStatus(null);
      const myGroups = await api.get('/api/groups/me');
      const meuGrupo = (myGroups.data as any[]).find((g) => g.idGrupo === groupId);
      setIsAdminAtual(String(meuGrupo?.perfil ?? '').toUpperCase() === 'ADMIN');
      setDiaSemanaAtual(meuGrupo?.diaSemana ?? undefined);
      setHorarioFixoAtual(meuGrupo?.horarioFixo ?? '');
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Nao foi possivel carregar os dados do grupo.');
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
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Nao foi possivel atualizar sua presenca.');
      await carregarPartidas(true);
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(partida.idPartida);
        return next;
      });
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
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Nao foi possivel atualizar ausencia.');
      await carregarPartidas(true);
    } finally {
      setLoadingAusenteIds((prev) => {
        const next = new Set(prev);
        next.delete(partida.idPartida);
        return next;
      });
    }
  }

  async function handleSaveSchedule() {
    setSavingSchedule(true);
    setErro('');
    try {
      await api.patch(`/api/groups/${groupId}/schedule`, {
        diaSemana: editDia ?? null,
        horarioFixo: editHorario.trim() || null,
      });
      setDiaSemanaAtual(editDia);
      setHorarioFixoAtual(editHorario.trim());
      setShowScheduleModal(false);
      await carregarPartidas(true);
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Nao foi possivel atualizar o horario.');
    } finally {
      setSavingSchedule(false);
    }
  }

  function confirmDeleteMatch(partida: Match) {
    Alert.alert(
      'Excluir partida',
      'Essa acao remove a partida e os dados relacionados. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => handleDeleteMatch(partida.idPartida),
        },
      ]
    );
  }

  async function handleDeleteMatch(matchId: number) {
    if (deletingMatchIds.has(matchId)) return;

    setDeletingMatchIds((prev) => new Set(prev).add(matchId));
    setErro('');
    try {
      await api.delete(`/api/matches/${matchId}`);
      await carregarPartidas(true);
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Nao foi possivel excluir a partida.');
    } finally {
      setDeletingMatchIds((prev) => {
        const next = new Set(prev);
        next.delete(matchId);
        return next;
      });
    }
  }

  function renderToolbar() {
    return (
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.toolbarContent}
        data={[
          { key: 'classification', label: 'Classificacao', icon: 'bar-chart-outline' as const },
          { key: 'captain', label: 'Capitao', icon: 'shield-outline' as const },
          { key: 'my-performance', label: 'Desempenho', icon: 'pulse-outline' as const },
          { key: 'schedule', label: 'Horario', icon: 'time-outline' as const },
          { key: 'members', label: 'Jogadores', icon: 'people-outline' as const },
          ...(isAdminAtual ? [{ key: 'new-match', label: 'Partida', icon: 'add-circle-outline' as const }] : []),
        ]}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.toolbarButton, item.key === 'new-match' && styles.toolbarButtonPrimary]}
            onPress={() => {
              if (item.key === 'classification') {
                navigation.navigate('Classification', { groupId });
              } else if (item.key === 'captain') {
                navigation.navigate('Captain', { groupId, isAdmin: isAdminAtual });
              } else if (item.key === 'my-performance') {
                navigation.navigate('MyPerformance', { groupId });
              } else if (item.key === 'schedule') {
                setEditDia(diaSemanaAtual);
                setEditHorario(horarioFixoAtual);
                setShowScheduleModal(true);
              } else if (item.key === 'members') {
                navigation.navigate('ManageMembers', { groupId, groupName, isAdmin: isAdminAtual });
              } else if (item.key === 'new-match') {
                navigation.navigate('CreateMatch', {
                  groupId,
                  limiteGrupo: limiteJogadores,
                  diaSemana: diaSemanaAtual,
                  horarioFixo: horarioFixoAtual || undefined,
                });
              }
            }}
          >
            <Ionicons
              name={item.icon}
              size={16}
              color={item.key === 'new-match' ? Colors.bg : Colors.textMuted}
            />
            <Text style={[styles.toolbarButtonText, item.key === 'new-match' && styles.toolbarButtonTextPrimary]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />
    );
  }

  function renderCaptainBanner() {
    if (!captainStatus) return null;
    const hasDesafiante = !!captainStatus.nomeDesafiante;
    return (
      <View style={[styles.captainBanner, hasDesafiante ? styles.captainBannerAlert : styles.captainBannerInfo]}>
        <View style={styles.captainBannerHeader}>
          <Ionicons name={hasDesafiante ? 'flash-outline' : 'ribbon-outline'} size={16} color={Colors.textMuted} />
          <Text style={styles.captainBannerLabel}>
            {hasDesafiante ? 'Desafio em andamento' : 'Capitao atual'}
          </Text>
        </View>
        <Text style={styles.captainBannerText}>
          {captainStatus.nomeCapitao}
          {'  x  '}
          {captainStatus.nomeDesafiante ?? 'Desafio nao lancado'}
        </Text>
      </View>
    );
  }

  function renderPartida({ item }: { item: Match }) {
    const isLoadingConfirm = loadingIds.has(item.idPartida);
    const isLoadingAusente = loadingAusenteIds.has(item.idPartida);
    const isDeleting = deletingMatchIds.has(item.idPartida);
    const podeConfirmar = item.status === 'ABERTA' && (!item.limiteCheio || item.usuarioConfirmado);
    const progress = Math.min(100, (item.totalConfirmados / item.limiteVagas) * 100);
    const vagasColor = item.usuarioConfirmado
      ? Colors.success
      : item.limiteCheio
      ? Colors.danger
      : Colors.primary;

    const goleiros = item.confirmados.filter((c) => c.goleiro);
    const linha = item.confirmados.filter((c) => !c.goleiro);
    const totalAusentes = item.ausentesNomes.length + item.naoConfirmaramNomes.length;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardDateWrap}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.cardDate}>{formatDate(item.dataHoraJogo)}</Text>
          </View>
          <View style={styles.cardHeaderRight}>
            <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLOR[item.status]}22` }]}>
              <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>
                {STATUS_LABEL[item.status]}
              </Text>
            </View>
            {isAdminAtual && (
              <TouchableOpacity
                style={[styles.deleteMatchButton, isDeleting && { opacity: 0.7 }]}
                onPress={() => confirmDeleteMatch(item)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={Colors.danger} />
                ) : (
                  <Ionicons name="trash-outline" size={14} color={Colors.danger} />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {(item.status === 'ABERTA' || item.status === 'EM_ANDAMENTO') && (
          <>
            <View style={styles.presencaHeader}>
              <Text style={[styles.presencaCount, { color: vagasColor }]}>
                {item.totalConfirmados}/{item.limiteVagas} confirmados
              </Text>
              {item.usuarioConfirmado && (
                <Text style={styles.presencaTagOk}>Voce confirmou</Text>
              )}
              {item.usuarioAusente && !item.usuarioConfirmado && (
                <Text style={styles.presencaTagOff}>Voce marcou ausencia</Text>
              )}
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: vagasColor }]} />
            </View>

            {item.confirmados.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Lista de presenca</Text>
                {goleiros.length > 0 && (
                  <>
                    <Text style={styles.sectionSubtitle}>Goleiros</Text>
                    {goleiros.map((c, i) => (
                      <Text key={`g${i}`} style={styles.listItem}>
                        {i + 1}. {c.nome}
                      </Text>
                    ))}
                  </>
                )}
                {linha.length > 0 && (
                  <>
                    <Text style={styles.sectionSubtitle}>Jogadores de linha</Text>
                    {linha.map((c, i) => (
                      <Text key={`l${i}`} style={styles.listItem}>
                        {goleiros.length + i + 1}. {c.nome}
                      </Text>
                    ))}
                  </>
                )}
                {item.status === 'ABERTA' && goleiros.length === 1 && (
                  <Text style={styles.warningText}>Apenas 1 goleiro confirmado.</Text>
                )}
              </View>
            )}

            {totalAusentes > 0 && (
              <View style={styles.section}>
                <TouchableOpacity
                  onPress={() => setShowAusentes((prev) => ({ ...prev, [item.idPartida]: !prev[item.idPartida] }))}
                  style={styles.toggleAusentesButton}
                >
                  <Text style={styles.toggleAusentesText}>
                    {showAusentes[item.idPartida] ? 'Ocultar' : 'Mostrar'} ausentes ({totalAusentes})
                  </Text>
                </TouchableOpacity>
                {showAusentes[item.idPartida] && (
                  <>
                    {item.ausentesNomes.map((nome, i) => (
                      <Text key={`a${i}`} style={[styles.listItem, styles.listItemMuted]}>
                        Ausente: {nome}
                      </Text>
                    ))}
                    {item.naoConfirmaramNomes.map((nome, i) => (
                      <Text key={`n${i}`} style={[styles.listItem, styles.listItemMuted]}>
                        Sem resposta: {nome}
                      </Text>
                    ))}
                  </>
                )}
              </View>
            )}

            {!!item.observacao && <Text style={styles.observation}>{item.observacao}</Text>}

            {item.status === 'ABERTA' && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    item.usuarioConfirmado ? styles.actionButtonSuccess : styles.actionButtonOutline,
                    (!podeConfirmar && !item.usuarioConfirmado) && styles.actionDisabled,
                  ]}
                  onPress={() => handlePresenca(item)}
                  disabled={isLoadingConfirm || isLoadingAusente || (!podeConfirmar && !item.usuarioConfirmado)}
                >
                  {isLoadingConfirm ? (
                    <ActivityIndicator size="small" color={item.usuarioConfirmado ? Colors.bg : Colors.text} />
                  ) : (
                    <Text style={[styles.actionText, !item.usuarioConfirmado && styles.actionTextOutline]}>
                      {item.usuarioConfirmado ? 'Confirmado' : item.limiteCheio ? 'Lista cheia' : 'Confirmar'}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    item.usuarioAusente ? styles.actionButtonDanger : styles.actionButtonOutline,
                    item.usuarioConfirmado && styles.actionDisabled,
                  ]}
                  onPress={() => handleAusente(item)}
                  disabled={isLoadingConfirm || isLoadingAusente || item.usuarioConfirmado}
                >
                  {isLoadingAusente ? (
                    <ActivityIndicator size="small" color={item.usuarioAusente ? Colors.bg : Colors.text} />
                  ) : (
                    <Text style={[styles.actionText, !item.usuarioAusente && styles.actionTextOutline]}>
                      Marcar ausencia
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {item.status === 'FINALIZADA' && (
          <>
            {item.nomeCapitaoVencedor && item.jogadoresVencedores.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.winnerTitle}>Vitoria do time de {item.nomeCapitaoVencedor}</Text>
                {item.jogadoresVencedores.map((nome, i) => (
                  <Text key={`w${i}`} style={styles.listItem}>
                    {nome}
                  </Text>
                ))}
              </View>
            ) : (
              <Text style={styles.observation}>Resultado nao disponivel.</Text>
            )}

            <TouchableOpacity
              style={styles.voteButton}
              onPress={() => navigation.navigate('Vote', { matchId: item.idPartida, isAdmin: isAdminAtual })}
            >
              <Ionicons name="trophy-outline" size={16} color={Colors.gold} />
              <Text style={styles.voteButtonText}>Votacao</Text>
            </TouchableOpacity>
          </>
        )}

        {item.status === 'CANCELADA' && <Text style={styles.cancelledText}>Partida cancelada.</Text>}
      </View>
    );
  }

  function renderHeader() {
    return (
      <View style={styles.headerBlock}>
        {renderToolbar()}
        {erro !== '' && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={14} color={Colors.danger} />
            <Text style={styles.errorText}>{erro}</Text>
          </View>
        )}
        {renderCaptainBanner()}
      </View>
    );
  }

  function renderEmpty() {
    return (
      <View style={styles.emptyWrap}>
        <Ionicons name="calendar-clear-outline" size={36} color={Colors.textMuted} />
        <Text style={styles.emptyTitle}>Nenhuma partida cadastrada</Text>
        <Text style={styles.emptySubtitle}>
          {isAdminAtual ? 'Crie a primeira partida do grupo.' : 'Aguarde o admin criar uma partida.'}
        </Text>
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
      <FlatList
        data={partidas}
        keyExtractor={(item) => String(item.idPartida)}
        renderItem={renderPartida}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={() => {
              setAtualizando(true);
              carregarPartidas(true);
            }}
            tintColor={Colors.primary}
          />
        }
      />

      <Modal visible={showScheduleModal} transparent animationType="fade" onRequestClose={() => setShowScheduleModal(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Horario fixo do grupo</Text>
            {!isAdminAtual && <Text style={styles.readOnlyHint}>Somente o admin pode alterar este horario.</Text>}
            <Text style={styles.modalLabel}>Dia da semana</Text>
            <View style={styles.daysWrap}>
              {DAYS.map((d, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.dayButton, editDia === i && styles.dayButtonActive]}
                  disabled={!isAdminAtual}
                  onPress={() => setEditDia(editDia === i ? undefined : i)}
                >
                  <Text style={[styles.dayButtonText, editDia === i && styles.dayButtonTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Horario (HH:MM)</Text>
            <View style={styles.modalInputWrap}>
              <Ionicons name="time-outline" size={16} color={Colors.textMuted} />
              <TextInput
                style={styles.modalInput}
                value={editHorario}
                onChangeText={setEditHorario}
                placeholder="19:00"
                placeholderTextColor={Colors.textMuted}
                editable={isAdminAtual}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
                autoCorrect={false}
                autoComplete="off"
                textContentType="none"
                keyboardAppearance={Platform.OS === 'ios' ? 'default' : undefined}
                returnKeyType="done"
                onSubmitEditing={isAdminAtual ? handleSaveSchedule : undefined}
              />
            </View>

            <View style={styles.modalActions}>
              {isAdminAtual ? (
                <>
                  <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowScheduleModal(false)}>
                    <Text style={styles.modalCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalSaveButton} onPress={handleSaveSchedule} disabled={savingSchedule}>
                    {savingSchedule ? (
                      <ActivityIndicator size="small" color={Colors.bg} />
                    ) : (
                      <Text style={styles.modalSaveText}>Salvar</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={styles.modalCancelButtonFull} onPress={() => setShowScheduleModal(false)}>
                  <Text style={styles.modalCancelText}>Fechar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: Spacing.md, paddingBottom: Spacing.xl },
  headerBlock: { marginBottom: Spacing.sm },

  toolbarContent: { gap: Spacing.sm, paddingBottom: Spacing.sm },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  toolbarButtonPrimary: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  toolbarButtonText: { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: '700' },
  toolbarButtonTextPrimary: { color: Colors.bg },

  errorBox: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: `${Colors.danger}66`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
  },
  errorText: { color: Colors.danger, fontSize: FontSize.sm, flex: 1 },

  captainBanner: {
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  captainBannerInfo: { borderColor: `${Colors.gold}66` },
  captainBannerAlert: { borderColor: `${Colors.danger}66` },
  captainBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  captainBannerLabel: { ...Typography.label, marginBottom: 0 },
  captainBannerText: { color: Colors.text, fontWeight: '700', fontSize: FontSize.sm },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  cardDateWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  cardDate: { color: Colors.text, fontWeight: '600', fontSize: FontSize.sm, flexShrink: 1 },
  statusBadge: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  cardHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusText: { fontSize: FontSize.xs, fontWeight: '800' },
  deleteMatchButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${Colors.danger}66`,
    backgroundColor: `${Colors.danger}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },

  presencaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  presencaCount: { fontSize: FontSize.sm, fontWeight: '800' },
  presencaTagOk: { color: Colors.success, fontSize: FontSize.xs, fontWeight: '700' },
  presencaTagOff: { color: Colors.danger, fontSize: FontSize.xs, fontWeight: '700' },
  progressTrack: {
    height: 5,
    backgroundColor: Colors.border,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: { height: 5, borderRadius: Radius.sm },

  section: { marginBottom: Spacing.sm },
  sectionTitle: { ...Typography.label, color: Colors.primary, marginBottom: 4 },
  sectionSubtitle: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '700', marginBottom: 4, marginTop: 6 },
  listItem: {
    color: Colors.text,
    fontSize: FontSize.sm,
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  listItemMuted: { color: Colors.textMuted, fontStyle: 'italic' },
  warningText: { color: Colors.gold, fontSize: FontSize.xs, marginTop: 6, fontWeight: '700' },

  toggleAusentesButton: { paddingVertical: 4 },
  toggleAusentesText: { color: Colors.textMuted, fontWeight: '700', fontSize: FontSize.xs },

  observation: { color: Colors.textMuted, fontSize: FontSize.xs, fontStyle: 'italic', marginBottom: Spacing.sm },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: 2 },
  actionButton: {
    flex: 1,
    borderRadius: Radius.md,
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonSuccess: { backgroundColor: Colors.success, borderColor: Colors.success },
  actionButtonDanger: { backgroundColor: Colors.danger, borderColor: Colors.danger },
  actionButtonOutline: { backgroundColor: 'transparent' },
  actionDisabled: { opacity: 0.4 },
  actionText: { color: Colors.bg, fontWeight: '800', fontSize: FontSize.sm },
  actionTextOutline: { color: Colors.text },

  winnerTitle: { color: Colors.gold, fontSize: FontSize.sm, fontWeight: '800', marginBottom: 6 },
  voteButton: {
    marginTop: 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.gold,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  voteButtonText: { color: Colors.gold, fontSize: FontSize.sm, fontWeight: '800' },
  cancelledText: { color: Colors.danger, fontSize: FontSize.sm, fontWeight: '700' },

  emptyWrap: {
    marginTop: Spacing.xl,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    gap: 6,
  },
  emptyTitle: { ...Typography.title, fontSize: FontSize.lg, textAlign: 'center' },
  emptySubtitle: { ...Typography.subtitle, textAlign: 'center' },

  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  modalTitle: { ...Typography.title, fontSize: FontSize.lg, marginBottom: Spacing.md, textAlign: 'center' },
  readOnlyHint: { color: Colors.textMuted, fontSize: FontSize.xs, textAlign: 'center', marginBottom: Spacing.sm },
  modalLabel: { ...Typography.label, marginBottom: 6 },
  daysWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.md },
  dayButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  dayButtonActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  dayButtonText: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '700' },
  dayButtonTextActive: { color: Colors.bg },
  modalInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modalInput: { flex: 1, color: Colors.text, fontSize: FontSize.md, paddingVertical: 12 },
  modalActions: { flexDirection: 'row', gap: Spacing.sm },
  modalCancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelButtonFull: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Colors.surface2,
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: { color: Colors.textMuted, fontWeight: '700', fontSize: FontSize.sm },
  modalSaveText: { color: Colors.bg, fontWeight: '800', fontSize: FontSize.sm },
});
