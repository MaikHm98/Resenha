import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ClubPicker from '../components/ClubPicker';
import ClubLogo from '../components/ClubLogo';
import FeedbackBanner from '../components/FeedbackBanner';
import { useAuth } from '../contexts/AuthContext';
import { ClubOption } from '../types';
import { Colors, FontSize, Radius, Spacing, Typography } from '../theme';

export default function ProfileScreen() {
  const { user, getClubOptions, updateProfile } = useAuth();
  const [goleiro, setGoleiro] = useState(!!user?.goleiro);
  const [timeCoracaoCodigo, setTimeCoracaoCodigo] = useState<string | undefined>(user?.timeCoracaoCodigo);
  const [clubes, setClubes] = useState<ClubOption[]>([]);
  const [carregandoClubes, setCarregandoClubes] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  useEffect(() => {
    setGoleiro(!!user?.goleiro);
    setTimeCoracaoCodigo(user?.timeCoracaoCodigo);
  }, [user?.goleiro, user?.timeCoracaoCodigo]);

  useEffect(() => {
    async function carregarClubes() {
      setCarregandoClubes(true);
      try {
        setClubes(await getClubOptions());
      } catch {
        setClubes([]);
      } finally {
        setCarregandoClubes(false);
      }
    }

    carregarClubes();
  }, [getClubOptions]);

  async function handleSalvar() {
    setErro('');
    setSucesso('');
    setSalvando(true);
    try {
      await updateProfile({ goleiro, timeCoracaoCodigo });
      setSucesso('Perfil atualizado com sucesso.');
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || 'Nao foi possivel atualizar o perfil.');
    } finally {
      setSalvando(false);
    }
  }

  const clubeSelecionado = clubes.find((c) => c.codigo === timeCoracaoCodigo);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.nome
                ?.split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{user?.nome}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
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

        <Text style={styles.label}>Time do Coracao (Opcional)</Text>
        <ClubPicker
          clubs={clubes}
          selectedCode={timeCoracaoCodigo}
          loading={carregandoClubes}
          onSelect={(code) => setTimeCoracaoCodigo(code)}
        />

        {clubeSelecionado && (
          <View style={styles.selectedClub}>
            <ClubLogo uri={clubeSelecionado.escudoUrl} clubName={clubeSelecionado.nome} size={22} />
            <Text style={styles.clubName}>{clubeSelecionado.nome}</Text>
          </View>
        )}

        {erro !== '' && <FeedbackBanner variant="error" message={erro} />}
        {sucesso !== '' && <FeedbackBanner variant="success" message={sucesso} />}

        <TouchableOpacity style={[styles.botao, salvando && styles.botaoDesabilitado]} onPress={handleSalvar} disabled={salvando}>
          {salvando ? <ActivityIndicator color={Colors.bg} /> : <Text style={styles.botaoTexto}>Salvar perfil</Text>}
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
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: Colors.primary, fontWeight: '800', fontSize: FontSize.md },
  headerInfo: { flex: 1 },
  name: { ...Typography.title, fontSize: FontSize.lg },
  email: { color: Colors.textMuted, fontSize: FontSize.xs },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: Spacing.md,
  },
  toggleTitle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  toggleLabel: { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: '600' },
  label: { ...Typography.label, marginBottom: 6 },
  selectedClub: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: -4,
    marginBottom: Spacing.md,
  },
  clubName: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '600' },
  botao: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botaoDesabilitado: { opacity: 0.6 },
  botaoTexto: { color: Colors.bg, fontWeight: '800', fontSize: FontSize.sm },
});
