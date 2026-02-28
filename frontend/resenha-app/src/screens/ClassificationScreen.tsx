import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import api from '../api/api';
import { Colors, FontSize, Radius, Spacing, Typography } from '../theme';
import { ClassificationEntry } from '../types';
import { AppStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'Classification'>;
  route: RouteProp<AppStackParamList, 'Classification'>;
};

type Modo = 'temporada' | 'geral';

function Cell({
  label,
  value,
  width,
  align = 'center',
  highlight = false,
}: {
  label?: string;
  value: string | number;
  width: number;
  align?: 'left' | 'center' | 'right';
  highlight?: boolean;
}) {
  return (
    <View style={[styles.cell, { width }]}>
      {label && <Text style={styles.cellLabel}>{label}</Text>}
      <Text
        style={[
          styles.cellValue,
          align === 'left' && { textAlign: 'left' },
          align === 'right' && { textAlign: 'right' },
          highlight && { color: Colors.primary, fontWeight: '800' },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

export default function ClassificationScreen({ route }: Props) {
  const { groupId } = route.params;
  const [modo, setModo] = useState<Modo>('temporada');
  const [dados, setDados] = useState<ClassificationEntry[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState('');

  async function carregar(silencioso = false) {
    if (!silencioso) setCarregando(true);
    setErro('');
    try {
      const url =
        modo === 'temporada'
          ? `/api/groups/${groupId}/classification`
          : `/api/groups/${groupId}/classification/all-time`;
      const res = await api.get(url);
      setDados(res.data.classificacao ?? []);
    } catch (e: any) {
      const msg = e?.response?.data?.mensagem ?? '';
      const normalized = msg.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (normalized.includes('temporada') || normalized.includes('nao ha')) {
        setDados([]);
      } else {
        setErro(msg || 'Erro ao carregar classificacao.');
      }
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [modo, groupId]);

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
      <View style={styles.headerRow}>
        <View style={styles.headerIcon}>
          <Ionicons name="podium-outline" size={20} color={Colors.primary} />
        </View>
        <View>
          <Text style={styles.title}>Classificacao</Text>
          <Text style={styles.subtitle}>Formato em tabela para leitura rapida</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, modo === 'temporada' && styles.tabActive]} onPress={() => setModo('temporada')}>
          <Text style={[styles.tabText, modo === 'temporada' && styles.tabTextActive]}>Temporada</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, modo === 'geral' && styles.tabActive]} onPress={() => setModo('geral')}>
          <Text style={[styles.tabText, modo === 'geral' && styles.tabTextActive]}>Historico</Text>
        </TouchableOpacity>
      </View>

      {erro !== '' && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={14} color={Colors.danger} />
          <Text style={styles.errorText}>{erro}</Text>
        </View>
      )}

      {erro === '' && dados.length === 0 && (
        <View style={styles.emptyWrap}>
          <Ionicons name="trophy-outline" size={34} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Sem classificacao</Text>
          <Text style={styles.emptySubtitle}>
            {modo === 'temporada'
              ? 'Finalize partidas para gerar a classificacao da temporada.'
              : 'Nenhum dado historico disponivel ainda.'}
          </Text>
        </View>
      )}

      {erro === '' && dados.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Cell value="#" width={48} />
              <Cell value="Jogador" width={170} align="left" />
              <Cell value="Pts" width={60} />
              <Cell value="Pres" width={64} />
              <Cell value="Vit" width={58} />
              <Cell value="Der" width={58} />
              <Cell value="Gol" width={58} />
              <Cell value="Ast" width={58} />
              <Cell value="MVP" width={58} />
              <Cell value="BM" width={58} />
            </View>

            {dados.map((item) => (
              <View key={item.idUsuario} style={styles.tableRow}>
                <Cell value={item.posicao} width={48} highlight={item.posicao <= 3} />
                <Cell value={item.nome} width={170} align="left" />
                <Cell value={item.pontos} width={60} highlight />
                <Cell value={item.presencas} width={64} />
                <Cell value={item.vitorias} width={58} />
                <Cell value={item.derrotas} width={58} />
                <Cell value={item.gols} width={58} />
                <Cell value={item.assistencias} width={58} />
                <Cell value={item.mvps} width={58} />
                <Cell value={item.bolasMurchas} width={58} />
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...Typography.title, fontSize: FontSize.xl },
  subtitle: { ...Typography.subtitle },

  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { color: Colors.textMuted, fontWeight: '700', fontSize: FontSize.sm },
  tabTextActive: { color: Colors.bg, fontWeight: '800' },

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

  table: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface2,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cell: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  cellLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginBottom: 2,
  },
  cellValue: {
    color: Colors.text,
    fontSize: FontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },

  emptyWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    gap: 6,
  },
  emptyTitle: { ...Typography.title, fontSize: FontSize.lg, textAlign: 'center' },
  emptySubtitle: { ...Typography.subtitle, textAlign: 'center' },
});
