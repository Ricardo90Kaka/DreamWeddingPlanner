import { Fragment } from "react";
import { Minus, Plus, Square, SquareCheckBig, SquarePen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import {
  clearTodoNotesAction,
  createTodoAction,
  deleteTodoAction,
  saveTodoNotesAction,
  toggleTodoAction,
  updateTodoAction,
} from "@/app/actions";
import { ActionNotice } from "@/components/action-notice";
import { AutoGrowTextarea } from "@/components/auto-grow-textarea";
import { SubmitButton } from "@/components/submit-button";
import { requireAdminUser } from "@/lib/auth";
import { listTodoItems } from "@/lib/planner";
import { buildPathWithQuery, formatDateLabel } from "@/lib/utils";

export const metadata: Metadata = {
  title: "To-do",
};

type TodoPageProps = {
  searchParams?: Promise<{
    error?: string;
    edit?: string;
    note?: string;
  }>;
};

export default async function TodoPage({ searchParams }: TodoPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const { supabase, user } = await requireAdminUser();
  const todoItems = await listTodoItems(supabase, user.id);
  const activeNoteId = resolvedSearchParams.note ?? null;
  const activeEditId = activeNoteId ? null : resolvedSearchParams.edit ?? null;
  const listUrl = "/todo";
  const currentViewUrl = buildPathWithQuery("/todo", {
    edit: activeEditId,
    note: activeNoteId,
  });
  const openTodoCount = todoItems.filter((item) => !item.completed).length;

  return (
    <div className="space-y-5">
      <section className="surface-card rounded-[2rem] p-5 sm:p-6">
        <p className="eyebrow">To-do</p>
        <h2 className="font-display mt-4 text-4xl leading-none text-[var(--foreground)]">
          Houd de laatste acties compact en zichtbaar
        </h2>
        <p className="muted-copy mt-3 text-sm leading-7">
          Open taken blijven bovenaan staan zodat je vanaf je telefoon direct
          ziet wat nog aandacht nodig heeft.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <article className="soft-card rounded-[1.6rem] p-4">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              Open taken
            </p>
            <p className="summary-stat-value mt-3">{openTodoCount}</p>
          </article>

          <article className="soft-card rounded-[1.6rem] p-4">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              Afgerond
            </p>
            <p className="summary-stat-value mt-3">
              {todoItems.length - openTodoCount}
            </p>
          </article>
        </div>

        <div className="mt-6">
          <ActionNotice message={resolvedSearchParams.error} />
        </div>

        <form action={createTodoAction} className="mt-4 space-y-4">
          <input type="hidden" name="redirectTo" value={listUrl} />

          <div>
            <label htmlFor="todo-title" className="field-label">
              Nieuwe taak
            </label>
            <input
              id="todo-title"
              name="title"
              placeholder="Bijvoorbeeld proefmenu bevestigen"
              required
            />
          </div>

          <div>
            <label htmlFor="todo-due-date" className="field-label">
              Deadline
            </label>
            <input id="todo-due-date" name="dueDate" type="date" />
          </div>

          <SubmitButton pendingLabel="Taak opslaan..." className="w-full">
            Taak toevoegen
          </SubmitButton>
        </form>
      </section>

      <section className="surface-card rounded-[2rem] p-5 sm:p-6">
        <p className="eyebrow">Lijst</p>
        <h3 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
          Taken op volgorde van aandacht
        </h3>

        <div className="mt-6">
          {todoItems.length > 0 ? (
            <div className="planner-table-wrap">
              <table className="planner-table">
                <thead>
                  <tr>
                    <th aria-label="Notitie"></th>
                    <th>Taak</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    <th>Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {todoItems.map((item) => {
                    const isEditing = activeEditId === item.id;
                    const isNoteOpen = activeNoteId === item.id;
                    const editUrl = buildPathWithQuery("/todo", { edit: item.id });
                    const noteUrl = buildPathWithQuery("/todo", { note: item.id });

                    return (
                      <Fragment key={item.id}>
                        <tr>
                          <td className="w-0">
                            {isNoteOpen ? (
                              <Link
                                href={listUrl}
                                scroll={false}
                                aria-label="Sluit notitie"
                                title="Sluit notitie"
                                className="icon-action-button icon-action-button-toggle"
                              >
                                <Minus aria-hidden="true" strokeWidth={2.2} />
                              </Link>
                            ) : (
                              <Link
                                href={noteUrl}
                                scroll={false}
                                aria-label="Open notitie"
                                title="Open notitie"
                                className="icon-action-button icon-action-button-toggle"
                              >
                                <Plus aria-hidden="true" strokeWidth={2.2} />
                              </Link>
                            )}
                          </td>
                          <td className="font-semibold text-[var(--foreground)]">{item.title}</td>
                          <td className="whitespace-nowrap text-sm text-[var(--muted)]">
                            {item.dueDate ? formatDateLabel(item.dueDate) : "Geen"}
                          </td>
                          <td>
                            <form action={toggleTodoAction} className="flex">
                              <input type="hidden" name="id" value={item.id} />
                              <input type="hidden" name="redirectTo" value={currentViewUrl} />
                              <input type="hidden" name="completed" value={item.completed ? "" : "on"} />
                              <button
                                type="submit"
                                aria-label={item.completed ? "Heropen taak" : "Markeer taak als klaar"}
                                title={item.completed ? "Heropen taak" : "Markeer taak als klaar"}
                                className={`button-reset icon-action-button ${
                                  item.completed
                                    ? "icon-action-button-checked"
                                    : "icon-action-button-toggle"
                                }`}
                              >
                                {item.completed ? (
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
                                  aria-label="Bewerk taak"
                                  title="Bewerk taak"
                                  className="icon-action-button icon-action-button-edit"
                                >
                                  <SquarePen aria-hidden="true" strokeWidth={2.2} />
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>

                        {isNoteOpen ? (
                          <tr className="planner-inline-row">
                            <td colSpan={5}>
                              <div className="inline-edit-panel">
                                <form action={saveTodoNotesAction} className="space-y-4">
                                  <input type="hidden" name="id" value={item.id} />
                                  <input type="hidden" name="redirectTo" value={noteUrl} />
                                  <input type="hidden" name="errorRedirectTo" value={noteUrl} />

                                  <div>
                                    <label className="field-label" htmlFor={`todo-notes-${item.id}`}>
                                      Notities
                                    </label>
                                    <AutoGrowTextarea
                                      id={`todo-notes-${item.id}`}
                                      name="notes"
                                      defaultValue={item.notes}
                                      rows={5}
                                      className="todo-notes-textarea"
                                      placeholder="Voeg hier extra afspraken, ideeën of aandachtspunten toe."
                                    />
                                  </div>

                                  <SubmitButton pendingLabel="Opslaan..." className="w-full sm:w-auto">
                                    Opslaan
                                  </SubmitButton>
                                </form>

                                <form action={clearTodoNotesAction} className="mt-3">
                                  <input type="hidden" name="id" value={item.id} />
                                  <input type="hidden" name="redirectTo" value={noteUrl} />
                                  <input type="hidden" name="errorRedirectTo" value={noteUrl} />
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

                        {isEditing ? (
                          <tr className="planner-inline-row">
                            <td colSpan={5}>
                              <div className="inline-edit-panel">
                                <form action={updateTodoAction} className="space-y-4">
                                  <input type="hidden" name="id" value={item.id} />
                                  <input type="hidden" name="redirectTo" value={listUrl} />
                                  <input type="hidden" name="errorRedirectTo" value={editUrl} />

                                  <div>
                                    <label className="field-label" htmlFor={`todo-title-${item.id}`}>
                                      Taak
                                    </label>
                                    <input
                                      id={`todo-title-${item.id}`}
                                      name="title"
                                      defaultValue={item.title}
                                      required
                                    />
                                  </div>

                                  <div>
                                    <label className="field-label" htmlFor={`todo-date-${item.id}`}>
                                      Deadline
                                    </label>
                                    <input
                                      id={`todo-date-${item.id}`}
                                      name="dueDate"
                                      type="date"
                                      defaultValue={item.dueDate ?? ""}
                                    />
                                  </div>

                                  <SubmitButton pendingLabel="Opslaan..." className="w-full sm:w-auto">
                                    Wijzigingen opslaan
                                  </SubmitButton>
                                </form>

                                <form action={deleteTodoAction} className="mt-3">
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
                Nog geen taken toegevoegd
              </p>
              <p className="muted-copy mt-2 text-sm leading-7">
                Voeg hierboven de eerste to-do toe om overzicht te houden op de
                laatste afspraken en deadlines.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
