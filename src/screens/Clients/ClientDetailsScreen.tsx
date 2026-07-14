import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../../lib/supabase';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { Client, Appointment } from '../../types';

export default function ClientDetailsScreen({ route, navigation }: any) {
  const { clientId } = route.params;
  const [client, setClient] = useState<Client | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const fetchData = useCallback(async () => {
    const [clientRes, appointmentsRes] = await Promise.all([
      supabase.from('clients').select('*').eq('id', clientId).single(),
      supabase
        .from('appointments')
        .select('*')
        .eq('client_id', clientId)
        .order('date', { ascending: false })
        .limit(20),
    ]);

    if (clientRes.data) setClient(clientRes.data as Client);
    if (appointmentsRes.data) setAppointments(appointmentsRes.data as Appointment[]);
  }, [clientId]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleDelete = () => {
    Alert.alert(
      'Excluir Cliente',
      'Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('clients').delete().eq('id', clientId);
            if (error) {
              Alert.alert('Erro', error.message);
            } else {
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  if (!client) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  const totalSpent = appointments
    .filter(a => a.status === 'completed')
    .reduce((sum, a) => sum + a.total_price, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{client.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.clientName}>{client.name}</Text>
        {client.instagram && (
          <Text style={styles.clientInstagram}>📷 @{client.instagram}</Text>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{appointments.length}</Text>
          <Text style={styles.statLabel}>Sessões</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>R$ {totalSpent.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Total gasto</Text>
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contato</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoRow}>📱 {client.phone}</Text>
          {client.email && <Text style={styles.infoRow}>✉️ {client.email}</Text>}
        </View>
      </View>

      {/* Medical Info */}
      {client.allergies && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Alergias / Condições</Text>
          <View style={[styles.infoCard, styles.warningCard]}>
            <Text style={styles.infoRow}>{client.allergies}</Text>
          </View>
        </View>
      )}

      {/* Notes */}
      {client.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoRow}>{client.notes}</Text>
          </View>
        </View>
      )}

      {/* Recent Appointments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Histórico de Sessões</Text>
        {appointments.length > 0 ? (
          appointments.slice(0, 5).map((appt) => (
            <TouchableOpacity
              key={appt.id}
              style={styles.appointmentItem}
              onPress={() => navigation.navigate('AppointmentDetails', { appointmentId: appt.id })}
            >
              <View>
                <Text style={styles.appointmentTitle}>{appt.title}</Text>
                <Text style={styles.appointmentDate}>
                  {format(new Date(appt.date), "dd/MM/yyyy", { locale: ptBR })}
                </Text>
              </View>
              <Text style={styles.appointmentPrice}>R$ {appt.total_price.toFixed(0)}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>Nenhuma sessão registrada</Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={() => navigation.navigate('NewAppointment', { clientId: client.id })}
        >
          <Text style={styles.scheduleButtonText}>📅 Agendar Sessão</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Excluir Cliente</Text>
        </TouchableOpacity>
      </View>
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
  loadingText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
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
  clientName: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  clientInstagram: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 16,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  statValue: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  statLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 14,
  },
  warningCard: {
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  infoRow: {
    fontSize: SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  appointmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 12,
    marginBottom: 8,
  },
  appointmentTitle: {
    fontSize: SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  appointmentDate: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  appointmentPrice: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  emptyText: {
    fontSize: SIZES.md,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  actions: {
    marginTop: 16,
    gap: 12,
  },
  scheduleButton: {
    backgroundColor: COLORS.accent,
    borderRadius: SIZES.radius,
    paddingVertical: 16,
    alignItems: 'center',
  },
  scheduleButtonText: {
    color: COLORS.text,
    fontSize: SIZES.lg,
    fontWeight: 'bold',
  },
  deleteButton: {
    borderRadius: SIZES.radius,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  deleteButtonText: {
    color: COLORS.error,
    fontSize: SIZES.md,
    fontWeight: '600',
  },
});
