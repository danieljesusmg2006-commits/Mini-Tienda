"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Boxes,
  ArrowLeftRight,
  Warehouse,
  ShoppingCart,
  Receipt,
  Users,
  ShieldCheck,
  BarChart3,
  PackageCheck,
} from "lucide-react";
import type { UserRole } from "@/types/database.types";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Inventario",
    href: "/inventario",
    icon: Boxes,
  },
  {
    title: "Movimientos / Kardex",
    href: "/movimientos",
    icon: ArrowLeftRight,
  },
  {
    title: "Almacenes",
    href: "/almacenes",
    icon: Warehouse,
  },
  {
    title: "Compras",
    href: "/compras",
    icon: ShoppingCart,
  },
  {
    title: "Ventas / POS",
    href: "/ventas",
    icon: Receipt,
  },
  {
    title: "Clientes",
    href: "/clientes",
    icon: Users,
  },
  {
    title: "Usuarios & Permisos",
    href: "/usuarios",
    icon: ShieldCheck,
    roles: ["super_admin", "admin"],
  },
  {
    title: "Reportes",
    href: "/reportes",
    icon: BarChart3,
  },
];

interface SidebarProps {
  userRole?: UserRole;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-100 border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
          <PackageCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-semibold text-sm tracking-wide text-white">ERP Administrativo</h1>
          <p className="text-[11px] text-slate-400">Sistema Privado</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          // Filtrar por rol si está especificado
          if (item.roles && userRole && !item.roles.includes(userRole)) {
            return null;
          }

          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              )}
            >
              <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "text-slate-400")} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
        v1.0.0 • Supabase RLS Protected
      </div>
    </aside>
  );
}
