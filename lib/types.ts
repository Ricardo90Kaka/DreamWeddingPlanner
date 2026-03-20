export type AttendanceStatus = "yes" | "no" | "unknown";
export type VendorKey =
  | "trouwlocatie"
  | "fotograaf"
  | "videograaf"
  | "juwelier"
  | "ceremoniemeester"
  | "babs"
  | "trouwjurk"
  | "trouwpak"
  | "taart"
  | "decoratie"
  | "vervoer"
  | "dj"
  | "zanger";
export type VendorAccent = "default" | "rose" | "blue";
export type VendorIconName =
  | "Landmark"
  | "Camera"
  | "Clapperboard"
  | "Gem"
  | "ClipboardList"
  | "ScrollText"
  | "Shirt"
  | "Cake"
  | "Flower2"
  | "CarFront"
  | "Headphones"
  | "MicVocal";

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
  notes: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ShoppingItem = {
  id: string;
  title: string;
  checked: boolean;
  createdAt: string;
  updatedAt: string;
};

export type VendorChecklistItem = {
  key: VendorKey;
  label: string;
  iconName: VendorIconName;
  accent: VendorAccent;
  checked: boolean;
};

export type BudgetFilter = "all" | "final" | "tentative";
export type GuestSort = "name" | "dinner" | "diet";
export type SortDirection = "asc" | "desc";
