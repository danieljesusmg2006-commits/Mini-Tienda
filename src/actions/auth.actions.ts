"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, inviteUserSchema, type LoginInput, type InviteUserInput } from "@/lib/validators/auth";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { UserRole } from "@/types/database.types";

export async function loginAction(data: LoginInput) {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Datos inválidos" };
  }

  const { email, password } = result.data;
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { error: "Credenciales incorrectas o usuario no encontrado" };
  }

  // Verificar si el usuario está activo
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_active, role")
    .eq("id", authData.user.id)
    .single();

  if (profile && !profile.is_active) {
    await supabase.auth.signOut();
    return { error: "Su cuenta se encuentra suspendida o inactiva. Comuníquese con el administrador." };
  }

  return { success: true };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function inviteUserAction(data: InviteUserInput) {
  const result = inviteUserSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Datos inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return { error: "No autorizado" };
  }

  // Verificar que el usuario actual sea administrador
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", currentUser.id)
    .single();

  if (!currentProfile || !currentProfile.is_active || !["super_admin", "admin"].includes(currentProfile.role)) {
    return { error: "No tiene permisos suficientes para invitar usuarios." };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return { error: "Configuración de servidor incompleta (SUPABASE_SERVICE_ROLE_KEY)." };
  }

  // Cliente con permisos de administración exclusiva
  const adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    result.data.email,
    {
      data: {
        full_name: result.data.fullName,
        role: result.data.role,
      },
    }
  );

  if (inviteError) {
    return { error: `Error al enviar invitación: ${inviteError.message}` };
  }

  revalidatePath("/usuarios");
  return { success: true, message: `Invitación enviada exitosamente a ${result.data.email}` };
}

export async function toggleUserStatusAction(userId: string, newStatus: boolean) {
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) return { error: "No autenticado" };

  // Evitar auto-bloqueo
  if (currentUser.id === userId) {
    return { error: "No puede desactivar su propia cuenta de usuario." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: newStatus })
    .eq("id", userId);

  if (error) {
    return { error: `No fue posible actualizar el estado: ${error.message}` };
  }

  revalidatePath("/usuarios");
  return { success: true };
}

export async function updateUserRoleAction(userId: string, newRole: UserRole) {
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) return { error: "No autenticado" };

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) {
    return { error: `No fue posible actualizar el rol: ${error.message}` };
  }

  revalidatePath("/usuarios");
  return { success: true };
}
