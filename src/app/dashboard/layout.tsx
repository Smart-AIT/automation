import { Sidebar } from '@/components/dashboard';
import { AutoLogoutProvider } from '@/components/auth/AutoLogoutProvider';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const expiresAt = session?.expires_at || 0;

  return (
    <AutoLogoutProvider expiresAt={expiresAt}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </AutoLogoutProvider>
  );
}
