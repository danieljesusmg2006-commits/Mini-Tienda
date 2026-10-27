"use client";

import Link from "next/link";
import { CustomerUser } from "@/types/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Store, ShoppingCart, ShieldCheck, User, LogOut, Sparkles, ShoppingBag, Clock } from "lucide-react";

interface StoreHeaderProps {
  cartCount: number;
  cartTotal: number;
  customerUser: CustomerUser | null;
  purchasesCount?: number;
  onOpenCart: () => void;
  onOpenPurchases?: () => void;
  onOpenWelcome: () => void;
  onLogoutCustomer: () => void;
}

export function StoreHeader({
  cartCount,
  cartTotal,
  customerUser,
  purchasesCount = 0,
  onOpenCart,
  onOpenPurchases,
  onOpenWelcome,
  onLogoutCustomer,
}: StoreHeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-1.5 sm:gap-3 group shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Store className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                Mini Tienda
              </span>
              <Badge variant="default" className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider py-0 px-1 sm:px-2 bg-emerald-600 text-white hidden min-[360px]:inline-flex">
                Online
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:block">Catálogo oficial con entrega inmediata</p>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* User Access Status / Switcher */}
          {customerUser ? (
            <div className="flex items-center gap-1 sm:gap-2 pl-1.5 sm:pl-2.5 pr-1 sm:pr-1.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs h-8 sm:h-9">
              <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="font-semibold text-indigo-900 dark:text-indigo-200 truncate max-w-[50px] min-[380px]:max-w-[80px] sm:max-w-[120px] text-[10px] sm:text-xs">
                {customerUser.name}
              </span>
              <button
                type="button"
                onClick={onLogoutCustomer}
                className="text-slate-400 hover:text-rose-500 p-0.5 rounded-md transition-colors cursor-pointer"
                title="Cerrar sesión de cliente"
              >
                <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenWelcome}
              className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 transition-colors cursor-pointer font-medium shadow-2xs h-8 sm:h-9"
              title="Modo Invitado: Las compras y búsquedas se borrarán al cerrar la página. Inicia sesión para guardarlas permanentemente."
            >
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Invitado (Temporal)</span>
              <span className="sm:hidden">Invitado</span>
            </button>
          )}

          {/* Mis Compras Button */}
          {onOpenPurchases && (
            <button
              type="button"
              onClick={onOpenPurchases}
              className="relative inline-flex items-center justify-center gap-1 text-[10px] sm:text-xs text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer font-medium shadow-2xs h-8 sm:h-9"
              title="Ver mis compras realizadas"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="hidden md:inline">Mis Compras</span>
              {purchasesCount > 0 && (
                <span className="px-1 py-0.2 rounded-full text-[9px] sm:text-[10px] font-bold bg-indigo-600 text-white min-w-4 text-center">
                  {purchasesCount}
                </span>
              )}
            </button>
          )}

          {/* Theme Toggle (Sun in light mode, Moon in dark mode) */}
          <ThemeToggle />

          {/* Link to Admin Panel (Mobile Friendly) */}
          <Link href="/admin">
            <Button
              variant="outline"
              size="sm"
              className="inline-flex items-center justify-center gap-1 text-[10px] sm:text-xs text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700 shadow-2xs p-1.5 sm:px-2.5 sm:py-1.5 h-8 sm:h-9"
              title="Acceder al Panel Administrativo"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="hidden md:inline">Panel Admin</span>
            </Button>
          </Link>

          {/* Cart Button */}
          <button
            type="button"
            onClick={onOpenCart}
            className="relative flex items-center gap-1 sm:gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-2 sm:px-3.5 py-1 sm:py-2 rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer font-medium text-xs h-8 sm:h-9"
            aria-label={`Ver carrito de compras con ${cartCount} productos`}
          >
            <div className="relative">
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Carrito</span>
            <span className="font-bold border-l border-indigo-400/40 pl-1 sm:pl-2 text-[10px] sm:text-xs">
              ${cartTotal.toFixed(2)}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
