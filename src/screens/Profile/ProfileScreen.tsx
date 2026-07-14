import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { Profile } from '../../types';

export default function ProfileScreen() {
  const { signOut, user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [studioName, setStudioName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ clients: 0, appointments: 0, revenue: 0 });

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    const [profileRes, clientsRes, appointmentsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('clients').select('id', { count: 'exact', head: true }),
      supabase.from('appointments').select('total_price, status'),
    ]);

    if (profileRes.data) {
      const p = profileRes.data as Profile;
      setProfile(p);
      setFullName(p.full_name);
      setStudioName(p.studio_name || '');
      setPhone(p.phone || '');
    }

    const completedAppointments = (appointmentsRes.data || []).filter(
      (a: any) => a.status === 'completed'
    );
    const totalRevenue = completedAppointments.reduce(
      (sum: number, a: any) => sum + (a.total_price || 0), 0
    );

    setStats({
      clients: clientsRes.count || 0,
      appointments: completedAppointments.length,
      revenue: totalRevenue,
    });
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        studio_name: studioName.trim() || null,
        phone: phone.trim() || null,
      })
      .eq('id', user.id);

    setLoading(false);

    if (error) {
      Alert.alert('Erro', error.message);
    } else {
      setEditing(false);
      fetchProfile();
      Alert.alert('Perfil atualizado! ✅');
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>⚙️ Perfil</Text>

      {/* Avatar & Name */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.profileName}>{profile?.full_name || 'Carregando...'}</Text>
        {profile?.studio_name && (
          <Text style={styles.studioName}>🏠 {profile.studio_name}</Text>
        )}
        <Text style={styles.emailText}>{profile?.email}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.clients}</Text>
          <Text style={styles.statLabel}>Clientes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.appointments}</Text>
          <Text style={styles.statLabel}>Sessões</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>R${stats.revenue.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Faturado</Text>
        </View>
      </View>

      {/* Edit Profile */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dados do Perfil</Text>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Text style={styles.editLink}>{editing ? 'Cancelar' : 'Editar'}</Text>
          </TouchableOpacity>
        </View>

        {editing ? (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor={COLORS.textMuted}
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              style={styles.input}
              placeholder="Nome do estúdio (opcional)"
              placeholderTextColor={COLORS.textMuted}
              value={studioName}
              onChangeText={setStudioName}
            />
            <TextInput
              style={styles.input}
              placeholder="Telefone"
              placeholderTextColor={COLORS.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.text} />
              ) : (
                <Text style={styles.saveButtonText}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.infoCard}>
            <Text style={styles.infoRow}>👤 {profile?.full_name}</Text>
            {profile?.studio_name && <Text style={styles.infoRow}>🏠 {profile.studio_name}</Text>}
            {profile?.phone && <Text style={styles.infoRow}>📱 {profile.phone}</Text>}
            <Text style={styles.infoRow}>✉️ {profile?.email}</Text>
          </View>
        )}
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre o App</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoRow}>📱 INK CRM v1.0.0</Text>
          <Text style={styles.infoRow}>🖊️ CRM para Tatuadores</Text>
        </View>
      </View>

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>🚪 Sair da Conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SIZES.padding,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 24,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  profileName: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  studioName: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  emailText: {
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 14,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  statValue: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  statLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editLink: {
    fontSize: SIZES.md,
    color: COLORS.accent,
    fontWeight: '600',
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: SIZES.lg,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    borderRadius: SIZES.radius,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.text,
    fontSize: SIZES.lg,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 14,
    gap: 8,
  },
  infoRow: {
    fontSize: SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  signOutButton: {
    borderRadius: SIZES.radius,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
    marginTop: 8,
  },
  signOutText: {
    color: COLORS.error,
    fontSize: SIZES.lg,
    fontWeight: '600',
  },
});
