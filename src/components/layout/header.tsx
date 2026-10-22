"use client";

import { logoutAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Warehouse, Menu } from "lucide-react";
import type { Profile } from "@/types/database.types";
import { useTransition } from "react";

interface HeaderProps {
  profile: Profile | null;
  onOpenMobileMenu?: () => void;
}

export function Header({ profile, onOpenMobileMenu }: HeaderProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  const roleLabels: Record<string, string> = {
    super_admin: "Super Admin",
    admin: "Administrador",
    almacenista: "Almacén",
    comprador: "Comprador",
    vendedor: "Ventas / POS",
    auditor: "Auditor",
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onOpenMobileMenu}
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}

        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60">
          <Warehouse className="w-4 h-4 text-indigo-600" />
          <span className="font-medium text-slate-800 dark:text-slate-200">Almacén:</span>
          <span>Principal / Matriz</span>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {profile ? (
          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {profile.full_name}
              </span>
              <span className="text-[11px] text-slate-500">
                {profile.email}
              </span>
            </div>
            <Badge variant="default" className="text-[11px]">
              {roleLabels[profile.role] || profile.role}
            </Badge>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
            <User className="w-4 h-4 text-slate-500" />
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={isPending}
          className="gap-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-rose-200 dark:border-rose-900/40"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isPending ? "Saliendo..." : "Cerrar Sesión"}</span>
        </Button>
      </div>
    </header>
  );
}
