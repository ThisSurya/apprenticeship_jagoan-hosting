export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    token_type: string;
  };
}

export interface APIResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ============================================
// Resident Types
// ============================================
export type ResidentStatus = 'tetap' | 'kontrak';

export interface Resident {
  id: number;
  full_name: string;
  phone: string;
  status: ResidentStatus;
  is_married: boolean | number;
  ktp_photo?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// House Types
// ============================================
export type HouseStatus = 'dihuni' | 'tidak_dihuni';

export interface House {
  id: number;
  house_number: string;
  status: HouseStatus;
  created_at: string;
  updated_at: string;
}

export interface HouseWithActiveResident {
  id: number;
  house_number: string;
  status: HouseStatus;
  active_resident: Resident | null;
  history_id: number | null;
  start_date: string | null;
}

export interface HouseResidentHistory {
  id: number;
  house_id: number;
  resident_id: number;
  start_date: string;
  end_date: string | null;
  house: House;
  resident: Resident;
}

// ============================================
// Billing & Payment Types
// ============================================
export type BillType = 'Satpam' | 'Kebersihan';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export interface Bill {
  bill_id: number;
  resident_id: number;
  resident_name: string;
  house_number: string;
  payment_type: string;
  period: string;
  amount_due: number;
  total_paid: number;
  status: PaymentStatus;
}

export interface PaymentDetail {
  id: number;
  payment_id: number;
  bill_id: number;
  amount: number;
  bill: {
    id: number;
    payment_type: { name: string };
  };
}

export interface Payment {
  id: number;
  resident_id: number;
  total_amount: number;
  payment_date: string;
  resident: Resident;
  details: PaymentDetail[];
}

// ============================================
// Expense Types
// ============================================
export interface Expense {
  id: number;
  title: string;
  amount: number;
  expense_date: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// Report Types
// ============================================
export interface SummaryMonthData {
  month: string;
  year: number;
  pemasukan: number;
  pengeluaran: number;
  saldo: number;
}

export interface FinancialSummary {
  report: SummaryMonthData[];
  total_income: number;
  total_expenses: number;
  balance: number;
}

export interface FinancialSummaryResponse {
  success: boolean;
  year: number;
  data: FinancialSummary;
}

export interface ReportPayment {
  payment_id: number;
  resident_name: string;
  house_number: string;
  payment_type: string;
  amount: number;
  payment_date: string;
}

export interface FinancialDetail {
  period: string;
  total_income: number;
  total_expenses: number;
  balance: number;
  pemasukan: ReportPayment[];
  pengeluaran: Expense[];
}

// ============================================
// Dashboard Types
// ============================================
export interface DashboardSummary {
  totalHouses: number;
  occupiedHouses: number;
  totalIncomeThisMonth: number;
  totalExpenseThisMonth: number;
  balance: number;
}

export interface RecentActivity {
  id: string;
  type: 'payment' | 'expense';
  description: string;
  amount: number;
  date: string;
}

// ============================================
// Routine/Template Types
// ============================================
export interface PaymentType {
  id: number;
  name: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface ExpenseTemplate {
  id: number;
  title: string;
  amount: number;
  recurrence: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
