import { Fragment } from "react";
import { SquarePen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import {
  createBudgetItemAction,
  deleteBudgetItemAction,
  updateBudgetItemAction,
} from "@/app/actions";
import { ActionNotice } from "@/components/action-notice";
import { SubmitButton } from "@/components/submit-button";
import { requireAdminUser } from "@/lib/auth";
import { listBudgetItems } from "@/lib/planner";
import {
  buildPathWithQuery,
  formatEuroFromCents,
  formatWholeEuroInput,
  getBudgetFilter,
  getBudgetGrandTotal,
  getBudgetPaidGrandTotal,
  getBudgetTotals,
} from "@/lib/utils";

export const metadata: Metadata = {
  title: "Budget",
};

type BudgetPageProps = {
  searchParams?: Promise<{
    status?: string;
    error?: string;
    edit?: string;
  }>;
};

export default async function BudgetPage({ searchParams }: BudgetPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const { supabase, user } = await requireAdminUser();
  const budgetItems = await listBudgetItems(supabase, user.id);
  const budgetFilter = getBudgetFilter(resolvedSearchParams.status);
  const budgetTotals = getBudgetTotals(budgetItems);
  const totalBudget = getBudgetGrandTotal(budgetItems);
  const activeEditId = resolvedSearchParams.edit ?? null;
  const visibleItems = budgetItems.filter((item) => {
    if (budgetFilter === "final") {
      return item.isFinal;
    }

    if (budgetFilter === "tentative") {
      return !item.isFinal;
    }

    return true;
  });
  const visibleTotal = getBudgetGrandTotal(visibleItems);
  const visiblePaidTotal = getBudgetPaidGrandTotal(visibleItems);

  const baseStatus = budgetFilter === "all" ? null : budgetFilter;
  const listUrl = buildPathWithQuery("/budget", { status: baseStatus });
  const getEditUrl = (id: string) =>
    buildPathWithQuery("/budget", { status: baseStatus, edit: id });

  const filterLinks = [
    { label: "Alles", href: "/budget", active: budgetFilter === "all" },
    {
      label: "Definitief",
      href: "/budget?status=final",
      active: budgetFilter === "final",
    },
    {
      label: "Voorlopig",
      href: "/budget?status=tentative",
      active: budgetFilter === "tentative",
    },
  ];

  return (
    <div className="space-y-5">
      <section className="surface-card rounded-[2rem] p-5 sm:p-6">
        <p className="eyebrow">Budget</p>
        <h2 className="font-display mt-4 text-4xl leading-none text-[var(--foreground)]">
          Wat staat vast en wat blijft nog open?
        </h2>
        <p className="muted-copy mt-3 text-sm leading-7">
          Voeg per onderwerp een bedrag toe en markeer direct of het budget al
          definitief is, nog kan schuiven en hoeveel er al is aanbetaald.
        </p>

        <div className="mt-6">
          <ActionNotice message={resolvedSearchParams.error} />
        </div>

        <form action={createBudgetItemAction} className="mt-4 space-y-4">
          <input type="hidden" name="redirectTo" value={listUrl} />

          <div>
            <label htmlFor="budget-title" className="field-label">
              Onderwerp
            </label>
            <input
              id="budget-title"
              name="title"
              placeholder="Bijvoorbeeld locatie, bloemen of fotograaf"
              required
            />
          </div>

          <div>
            <label htmlFor="budget-amount" className="field-label">
              Budget in euro
            </label>
            <input
              id="budget-amount"
              name="amount"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              placeholder="1500"
              required
            />
          </div>

          <div>
            <label htmlFor="budget-amount-paid" className="field-label">
              Aanbetaald in euro
            </label>
            <input
              id="budget-amount-paid"
              name="amountPaid"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              placeholder="0"
            />
          </div>

          <label className="soft-card flex cursor-pointer items-center gap-3 rounded-[1.4rem] px-4 py-4">
            <input
              name="isFinal"
              type="checkbox"
              className="h-5 w-5 shrink-0 rounded-md border border-[var(--border-soft)] accent-[var(--accent-strong)]"
            />
            <span className="text-sm font-medium text-[var(--foreground)]">
              Dit budget is definitief
            </span>
          </label>

          <SubmitButton pendingLabel="Budgetitem opslaan..." className="w-full">
            Budgetitem toevoegen
          </SubmitButton>
        </form>
      </section>

      <section className="surface-card rounded-[2rem] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Lijst</p>
            <h3 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
              Alle budgetonderdelen
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {filterLinks.map((filterLink) => (
              <Link
                key={filterLink.href}
                href={filterLink.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filterLink.active
                    ? "bg-[var(--accent-strong)] text-white"
                    : "bg-white/75 text-[var(--foreground)] hover:bg-white"
                }`}
              >
                {filterLink.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <article className="soft-card summary-stat rounded-[1.4rem] p-4">
            <p className="text-sm font-semibold text-[var(--foreground)]">Definitief</p>
            <p className="summary-stat-value mt-2">{formatEuroFromCents(budgetTotals.final)}</p>
          </article>
          <article className="soft-card summary-stat rounded-[1.4rem] p-4">
            <p className="text-sm font-semibold text-[var(--foreground)]">Voorlopig</p>
            <p className="summary-stat-value mt-2">
              {formatEuroFromCents(budgetTotals.tentative)}
            </p>
          </article>
          <article className="soft-card summary-stat rounded-[1.4rem] p-4">
            <p className="text-sm font-semibold text-[var(--foreground)]">Totaal</p>
            <p className="summary-stat-value mt-2">{formatEuroFromCents(totalBudget)}</p>
          </article>
        </div>

        <div className="mt-6">
          {visibleItems.length > 0 ? (
            <div className="planner-table-wrap">
              <table className="planner-table">
                <thead>
                  <tr>
                    <th>Onderwerp</th>
                    <th>Status</th>
                    <th>Bedrag</th>
                    <th>Aanbetaald</th>
                    <th>Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleItems.map((item) => {
                    const isEditing = activeEditId === item.id;
                    const editUrl = getEditUrl(item.id);

                    return (
                      <Fragment key={item.id}>
                        <tr>
                          <td className="font-semibold text-[var(--foreground)]">{item.title}</td>
                          <td>
                            <span
                              className={`status-pill ${
                                item.isFinal ? "status-pill-final" : "status-pill-draft"
                              }`}
                            >
                              {item.isFinal ? "Definitief" : "Voorlopig"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap font-semibold text-[var(--foreground)]">
                            {formatEuroFromCents(item.amountCents)}
                          </td>
                          <td className="whitespace-nowrap font-semibold text-[var(--foreground)]">
                            {formatEuroFromCents(item.amountPaidCents)}
                          </td>
                          <td>
                            <div className="flex flex-wrap gap-2">
                              {isEditing ? (
                                <Link
                                  href={listUrl}
                                  scroll={false}
                                  className="action-chip action-chip-secondary"
                                >
                                  Sluit
                                </Link>
                              ) : (
                                <Link
                                  href={editUrl}
                                  scroll={false}
                                  aria-label="Bewerk budgetitem"
                                  title="Bewerk budgetitem"
                                  className="icon-action-button icon-action-button-edit"
                                >
                                  <SquarePen aria-hidden="true" strokeWidth={2.2} />
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>

                        {isEditing ? (
                          <tr className="planner-inline-row">
                            <td colSpan={5}>
                              <div className="inline-edit-panel">
                                <form
                                  action={updateBudgetItemAction}
                                  className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]"
                                >
                                  <input type="hidden" name="id" value={item.id} />
                                  <input type="hidden" name="redirectTo" value={listUrl} />
                                  <input type="hidden" name="errorRedirectTo" value={editUrl} />

                                  <div>
                                    <label
                                      className="field-label"
                                      htmlFor={`budget-title-${item.id}`}
                                    >
                                      Onderwerp
                                    </label>
                                    <input
                                      id={`budget-title-${item.id}`}
                                      name="title"
                                      defaultValue={item.title}
                                      required
                                    />
                                  </div>

                                  <div>
                                    <label
                                      className="field-label"
                                      htmlFor={`budget-amount-${item.id}`}
                                    >
                                      Budget in euro
                                    </label>
                                    <input
                                      id={`budget-amount-${item.id}`}
                                      name="amount"
                                      type="number"
                                      inputMode="numeric"
                                      min="0"
                                      step="1"
                                      defaultValue={formatWholeEuroInput(item.amountCents)}
                                      required
                                    />
                                  </div>

                                  <div>
                                    <label
                                      className="field-label"
                                      htmlFor={`budget-amount-paid-${item.id}`}
                                    >
                                      Aanbetaald in euro
                                    </label>
                                    <input
                                      id={`budget-amount-paid-${item.id}`}
                                      name="amountPaid"
                                      type="number"
                                      inputMode="numeric"
                                      min="0"
                                      step="1"
                                      defaultValue={formatWholeEuroInput(item.amountPaidCents)}
                                    />
                                  </div>

                                  <label className="soft-card flex cursor-pointer items-center gap-3 rounded-[1.4rem] px-4 py-4 lg:col-span-3">
                                    <input
                                      name="isFinal"
                                      type="checkbox"
                                      defaultChecked={item.isFinal}
                                      className="h-5 w-5 shrink-0 rounded-md border border-[var(--border-soft)] accent-[var(--accent-strong)]"
                                    />
                                    <span className="text-sm font-medium text-[var(--foreground)]">
                                      Dit budget is definitief
                                    </span>
                                  </label>

                                  <div className="flex flex-col gap-3 sm:flex-row lg:col-span-3">
                                    <SubmitButton pendingLabel="Opslaan..." className="w-full sm:w-auto">
                                      Wijzigingen opslaan
                                    </SubmitButton>
                                  </div>
                                </form>

                                <form action={deleteBudgetItemAction} className="mt-3">
                                  <input type="hidden" name="id" value={item.id} />
                                  <input type="hidden" name="redirectTo" value={listUrl} />
                                  <input type="hidden" name="errorRedirectTo" value={editUrl} />
                                  <SubmitButton
                                    pendingLabel="Verwijderen..."
                                    variant="danger"
                                    className="w-full sm:w-auto"
                                  >
                                    Verwijderen
                                  </SubmitButton>
                                </form>
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2}>Totaal zichtbare regels</td>
                    <td className="whitespace-nowrap">{formatEuroFromCents(visibleTotal)}</td>
                    <td className="whitespace-nowrap">{formatEuroFromCents(visiblePaidTotal)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="soft-card rounded-[1.7rem] p-5">
              <p className="text-base font-semibold text-[var(--foreground)]">
                Nog geen budgetonderdelen zichtbaar
              </p>
              <p className="muted-copy mt-2 text-sm leading-7">
                Voeg links je eerste onderwerp toe, of wissel van filter als je
                alleen definitieve of voorlopige posten wilt bekijken.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
