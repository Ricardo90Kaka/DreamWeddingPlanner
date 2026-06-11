import { MobileNav } from "@/components/mobile-nav";
import { VendorChecklistBar } from "@/components/vendor-checklist-bar";
import type { VendorChecklistItem } from "@/lib/types";

type PlannerShellProps = {
  children: React.ReactNode;
  vendorItems: VendorChecklistItem[];
};

export function PlannerShell({ children, vendorItems }: PlannerShellProps) {
  return (
    <>
      <div className="bottom-safe mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <main className="flex-1">{children}</main>
        <div className="mt-5">
          <VendorChecklistBar items={vendorItems} />
        </div>
      </div>

      <MobileNav />
    </>
  );
}
