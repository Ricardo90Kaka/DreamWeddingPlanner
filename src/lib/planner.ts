import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  BudgetItem,
  Guest,
  ShoppingItem,
  TodoItem,
  VendorChecklistItem,
  VendorKey,
} from "@/lib/types";
import { sortShoppingItems, sortTodoItems } from "@/lib/utils";
import { vendorDefinitions } from "@/lib/vendors";

type PlannerClient = SupabaseClient;

function assertQuerySucceeded(
  error: { message: string } | null,
  entityName: string,
) {
  if (error) {
    throw new Error(`Kon ${entityName} niet laden: ${error.message}`);
  }
}

function mapBudgetItem(record: {
  id: string;
  title: string;
  amount_cents: number;
  amount_paid_cents: number;
  is_final: boolean;
  created_at: string;
  updated_at: string;
}): BudgetItem {
  return {
    id: record.id,
    title: record.title,
    amountCents: record.amount_cents,
    amountPaidCents: record.amount_paid_cents,
    isFinal: record.is_final,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function mapGuest(record: {
  id: string;
  name: string;
  attendance_status: "yes" | "no" | "unknown";
  hotel_status: "single" | "double" | "no" | "unknown";
  dinner_included: boolean;
  dietary_notes: string;
  created_at: string;
  updated_at: string;
}): Guest {
  return {
    id: record.id,
    name: record.name,
    attendanceStatus: record.attendance_status,
    hotelStatus: record.hotel_status,
    dinnerIncluded: record.dinner_included,
    dietaryNotes: record.dietary_notes ?? "",
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function mapTodoItem(record: {
  id: string;
  title: string;
  due_date: string | null;
  notes: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}): TodoItem {
  return {
    id: record.id,
    title: record.title,
    dueDate: record.due_date,
    notes: record.notes ?? "",
    completed: record.completed,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function mapShoppingItem(record: {
  id: string;
  title: string;
  checked: boolean;
  created_at: string;
  updated_at: string;
}): ShoppingItem {
  return {
    id: record.id,
    title: record.title,
    checked: record.checked,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export async function listBudgetItems(supabase: PlannerClient, userId: string) {
  const { data, error } = await supabase
    .from("budget_items")
    .select("id, title, amount_cents, amount_paid_cents, is_final, created_at, updated_at")
    .eq("user_id", userId);

  assertQuerySucceeded(error, "budgetonderdelen");

  return (data ?? [])
    .map(mapBudgetItem)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function listGuests(supabase: PlannerClient, userId: string) {
  const { data, error } = await supabase
    .from("guests")
    .select(
      "id, name, attendance_status, hotel_status, dinner_included, dietary_notes, created_at, updated_at",
    )
    .eq("user_id", userId);

  assertQuerySucceeded(error, "gasten");

  return (data ?? [])
    .map(mapGuest)
    .sort((left, right) => left.name.localeCompare(right.name, "nl"));
}

export async function listTodoItems(supabase: PlannerClient, userId: string) {
  const { data, error } = await supabase
    .from("todo_items")
    .select("id, title, due_date, notes, completed, created_at, updated_at")
    .eq("user_id", userId);

  assertQuerySucceeded(error, "to-do's");

  return sortTodoItems((data ?? []).map(mapTodoItem));
}

export async function listShoppingItems(supabase: PlannerClient, userId: string) {
  const { data, error } = await supabase
    .from("shopping_items")
    .select("id, title, checked, created_at, updated_at")
    .eq("user_id", userId);

  assertQuerySucceeded(error, "boodschappenitems");

  return sortShoppingItems((data ?? []).map(mapShoppingItem));
}

export async function listVendorChecklistItems(
  supabase: PlannerClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("vendor_checklist_statuses")
    .select("vendor_key, checked")
    .eq("user_id", userId);

  assertQuerySucceeded(error, "leveranciers");

  const checkedByKey = new Map<VendorKey, boolean>(
    (data ?? []).map((record) => [record.vendor_key as VendorKey, record.checked]),
  );

  return vendorDefinitions.map<VendorChecklistItem>((definition) => ({
    ...definition,
    checked: checkedByKey.get(definition.key) ?? false,
  }));
}
