import React, { useState } from 'react';
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

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
  route: RouteProp<AuthStackParamList, 'Register'>;
};

export default function RegisterScreen({ navigation, route }: Props) {
  const { register } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [senha, setSenha] = useState('');
  const [goleiro, setGoleiro] = useState(false);
  const [inviteCode] = useState(route.params?.invite ?? '');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [showSenha, setShowSenha] = useState(false);

  async function handleRegister() {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      setErro('Preencha todos os campos.');
      return;
    }

    setErro('');
    setCarregando(true);

    try {
      await register(nome.trim(), email.trim(), senha, goleiro, inviteCode || undefined);
    } catch (e: any) {
      const mensagem =
        e?.response?.data?.mensagem ||
        'Nao foi possivel criar a conta. Tente novamente.';
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
            <Text style={styles.subtitulo}>Entre para a sua resenha</Text>
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

        {erro !== '' && <Text style={styles.erro}>{erro}</Text>}

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
  erro: {
    color: Colors.danger,
    fontSize: FontSize.xs,
    marginBottom: Spacing.sm,
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
