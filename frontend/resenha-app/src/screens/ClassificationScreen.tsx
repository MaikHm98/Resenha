import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import api from '../api/api';
import { Colors, FontSize, Spacing } from '../theme';
import { ClassificationEntry } from '../types';
import { AppStackParamList } from '../navigation/AppNavigator';
import PlayerCard from '../components/PlayerCard';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'Classification'>;
  route: RouteProp<AppStackParamList, 'Classification'>;
};

type Modo = 'temporada' | 'geral';

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
      // Temporada sem dados ainda (não há temporada ativa) é estado vazio, não erro
      if (msg.toLowerCase().includes('temporada') || msg.toLowerCase().includes('não há')) {
        setDados([]);
      } else {
        setErro(msg || 'Erro ao carregar classificação.');
      }
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [modo, groupId]);

  function renderItem({ item }: { item: ClassificationEntry }) {
    const temPremio = item.mvps > 0 || item.bolasMurchas > 0;
    return (
      <View style={styles.itemWrapper}>
        <PlayerCard
          nome={item.nome}
          rank={item.posicao}
          pontos={item.pontos}
          gols={item.gols}
          assistencias={item.assistencias}
          vitorias={item.vitorias}
        />
        {temPremio && (
          <Text style={styles.premios}>
            {item.mvps > 0 ? `⭐${item.mvps}` : ''}
            {item.mvps > 0 && item.bolasMurchas > 0 ? ' ' : ''}
            {item.bolasMurchas > 0 ? `💀${item.bolasMurchas}` : ''}
          </Text>
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
      {/* Segmented control */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, modo === 'temporada' && styles.tabAtivo]}
          onPress={() => setModo('temporada')}
        >
          <Text style={[styles.tabText, modo === 'temporada' && styles.tabTextAtivo]}>
            Temporada
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, modo === 'geral' && styles.tabAtivo]}
          onPress={() => setModo('geral')}
        >
          <Text style={[styles.tabText, modo === 'geral' && styles.tabTextAtivo]}>
            Histórico
          </Text>
        </TouchableOpacity>
      </View>

      {erro !== '' ? (
        <View style={styles.center}>
          <Text style={styles.erroText}>{erro}</Text>
        </View>
      ) : dados.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.vazioEmoji}>🏆</Text>
          <Text style={styles.vazioTitulo}>Sem classificação</Text>
          <Text style={styles.vazioSub}>
            {modo === 'temporada'
              ? 'Finalize partidas para gerar o ranking da temporada.'
              : 'Nenhum dado histórico ainda.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={dados}
          keyExtractor={(item) => String(item.idUsuario)}
          renderItem={renderItem}
          numColumns={3}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={() => { setAtualizando(true); carregar(true); }}
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },

  tabs: {
    flexDirection: 'row',
    margin: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabAtivo: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    color: Colors.textMuted,
    fontWeight: '600',
    fontSize: FontSize.sm,
  },
  tabTextAtivo: {
    color: Colors.bg,
    fontWeight: 'bold',
  },

  lista: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  row: {
    justifyContent: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  itemWrapper: {
    alignItems: 'center',
  },
  premios: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 4,
    textAlign: 'center',
  },

  erroText: { color: Colors.danger, fontSize: FontSize.sm, textAlign: 'center' },
  vazioEmoji: { fontSize: 48, marginBottom: Spacing.md },
  vazioTitulo: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  vazioSub: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
});
