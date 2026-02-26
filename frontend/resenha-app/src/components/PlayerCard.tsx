import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, gradients, getCardTier, getInitials } from '../theme';

interface PlayerCardProps {
  nome: string;
  rank: number;
  pontos: number;
  gols: number;
  assistencias: number;
  vitorias: number;
  perfil?: 'ADMIN' | 'MEMBRO';
}

export default function PlayerCard({
  nome,
  rank,
  pontos,
  gols,
  assistencias,
  vitorias,
  perfil,
}: PlayerCardProps) {
  const tier = getCardTier(rank);
  const gradient = gradients[tier];
  const tierColor =
    tier === 'gold' ? Colors.gold : tier === 'silver' ? Colors.silver : Colors.bronze;
  const iniciais = getInitials(nome);
  const primeiroNome = nome.split(' ')[0];
  const sobrenome = nome.split(' ').slice(1).join(' ');
  const nomeExibido = sobrenome
    ? `${primeiroNome} ${sobrenome[0]}.`
    : primeiroNome;

  return (
    <LinearGradient colors={gradient} style={styles.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      {/* Topo: rating e tier */}
      <View style={styles.topoRow}>
        <View>
          <Text style={[styles.rating, { color: '#0d0d1a' }]}>{pontos}</Text>
          <Text style={[styles.posLabel, { color: '#0d0d1a' }]}>
            {perfil === 'ADMIN' ? 'CAP' : 'JOG'}
          </Text>
        </View>
        <Text style={[styles.tierBadge, { color: '#0d0d1a' }]}>
          {tier === 'gold' ? '★' : tier === 'silver' ? '◆' : '●'}
        </Text>
      </View>

      {/* Avatar circular com iniciais */}
      <View style={[styles.avatarContainer, { borderColor: '#0d0d1a' }]}>
        <View style={[styles.avatarInner, { backgroundColor: 'rgba(0,0,0,0.35)' }]}>
          <Text style={[styles.avatarText, { color: tierColor }]}>{iniciais}</Text>
        </View>
      </View>

      {/* Nome */}
      <Text style={[styles.nome, { color: '#0d0d1a' }]} numberOfLines={1}>
        {nomeExibido.toUpperCase()}
      </Text>

      {/* Divisor */}
      <View style={[styles.divisor, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statVal, { color: '#0d0d1a' }]}>{gols}</Text>
          <Text style={[styles.statLabel, { color: 'rgba(0,0,0,0.65)' }]}>GOL</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statVal, { color: '#0d0d1a' }]}>{assistencias}</Text>
          <Text style={[styles.statLabel, { color: 'rgba(0,0,0,0.65)' }]}>ASS</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statVal, { color: '#0d0d1a' }]}>{vitorias}</Text>
          <Text style={[styles.statLabel, { color: 'rgba(0,0,0,0.65)' }]}>VIT</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const CARD_W = 100;
const CARD_H = 140;

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  topoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  rating: {
    fontSize: FontSize.lg,
    fontWeight: '900',
    lineHeight: 20,
  },
  posLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tierBadge: {
    fontSize: FontSize.md,
    fontWeight: '900',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    overflow: 'hidden',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FontSize.md,
    fontWeight: '900',
    letterSpacing: 1,
  },
  nome: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 4,
  },
  divisor: {
    height: 1,
    width: '90%',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: FontSize.sm,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
