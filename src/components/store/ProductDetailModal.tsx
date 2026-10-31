"use client";

import { useState, useEffect } from "react";
import { Product, CustomerUser } from "@/types/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  ShoppingCart,
  Check,
  Package,
  Layers,
  Sparkles,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
  FileText,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  quantityInCart: number;
  customerUser?: CustomerUser | null;
  onAddToCart: (product: Product, quantity?: number) => { success: boolean; message: string };
  onOpenChatAboutProduct?: (product: Product) => void;
  onOpenLogin?: () => void;
}

export function ProductDetailModal({
  isOpen,
  onClose,
  product,
  quantityInCart,
  customerUser,
  onAddToCart,
  onOpenChatAboutProduct,
  onOpenLogin,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Reset quantity when modal opens or product changes
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [isOpen, product?.id]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const isOutOfStock = product.stock <= 0;
  const availableToAdd = Math.max(0, product.stock - quantityInCart);
  const isMaxInCart = availableToAdd <= 0 && !isOutOfStock;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleIncrement = () => {
    if (quantity < availableToAdd) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleContactSeller = () => {
    if (!customerUser) {
      toast.error("Inicio de sesión requerido", {
        description: "Debes iniciar sesión para comunicarte con el vendedor.",
        action: {
          label: "Iniciar sesión",
          onClick: () => onOpenLogin?.(),
        },
      });
      onOpenLogin?.();
      return;
    }
    if (product) {
      onOpenChatAboutProduct?.(product);
    }
  };

  const handleAdd = () => {
    if (isOutOfStock || isMaxInCart) return;

    setIsAdding(true);
    let allSuccess = true;
    let lastMsg = "";

    // Add selected quantity
    for (let i = 0; i < quantity; i++) {
      const res = onAddToCart(product);
      if (!res.success) {
        allSuccess = false;
        lastMsg = res.message;
        break;
      }
      lastMsg = res.message;
    }

    if (allSuccess) {
      toast.success(
        quantity > 1
          ? `${quantity} unidades agregadas al carrito`
          : "Producto agregado al carrito",
        { description: product.name }
      );
      setQuantity(1);
    } else {
      toast.error("Aviso", { description: lastMsg });
    }

    setTimeout(() => setIsAdding(false), 300);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {product.category}
            </span>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              Ref: #{product.id}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two column on desktop, stacked on mobile */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Left: Product Image */}
          <div className="space-y-3">
            <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden relative border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&auto=format&fit=crop&q=80";
                }}
              />

              {/* In cart badge */}
              {quantityInCart > 0 && (
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-md flex items-center gap-1.5 backdrop-blur-md">
                  <Check className="w-3.5 h-3.5" />
                  <span>{quantityInCart} en tu carrito</span>
                </span>
              )}
            </div>

            {/* Badges strip under image */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Truck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-[11px] font-medium leading-tight">Envío rápido disponible</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="text-[11px] font-medium leading-tight">Garantía oficial de tienda</span>
              </div>
            </div>
          </div>

          {/* Right: Product Info & Description */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-3.5">
              <div>
                <h2
                  id="product-detail-title"
                  className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-snug tracking-tight"
                >
                  {product.name}
                </h2>

                {/* Stock status indicator */}
                <div className="mt-2 flex items-center gap-2">
                  {isOutOfStock ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      Agotado por el momento
                    </span>
                  ) : isLowStock ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-900">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      ¡Solo quedan {product.stock} unidades en stock!
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Stock disponible ({product.stock} unidades)
                    </span>
                  )}
                </div>
              </div>

              {/* Price Callout */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 flex items-baseline gap-2">
                <span className="text-xs text-slate-400 font-medium">Precio especial:</span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400">USD</span>
              </div>

              {/* Description Section */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Descripción del Producto</span>
                  </div>
                  {product.description && product.description.trim() ? (
                    <button
                      type="button"
                      onClick={handleContactSeller}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Consultar</span>
                    </button>
                  ) : null}
                </div>

                <div className="bg-slate-50/60 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line max-h-56 overflow-y-auto">
                  {product.description && product.description.trim() ? (
                    <div className="space-y-3">
                      <p>{product.description}</p>
                      <div className="pt-2.5 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">¿Tienes dudas o requerimientos sobre este producto?</span>
                        <button
                          type="button"
                          onClick={handleContactSeller}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Preguntar al vendedor</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 py-1">
                      <p className="text-slate-400 dark:text-slate-500 italic">
                        Este producto no tiene descripción, comunícate con el vendedor si deseas más información o especificaciones.
                      </p>
                      <button
                        type="button"
                        onClick={handleContactSeller}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer shadow-md shadow-indigo-500/20"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Comunicarse con el vendedor (Admin)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions: Quantity + Add to Cart */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              {!isOutOfStock && !isMaxInCart && (
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-medium">Cantidad a agregar:</span>
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-40 cursor-pointer"
                      aria-label="Reducir cantidad"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-bold text-slate-900 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={handleIncrement}
                      disabled={quantity >= availableToAdd}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-40 cursor-pointer"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Cart button */}
              <Button
                size="lg"
                onClick={handleAdd}
                disabled={isOutOfStock || isMaxInCart || isAdding}
                className={`w-full h-11 text-sm font-bold gap-2 rounded-xl transition-all shadow-md cursor-pointer ${
                  isOutOfStock
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                    : isMaxInCart
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-indigo-500/20"
                }`}
              >
                <ShoppingCart className="w-4 h-4 shrink-0" />
                <span>
                  {isOutOfStock
                    ? "Agotado"
                    : isMaxInCart
                    ? "Alcanzaste el stock disponible en tu carrito"
                    : quantity > 1
                    ? `Agregar ${quantity} al Carrito • $${(product.price * quantity).toFixed(2)}`
                    : `Agregar al Carrito • $${product.price.toFixed(2)}`}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
