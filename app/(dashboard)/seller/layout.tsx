import { AppLayout } from "@/shared/components/app-layout";

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout role="seller">{children}</AppLayout>;
}
