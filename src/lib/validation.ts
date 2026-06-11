import { z } from "zod";

import { vendorKeys } from "@/lib/vendors";
import { parseEuroToCents } from "@/lib/utils";

export const loginSchema = z.object({
  email: z.string().trim().email("Gebruik een geldig e-mailadres."),
  password: z.string().min(1, "Vul je wachtwoord in."),
});

const euroAmountSchema = z
  .string()
  .trim()
  .min(1, "Vul een budgetbedrag in.")
  .transform((value, ctx) => {
    const amountCents = parseEuroToCents(value);

    if (amountCents === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Gebruik een heel bedrag in euro, bijvoorbeeld 1500.",
      });
      return z.NEVER;
    }

    return amountCents;
  });

const optionalEuroAmountSchema = z
  .string()
  .trim()
  .transform((value, ctx) => {
    if (!value) {
      return 0;
    }

    const amountCents = parseEuroToCents(value);

    if (amountCents === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Gebruik voor aanbetaald een heel bedrag in euro, bijvoorbeeld 500.",
      });
      return z.NEVER;
    }

    return amountCents;
  });

export const budgetItemSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Geef een onderwerp op.")
      .max(80, "Houd het onderwerp korter dan 80 tekens."),
    amount: euroAmountSchema,
    amountPaid: optionalEuroAmountSchema,
    isFinal: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.amountPaid > value.amount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amountPaid"],
        message: "Aanbetaald kan niet hoger zijn dan het budgetbedrag.",
      });
    }
  });

export const guestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Geef een naam op.")
    .max(120, "Gebruik maximaal 120 tekens voor een naam."),
  attendanceStatus: z.enum(["yes", "no", "unknown"], {
    message: "Kies een geldige aanwezigheid.",
  }),
  hotelStatus: z.enum(["single", "double", "no", "unknown"], {
    message: "Kies een geldige hotelstatus.",
  }),
  dinnerIncluded: z.boolean(),
  dietaryNotes: z
    .string()
    .trim()
    .max(400, "Gebruik maximaal 400 tekens voor dieetwensen."),
});

export const todoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Beschrijf de taak.")
    .max(160, "Gebruik maximaal 160 tekens voor een taak."),
  dueDate: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null)
    .refine(
      (value) =>
        value === null || /^\d{4}-\d{2}-\d{2}$/.test(value),
      "Kies een geldige datum.",
    ),
});

export const todoNotesSchema = z.object({
  notes: z
    .string()
    .trim()
    .max(3000, "Gebruik maximaal 3000 tekens voor notities."),
});

export const shoppingItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Geef een itemnaam op.")
    .max(160, "Gebruik maximaal 160 tekens voor een item."),
  checked: z.boolean(),
});

export const vendorChecklistToggleSchema = z.object({
  vendorKey: z.enum(vendorKeys, {
    message: "Kies een geldige leverancier.",
  }),
  checked: z.boolean(),
});

export const recordIdSchema = z.string().uuid("Ongeldig item-id.");
