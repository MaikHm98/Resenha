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
  navigation: NativeStackNavigationProp<AppStackParamList, 'CreateGroup'>;
};

export default function CreateGroupScreen({ navigation }: Props) {
  const [nome, setNome] = useState('');
  const [limite, setLimite] = useState('24');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleCriar() {
    const limiteNum = parseInt(limite, 10);

    if (!nome.trim()) {
      setErro('Informe o nome do grupo.');
      return;
    }
    if (isNaN(limiteNum) || limiteNum < 2 || limiteNum > 100) {
      setErro('O limite de jogadores deve ser entre 2 e 100.');
      return;
    }

    setErro('');
    setCarregando(true);

    try {
      await api.post('/api/groups', { nome: nome.trim(), limiteJogadores: limiteNum });
      navigation.goBack();
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Não foi possível criar o grupo.');
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
        <Text style={styles.label}>Nome do Grupo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Resenha do Bairro"
          placeholderTextColor={Colors.textMuted}
          value={nome}
          onChangeText={setNome}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Limite de Jogadores</Text>
        <TextInput
          style={styles.input}
          placeholder="24"
          placeholderTextColor={Colors.textMuted}
          keyboardType="number-pad"
          value={limite}
          onChangeText={setLimite}
          maxLength={3}
        />
        <Text style={styles.hint}>Máximo de membros que podem entrar no grupo.</Text>

        {erro !== '' && <Text style={styles.erro}>{erro}</Text>}

        <TouchableOpacity
          style={[styles.botao, carregando && { opacity: 0.6 }]}
          onPress={handleCriar}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color={Colors.bg} />
          ) : (
            <Text style={styles.botaoText}>Criar Grupo</Text>
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
  },
  label: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.surface2,
    color: Colors.text,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    marginBottom: 6,
    fontSize: FontSize.md,
  },
  hint: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginBottom: Spacing.md,
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
    marginTop: Spacing.sm,
  },
  botaoText: {
    color: Colors.bg,
    fontWeight: 'bold',
    fontSize: FontSize.md,
  },
});
