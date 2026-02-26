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
import { useAuth } from '../contexts/AuthContext';
import { Colors, FontSize, Spacing, getInitials } from '../theme';
import { CaptainStatus } from '../types';
import { AppStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'Captain'>;
  route: RouteProp<AppStackParamList, 'Captain'>;
};

export default function CaptainScreen({ route }: Props) {
  const { groupId, isAdmin } = route.params;
  const { user } = useAuth();
  const [status, setStatus] = useState<CaptainStatus | null>(null);
  const [semCiclo, setSemCiclo] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [erro, setErro] = useState('');

  async function carregar(silencioso = false) {
    if (!silencioso) setCarregando(true);
    setErro('');
    try {
      const res = await api.get(`/api/groups/${groupId}/captain`);
      setStatus(res.data);
      setSemCiclo(false);
    } catch (e: any) {
      const msg: string = e?.response?.data?.mensagem ?? '';
      if (msg.toLowerCase().includes('não há capitão')) {
        setSemCiclo(true);
        setStatus(null);
      } else {
        setErro(msg || 'Erro ao carregar capitão.');
      }
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  useFocusEffect(useCallback(() => { carregar(); }, [groupId]));

  async function acao(fn: () => Promise<void>) {
    setActionLoading(true);
    setErro('');
    try {
      await fn();
      await carregar(true);
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Operação falhou.');
    } finally {
      setActionLoading(false);
    }
  }

  const sortear = () => acao(() => api.post(`/api/groups/${groupId}/captain/draw`));
  const desafiar = () => acao(() => api.post(`/api/groups/${groupId}/captain/challenge`));
  const registrarResultado = (resultado: 'CAPITAO' | 'DESAFIANTE') =>
    acao(() => api.post(`/api/groups/${groupId}/captain/result`, { resultado }));

  if (carregando) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const userId = user?.idUsuario;
  const ehCapitao = status ? status.idCapitao === userId : false;
  const ehDesafiante = status ? status.idDesafiante === userId : false;
  const estaBloqueado = status
    ? status.bloqueados.some((b) => b.idUsuario === userId)
    : false;
  const temDesafio = !!(status?.idDesafiante);

  function renderAcoes() {
    if (actionLoading) {
      return <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.md }} />;
    }

    // Sem ciclo ativo
    if (semCiclo) {
      if (!isAdmin) return null;
      return (
        <TouchableOpacity style={styles.botaoPrimario} onPress={sortear}>
          <Text style={styles.botaoText}>Sortear Capitão</Text>
        </TouchableOpacity>
      );
    }

    if (!status) return null;

    // Com desafio pendente
    if (temDesafio) {
      if (isAdmin) {
        return (
          <View style={styles.acoesRow}>
            <TouchableOpacity
              style={[styles.botaoMeio, { backgroundColor: Colors.success }]}
              onPress={() => registrarResultado('CAPITAO')}
            >
              <Text style={styles.botaoText}>Capitão Venceu</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.botaoMeio, { backgroundColor: Colors.gold }]}
              onPress={() => registrarResultado('DESAFIANTE')}
            >
              <Text style={[styles.botaoText, { color: '#0d0d1a' }]}>Desafiante Venceu</Text>
            </TouchableOpacity>
          </View>
        );
      }
      if (ehDesafiante) {
        return <Text style={styles.infoText}>Aguardando o admin registrar o resultado...</Text>;
      }
      return <Text style={styles.infoText}>Desafio em andamento. Aguarde.</Text>;
    }

    // Sem desafio pendente
    if (ehCapitao) {
      return <Text style={styles.infoText}>Você é o capitão atual. Aguarde um desafiante.</Text>;
    }
    if (estaBloqueado) {
      return <Text style={[styles.infoText, { color: Colors.danger }]}>Você já foi derrotado pelo capitão neste ciclo.</Text>;
    }
    return (
      <TouchableOpacity style={styles.botaoDesafio} onPress={desafiar}>
        <Text style={styles.botaoText}>Desafiar Capitão</Text>
      </TouchableOpacity>
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
      {/* Card Capitão */}
      <View style={styles.cardCapitao}>
        <Text style={styles.cardLabel}>CAPITÃO ATUAL</Text>
        {semCiclo || !status ? (
          <Text style={styles.semCapitao}>Nenhum capitão sorteado ainda</Text>
        ) : (
          <>
            <View style={styles.avatarRow}>
              <View style={styles.avatarGold}>
                <Text style={styles.avatarText}>{getInitials(status.nomeCapitao)}</Text>
              </View>
              <View style={styles.captainInfo}>
                <Text style={styles.captainName}>{status.nomeCapitao.toUpperCase()}</Text>
                <Text style={styles.captainSince}>
                  Desde {new Date(status.iniciadoEm).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              <Text style={styles.coroa}>👑</Text>
            </View>
          </>
        )}
      </View>

      {/* Card Desafiante */}
      {status && (
        <View style={styles.cardDesafiante}>
          <Text style={styles.cardLabel}>DESAFIANTE</Text>
          {temDesafio ? (
            <View style={styles.avatarRow}>
              <View style={styles.avatarDanger}>
                <Text style={styles.avatarText}>{getInitials(status.nomeDesafiante!)}</Text>
              </View>
              <View style={styles.captainInfo}>
                <Text style={styles.captainName}>{status.nomeDesafiante!.toUpperCase()}</Text>
                <Text style={[styles.captainSince, { color: Colors.danger }]}>Desafio pendente</Text>
              </View>
              <Text style={styles.espada}>⚔️</Text>
            </View>
          ) : (
            <Text style={styles.semCapitao}>Sem desafio pendente</Text>
          )}
        </View>
      )}

      {/* Bloqueados */}
      {status && status.bloqueados.length > 0 && (
        <View style={styles.bloqueadosCard}>
          <Text style={styles.cardLabel}>BLOQUEADOS ({status.bloqueados.length})</Text>
          <View style={styles.bloqueadosList}>
            {status.bloqueados.map((b) => (
              <View key={b.idUsuario} style={styles.bloqueadoChip}>
                <Text style={styles.bloqueadoText}>{b.nome}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Erro */}
      {erro !== '' && <Text style={styles.erroText}>{erro}</Text>}

      {/* Ações */}
      <View style={styles.acoesContainer}>
        {renderAcoes()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.md, gap: Spacing.sm },
  center: { justifyContent: 'center', alignItems: 'center' },

  cardCapitao: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gold + '55',
    padding: Spacing.md,
  },
  cardDesafiante: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.danger + '44',
    padding: Spacing.md,
  },
  bloqueadosCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  cardLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  semCapitao: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontStyle: 'italic',
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatarGold: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  avatarDanger: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  avatarText: { color: '#0d0d1a', fontWeight: '900', fontSize: FontSize.md },
  captainInfo: { flex: 1 },
  captainName: { color: Colors.text, fontWeight: '800', fontSize: FontSize.md, letterSpacing: 0.5 },
  captainSince: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  coroa: { fontSize: 28 },
  espada: { fontSize: 28 },

  bloqueadosList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  bloqueadoChip: {
    backgroundColor: Colors.surface2,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.danger + '55',
  },
  bloqueadoText: { color: Colors.danger, fontSize: FontSize.xs, fontWeight: '600' },

  erroText: {
    color: Colors.danger,
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  infoText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginTop: Spacing.md,
    fontStyle: 'italic',
  },
  acoesContainer: { marginTop: Spacing.sm },
  acoesRow: { flexDirection: 'row', gap: Spacing.sm },
  botaoPrimario: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botaoDesafio: {
    backgroundColor: Colors.danger,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botaoMeio: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botaoText: { color: Colors.bg, fontWeight: 'bold', fontSize: FontSize.md },
});
