export type UserRole = 'super_admin' | 'admin';

export interface User {
  _id?: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string;
}

export interface ComputerSystem {
  _id: string;
  name: string;
  location: string;
  availability: boolean;
  specifications?: string;
}

export interface BookingSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  computerId: string;
  computerName: string;
  studentName: string;
  studentEmail: string;
  adminId: string;
  adminName: string;
  createdAt: string;
  status: 'confirmed' | 'cancelled' | 'completed';
}

// Mock data for initial development
export const mockUsers: User[] = [
  {
    _id: '1',
    email: 'super@codelab.edu',
    name: 'Super Admin',
    role: 'super_admin',
  },
  {
    _id: '2',
    email: 'admin1@codelab.edu',
    name: 'Admin User',
    role: 'admin',
  },
];

export const mockComputers: ComputerSystem[] = [
  {
    _id: '1',
    name: 'PC-001',
    location: 'Lab A - Seat 1',
    availability: true,
    specifications: 'Intel i7, 16GB RAM, 512GB SSD',
  },
  {
    _id: '2',
    name: 'PC-002',
    location: 'Lab A - Seat 2',
    availability: true,
    specifications: 'Intel i7, 16GB RAM, 512GB SSD',
  },
  {
    _id: '3',
    name: 'PC-003',
    location: 'Lab B - Seat 1',
    availability: false,
    specifications: 'Intel i5, 8GB RAM, 256GB SSD',
  },
  {
    _id: '4',
    name: 'PC-004',
    location: 'Lab B - Seat 2',
    availability: true,
    specifications: 'Intel i5, 8GB RAM, 256GB SSD',
  },
];

export const mockBookings: BookingSlot[] = [
  {
    id: '1',
    date: '2025-04-03',
    startTime: '10:00',
    endTime: '12:00',
    computerId: '1',
    computerName: 'PC-001',
    studentName: 'John Doe',
    studentEmail: 'john.doe@student.edu',
    adminId: '2',
    adminName: 'Admin User',
    createdAt: '2025-04-01T10:00:00Z',
    status: 'confirmed',
  },
  {
    id: '2',
    date: '2025-04-03',
    startTime: '14:00',
    endTime: '16:00',
    computerId: '2',
    computerName: 'PC-002',
    studentName: 'Jane Smith',
    studentEmail: 'jane.smith@student.edu',
    adminId: '2',
    adminName: 'Admin User',
    createdAt: '2025-04-01T11:00:00Z',
    status: 'confirmed',
  },
];
