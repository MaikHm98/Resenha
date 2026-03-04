import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ClubOption } from '../types';
import { Colors, FontSize, Radius, Spacing } from '../theme';
import ClubLogo from './ClubLogo';

type Props = {
  clubs: ClubOption[];
  selectedCode?: string;
  loading?: boolean;
  onSelect: (clubCode?: string) => void;
};

export default function ClubPicker({ clubs, selectedCode, loading = false, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selected = clubs.find((c) => c.codigo === selectedCode);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clubs;
    return clubs.filter((c) => c.nome.toLowerCase().includes(term));
  }, [clubs, search]);

  return (
    <>
      <TouchableOpacity style={styles.selector} onPress={() => setOpen(true)} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <View style={styles.selectorLeft}>
            {selected ? (
              <>
                <ClubLogo uri={selected.escudoUrl} clubName={selected.nome} size={22} />
                <Text style={styles.selectorText}>{selected.nome}</Text>
              </>
            ) : (
              <>
                <Ionicons name="flag-outline" size={16} color={Colors.textMuted} />
                <Text style={[styles.selectorText, { color: Colors.textMuted }]}>Selecionar time (opcional)</Text>
              </>
            )}
          </View>
        )}
        <Ionicons name="chevron-down-outline" size={16} color={Colors.textMuted} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.header}>
              <Text style={styles.title}>Time do Coracao</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close-outline" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchWrap}>
              <Ionicons name="search-outline" size={15} color={Colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar clube"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <TouchableOpacity
              style={styles.noneButton}
              onPress={() => {
                onSelect(undefined);
                setOpen(false);
              }}
            >
              <Ionicons name="remove-circle-outline" size={15} color={Colors.textMuted} />
              <Text style={styles.noneText}>Sem time do coracao</Text>
            </TouchableOpacity>

            <FlatList
              data={filtered}
              keyExtractor={(item) => item.codigo}
              contentContainerStyle={{ paddingBottom: Spacing.sm }}
              renderItem={({ item }) => {
                const selectedItem = item.codigo === selectedCode;
                return (
                  <TouchableOpacity
                    style={[styles.item, selectedItem && styles.itemActive]}
                    onPress={() => {
                      onSelect(item.codigo);
                      setOpen(false);
                    }}
                  >
                    <ClubLogo uri={item.escudoUrl} clubName={item.nome} size={22} />
                    <Text style={styles.itemText}>{item.nome}</Text>
                    {selectedItem && <Ionicons name="checkmark" size={16} color={Colors.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  selectorText: { color: Colors.text, fontSize: FontSize.sm, flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  modal: {
    maxHeight: '80%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: Colors.text, fontSize: FontSize.md, fontWeight: '800' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: FontSize.sm, paddingVertical: 9 },
  noneButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  noneText: { color: Colors.textMuted, fontSize: FontSize.xs },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  itemText: { color: Colors.text, fontSize: FontSize.sm, flex: 1 },
});
