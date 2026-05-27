import RoleLayout from '@/shared/components/role-layout';

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return <RoleLayout requiredRole="buyer">{children}</RoleLayout>;
}
