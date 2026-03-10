import React, { useCallback, useState } from 'react';
import {
  Alert,
  View,
  Text,
  FlatList,
  Platform,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import { Colors, FontSize, Radius, Spacing, Typography, gradients } from '../theme';
import { Group, PendingGroupInvite } from '../types';
import { AppStackParamList } from '../navigation/AppNavigator';
import FeedbackBanner from '../components/FeedbackBanner';
import ClubLogo from '../components/ClubLogo';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const [grupos, setGrupos] = useState<Group[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [convitesPendentes, setConvitesPendentes] = useState<PendingGroupInvite[]>([]);
  const [loadingInviteIds, setLoadingInviteIds] = useState<Set<number>>(new Set());

  async function carregarGrupos(silencioso = false) {
    if (!silencioso) setCarregando(true);
    setErro('');
    try {
      const [groupsResponse, invitesResponse] = await Promise.all([
        api.get('/api/groups/me'),
        api.get('/api/groups/invites/pending'),
      ]);
      setGrupos(groupsResponse.data);
      setConvitesPendentes(invitesResponse.data);

      const flashWarning = await AsyncStorage.getItem('@resenha:flash_warning');
      if (flashWarning) {
        setAviso(flashWarning);
        await AsyncStorage.removeItem('@resenha:flash_warning');
      }
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Nao foi possivel carregar seus grupos.');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  async function handleAcceptInvite(inviteId: number) {
    if (loadingInviteIds.has(inviteId)) return;
    setLoadingInviteIds((prev) => new Set(prev).add(inviteId));
    setErro('');
    try {
      await api.post(`/api/groups/invites/${inviteId}/accept`);
      setAviso('Convite aceito com sucesso.');
      await carregarGrupos(true);
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Nao foi possivel aceitar o convite.');
    } finally {
      setLoadingInviteIds((prev) => {
        const next = new Set(prev);
        next.delete(inviteId);
        return next;
      });
    }
  }

  async function handleRejectInvite(inviteId: number) {
    if (loadingInviteIds.has(inviteId)) return;
    setLoadingInviteIds((prev) => new Set(prev).add(inviteId));
    setErro('');
    try {
      await api.post(`/api/groups/invites/${inviteId}/reject`);
      setAviso('Convite recusado.');
      await carregarGrupos(true);
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Nao foi possivel recusar o convite.');
    } finally {
      setLoadingInviteIds((prev) => {
        const next = new Set(prev);
        next.delete(inviteId);
        return next;
      });
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregarGrupos();
    }, [])
  );

  function confirmarExclusaoGrupo(group: Group) {
    const executarExclusao = async () => {
      try {
        await api.delete(`/api/groups/${group.idGrupo}`);
        setAviso(`Grupo "${group.nome}" excluido com sucesso.`);
        await carregarGrupos(true);
      } catch (e: any) {
        setErro(e?.response?.data?.mensagem || 'Nao foi possivel excluir o grupo.');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed =
        typeof window !== 'undefined' &&
        window.confirm(`Deseja excluir o grupo "${group.nome}"? Essa acao nao pode ser desfeita.`);
      if (confirmed) {
        void executarExclusao();
      }
      return;
    }

    Alert.alert('Excluir grupo', `Deseja excluir o grupo "${group.nome}"? Essa acao nao pode ser desfeita.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => void executarExclusao() },
    ]);
  }

  function renderGrupo({ item }: { item: Group }) {
    const isAdmin = String(item.perfil).toUpperCase() === 'ADMIN';

    return (
      <View style={styles.cardWrapper}>
        <LinearGradient
          colors={gradients.surface}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.cardMainPressable}
            onPress={() =>
              navigation.navigate('GroupDashboard', {
                groupId: item.idGrupo,
                groupName: item.nome,
                isAdmin,
                diaSemana: item.diaSemana,
                horarioFixo: item.horarioFixo,
                limiteJogadores: item.limiteJogadores,
              })
            }
          >
            <View style={[styles.badge, { backgroundColor: isAdmin ? Colors.gold : Colors.primarySoft }]}>
              <Text style={[styles.badgeText, { color: isAdmin ? '#0d0d1a' : Colors.text }]}>
                {isAdmin ? 'ADMIN' : 'MEMBRO'}
              </Text>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.groupName} numberOfLines={1}>
                {item.nome.toUpperCase()}
              </Text>
              <View style={styles.membrosRow}>
                <Ionicons name="people-outline" size={12} color={Colors.textMuted} />
                <Text style={styles.membrosText}>
                  {item.totalMembros}/{item.limiteJogadores} jogadores
                </Text>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
          </TouchableOpacity>

          {isAdmin && (
            <TouchableOpacity
              onPress={() => confirmarExclusaoGrupo(item)}
              style={styles.deleteGroupButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={18} color={Colors.danger} />
            </TouchableOpacity>
          )}
        </LinearGradient>
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
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.avatarWrap}>
            <ClubLogo
              uri={user?.timeCoracaoEscudoUrl}
              clubName={user?.timeCoracaoNome ?? user?.nome}
              size={56}
            />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroKicker}>Bem-vindo ao app Resenha</Text>
            <Text style={styles.heroName}>{user?.nome}</Text>
            <Text style={styles.heroSubtitle}>
              {user?.timeCoracaoNome
                ? `Seu escudo em campo hoje: ${user.timeCoracaoNome}.`
                : 'Monte sua resenha, convide a galera e entre em campo.'}
            </Text>
          </View>
        </View>

        <View style={styles.heroActions}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.actionBtn}>
            <Ionicons name="person-circle-outline" size={16} color={Colors.primary} />
            <Text style={styles.actionText}>Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={[styles.actionBtn, styles.actionBtnDanger]}>
            <Ionicons name="log-out-outline" size={16} color={Colors.danger} />
            <Text style={[styles.actionText, { color: Colors.danger }]}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      {erro !== '' && (
        <View style={styles.feedbackWrap}>
          <FeedbackBanner
            variant="error"
            message={erro}
            actionLabel="Tentar novamente"
            onActionPress={() => carregarGrupos()}
          />
        </View>
      )}

      {aviso !== '' && (
        <View style={styles.feedbackWrap}>
          <FeedbackBanner
            variant="warning"
            message={aviso}
            actionLabel="Fechar"
            onActionPress={() => setAviso('')}
          />
        </View>
      )}

      {convitesPendentes.length > 0 && (
        <View style={styles.pendingWrap}>
          <Text style={styles.pendingTitle}>Voce tem convites pendentes</Text>
          {convitesPendentes.map((convite) => {
            const loading = loadingInviteIds.has(convite.idConvite);
            const expiraEm = new Date(convite.expiraEm);
            const expiraTexto = Number.isNaN(expiraEm.getTime())
              ? convite.expiraEm
              : expiraEm.toLocaleString('pt-BR');
            return (
              <View key={String(convite.idConvite)} style={styles.pendingCard}>
                <Text style={styles.pendingGroupName}>{convite.nomeGrupo}</Text>
                <Text style={styles.pendingMeta}>Codigo: {convite.codigoConvite}</Text>
                <Text style={styles.pendingMeta}>Expira em: {expiraTexto}</Text>
                <View style={styles.pendingActions}>
                  <TouchableOpacity
                    style={[styles.pendingButton, styles.pendingButtonAccept]}
                    onPress={() => handleAcceptInvite(convite.idConvite)}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={Colors.bg} />
                    ) : (
                      <Text style={styles.pendingButtonAcceptText}>Aceitar</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.pendingButton, styles.pendingButtonReject]}
                    onPress={() => handleRejectInvite(convite.idConvite)}
                    disabled={loading}
                  >
                    <Text style={styles.pendingButtonRejectText}>Recusar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {grupos.length === 0 ? (
        <View style={styles.vazio}>
          <View style={styles.ballBadge}>
            <Ionicons name="football-outline" size={38} color={Colors.primary} />
          </View>
          <Text style={styles.vazioTitulo}>Seu vestiario esta vazio</Text>
          <Text style={styles.vazioSub}>
            Crie um grupo para organizar os jogos ou entre com um codigo de convite.
          </Text>

          <TouchableOpacity style={[styles.botaoPrimario, styles.emptyButton]} onPress={() => navigation.navigate('CreateGroup')}>
            <Text style={styles.botaoPrimarioText}>Criar Grupo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.botaoSecundario, styles.emptyButton]} onPress={() => navigation.navigate('JoinGroup')}>
            <Text style={styles.botaoSecundarioText}>Entrar com Codigo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={grupos}
          keyExtractor={(item) => String(item.idGrupo)}
          renderItem={renderGrupo}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={() => {
                setAtualizando(true);
                carregarGrupos(true);
              }}
              tintColor={Colors.primary}
            />
          }
          ListFooterComponent={
            <View style={styles.footerBotoes}>
              <TouchableOpacity style={styles.botaoPrimario} onPress={() => navigation.navigate('CreateGroup')}>
                <Text style={styles.botaoPrimarioText}>Criar Grupo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botaoSecundario} onPress={() => navigation.navigate('JoinGroup')}>
                <Text style={styles.botaoSecundarioText}>Entrar com Codigo</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { justifyContent: 'center', alignItems: 'center' },

  heroCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface2,
  },
  heroText: { flex: 1 },
  heroKicker: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '700', marginBottom: 2 },
  heroName: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '800' },
  heroSubtitle: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 3, lineHeight: 18 },
  heroActions: { flexDirection: 'row', gap: 8, marginTop: 2 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: Colors.surface2,
  },
  actionBtnDanger: {
    borderColor: `${Colors.danger}66`,
  },
  actionText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '700' },

  feedbackWrap: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  pendingWrap: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  pendingTitle: {
    color: Colors.text,
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  pendingCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: `${Colors.gold}66`,
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    gap: 4,
  },
  pendingGroupName: {
    color: Colors.text,
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  pendingMeta: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
  pendingActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  pendingButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
    paddingVertical: 9,
    borderWidth: 1,
  },
  pendingButtonAccept: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pendingButtonReject: {
    backgroundColor: 'transparent',
    borderColor: `${Colors.danger}66`,
  },
  pendingButtonAcceptText: {
    color: Colors.bg,
    fontSize: FontSize.xs,
    fontWeight: '800',
  },
  pendingButtonRejectText: {
    color: Colors.danger,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  lista: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl },
  cardWrapper: { marginBottom: Spacing.sm },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardMainPressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badge: {
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 0.5 },
  cardBody: { flex: 1 },
  groupName: {
    ...Typography.title,
    fontSize: FontSize.md,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  membrosRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  membrosText: { color: Colors.textMuted, fontSize: FontSize.xs },
  deleteGroupButton: {
    borderWidth: 1,
    borderColor: `${Colors.danger}66`,
    backgroundColor: `${Colors.danger}14`,
    borderRadius: Radius.sm,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  vazio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  ballBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
  },
  vazioTitulo: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  vazioSub: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    maxWidth: 320,
    lineHeight: 21,
  },
  footerBotoes: { marginTop: Spacing.md, gap: Spacing.sm },
  emptyButton: { width: '100%', maxWidth: 300 },
  botaoPrimario: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 13,
    alignItems: 'center',
  },
  botaoPrimarioText: { color: Colors.bg, fontWeight: '800', fontSize: FontSize.md },
  botaoSecundario: {
    backgroundColor: 'transparent',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 13,
    alignItems: 'center',
  },
  botaoSecundarioText: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.md },
});
