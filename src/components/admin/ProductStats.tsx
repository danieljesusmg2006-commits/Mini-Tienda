"use client";

import { Product } from "@/types/store";
import { Package, DollarSign, AlertTriangle, Layers } from "lucide-react";

interface ProductStatsProps {
  products: Product[];
}

export function ProductStats({ products }: ProductStatsProps) {
  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalInventoryValue = products.reduce(
    (acc, p) => acc + (p.price || 0) * (p.stock || 0),
    0
  );
  const lowStockCount = products.filter((p) => (p.stock || 0) <= 5).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {/* Total Products */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 transition-colors">
        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
          <Package className="w-4 h-4 sm:w-6 sm:h-6" />
        </div>
        <div>
          <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Productos
          </p>
          <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
            {totalProducts}
          </p>
        </div>
      </div>

      {/* Total Stock Units */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 transition-colors">
        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
          <Layers className="w-4 h-4 sm:w-6 sm:h-6" />
        </div>
        <div>
          <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Unidades Stock
          </p>
          <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
            {totalStock} <span className="text-[10px] sm:text-xs font-normal text-slate-500 dark:text-slate-400">unids.</span>
          </p>
        </div>
      </div>

      {/* Inventory Value */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 transition-colors">
        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
          <DollarSign className="w-4 h-4 sm:w-6 sm:h-6" />
        </div>
        <div>
          <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Valor Inventario
          </p>
          <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5 truncate">
            ${totalInventoryValue.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 transition-colors">
        <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border ${
          lowStockCount > 0
            ? "bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400"
            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"
        }`}>
          <AlertTriangle className="w-4 h-4 sm:w-6 sm:h-6" />
        </div>
        <div>
          <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Stock Bajo / Agotado
          </p>
          <div className="flex items-baseline gap-1.5 sm:gap-2 mt-0.5">
            <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {lowStockCount}
            </p>
            {lowStockCount > 0 && (
              <span className="text-[9px] sm:text-[11px] font-semibold text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                ≤ 5 unids
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
