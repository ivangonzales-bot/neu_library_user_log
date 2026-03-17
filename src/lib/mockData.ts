export type UserRole = 'user' | 'admin';

export interface User {
  email: string;
  name: string;
  role: UserRole;
}

export interface VisitorEntry {
  id: string;
  name: string;
  college: string;
  program?: string;
  reason: string;
  isEmployee: boolean;
  employeeType?: 'teacher' | 'staff';
  userEmail?: string;
  timestamp: Date;
}

export const COLLEGES = [
  'College of Engineering',
  'College of Computer Studies',
  'College of Business & Accountancy',
  'College of Arts & Sciences',
  'College of Allied Health',
  'College of Architecture',
  'College of Education',
  'Graduate School',
];

export const PROGRAMS: Record<string, string[]> = {
  'College of Engineering': ['BS Civil Engineering', 'BS Mechanical Engineering', 'BS Electrical Engineering', 'BS Electronics Engineering'],
  'College of Computer Studies': ['BS Computer Science', 'BS Information Technology', 'BS Information Systems', 'BS Entertainment & Multimedia Computing'],
  'College of Business & Accountancy': ['BS Accountancy', 'BS Business Administration', 'BS Management Accounting', 'BS Entrepreneurship'],
  'College of Arts & Sciences': ['BA Communication', 'BA Political Science', 'BS Psychology', 'BS Biology'],
  'College of Allied Health': ['BS Nursing', 'BS Pharmacy', 'BS Medical Technology', 'BS Physical Therapy'],
  'College of Architecture': ['BS Architecture', 'BS Interior Design', 'BS Environmental Planning'],
  'College of Education': ['Bachelor of Elementary Education', 'Bachelor of Secondary Education', 'Bachelor of Physical Education'],
  'Graduate School': ['Master of Business Administration', 'Master of Arts in Education', 'Master of Science in IT', 'Doctor of Education'],
};

export const VISIT_REASONS = [
  'Study / Review',
  'Research',
  'Borrow Books',
  'Return Books',
  'Use Computers',
  'Group Discussion',
  'Print / Photocopy',
  'Other',
];

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const firstNames = ['Juan', 'Maria', 'Jose', 'Ana', 'Carlos', 'Sofia', 'Miguel', 'Isabella', 'Rafael', 'Carmen', 'Diego', 'Lucia', 'Pedro', 'Elena', 'Marco', 'Angela', 'Luis', 'Rosa', 'Daniel', 'Patricia'];
const lastNames = ['Santos', 'Reyes', 'Cruz', 'Garcia', 'Torres', 'Flores', 'Rivera', 'Lopez', 'Gonzales', 'Ramos', 'Mendoza', 'Aquino', 'Villanueva', 'Bautista', 'Dela Cruz'];

export function generateMockVisitors(count: number = 200): VisitorEntry[] {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  return Array.from({ length: count }, (_, i) => {
    const isEmployee = Math.random() < 0.15;
    return {
      id: `v-${i + 1}`,
      name: `${randomItem(firstNames)} ${randomItem(lastNames)}`,
      college: randomItem(COLLEGES),
      reason: randomItem(VISIT_REASONS),
      isEmployee,
      employeeType: isEmployee ? randomItem(['teacher', 'staff'] as const) : undefined,
      timestamp: randomDate(thirtyDaysAgo, now),
    };
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export const MOCK_VISITORS = generateMockVisitors(250);

export const ADMIN_EMAIL = 'jcesperanza@neu.edu.ph';
