"use client";

import { Order, CustomerUser } from "@/types/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  ShoppingBag,
  Calendar,
  Package,
  CreditCard,
  AlertTriangle,
  ShieldCheck,
  User,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CustomerOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  customerUser: CustomerUser | null;
  onOpenLogin: () => void;
}

export function CustomerOrdersModal({
  isOpen,
  onClose,
  orders,
  customerUser,
  onOpenLogin,
}: CustomerOrdersModalProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("ID de compra copiado", { description: id });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isGuest = !customerUser;

  const formatDate = (isoString?: string) => {
    if (!isoString) return "-";
    try {
      return new Date(isoString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] transition-colors"
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-orders-title"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="customer-orders-title" className="text-lg font-bold text-slate-900 dark:text-white">
                  Mis Compras Realizadas
                </h3>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-semibold py-0 px-2 ${
                    isGuest
                      ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                      : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                  }`}
                >
                  {isGuest ? "Modo Invitado" : "Cuenta Guardada"}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isGuest
                  ? "Compras de la sesión actual de navegación"
                  : `Historial guardado permanentemente para ${customerUser?.name}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persistence Notice Banner */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          {isGuest ? (
            <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">⚠️ Modo Invitado Temporal</p>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                    Al cerrar esta pestaña o tu navegador, todas tus compras y búsquedas se <strong>eliminarán automáticamente</strong>. Si inicias sesión con una cuenta, esto <strong>no pasará</strong> y tus compras se conservarán para siempre.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0 shadow-xs"
              >
                <span>Guardar con Cuenta</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200 flex items-center gap-2.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-800 dark:text-emerald-200">
                  Historial Permanente Activo
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                  Tus compras y búsquedas están vinculadas a <strong>{customerUser.email}</strong> y <strong>no se eliminarán</strong> al cerrar la página.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Orders Content List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {orders.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Package className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Aún no has realizado compras
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {isGuest
                  ? "Agrega productos a tu carrito y finaliza tu pedido. Recuerda que como invitado tus compras solo son visibles mientras mantengas esta página abierta."
                  : "Explora nuestro catálogo y realiza tu primera compra. Quedará registrada para siempre en tu cuenta."}
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-indigo-300 dark:hover:border-indigo-900 transition-all space-y-3"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {order.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyId(order.id)}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      title="Copiar ID de compra"
                    >
                      {copiedId === order.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                    >
                      {order.status || "Completada"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        </div>
                        <div className="truncate">
                          <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Cantidad: {item.quantity} x ${item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white shrink-0">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bottom Summary */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{order.paymentMethod}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[11px] text-slate-400">Total pagado:</span>
                    <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {isGuest
              ? "🔒 Para conservar este ticket permanentemente, inicia sesión."
              : "🔒 Compras guardadas en la base de datos de tu cuenta."}
          </p>
          <Button
            size="sm"
            onClick={onClose}
            className="text-xs bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
