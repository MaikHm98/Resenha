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
import OptionSelector from '../components/OptionSelector';
import ClubLogo from '../components/ClubLogo';
import FeedbackBanner from '../components/FeedbackBanner';
import { useAuth } from '../contexts/AuthContext';
import { ClubOption } from '../types';
import { Colors, FontSize, Radius, Spacing, Typography } from '../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppNavigator';
import {
  DOMINANT_FOOT_OPTIONS,
  getDominantFootLabel,
  getPlayerPositionLabel,
  PLAYER_POSITION_OPTIONS,
  DominantFootCode,
  PlayerPositionCode,
} from '../constants/playerProfile';

type Props = NativeStackScreenProps<AppStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const { user, getClubOptions, updateProfile } = useAuth();
  const [nome, setNome] = useState(user?.nome ?? '');
  const [goleiro, setGoleiro] = useState(!!user?.goleiro);
  const [timeCoracaoCodigo, setTimeCoracaoCodigo] = useState<string | undefined>(user?.timeCoracaoCodigo);
  const [posicaoPrincipal, setPosicaoPrincipal] = useState<PlayerPositionCode | undefined>(
    user?.posicaoPrincipal as PlayerPositionCode | undefined
  );
  const [peDominante, setPeDominante] = useState<DominantFootCode | undefined>(
    user?.peDominante as DominantFootCode | undefined
  );
  const [clubes, setClubes] = useState<ClubOption[]>([]);
  const [carregandoClubes, setCarregandoClubes] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  useEffect(() => {
    setNome(user?.nome ?? '');
    setGoleiro(!!user?.goleiro);
    setTimeCoracaoCodigo(user?.timeCoracaoCodigo);
    setPosicaoPrincipal(user?.posicaoPrincipal as PlayerPositionCode | undefined);
    setPeDominante(user?.peDominante as DominantFootCode | undefined);
  }, [user?.nome, user?.goleiro, user?.timeCoracaoCodigo, user?.posicaoPrincipal, user?.peDominante]);

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

    if (!posicaoPrincipal) {
      setErro('Selecione sua posicao principal.');
      setSucesso('');
      return;
    }

    if (!peDominante) {
      setErro('Selecione seu pe dominante.');
      setSucesso('');
      return;
    }

    setErro('');
    setSucesso('');
    setSalvando(true);
    try {
      await updateProfile({ nome: nomeNormalizado, goleiro, timeCoracaoCodigo, posicaoPrincipal, peDominante });
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
            <Text style={styles.meta}>
              {[getPlayerPositionLabel(user?.posicaoPrincipal), getDominantFootLabel(user?.peDominante)]
                .filter(Boolean)
                .join(' | ')}
            </Text>
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
            disabled={posicaoPrincipal === 'GOLEIRO'}
            trackColor={{ false: Colors.primarySoft, true: Colors.primary }}
            thumbColor={goleiro ? Colors.bg : Colors.textMuted}
          />
        </View>
        {posicaoPrincipal === 'GOLEIRO' && (
          <Text style={styles.helperText}>Com posicao principal goleiro, este campo permanece ativo.</Text>
        )}

        <Text style={styles.label}>Posicao Principal</Text>
        <OptionSelector
          options={PLAYER_POSITION_OPTIONS}
          selectedValue={posicaoPrincipal}
          onSelect={(value) => {
            setPosicaoPrincipal(value);
            if (value === 'GOLEIRO') {
              setGoleiro(true);
            }
          }}
        />

        <Text style={styles.label}>Pe Dominante</Text>
        <OptionSelector options={DOMINANT_FOOT_OPTIONS} selectedValue={peDominante} onSelect={setPeDominante} />

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

        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('ChangePassword')}>
          <Ionicons name="shield-checkmark-outline" size={16} color={Colors.primary} />
          <Text style={styles.secondaryButtonText}>Alterar senha</Text>
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
  meta: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
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
  helperText: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: -6, marginBottom: Spacing.md },
  botao: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    marginTop: Spacing.sm,
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  botaoDesabilitado: { opacity: 0.6 },
  botaoTexto: { color: Colors.bg, fontWeight: '800', fontSize: FontSize.sm },
  secondaryButtonText: { color: Colors.primary, fontWeight: '800', fontSize: FontSize.sm },
});
