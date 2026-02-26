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
import api from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import { Colors, FontSize, Spacing, gradients } from '../theme';
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

  async function carregarGrupos(silencioso = false) {
    if (!silencioso) setCarregando(true);
    try {
      const response = await api.get('/api/groups/me');
      setGrupos(response.data);
    } catch {
      // mantém lista vazia em caso de erro
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  // Recarrega quando a tela recebe foco (ex: após criar/entrar em grupo)
  useFocusEffect(
    useCallback(() => {
      carregarGrupos();
    }, [])
  );

  function renderGrupo({ item }: { item: Group }) {
    const isAdmin = item.perfil === 'ADMIN';
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.cardWrapper}
        onPress={() => navigation.navigate('GroupDashboard', {
          groupId: item.idGrupo,
          groupName: item.nome,
          isAdmin: item.perfil === 'ADMIN',
        })}
      >
        <LinearGradient
          colors={gradients.surface}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Badge de perfil */}
          <View style={[styles.badge, { backgroundColor: isAdmin ? Colors.gold : Colors.border }]}>
            <Text style={[styles.badgeText, { color: isAdmin ? '#0d0d1a' : Colors.textMuted }]}>
              {isAdmin ? 'ADMIN' : 'MEMBRO'}
            </Text>
          </View>

          {/* Info principal */}
          <View style={styles.cardBody}>
            <Text style={styles.groupName} numberOfLines={1}>{item.nome.toUpperCase()}</Text>
            <View style={styles.membrosRow}>
              <Text style={styles.membrosIcon}>👥</Text>
              <Text style={styles.membrosText}>
                {item.totalMembros}/{item.limiteJogadores} jogadores
              </Text>
            </View>
          </View>

          {/* Seta */}
          <Text style={styles.seta}>›</Text>
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
      {/* Saudação */}
      <View style={styles.saudacaoRow}>
        <Text style={styles.saudacao}>Olá, <Text style={styles.saudacaoNome}>{user?.nome}</Text></Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.sair}>Sair</Text>
        </TouchableOpacity>
      </View>

      {grupos.length === 0 ? (
        /* Estado vazio */
        <View style={styles.vazio}>
          <Text style={styles.vazioEmoji}>⚽</Text>
          <Text style={styles.vazioTitulo}>Nenhum grupo ainda</Text>
          <Text style={styles.vazioSub}>Crie um grupo ou entre com um código de convite.</Text>

          <TouchableOpacity
            style={styles.botaoPrimario}
            onPress={() => navigation.navigate('CreateGroup')}
          >
            <Text style={styles.botaoPrimarioText}>+ Criar Grupo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoSecundario}
            onPress={() => navigation.navigate('JoinGroup')}
          >
            <Text style={styles.botaoSecundarioText}>Entrar com Código</Text>
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
              onRefresh={() => { setAtualizando(true); carregarGrupos(true); }}
              tintColor={Colors.primary}
            />
          }
          ListFooterComponent={
            <View style={styles.footerBotoes}>
              <TouchableOpacity
                style={styles.botaoPrimario}
                onPress={() => navigation.navigate('CreateGroup')}
              >
                <Text style={styles.botaoPrimarioText}>+ Criar Grupo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botaoSecundario}
                onPress={() => navigation.navigate('JoinGroup')}
              >
                <Text style={styles.botaoSecundarioText}>Entrar com Código</Text>
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
  saudacaoNome: { color: Colors.primary, fontWeight: 'bold' },
  sair: { color: Colors.danger, fontSize: FontSize.sm, fontWeight: '600' },
  lista: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl },
  cardWrapper: { marginBottom: Spacing.sm },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: Spacing.sm,
  },
  badgeText: { fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 0.5 },
  cardBody: { flex: 1 },
  groupName: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  membrosRow: { flexDirection: 'row', alignItems: 'center' },
  membrosIcon: { fontSize: 12, marginRight: 4 },
  membrosText: { color: Colors.textMuted, fontSize: FontSize.xs },
  seta: { color: Colors.primary, fontSize: 26, fontWeight: '300' },
  vazio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  vazioEmoji: { fontSize: 56, marginBottom: Spacing.md },
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
    marginBottom: Spacing.xl,
  },
  footerBotoes: { marginTop: Spacing.md, gap: Spacing.sm },
  botaoPrimario: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  botaoPrimarioText: { color: Colors.bg, fontWeight: 'bold', fontSize: FontSize.md },
  botaoSecundario: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 13,
    alignItems: 'center',
  },
  botaoSecundarioText: { color: Colors.primary, fontWeight: '600', fontSize: FontSize.md },
});
