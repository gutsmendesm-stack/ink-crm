// ===== DATABASE TYPES =====

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  studio_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email?: string;
  instagram?: string;
  notes?: string;
  allergies?: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  client_id: string;
  client?: Client;
  title: string;
  description?: string;
  reference_images?: string[];
  date: string;
  start_time: string;
  end_time?: string;
  duration_minutes: number;
  status: AppointmentStatus;
  total_price: number;
  deposit_amount: number;
  deposit_paid: boolean;
  deposit_paid_at?: string;
  aftercare_sent: boolean;
  notes?: string;
  created_at: string;
}

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface AftercareInstruction {
  id: string;
  user_id: string;
  title: string;
  content: string;
  is_default: boolean;
  created_at: string;
}

// ===== NAVIGATION TYPES =====

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  AgendaTab: undefined;
  ClientsTab: undefined;
  ProfileTab: undefined;
};

export type AgendaStackParamList = {
  AgendaHome: undefined;
  NewAppointment: { clientId?: string; date?: string };
  AppointmentDetails: { appointmentId: string };
};

export type ClientsStackParamList = {
  ClientsList: undefined;
  ClientDetails: { clientId: string };
  NewClient: undefined;
};
