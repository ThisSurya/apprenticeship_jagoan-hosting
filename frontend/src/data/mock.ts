import type {
  Resident,
  House,
  Bill,
  Payment,
  Expense,
  DashboardSummary,
  SummaryMonthData,
  RecentActivity,
  HouseResidentHistory,
} from '@/types';

// ============================================
// Mock Residents
// ============================================
export const mockResidents: Resident[] = [
  {
    id: 1,
    full_name: 'Ahmad Sudrajat',
    phone: '081234567890',
    status: 'tetap',
    is_married: true,
    created_at: '2024-01-15',
  },
  {
    id: 2,
    full_name: 'Budi Santoso',
    phone: '081234567891',
    status: 'kontrak',
    is_married: true,
    created_at: '2024-02-20',
  },
  {
    id: 3,
    full_name: 'Citra Dewi',
    phone: '081234567892',
    status: 'tetap',
    is_married: false,
    created_at: '2024-03-10',
  },
  {
    id: 4,
    full_name: 'Dedi Kurniawan',
    phone: '081234567893',
    status: 'kontrak',
    is_married: true,
    created_at: '2024-04-05',
  },
  {
    id: 5,
    full_name: 'Eka Putri',
    phone: '081234567894',
    status: 'tetap',
    is_married: false,
    created_at: '2024-05-12',
  },
  {
    id: 6,
    full_name: 'Fajar Nugroho',
    phone: '081234567895',
    status: 'tetap',
    is_married: true,
    created_at: '2024-06-01',
  },
  {
    id: 7,
    full_name: 'Gita Maharani',
    phone: '081234567896',
    status: 'kontrak',
    is_married: false,
    created_at: '2024-07-18',
  },
  {
    id: 8,
    full_name: 'Hendra Wijaya',
    phone: '081234567897',
    status: 'tetap',
    is_married: true,
    created_at: '2024-08-22',
  },
];

// ============================================
// Mock Houses
// ============================================
export const mockHouses: House[] = [
  { id: 1, house_number: 'A-01', status: 'dihuni', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 2, house_number: 'A-02', status: 'dihuni', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 3, house_number: 'A-03', status: 'dihuni', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 4, house_number: 'A-04', status: 'tidak_dihuni', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 5, house_number: 'B-01', status: 'dihuni', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 6, house_number: 'B-02', status: 'dihuni', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 7, house_number: 'B-03', status: 'tidak_dihuni', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 8, house_number: 'B-04', status: 'dihuni', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 9, house_number: 'C-01', status: 'dihuni', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 10, house_number: 'C-02', status: 'dihuni', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 11, house_number: 'C-03', status: 'tidak_dihuni', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 12, house_number: 'C-04', status: 'tidak_dihuni', created_at: '2024-01-01', updated_at: '2024-01-01' },
];

// ============================================
// Mock Resident History
// ============================================
export const mockResidentHistory: HouseResidentHistory[] = [
  { id: 1, resident_id: 1, house_id: 1, start_date: '2024-01-15', end_date: null, house: mockHouses[0], resident: mockResidents[0] },
  { id: 2, resident_id: 2, house_id: 2, start_date: '2024-02-20', end_date: null, house: mockHouses[1], resident: mockResidents[1] },
  { id: 3, resident_id: 3, house_id: 3, start_date: '2024-03-10', end_date: null, house: mockHouses[2], resident: mockResidents[2] },
  { id: 4, resident_id: 9, house_id: 1, start_date: '2022-05-01', end_date: '2024-01-14', house: mockHouses[0], resident: { ...mockResidents[0], id: 9, full_name: 'Zaki Rahman' } },
  { id: 5, resident_id: 4, house_id: 5, start_date: '2024-04-05', end_date: null, house: mockHouses[4], resident: mockResidents[3] },
  { id: 6, resident_id: 10, house_id: 3, start_date: '2022-08-01', end_date: '2024-03-09', house: mockHouses[2], resident: { ...mockResidents[0], id: 10, full_name: 'Lina Marlina' } },
];

// ============================================
// Mock Bills
// ============================================
export const mockBills: Bill[] = [
  {
    bill_id: 1,
    resident_id: 1,
    resident_name: 'Ahmad Sudrajat',
    house_number: 'A-01',
    payment_type: 'Satpam',
    period: 'April 2026',
    amount_due: 50000,
    total_paid: 50000,
    status: 'paid',
  },
  {
    bill_id: 2,
    resident_id: 1,
    resident_name: 'Ahmad Sudrajat',
    house_number: 'A-01',
    payment_type: 'Kebersihan',
    period: 'April 2026',
    amount_due: 25000,
    total_paid: 25000,
    status: 'paid',
  },
  {
    bill_id: 3,
    resident_id: 2,
    resident_name: 'Budi Santoso',
    house_number: 'A-02',
    payment_type: 'Satpam',
    period: 'April 2026',
    amount_due: 50000,
    total_paid: 25000,
    status: 'partial',
  },
  {
    bill_id: 4,
    resident_id: 3,
    resident_name: 'Citra Dewi',
    house_number: 'A-03',
    payment_type: 'Satpam',
    period: 'April 2026',
    amount_due: 50000,
    total_paid: 0,
    status: 'unpaid',
  },
];


// ============================================
// Mock Payments
// ============================================
export const mockPayments: Payment[] = [
  {
    id: 1,
    resident_id: 1,
    resident: mockResidents[0],
    total_amount: 75000,
    payment_date: '2026-04-05',
    details: [
      { id: 1, payment_id: 1, bill_id: 1, amount: 50000, bill: { id: 1, payment_type: { name: 'Satpam' } } },
      { id: 2, payment_id: 1, bill_id: 2, amount: 25000, bill: { id: 2, payment_type: { name: 'Kebersihan' } } },
    ],
  },
];

// ============================================
// Mock Expenses
// ============================================
export const mockExpenses: Expense[] = [
  { id: 1, title: 'Gaji Satpam - Pak Joko', amount: 2000000, expense_date: '2026-04-01', description: 'Gaji rutin bulanan' },
  { id: 2, title: 'Peralatan Kebersihan', amount: 350000, expense_date: '2026-04-03', description: 'Pembelian sapu dan plastik sampah' },
];

// ============================================
// Dashboard Summary
// ============================================
export const mockDashboardSummary: DashboardSummary = {
  totalHouses: 12,
  occupiedHouses: 8,
  totalIncomeThisMonth: 240000,
  totalExpenseThisMonth: 4350000,
  balance: -4110000,
};

// ============================================
// Chart Data (last 12 months)
// ============================================
export const mockChartData: SummaryMonthData[] = [
  { month: 'Jan', year: 2026, pemasukan: 5400000, pengeluaran: 3900000, saldo: 1500000 },
  { month: 'Feb', year: 2026, pemasukan: 5200000, pengeluaran: 3700000, saldo: 1500000 },
  { month: 'Mar', year: 2026, pemasukan: 5600000, pengeluaran: 4000000, saldo: 1600000 },
  { month: 'Apr', year: 2026, pemasukan: 240000, pengeluaran: 4350000, saldo: -4110000 },
];

// ============================================
// Recent Activities
// ============================================
export const mockRecentActivities: RecentActivity[] = [
  { id: 'ra1', type: 'payment', description: 'Ahmad Sudrajat membayar iuran April', amount: 75000, date: '2026-04-05' },
  { id: 'ra2', type: 'expense', description: 'Perbaikan Lampu Jalan Blok A', amount: 500000, date: '2026-04-05' },
];
