// ─── Auth ──────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  loading: boolean;
}

// ─── Driver ────────────────────────────────────────────────────────────────
export interface Driver {
  _id: string;
  name: string;
  phone: string;
  licenseNumber?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverFormData {
  name: string;
  phone: string;
  licenseNumber?: string;
  address?: string;
}

// ─── Vehicle ───────────────────────────────────────────────────────────────
export interface Vehicle {
  _id: string;
  licenseNumber: string;
  ownerName: string;
  chassisNumber: string;
  numberOfWheels: number;
  fcExpiryDate?: string;
  insuranceExpiryDate?: string;
  nationalPermitExpiryDate?: string;
  oilServiceKm?: number;
  gearBoxOilKm?: number;
  crownOilKm?: number;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleFormData {
  licenseNumber: string;
  ownerName: string;
  chassisNumber: string;
  numberOfWheels: number;
  fcExpiryDate?: string;
  insuranceExpiryDate?: string;
  nationalPermitExpiryDate?: string;
  oilServiceKm?: string;
  gearBoxOilKm?: string;
  crownOilKm?: string;
}

// ─── Trip ──────────────────────────────────────────────────────────────────
export type TripStatus = 'draft' | 'submitted' | 'completed';

export interface TripSegment {
  date: string;
  from: string;
  to: string;
  office: string;
  loadType: string;
  tonnage: number;
  hireAmount: number;
  loadingCharge: number;
  unloadingCharge: number;
}

export interface DieselEntry {
  date: string;
  quantity: number;
  amount: number;
}

export type ExpenseType = 'rto' | 'police' | 'toll' | 'fastag' | 'other';

export interface ExpenseEntry {
  type: ExpenseType;
  description: string;
  amount: number;
  direction: string;
  city: string;
}

export interface TransactionEntry {
  date: string;
  name: string;
  amountReceived: number;
}

export interface TripCalculated {
  totalKm: number;
  totalDieselLitres: number;
  totalDieselAmount: number;
  totalHire: number;
  totalLoading: number;
  totalUnloading: number;
  totalExpenses: number;
  totalTransactionsReceived: number;
  totalCost: number;
  mileage: number;
  balance: number;
}

export interface Trip {
  _id: string;
  vehicle: { _id: string; licenseNumber: string; ownerName?: string };
  driver1: { _id: string; name: string };
  driver2?: { _id: string; name: string };
  advanceAmount: number;
  startKm: number;
  endKm: number;
  totalKm: number;
  status: TripStatus;
  tripSegments: TripSegment[];
  dieselEntries: DieselEntry[];
  expenseEntries: ExpenseEntry[];
  transactions: TransactionEntry[];
  calculated: TripCalculated;
  completedAt?: string;
  completedBy?: { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface TripFormData {
  vehicle: string;
  driver1: string;
  driver2?: string;
  advanceAmount: number;
  startKm: number;
  endKm: number;
  status: 'draft' | 'submitted';
  tripSegments: TripSegment[];
  dieselEntries: DieselEntry[];
  expenseEntries: ExpenseEntry[];
  transactions: TransactionEntry[];
}

// ─── Pagination ────────────────────────────────────────────────────────────
export interface Pagination {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

// ─── Dashboard ─────────────────────────────────────────────────────────────
export interface DashboardStats {
  vehicles: number;
  drivers: number;
  trips: number;
  activeTrips: number;
  totalRevenue: number;
  completedTrips: number;
}

// ─── Navigation ────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Trips: undefined;
  Vehicles: undefined;
  Drivers: undefined;
  Managers: undefined;
};

export type DriversStackParamList = {
  DriverList: undefined;
  DriverForm: { id?: string };
};

export type VehiclesStackParamList = {
  VehicleList: undefined;
  VehicleForm: { id?: string };
};

export type TripsStackParamList = {
  TripList: undefined;
  TripDetail: { id: string };
  TripForm: { id?: string };
};

export type ManagersStackParamList = {
  ManagerList: undefined;
};

export type DashboardStackParamList = {
  DashboardHome: undefined;
};
