import RoleLayout from '@/shared/components/role-layout';
export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return <RoleLayout requiredRole="seller">{children}</RoleLayout>;
}
