import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../api/api';
import { Colors, FontSize, Spacing } from '../theme';
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

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function StatsCard({ titulo, entry }: { titulo: string; entry: ClassificationEntry | null }) {
  if (!entry) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitulo}>{titulo}</Text>
        <Text style={styles.semDados}>Sem dados ainda.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitulo}>{titulo}</Text>
      {entry.posicao > 0 && (
        <Text style={styles.posicao}>#{entry.posicao} no ranking</Text>
      )}
      <StatRow label="Pontos" value={entry.pontos} />
      <StatRow label="Presenças" value={entry.presencas} />
      <StatRow label="Vitórias" value={entry.vitorias} />
      <StatRow label="Derrotas" value={entry.derrotas} />
      <StatRow label="Gols" value={entry.gols} />
      <StatRow label="Assistências" value={entry.assistencias} />
      <StatRow label="MVPs" value={entry.mvps} />
      <StatRow label="Bola Murcha" value={entry.bolasMurchas} />
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
    } catch {
      setErro('Não foi possível carregar as estatísticas.');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  useEffect(() => { carregar(); }, [groupId]);

  if (carregando) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (erro) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.erroText}>{erro}</Text>
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
          onRefresh={() => { setAtualizando(true); carregar(true); }}
          tintColor={Colors.primary}
        />
      }
    >
      <StatsCard titulo="Temporada Atual" entry={stats.temporada} />
      <StatsCard titulo="Histórico Geral" entry={stats.geral} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { justifyContent: 'center', alignItems: 'center' },
  content: { padding: Spacing.md, gap: Spacing.md },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  cardTitulo: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  posicao: {
    color: Colors.gold,
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statLabel: { color: Colors.textMuted, fontSize: FontSize.sm },
  statValue: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '700' },
  semDados: { color: Colors.textMuted, fontSize: FontSize.sm, fontStyle: 'italic' },
  erroText: { color: Colors.danger, fontSize: FontSize.sm, textAlign: 'center' },
});
