import { AppLayout } from "@/shared/components/app-layout";

export default function BuyerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout role="buyer">{children}</AppLayout>;
}
