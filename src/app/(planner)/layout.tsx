import { PlannerShell } from "@/components/planner-shell";
import { requireAdminUser } from "@/lib/auth";

export default async function PlannerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdminUser();

  return <PlannerShell>{children}</PlannerShell>;
}
