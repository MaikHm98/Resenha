import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Alert,
  Platform,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import { AppStackParamList } from '../navigation/AppNavigator';
import { Colors, FontSize, Radius, Spacing, Typography } from '../theme';
import { AddGroupMemberResult, GroupMember } from '../types';
import ClubLogo from '../components/ClubLogo';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'ManageMembers'>;
  route: RouteProp<AppStackParamList, 'ManageMembers'>;
};

export default function ManageMembersScreen({ route }: Props) {
  const { groupId, isAdmin } = route.params;
  const { user } = useAuth();

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [adicionando, setAdicionando] = useState(false);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());
  const [roleLoadingIds, setRoleLoadingIds] = useState<Set<number>>(new Set());
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [lastInvite, setLastInvite] = useState<{ email: string; code: string; link?: string; expiresAt?: string } | null>(null);
  const [canManage, setCanManage] = useState(isAdmin);

  async function carregar(silencioso = false) {
    if (!silencioso) setCarregando(true);
    setErro('');
    try {
      const res = await api.get(`/api/groups/${groupId}/members`);
      const fetched: GroupMember[] = res.data;
      setMembers(fetched);
      const meuPerfil = fetched.find((m) => m.idUsuario === user?.idUsuario)?.perfil;
      setCanManage(String(meuPerfil).toUpperCase() === 'ADMIN');
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Nao foi possivel carregar os membros.');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [groupId])
  );

  async function handleAddMember() {
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErro('Informe um email valido para adicionar jogador.');
      setSucesso('');
      return;
    }

    setErro('');
    setSucesso('');
    setLastInvite(null);
    setAdicionando(true);
    try {
      const res = await api.post<AddGroupMemberResult>(`/api/groups/${groupId}/members`, { email: cleanEmail });
      const payload = res.data;
      const mensagem = payload?.mensagem;
      setEmail('');
      await carregar(true);
      setSucesso(mensagem || 'Operacao realizada com sucesso.');
      if (payload?.acao === 'INVITED' && payload?.codigoConvite) {
        setLastInvite({
          email: cleanEmail,
          code: payload.codigoConvite,
          link: payload.inviteLink,
          expiresAt: payload.expiraEm,
        });
      }
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Nao foi possivel adicionar o membro.');
      setSucesso('');
      setLastInvite(null);
    } finally {
      setAdicionando(false);
    }
  }

  function formatInviteExpiry(value?: string) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('pt-BR');
  }

  async function shareInviteCode() {
    if (!lastInvite) return;

    const expiry = formatInviteExpiry(lastInvite.expiresAt);
    const text = expiry
      ? `Codigo de convite do grupo: ${lastInvite.code}\nValido ate: ${expiry}${lastInvite.link ? `\nLink: ${lastInvite.link}` : ''}`
      : `Codigo de convite do grupo: ${lastInvite.code}${lastInvite.link ? `\nLink: ${lastInvite.link}` : ''}`;

    try {
      await Share.share({ message: text });
    } catch {
      Alert.alert('Convite', 'Nao foi possivel abrir o compartilhamento.');
    }
  }

  async function copyInviteCode() {
    if (!lastInvite) return;
    try {
      await Clipboard.setStringAsync(lastInvite.code);
      Alert.alert('Convite', 'Codigo copiado para a area de transferencia.');
    } catch {
      Alert.alert('Convite', 'Nao foi possivel copiar o codigo.');
    }
  }

  async function copyInviteLink() {
    if (!lastInvite?.link) return;
    try {
      await Clipboard.setStringAsync(lastInvite.link);
      Alert.alert('Convite', 'Link de convite copiado para a area de transferencia.');
    } catch {
      Alert.alert('Convite', 'Nao foi possivel copiar o link de convite.');
    }
  }

  function confirmRemove(member: GroupMember) {
    Alert.alert(
      'Remover membro',
      `Deseja remover ${member.nome} do grupo?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => handleRemoveMember(member),
        },
      ]
    );
  }

  async function handleRemoveMember(member: GroupMember) {
    if (removingIds.has(member.idUsuario)) return;

    setRemovingIds((prev) => new Set(prev).add(member.idUsuario));
    setErro('');
    setSucesso('');
    try {
      await api.delete(`/api/groups/${groupId}/members/${member.idUsuario}`);
      await carregar(true);
      setSucesso('Membro removido com sucesso.');
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Nao foi possivel remover o membro.');
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(member.idUsuario);
        return next;
      });
    }
  }

  async function handleToggleRole(member: GroupMember) {
    if (roleLoadingIds.has(member.idUsuario)) return;

    const targetRole = member.perfil === 'ADMIN' ? 'JOGADOR' : 'ADMIN';
    setRoleLoadingIds((prev) => new Set(prev).add(member.idUsuario));
    setErro('');
    setSucesso('');
    try {
      await api.patch(`/api/groups/${groupId}/members/${member.idUsuario}/role`, { perfil: targetRole });
      await carregar(true);
      setSucesso(`Perfil atualizado para ${targetRole}.`);
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Nao foi possivel alterar o perfil do membro.');
    } finally {
      setRoleLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(member.idUsuario);
        return next;
      });
    }
  }

  function renderItem({ item }: { item: GroupMember }) {
    const isAdmin = item.perfil === 'ADMIN';
    const isSelf = item.idUsuario === user?.idUsuario;
    const isRemoving = removingIds.has(item.idUsuario);
    const isRoleLoading = roleLoadingIds.has(item.idUsuario);

    return (
      <View style={styles.memberRow}>
        <View style={styles.memberAvatar}>
          <Text style={styles.memberAvatarText}>
            {item.nome
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()}
          </Text>
        </View>

        <View style={styles.memberInfo}>
          <View style={styles.memberNameRow}>
            <Text style={styles.memberName} numberOfLines={1}>
              {item.nome}
            </Text>
            {item.timeCoracaoEscudoUrl ? (
              <View style={styles.clubChip}>
                <ClubLogo
                  uri={item.timeCoracaoEscudoUrl}
                  clubName={item.timeCoracaoNome ?? item.timeCoracaoCodigo}
                  size={14}
                />
                <Text style={styles.clubChipText} numberOfLines={1}>
                  {item.timeCoracaoNome ?? item.timeCoracaoCodigo}
                </Text>
              </View>
            ) : null}
            <View style={[styles.roleChip, isAdmin ? styles.roleChipAdmin : styles.roleChipMember]}>
              <Ionicons
                name={isAdmin ? 'shield-checkmark-outline' : 'person-outline'}
                size={11}
                color={isAdmin ? Colors.gold : Colors.textMuted}
              />
              <Text style={[styles.roleChipText, isAdmin && { color: Colors.gold }]}>
                {isAdmin ? 'ADMIN' : 'JOGADOR'}
              </Text>
            </View>
          </View>
          <Text style={styles.memberEmail}>{item.email}</Text>
        </View>

        {canManage && !isSelf && (
          <View style={styles.memberActions}>
            <TouchableOpacity
              style={[styles.roleButton, isAdmin ? styles.roleButtonDemote : styles.roleButtonPromote]}
              onPress={() => handleToggleRole(item)}
              disabled={isRoleLoading}
            >
              {isRoleLoading ? (
                <ActivityIndicator size="small" color={isAdmin ? Colors.textMuted : Colors.bg} />
              ) : (
                <Text style={[styles.roleButtonText, isAdmin && styles.roleButtonTextDemote]}>
                  {isAdmin ? 'Rebaixar' : 'Promover'}
                </Text>
              )}
            </TouchableOpacity>

            {!isAdmin && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => confirmRemove(item)}
                disabled={isRemoving}
              >
                {isRemoving ? (
                  <ActivityIndicator size="small" color={Colors.danger} />
                ) : (
                  <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                )}
              </TouchableOpacity>
            )}
          </View>
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
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}>
            <Ionicons name="people-outline" size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.title}>Membros do Grupo</Text>
            <Text style={styles.subtitle}>
              {canManage ? 'Adicione, promova ou remova jogadores' : 'Lista de jogadores do grupo (somente leitura)'}
            </Text>
          </View>
        </View>

        {canManage && (
          <View style={styles.addCard}>
            <Text style={styles.label}>Adicionar jogador por email</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={16} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="email@exemplo.com"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                keyboardAppearance={Platform.OS === 'ios' ? 'default' : undefined}
                returnKeyType="done"
                value={email}
                onChangeText={setEmail}
                onSubmitEditing={handleAddMember}
              />
            </View>
            <TouchableOpacity style={[styles.addButton, adicionando && { opacity: 0.6 }]} onPress={handleAddMember} disabled={adicionando}>
              {adicionando ? <ActivityIndicator color={Colors.bg} /> : <Text style={styles.addButtonText}>Adicionar jogador</Text>}
            </TouchableOpacity>
          </View>
        )}

        {erro !== '' && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={14} color={Colors.danger} />
            <Text style={styles.errorText}>{erro}</Text>
          </View>
        )}

        {sucesso !== '' && (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle-outline" size={14} color={Colors.success} />
            <Text style={styles.successText}>{sucesso}</Text>
          </View>
        )}

        {lastInvite && (
          <View style={styles.inviteBox}>
            <View style={styles.inviteHeader}>
              <Ionicons name="ticket-outline" size={16} color={Colors.primary} />
              <Text style={styles.inviteTitle}>Codigo de convite gerado</Text>
            </View>
            <Text style={styles.inviteMeta}>Convidado: {lastInvite.email}</Text>
            <Text selectable style={styles.inviteCode}>
              {lastInvite.code}
            </Text>
            {formatInviteExpiry(lastInvite.expiresAt) !== '' && (
              <Text style={styles.inviteMeta}>Valido ate: {formatInviteExpiry(lastInvite.expiresAt)}</Text>
            )}
            <Text style={styles.inviteHint}>Use os botoes abaixo para copiar ou compartilhar o codigo.</Text>
            <View style={styles.inviteActions}>
              <TouchableOpacity style={styles.inviteCopyButton} onPress={copyInviteCode}>
                <Ionicons name="copy-outline" size={14} color={Colors.primary} />
                <Text style={styles.inviteCopyButtonText}>Copiar codigo</Text>
              </TouchableOpacity>
              {lastInvite.link ? (
                <TouchableOpacity style={styles.inviteCopyButton} onPress={copyInviteLink}>
                  <Ionicons name="link-outline" size={14} color={Colors.primary} />
                  <Text style={styles.inviteCopyButtonText}>Copiar link de convite</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity style={styles.inviteShareButton} onPress={shareInviteCode}>
                <Ionicons name="share-social-outline" size={14} color={Colors.bg} />
                <Text style={styles.inviteShareButtonText}>Compartilhar codigo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => String(item.idUsuario)}
        renderItem={renderItem}
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
            <Ionicons name="person-remove-outline" size={34} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Nenhum membro encontrado</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { justifyContent: 'center', alignItems: 'center' },
  content: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, gap: Spacing.sm },

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

  addCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: 6,
  },
  label: { ...Typography.label, marginBottom: 0 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
  },
  input: { flex: 1, color: Colors.text, fontSize: FontSize.md, paddingVertical: 11 },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  addButtonText: { color: Colors.bg, fontWeight: '800', fontSize: FontSize.sm },

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
  successBox: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: `${Colors.success}66`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  successText: { color: Colors.success, fontSize: FontSize.sm, flex: 1 },
  inviteBox: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: `${Colors.primary}66`,
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    gap: 6,
  },
  inviteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inviteTitle: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '800' },
  inviteMeta: { color: Colors.textMuted, fontSize: FontSize.xs },
  inviteCode: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.4,
    textAlign: 'center',
    backgroundColor: Colors.surface2,
    borderRadius: Radius.sm,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inviteHint: { color: Colors.textMuted, fontSize: FontSize.xs },
  inviteActions: {
    marginTop: 2,
    gap: 6,
  },
  inviteCopyButton: {
    borderRadius: Radius.sm,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: `${Colors.primary}66`,
  },
  inviteCopyButtonText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '800' },
  inviteShareButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  inviteShareButtonText: { color: Colors.bg, fontSize: FontSize.xs, fontWeight: '800' },

  listContent: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.xl },
  memberRow: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  memberAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: { color: Colors.primary, fontWeight: '800', fontSize: FontSize.sm },
  memberInfo: { flex: 1 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  memberName: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '700', flex: 1 },
  memberEmail: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  roleChip: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  roleChipAdmin: { borderColor: `${Colors.gold}66`, backgroundColor: `${Colors.gold}12` },
  roleChipMember: { borderColor: Colors.border, backgroundColor: Colors.surface2 },
  roleChipText: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '700' },
  clubChip: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    paddingHorizontal: 6,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 110,
  },
  clubChipText: { color: Colors.textMuted, fontSize: 10, fontWeight: '700', flexShrink: 1 },
  removeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: `${Colors.danger}66`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleButton: {
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 7,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleButtonPromote: {
    backgroundColor: Colors.primary,
  },
  roleButtonDemote: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleButtonText: { color: Colors.bg, fontSize: FontSize.xs, fontWeight: '700' },
  roleButtonTextDemote: { color: Colors.textMuted },

  emptyWrap: { alignItems: 'center', paddingVertical: Spacing.xl },
  emptyTitle: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: 6 },
});
