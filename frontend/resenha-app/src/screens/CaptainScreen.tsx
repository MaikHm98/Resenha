import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import api from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import { Colors, FontSize, Radius, Spacing, Typography, getInitials } from '../theme';
import { CaptainStatus, Match } from '../types';
import { AppStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'Captain'>;
  route: RouteProp<AppStackParamList, 'Captain'>;
};

interface EligiblePlayer {
  idUsuario: number;
  nome: string;
}

export default function CaptainScreen({ route }: Props) {
  const { groupId, isAdmin } = route.params;
  const { user } = useAuth();

  const [status, setStatus] = useState<CaptainStatus | null>(null);
  const [semCiclo, setSemCiclo] = useState(false);
  const [partidaAberta, setPartidaAberta] = useState<Match | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [loadingElegiveis, setLoadingElegiveis] = useState(false);
  const [elegiveis, setElegiveis] = useState<EligiblePlayer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [erro, setErro] = useState('');

  async function carregar(silencioso = false) {
    if (!silencioso) setCarregando(true);
    setErro('');
    try {
      const [captainRes, matchesRes] = await Promise.allSettled([
        api.get(`/api/groups/${groupId}/captain`),
        api.get(`/api/groups/${groupId}/matches`),
      ]);

      if (captainRes.status === 'fulfilled') {
        setStatus(captainRes.value.data);
        setSemCiclo(false);
      } else {
        const msg: string = captainRes.reason?.response?.data?.mensagem ?? '';
        const normalized = msg.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (normalized.includes('nao ha capitao')) {
          setSemCiclo(true);
          setStatus(null);
        } else {
          setErro(msg || 'Erro ao carregar dados do capitao.');
        }
      }

      if (matchesRes.status === 'fulfilled') {
        const matches: Match[] = matchesRes.value.data;
        const aberta = matches.find((m) => m.status === 'ABERTA' || m.status === 'EM_ANDAMENTO') ?? null;
        setPartidaAberta(aberta);
      }
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [groupId])
  );

  async function acao(fn: () => Promise<void>) {
    setActionLoading(true);
    setErro('');
    try {
      await fn();
      await carregar(true);
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Operacao falhou.');
    } finally {
      setActionLoading(false);
    }
  }

  const iniciarCiclo = () => acao(() => api.post(`/api/groups/${groupId}/captain/draw`));
  const registrarResultado = (resultado: 'CAPITAO' | 'DESAFIANTE') =>
    acao(() => api.post(`/api/groups/${groupId}/captain/result`, { resultado }));

  async function handleLancarDesafio() {
    if (!partidaAberta) return;
    setLoadingElegiveis(true);
    setErro('');
    try {
      const res = await api.get(`/api/groups/${groupId}/captain/eligible/${partidaAberta.idPartida}`);
      setElegiveis(res.data);
      setShowModal(true);
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Erro ao buscar jogadores elegiveis.');
    } finally {
      setLoadingElegiveis(false);
    }
  }

  async function handleSelecionarDesafiante(idDesafiante: number) {
    if (!partidaAberta) return;
    setShowModal(false);
    await acao(() =>
      api.post(`/api/groups/${groupId}/captain/challenge`, {
        idDesafiante,
        idPartida: partidaAberta.idPartida,
      })
    );
  }

  const userId = user?.idUsuario;
  const ehCapitao = status ? status.idCapitao === userId : false;
  const ehDesafiante = status ? status.idDesafiante === userId : false;
  const estaBloqueado = status ? status.bloqueados.some((b) => b.idUsuario === userId) : false;
  const temDesafio = !!status?.idDesafiante;

  function renderAcoes() {
    if (actionLoading || loadingElegiveis) {
      return <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.md }} />;
    }

    if (semCiclo) {
      if (!isAdmin) return null;
      return (
        <TouchableOpacity style={styles.primaryButton} onPress={iniciarCiclo}>
          <Ionicons name="shuffle-outline" size={16} color={Colors.bg} />
          <Text style={styles.primaryButtonText}>Iniciar ciclo de capitao</Text>
        </TouchableOpacity>
      );
    }

    if (!status) return null;

    if (temDesafio) {
      if (isAdmin) {
        return (
          <View style={styles.rowActions}>
            <TouchableOpacity style={[styles.halfButton, styles.successButton]} onPress={() => registrarResultado('CAPITAO')}>
              <Text style={styles.primaryButtonText}>Capitao venceu</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.halfButton, styles.goldButton]} onPress={() => registrarResultado('DESAFIANTE')}>
              <Text style={styles.goldButtonText}>Desafiante venceu</Text>
            </TouchableOpacity>
          </View>
        );
      }
      if (ehDesafiante) {
        return <Text style={styles.infoText}>Voce foi escolhido como desafiante. Aguarde o admin registrar o resultado.</Text>;
      }
      return <Text style={styles.infoText}>Desafio em andamento. Aguarde o resultado.</Text>;
    }

    if (ehCapitao) {
      if (!partidaAberta) {
        return <Text style={styles.infoText}>Sem partida aberta no momento. Crie uma partida para lancar o desafio.</Text>;
      }
      const confirmados = partidaAberta.totalConfirmados;
      if (confirmados < 12) {
        return (
          <View style={styles.waitCard}>
            <Text style={styles.waitText}>Aguardando confirmacoes para liberar o desafio</Text>
            <Text style={styles.waitCounter}>{confirmados} / 12 confirmados</Text>
          </View>
        );
      }
      return (
        <TouchableOpacity style={styles.challengeButton} onPress={handleLancarDesafio}>
          <Ionicons name="flash-outline" size={16} color={Colors.bg} />
          <Text style={styles.primaryButtonText}>Lancar desafio ({confirmados} confirmados)</Text>
        </TouchableOpacity>
      );
    }

    if (estaBloqueado) {
      return (
        <Text style={[styles.infoText, { color: Colors.danger }]}>
          Voce ja foi derrotado neste ciclo e nao pode ser desafiante novamente.
        </Text>
      );
    }

    return <Text style={styles.infoText}>Aguarde o capitao escolher o desafiante.</Text>;
  }

  if (carregando) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <>
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
        <View style={styles.cardCaptain}>
          <View style={styles.sectionHeader}>
            <Ionicons name="ribbon-outline" size={16} color={Colors.gold} />
            <Text style={styles.sectionLabel}>Capitao atual</Text>
          </View>
          {semCiclo || !status ? (
            <Text style={styles.emptyText}>Nenhum ciclo iniciado.</Text>
          ) : (
            <View style={styles.profileRow}>
              <View style={[styles.avatar, { backgroundColor: Colors.gold }]}>
                <Text style={styles.avatarText}>{getInitials(status.nomeCapitao)}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{status.nomeCapitao.toUpperCase()}</Text>
                <Text style={styles.profileMeta}>
                  Desde {new Date(status.iniciadoEm).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              <Ionicons name="star" size={20} color={Colors.gold} />
            </View>
          )}
        </View>

        {status && (
          <View style={styles.cardChallenger}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flash-outline" size={16} color={Colors.danger} />
              <Text style={styles.sectionLabel}>Capitao 2</Text>
            </View>
            {temDesafio && status.nomeDesafiante ? (
              <View style={styles.profileRow}>
                <View style={[styles.avatar, { backgroundColor: Colors.danger }]}>
                  <Text style={styles.avatarText}>{getInitials(status.nomeDesafiante)}</Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{status.nomeDesafiante.toUpperCase()}</Text>
                  <Text style={[styles.profileMeta, { color: Colors.danger }]}>Desafio pendente</Text>
                </View>
                <Ionicons name="flash" size={20} color={Colors.danger} />
              </View>
            ) : (
              <Text style={styles.emptyText}>O capitao ainda nao escolheu o desafiante.</Text>
            )}
          </View>
        )}

        {status && status.bloqueados.length > 0 && (
          <View style={styles.blockedCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="close-circle-outline" size={16} color={Colors.danger} />
              <Text style={styles.sectionLabel}>Ja derrotados ({status.bloqueados.length})</Text>
            </View>
            <View style={styles.chipWrap}>
              {status.bloqueados.map((b) => (
                <View key={b.idUsuario} style={styles.chip}>
                  <Text style={styles.chipText}>{b.nome}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {erro !== '' && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={14} color={Colors.danger} />
            <Text style={styles.errorText}>{erro}</Text>
          </View>
        )}

        <View style={styles.actionsWrap}>{renderAcoes()}</View>
      </ScrollView>

      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Escolher desafiante</Text>
            <Text style={styles.modalSubtitle}>Selecione um jogador confirmado na partida atual.</Text>

            {elegiveis.length === 0 ? (
              <Text style={styles.infoText}>Nenhum jogador elegivel encontrado.</Text>
            ) : (
              <FlatList
                data={elegiveis}
                keyExtractor={(item) => String(item.idUsuario)}
                style={styles.eligibleList}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.eligibleItem} onPress={() => handleSelecionarDesafiante(item.idUsuario)}>
                    <View style={styles.eligibleAvatar}>
                      <Text style={styles.eligibleAvatarText}>{getInitials(item.nome)}</Text>
                    </View>
                    <Text style={styles.eligibleName}>{item.nome}</Text>
                    <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
                  </TouchableOpacity>
                )}
              />
            )}

            <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowModal(false)}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.xl },
  center: { justifyContent: 'center', alignItems: 'center' },

  cardCaptain: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: `${Colors.gold}66`,
    padding: Spacing.md,
  },
  cardChallenger: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: `${Colors.danger}55`,
    padding: Spacing.md,
  },
  blockedCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  sectionLabel: { ...Typography.label, marginBottom: 0 },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.sm, fontStyle: 'italic' },

  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  avatarText: { color: Colors.bg, fontWeight: '900', fontSize: FontSize.md },
  profileInfo: { flex: 1 },
  profileName: { color: Colors.text, fontSize: FontSize.md, fontWeight: '800', letterSpacing: 0.4 },
  profileMeta: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  chip: {
    backgroundColor: Colors.surface2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: `${Colors.danger}55`,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: { color: Colors.danger, fontSize: FontSize.xs, fontWeight: '700' },

  errorBox: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: `${Colors.danger}66`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  errorText: { color: Colors.danger, fontSize: FontSize.sm, flex: 1 },

  infoText: { color: Colors.textMuted, fontSize: FontSize.sm, textAlign: 'center', fontStyle: 'italic' },
  waitCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    alignItems: 'center',
  },
  waitText: { color: Colors.textMuted, fontSize: FontSize.sm, marginBottom: 6, textAlign: 'center' },
  waitCounter: { color: Colors.primary, fontWeight: '900', fontSize: FontSize.lg },

  actionsWrap: { marginTop: Spacing.sm },
  rowActions: { flexDirection: 'row', gap: Spacing.sm },
  primaryButton: {
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  challengeButton: {
    borderRadius: Radius.md,
    backgroundColor: Colors.danger,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  halfButton: {
    flex: 1,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  successButton: { backgroundColor: Colors.success },
  goldButton: { backgroundColor: Colors.gold },
  primaryButtonText: { color: Colors.bg, fontSize: FontSize.md, fontWeight: '800' },
  goldButtonText: { color: '#0d0d1a', fontSize: FontSize.md, fontWeight: '800' },

  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalCard: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  modalTitle: { ...Typography.title, fontSize: FontSize.lg, marginBottom: 2, textAlign: 'center' },
  modalSubtitle: { ...Typography.subtitle, textAlign: 'center', marginBottom: Spacing.md },
  eligibleList: { maxHeight: 320 },
  eligibleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 12,
    gap: Spacing.sm,
  },
  eligibleAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface2,
  },
  eligibleAvatarText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '800' },
  eligibleName: { flex: 1, color: Colors.text, fontSize: FontSize.md, fontWeight: '600' },
  modalCancelButton: {
    marginTop: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: { color: Colors.textMuted, fontWeight: '700', fontSize: FontSize.sm },
});
