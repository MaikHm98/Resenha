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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../api/api';
import { Colors, FontSize, Spacing } from '../theme';
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
      setErro('O código de convite deve ter 8 caracteres.');
      return;
    }

    setErro('');
    setCarregando(true);

    try {
      await api.post('/api/groups/join', { codigoConvite: codigo.trim().toUpperCase() });
      navigation.goBack();
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Código inválido ou expirado.');
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
        <Text style={styles.emoji}>🔑</Text>
        <Text style={styles.titulo}>Código de Convite</Text>
        <Text style={styles.sub}>Peça o código ao administrador do grupo.</Text>

        <TextInput
          style={styles.input}
          placeholder="Ex: AB12CD34"
          placeholderTextColor={Colors.textMuted}
          value={codigo}
          onChangeText={(t) => setCodigo(t.toUpperCase())}
          autoCapitalize="characters"
          maxLength={8}
          autoCorrect={false}
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
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  emoji: { fontSize: 48, marginBottom: Spacing.sm },
  titulo: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  sub: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.surface2,
    color: Colors.primary,
    borderRadius: 10,
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
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    marginTop: Spacing.sm,
  },
  botaoText: {
    color: Colors.bg,
    fontWeight: 'bold',
    fontSize: FontSize.md,
  },
});
