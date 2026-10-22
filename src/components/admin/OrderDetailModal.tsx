"use client";

import { Order } from "@/types/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Receipt,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  Pencil,
  Printer,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (order: Order) => void;
}

export function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onEdit,
}: OrderDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    toast.success("ID copiado al portapapeles", {
      description: order.id,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "Entregada":
        return "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "Pendiente":
        return "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "Cancelada":
        return "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      default:
        return "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-all max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="order-detail-title" className="text-base font-bold text-slate-900 dark:text-white">
                  Información Completa de Venta
                </h2>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold uppercase tracking-wider py-0 px-2 ${getStatusBadge(
                    order.status
                  )}`}
                >
                  {order.status || "Completada"}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Registro detallado de transacción y productos
              </p>
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

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Order ID Callout */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                Identificador de la Compra (ID)
              </span>
              <p className="text-lg font-mono font-black text-indigo-950 dark:text-indigo-100 tracking-tight">
                {order.id}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-indigo-200 dark:border-slate-700 text-indigo-700 dark:text-indigo-300 shadow-2xs transition-colors cursor-pointer"
                title="Copiar ID de compra"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copiado" : "Copiar ID"}</span>
              </button>
            </div>
          </div>

          {/* Customer & Transaction Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Customer Details */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Datos del Comprador
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {order.customerName}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {order.email}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {order.phone}
                </p>
              </div>
            </div>

            {/* Delivery & Payment Details */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Entrega & Pago
              </span>
              <div>
                <p className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{order.address}</span>
                </p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2">
                  Método: <span className="font-normal text-slate-600 dark:text-slate-400">{order.paymentMethod}</span>
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(order.createdAt).toLocaleString("es-ES", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Purchased Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <h4 className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Productos en la Venta ({order.items.reduce((acc, i) => acc + i.quantity, 0)} unidades)
              </h4>
              <span className="text-slate-400 dark:text-slate-500">
                {order.items.length} {order.items.length === 1 ? "artículo distinto" : "artículos distintos"}
              </span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {order.items.map((item, index) => (
                <div
                  key={`${item.productId}-${index}`}
                  className="p-3.5 flex items-center justify-between gap-3 text-xs bg-white dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&auto=format&fit=crop&q=80";
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.quantity} x ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      ${(item.quantity * item.price).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Total Calculation Row */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ${order.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Envío:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">¡GRATIS!</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Total Pagado:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 text-lg font-extrabold">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/70 dark:bg-slate-800/50">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs gap-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Imprimir Venta</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs"
            >
              Cerrar
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(order);
              }}
              className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold shadow-xs"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Modificar Venta</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
