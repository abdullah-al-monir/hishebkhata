export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Employee {
  id: string;
  orgId: string;
  employeeCode: string;
  name: string;
  email?: string;
  phone?: string;
  designation?: string;
  department?: string;
  baseSalary: number;
  joiningDate: string;
  isActive: boolean;
  qrCode?: string;
  avatar?: string;
  shift?: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    breakMinutes: number;
  };
  createdAt: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  isDefault: boolean;
}

export interface Payroll {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  baseSalary: number;
  overtimePay: number;
  bonus: number;
  deductions: number;
  totalPaid: number; 
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  overtimeHours: number;
  status: "PENDING" | "PROCESSED" | "PAID" | "CANCELLED"; 
  paymentDate?: string;
  employee?: {
    name: string;
    employeeCode: string;
    designation?: string;
    department?: string;
  };
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeId: string; 
  fromDate: string; 
  toDate: string; 
  totalDays: number;
  reason?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  employee?: { name: string; employeeCode: string };
  leaveType?: { name: string };
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  _count?: { employees: number };
}

export interface Attendance {
  id: string;
  employeeId: string;
  attendanceDate: string;
  status: "PRESENT" | "ABSENT" | "LEAVE" | "HALF_DAY" | "HOLIDAY";
  clockIn?: string;
  clockOut?: string;
  workingMinutes: number;
  overtimeMinutes: number;
  lateMinutes: number;
  checkInMethod?: string;
  note?: string;
  employee?: Pick<Employee, "name" | "employeeCode" | "designation"> & {
    department?: { name: string };
  };
}

export interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  transactionDate: string;
  description?: string;
  reference?: string;
  categoryId?: string;
  sourceId?: string;
  category?: ExpenseCategory;
  source?: IncomeSource;
  createdAt: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  _count?: { transactions: number };
}

export interface IncomeSource {
  id: string;
  name: string;
  description?: string;
  color?: string;
  _count?: { transactions: number };
}

export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  onLeave: number;
  notMarked: number;
  lateArrivals: number;
  pendingLeaves: number;
  currentMonthPayroll: number;
  thisMonthIncome: number;
  thisMonthExpense: number;
  netProfit: number;
  attendanceRate: number;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: string;
  email: string;
  phone?: string;
  address?: string;
  logo?: string;
  timezone: string;
  currency: string;
  workingDaysPerWeek: number;
  workHoursPerDay: number;
  overtimeRateMultiplier: number;
  settings?: OrgSettings;
  subscriptions?: Subscription[];
}

export interface OrgSettings {
  enableBiometric: boolean;
  enableQRCode: boolean;
  enableOvertime: boolean;
  enableLeave: boolean;
  enablePayroll: boolean;
  enableFinance: boolean;
  payrollGenerationDay: number;
  salaryDisbursementDay: number;
}

export interface Subscription {
  id: string;
  plan: "FREE" | "BASIC" | "PRO" | "ENTERPRISE";
  status: "ACTIVE" | "INACTIVE" | "TRIAL" | "EXPIRED";
  maxEmployees: number;
  pricePerMonth: number;
  startDate: string;
  endDate?: string;
  trialEndsAt?: string;
}
