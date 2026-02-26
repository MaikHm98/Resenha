import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import api from '../api/api';
import { Colors, FontSize, Spacing } from '../theme';
import { AppStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'CreateMatch'>;
  route: RouteProp<AppStackParamList, 'CreateMatch'>;
};

function formatDateDisplay(d: Date): string {
  return d.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }) + '  ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function CreateMatchScreen({ navigation, route }: Props) {
  const { groupId, limiteGrupo } = route.params;

  const [dataHora, setDataHora] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 2, 0, 0, 0);
    return d;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [limiteVagas, setLimiteVagas] = useState('16');
  const [observacao, setObservacao] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  function onDateChange(_: any, selected?: Date) {
    setShowDatePicker(false);
    if (!selected) return;
    const updated = new Date(selected);
    updated.setHours(dataHora.getHours(), dataHora.getMinutes());
    setDataHora(updated);
    if (Platform.OS === 'android') {
      setTimeout(() => setShowTimePicker(true), 100);
    }
  }

  function onTimeChange(_: any, selected?: Date) {
    setShowTimePicker(false);
    if (!selected) return;
    const updated = new Date(dataHora);
    updated.setHours(selected.getHours(), selected.getMinutes());
    setDataHora(updated);
  }

  async function handleCriar() {
    const vagas = parseInt(limiteVagas, 10);
    if (isNaN(vagas) || vagas < 2 || vagas > limiteGrupo) {
      setErro(`O limite de vagas deve ser entre 2 e ${limiteGrupo}.`);
      return;
    }
    if (dataHora <= new Date()) {
      setErro('A data/hora deve ser no futuro.');
      return;
    }

    setErro('');
    setCarregando(true);
    try {
      await api.post('/api/matches', {
        idGrupo: groupId,
        dataHoraJogo: dataHora.toISOString(),
        limiteVagas: vagas,
        observacao: observacao.trim() || undefined,
      });
      navigation.goBack();
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Não foi possível criar a partida.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        {/* Data e Hora */}
        <Text style={styles.label}>Data e Hora</Text>

        {Platform.OS === 'ios' ? (
          <DateTimePicker
            value={dataHora}
            mode="datetime"
            display="spinner"
            minimumDate={new Date()}
            onChange={(_, d) => d && setDataHora(d)}
            style={{ marginBottom: Spacing.sm }}
            textColor={Colors.text}
          />
        ) : (
          <>
            <TouchableOpacity
              style={styles.dateField}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>{formatDateDisplay(dataHora)}</Text>
              <Text style={styles.dateIcon}>📅</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dataHora}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={onDateChange}
              />
            )}
            {showTimePicker && (
              <DateTimePicker
                value={dataHora}
                mode="time"
                is24Hour
                display="default"
                onChange={onTimeChange}
              />
            )}
          </>
        )}

        {/* Limite de vagas */}
        <Text style={styles.label}>Limite de Vagas</Text>
        <TextInput
          style={styles.input}
          value={limiteVagas}
          onChangeText={setLimiteVagas}
          keyboardType="number-pad"
          maxLength={3}
          placeholderTextColor={Colors.textMuted}
        />
        <Text style={styles.hint}>Máximo: {limiteGrupo} (limite do grupo)</Text>

        {/* Observação */}
        <Text style={styles.label}>Observação (opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={observacao}
          onChangeText={setObservacao}
          placeholder="Ex: Levar coletes, campo coberto..."
          placeholderTextColor={Colors.textMuted}
          multiline
          numberOfLines={3}
          maxLength={255}
        />

        {erro !== '' && <Text style={styles.erro}>{erro}</Text>}

        <TouchableOpacity
          style={[styles.botao, carregando && { opacity: 0.6 }]}
          onPress={handleCriar}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color={Colors.bg} />
          ) : (
            <Text style={styles.botaoText}>Criar Partida</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.md },
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
  dateField: {
    backgroundColor: Colors.surface2,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: { color: Colors.primary, fontSize: FontSize.md, fontWeight: '600' },
  dateIcon: { fontSize: 18 },
  input: {
    backgroundColor: Colors.surface2,
    color: Colors.text,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    marginBottom: 6,
    fontSize: FontSize.md,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  hint: { color: Colors.textMuted, fontSize: FontSize.xs, marginBottom: Spacing.md },
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
  botaoText: { color: Colors.bg, fontWeight: 'bold', fontSize: FontSize.md },
});
