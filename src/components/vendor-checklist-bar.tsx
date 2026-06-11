"use client";

import {
  Cake,
  Camera,
  CarFront,
  Check,
  ClipboardList,
  Clapperboard,
  Flower2,
  Gem,
  Headphones,
  Landmark,
  type LucideIcon,
  MicVocal,
  ScrollText,
  Shirt,
} from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

import { toggleVendorChecklistItemAction } from "@/app/actions";
import type { VendorChecklistItem, VendorIconName } from "@/lib/types";

const iconMap: Record<VendorIconName, LucideIcon> = {
  Landmark,
  Camera,
  Clapperboard,
  Gem,
  ClipboardList,
  ScrollText,
  Shirt,
  Cake,
  Flower2,
  CarFront,
  Headphones,
  MicVocal,
};

type VendorChecklistBarProps = {
  items: VendorChecklistItem[];
};

export function VendorChecklistBar({ items }: VendorChecklistBarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.toString();
  const redirectTo = currentSearch ? `${pathname}?${currentSearch}` : pathname;

  return (
    <section className="surface-card rounded-[2rem] p-4 sm:p-5">
      <p className="eyebrow">Leveranciers</p>

      <div className="vendor-checklist-scroll mt-4">
        <div className="vendor-checklist-row">
          {items.map((item) => {
            const Icon = iconMap[item.iconName];

            return (
              <form key={item.key} action={toggleVendorChecklistItemAction} className="shrink-0">
                <input type="hidden" name="vendorKey" value={item.key} />
                <input type="hidden" name="checked" value={item.checked ? "" : "on"} />
                <input type="hidden" name="redirectTo" value={redirectTo} />

                <button
                  type="submit"
                  className={`vendor-chip ${item.checked ? "vendor-chip-checked" : ""}`}
                  aria-label={`${item.label} ${item.checked ? "afgevinkt" : "open"}`}
                  title={item.label}
                >
                  <span
                    className={`vendor-chip-icon ${
                      item.accent === "rose"
                        ? "vendor-chip-icon-rose"
                        : item.accent === "blue"
                          ? "vendor-chip-icon-blue"
                          : "vendor-chip-icon-default"
                    }`}
                  >
                    <Icon aria-hidden={true} className="h-6 w-6" strokeWidth={2.1} />
                    {item.checked ? (
                      <span className="vendor-chip-check">
                        <Check aria-hidden={true} className="h-3.5 w-3.5" strokeWidth={2.8} />
                      </span>
                    ) : null}
                  </span>
                  <span className="vendor-chip-label">{item.label}</span>
                </button>
              </form>
            );
          })}
        </div>
      </div>
    </section>
  );
}
