import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { COLORS, SIZES } from '../../constants/theme';
import { Client } from '../../types';

export default function NewAppointmentScreen({ route, navigation }: any) {
  const { clientId, date } = route.params || {};

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>(clientId || '');
  const [showClientPicker, setShowClientPicker] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(date || format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('120');
  const [totalPrice, setTotalPrice] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true });
    if (data) setClients(data as Client[]);
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Erro', 'Informe o título/descrição do trabalho');
      return;
    }
    if (!startTime.trim()) {
      Alert.alert('Erro', 'Informe o horário de início');
      return;
    }
    if (!appointmentDate.trim()) {
      Alert.alert('Erro', 'Informe a data');
      return;
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(startTime)) {
      Alert.alert('Erro', 'Horário inválido. Use o formato HH:MM (ex: 14:30)');
      return;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(appointmentDate)) {
      Alert.alert('Erro', 'Data inválida. Use o formato AAAA-MM-DD (ex: 2025-01-15)');
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado');
      setLoading(false);
      return;
    }

    const price = parseFloat(totalPrice) || 0;
    const deposit = parseFloat(depositAmount) || 0;

    const { error } = await supabase.from('appointments').insert({
      user_id: user.id,
      client_id: selectedClientId || null,
      title: title.trim(),
      description: description.trim() || null,
      date: appointmentDate,
      start_time: startTime,
      duration_minutes: parseInt(durationMinutes) || 120,
      status: deposit > 0 ? 'pending' : 'confirmed',
      total_price: price,
      deposit_amount: deposit,
      deposit_paid: false,
      aftercare_sent: false,
      notes: notes.trim() || null,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Erro ao salvar', error.message);
    } else {
      Alert.alert('Agendamento criado!', 'Sessão agendada com sucesso', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Nova Sessão</Text>

      {/* Client Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cliente</Text>
        <TouchableOpacity
          style={styles.clientSelector}
          onPress={() => setShowClientPicker(!showClientPicker)}
        >
          <Text style={selectedClient ? styles.clientSelectedText : styles.clientPlaceholder}>
            {selectedClient ? `👤 ${selectedClient.name}` : 'Selecionar cliente (opcional)'}
          </Text>
          <Text style={styles.chevron}>{showClientPicker ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showClientPicker && (
          <View style={styles.clientList}>
            <TouchableOpacity
              style={styles.clientOption}
              onPress={() => { setSelectedClientId(''); setShowClientPicker(false); }}
            >
              <Text style={styles.clientOptionText}>Sem cliente</Text>
            </TouchableOpacity>
            {clients.map((client) => (
              <TouchableOpacity
                key={client.id}
                style={[
                  styles.clientOption,
                  client.id === selectedClientId && styles.clientOptionSelected,
                ]}
                onPress={() => { setSelectedClientId(client.id); setShowClientPicker(false); }}
              >
                <Text style={styles.clientOptionText}>{client.name}</Text>
                <Text style={styles.clientOptionPhone}>{client.phone}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Session Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detalhes da Sessão</Text>
        <TextInput
          style={styles.input}
          placeholder="Trabalho a ser feito (ex: Braço esquerdo, floral) *"
          placeholderTextColor={COLORS.textMuted}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descrição detalhada (tamanho, cores, estilo...)"
          placeholderTextColor={COLORS.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Date & Time */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data e Horário</Text>
        <TextInput
          style={styles.input}
          placeholder="Data (AAAA-MM-DD) *"
          placeholderTextColor={COLORS.textMuted}
          value={appointmentDate}
          onChangeText={setAppointmentDate}
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Hora início (HH:MM) *"
            placeholderTextColor={COLORS.textMuted}
            value={startTime}
            onChangeText={setStartTime}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Duração (min)"
            placeholderTextColor={COLORS.textMuted}
            value={durationMinutes}
            onChangeText={setDurationMinutes}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Pricing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Valores</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Valor total (R$)"
            placeholderTextColor={COLORS.textMuted}
            value={totalPrice}
            onChangeText={setTotalPrice}
            keyboardType="decimal-pad"
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Sinal/Depósito (R$)"
            placeholderTextColor={COLORS.textMuted}
            value={depositAmount}
            onChangeText={setDepositAmount}
            keyboardType="decimal-pad"
          />
        </View>
        {parseFloat(depositAmount) > 0 && (
          <Text style={styles.depositHint}>
            💡 O agendamento ficará como "Pendente" até o sinal ser confirmado
          </Text>
        )}
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Notas adicionais (opcional)"
          placeholderTextColor={COLORS.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.text} />
        ) : (
          <Text style={styles.saveButtonText}>Agendar Sessão</Text>
        )}
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
  title: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 24,
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
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: SIZES.lg,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  clientSelector: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientSelectedText: {
    fontSize: SIZES.lg,
    color: COLORS.text,
  },
  clientPlaceholder: {
    fontSize: SIZES.lg,
    color: COLORS.textMuted,
  },
  chevron: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
  },
  clientList: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    maxHeight: 200,
  },
  clientOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  clientOptionSelected: {
    backgroundColor: COLORS.primaryLight,
  },
  clientOptionText: {
    fontSize: SIZES.md,
    color: COLORS.text,
  },
  clientOptionPhone: {
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  depositHint: {
    fontSize: SIZES.sm,
    color: COLORS.warning,
    marginTop: 4,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    borderRadius: SIZES.radius,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.text,
    fontSize: SIZES.lg,
    fontWeight: 'bold',
  },
});
