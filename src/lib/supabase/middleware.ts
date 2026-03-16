import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { hasSupabaseConfig, getSupabaseConfig, isAdminEmail } from "@/lib/env";

function isPublicRoute(pathname: string) {
  return pathname === "/login";
}

function redirectToLogin(request: NextRequest, error?: string) {
  const url = new URL("/login", request.url);

  if (error) {
    url.searchParams.set("error", error);
  }

  return NextResponse.redirect(url);
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const publicRoute = isPublicRoute(pathname);

  if (!hasSupabaseConfig()) {
    if (publicRoute) {
      return NextResponse.next();
    }

    return redirectToLogin(
      request,
      "Vul eerst de Supabase-configuratie in om de planner te openen.",
    );
  }

  let response = NextResponse.next({
    request,
  });

  const { url, anonKey } = getSupabaseConfig();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return publicRoute ? response : redirectToLogin(request);
  }

  if (!isAdminEmail(user.email)) {
    await supabase.auth.signOut();
    return redirectToLogin(request, "Dit account heeft geen toegang tot de planner.");
  }

  if (publicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}
