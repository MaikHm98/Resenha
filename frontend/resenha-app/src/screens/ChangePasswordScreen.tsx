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
import { useAuth } from '../contexts/AuthContext';
import FeedbackBanner from '../components/FeedbackBanner';
import { Colors, FontSize, Radius, Spacing, Typography } from '../theme';

function PasswordField({
  label,
  value,
  onChangeText,
  visible,
  onToggleVisible,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
  placeholder: string;
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons name="lock-closed-outline" size={16} color={Colors.textMuted} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          textContentType="none"
          keyboardAppearance={Platform.OS === 'ios' ? 'default' : undefined}
          importantForAutofill={Platform.OS === 'android' ? 'no' : 'auto'}
          disableFullscreenUI={Platform.OS === 'android'}
        />
        <TouchableOpacity onPress={onToggleVisible}>
          <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </>
  );
}

export default function ChangePasswordScreen() {
  const { changePassword } = useAuth();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarAtual, setMostrarAtual] = useState(false);
  const [mostrarNova, setMostrarNova] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function handleSalvar() {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setErro('Preencha todos os campos.');
      setSucesso('');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('A confirmacao da nova senha nao confere.');
      setSucesso('');
      return;
    }

    if (novaSenha.length < 8 || !/[A-Z]/.test(novaSenha) || !/[0-9]/.test(novaSenha)) {
      setErro('Senha deve ter no minimo 8 caracteres, 1 numero e 1 letra maiuscula.');
      setSucesso('');
      return;
    }

    setErro('');
    setSucesso('');
    setCarregando(true);

    try {
      await changePassword(senhaAtual, novaSenha);
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      setSucesso('Senha alterada com sucesso.');
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Nao foi possivel alterar a senha.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 84 : 0}
      enabled={Platform.OS === 'ios'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      >
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.headerIcon}>
              <Ionicons name="shield-checkmark-outline" size={22} color={Colors.primary} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Seguranca da Conta</Text>
              <Text style={styles.subtitle}>Troque sua senha mantendo a sessao ativa.</Text>
            </View>
          </View>

          <PasswordField
            label="Senha Atual"
            value={senhaAtual}
            onChangeText={setSenhaAtual}
            visible={mostrarAtual}
            onToggleVisible={() => setMostrarAtual((prev) => !prev)}
            placeholder="Digite sua senha atual"
          />

          <PasswordField
            label="Nova Senha"
            value={novaSenha}
            onChangeText={setNovaSenha}
            visible={mostrarNova}
            onToggleVisible={() => setMostrarNova((prev) => !prev)}
            placeholder="Digite a nova senha"
          />

          <PasswordField
            label="Confirmar Nova Senha"
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            visible={mostrarConfirmacao}
            onToggleVisible={() => setMostrarConfirmacao((prev) => !prev)}
            placeholder="Repita a nova senha"
          />

          <Text style={styles.hint}>Minimo 8 caracteres, 1 numero e 1 letra maiuscula.</Text>

          {erro !== '' && <FeedbackBanner variant="error" message={erro} />}
          {sucesso !== '' && <FeedbackBanner variant="success" message={sucesso} />}

          <TouchableOpacity style={[styles.botao, carregando && styles.botaoDesabilitado]} onPress={handleSalvar} disabled={carregando}>
            {carregando ? <ActivityIndicator color={Colors.bg} /> : <Text style={styles.botaoTexto}>Salvar nova senha</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.md, paddingBottom: Spacing.xl },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  title: {
    ...Typography.title,
    fontSize: FontSize.lg,
  },
  subtitle: {
    ...Typography.subtitle,
    marginTop: 2,
  },
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
  input: {
    flex: 1,
    color: Colors.text,
    paddingVertical: 12,
    fontSize: FontSize.md,
  },
  hint: { color: Colors.textMuted, fontSize: FontSize.xs, marginBottom: Spacing.md },
  botao: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botaoDesabilitado: { opacity: 0.6 },
  botaoTexto: { color: Colors.bg, fontWeight: '800', fontSize: FontSize.sm },
});
