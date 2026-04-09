import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import { AppStackParamList } from '../navigation/AppNavigator';
import { Colors, FontSize, Radius, Spacing, Typography } from '../theme';
import { DetalhePartida } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'DetalhePartida'>;
  route: RouteProp<AppStackParamList, 'DetalhePartida'>;
};

function formatarData(iso: string) {
  const data = new Date(iso);
  const dia = data.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${dia} às ${hora}`;
}

function CardSecao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{titulo}</Text>
      {children}
    </View>
  );
}

export default function DetalhePartidaScreen({ route }: Props) {
  const { matchId } = route.params;
  const [detalhe, setDetalhe] = useState<DetalhePartida | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState('');

  async function carregar(silencioso = false) {
    if (!silencioso) setCarregando(true);
    setErro('');
    try {
      const res = await api.get(`/api/matches/${matchId}/details`);
      setDetalhe(res.data);
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Não foi possível carregar o detalhe da partida.');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [matchId]);

  if (carregando) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!detalhe) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyText}>Detalhe não encontrado.</Text>
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
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Partida #{detalhe.idPartida}</Text>
        <Text style={styles.heroSubtitle}>{formatarData(detalhe.dataHoraJogo)}</Text>
        <Text style={styles.heroScore}>
          {detalhe.golsTime1 ?? '-'} x {detalhe.golsTime2 ?? '-'}
        </Text>
        <Text style={styles.heroMeta}>
          {detalhe.nomeCapitaoVencedor ? `Vitória do time de ${detalhe.nomeCapitaoVencedor}` : `Status: ${detalhe.status}`}
        </Text>
      </View>

      {erro !== '' && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={15} color={Colors.danger} />
          <Text style={styles.errorText}>{erro}</Text>
        </View>
      )}

      <CardSecao titulo="Capitães e times">
        {[detalhe.time1, detalhe.time2].filter(Boolean).map((time) => (
          <View key={time!.numeroTime} style={styles.timeBlock}>
            <Text style={styles.timeTitle}>Time {time!.numeroTime}</Text>
            <Text style={styles.timeCaptain}>Capitão: {time!.nomeCapitao}</Text>
            {time!.jogadores.map((jogador) => (
              <View key={jogador.idUsuario} style={styles.playerRow}>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{jogador.nome}</Text>
                  {jogador.goleiro && <Text style={styles.playerBadge}>Goleiro</Text>}
                </View>
                <Text style={styles.playerStats}>
                  {jogador.gols} G • {jogador.assistencias} A
                </Text>
              </View>
            ))}
          </View>
        ))}
      </CardSecao>

      <CardSecao titulo="Participação">
        <Text style={styles.infoText}>Confirmados: {detalhe.totalConfirmados}</Text>
        <Text style={styles.infoText}>Ausentes: {detalhe.totalAusentes}</Text>
        <Text style={styles.infoText}>Limite de vagas: {detalhe.limiteVagas}</Text>
      </CardSecao>

      <CardSecao titulo="Prêmios da partida">
        {detalhe.premios.length === 0 ? (
          <Text style={styles.mutedText}>Nenhum prêmio registrado.</Text>
        ) : (
          detalhe.premios.map((premio) => (
            <View key={premio.tipo} style={styles.premioRow}>
              <Text style={styles.premioTipo}>{premio.tipo === 'BOLA_MURCHA' ? 'Bola Murcha' : premio.tipo}</Text>
              <Text style={styles.premioNome}>{premio.nomeVencedor || 'Aguardando aprovação'}</Text>
              <Text style={styles.premioMeta}>
                {premio.status} • rodada {premio.rodada}
              </Text>
            </View>
          ))
        )}
      </CardSecao>

      {!!detalhe.observacao && (
        <CardSecao titulo="Observação">
          <Text style={styles.infoText}>{detalhe.observacao}</Text>
        </CardSecao>
      )}

      <CardSecao titulo="Ausências e pendências">
        <Text style={styles.listTitle}>Ausentes</Text>
        {detalhe.ausentesNomes.length === 0 ? (
          <Text style={styles.mutedText}>Nenhum ausente registrado.</Text>
        ) : (
          detalhe.ausentesNomes.map((nome) => (
            <Text key={`aus-${nome}`} style={styles.listItem}>
              {nome}
            </Text>
          ))
        )}

        <Text style={[styles.listTitle, { marginTop: Spacing.sm }]}>Sem resposta</Text>
        {detalhe.naoConfirmaramNomes.length === 0 ? (
          <Text style={styles.mutedText}>Todos responderam.</Text>
        ) : (
          detalhe.naoConfirmaramNomes.map((nome) => (
            <Text key={`nr-${nome}`} style={styles.listItem}>
              {nome}
            </Text>
          ))
        )}
      </CardSecao>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { justifyContent: 'center', alignItems: 'center' },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xl },
  heroCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: 4,
  },
  heroTitle: { ...Typography.title, fontSize: FontSize.xl },
  heroSubtitle: { ...Typography.subtitle, textAlign: 'center' },
  heroScore: { color: Colors.primary, fontSize: 32, fontWeight: '900', marginTop: 4 },
  heroMeta: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '700', textAlign: 'center' },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
  },
  sectionTitle: { ...Typography.title, fontSize: FontSize.md, marginBottom: Spacing.sm },
  timeBlock: { marginBottom: Spacing.md, gap: 6 },
  timeTitle: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '800' },
  timeCaptain: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '700' },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 6,
  },
  playerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  playerName: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '600' },
  playerBadge: {
    color: Colors.gold,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  playerStats: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '700' },
  infoText: { color: Colors.text, fontSize: FontSize.sm, lineHeight: 20 },
  mutedText: { color: Colors.textMuted, fontSize: FontSize.sm },
  premioRow: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 8,
    gap: 2,
  },
  premioTipo: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '800' },
  premioNome: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '600' },
  premioMeta: { color: Colors.textMuted, fontSize: FontSize.xs },
  listTitle: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '800', marginBottom: 6 },
  listItem: { color: Colors.text, fontSize: FontSize.sm, paddingVertical: 3 },
  errorBox: {
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
  emptyText: { color: Colors.textMuted, fontSize: FontSize.sm },
});
