import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Toaster } from "sonner";
import type { Profile } from "@/types/database.types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseConfigured =
    supabaseUrl &&
    !supabaseUrl.includes("tu-proyecto") &&
    !supabaseUrl.includes("demo.supabase.co");

  let profile: Profile | null = null;

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        redirect("/login");
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      profile = data;
    } catch {
      // En caso de error de conexión, se mantiene el fallback
    }
  }

  // Perfil de desarrollo/demostración cuando aún no se conectan credenciales de Supabase
  if (!profile) {
    profile = {
      id: "demo-user-id",
      email: "admin@empresa.com",
      full_name: "Administrador Demo",
      role: "super_admin",
      phone: "+1 809-555-0199",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar fijo en Desktop */}
      <Sidebar userRole={profile.role} />

      {/* Contenedor Principal */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Header profile={profile} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>

        {/* Barra de navegación inferior para móvil */}
        <MobileNav userRole={profile.role} />
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}
