import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import { AppStackParamList } from '../navigation/AppNavigator';
import { Colors, FontSize, Radius, Spacing, Typography } from '../theme';
import { ResumoPartidaHistorico } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'HistoricoPartidas'>;
  route: RouteProp<AppStackParamList, 'HistoricoPartidas'>;
};

const STATUS_LABEL: Record<ResumoPartidaHistorico['status'], string> = {
  ABERTA: 'Aberta',
  EM_ANDAMENTO: 'Em andamento',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
};

const STATUS_COLOR: Record<ResumoPartidaHistorico['status'], string> = {
  ABERTA: Colors.success,
  EM_ANDAMENTO: Colors.gold,
  FINALIZADA: Colors.primary,
  CANCELADA: Colors.danger,
};

function formatarData(iso: string) {
  const data = new Date(iso);
  const dia = data.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
  const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${dia} - ${hora}`;
}

export default function HistoricoPartidasScreen({ navigation, route }: Props) {
  const { groupId, groupName } = route.params;
  const [partidas, setPartidas] = useState<ResumoPartidaHistorico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState('');

  async function carregar(silencioso = false) {
    if (!silencioso) setCarregando(true);
    setErro('');
    try {
      const res = await api.get(`/api/groups/${groupId}/matches/history`);
      setPartidas(res.data);
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Não foi possível carregar o histórico.');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [groupId]);

  if (carregando) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>Histórico do grupo</Text>
        <Text style={styles.subtitle}>{groupName}</Text>
      </View>

      {erro !== '' && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={15} color={Colors.danger} />
          <Text style={styles.errorText}>{erro}</Text>
        </View>
      )}

      <FlatList
        data={partidas}
        keyExtractor={(item) => String(item.idPartida)}
        contentContainerStyle={styles.listContent}
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
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="albums-outline" size={32} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Sem partidas no histórico</Text>
            <Text style={styles.emptySubtitle}>Assim que o grupo acumular jogos, eles aparecem aqui.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('DetalhePartida', { matchId: item.idPartida })}
          >
            <View style={styles.cardTop}>
              <Text style={styles.cardDate}>{formatarData(item.dataHoraJogo)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLOR[item.status]}20` }]}>
                <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>{STATUS_LABEL[item.status]}</Text>
              </View>
            </View>

            <View style={styles.placarWrap}>
              <View style={styles.timeBox}>
                <Text style={styles.teamLabel}>Time 1</Text>
                <Text style={styles.teamCaptain}>{item.nomeCapitaoTime1 || 'Sem capitão'}</Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreText}>
                  {item.golsTime1 ?? '-'} x {item.golsTime2 ?? '-'}
                </Text>
              </View>
              <View style={styles.timeBox}>
                <Text style={styles.teamLabel}>Time 2</Text>
                <Text style={styles.teamCaptain}>{item.nomeCapitaoTime2 || 'Sem capitão'}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.footerText}>
                {item.nomeCapitaoVencedor ? `Vitória do time de ${item.nomeCapitaoVencedor}` : 'Partida ainda sem resultado'}
              </Text>
              <Text style={styles.footerMeta}>
                {item.totalConfirmados}/{item.limiteVagas} confirmados
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: Spacing.md, paddingBottom: Spacing.xl, gap: Spacing.sm },
  headerCard: {
    margin: Spacing.md,
    marginBottom: 0,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  title: { ...Typography.title, fontSize: FontSize.xl },
  subtitle: { ...Typography.subtitle, marginTop: 4 },
  errorBox: {
    margin: Spacing.md,
    marginBottom: 0,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: `${Colors.danger}66`,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  errorText: { color: Colors.danger, fontSize: FontSize.sm, flex: 1 },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  cardDate: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '700', flex: 1 },
  statusBadge: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: { fontSize: FontSize.xs, fontWeight: '800' },
  placarWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  timeBox: { flex: 1, gap: 2 },
  teamLabel: { color: Colors.textMuted, fontSize: FontSize.xs, textTransform: 'uppercase' },
  teamCaptain: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '700' },
  scoreBox: {
    minWidth: 78,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
  },
  scoreText: { color: Colors.primary, fontSize: FontSize.lg, fontWeight: '800' },
  cardFooter: { gap: 2 },
  footerText: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '600' },
  footerMeta: { color: Colors.textMuted, fontSize: FontSize.xs },
  emptyWrap: {
    marginTop: Spacing.xl,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    gap: 6,
  },
  emptyTitle: { ...Typography.title, fontSize: FontSize.lg, textAlign: 'center' },
  emptySubtitle: { ...Typography.subtitle, textAlign: 'center' },
});
