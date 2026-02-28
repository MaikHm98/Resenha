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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { AuthStackParamList } from '../navigation/AppNavigator';
import { Colors, FontSize, Radius, Spacing, Typography } from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [showSenha, setShowSenha] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !senha.trim()) {
      const msg = 'Preencha todos os campos.';
      setErro(msg);
      Alert.alert('Login', msg);
      return;
    }

    const emailNormalizado = email.trim().toLowerCase();
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado);
    if (!emailValido) {
      const msg = 'Informe um e-mail valido. Exemplo: nome@dominio.com';
      setErro(msg);
      Alert.alert('Login', msg);
      return;
    }

    setErro('');
    setCarregando(true);

    try {
      await login(emailNormalizado, senha);
    } catch (e: any) {
      const mensagem =
        e?.response?.data?.mensagem ||
        'Nao foi possivel entrar. Verifique usuario, senha e conexao com API.';
      setErro(mensagem);
      Alert.alert('Falha no login', mensagem);
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
            <Ionicons name="football-outline" size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.titulo}>Resenha</Text>
            <Text style={styles.subtitulo}>Entrar na conta</Text>
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

        <Text style={styles.label}>Senha</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Sua senha"
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

        {erro !== '' && <Text style={styles.erro}>{erro}</Text>}

        <TouchableOpacity
          style={[styles.botao, carregando && styles.botaoDesabilitado]}
          onPress={handleLogin}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color={Colors.bg} />
          ) : (
            <Text style={styles.botaoTexto}>Entrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Nao tem conta? Criar conta</Text>
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
  erro: {
    color: Colors.danger,
    fontSize: FontSize.xs,
    marginBottom: Spacing.sm,
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
