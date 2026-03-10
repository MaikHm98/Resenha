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
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import api from '../api/api';
import { AppStackParamList } from '../navigation/AppNavigator';
import { Colors, FontSize, Radius, Spacing, Typography } from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'CreateMatch'>;
  route: RouteProp<AppStackParamList, 'CreateMatch'>;
};

function proximaOcorrencia(diaSemana: number, horarioFixo: string): Date {
  const [h, m] = horarioFixo.split(':').map(Number);
  const now = new Date();
  const d = new Date();
  d.setHours(h, m, 0, 0);
  const diff = (diaSemana - now.getDay() + 7) % 7;
  d.setDate(now.getDate() + (diff === 0 && d <= now ? 7 : diff));
  return d;
}

function maskData(v: string): string {
  const n = v.replace(/\D/g, '').substring(0, 8);
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
}

function maskHora(v: string): string {
  const n = v.replace(/\D/g, '').substring(0, 4);
  if (n.length <= 2) return n;
  return `${n.slice(0, 2)}:${n.slice(2)}`;
}

function toLocalDateTimeString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${day}T${h}:${min}:${s}`;
}

export default function CreateMatchScreen({ navigation, route }: Props) {
  const { groupId, limiteGrupo, diaSemana, horarioFixo } = route.params;

  const initialDate = proximaOcorrencia(diaSemana ?? 0, horarioFixo ?? '10:00');
  const dataFixa = diaSemana !== undefined && !!horarioFixo;

  const [dataHoraIOS, setDataHoraIOS] = useState(initialDate);

  const fmtDia = (d: Date) =>
    `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  const fmtHora = (d: Date) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  const [dataTexto, setDataTexto] = useState(fmtDia(initialDate));
  const [horaTexto, setHoraTexto] = useState(fmtHora(initialDate));

  const [limiteVagas, setLimiteVagas] = useState(String(limiteGrupo));
  const [observacao, setObservacao] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  function parseAndroid(): Date | null {
    const parts = dataTexto.split('/').map(Number);
    const timeParts = horaTexto.split(':').map(Number);
    if (parts.length !== 3 || timeParts.length !== 2) return null;
    const [dia, mes, ano] = parts;
    const [h, min] = timeParts;
    if (!dia || !mes || !ano || ano < 2024 || isNaN(h) || isNaN(min)) return null;
    const d = new Date(ano, mes - 1, dia, h, min, 0, 0);
    return isNaN(d.getTime()) ? null : d;
  }

  async function handleCriar() {
    const vagas = parseInt(limiteVagas, 10);
    if (isNaN(vagas) || vagas < 2 || vagas > limiteGrupo) {
      setErro(`O limite de vagas deve ser entre 2 e ${limiteGrupo}.`);
      return;
    }

    let dataFinal: Date;
    if (Platform.OS === 'android') {
      const parsed = parseAndroid();
      if (!parsed) {
        setErro('Data ou hora invalida. Use DD/MM/AAAA e HH:MM.');
        return;
      }
      dataFinal = parsed;
    } else {
      dataFinal = dataHoraIOS;
    }

    if (dataFinal <= new Date()) {
      setErro('A data/hora deve ser no futuro.');
      return;
    }

    setErro('');
    setCarregando(true);
    try {
      await api.post('/api/matches', {
        idGrupo: groupId,
        dataHoraJogo: toLocalDateTimeString(dataFinal),
        limiteVagas: vagas,
        observacao: observacao.trim() || undefined,
      });
      navigation.goBack();
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Nao foi possivel criar a partida.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: 'height', default: undefined })}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 84 : 0}
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
            <Ionicons name="calendar-outline" size={22} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.title}>Nova Partida</Text>
            <Text style={styles.subtitle}>Configure data, vagas e observacoes</Text>
          </View>
        </View>

        <Text style={styles.label}>Data e Hora</Text>
        {dataFixa && (
          <View style={styles.fixedHintRow}>
            <Ionicons name="information-circle-outline" size={14} color={Colors.primary} />
            <Text style={styles.hintInline}>Sugestao baseada no horario fixo do grupo.</Text>
          </View>
        )}

        {Platform.OS === 'ios' ? (
          <View style={styles.iosPickerWrap}>
            <DateTimePicker
              value={dataHoraIOS}
              mode="datetime"
              display="spinner"
              minimumDate={new Date()}
              onChange={(_, d) => d && setDataHoraIOS(d)}
              style={styles.iosPicker}
              locale="pt-BR"
              themeVariant="dark"
              textColor={Colors.text}
              accentColor={Colors.primary}
            />
          </View>
        ) : (
          <View style={styles.dataHoraRow}>
            <View style={styles.dataHoraField}>
              <Text style={styles.dataHoraLabel}>Data</Text>
              <View style={styles.inputWrapCompact}>
                <Ionicons name="calendar-number-outline" size={16} color={Colors.textMuted} />
                <TextInput
                  style={styles.dataHoraInput}
                  value={dataTexto}
                  onChangeText={(v) => setDataTexto(maskData(v))}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={10}
                  autoCorrect={false}
                  autoComplete="off"
                  textContentType="none"
                  keyboardAppearance="default"
                  returnKeyType="next"
                />
              </View>
            </View>
            <View style={styles.dataHoraField}>
              <Text style={styles.dataHoraLabel}>Hora</Text>
              <View style={styles.inputWrapCompact}>
                <Ionicons name="time-outline" size={16} color={Colors.textMuted} />
                <TextInput
                  style={styles.dataHoraInput}
                  value={horaTexto}
                  onChangeText={(v) => setHoraTexto(maskHora(v))}
                  placeholder="HH:MM"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={5}
                  autoCorrect={false}
                  autoComplete="off"
                  textContentType="none"
                  keyboardAppearance="default"
                  returnKeyType="next"
                />
              </View>
            </View>
          </View>
        )}

        <Text style={styles.label}>Limite de Vagas</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="people-outline" size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.input}
            value={limiteVagas}
            onChangeText={setLimiteVagas}
            keyboardType="number-pad"
            maxLength={3}
            placeholderTextColor={Colors.textMuted}
            autoCorrect={false}
            autoComplete="off"
            textContentType="none"
            keyboardAppearance="default"
            returnKeyType="next"
          />
        </View>
        <Text style={styles.hint}>Maximo: {limiteGrupo} (limite do grupo)</Text>

        <Text style={styles.label}>Observacao (Opcional)</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="document-text-outline" size={16} color={Colors.textMuted} />
          <TextInput
            style={[styles.input, styles.textArea]}
            value={observacao}
            onChangeText={setObservacao}
            placeholder="Ex: Levar coletes, campo coberto..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
            maxLength={255}
            keyboardAppearance="default"
            returnKeyType="default"
          />
        </View>

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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.md, paddingBottom: Spacing.xl },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.title,
    fontSize: FontSize.xl,
  },
  subtitle: {
    ...Typography.subtitle,
    marginTop: 2,
  },
  label: {
    ...Typography.label,
    marginBottom: 6,
  },
  fixedHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  hintInline: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '600' },
  iosPickerWrap: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  iosPicker: {
    marginVertical: 4,
  },
  dataHoraRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  dataHoraField: { flex: 1 },
  dataHoraLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginBottom: 4,
    fontWeight: '700',
  },
  inputWrapCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
  },
  dataHoraInput: {
    flex: 1,
    color: Colors.text,
    paddingVertical: 12,
    fontSize: FontSize.md,
    textAlign: 'center',
    fontWeight: '700',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    marginBottom: 6,
    paddingTop: 12,
  },
  input: {
    flex: 1,
    color: Colors.text,
    paddingBottom: 12,
    fontSize: FontSize.md,
  },
  textArea: {
    minHeight: 68,
    textAlignVertical: 'top',
  },
  hint: { color: Colors.textMuted, fontSize: FontSize.xs, marginBottom: Spacing.md },
  erro: {
    color: Colors.danger,
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
  },
  botao: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  botaoText: { color: Colors.bg, fontWeight: '800', fontSize: FontSize.md },
});
