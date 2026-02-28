import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../api/api';
import { Colors, FontSize, Radius, Spacing, Typography } from '../theme';
import { ClassificationEntry } from '../types';
import { AppStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'MyPerformance'>;
  route: RouteProp<AppStackParamList, 'MyPerformance'>;
};

interface MyStats {
  temporada: ClassificationEntry | null;
  geral: ClassificationEntry | null;
}

function StatRow({ label, value, icon }: { label: string; value: string | number; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.statRow}>
      <View style={styles.statLabelWrap}>
        <Ionicons name={icon} size={14} color={Colors.textMuted} />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function StatsCard({
  titulo,
  subtitulo,
  entry,
  highlightColor,
}: {
  titulo: string;
  subtitulo: string;
  entry: ClassificationEntry | null;
  highlightColor: string;
}) {
  if (!entry) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: highlightColor }]}>{titulo}</Text>
          <Text style={styles.cardSubtitle}>{subtitulo}</Text>
        </View>
        <View style={styles.emptyCardBody}>
          <Ionicons name="document-text-outline" size={18} color={Colors.textMuted} />
          <Text style={styles.emptyCardText}>Sem dados ainda.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: highlightColor }]}>{titulo}</Text>
        <Text style={styles.cardSubtitle}>{subtitulo}</Text>
      </View>

      {entry.posicao > 0 && (
        <View style={[styles.rankChip, { borderColor: `${highlightColor}88` }]}>
          <Ionicons name="podium-outline" size={14} color={highlightColor} />
          <Text style={[styles.rankChipText, { color: highlightColor }]}>#{entry.posicao} na classificacao</Text>
        </View>
      )}

      <StatRow label="Pontos" value={entry.pontos} icon="ribbon-outline" />
      <StatRow label="Presencas" value={entry.presencas} icon="calendar-outline" />
      <StatRow label="Vitorias" value={entry.vitorias} icon="trophy-outline" />
      <StatRow label="Derrotas" value={entry.derrotas} icon="close-circle-outline" />
      <StatRow label="Gols" value={entry.gols} icon="football-outline" />
      <StatRow label="Assistencias" value={entry.assistencias} icon="git-compare-outline" />
      <StatRow label="MVPs" value={entry.mvps} icon="star-outline" />
      <StatRow label="Bola Murcha" value={entry.bolasMurchas} icon="skull-outline" />
    </View>
  );
}

export default function MyPerformanceScreen({ route }: Props) {
  const { groupId } = route.params;
  const [stats, setStats] = useState<MyStats>({ temporada: null, geral: null });
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState('');

  async function carregar(silencioso = false) {
    if (!silencioso) setCarregando(true);
    setErro('');
    try {
      const res = await api.get(`/api/groups/${groupId}/classification/me`);
      setStats({ temporada: res.data.temporada ?? null, geral: res.data.geral ?? null });
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Nao foi possivel carregar as estatisticas.');
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
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="pulse-outline" size={20} color={Colors.primary} />
        </View>
        <View>
          <Text style={styles.title}>Meu desempenho</Text>
          <Text style={styles.subtitle}>Resumo da temporada e historico geral</Text>
        </View>
      </View>

      {erro !== '' && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={14} color={Colors.danger} />
          <Text style={styles.errorText}>{erro}</Text>
        </View>
      )}

      <StatsCard
        titulo="Temporada Atual"
        subtitulo="Ranking e numeros da fase ativa"
        entry={stats.temporada}
        highlightColor={Colors.primary}
      />
      <StatsCard
        titulo="Historico Geral"
        subtitulo="Somatorio de todas as temporadas"
        entry={stats.geral}
        highlightColor={Colors.gold}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { justifyContent: 'center', alignItems: 'center' },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xl },

  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primarySoft,
  },
  title: { ...Typography.title, fontSize: FontSize.xl },
  subtitle: { ...Typography.subtitle },

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

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  cardHeader: { marginBottom: Spacing.sm },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  cardSubtitle: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  emptyCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  emptyCardText: { color: Colors.textMuted, fontSize: FontSize.sm, fontStyle: 'italic' },
  rankChip: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: Spacing.sm,
  },
  rankChipText: { fontSize: FontSize.xs, fontWeight: '700' },

  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statLabel: { color: Colors.textMuted, fontSize: FontSize.sm },
  statValue: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '700' },
});
