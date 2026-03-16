import { redirect } from "next/navigation";

import { hasSupabaseConfig, isAdminEmail } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { buildUrlWithError } from "@/lib/utils";

export async function getCurrentUser() {
  if (!hasSupabaseConfig()) {
    return { supabase: null, user: null };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function requireAdminUser() {
  if (!hasSupabaseConfig()) {
    redirect(
      buildUrlWithError(
        "/login",
        "Vul eerst de Supabase-configuratie in om de planner te openen.",
      ),
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAdminEmail(user.email)) {
    await supabase.auth.signOut();
    redirect(buildUrlWithError("/login", "Dit account heeft geen toegang."));
  }

  return { supabase, user };
}
