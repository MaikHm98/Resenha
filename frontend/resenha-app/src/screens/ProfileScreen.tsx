import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ClubPicker from '../components/ClubPicker';
import ClubLogo from '../components/ClubLogo';
import FeedbackBanner from '../components/FeedbackBanner';
import { useAuth } from '../contexts/AuthContext';
import { ClubOption } from '../types';
import { Colors, FontSize, Radius, Spacing, Typography } from '../theme';

export default function ProfileScreen() {
  const { user, getClubOptions, updateProfile } = useAuth();
  const [nome, setNome] = useState(user?.nome ?? '');
  const [goleiro, setGoleiro] = useState(!!user?.goleiro);
  const [timeCoracaoCodigo, setTimeCoracaoCodigo] = useState<string | undefined>(user?.timeCoracaoCodigo);
  const [clubes, setClubes] = useState<ClubOption[]>([]);
  const [carregandoClubes, setCarregandoClubes] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  useEffect(() => {
    setNome(user?.nome ?? '');
    setGoleiro(!!user?.goleiro);
    setTimeCoracaoCodigo(user?.timeCoracaoCodigo);
  }, [user?.nome, user?.goleiro, user?.timeCoracaoCodigo]);

  useEffect(() => {
    async function carregarClubes() {
      setCarregandoClubes(true);
      try {
        setClubes(await getClubOptions());
      } catch {
        setClubes([]);
      } finally {
        setCarregandoClubes(false);
      }
    }

    carregarClubes();
  }, [getClubOptions]);

  async function handleSalvar() {
    const nomeNormalizado = nome.trim();
    if (!nomeNormalizado) {
      setErro('Informe seu nome.');
      setSucesso('');
      return;
    }
    if (nomeNormalizado.length < 2) {
      setErro('Nome deve ter pelo menos 2 caracteres.');
      setSucesso('');
      return;
    }

    setErro('');
    setSucesso('');
    setSalvando(true);
    try {
      await updateProfile({ nome: nomeNormalizado, goleiro, timeCoracaoCodigo });
      setSucesso('Perfil atualizado com sucesso.');
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Nao foi possivel atualizar o perfil.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            {user?.timeCoracaoEscudoUrl ? (
              <ClubLogo
                uri={user.timeCoracaoEscudoUrl}
                clubName={user?.timeCoracaoNome ?? user?.nome}
                size={38}
              />
            ) : (
              <Text style={styles.avatarText}>
                {user?.nome
                  ?.split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase() || 'U'}
              </Text>
            )}
          </View>
          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{user?.nome}</Text>
            </View>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>

        <Text style={styles.label}>Nome</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="person-outline" size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Seu nome"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="words"
            autoCorrect={false}
            autoComplete="name"
            textContentType="name"
            keyboardAppearance={Platform.OS === 'ios' ? 'default' : undefined}
            returnKeyType="done"
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleTitle}>
            <Ionicons name="hand-left-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.toggleLabel}>Jogo como goleiro</Text>
          </View>
          <Switch
            value={goleiro}
            onValueChange={setGoleiro}
            trackColor={{ false: Colors.primarySoft, true: Colors.primary }}
            thumbColor={goleiro ? Colors.bg : Colors.textMuted}
          />
        </View>

        <Text style={styles.label}>Time do Coracao (Opcional)</Text>
        <ClubPicker
          clubs={clubes}
          selectedCode={timeCoracaoCodigo}
          loading={carregandoClubes}
          onSelect={(code) => setTimeCoracaoCodigo(code)}
        />

        {erro !== '' && <FeedbackBanner variant="error" message={erro} />}
        {sucesso !== '' && <FeedbackBanner variant="success" message={sucesso} />}

        <TouchableOpacity style={[styles.botao, salvando && styles.botaoDesabilitado]} onPress={handleSalvar} disabled={salvando}>
          {salvando ? <ActivityIndicator color={Colors.bg} /> : <Text style={styles.botaoTexto}>Salvar perfil</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.md },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: Colors.primary, fontWeight: '800', fontSize: FontSize.md },
  headerInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { ...Typography.title, fontSize: FontSize.lg },
  email: { color: Colors.textMuted, fontSize: FontSize.xs },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
  },
  input: {
    flex: 1,
    color: Colors.text,
    paddingVertical: 12,
    fontSize: FontSize.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: Spacing.md,
  },
  toggleTitle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  toggleLabel: { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: '600' },
  label: { ...Typography.label, marginBottom: 6 },
  botao: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botaoDesabilitado: { opacity: 0.6 },
  botaoTexto: { color: Colors.bg, fontWeight: '800', fontSize: FontSize.sm },
});
