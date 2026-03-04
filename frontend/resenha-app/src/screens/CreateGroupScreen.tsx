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
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../api/api';
import { AppStackParamList } from '../navigation/AppNavigator';
import { Colors, FontSize, Radius, Spacing, Typography } from '../theme';
import FeedbackBanner from '../components/FeedbackBanner';

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'CreateGroup'>;
};

export default function CreateGroupScreen({ navigation }: Props) {
  const [nome, setNome] = useState('');
  const [limite, setLimite] = useState('24');
  const [diaSemana, setDiaSemana] = useState<number | undefined>(undefined);
  const [horario, setHorario] = useState<Date | undefined>(undefined);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  function formatHorario(d: Date) {
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function extractApiMessage(e: any, fallback: string) {
    const msg = e?.response?.data?.mensagem;
    if (msg) return msg;

    const errors = e?.response?.data?.errors;
    if (errors && typeof errors === 'object') {
      const first = Object.values(errors)[0] as string[] | undefined;
      if (first?.[0]) return first[0];
    }

    return fallback;
  }

  async function handleCriar() {
    const nomeNormalizado = nome.trim();
    const limiteNum = parseInt(limite, 10);

    if (!nomeNormalizado) {
      setErro('Informe o nome do grupo.');
      return;
    }
    if (nomeNormalizado.length < 2) {
      setErro('Nome deve ter pelo menos 2 caracteres.');
      return;
    }
    if (isNaN(limiteNum) || limiteNum < 2 || limiteNum > 100) {
      setErro('O limite de jogadores deve ser entre 2 e 100.');
      return;
    }

    setErro('');
    setCarregando(true);
    try {
      const horarioFixo = horario ? formatHorario(horario) : undefined;
      const response = await api.post('/api/groups', {
        nome: nomeNormalizado,
        limiteJogadores: limiteNum,
        diaSemana: diaSemana ?? null,
        horarioFixo: horarioFixo ?? null,
      });

      const group = response.data;
      navigation.replace('GroupDashboard', {
        groupId: group.idGrupo,
        groupName: group.nome,
        isAdmin: true,
        diaSemana: group.diaSemana ?? diaSemana,
        horarioFixo: group.horarioFixo ?? horarioFixo,
        limiteJogadores: group.limiteJogadores ?? limiteNum,
      });
    } catch (e: any) {
      setErro(extractApiMessage(e, 'Nao foi possivel criar o grupo.'));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}>
            <Ionicons name="people-circle-outline" size={24} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.title}>Novo Grupo</Text>
            <Text style={styles.subtitle}>Defina as configuracoes principais</Text>
          </View>
        </View>

        <Text style={styles.label}>Nome do Grupo</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="chatbubble-ellipses-outline" size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Ex: Resenha do Bairro"
            placeholderTextColor={Colors.textMuted}
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
          />
        </View>

        <Text style={styles.label}>Limite de Jogadores</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="people-outline" size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="24"
            placeholderTextColor={Colors.textMuted}
            keyboardType="number-pad"
            value={limite}
            onChangeText={setLimite}
            maxLength={3}
          />
        </View>
        <Text style={styles.hint}>Maximo de membros que podem entrar no grupo.</Text>

        <Text style={styles.label}>Dia Fixo do Jogo (Opcional)</Text>
        <View style={styles.diasRow}>
          {DIAS.map((d, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.diaBtn, diaSemana === i && styles.diaBtnAtivo]}
              onPress={() => setDiaSemana(diaSemana === i ? undefined : i)}
            >
              <Text style={[styles.diaBtnText, diaSemana === i && styles.diaBtnTextAtivo]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Horario Fixo (Opcional)</Text>
        {Platform.OS === 'ios' ? (
          <DateTimePicker
            value={horario ?? new Date()}
            mode="time"
            display="spinner"
            is24Hour
            locale="pt-BR"
            onChange={(_, d) => d && setHorario(d)}
            style={{ marginBottom: Spacing.sm }}
          />
        ) : (
          <>
            <TouchableOpacity style={styles.timeField} onPress={() => setShowTimePicker(true)}>
              <View style={styles.timeLeft}>
                <Ionicons name="time-outline" size={16} color={Colors.textMuted} />
                <Text style={styles.timeText}>{horario ? formatHorario(horario) : 'Toque para definir'}</Text>
              </View>
              <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={horario ?? new Date()}
                mode="time"
                is24Hour
                display="default"
                onChange={(_, d) => {
                  setShowTimePicker(false);
                  if (d) setHorario(d);
                }}
              />
            )}
          </>
        )}
        <Text style={styles.hint}>Usado para sugerir automaticamente a data ao criar partidas.</Text>

        {erro !== '' && <FeedbackBanner variant="error" message={erro} />}

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.md, justifyContent: 'center', flexGrow: 1 },
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
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    marginBottom: 6,
  },
  input: {
    flex: 1,
    color: Colors.text,
    paddingVertical: 12,
    fontSize: FontSize.md,
  },
  hint: { color: Colors.textMuted, fontSize: FontSize.xs, marginBottom: Spacing.md },
  diasRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.md },
  diaBtn: {
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  diaBtnAtivo: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  diaBtnText: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '700' },
  diaBtnTextAtivo: { color: Colors.bg },
  timeField: {
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeText: { color: Colors.primary, fontSize: FontSize.md, fontWeight: '700' },
  botao: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  botaoText: { color: Colors.bg, fontWeight: '800', fontSize: FontSize.md },
});
