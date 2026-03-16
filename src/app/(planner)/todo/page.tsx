import type { Metadata } from "next";
import Link from "next/link";

import {
  createTodoAction,
  deleteTodoAction,
  toggleTodoAction,
  updateTodoAction,
} from "@/app/actions";
import { ActionNotice } from "@/components/action-notice";
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
  }>;
};

export default async function TodoPage({ searchParams }: TodoPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const { supabase, user } = await requireAdminUser();
  const todoItems = await listTodoItems(supabase, user.id);
  const activeEditId = resolvedSearchParams.edit ?? null;
  const listUrl = "/todo";
  const currentViewUrl = buildPathWithQuery("/todo", { edit: activeEditId });
  const openTodoCount = todoItems.filter((item) => !item.completed).length;

  return (
    <div className="grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
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

        <div className="mt-6 space-y-4">
          {todoItems.length > 0 ? (
            todoItems.map((item) => {
              const isEditing = activeEditId === item.id;
              const editUrl = buildPathWithQuery("/todo", { edit: item.id });

              return (
                <article key={item.id} className="soft-card rounded-[1.7rem] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`status-pill ${
                            item.completed ? "status-pill-done" : "status-pill-todo"
                          }`}
                        >
                          {item.completed ? "Afgerond" : "Open"}
                        </span>
                        <span className="text-sm text-[var(--muted)]">
                          {item.dueDate ? `Deadline ${formatDateLabel(item.dueDate)}` : "Geen deadline"}
                        </span>
                      </div>
                      <h4 className="mt-3 text-lg font-semibold text-[var(--foreground)]">
                        {item.title}
                      </h4>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      <form action={toggleTodoAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="redirectTo" value={currentViewUrl} />
                        <input type="hidden" name="completed" value={item.completed ? "" : "on"} />
                        <SubmitButton
                          pendingLabel="Bijwerken..."
                          variant={item.completed ? "ghost" : "secondary"}
                          className="w-full sm:w-auto"
                        >
                          {item.completed ? "Heropen taak" : "Markeer als klaar"}
                        </SubmitButton>
                      </form>

                      <Link
                        href={isEditing ? listUrl : editUrl}
                        className={`action-chip ${
                          isEditing ? "action-chip-secondary" : "action-chip-primary"
                        }`}
                      >
                        {isEditing ? "Sluit" : "Bewerk"}
                      </Link>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="inline-edit-panel mt-4">
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
                  ) : null}
                </article>
              );
            })
          ) : (
            <div className="soft-card rounded-[1.7rem] p-5">
              <p className="text-base font-semibold text-[var(--foreground)]">
                Nog geen taken toegevoegd
              </p>
              <p className="muted-copy mt-2 text-sm leading-7">
                Voeg links de eerste to-do toe om overzicht te houden op de
                laatste afspraken en deadlines.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
