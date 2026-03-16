import type { SupabaseClient } from "@supabase/supabase-js";

import type { BudgetItem, Guest, TodoItem } from "@/lib/types";
import { sortTodoItems } from "@/lib/utils";

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
  dinner_included: boolean;
  dietary_notes: string;
  created_at: string;
  updated_at: string;
}): Guest {
  return {
    id: record.id,
    name: record.name,
    attendanceStatus: record.attendance_status,
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
  completed: boolean;
  created_at: string;
  updated_at: string;
}): TodoItem {
  return {
    id: record.id,
    title: record.title,
    dueDate: record.due_date,
    completed: record.completed,
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
    .select("id, name, attendance_status, dinner_included, dietary_notes, created_at, updated_at")
    .eq("user_id", userId);

  assertQuerySucceeded(error, "gasten");

  return (data ?? [])
    .map(mapGuest)
    .sort((left, right) => left.name.localeCompare(right.name, "nl"));
}

export async function listTodoItems(supabase: PlannerClient, userId: string) {
  const { data, error } = await supabase
    .from("todo_items")
    .select("id, title, due_date, completed, created_at, updated_at")
    .eq("user_id", userId);

  assertQuerySucceeded(error, "to-do's");

  return sortTodoItems((data ?? []).map(mapTodoItem));
}
