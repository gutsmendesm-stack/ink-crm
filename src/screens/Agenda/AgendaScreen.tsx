import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { format, addDays, subDays, isToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../../lib/supabase';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { Appointment, AppointmentStatus } from '../../types';

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

export default function AgendaScreen({ navigation }: any) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('appointments')
      .select('*, client:clients(*)')
      .eq('date', dateStr)
      .order('start_time', { ascending: true });

    if (!error && data) {
      setAppointments(data as Appointment[]);
    }
    setLoading(false);
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [fetchAppointments])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  const goToPreviousDay = () => setSelectedDate(prev => subDays(prev, 1));
  const goToNextDay = () => setSelectedDate(prev => addDays(prev, 1));
  const goToToday = () => setSelectedDate(new Date());

  const renderDateSelector = () => (
    <View style={styles.dateSelector}>
      <TouchableOpacity onPress={goToPreviousDay} style={styles.dateArrow}>
        <Text style={styles.dateArrowText}>‹</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={goToToday} style={styles.dateCenter}>
        <Text style={styles.dateText}>
          {isToday(selectedDate)
            ? 'Hoje'
            : format(selectedDate, "EEEE", { locale: ptBR })}
        </Text>
        <Text style={styles.dateSubtext}>
          {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={goToNextDay} style={styles.dateArrow}>
        <Text style={styles.dateArrowText}>›</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAppointmentCard = ({ item }: { item: Appointment }) => (
    <TouchableOpacity
      style={styles.appointmentCard}
      onPress={() => navigation.navigate('AppointmentDetails', { appointmentId: item.id })}
    >
      <View style={[styles.statusBar, { backgroundColor: STATUS_COLORS[item.status] }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTime}>{item.start_time.slice(0, 5)}</Text>
          <Text style={styles.cardDuration}>{item.duration_minutes} min</Text>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardClient}>
          👤 {item.client?.name || 'Cliente não informado'}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={[styles.cardStatus, { color: STATUS_COLORS[item.status] }]}>
            {STATUS_LABELS[item.status]}
          </Text>
          <View style={styles.cardPriceContainer}>
            <Text style={styles.cardPrice}>
              R$ {item.total_price.toFixed(2)}
            </Text>
            {item.deposit_paid && (
              <Text style={styles.depositBadge}>💰 Sinal pago</Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>📅</Text>
      <Text style={styles.emptyTitle}>Nenhum agendamento</Text>
      <Text style={styles.emptySubtitle}>
        Toque no + para agendar uma sessão
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🖊️ Agenda</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('NewAppointment', { date: format(selectedDate, 'yyyy-MM-dd') })}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {renderDateSelector()}

      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={renderAppointmentCard}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.accent,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: -2,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: 16,
  },
  dateArrow: {
    padding: 8,
  },
  dateArrowText: {
    fontSize: 28,
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  dateCenter: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  dateSubtext: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  list: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 100,
  },
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    marginBottom: 12,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  statusBar: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTime: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cardDuration: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: SIZES.lg,
    color: COLORS.text,
    marginBottom: 4,
  },
  cardClient: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardStatus: {
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  cardPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardPrice: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  depositBadge: {
    fontSize: SIZES.xs,
    color: COLORS.warning,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
});
