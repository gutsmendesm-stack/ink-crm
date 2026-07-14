# 🖊️ INK CRM - CRM para Tatuadores

Um aplicativo mobile completo para tatuadores gerenciarem seus clientes, agendamentos e finanças de forma simples e eficiente.

## 📱 Funcionalidades do MVP

### ✅ Implementado
- **Autenticação** - Login/Registro com e-mail e senha
- **Agenda** - Visualização diária de agendamentos com navegação entre dias
- **Gerenciamento de Clientes** - Cadastro com nome, telefone, Instagram, alergias, notas
- **Agendamentos** - Criar sessões com data, hora, duração, valores e sinal/depósito
- **Cobrança de Sinal** - Controle de depósito pendente/pago
- **Status de Sessão** - Pendente → Confirmado → Em Andamento → Concluído
- **Cuidados Pós-Tattoo** - Envio de instruções padronizadas via compartilhamento
- **Perfil** - Dashboard com estatísticas (clientes, sessões, faturamento)
- **Notificações** - Lembretes de agendamento e depósito pendente
- **Tema Dark** - Visual moderno inspirado no universo da tatuagem

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React Native + Expo (TypeScript) |
| Navegação | React Navigation (Bottom Tabs + Stack) |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Notificações | Expo Notifications |
| Data | date-fns |

## 🚀 Como Rodar

### Pré-requisitos
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Conta no [Supabase](https://supabase.com) (gratuita)

### 1. Instalar dependências
```bash
cd ink-crm
npm install
```

### 2. Configurar Supabase

1. Crie um projeto no [Supabase](https://app.supabase.com)
2. Execute o SQL em `supabase/schema.sql` no SQL Editor do Supabase
3. Copie a URL e chave anônima do projeto
4. Edite `src/lib/supabase.ts`:

```typescript
const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANONIMA';
```

### 3. Rodar o app
```bash
npx expo start
```

Escaneie o QR code com o app **Expo Go** no seu celular.

## 📁 Estrutura do Projeto

```
ink-crm/
├── App.tsx                         # Entry point
├── supabase/
│   └── schema.sql                  # Database schema completo
├── src/
│   ├── constants/
│   │   ├── theme.ts                # Cores, tamanhos, sombras
│   │   └── aftercare.ts           # Instruções pós-tattoo padrão
│   ├── types/
│   │   └── index.ts                # Tipos TypeScript
│   ├── lib/
│   │   └── supabase.ts            # Cliente Supabase
│   ├── hooks/
│   │   └── useAuth.ts             # Hook de autenticação
│   ├── utils/
│   │   └── notifications.ts       # Sistema de notificações
│   ├── navigation/
│   │   ├── RootNavigator.tsx      # Auth vs Main
│   │   ├── AuthNavigator.tsx      # Login/Register
│   │   ├── MainNavigator.tsx      # Bottom tabs
│   │   ├── AgendaNavigator.tsx    # Stack de agenda
│   │   └── ClientsNavigator.tsx   # Stack de clientes
│   └── screens/
│       ├── Auth/
│       │   ├── LoginScreen.tsx
│       │   └── RegisterScreen.tsx
│       ├── Agenda/
│       │   └── AgendaScreen.tsx
│       ├── Clients/
│       │   ├── ClientsListScreen.tsx
│       │   ├── NewClientScreen.tsx
│       │   └── ClientDetailsScreen.tsx
│       ├── Appointments/
│       │   ├── NewAppointmentScreen.tsx
│       │   └── AppointmentDetailsScreen.tsx
│       └── Profile/
│           └── ProfileScreen.tsx
```

## 💰 Modelo de Monetização Sugerido

- **Grátis**: até 10 clientes, funcionalidades básicas
- **Pro (R$39-49/mês)**: Clientes ilimitados + cobranças integradas + relatórios

## 📋 Próximas Funcionalidades (Sessões Futuras)

- [ ] Upload de fotos de referência
- [ ] Integração com pagamento (Stripe/Asaas)
- [ ] Relatórios financeiros (mensal/semanal)
- [ ] Agenda compartilhável (link para cliente agendar)
- [ ] Backup automático de dados
- [ ] Múltiplos templates de cuidados pós-tattoo
- [ ] Galeria de trabalhos realizados

## 📄 Licença

Projeto privado - todos os direitos reservados.
