
import type { ApiResponse } from '@/types';
import apiClient from './api-client';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: Record<string, unknown>) => apiClient.post<ApiResponse>('/auth/register', data),
  login: (data: { email: string; password: string }) => apiClient.post<ApiResponse>('/auth/login', data),
  logout: () => apiClient.post<ApiResponse>('/auth/logout'),
  refreshToken: () => apiClient.post<ApiResponse>('/auth/refresh-token'),
  forgotPassword: (email: string) => apiClient.post<ApiResponse>('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => apiClient.post<ApiResponse>('/auth/reset-password', { token, password }),
  changePassword: (data: Record<string, string>) => apiClient.post<ApiResponse>('/auth/change-password', data),
  getProfile: () => apiClient.get<ApiResponse>('/auth/profile'),
  updateProfile: (data: Record<string, string>) => apiClient.patch<ApiResponse>('/auth/profile', data),
  verifyEmail: (token: string) => apiClient.get<ApiResponse>(`/auth/verify-email?token=${token}`),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => apiClient.get<ApiResponse>('/dashboard/stats'),
  getActivity: () => apiClient.get<ApiResponse>('/dashboard/activity'),
  getAttendanceTrend: (days?: number) => apiClient.get<ApiResponse>(`/dashboard/attendance-trend?days=${days ?? 7}`),
};

