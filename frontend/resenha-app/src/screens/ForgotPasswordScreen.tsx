import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
  route: RouteProp<AuthStackParamList, 'ForgotPassword'>;
};

export default function ForgotPasswordScreen({ navigation, route }: Props) {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSend() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setErro('Informe seu e-mail.');
      setSucesso('');
      return;
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
    if (!emailValido) {
      setErro('Informe um e-mail valido. Exemplo: nome@dominio.com');
      setSucesso('');
      return;
    }

    setErro('');
    setSucesso('');
    setCarregando(true);
    try {
      const msg = await forgotPassword(normalizedEmail);
      setSucesso(msg);
    } catch (e: any) {
      const mensagem = e?.response?.data?.mensagem || 'Nao foi possivel enviar a solicitacao.';
      setErro(mensagem);
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
                <Ionicons name="key-outline" size={14} color="#7CFF4F" />
                <Text style={styles.matchTagText}>RECUPERAR SENHA</Text>
              </View>

              <View style={styles.brandRow}>
                <Text style={styles.titulo}>Resenha App</Text>
              </View>

              <Text style={styles.label}>E-mail</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={17} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="seuemail@dominio.com"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete={Platform.OS === 'ios' ? 'email' : 'off'}
                  textContentType={Platform.OS === 'ios' ? 'emailAddress' : 'none'}
                  keyboardAppearance={Platform.OS === 'ios' ? 'default' : undefined}
                  importantForAutofill={Platform.OS === 'android' ? 'no' : 'auto'}
                  disableFullscreenUI={Platform.OS === 'android'}
                  returnKeyType="send"
                  value={email}
                  onChangeText={setEmail}
                  onSubmitEditing={handleSend}
                />
              </View>
              <Text style={styles.hint}>Se o e-mail existir, enviaremos instrucoes para redefinir a senha.</Text>

              {erro !== '' && <FeedbackBanner variant="error" message={erro} />}
              {sucesso !== '' && <FeedbackBanner variant="success" message={sucesso} />}

              <TouchableOpacity
                style={[styles.botao, carregando && styles.botaoDesabilitado]}
                onPress={handleSend}
                disabled={carregando}
              >
                <LinearGradient colors={['#B6FF00', '#35F57B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.botaoGradient}>
                  {carregando ? (
                    <ActivityIndicator color={Colors.bg} />
                  ) : (
                    <Text style={styles.botaoTexto}>Enviar instrucoes</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
                <Text style={styles.linkSecondary}>Ja tenho token para redefinir</Text>
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
  hint: { color: Colors.textMuted, fontSize: 12, marginTop: -4, marginBottom: Spacing.sm },
  botao: { borderRadius: Radius.md, marginBottom: Spacing.md, overflow: 'hidden' },
  botaoGradient: { paddingVertical: 14, alignItems: 'center' },
  botaoDesabilitado: { opacity: 0.6 },
  botaoTexto: { color: '#041022', fontWeight: '800', fontSize: 16, letterSpacing: 0.6, fontFamily: bubbleFamily },
  link: { color: '#7CFF4F', textAlign: 'center', fontSize: 13, fontWeight: '700' },
  linkSecondary: { color: '#8fa890', textAlign: 'center', fontSize: 12, marginBottom: Spacing.sm, fontWeight: '600' },
});
