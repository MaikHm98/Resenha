import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize } from '../theme';

type Props = {
  uri?: string | null;
  clubName?: string | null;
  size?: number;
};

function getInitials(name?: string | null) {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function ClubLogo({ uri, clubName, size = 22 }: Props) {
  const [failed, setFailed] = useState(false);
  const initials = useMemo(() => getInitials(clubName), [clubName]);

  if (!uri || failed) {
    return (
      <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={[styles.fallbackText, { fontSize: Math.max(9, Math.floor(size * 0.38)) }]}>{initials}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: Colors.surface2 }}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fallbackText: {
    color: Colors.primary,
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: FontSize.xs + 1,
  },
});
