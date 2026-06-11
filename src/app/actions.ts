"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminEmail, getMissingSetupKeys, isAdminEmail } from "@/lib/env";
import { requireAdminUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  budgetItemSchema,
  guestSchema,
  loginSchema,
  recordIdSchema,
  shoppingItemSchema,
  todoNotesSchema,
  todoSchema,
  vendorChecklistToggleSchema,
} from "@/lib/validation";
import {
  buildUrlWithError,
  getSafeRedirectPath,
  normaliseText,
} from "@/lib/utils";

function getFirstErrorMessage(error: { issues?: Array<{ message: string }> }) {
  return error.issues?.[0]?.message ?? "Controleer de ingevulde gegevens.";
}

function getSupabaseLoginErrorMessage(rawMessage?: string) {
  const message = rawMessage?.toLowerCase() ?? "";

  if (message.includes("email not confirmed")) {
    return "Dit account is nog niet bevestigd in Supabase. Controleer in Authentication > Users of email_confirmed_at of confirmed_at is ingevuld.";
  }

  if (message.includes("invalid login credentials")) {
    return "Supabase herkent dit e-mailadres en wachtwoord niet. Controleer in Authentication > Users of de gebruiker bestaat en stel eventueel een nieuw wachtwoord in.";
  }

  if (message.includes("email logins are disabled")) {
    return "E-mail inloggen staat uit in Supabase. Zet de Email provider voor sign-in weer aan.";
  }

  if (message.includes("anonymous sign-ins are disabled")) {
    return "Er is een ongeldige auth-configuratie in Supabase. Controleer de auth-instellingen van dit project.";
  }

  return rawMessage
    ? `Supabase loginfout: ${rawMessage}`
    : "Inloggen is niet gelukt door een onbekende fout in Supabase.";
}

function revalidatePlannerRoutes() {
  revalidatePath("/");
  revalidatePath("/budget");
  revalidatePath("/gasten");
  revalidatePath("/todo");
  revalidatePath("/boodschappenlijst");
}

function getBooleanValue(value: FormDataEntryValue | null) {
  return value === "on";
}

function getActionRedirects(formData: FormData, fallback: string) {
  const redirectTo = getSafeRedirectPath(formData.get("redirectTo"), fallback);
  const errorRedirectTo = getSafeRedirectPath(
    formData.get("errorRedirectTo"),
    redirectTo,
  );

  return { redirectTo, errorRedirectTo };
}

