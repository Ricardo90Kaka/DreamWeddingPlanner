import type { Metadata } from "next";

import { logoutAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { requireAdminUser } from "@/lib/auth";
import { listBudgetItems, listGuests, listTodoItems } from "@/lib/planner";
import {
  formatDateLabel,
  formatEuroFromCents,
  getBudgetGrandTotal,
  getBudgetTotals,
} from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
};

function MoneyValue({
  value,
}: {
  value: string;
}) {
  return <p className="summary-stat-money dashboard-stat-value">{value}</p>;
}

export default async function DashboardPage() {
  const { supabase, user } = await requireAdminUser();
  const [budgetItems, guests, todoItems] = await Promise.all([
    listBudgetItems(supabase, user.id),
    listGuests(supabase, user.id),
    listTodoItems(supabase, user.id),
  ]);

  const budgetTotals = getBudgetTotals(budgetItems);
  const totalBudget = getBudgetGrandTotal(budgetItems);
  const openTodos = todoItems.filter((item) => !item.completed);
  const dietaryGuests = guests.filter((guest) => guest.dietaryNotes);
  const dinnerGuests = guests.filter((guest) => guest.dinnerIncluded).length;

  const stats = [
    {
      label: "Definitief budget",
      value: formatEuroFromCents(budgetTotals.final),
      tone: "bg-[rgba(129,144,128,0.14)] text-[#536151]",
    },
    {
      label: "Voorlopig budget",
      value: formatEuroFromCents(budgetTotals.tentative),
      tone: "bg-[rgba(178,119,99,0.14)] text-[var(--accent-strong)]",
    },
    {
      label: "Totaal budget",
      value: formatEuroFromCents(totalBudget),
      tone: "bg-[rgba(143,90,73,0.12)] text-[var(--foreground)]",
    },
    {
      label: "Gasten op diner",
      value: `${dinnerGuests}/${guests.length}`,
      tone: "bg-white/80 text-[var(--foreground)]",
    },
    {
      label: "Open taken",
      value: `${openTodos.length}`,
      tone: "bg-[#fff0ea] text-[#8d4034]",
    },
  ];

  return (
    <div className="space-y-5">
      <section className="surface-card rounded-[2rem] px-5 py-5 sm:px-7">
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
              {user.email ?? "Ingelogd"}
            </p>
            <form action={logoutAction} className="mt-4">
              <SubmitButton variant="ghost" pendingLabel="Uitloggen..." className="w-full">
                Uitloggen
              </SubmitButton>
            </form>
          </div>
        </div>
      </section>

      <section className="surface-card rounded-[2rem] p-5 sm:p-6">
        <p className="eyebrow">Dashboard</p>
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <h2 className="font-display text-4xl leading-none text-[var(--foreground)]">
              Vandaag in een oogopslag
            </h2>
            <p className="muted-copy mt-3 max-w-xl text-sm leading-7">
              Zie direct wat al vaststaat, waar nog ruimte in het budget zit en
              welke acties als volgende aandacht vragen.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className={`summary-stat soft-card rounded-[1.7rem] p-4 ${stat.tone}`}
            >
              <div className="summary-stat-body">
                <p className="summary-stat-label">{stat.label}</p>
                <MoneyValue value={stat.value} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="surface-card rounded-[2rem] p-5 sm:p-6">
          <p className="eyebrow">To-do focus</p>
          <div className="mt-4 space-y-4">
            {openTodos.length > 0 ? (
              openTodos.slice(0, 5).map((item) => (
                <article key={item.id} className="soft-card rounded-[1.6rem] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-[var(--foreground)]">
                        {item.title}
                      </p>
                      <p className="muted-copy mt-2 text-sm">
                        {item.dueDate
                          ? `Deadline ${formatDateLabel(item.dueDate)}`
                          : "Nog geen deadline"}
                      </p>
                    </div>
                    <span className="status-pill status-pill-todo">Open</span>
                  </div>
                </article>
              ))
            ) : (
              <div className="soft-card rounded-[1.6rem] p-5">
                <p className="text-base font-semibold text-[var(--foreground)]">
                  Alles is afgerond
                </p>
                <p className="muted-copy mt-2 text-sm">
                  Je hebt op dit moment geen openstaande taken meer.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="surface-card rounded-[2rem] p-5 sm:p-6">
          <p className="eyebrow">Gastoverzicht</p>
          <div className="mt-4 space-y-4">
            <div className="soft-card rounded-[1.6rem] p-4">
              <p className="text-sm font-semibold text-[var(--foreground)]">Dieetwensen</p>
              <p className="muted-copy mt-2 text-sm leading-7">
                {dietaryGuests.length > 0
                  ? `${dietaryGuests.length} gasten hebben een dieetwens of opmerking.`
                  : "Nog geen dieetwensen vastgelegd."}
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-dashed border-[var(--border-soft)] px-4 py-4">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Laatste aandachtspunten
              </p>
              <div className="mt-3 space-y-3">
                {dietaryGuests.slice(0, 4).map((guest) => (
                  <article key={guest.id} className="rounded-[1.2rem] bg-white/70 px-3 py-3">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {guest.name}
                    </p>
                    <p className="muted-copy mt-1 text-sm">{guest.dietaryNotes}</p>
                  </article>
                ))}

                {dietaryGuests.length === 0 ? (
                  <p className="muted-copy text-sm">Geen dieetwensen om te controleren.</p>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
