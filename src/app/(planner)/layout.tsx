import { PlannerShell } from "@/components/planner-shell";
import { requireAdminUser } from "@/lib/auth";
import { listVendorChecklistItems } from "@/lib/planner";

export default async function PlannerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { supabase, user } = await requireAdminUser();
  const vendorItems = await listVendorChecklistItems(supabase, user.id);

  return <PlannerShell vendorItems={vendorItems}>{children}</PlannerShell>;
}