// ─── Employees ────────────────────────────────────────────────────────────────
export const employeeApi = {
  getAll: (params?: Record<string, unknown>) => apiClient.get<ApiResponse>('/employees', { params }),
  getById: (id: string) => apiClient.get<ApiResponse>(`/employees/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post<ApiResponse>('/employees', data),
  update: (id: string, data: Record<string, unknown>) => apiClient.put<ApiResponse>(`/employees/${id}`, data),
  delete: (id: string) => apiClient.delete<ApiResponse>(`/employees/${id}`),
  regenerateQR: (id: string) => apiClient.post<ApiResponse>(`/employees/${id}/regenerate-qr`),
  getDepartments: () => apiClient.get<ApiResponse>('/employees/departments/list'),
  createDepartment: (data: Record<string, string>) => apiClient.post<ApiResponse>('/employees/departments', data),
  deleteDepartment: (id: string) => apiClient.delete<ApiResponse>(`/employees/departments/${id}`),
  getShifts: () => apiClient.get<ApiResponse>('/employees/shifts/list'),
  createShift: (data: Record<string, unknown>) => apiClient.post<ApiResponse>('/employees/shifts', data),
  deleteShift: (id: string) => apiClient.delete<ApiResponse>(`/employees/shifts/${id}`),
};

// ─── Attendance ───────────────────────────────────────────────────────────────
export const attendanceApi = {
  checkIn: (data: Record<string, unknown>) => apiClient.post<ApiResponse>('/attendance/check-in', data),
  checkOut: (employeeId: string, note?: string) => apiClient.post<ApiResponse>('/attendance/check-out', { employeeId, note }),
  getAll: (params?: Record<string, unknown>) => apiClient.get<ApiResponse>('/attendance', { params }),
  getToday: () => apiClient.get<ApiResponse>('/attendance/today'),
  getMonthly: (employeeId: string, month: number, year: number) =>
    apiClient.get<ApiResponse>(`/attendance/monthly/${employeeId}/${month}/${year}`),
  manualEntry: (data: Record<string, unknown>) => apiClient.post<ApiResponse>('/attendance/manual', data),
  bulkEntry: (data: Record<string, unknown>) => apiClient.post<ApiResponse>('/attendance/bulk', data),
};

// ─── Leave ────────────────────────────────────────────────────────────────────
export const leaveApi = {
  getAll: (params?: Record<string, unknown>) => apiClient.get<ApiResponse>('/leaves', { params }),
  create: (data: Record<string, unknown>) => apiClient.post<ApiResponse>('/leaves', data),
  updateStatus: (id: string, data: Record<string, string>) => apiClient.patch<ApiResponse>(`/leaves/${id}/status`, data),
  delete: (id: string) => apiClient.delete<ApiResponse>(`/leaves/${id}`),
};

// ─── Payroll ──────────────────────────────────────────────────────────────────
export const payrollApi = {
  generate: (data: Record<string, unknown>) => apiClient.post<ApiResponse>('/payroll/generate', data),
  getAll: (params?: Record<string, unknown>) => apiClient.get<ApiResponse>('/payroll', { params }),
  getById: (id: string) => apiClient.get<ApiResponse>(`/payroll/${id}`),
  getSummary: (month: number, year: number) => apiClient.get<ApiResponse>(`/payroll/summary/${month}/${year}`),
  updateStatus: (id: string, data: Record<string, string>) => apiClient.patch<ApiResponse>(`/payroll/${id}/status`, data),
  downloadPayslip: (id: string) => apiClient.get(`/payroll/${id}/payslip`, { responseType: 'blob' }),
};

// ─── Finance ──────────────────────────────────────────────────────────────────
export const financeApi = {
  getTransactions: (params?: Record<string, unknown>) => apiClient.get<ApiResponse>('/finance/transactions', { params }),
  createTransaction: (data: Record<string, unknown>) => apiClient.post<ApiResponse>('/finance/transactions', data),
  updateTransaction: (id: string, data: Record<string, unknown>) => apiClient.put<ApiResponse>(`/finance/transactions/${id}`, data),
  deleteTransaction: (id: string) => apiClient.delete<ApiResponse>(`/finance/transactions/${id}`),
  getSummary: (params?: Record<string, string>) => apiClient.get<ApiResponse>('/finance/summary', { params }),
  getTrend: (months?: number) => apiClient.get<ApiResponse>(`/finance/trend?months=${months ?? 6}`),
  getBreakdown: (params?: Record<string, string>) => apiClient.get<ApiResponse>('/finance/breakdown', { params }),
  getCategories: () => apiClient.get<ApiResponse>('/finance/expense-categories'),
  createCategory: (data: Record<string, string>) => apiClient.post<ApiResponse>('/finance/expense-categories', data),
  deleteCategory: (id: string) => apiClient.delete<ApiResponse>(`/finance/expense-categories/${id}`),
  getSources: () => apiClient.get<ApiResponse>('/finance/income-sources'),
  createSource: (data: Record<string, string>) => apiClient.post<ApiResponse>('/finance/income-sources', data),
  deleteSource: (id: string) => apiClient.delete<ApiResponse>(`/finance/income-sources/${id}`),
};

// ─── Organization ─────────────────────────────────────────────────────────────
export const orgApi = {
  get: () => apiClient.get<ApiResponse>('/organizations'),
  update: (data: Record<string, unknown>) => apiClient.put<ApiResponse>('/organizations', data),
  updateSettings: (data: Record<string, unknown>) => apiClient.put<ApiResponse>('/organizations/settings', data),
  getUsers: () => apiClient.get<ApiResponse>('/organizations/users'),
  inviteUser: (data: Record<string, string>) => apiClient.post<ApiResponse>('/organizations/users/invite', data),
};

// ─── Subscriptions ────────────────────────────────────────────────────────────
export const subscriptionApi = {
  get: () => apiClient.get<ApiResponse>('/subscriptions'),
  getPlans: () => apiClient.get<ApiResponse>('/subscriptions/plans'),
  initiatePayment: (plan: string) => apiClient.post<ApiResponse>('/subscriptions/initiate-payment', { plan }),
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reportApi = {
  getAttendance: (params?: Record<string, string>) => apiClient.get<ApiResponse>('/reports/attendance', { params }),
  getPayroll: (params?: Record<string, string>) => apiClient.get<ApiResponse>('/reports/payroll', { params }),
  getFinance: (params?: Record<string, string>) => apiClient.get<ApiResponse>('/reports/finance', { params }),
};