import { MobileNav } from "@/components/mobile-nav";

type PlannerShellProps = {
  children: React.ReactNode;
};

export function PlannerShell({ children }: PlannerShellProps) {
  return (
    <>
      <div className="bottom-safe mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <main className="flex-1">{children}</main>
      </div>

      <MobileNav />
    </>
  );
}