export async function loginAction(formData: FormData) {
  if (getMissingSetupKeys().length > 0) {
    redirect(
      buildUrlWithError(
        "/login",
        "Stel eerst de omgevingsvariabelen en Supabase in voordat je kunt inloggen.",
      ),
    );
  }

  const parsed = loginSchema.safeParse({
    email: normaliseText(formData.get("email")).toLowerCase(),
    password: normaliseText(formData.get("password")),
  });

  if (!parsed.success) {
    redirect(buildUrlWithError("/login", getFirstErrorMessage(parsed.error)));
  }

  const adminEmail = getAdminEmail();

  if (parsed.data.email !== adminEmail) {
    redirect(
      buildUrlWithError(
        "/login",
        "Alleen het ingestelde admin-account mag inloggen.",
      ),
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    console.error("Supabase login error", {
      message: error.message,
      status: "status" in error ? error.status : undefined,
      name: error.name,
    });

    redirect(
      buildUrlWithError(
        "/login",
        getSupabaseLoginErrorMessage(error.message),
      ),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    await supabase.auth.signOut();
    redirect(buildUrlWithError("/login", "Dit account heeft geen toegang."));
  }

  redirect("/");
}

export async function logoutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createBudgetItemAction(formData: FormData) {
  const { redirectTo, errorRedirectTo } = getActionRedirects(formData, "/budget");
  const { supabase, user } = await requireAdminUser();

  const parsed = budgetItemSchema.safeParse({
    title: normaliseText(formData.get("title")),
    amount: normaliseText(formData.get("amount")),
    amountPaid: normaliseText(formData.get("amountPaid")),
    isFinal: getBooleanValue(formData.get("isFinal")),
  });

  if (!parsed.success) {
    redirect(buildUrlWithError(errorRedirectTo, getFirstErrorMessage(parsed.error)));
  }

  const { error } = await supabase.from("budget_items").insert({
    user_id: user.id,
    title: parsed.data.title,
    amount_cents: parsed.data.amount,
    amount_paid_cents: parsed.data.amountPaid,
    is_final: parsed.data.isFinal,
  });

  if (error) {
    redirect(buildUrlWithError(errorRedirectTo, "Opslaan van het budgetitem is mislukt."));
  }

  revalidatePlannerRoutes();
  redirect(redirectTo);
}

export async function updateBudgetItemAction(formData: FormData) {
  const { redirectTo, errorRedirectTo } = getActionRedirects(formData, "/budget");
  const { supabase, user } = await requireAdminUser();

  const id = recordIdSchema.safeParse(normaliseText(formData.get("id")));

  if (!id.success) {
    redirect(buildUrlWithError(errorRedirectTo, getFirstErrorMessage(id.error)));
  }

  const parsed = budgetItemSchema.safeParse({
    title: normaliseText(formData.get("title")),
    amount: normaliseText(formData.get("amount")),
    amountPaid: normaliseText(formData.get("amountPaid")),
    isFinal: getBooleanValue(formData.get("isFinal")),
  });

  if (!parsed.success) {
    redirect(buildUrlWithError(errorRedirectTo, getFirstErrorMessage(parsed.error)));
  }

  const { error } = await supabase
    .from("budget_items")
    .update({
      title: parsed.data.title,
      amount_cents: parsed.data.amount,
      amount_paid_cents: parsed.data.amountPaid,
      is_final: parsed.data.isFinal,
    })
    .eq("id", id.data)
    .eq("user_id", user.id);

  if (error) {
    redirect(buildUrlWithError(errorRedirectTo, "Bijwerken van het budgetitem is mislukt."));
  }

  revalidatePlannerRoutes();
  redirect(redirectTo);
}

export async function deleteBudgetItemAction(formData: FormData) {
  const { redirectTo, errorRedirectTo } = getActionRedirects(formData, "/budget");
  const { supabase, user } = await requireAdminUser();
  const id = recordIdSchema.safeParse(normaliseText(formData.get("id")));

  if (!id.success) {
    redirect(buildUrlWithError(errorRedirectTo, getFirstErrorMessage(id.error)));
  }

  const { error } = await supabase
    .from("budget_items")
    .delete()
    .eq("id", id.data)
    .eq("user_id", user.id);

  if (error) {
    redirect(buildUrlWithError(errorRedirectTo, "Verwijderen van het budgetitem is mislukt."));
  }

  revalidatePlannerRoutes();
  redirect(redirectTo);
}

export async function createGuestAction(formData: FormData) {
  const { redirectTo, errorRedirectTo } = getActionRedirects(formData, "/gasten");
  const { supabase, user } = await requireAdminUser();

  const parsed = guestSchema.safeParse({
    name: normaliseText(formData.get("name")),
    attendanceStatus: normaliseText(formData.get("attendanceStatus")),
    hotelStatus: normaliseText(formData.get("hotelStatus")),
    dinnerIncluded: getBooleanValue(formData.get("dinnerIncluded")),
    dietaryNotes: normaliseText(formData.get("dietaryNotes")),
  });

  if (!parsed.success) {
    redirect(buildUrlWithError(errorRedirectTo, getFirstErrorMessage(parsed.error)));
  }

  const { error } = await supabase.from("guests").insert({
    user_id: user.id,
    name: parsed.data.name,
    attendance_status: parsed.data.attendanceStatus,
    hotel_status: parsed.data.hotelStatus,
    dinner_included: parsed.data.dinnerIncluded,
    dietary_notes: parsed.data.dietaryNotes,
  });

  if (error) {
    redirect(buildUrlWithError(errorRedirectTo, "Opslaan van de gast is mislukt."));
  }

  revalidatePlannerRoutes();
  redirect(redirectTo);
}

export async function updateGuestAction(formData: FormData) {
  const { redirectTo, errorRedirectTo } = getActionRedirects(formData, "/gasten");
  const { supabase, user } = await requireAdminUser();
  const id = recordIdSchema.safeParse(normaliseText(formData.get("id")));

  if (!id.success) {
    redirect(buildUrlWithError(errorRedirectTo, getFirstErrorMessage(id.error)));
  }

  const parsed = guestSchema.safeParse({
    name: normaliseText(formData.get("name")),
    attendanceStatus: normaliseText(formData.get("attendanceStatus")),
    hotelStatus: normaliseText(formData.get("hotelStatus")),
    dinnerIncluded: getBooleanValue(formData.get("dinnerIncluded")),
    dietaryNotes: normaliseText(formData.get("dietaryNotes")),
  });

  if (!parsed.success) {
    redirect(buildUrlWithError(errorRedirectTo, getFirstErrorMessage(parsed.error)));
  }

  const { error } = await supabase
    .from("guests")
    .update({
      name: parsed.data.name,
      attendance_status: parsed.data.attendanceStatus,
      hotel_status: parsed.data.hotelStatus,
      dinner_included: parsed.data.dinnerIncluded,
      dietary_notes: parsed.data.dietaryNotes,
    })
    .eq("id", id.data)
    .eq("user_id", user.id);

  if (error) {
    redirect(buildUrlWithError(errorRedirectTo, "Bijwerken van de gast is mislukt."));
  }

  revalidatePlannerRoutes();
  redirect(redirectTo);
}

export async function deleteGuestAction(formData: FormData) {
  const { redirectTo, errorRedirectTo } = getActionRedirects(formData, "/gasten");
  const { supabase, user } = await requireAdminUser();
  const id = recordIdSchema.safeParse(normaliseText(formData.get("id")));

  if (!id.success) {
    redirect(buildUrlWithError(errorRedirectTo, getFirstErrorMessage(id.error)));
  }

  const { error } = await supabase
    .from("guests")
    .delete()
    .eq("id", id.data)
    .eq("user_id", user.id);

  if (error) {
    redirect(buildUrlWithError(errorRedirectTo, "Verwijderen van de gast is mislukt."));
  }

  revalidatePlannerRoutes();
  redirect(redirectTo);
}

export async function createTodoAction(formData: FormData) {
  const { redirectTo, errorRedirectTo } = getActionRedirects(formData, "/todo");
  const { supabase, user } = await requireAdminUser();

  const parsed = todoSchema.safeParse({
    title: normaliseText(formData.get("title")),
    dueDate: normaliseText(formData.get("dueDate")),
  });

  if (!parsed.success) {
    redirect(buildUrlWithError(errorRedirectTo, getFirstErrorMessage(parsed.error)));
  }

  const { error } = await supabase.from("todo_items").insert({
    user_id: user.id,
    title: parsed.data.title,
    due_date: parsed.data.dueDate,
  });

  if (error) {
    redirect(buildUrlWithError(errorRedirectTo, "Opslaan van de taak is mislukt."));
  }

  revalidatePlannerRoutes();
  redirect(redirectTo);
}

export async function updateTodoAction(formData: FormData) {
  const { redirectTo, errorRedirectTo } = getActionRedirects(formData, "/todo");
  const { supabase, user } = await requireAdminUser();
  const id = recordIdSchema.safeParse(normaliseText(formData.get("id")));

  if (!id.success) {
    redirect(buildUrlWithError(errorRedirectTo, getFirstErrorMessage(id.error)));
  }

  const parsed = todoSchema.safeParse({
    title: normaliseText(formData.get("title")),
    dueDate: normaliseText(formData.get("dueDate")),
  });

  if (!parsed.success) {
    redirect(buildUrlWithError(errorRedirectTo, getFirstErrorMessage(parsed.error)));
  }

  const { error } = await supabase
    .from("todo_items")
    .update({
      title: parsed.data.title,
      due_date: parsed.data.dueDate,
    })
    .eq("id", id.data)
    .eq("user_id", user.id);

  if (error) {
    redirect(buildUrlWithError(errorRedirectTo, "Bijwerken van de taak is mislukt."));
  }

  revalidatePlannerRoutes();
  redirect(redirectTo);
}

export async function toggleTodoAction(formData: FormData) {
  const { redirectTo, errorRedirectTo } = getActionRedirects(formData, "/todo");
  const { supabase, user } = await requireAdminUser();
  const id = recordIdSchema.safeParse(normaliseText(formData.get("id")));

  if (!id.success) {
    redirect(buildUrlWithError(errorRedirectTo, getFirstErrorMessage(id.error)));
  }

  const completed = getBooleanValue(formData.get("completed"));

  const { error } = await supabase
    .from("todo_items")
    .update({ completed })
    .eq("id", id.data)
    .eq("user_id", user.id);

  if (error) {
    redirect(buildUrlWithError(errorRedirectTo, "Bijwerken van de taakstatus is mislukt."));
  }

  revalidatePlannerRoutes();
  redirect(redirectTo);
}

export async function deleteTodoAction(formData: FormData) {
  const { redirectTo, errorRedirectTo } = getActionRedirects(formData, "/todo");
  const { supabase, user } = await requireAdminUser();
  const id = recordIdSchema.safeParse(normaliseText(formData.get("id")));

  if (!id.success) {
    redirect(buildUrlWithError(errorRedirectTo, getFirstErrorMessage(id.error)));
  }

  const { error } = await supabase
    .from("todo_items")
    .delete()
    .eq("id", id.data)
    .eq("user_id", user.id);

  if (error) {
    redirect(buildUrlWithError(errorRedirectTo, "Verwijderen van de taak is mislukt."));
  }

  revalidatePlannerRoutes();
  redirect(redirectTo);
}

export async function saveTodoNotesAction(formData: FormData) {
  const { redirectTo, errorRedirectTo } = getActionRedirects(formData, "/todo");
  const { supabase, user } = await requireAdminUser();
  const id = recordIdSchema.safeParse(normaliseText(formData.get("id")));

  if (!id.success) {
    redirect(buildUrlWithError(errorRedirectTo, getFirstErrorMessage(id.error)));
  }

  const parsed = todoNotesSchema.safeParse({
    notes: normaliseText(formData.get("notes")),
  });

  if (!parsed.success) {
    redirect(buildUrlWithError(errorRedirectTo, getFirstErrorMessage(parsed.error)));
  }

  const { error } = await supabase
    .from("todo_items")
    .update({
      notes: parsed.data.notes,
    })
    .eq("id", id.data)
    .eq("user_id", user.id);

  if (error) {
    redirect(buildUrlWithError(errorRedirectTo, "Opslaan van de notitie is mislukt."));
  }

  revalidatePlannerRoutes();
  redirect(redirectTo);
}

export async function clearTodoNotesAction(formData: FormData) {
  const { redirectTo, errorRedirectTo } = getActionRedirects(formData, "/todo");
  const { supabase, user } = await requireAdminUser();
  const id = recordIdSchema.safeParse(normaliseText(formData.get("id")));

  if (!id.success) {
    redirect(buildUrlWithError(errorRedirectTo, getFirstErrorMessage(id.error)));
  }

  const { error } = await supabase
    .from("todo_items")
    .update({
      notes: "",
    })
    .eq("id", id.data)
    .eq("user_id", user.id);

  if (error) {
    redirect(buildUrlWithError(errorRedirectTo, "Verwijderen van de notitie is mislukt."));
  }

  revalidatePlannerRoutes();
  redirect(redirectTo);
}

export async function createShoppingItemAction(formData: FormData) {
  const { redirectTo, errorRedirectTo } = getActionRedirects(
    formData,
    "/boodschappenlijst",
  );
  const { supabase, user } = await requireAdminUser();

  const parsed = shoppingItemSchema.safeParse({
    title: normaliseText(formData.get("title")),
    checked: false,
  });

  if (!parsed.success) {
    redirect(buildUrlWithError(errorRedirectTo, getFirstErrorMessage(parsed.error)));
  }

  const { error } = await supabase.from("shopping_items").insert({
    user_id: user.id,
    title: parsed.data.title,
    checked: parsed.data.checked,
  });

  if (error) {
    redirect(
      buildUrlWithError(errorRedirectTo, "Opslaan van het boodschappenitem is mislukt."),
    );
  }

  revalidatePlannerRoutes();
  redirect(redirectTo);
}

export async function updateShoppingItemAction(formData: FormData) {
  const { redirectTo, errorRedirectTo } = getActionRedirects(
    formData,
    "/boodschappenlijst",
  );
  const { supabase, user } = await requireAdminUser();
  const id = recordIdSchema.safeParse(normaliseText(formData.get("id")));

  if (!id.success) {
    redirect(buildUrlWithError(errorRedirectTo, getFirstErrorMessage(id.error)));
  }

  const parsed = shoppingItemSchema.safeParse({
    title: normaliseText(formData.get("title")),
    checked: getBooleanValue(formData.get("checked")),
  });

  if (!parsed.success) {
    redirect(buildUrlWithError(errorRedirectTo, getFirstErrorMessage(parsed.error)));
  }

  const { error } = await supabase
    .from("shopping_items")
    .update({
      title: parsed.data.title,
      checked: parsed.data.checked,
    })
    .eq("id", id.data)
    .eq("user_id", user.id);

  if (error) {
    redirect(
      buildUrlWithError(errorRedirectTo, "Bijwerken van het boodschappenitem is mislukt."),
    );
  }

  revalidatePlannerRoutes();
  redirect(redirectTo);
}

export async function toggleShoppingItemAction(formData: FormData) {
  const { redirectTo, errorRedirectTo } = getActionRedirects(
    formData,
    "/boodschappenlijst",
  );
  const { supabase, user } = await requireAdminUser();
  const id = recordIdSchema.safeParse(normaliseText(formData.get("id")));

  if (!id.success) {
    redirect(buildUrlWithError(errorRedirectTo, getFirstErrorMessage(id.error)));
  }

  const checked = getBooleanValue(formData.get("checked"));

  const { error } = await supabase
    .from("shopping_items")
    .update({ checked })
    .eq("id", id.data)
    .eq("user_id", user.id);

  if (error) {
    redirect(
      buildUrlWithError(errorRedirectTo, "Bijwerken van de boodschappenstatus is mislukt."),
    );
  }

  revalidatePlannerRoutes();
  redirect(redirectTo);
}

export async function deleteShoppingItemAction(formData: FormData) {
  const { redirectTo, errorRedirectTo } = getActionRedirects(
    formData,
    "/boodschappenlijst",
  );
  const { supabase, user } = await requireAdminUser();
  const id = recordIdSchema.safeParse(normaliseText(formData.get("id")));

  if (!id.success) {
    redirect(buildUrlWithError(errorRedirectTo, getFirstErrorMessage(id.error)));
  }

  const { error } = await supabase
    .from("shopping_items")
    .delete()
    .eq("id", id.data)
    .eq("user_id", user.id);

  if (error) {
    redirect(
      buildUrlWithError(errorRedirectTo, "Verwijderen van het boodschappenitem is mislukt."),
    );
  }

  revalidatePlannerRoutes();
  redirect(redirectTo);
}

export async function toggleVendorChecklistItemAction(formData: FormData) {
  const { redirectTo, errorRedirectTo } = getActionRedirects(formData, "/");
  const { supabase, user } = await requireAdminUser();

  const parsed = vendorChecklistToggleSchema.safeParse({
    vendorKey: normaliseText(formData.get("vendorKey")),
    checked: getBooleanValue(formData.get("checked")),
  });

  if (!parsed.success) {
    redirect(buildUrlWithError(errorRedirectTo, getFirstErrorMessage(parsed.error)));
  }

  const { error } = await supabase.from("vendor_checklist_statuses").upsert(
    {
      user_id: user.id,
      vendor_key: parsed.data.vendorKey,
      checked: parsed.data.checked,
    },
    {
      onConflict: "user_id,vendor_key",
    },
  );

  if (error) {
    redirect(
      buildUrlWithError(
        errorRedirectTo,
        "Bijwerken van de leveranciersstatus is mislukt.",
      ),
    );
  }

  revalidatePlannerRoutes();
  redirect(redirectTo);
}
