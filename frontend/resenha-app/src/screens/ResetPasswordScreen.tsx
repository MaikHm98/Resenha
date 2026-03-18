import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../navigation/AppNavigator';
import { Colors, FontSize, Radius, Spacing, Typography } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import FeedbackBanner from '../components/FeedbackBanner';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ResetPassword'>;
  route: RouteProp<AuthStackParamList, 'ResetPassword'>;
};

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const { validateResetToken, resetPassword } = useAuth();
  const [token, setToken] = useState(route.params?.token ?? '');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [tokenValido, setTokenValido] = useState(false);
  const [tokenValidado, setTokenValidado] = useState(false);
  const [validando, setValidando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function handleValidateToken() {
    const tokenTrim = token.trim();
    if (!tokenTrim) {
      setErro('Informe o token de recuperacao.');
      setTokenValido(false);
      setTokenValidado(false);
      return;
    }

    setErro('');
    setSucesso('');
    setValidando(true);
    try {
      const valido = await validateResetToken(tokenTrim);
      setTokenValido(valido);
      setTokenValidado(true);
      if (!valido) {
        setErro('Token invalido ou expirado.');
      }
    } catch {
      setTokenValido(false);
      setTokenValidado(true);
      setErro('Nao foi possivel validar o token.');
    } finally {
      setValidando(false);
    }
  }

  useEffect(() => {
    if (route.params?.token) {
      handleValidateToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleReset() {
    if (!token.trim()) {
      setErro('Informe o token de recuperacao.');
      return;
    }
    if (!tokenValido) {
      setErro('Valide um token valido antes de redefinir a senha.');
      return;
    }
    if (senha.length < 8 || !/[A-Z]/.test(senha) || !/[0-9]/.test(senha)) {
      setErro('Senha deve ter no minimo 8 caracteres, 1 numero e 1 letra maiuscula.');
      return;
    }

    setErro('');
    setCarregando(true);
    try {
      await resetPassword(token.trim(), senha);
      setSucesso('Senha redefinida com sucesso. Faca login novamente.');
      setTimeout(() => navigation.navigate('Login'), 900);
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Nao foi possivel redefinir a senha.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled={Platform.OS === 'ios'}
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
                <Ionicons name="lock-open-outline" size={14} color="#7CFF4F" />
                <Text style={styles.matchTagText}>REDEFINIR SENHA</Text>
              </View>

              <View style={styles.brandRow}>
                <Text style={styles.titulo}>Resenha App</Text>
              </View>

              <Text style={styles.label}>Token de recuperacao</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="shield-outline" size={17} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  value={token}
                  onChangeText={(v) => {
                    setToken(v);
                    setTokenValido(false);
                    setTokenValidado(false);
                    setSucesso('');
                    setErro('');
                  }}
                  placeholder="Cole o token"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  textContentType="none"
                  keyboardAppearance={Platform.OS === 'ios' ? 'default' : undefined}
                  importantForAutofill={Platform.OS === 'android' ? 'no' : 'auto'}
                  disableFullscreenUI={Platform.OS === 'android'}
                  returnKeyType="next"
                />
              </View>
              <Text style={styles.info}>Passo 1: valide o token recebido por e-mail.</Text>

              <Text style={styles.label}>Nova senha</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="key-outline" size={17} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  value={senha}
                  onChangeText={setSenha}
                  placeholder="Nova senha forte"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showSenha}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete={Platform.OS === 'ios' ? 'new-password' : 'off'}
                  textContentType={Platform.OS === 'ios' ? 'newPassword' : 'none'}
                  keyboardAppearance={Platform.OS === 'ios' ? 'default' : undefined}
                  importantForAutofill={Platform.OS === 'android' ? 'no' : 'auto'}
                  disableFullscreenUI={Platform.OS === 'android'}
                  returnKeyType="done"
                  onSubmitEditing={handleReset}
                />
                <Pressable onPress={() => setShowSenha((prev) => !prev)}>
                  <Ionicons name={showSenha ? 'eye-off-outline' : 'eye-outline'} size={17} color={Colors.textMuted} />
                </Pressable>
              </View>

              <Text style={styles.hint}>Passo 2: senha com minimo 8 caracteres, 1 numero e 1 letra maiuscula.</Text>

              {validando && <Text style={styles.info}>Validando token...</Text>}
              {!validando && tokenValidado && token !== '' && (
                <Text style={[styles.info, { color: tokenValido ? Colors.success : Colors.textMuted }]}>
                  {tokenValido ? 'Token validado com sucesso.' : 'Token invalido.'}
                </Text>
              )}
              {erro !== '' && <FeedbackBanner variant="error" message={erro} />}
              {sucesso !== '' && <FeedbackBanner variant="success" message={sucesso} />}

              <TouchableOpacity
                style={[styles.botaoSecundario, validando && styles.botaoDesabilitado]}
                onPress={handleValidateToken}
                disabled={validando}
              >
                <Text style={styles.botaoSecundarioTexto}>Validar token</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botao, (carregando || !tokenValido) && styles.botaoDesabilitado]}
                onPress={handleReset}
                disabled={carregando || validando || !tokenValido}
              >
                <LinearGradient colors={['#B6FF00', '#35F57B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.botaoGradient}>
                  {carregando ? <ActivityIndicator color={Colors.bg} /> : <Text style={styles.botaoTexto}>Salvar nova senha</Text>}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>Voltar para login</Text>
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
  container: { flex: 1, backgroundColor: '#040b07' },
  bgGradient: { flex: 1 },
  scrollContent: {
    justifyContent: Platform.OS === 'ios' ? 'center' : 'flex-start',
    flexGrow: 1,
    padding: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? Spacing.lg : Spacing.xl,
  },
  stadiumGlowTop: {
    position: 'absolute',
    top: -120,
    left: -60,
    right: -60,
    height: 240,
    backgroundColor: '#7CFF4F18',
    borderRadius: 180,
    pointerEvents: 'none',
  },
  stadiumGlowBottom: {
    position: 'absolute',
    bottom: -110,
    left: -100,
    right: -100,
    height: 220,
    backgroundColor: '#35F57B14',
    borderRadius: 180,
    pointerEvents: 'none',
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
  cardGradient: { padding: Spacing.lg },
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
  matchTagText: { color: '#7CFF4F', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
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
  input: { flex: 1, color: Colors.text, paddingVertical: 13, fontSize: 16 },
  hint: { color: Colors.textMuted, fontSize: 12, marginBottom: Spacing.sm },
  info: { color: Colors.textMuted, fontSize: FontSize.xs, marginBottom: 4 },
  botao: { borderRadius: Radius.md, marginBottom: Spacing.md, overflow: 'hidden' },
  botaoGradient: { paddingVertical: 14, alignItems: 'center' },
  botaoSecundario: {
    borderWidth: 1,
    borderColor: '#2e5c44',
    backgroundColor: '#132b1f',
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  botaoDesabilitado: { opacity: 0.6 },
  botaoTexto: { color: '#041022', fontWeight: '800', fontSize: 16, letterSpacing: 0.6, fontFamily: bubbleFamily },
  botaoSecundarioTexto: { color: Colors.text, fontWeight: '700', fontSize: FontSize.sm },
  link: { color: '#7CFF4F', textAlign: 'center', fontSize: 13, fontWeight: '700' },
});
