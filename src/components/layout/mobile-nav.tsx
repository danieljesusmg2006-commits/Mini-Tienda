"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Boxes, Receipt, Menu, X } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "./sidebar";
import type { UserRole } from "@/types/database.types";

interface MobileNavProps {
  userRole?: UserRole;
}

export function MobileNav({ userRole }: MobileNavProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Drawer Overlay for Full Mobile Menu */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-[80vw] bg-slate-900 z-50 h-full shadow-2xl">
            <div className="absolute top-4 right-4">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
                aria-label="Cerrar menú"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto" onClick={() => setDrawerOpen(false)}>
              <Sidebar userRole={userRole} />
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar for Quick Actions on Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 z-40 shadow-lg">
        <Link
          href="/dashboard"
          className={cn(
            "flex flex-col items-center justify-center gap-1 w-16 py-1 rounded-lg text-[11px] font-medium transition-colors",
            pathname === "/dashboard"
              ? "text-indigo-600 font-semibold"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
          )}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Inicio</span>
        </Link>

        <Link
          href="/inventario"
          className={cn(
            "flex flex-col items-center justify-center gap-1 w-16 py-1 rounded-lg text-[11px] font-medium transition-colors",
            pathname.startsWith("/inventario")
              ? "text-indigo-600 font-semibold"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
          )}
        >
          <Boxes className="w-5 h-5" />
          <span>Stock</span>
        </Link>

        <Link
          href="/ventas"
          className={cn(
            "flex flex-col items-center justify-center gap-1 w-16 py-1 rounded-lg text-[11px] font-medium transition-colors",
            pathname.startsWith("/ventas")
              ? "text-indigo-600 font-semibold"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
          )}
        >
          <Receipt className="w-5 h-5" />
          <span>POS</span>
        </Link>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center gap-1 w-16 py-1 rounded-lg text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 transition-colors"
        >
          <Menu className="w-5 h-5" />
          <span>Menú</span>
        </button>
      </nav>
    </>
  );
}
