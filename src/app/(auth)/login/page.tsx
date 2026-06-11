import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { loginAction } from "@/app/actions";
import { ActionNotice } from "@/components/action-notice";
import { SubmitButton } from "@/components/submit-button";
import { getCurrentUser } from "@/lib/auth";
import { getMissingSetupKeys, isAdminEmail } from "@/lib/env";

export const metadata: Metadata = {
  title: "Login",
};

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const { user } = await getCurrentUser();

  if (user && isAdminEmail(user.email)) {
    redirect("/");
  }

  const missingSetupKeys = getMissingSetupKeys();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="surface-card overflow-hidden rounded-[2.4rem] p-6 sm:p-8">
          <div className="flex h-full flex-col justify-between gap-10">
            <div>
              <p className="eyebrow">Admin toegang</p>
              <h1 className="font-display mt-4 text-5xl leading-none text-[var(--foreground)] sm:text-6xl">
                Droombruiloft
                <br />
                planner
              </h1>
              <p className="muted-copy mt-5 max-w-xl text-base leading-8">
                Een rustige, prive plek om budgetten, gasten en alle laatste
                details van de dag te beheren. Geoptimaliseerd voor snel gebruik
                op smartphone.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="soft-card rounded-[1.5rem] p-4">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Budget helder
                </p>
                <p className="muted-copy mt-2 text-sm">
                  Definitieve en voorlopige kosten blijven zichtbaar naast elkaar.
                </p>
              </div>
              <div className="soft-card rounded-[1.5rem] p-4">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Gasten compleet
                </p>
                <p className="muted-copy mt-2 text-sm">
                  Dinerkeuze en dieetwensen staan direct bij elke gast.
                </p>
              </div>
              <div className="soft-card rounded-[1.5rem] p-4">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Mobiel eerst
                </p>
                <p className="muted-copy mt-2 text-sm">
                  Grote invoervelden en snelle formulieren voor onderweg.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-card rounded-[2.4rem] p-6 sm:p-8">
          <p className="eyebrow">Inloggen</p>
          <h2 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">
            Alleen voor admin-gebruik
          </h2>
          <p className="muted-copy mt-3 text-sm leading-7">
            Gebruik het vooraf ingestelde admin-account om toegang te krijgen
            tot de planner.
          </p>

          <div className="mt-6">
            <ActionNotice message={resolvedSearchParams.error} />
          </div>

          {missingSetupKeys.length > 0 ? (
            <div className="soft-card mt-4 rounded-[1.7rem] p-5">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Configuratie ontbreekt
              </p>
              <p className="muted-copy mt-2 text-sm leading-7">
                Vul eerst deze variabelen in voor lokaal gebruik en op Vercel:
              </p>
              <ul className="mt-4 space-y-2 text-sm font-medium text-[var(--accent-strong)]">
                {missingSetupKeys.map((key) => (
                  <li key={key}>{key}</li>
                ))}
              </ul>
            </div>
          ) : (
            <form action={loginAction} className="mt-6 space-y-5">
              <div>
                <label htmlFor="email" className="field-label">
                  E-mailadres
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@voorbeeld.nl"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="field-label">
                  Wachtwoord
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Voer je wachtwoord in"
                  required
                />
              </div>

              <SubmitButton pendingLabel="Bezig met inloggen..." className="w-full">
                Inloggen als admin
              </SubmitButton>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
