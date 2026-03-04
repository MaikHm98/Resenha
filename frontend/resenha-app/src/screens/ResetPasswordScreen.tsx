import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
    >
      <View style={styles.card}>
        <View style={styles.brandRow}>
          <View style={styles.logoCircle}>
            <Ionicons name="lock-open-outline" size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.titulo}>Redefinir senha</Text>
            <Text style={styles.subtitulo}>Valide o token e defina sua nova senha</Text>
          </View>
        </View>

        <Text style={styles.label}>Token de recuperacao</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="shield-outline" size={18} color={Colors.textMuted} />
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
          />
        </View>
        <Text style={styles.info}>Passo 1: valide o token recebido por e-mail.</Text>

        <Text style={styles.label}>Nova senha</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="key-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
            placeholder="Nova senha forte"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry={!showSenha}
          />
          <Pressable onPress={() => setShowSenha((prev) => !prev)}>
            <Ionicons name={showSenha ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
          </Pressable>
        </View>

        <Text style={styles.hint}>Passo 2: crie uma senha com minimo 8 caracteres, 1 numero e 1 letra maiuscula.</Text>

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
          {carregando ? <ActivityIndicator color={Colors.bg} /> : <Text style={styles.botaoTexto}>Salvar nova senha</Text>}
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
  hint: { color: Colors.textMuted, fontSize: FontSize.xs, marginBottom: Spacing.sm },
  info: { color: Colors.textMuted, fontSize: FontSize.xs, marginBottom: 4 },
  botao: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  botaoSecundario: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  botaoDesabilitado: { opacity: 0.6 },
  botaoTexto: { color: Colors.bg, fontWeight: '800', fontSize: FontSize.md },
  botaoSecundarioTexto: { color: Colors.text, fontWeight: '700', fontSize: FontSize.sm },
  link: { color: Colors.primary, textAlign: 'center', fontSize: FontSize.sm, fontWeight: '600' },
});
