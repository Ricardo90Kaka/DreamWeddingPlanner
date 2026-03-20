import { Fragment } from "react";
import { Square, SquareCheckBig, SquarePen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import {
  createShoppingItemAction,
  deleteShoppingItemAction,
  toggleShoppingItemAction,
  updateShoppingItemAction,
} from "@/app/actions";
import { ActionNotice } from "@/components/action-notice";
import { SubmitButton } from "@/components/submit-button";
import { requireAdminUser } from "@/lib/auth";
import { listShoppingItems } from "@/lib/planner";
import { buildPathWithQuery } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Boodschappenlijst",
};

type ShoppingListPageProps = {
  searchParams?: Promise<{
    error?: string;
    edit?: string;
  }>;
};

export default async function ShoppingListPage({
  searchParams,
}: ShoppingListPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const { supabase, user } = await requireAdminUser();
  const shoppingItems = await listShoppingItems(supabase, user.id);
  const activeEditId = resolvedSearchParams.edit ?? null;
  const listUrl = "/boodschappenlijst";
  const currentViewUrl = buildPathWithQuery("/boodschappenlijst", { edit: activeEditId });
  const openCount = shoppingItems.filter((item) => !item.checked).length;

  return (
    <div className="space-y-5">
      <section className="surface-card rounded-[2rem] p-5 sm:p-6">
        <p className="eyebrow">Boodschappenlijst</p>
        <h2 className="font-display mt-4 text-4xl leading-none text-[var(--foreground)]">
          Houd alles wat nog gehaald moet worden overzichtelijk bij
        </h2>
        <p className="muted-copy mt-3 text-sm leading-7">
          Voeg eenvoudig boodschappen toe, vink ze af wanneer ze binnen zijn en
          pas een item later altijd nog aan.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <article className="soft-card rounded-[1.6rem] p-4">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              Nog te halen
            </p>
            <p className="summary-stat-value mt-3">{openCount}</p>
          </article>

          <article className="soft-card rounded-[1.6rem] p-4">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              Afgevinkt
            </p>
            <p className="summary-stat-value mt-3">
              {shoppingItems.length - openCount}
            </p>
          </article>
        </div>

        <div className="mt-6">
          <ActionNotice message={resolvedSearchParams.error} />
        </div>

        <form action={createShoppingItemAction} className="mt-4 space-y-4">
          <input type="hidden" name="redirectTo" value={listUrl} />

          <div>
            <label htmlFor="shopping-title" className="field-label">
              Nieuw item
            </label>
            <input
              id="shopping-title"
              name="title"
              placeholder="Bijvoorbeeld bloemenlint, servetten of taartmes"
              required
            />
          </div>

          <SubmitButton pendingLabel="Item opslaan..." className="w-full">
            Item toevoegen
          </SubmitButton>
        </form>
      </section>

      <section className="surface-card rounded-[2rem] p-5 sm:p-6">
        <p className="eyebrow">Lijst</p>
        <h3 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
          Alle boodschappenitems
        </h3>

        <div className="mt-6">
          {shoppingItems.length > 0 ? (
            <div className="planner-table-wrap">
              <table className="planner-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Afgevinkt</th>
                    <th>Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {shoppingItems.map((item) => {
                    const isEditing = activeEditId === item.id;
                    const editUrl = buildPathWithQuery("/boodschappenlijst", {
                      edit: item.id,
                    });

                    return (
                      <Fragment key={item.id}>
                        <tr>
                          <td className="font-semibold text-[var(--foreground)]">{item.title}</td>
                          <td>
                            <form action={toggleShoppingItemAction} className="flex">
                              <input type="hidden" name="id" value={item.id} />
                              <input type="hidden" name="redirectTo" value={currentViewUrl} />
                              <input type="hidden" name="checked" value={item.checked ? "" : "on"} />
                              <button
                                type="submit"
                                aria-label={item.checked ? "Heropen item" : "Vink item af"}
                                title={item.checked ? "Heropen item" : "Vink item af"}
                                className={`button-reset icon-action-button ${
                                  item.checked
                                    ? "icon-action-button-checked"
                                    : "icon-action-button-toggle"
                                }`}
                              >
                                {item.checked ? (
                                  <SquareCheckBig aria-hidden="true" strokeWidth={2.2} />
                                ) : (
                                  <Square aria-hidden="true" strokeWidth={2.2} />
                                )}
                              </button>
                            </form>
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
                                  aria-label="Bewerk boodschappenitem"
                                  title="Bewerk boodschappenitem"
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
                            <td colSpan={3}>
                              <div className="inline-edit-panel">
                                <form action={updateShoppingItemAction} className="space-y-4">
                                  <input type="hidden" name="id" value={item.id} />
                                  <input type="hidden" name="redirectTo" value={listUrl} />
                                  <input type="hidden" name="errorRedirectTo" value={editUrl} />

                                  <div>
                                    <label
                                      className="field-label"
                                      htmlFor={`shopping-title-${item.id}`}
                                    >
                                      Item
                                    </label>
                                    <input
                                      id={`shopping-title-${item.id}`}
                                      name="title"
                                      defaultValue={item.title}
                                      required
                                    />
                                  </div>

                                  <label className="soft-card flex cursor-pointer items-center gap-3 rounded-[1.4rem] px-4 py-4">
                                    <input
                                      name="checked"
                                      type="checkbox"
                                      defaultChecked={item.checked}
                                      className="h-5 w-5 shrink-0 rounded-md border border-[var(--border-soft)] accent-[var(--accent-strong)]"
                                    />
                                    <span className="text-sm font-medium text-[var(--foreground)]">
                                      Dit item is al afgevinkt
                                    </span>
                                  </label>

                                  <SubmitButton pendingLabel="Opslaan..." className="w-full sm:w-auto">
                                    Wijzigingen opslaan
                                  </SubmitButton>
                                </form>

                                <form action={deleteShoppingItemAction} className="mt-3">
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
              </table>
            </div>
          ) : (
            <div className="soft-card rounded-[1.7rem] p-5">
              <p className="text-base font-semibold text-[var(--foreground)]">
                Nog geen boodschappen toegevoegd
              </p>
              <p className="muted-copy mt-2 text-sm leading-7">
                Voeg hierboven je eerste item toe om overzicht te houden over
                alles wat nog gehaald moet worden.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
