import { format } from "date-fns";
import { nl } from "date-fns/locale";

import type {
  AttendanceStatus,
  BudgetFilter,
  BudgetItem,
  Guest,
  GuestSort,
  HotelStatus,
  ShoppingItem,
  SortDirection,
  TodoItem,
} from "@/lib/types";

export function normaliseText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export function parseEuroToCents(value: string) {
  const cleaned = value.replace(/[€\s]/g, "");

  if (!cleaned) {
    return null;
  }

  let normalised = cleaned;

  if (/^\d+$/.test(cleaned)) {
    normalised = cleaned;
  } else if (/^\d{1,3}([.,]\d{3})+$/.test(cleaned)) {
    normalised = cleaned.replace(/[.,]/g, "");
  } else {
    return null;
  }

  const numericValue = Number(normalised);

  if (Number.isNaN(numericValue) || numericValue < 0 || !Number.isInteger(numericValue)) {
    return null;
  }

  return numericValue * 100;
}

export function formatEuroFromCents(amountCents: number) {
  const euros = Math.round(amountCents / 100);

  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(euros);
}

export function formatWholeEuroInput(amountCents: number) {
  return String(Math.round(amountCents / 100));
}

export function formatDateLabel(dateValue: string | null) {
  if (!dateValue) {
    return "Geen datum";
  }

  return format(new Date(`${dateValue}T00:00:00`), "d MMM yyyy", {
    locale: nl,
  });
}

export function buildUrlWithError(pathname: string, message: string) {
  const url = new URL(pathname, "https://planner.local");
  url.searchParams.set("error", message);
  return `${url.pathname}${url.search}`;
}

export function getSafeRedirectPath(
  rawRedirect: FormDataEntryValue | null,
  fallback: string,
) {
  if (typeof rawRedirect !== "string" || !rawRedirect.startsWith("/")) {
    return fallback;
  }

  return rawRedirect;
}

export function getBudgetFilter(rawValue?: string): BudgetFilter {
  if (rawValue === "final" || rawValue === "tentative") {
    return rawValue;
  }

  return "all";
}

export function getBudgetTotals(items: BudgetItem[]) {
  return items.reduce(
    (totals, item) => {
      if (item.isFinal) {
        totals.final += item.amountCents;
      } else {
        totals.tentative += item.amountCents;
      }

      return totals;
    },
    { final: 0, tentative: 0 },
  );
}

export function getBudgetGrandTotal(items: BudgetItem[]) {
  return items.reduce((sum, item) => sum + item.amountCents, 0);
}

export function getBudgetPaidGrandTotal(items: BudgetItem[]) {
  return items.reduce((sum, item) => sum + item.amountPaidCents, 0);
}

export function buildPathWithQuery(
  pathname: string,
  params: Record<string, string | null | undefined>,
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();

  return query ? `${pathname}?${query}` : pathname;
}

export function getGuestSort(rawValue?: string): GuestSort {
  if (rawValue === "dinner" || rawValue === "diet") {
    return rawValue;
  }

  return "name";
}

export function getSortDirection(rawValue?: string): SortDirection {
  return rawValue === "desc" ? "desc" : "asc";
}

export function getNextSortDirection(
  currentSort: GuestSort,
  currentDirection: SortDirection,
  targetSort: GuestSort,
) {
  if (currentSort === targetSort) {
    return currentDirection === "asc" ? "desc" : "asc";
  }

  return "asc";
}

export function sortGuests(
  items: Guest[],
  sortKey: GuestSort,
  direction: SortDirection,
) {
  const directionFactor = direction === "asc" ? 1 : -1;

  return [...items].sort((left, right) => {
    let result = 0;

    if (sortKey === "dinner") {
      result = Number(left.dinnerIncluded) - Number(right.dinnerIncluded);
    } else if (sortKey === "diet") {
      result =
        Number(Boolean(left.dietaryNotes.trim())) -
        Number(Boolean(right.dietaryNotes.trim()));
    } else {
      result = left.name.localeCompare(right.name, "nl");
    }

    if (result !== 0) {
      return result * directionFactor;
    }

    return left.name.localeCompare(right.name, "nl") * directionFactor;
  });
}

export function formatAttendanceStatus(status: AttendanceStatus) {
  if (status === "yes") {
    return "Ja";
  }

  if (status === "no") {
    return "Nee";
  }

  return "Onbekend";
}

export function formatHotelStatus(status: HotelStatus) {
  if (status === "single") {
    return "1 persoons";
  }

  if (status === "double") {
    return "2 persoons";
  }

  if (status === "no") {
    return "Nee";
  }

  return "Onbekend";
}

export function sortTodoItems(items: TodoItem[]) {
  return [...items].sort((left, right) => {
    if (left.completed !== right.completed) {
      return Number(left.completed) - Number(right.completed);
    }

    if (left.dueDate && right.dueDate && left.dueDate !== right.dueDate) {
      return left.dueDate.localeCompare(right.dueDate);
    }

    if (left.dueDate && !right.dueDate) {
      return -1;
    }

    if (!left.dueDate && right.dueDate) {
      return 1;
    }

    return right.createdAt.localeCompare(left.createdAt);
  });
}

export function sortShoppingItems(items: ShoppingItem[]) {
  return [...items].sort((left, right) => {
    if (left.checked !== right.checked) {
      return Number(left.checked) - Number(right.checked);
    }

    return right.createdAt.localeCompare(left.createdAt);
  });
}
