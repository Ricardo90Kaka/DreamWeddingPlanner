const SUPABASE_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

export const ALL_SETUP_KEYS = [...SUPABASE_KEYS, "ADMIN_EMAIL"] as const;

export function getMissingSetupKeys() {
  return ALL_SETUP_KEYS.filter((key) => !process.env[key]?.trim());
}

export function hasSupabaseConfig() {
  return SUPABASE_KEYS.every((key) => Boolean(process.env[key]?.trim()));
}

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    throw new Error(
      "Supabase mist configuratie. Stel NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY in.",
    );
  }

  return { url, anonKey };
}

export function getAdminEmail() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL ontbreekt. Stel het admin-account eerst in.");
  }

  return adminEmail;
}

export function isAdminEmail(email?: string | null) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  return Boolean(email && adminEmail && email.toLowerCase() === adminEmail);
}
