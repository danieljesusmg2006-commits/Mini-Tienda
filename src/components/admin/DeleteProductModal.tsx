"use client";

import { Product } from "@/types/store";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteProductModal({
  isOpen,
  product,
  onClose,
  onConfirm,
}: DeleteProductModalProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-rose-50/40 dark:bg-rose-950/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="delete-modal-title" className="text-sm font-bold text-slate-900 dark:text-white">
                Eliminar Producto
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Esta acción no se puede deshacer</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            ¿Está seguro de que desea eliminar permanentemente este producto del catálogo?
          </p>

          {/* Product Preview Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 border border-slate-300 dark:border-slate-600">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{product.name}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Categoría: <span className="font-medium text-slate-700 dark:text-slate-300">{product.category}</span>
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">•</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Stock: <strong className="text-slate-700 dark:text-slate-200">{product.stock}</strong> unids.
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onConfirm}
              className="text-xs gap-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Confirmar Eliminación
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
