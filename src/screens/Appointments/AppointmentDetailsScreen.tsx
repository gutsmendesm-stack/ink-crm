import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../../lib/supabase';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { Appointment, AppointmentStatus } from '../../types';
import { DEFAULT_AFTERCARE_INSTRUCTIONS } from '../../constants/aftercare';

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: '⏳ Pendente',
  confirmed: '✅ Confirmado',
  in_progress: '🎨 Em andamento',
  completed: '✔️ Concluído',
  cancelled: '❌ Cancelado',
  no_show: '👻 Não compareceu',
};

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending: COLORS.statusPending,
  confirmed: COLORS.statusConfirmed,
  in_progress: COLORS.statusInProgress,
  completed: COLORS.statusCompleted,
  cancelled: COLORS.statusCancelled,
  no_show: COLORS.statusNoShow,
};

export default function AppointmentDetailsScreen({ route, navigation }: any) {
  const { appointmentId } = route.params;
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  const fetchAppointment = useCallback(async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, client:clients(*)')
      .eq('id', appointmentId)
      .single();

    if (data) setAppointment(data as Appointment);
  }, [appointmentId]);

  useFocusEffect(
    useCallback(() => {
      fetchAppointment();
    }, [fetchAppointment])
  );

  const updateStatus = async (newStatus: AppointmentStatus) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', appointmentId);

    if (!error) {
      setAppointment(prev => prev ? { ...prev, status: newStatus } : null);
    } else {
      Alert.alert('Erro', error.message);
    }
  };

  const confirmDeposit = async () => {
    Alert.alert(
      'Confirmar Sinal',
      `Confirmar recebimento do sinal de R$ ${appointment?.deposit_amount.toFixed(2)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            const { error } = await supabase
              .from('appointments')
              .update({
                deposit_paid: true,
                deposit_paid_at: new Date().toISOString(),
                status: 'confirmed',
              })
              .eq('id', appointmentId);

            if (!error) {
              setAppointment(prev =>
                prev ? { ...prev, deposit_paid: true, status: 'confirmed' } : null
              );
              Alert.alert('Sinal confirmado! ✅');
            }
          },
        },
      ]
    );
  };

  const sendAftercareInstructions = async () => {
    try {
      await Share.share({
        message: DEFAULT_AFTERCARE_INSTRUCTIONS,
        title: 'Cuidados Pós-Tatuagem',
      });

      // Mark as sent
      await supabase
        .from('appointments')
        .update({ aftercare_sent: true })
        .eq('id', appointmentId);

      setAppointment(prev => prev ? { ...prev, aftercare_sent: true } : null);
    } catch (error) {
      // User cancelled share
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir Agendamento',
      'Tem certeza que deseja excluir este agendamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('appointments')
              .delete()
              .eq('id', appointmentId);
            if (!error) navigation.goBack();
          },
        },
      ]
    );
  };

  if (!appointment) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  const remainingBalance = appointment.total_price - (appointment.deposit_paid ? appointment.deposit_amount : 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[appointment.status] + '20', borderColor: STATUS_COLORS[appointment.status] }]}>
        <Text style={[styles.statusText, { color: STATUS_COLORS[appointment.status] }]}>
          {STATUS_LABELS[appointment.status]}
        </Text>
      </View>

      {/* Title & Client */}
      <Text style={styles.title}>{appointment.title}</Text>
      {appointment.client && (
        <Text style={styles.clientName}>👤 {appointment.client.name}</Text>
      )}

      {/* Date & Time */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📅 Data</Text>
          <Text style={styles.infoValue}>
            {format(new Date(appointment.date + 'T00:00:00'), "dd 'de' MMMM, yyyy", { locale: ptBR })}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🕐 Horário</Text>
          <Text style={styles.infoValue}>{appointment.start_time.slice(0, 5)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>⏱️ Duração</Text>
          <Text style={styles.infoValue}>{appointment.duration_minutes} minutos</Text>
        </View>
      </View>

      {/* Description */}
      {appointment.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição do Trabalho</Text>
          <Text style={styles.descriptionText}>{appointment.description}</Text>
        </View>
      )}

      {/* Pricing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Valores</Text>
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Valor total</Text>
            <Text style={styles.priceValue}>R$ {appointment.total_price.toFixed(2)}</Text>
          </View>
          {appointment.deposit_amount > 0 && (
            <>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>
                  Sinal {appointment.deposit_paid ? '(pago ✅)' : '(pendente ⏳)'}
                </Text>
                <Text style={[styles.priceValue, appointment.deposit_paid && { color: COLORS.success }]}>
                  R$ {appointment.deposit_amount.toFixed(2)}
                </Text>
              </View>
              <View style={[styles.priceRow, styles.priceRowTotal]}>
                <Text style={styles.priceLabelBold}>Restante</Text>
                <Text style={styles.priceValueBold}>R$ {remainingBalance.toFixed(2)}</Text>
              </View>
            </>
          )}
        </View>

        {/* Confirm deposit button */}
        {appointment.deposit_amount > 0 && !appointment.deposit_paid && (
          <TouchableOpacity style={styles.depositButton} onPress={confirmDeposit}>
            <Text style={styles.depositButtonText}>💰 Confirmar Recebimento do Sinal</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notes */}
      {appointment.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Notas</Text>
          <Text style={styles.descriptionText}>{appointment.notes}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Text style={styles.sectionTitle}>Ações</Text>

        {/* Status Change Buttons */}
        {appointment.status === 'confirmed' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.statusInProgress + '30' }]}
            onPress={() => updateStatus('in_progress')}
          >
            <Text style={styles.actionButtonText}>🎨 Iniciar Sessão</Text>
          </TouchableOpacity>
        )}

        {appointment.status === 'in_progress' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.statusCompleted + '30' }]}
            onPress={() => updateStatus('completed')}
          >
            <Text style={styles.actionButtonText}>✔️ Marcar como Concluído</Text>
          </TouchableOpacity>
        )}

        {appointment.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.statusConfirmed + '30' }]}
            onPress={() => updateStatus('confirmed')}
          >
            <Text style={styles.actionButtonText}>✅ Confirmar Agendamento</Text>
          </TouchableOpacity>
        )}

        {/* Aftercare */}
        {(appointment.status === 'completed' || appointment.status === 'in_progress') && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.info + '20' }]}
            onPress={sendAftercareInstructions}
          >
            <Text style={styles.actionButtonText}>
              {appointment.aftercare_sent
                ? '📋 Reenviar Cuidados Pós-Tattoo'
                : '📋 Enviar Cuidados Pós-Tattoo'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Cancel / No Show */}
        {['pending', 'confirmed'].includes(appointment.status) && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: COLORS.statusNoShow + '20' }]}
              onPress={() => {
                Alert.alert('Não compareceu?', 'Marcar como não compareceu?', [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Sim', onPress: () => updateStatus('no_show') },
                ]);
              }}
            >
              <Text style={styles.actionButtonText}>👻 Marcar Não Compareceu</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: COLORS.statusCancelled + '20' }]}
              onPress={() => {
                Alert.alert('Cancelar?', 'Cancelar este agendamento?', [
                  { text: 'Não', style: 'cancel' },
                  { text: 'Sim, cancelar', onPress: () => updateStatus('cancelled') },
                ]);
              }}
            >
              <Text style={styles.actionButtonText}>❌ Cancelar Agendamento</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Delete */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>🗑️ Excluir Agendamento</Text>
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
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusText: {
    fontSize: SIZES.md,
    fontWeight: '600',
  },
  title: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  clientName: {
    fontSize: SIZES.lg,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 20,
    ...SHADOWS.small,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  infoLabel: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 14,
  },
  priceCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 16,
    ...SHADOWS.small,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  priceRowTotal: {
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceLight,
    marginTop: 4,
    paddingTop: 12,
  },
  priceLabel: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  priceLabelBold: {
    fontSize: SIZES.lg,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  priceValueBold: {
    fontSize: SIZES.lg,
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  depositButton: {
    backgroundColor: COLORS.warning + '20',
    borderRadius: SIZES.radius,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  depositButtonText: {
    color: COLORS.warning,
    fontSize: SIZES.md,
    fontWeight: '600',
  },
  actions: {
    marginTop: 8,
    gap: 10,
  },
  actionButton: {
    borderRadius: SIZES.radius,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  deleteButton: {
    borderRadius: SIZES.radius,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
    marginTop: 8,
  },
  deleteButtonText: {
    color: COLORS.error,
    fontSize: SIZES.md,
    fontWeight: '600',
  },
});
