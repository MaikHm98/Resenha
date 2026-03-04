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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { AuthStackParamList } from '../navigation/AppNavigator';
import { Colors, FontSize, Radius, Spacing } from '../theme';
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
  const [foco, setFoco] = useState<'nome' | 'email' | 'senha' | null>(null);
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
      <LinearGradient
        colors={['#040b07', '#071710', '#050f0a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bgGradient}
      >
        <View style={styles.stadiumGlowTop} />
        <View style={styles.stadiumGlowBottom} />

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <LinearGradient
              colors={['#0f2618', '#0c1f14']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <View style={styles.matchTag}>
                <Ionicons name="person-add-outline" size={14} color="#7CFF4F" />
                <Text style={styles.matchTagText}>MATCHDAY SIGNUP</Text>
              </View>

              <View style={styles.brandRow}>
                <Text style={styles.titulo}>Resenha App</Text>
              </View>

              <Text style={styles.label}>Nome</Text>
              <View style={[styles.inputWrap, foco === 'nome' && styles.inputWrapFocus]}>
                <Ionicons name="person-outline" size={17} color={foco === 'nome' ? '#7CFF4F' : Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Seu nome"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoComplete="name"
                  textContentType="name"
                  keyboardAppearance={Platform.OS === 'ios' ? 'default' : undefined}
                  returnKeyType="next"
                  value={nome}
                  onChangeText={setNome}
                  onFocus={() => setFoco('nome')}
                  onBlur={() => setFoco(null)}
                />
              </View>

              <Text style={styles.label}>E-mail</Text>
              <View style={[styles.inputWrap, foco === 'email' && styles.inputWrapFocus]}>
                <Ionicons name="mail-outline" size={17} color={foco === 'email' ? '#7CFF4F' : Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="seuemail@dominio.com"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  keyboardAppearance={Platform.OS === 'ios' ? 'default' : undefined}
                  returnKeyType="next"
                  value={email}
                  onChangeText={setEmail}
                  editable={inviteCode === ''}
                  onFocus={() => setFoco('email')}
                  onBlur={() => setFoco(null)}
                />
              </View>
              {inviteCode !== '' && (
                <View style={styles.inviteInfo}>
                  <Ionicons name="mail-open-outline" size={14} color="#7CFF4F" />
                  <Text style={styles.inviteInfoText}>Cadastro por convite: e-mail bloqueado para seguranca.</Text>
                </View>
              )}

              <Text style={styles.label}>Senha</Text>
              <View style={[styles.inputWrap, foco === 'senha' && styles.inputWrapFocus]}>
                <Ionicons name="lock-closed-outline" size={17} color={foco === 'senha' ? '#7CFF4F' : Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Crie uma senha"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showSenha}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                  textContentType="newPassword"
                  keyboardAppearance={Platform.OS === 'ios' ? 'default' : undefined}
                  returnKeyType="done"
                  value={senha}
                  onChangeText={setSenha}
                  onFocus={() => setFoco('senha')}
                  onBlur={() => setFoco(null)}
                  onSubmitEditing={handleRegister}
                />
                <Pressable onPress={() => setShowSenha((prev) => !prev)}>
                  <Ionicons
                    name={showSenha ? 'eye-off-outline' : 'eye-outline'}
                    size={17}
                    color={foco === 'senha' ? '#7CFF4F' : Colors.textMuted}
                  />
                </Pressable>
              </View>
              <Text style={styles.hint}>Minimo 8 caracteres, 1 numero e 1 letra maiuscula.</Text>

              <View style={styles.toggleRow}>
                <View style={styles.toggleTitle}>
                  <Ionicons name="hand-left-outline" size={16} color={Colors.textMuted} />
                  <Text style={styles.toggleLabel}>Jogo como goleiro</Text>
                </View>
                <Switch
                  value={goleiro}
                  onValueChange={setGoleiro}
                  trackColor={{ false: '#244332', true: '#7CFF4F' }}
                  thumbColor={goleiro ? '#0c1f14' : Colors.textMuted}
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
                <LinearGradient
                  colors={['#B6FF00', '#35F57B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.botaoGradient}
                >
                  {carregando ? (
                    <ActivityIndicator color={Colors.bg} />
                  ) : (
                    <Text style={styles.botaoTexto}>Criar Conta</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>Ja tem conta? Entrar</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const bubbleFamily = Platform.select({
  ios: 'Marker Felt',
  android: 'sans-serif-medium',
  web: '"Bubblegum Sans", "Comic Sans MS", cursive',
  default: 'sans-serif',
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040b07',
  },
  bgGradient: { flex: 1 },
  scrollContent: {
    justifyContent: 'center',
    flexGrow: 1,
    padding: Spacing.lg,
  },
  stadiumGlowTop: {
    position: 'absolute',
    top: -120,
    left: -60,
    right: -60,
    height: 240,
    backgroundColor: '#7CFF4F18',
    borderRadius: 180,
  },
  stadiumGlowBottom: {
    position: 'absolute',
    bottom: -110,
    left: -100,
    right: -100,
    height: 220,
    backgroundColor: '#35F57B14',
    borderRadius: 180,
  },
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: '#2d5f43',
    overflow: 'hidden',
    shadowColor: '#7CFF4F',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  cardGradient: {
    padding: Spacing.lg,
  },
  matchTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#7CFF4F66',
    backgroundColor: '#7CFF4F1A',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: Spacing.md,
  },
  matchTagText: {
    color: '#7CFF4F',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  brandRow: { alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  titulo: {
    color: Colors.text,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 1.1,
    fontFamily: bubbleFamily,
  },
  label: {
    marginBottom: 6,
    color: '#9ab89d',
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#173425',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#2e5c44',
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
  },
  inputWrapFocus: {
    borderColor: '#7CFF4F',
    backgroundColor: '#1d3d2c',
    shadowColor: '#7CFF4F',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  input: {
    flex: 1,
    color: Colors.text,
    paddingVertical: 13,
    fontSize: 16,
  },
  hint: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: -4,
    marginBottom: Spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#2e5c44',
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingRight: 8,
    paddingLeft: 10,
    backgroundColor: '#132b1f',
  },
  toggleTitle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  toggleLabel: {
    color: Colors.textMuted,
    fontSize: 13,
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
    color: '#7CFF4F',
    fontSize: 12,
    flex: 1,
  },
  botao: {
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  botaoGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
  botaoTexto: {
    color: '#041022',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.6,
    fontFamily: bubbleFamily,
  },
  link: {
    color: '#7CFF4F',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
  },
});
