"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Store, Key, LogOut, ExternalLink, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface AdminHeaderProps {
  onOpenPasswordModal: () => void;
  onLogout: () => void;
}

export function AdminHeader({ onOpenPasswordModal, onLogout }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogoutClick = () => {
    onLogout();
    toast.info("Sesión cerrada", {
      description: "Has salido del panel administrativo.",
    });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Area identifier */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                Mini Tienda Digital
              </h1>
              <Badge variant="default" className="text-[10px] uppercase font-bold tracking-wider py-0 px-2 bg-indigo-600 text-white">
                Admin
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Panel de Control & Gestión de Productos</p>
          </div>
        </div>

        {/* Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle (Sun in light mode, Moon in dark mode) */}
          <ThemeToggle />

          {/* Link to public store */}
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 shadow-2xs"
            title="Ir a la Tienda Pública"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Tienda Pública</span>
          </Link>

          {/* User Badge */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-100">Administrador</span>
          </div>

          {/* Change Password Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenPasswordModal}
            className="gap-1.5 text-xs text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-2xs"
            title="Cambiar contraseña de administrador"
          >
            <Key className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Cambiar Contraseña</span>
          </Button>

          {/* Logout Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogoutClick}
            className="gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 bg-white dark:bg-slate-800 border-rose-200 dark:border-rose-900/60 shadow-2xs"
            title="Cerrar sesión administrativa"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
