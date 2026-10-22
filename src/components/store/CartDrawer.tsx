"use client";

import { CartItem } from "@/types/store";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  PackageOpen,
} from "lucide-react";
import { toast } from "sonner";

interface CartDrawerProps {
  isOpen: boolean;
  cart: CartItem[];
  cartTotal: number;
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => { success: boolean; message?: string };
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

export function CartDrawer({
  isOpen,
  cart,
  cartTotal,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const handleQuantityChange = (productId: string, newQty: number) => {
    const res = onUpdateQuantity(productId, newQty);
    if (!res.success && res.message) {
      toast.warning("Límite de stock", {
        description: res.message,
      });
    }
  };

  const handleEmptyCart = () => {
    if (window.confirm("¿Desea vaciar todos los productos del carrito?")) {
      onClearCart();
      toast.info("Carrito vaciado");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <aside
        className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300 transition-colors"
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Carrito de Compras</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {cart.length === 0
                  ? "Sin artículos"
                  : `${cart.reduce((a, b) => a + b.quantity, 0)} productos añadidos`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={handleEmptyCart}
                className="text-xs text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Vaciar carrito"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-500 dark:text-indigo-400 mb-2">
                <PackageOpen className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Tu carrito está vacío</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                Aún no has agregado ningún producto a tu orden. Revisa nuestro catálogo y añade tus artículos favoritos.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="mt-3 text-xs border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
              >
                Explorar Catálogo
              </Button>
            </div>
          ) : (
            cart.map((item) => {
              const maxStock = item.product.stock;
              const isMax = item.quantity >= maxStock;

              return (
                <div
                  key={item.product.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs flex gap-3 items-center transition-all"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&auto=format&fit=crop&q=80";
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.product.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-slate-400 hover:text-rose-500 p-0.5 transition-colors cursor-pointer shrink-0"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      ${item.product.price.toFixed(2)} c/u
                    </p>

                    {/* Quantity controls & item subtotal */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-30"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-900 dark:text-white select-none">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                          disabled={isMax}
                          className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Aumentar cantidad"
                          title={isMax ? "Stock máximo alcanzado" : "Añadir otra unidad"}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Calculations & Checkout CTA */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3.5">
            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} unidades):</span>
                <span className="font-semibold text-slate-900 dark:text-white">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Costo de Envío:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">¡GRATIS!</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Total a pagar:</span>
                <span className="text-indigo-600 dark:text-indigo-400 text-base">${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <Button
              size="lg"
              onClick={onProceedToCheckout}
              className="w-full text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-md shadow-indigo-500/25 gap-2 cursor-pointer h-11"
            >
              <span>Proceder al Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Compra 100% segura • Checkout integrado</span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
