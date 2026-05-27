import RoleLayout from '@/shared/components/role-layout';
export default function Layout({ children }: { children: React.ReactNode }) {
  return <RoleLayout requiredRole="officer">{children}</RoleLayout>;
}
