import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { AuthStackParamList } from '../navigation/AppNavigator';
import { Colors, FontSize, Radius, Spacing, Typography } from '../theme';
import FeedbackBanner from '../components/FeedbackBanner';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [foco, setFoco] = useState<'email' | 'senha' | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [showSenha, setShowSenha] = useState(false);

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

  async function handleLogin() {
    if (!email.trim() || !senha.trim()) {
      setErro('Preencha todos os campos.');
      return;
    }

    const emailNormalizado = email.trim().toLowerCase();
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado);
    if (!emailValido) {
      setErro('Informe um e-mail valido. Exemplo: nome@dominio.com');
      return;
    }

    setErro('');
    setCarregando(true);

    try {
      await login(emailNormalizado, senha);
    } catch (e: any) {
      const mensagem = extractApiMessage(
        e,
        'Nao foi possivel entrar. Verifique usuario, senha e conexao com API.'
      );
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
                <Ionicons name="football-outline" size={14} color="#7CFF4F" />
                <Text style={styles.matchTagText}>MATCHDAY LOGIN</Text>
              </View>

              <View style={styles.brandRow}>
                <Text style={styles.titulo}>Resenha App</Text>
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
                  onFocus={() => setFoco('email')}
                  onBlur={() => setFoco(null)}
                />
              </View>

              <Text style={styles.label}>Senha</Text>
              <View style={[styles.inputWrap, foco === 'senha' && styles.inputWrapFocus]}>
                <Ionicons name="lock-closed-outline" size={17} color={foco === 'senha' ? '#7CFF4F' : Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Sua senha"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showSenha}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  textContentType="password"
                  keyboardAppearance={Platform.OS === 'ios' ? 'default' : undefined}
                  returnKeyType="go"
                  value={senha}
                  onChangeText={setSenha}
                  onFocus={() => setFoco('senha')}
                  onBlur={() => setFoco(null)}
                  onSubmitEditing={handleLogin}
                />
                <Pressable onPress={() => setShowSenha((prev) => !prev)}>
                  <Ionicons
                    name={showSenha ? 'eye-off-outline' : 'eye-outline'}
                    size={17}
                    color={foco === 'senha' ? '#7CFF4F' : Colors.textMuted}
                  />
                </Pressable>
              </View>
              <Text style={styles.hint}>Use os mesmos dados do seu cadastro.</Text>

              {erro !== '' && <FeedbackBanner variant="error" message={erro} />}

              <TouchableOpacity
                style={[styles.botao, carregando && styles.botaoDesabilitado]}
                onPress={handleLogin}
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
                    <Text style={styles.botaoTexto}>Entrar em Campo</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword', { email: email.trim().toLowerCase() || undefined })}>
                <Text style={styles.linkSecondary}>Esqueci minha senha</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.link}>Nao tem conta? Criar conta</Text>
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
  bgGradient: {
    flex: 1,
  },
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
  subtitulo: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 1,
    fontFamily: bubbleFamily,
  },
  label: {
    ...Typography.label,
    marginBottom: 6,
    color: '#9ab89d',
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
    fontSize: FontSize.xs,
    marginTop: -4,
    marginBottom: Spacing.sm,
  },
  botao: {
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  botaoGradient: { paddingVertical: 14, alignItems: 'center' },
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
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  linkSecondary: {
    color: '#8fa890',
    textAlign: 'center',
    fontSize: 12,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
});
