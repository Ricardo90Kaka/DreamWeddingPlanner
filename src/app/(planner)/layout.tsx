import { PlannerShell } from "@/components/planner-shell";
import { requireAdminUser } from "@/lib/auth";

export default async function PlannerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await requireAdminUser();

  return <PlannerShell userEmail={user.email}>{children}</PlannerShell>;
}
