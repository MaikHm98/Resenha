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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../api/api';
import { Colors, FontSize, Radius, Spacing, Typography } from '../theme';
import { AppStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'JoinGroup'>;
};

export default function JoinGroupScreen({ navigation }: Props) {
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleEntrar() {
    if (codigo.trim().length !== 8) {
      setErro('O codigo de convite deve ter 8 caracteres.');
      return;
    }

    setErro('');
    setCarregando(true);

    try {
      await api.post('/api/groups/join', { codigoConvite: codigo.trim().toUpperCase() });
      navigation.goBack();
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Codigo invalido ou expirado.');
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
        <View style={styles.iconBadge}>
          <Ionicons name="key-outline" size={22} color={Colors.primary} />
        </View>

        <Text style={styles.titulo}>Codigo de Convite</Text>
        <Text style={styles.sub}>Peca o codigo ao administrador do grupo.</Text>

        <Text style={styles.label}>Codigo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: AB12CD34"
          placeholderTextColor={Colors.textMuted}
          value={codigo}
          onChangeText={(t) => setCodigo(t.toUpperCase())}
          autoCapitalize="characters"
          maxLength={8}
          autoCorrect={false}
          autoComplete="off"
          textContentType="none"
          keyboardAppearance={Platform.OS === 'ios' ? 'default' : undefined}
          returnKeyType="done"
          onSubmitEditing={handleEntrar}
        />

        {erro !== '' && <Text style={styles.erro}>{erro}</Text>}

        <TouchableOpacity
          style={[styles.botao, carregando && { opacity: 0.6 }]}
          onPress={handleEntrar}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color={Colors.bg} />
          ) : (
            <Text style={styles.botaoText}>Entrar no Grupo</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  titulo: {
    ...Typography.title,
    fontSize: FontSize.xl,
    marginBottom: 6,
  },
  sub: {
    ...Typography.subtitle,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  label: {
    ...Typography.label,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surface2,
    color: Colors.primary,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 6,
    textAlign: 'center',
    width: '100%',
    marginBottom: Spacing.sm,
  },
  erro: {
    color: Colors.danger,
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  botao: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    marginTop: Spacing.sm,
  },
  botaoText: {
    color: Colors.bg,
    fontWeight: '800',
    fontSize: FontSize.md,
  },
});
