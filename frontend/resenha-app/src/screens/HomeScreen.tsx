import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import { Colors, FontSize, Radius, Spacing, Typography, gradients } from '../theme';
import { Group } from '../types';
import { AppStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const [grupos, setGrupos] = useState<Group[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState('');

  async function carregarGrupos(silencioso = false) {
    if (!silencioso) setCarregando(true);
    setErro('');
    try {
      const response = await api.get('/api/groups/me');
      setGrupos(response.data);
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Nao foi possivel carregar seus grupos.');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregarGrupos();
    }, [])
  );

  function renderGrupo({ item }: { item: Group }) {
    const isAdmin = String(item.perfil).toUpperCase() === 'ADMIN';
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.cardWrapper}
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
        <LinearGradient
          colors={gradients.surface}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
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
        </LinearGradient>
      </TouchableOpacity>
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
      <View style={styles.saudacaoRow}>
        <View>
          <Text style={styles.saudacao}>Ola,</Text>
          <Text style={styles.saudacaoNome}>{user?.nome}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.sairBtn}>
          <Ionicons name="log-out-outline" size={16} color={Colors.danger} />
          <Text style={styles.sair}>Sair</Text>
        </TouchableOpacity>
      </View>

      {erro !== '' && (
        <View style={styles.erroBox}>
          <Text style={styles.erroText}>{erro}</Text>
          <TouchableOpacity onPress={() => carregarGrupos()}>
            <Text style={styles.erroRetry}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {grupos.length === 0 ? (
        <View style={styles.vazio}>
          <Ionicons name="football-outline" size={54} color={Colors.primary} />
          <Text style={styles.vazioTitulo}>Nenhum grupo ainda</Text>
          <Text style={styles.vazioSub}>Crie um grupo ou entre com um codigo de convite.</Text>

          <TouchableOpacity style={styles.botaoPrimario} onPress={() => navigation.navigate('CreateGroup')}>
            <Text style={styles.botaoPrimarioText}>Criar Grupo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoSecundario} onPress={() => navigation.navigate('JoinGroup')}>
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
  saudacaoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  saudacao: { color: Colors.textMuted, fontSize: FontSize.sm },
  saudacaoNome: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '800' },
  sairBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sair: { color: Colors.danger, fontSize: FontSize.sm, fontWeight: '600' },
  erroBox: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.danger + '66',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  erroText: { color: Colors.danger, fontSize: FontSize.xs, marginBottom: 4 },
  erroRetry: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '700' },
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
  vazio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  vazioTitulo: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: 'bold',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  vazioSub: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  footerBotoes: { marginTop: Spacing.md, gap: Spacing.sm },
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
