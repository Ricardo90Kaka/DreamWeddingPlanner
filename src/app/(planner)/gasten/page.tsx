import { Fragment } from "react";
import { Minus, Plus, SquarePen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import {
  createGuestAction,
  deleteGuestAction,
  updateGuestAction,
} from "@/app/actions";
import { ActionNotice } from "@/components/action-notice";
import { SubmitButton } from "@/components/submit-button";
import { requireAdminUser } from "@/lib/auth";
import { listGuests } from "@/lib/planner";
import {
  buildPathWithQuery,
  formatAttendanceStatus,
  formatHotelStatus,
  getGuestSort,
  getNextSortDirection,
  getSortDirection,
  sortGuests,
} from "@/lib/utils";

export const metadata: Metadata = {
  title: "Gasten",
};

type GuestsPageProps = {
  searchParams?: Promise<{
    error?: string;
    sort?: string;
    direction?: string;
    edit?: string;
    create?: string;
  }>;
};

export default async function GuestsPage({ searchParams }: GuestsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const { supabase, user } = await requireAdminUser();
  const guests = await listGuests(supabase, user.id);
  const currentSort = getGuestSort(resolvedSearchParams.sort);
  const currentDirection = getSortDirection(resolvedSearchParams.direction);
  const sortedGuests = sortGuests(guests, currentSort, currentDirection);
  const isCreating = resolvedSearchParams.create === "1";
  const activeEditId = isCreating ? null : resolvedSearchParams.edit ?? null;
  const dinnerGuests = guests.filter((guest) => guest.dinnerIncluded).length;
  const dietaryGuests = guests.filter((guest) => guest.dietaryNotes).length;
  const hotelBookings = guests.filter(
    (guest) =>
      guest.hotelStatus === "single" || guest.hotelStatus === "double",
  ).length;
  const listUrl = buildPathWithQuery("/gasten", {
    sort: currentSort,
    direction: currentDirection,
  });
  const createUrl = buildPathWithQuery("/gasten", {
    sort: currentSort,
    direction: currentDirection,
    create: "1",
  });
  const getEditUrl = (id: string) =>
    buildPathWithQuery("/gasten", {
      sort: currentSort,
      direction: currentDirection,
      edit: id,
    });

  const sortLinks = [
    { label: "Naam", key: "name" as const },
    { label: "Diner", key: "dinner" as const },
    { label: "Dieet", key: "diet" as const },
  ];

  return (
    <section className="surface-card rounded-[2rem] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Lijst</p>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
            Gastenlijst
          </h2>
        </div>

        <Link
          href={isCreating ? listUrl : createUrl}
          scroll={false}
          className="create-toggle-button"
        >
          {isCreating ? (
            <Minus aria-hidden="true" strokeWidth={2.2} />
          ) : (
            <Plus aria-hidden="true" strokeWidth={2.2} />
          )}
          <span>{isCreating ? "Sluiten" : "Nieuwe gast"}</span>
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <article className="soft-card rounded-[1.6rem] p-4">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Gasten op diner
          </p>
          <p className="summary-stat-value mt-3">
            {dinnerGuests}/{guests.length}
          </p>
        </article>

        <article className="soft-card rounded-[1.6rem] p-4">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Met dieetwens
          </p>
          <p className="summary-stat-value mt-3">{dietaryGuests}</p>
        </article>

        <article className="soft-card rounded-[1.6rem] p-4">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Hotelboekingen
          </p>
          <p className="summary-stat-value mt-3">{hotelBookings}</p>
        </article>
      </div>

      <div className="mt-6">
        <ActionNotice message={resolvedSearchParams.error} />
      </div>

      {isCreating ? (
        <div className="inline-edit-panel mt-4">
          <form action={createGuestAction} className="space-y-4">
            <input type="hidden" name="redirectTo" value={listUrl} />
            <input type="hidden" name="errorRedirectTo" value={createUrl} />

            <div>
              <label htmlFor="guest-name" className="field-label">
                Naam van de gast
              </label>
              <input
                id="guest-name"
                name="name"
                placeholder="Bijvoorbeeld Sophie de Vries"
                required
              />
            </div>

            <div>
              <label htmlFor="guest-attendance-status" className="field-label">
                Aanwezig
              </label>
              <select
                id="guest-attendance-status"
                name="attendanceStatus"
                defaultValue="unknown"
              >
                <option value="yes">Ja</option>
                <option value="no">Nee</option>
                <option value="unknown">Onbekend</option>
              </select>
            </div>

            <div>
              <label htmlFor="guest-hotel-status" className="field-label">
                Hotel
              </label>
              <select
                id="guest-hotel-status"
                name="hotelStatus"
                defaultValue="unknown"
              >
                <option value="single">1 persoons</option>
                <option value="double">2 persoons</option>
                <option value="no">Nee</option>
                <option value="unknown">Onbekend</option>
              </select>
            </div>

            <label className="soft-card flex cursor-pointer items-center gap-3 rounded-[1.4rem] px-4 py-4">
              <input
                name="dinnerIncluded"
                type="checkbox"
                className="h-5 w-5 shrink-0 rounded-md border border-[var(--border-soft)] accent-[var(--accent-strong)]"
              />
              <span className="text-sm font-medium text-[var(--foreground)]">
                Deze gast schuift aan bij het diner
              </span>
            </label>

            <div>
              <label htmlFor="guest-dietary-notes" className="field-label">
                Dieetwensen of opmerkingen
              </label>
              <textarea
                id="guest-dietary-notes"
                name="dietaryNotes"
                placeholder="Bijvoorbeeld vegetarisch, glutenvrij of allergie voor noten"
              />
            </div>

            <SubmitButton pendingLabel="Gast opslaan..." className="w-full sm:w-auto">
              Gast toevoegen
            </SubmitButton>
          </form>
        </div>
      ) : null}

      <div className="mt-6">
          {sortedGuests.length > 0 ? (
            <div className="planner-table-wrap">
              <table className="planner-table">
                <thead>
                  <tr>
                    {sortLinks.map((sortLink) => {
                      const nextDirection = getNextSortDirection(
                        currentSort,
                        currentDirection,
                        sortLink.key,
                      );
                      const href = buildPathWithQuery("/gasten", {
                        sort: sortLink.key,
                        direction: nextDirection,
                      });
                      const isActive = currentSort === sortLink.key;

                      return (
                        <th key={sortLink.key}>
                          <Link
                            href={href}
                            className={`inline-flex items-center gap-2 ${
                              isActive ? "font-semibold" : ""
                            }`}
                          >
                            <span>{sortLink.label}</span>
                            {isActive ? (
                              <span className="text-[0.65rem] tracking-[0.16em]">
                                {currentDirection === "asc" ? "ASC" : "DESC"}
                              </span>
                            ) : null}
                          </Link>
                        </th>
                      );
                    })}
                    <th>Aanwezig</th>
                    <th>Hotel</th>
                    <th>Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedGuests.map((guest) => {
                    const isEditing = activeEditId === guest.id;
                    const editUrl = getEditUrl(guest.id);

                    return (
                      <Fragment key={guest.id}>
                        <tr>
                          <td className="font-semibold text-[var(--foreground)]">{guest.name}</td>
                          <td>
                            <span
                              className={`status-pill ${
                                guest.dinnerIncluded ? "status-pill-final" : "status-pill-draft"
                              }`}
                            >
                              {guest.dinnerIncluded ? "Ja" : "Nee"}
                            </span>
                          </td>
                          <td className="max-w-[18rem] text-sm leading-7 text-[var(--muted)]">
                            {guest.dietaryNotes || "Geen"}
                          </td>
                          <td>
                            <span
                              className={`status-pill ${
                                guest.attendanceStatus === "yes"
                                  ? "status-pill-final"
                                  : guest.attendanceStatus === "no"
                                    ? "status-pill-draft"
                                    : "status-pill-done"
                              }`}
                            >
                              {formatAttendanceStatus(guest.attendanceStatus)}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`status-pill ${
                                guest.hotelStatus === "single" ||
                                guest.hotelStatus === "double"
                                  ? "status-pill-final"
                                  : guest.hotelStatus === "no"
                                    ? "status-pill-draft"
                                    : "status-pill-done"
                              }`}
                            >
                              {formatHotelStatus(guest.hotelStatus)}
                            </span>
                          </td>
                          <td>
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
                                aria-label="Bewerk gast"
                                title="Bewerk gast"
                                className="icon-action-button icon-action-button-edit"
                              >
                                <SquarePen aria-hidden="true" strokeWidth={2.2} />
                              </Link>
                            )}
                          </td>
                        </tr>

                        {isEditing ? (
                          <tr className="planner-inline-row">
                            <td colSpan={6}>
                              <div className="inline-edit-panel">
                                <form action={updateGuestAction} className="space-y-4">
                                  <input type="hidden" name="id" value={guest.id} />
                                  <input type="hidden" name="redirectTo" value={listUrl} />
                                  <input type="hidden" name="errorRedirectTo" value={editUrl} />

                                  <div>
                                    <label className="field-label" htmlFor={`guest-name-${guest.id}`}>
                                      Naam
                                    </label>
                                    <input
                                      id={`guest-name-${guest.id}`}
                                      name="name"
                                      defaultValue={guest.name}
                                      required
                                    />
                                  </div>

                                  <div>
                                    <label
                                      className="field-label"
                                      htmlFor={`guest-attendance-${guest.id}`}
                                    >
                                      Aanwezig
                                    </label>
                                    <select
                                      id={`guest-attendance-${guest.id}`}
                                      name="attendanceStatus"
                                      defaultValue={guest.attendanceStatus}
                                    >
                                      <option value="yes">Ja</option>
                                      <option value="no">Nee</option>
                                      <option value="unknown">Onbekend</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label
                                      className="field-label"
                                      htmlFor={`guest-hotel-${guest.id}`}
                                    >
                                      Hotel
                                    </label>
                                    <select
                                      id={`guest-hotel-${guest.id}`}
                                      name="hotelStatus"
                                      defaultValue={guest.hotelStatus}
                                    >
                                      <option value="single">1 persoons</option>
                                      <option value="double">2 persoons</option>
                                      <option value="no">Nee</option>
                                      <option value="unknown">Onbekend</option>
                                    </select>
                                  </div>

                                  <label className="soft-card flex cursor-pointer items-center gap-3 rounded-[1.4rem] px-4 py-4">
                                    <input
                                      name="dinnerIncluded"
                                      type="checkbox"
                                      defaultChecked={guest.dinnerIncluded}
                                      className="h-5 w-5 shrink-0 rounded-md border border-[var(--border-soft)] accent-[var(--accent-strong)]"
                                    />
                                    <span className="text-sm font-medium text-[var(--foreground)]">
                                      Deze gast schuift aan bij het diner
                                    </span>
                                  </label>

                                  <div>
                                    <label className="field-label" htmlFor={`guest-dietary-${guest.id}`}>
                                      Dieetwensen
                                    </label>
                                    <textarea
                                      id={`guest-dietary-${guest.id}`}
                                      name="dietaryNotes"
                                      defaultValue={guest.dietaryNotes}
                                      placeholder="Bijzonderheden voor het diner"
                                    />
                                  </div>

                                  <SubmitButton pendingLabel="Opslaan..." className="w-full sm:w-auto">
                                    Wijzigingen opslaan
                                  </SubmitButton>
                                </form>

                                <form action={deleteGuestAction} className="mt-3">
                                  <input type="hidden" name="id" value={guest.id} />
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
                Nog geen gasten toegevoegd
              </p>
              <p className="muted-copy mt-2 text-sm leading-7">
                Voeg de eerste gast toe om dinerkeuzes en dieetwensen te
                gaan bijhouden.
              </p>
            </div>
          )}
      </div>
    </section>
  );
}
