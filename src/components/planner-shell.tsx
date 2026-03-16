import { logoutAction } from "@/app/actions";
import { MobileNav } from "@/components/mobile-nav";
import { SubmitButton } from "@/components/submit-button";

type PlannerShellProps = {
  children: React.ReactNode;
  userEmail?: string | null;
};

export function PlannerShell({ children, userEmail }: PlannerShellProps) {
  return (
    <>
      <div className="bottom-safe mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="surface-card rounded-[2rem] px-5 py-5 sm:px-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow">Prive planner</p>
              <h1 className="font-display mt-3 text-4xl leading-none text-[var(--foreground)] sm:text-5xl">
                Jullie dag, helder gepland.
              </h1>
              <p className="muted-copy mt-3 max-w-xl text-sm leading-7 sm:text-base">
                Een compacte admin-omgeving voor budget, gasten en to-do&apos;s,
                ontworpen om snel op je telefoon te werken.
              </p>
            </div>

            <div className="soft-card rounded-[1.6rem] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
                Admin
              </p>
              <p className="mt-2 max-w-[14rem] break-words text-sm font-medium text-[var(--foreground)]">
                {userEmail ?? "Ingelogd"}
              </p>
              <form action={logoutAction} className="mt-4">
                <SubmitButton variant="ghost" pendingLabel="Uitloggen..." className="w-full">
                  Uitloggen
                </SubmitButton>
              </form>
            </div>
          </div>
        </header>

        <main className="mt-5 flex-1">{children}</main>
      </div>

      <MobileNav />
    </>
  );
}
