"use client";

import { useState, useTransition } from "react";
import { inviteUserAction, toggleUserStatusAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, ShieldCheck, Mail, Phone, User, CheckCircle2, XCircle, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import type { UserRole, Profile } from "@/types/database.types";

export default function UsuariosPage() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("vendedor");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Lista demostrativa inicial de usuarios para visualización
  const [users, setUsers] = useState<Profile[]>([
    {
      id: "u-1",
      full_name: "Administrador Central",
      email: "admin@empresa.com",
      role: "super_admin",
      phone: "+1 809-555-0100",
      is_active: true,
      created_at: "2026-09-01T10:00:00Z",
      updated_at: "2026-09-01T10:00:00Z",
    },
    {
      id: "u-2",
      full_name: "Carlos Martínez (Encargado Almacén)",
      email: "almacen@empresa.com",
      role: "almacenista",
      phone: "+1 809-555-0144",
      is_active: true,
      created_at: "2026-09-10T14:30:00Z",
      updated_at: "2026-09-10T14:30:00Z",
    },
    {
      id: "u-3",
      full_name: "Mariana Gómez (Vendedora / Cajera)",
      email: "ventas1@empresa.com",
      role: "vendedor",
      phone: "+1 809-555-0182",
      is_active: true,
      created_at: "2026-09-15T09:15:00Z",
      updated_at: "2026-09-15T09:15:00Z",
    },
    {
      id: "u-4",
      full_name: "Roberto Peña (Comprador)",
      email: "compras@empresa.com",
      role: "comprador",
      phone: "+1 809-555-0199",
      is_active: false,
      created_at: "2026-09-20T11:00:00Z",
      updated_at: "2026-09-28T16:00:00Z",
    },
  ]);

  const roleBadgeMap: Record<UserRole, { label: string; variant: "default" | "secondary" | "warning" | "success" }> = {
    super_admin: { label: "Super Admin", variant: "default" },
    admin: { label: "Administrador", variant: "default" },
    almacenista: { label: "Almacén", variant: "warning" },
    comprador: { label: "Comprador", variant: "secondary" },
    vendedor: { label: "Ventas / POS", variant: "success" },
    auditor: { label: "Auditor", variant: "secondary" },
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    startTransition(async () => {
      const res = await inviteUserAction({
        email,
        fullName,
        role,
        phone: phone || undefined,
      });

      if (res?.error) {
        setFormError(res.error);
        toast.error(res.error);
      } else {
        toast.success(res?.message || "Invitación enviada exitosamente");
        // Agregar optimistamente a la lista local
        setUsers((prev) => [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            email,
            full_name: fullName,
            role,
            phone: phone || null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
        setEmail("");
        setFullName("");
        setPhone("");
        setIsInviteOpen(false);
      }
    });
  };

  const handleToggleStatus = (userId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    startTransition(async () => {
      const res = await toggleUserStatusAction(userId, nextStatus);
      if (res?.error) {
        toast.error(res.error);
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, is_active: nextStatus } : u))
        );
        toast.success(
          nextStatus ? "Usuario activado correctamente" : "Usuario suspendido correctamente"
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            Gestión de Usuarios y Roles (RBAC)
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Control privado de acceso por invitación. El autorregistro público está deshabilitado.
          </p>
        </div>

        <Button
          onClick={() => setIsInviteOpen(true)}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invitar Nuevo Usuario</span>
        </Button>
      </div>

      {/* Modal / Dialog de Invitación de Usuario */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                  Invitar Usuario al Sistema
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Nombre Completo
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej: Laura Peralta"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Correo Electrónico (Para recibir enlace de acceso)
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@empresa.com"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Rol del Sistema
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="flex h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <option value="vendedor">Ventas / POS</option>
                    <option value="almacenista">Encargado de Almacén</option>
                    <option value="comprador">Comprador</option>
                    <option value="admin">Administrador</option>
                    <option value="super_admin">Super Administrador</option>
                    <option value="auditor">Auditor (Solo Lectura)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Teléfono (Opcional)
                  </label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 809-000-0000"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsInviteOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700">
                  {isPending ? "Enviando Invitación..." : "Enviar Invitación"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Usuarios */}
      <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Usuarios Registrados</CardTitle>
          <CardDescription className="text-xs">
            Lista de personal con acceso autorizado y roles asignados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Rol</th>
                  <th className="py-3 px-4">Teléfono</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((user) => {
                  const badgeInfo = roleBadgeMap[user.role] || {
                    label: user.role,
                    variant: "secondary",
                  };
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-900/60 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 shrink-0">
                            {user.full_name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {user.full_name}
                            </div>
                            <div className="text-slate-500 text-[11px] flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {user.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {user.phone}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No registrado</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {user.is_active ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-rose-500 font-medium">
                            <XCircle className="w-4 h-4" />
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(user.id, user.is_active)}
                          className={
                            user.is_active
                              ? "text-rose-600 hover:text-rose-700 border-rose-200 dark:border-rose-900 text-[11px] h-7"
                              : "text-emerald-600 hover:text-emerald-700 border-emerald-200 dark:border-emerald-900 text-[11px] h-7"
                          }
                        >
                          {user.is_active ? "Suspender" : "Activar"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
