export type AttendanceStatus = "yes" | "no" | "unknown";

export type BudgetItem = {
  id: string;
  title: string;
  amountCents: number;
  amountPaidCents: number;
  isFinal: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Guest = {
  id: string;
  name: string;
  attendanceStatus: AttendanceStatus;
  dinnerIncluded: boolean;
  dietaryNotes: string;
  createdAt: string;
  updatedAt: string;
};

export type TodoItem = {
  id: string;
  title: string;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BudgetFilter = "all" | "final" | "tentative";
export type GuestSort = "name" | "dinner" | "diet";
export type SortDirection = "asc" | "desc";
