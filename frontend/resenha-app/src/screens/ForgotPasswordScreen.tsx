import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    >
      <View style={styles.card}>
        <View style={styles.brandRow}>
          <View style={styles.logoCircle}>
            <Ionicons name="key-outline" size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.titulo}>Recuperar senha</Text>
            <Text style={styles.subtitulo}>Enviaremos instrucoes para seu e-mail</Text>
          </View>
        </View>

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
          />
        </View>
        <Text style={styles.hint}>Se o e-mail estiver cadastrado, voce recebera o link em instantes.</Text>

        {erro !== '' && <FeedbackBanner variant="error" message={erro} />}
        {sucesso !== '' && <FeedbackBanner variant="success" message={sucesso} />}

        <TouchableOpacity
          style={[styles.botao, carregando && styles.botaoDesabilitado]}
          onPress={handleSend}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color={Colors.bg} />
          ) : (
            <Text style={styles.botaoTexto}>Enviar instrucoes</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
          <Text style={styles.linkSecondary}>Ja tenho token para redefinir</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Voltar para login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', padding: Spacing.lg },
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
  titulo: { ...Typography.title, fontSize: FontSize.xl },
  subtitulo: { ...Typography.subtitle, marginTop: 2 },
  label: { ...Typography.label, marginBottom: 6 },
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
  input: { flex: 1, color: Colors.text, paddingVertical: 12, fontSize: FontSize.md },
  hint: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: -4, marginBottom: Spacing.sm },
  botao: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  botaoDesabilitado: { opacity: 0.6 },
  botaoTexto: { color: Colors.bg, fontWeight: '800', fontSize: FontSize.md },
  link: { color: Colors.primary, textAlign: 'center', fontSize: FontSize.sm, fontWeight: '600' },
  linkSecondary: { color: Colors.textMuted, textAlign: 'center', fontSize: FontSize.xs, marginBottom: Spacing.sm, fontWeight: '600' },
});
