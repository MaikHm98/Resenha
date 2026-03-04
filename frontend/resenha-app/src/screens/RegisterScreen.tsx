import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { AuthStackParamList } from '../navigation/AppNavigator';
import { Colors, FontSize, Radius, Spacing, Typography } from '../theme';
import ClubPicker from '../components/ClubPicker';
import FeedbackBanner from '../components/FeedbackBanner';
import { ClubOption } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
  route: RouteProp<AuthStackParamList, 'Register'>;
};

export default function RegisterScreen({ navigation, route }: Props) {
  const { register, getClubOptions } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [senha, setSenha] = useState('');
  const [goleiro, setGoleiro] = useState(false);
  const [inviteCode] = useState(route.params?.invite ?? '');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const [clubes, setClubes] = useState<ClubOption[]>([]);
  const [carregandoClubes, setCarregandoClubes] = useState(false);
  const [timeCoracaoCodigo, setTimeCoracaoCodigo] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function carregarClubes() {
      setCarregandoClubes(true);
      try {
        const data = await getClubOptions();
        setClubes(data);
      } catch {
        setClubes([]);
      } finally {
        setCarregandoClubes(false);
      }
    }

    carregarClubes();
  }, [getClubOptions]);

  function extractApiMessage(e: any, fallback: string) {
    const msg = e?.response?.data?.mensagem;
    if (msg) return msg;

    const errors = e?.response?.data?.errors;
    if (errors && typeof errors === 'object') {
      const first = Object.values(errors)[0] as string[] | undefined;
      if (first?.[0]) return first[0];
    }

    return fallback;
  }

  async function handleRegister() {
    const nomeNormalizado = nome.trim();
    const emailNormalizado = email.trim().toLowerCase();

    if (!nomeNormalizado || !emailNormalizado || !senha.trim()) {
      setErro('Preencha todos os campos.');
      setAviso('');
      return;
    }

    if (nomeNormalizado.length < 2) {
      setErro('Nome deve ter pelo menos 2 caracteres.');
      setAviso('');
      return;
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado);
    if (!emailValido) {
      setErro('Informe um e-mail valido. Exemplo: nome@dominio.com');
      setAviso('');
      return;
    }

    if (senha.length < 8 || !/[A-Z]/.test(senha) || !/[0-9]/.test(senha)) {
      setErro('Senha deve ter no minimo 8 caracteres, 1 numero e 1 letra maiuscula.');
      setAviso('');
      return;
    }

    setErro('');
    setAviso('');
    setCarregando(true);

    try {
      const result = await register(
        nomeNormalizado,
        emailNormalizado,
        senha,
        goleiro,
        inviteCode || undefined,
        timeCoracaoCodigo
      );
      if (result.inviteJoinWarning) {
        setAviso(result.inviteJoinWarning);
      }
    } catch (e: any) {
      const mensagem = extractApiMessage(e, 'Nao foi possivel criar a conta. Tente novamente.');
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <View style={styles.brandRow}>
          <View style={styles.logoCircle}>
            <Ionicons name="person-add-outline" size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.titulo}>Criar conta</Text>
            <Text style={styles.subtitulo}>Complete seu perfil para comecar</Text>
          </View>
        </View>

        <Text style={styles.label}>Nome</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="person-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="words"
            value={nome}
            onChangeText={setNome}
          />
        </View>
        <Text style={styles.hint}>Minimo 8 caracteres, 1 numero e 1 letra maiuscula.</Text>

        <Text style={styles.label}>E-mail</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="mail-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="seuemail@dominio.com"
            placeholderTextColor={Colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={inviteCode === ''}
          />
        </View>
        {inviteCode !== '' && (
          <View style={styles.inviteInfo}>
            <Ionicons name="mail-open-outline" size={14} color={Colors.primary} />
            <Text style={styles.inviteInfoText}>Cadastro por convite: e-mail bloqueado para seguranca.</Text>
          </View>
        )}

        <Text style={styles.label}>Senha</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Crie uma senha"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry={!showSenha}
            value={senha}
            onChangeText={setSenha}
          />
          <Pressable onPress={() => setShowSenha((prev) => !prev)}>
            <Ionicons
              name={showSenha ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={Colors.textMuted}
            />
          </Pressable>
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

        <Text style={styles.label}>Time do Coracao (opcional)</Text>
        <ClubPicker
          clubs={clubes}
          selectedCode={timeCoracaoCodigo}
          loading={carregandoClubes}
          onSelect={(code) => setTimeCoracaoCodigo(code)}
        />

        {erro !== '' && <FeedbackBanner variant="error" message={erro} />}
        {aviso !== '' && <FeedbackBanner variant="warning" message={aviso} />}

        <TouchableOpacity
          style={[styles.botao, carregando && styles.botaoDesabilitado]}
          onPress={handleRegister}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color={Colors.bg} />
          ) : (
            <Text style={styles.botaoTexto}>Cadastrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Ja tem conta? Entrar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    ...Typography.title,
    fontSize: FontSize.xl,
  },
  subtitulo: {
    ...Typography.subtitle,
    marginTop: 2,
  },
  label: {
    ...Typography.label,
    marginBottom: 6,
  },
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
  hint: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: -4,
    marginBottom: Spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingRight: 8,
    paddingLeft: 10,
  },
  toggleTitle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  toggleLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  inviteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -6,
    marginBottom: Spacing.md,
  },
  inviteInfoText: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    flex: 1,
  },
  botao: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
  botaoTexto: {
    color: Colors.bg,
    fontWeight: '800',
    fontSize: FontSize.md,
  },
  link: {
    color: Colors.primary,
    textAlign: 'center',
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
