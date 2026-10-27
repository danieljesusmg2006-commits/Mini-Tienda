"use client";

import { Product } from "@/types/store";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onAddToCart: (product: Product) => { success: boolean; message: string };
}

export function ProductCard({
  product,
  quantityInCart,
  onAddToCart,
}: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const isOutOfStock = product.stock <= 0;
  const isMaxInCart = quantityInCart >= product.stock && !isOutOfStock;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAdd = () => {
    if (isOutOfStock || isMaxInCart) return;

    setIsAdding(true);
    const res = onAddToCart(product);
    if (res.success) {
      toast.success("Producto agregado", {
        description: res.message,
      });
    } else {
      toast.error("No se pudo agregar", {
        description: res.message,
      });
    }
    setTimeout(() => setIsAdding(false), 300);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-lg dark:hover:shadow-slate-900/60 transition-all duration-300 flex flex-col group">
      {/* Product Image */}
      <div className="aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden relative border-b border-slate-100 dark:border-slate-800 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&auto=format&fit=crop&q=80";
          }}
        />

        {/* Category Pill */}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-200 shadow-xs border border-slate-200/60 dark:border-slate-700 max-w-[95px] sm:max-w-none truncate">
          {product.category}
        </span>

        {/* In-cart indicator badge */}
        {quantityInCart > 0 && (
          <span className="absolute top-2 right-2 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white shadow-xs flex items-center gap-1">
            <Check className="w-3 h-3" />
            <span>{quantityInCart}</span>
            <span className="hidden sm:inline">en carrito</span>
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between gap-2.5 sm:gap-3">
        <div className="space-y-1 sm:space-y-1.5">
          <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug min-h-[2.2rem] sm:min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Stock Badges */}
          <div>
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 sm:px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                Agotado
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1.5 sm:px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>¡Últimas {product.stock}!</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 sm:px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{product.stock} disp.</span>
              </span>
            )}
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between gap-2">
          <div>
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 block font-medium">Precio</span>
            <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <Button
            size="sm"
            onClick={handleAdd}
            disabled={isOutOfStock || isMaxInCart || isAdding}
            className={`w-full min-[380px]:w-auto h-8 sm:h-9 text-[11px] sm:text-xs px-2.5 sm:px-3 gap-1.5 font-medium transition-all cursor-pointer ${
              isOutOfStock
                ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                : isMaxInCart
                ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xs"
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {isOutOfStock
                ? "Agotado"
                : isMaxInCart
                ? "Límite"
                : "Agregar"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
