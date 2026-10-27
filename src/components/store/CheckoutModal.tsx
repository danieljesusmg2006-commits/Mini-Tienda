"use client";

import { useState, useEffect } from "react";
import { CartItem, Order, CustomerUser } from "@/types/store";
import { CheckoutInput } from "@/lib/store/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CreditCard,
  Banknote,
  Send,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  ShoppingBag,
  Printer,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

interface CheckoutModalProps {
  isOpen: boolean;
  cart: CartItem[];
  cartTotal: number;
  customerUser?: CustomerUser | null;
  onClose: () => void;
  onConfirmCheckout: (input: CheckoutInput) => {
    success: boolean;
    order?: Order;
    error?: string;
  };
  onOpenChat?: (order: Order) => void;
}

const PAYMENT_METHODS = [
  {
    id: "card",
    title: "Tarjeta de Crédito / Débito",
    desc: "Visa, Mastercard, Amex (Pago simulado seguro)",
    icon: CreditCard,
  },
  {
    id: "cod",
    title: "Efectivo contra Entrega",
    desc: "Paga al recibir tus productos en tu domicilio",
    icon: Banknote,
  },
  {
    id: "transfer",
    title: "Transferencia Bancaria / Pago Móvil",
    desc: "Envía el comprobante digital tras ordenar",
    icon: Send,
  },
];

export function CheckoutModal({
  isOpen,
  cart,
  cartTotal,
  customerUser,
  onClose,
  onConfirmCheckout,
  onOpenChat,
}: CheckoutModalProps) {
  // Form state
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");

  useEffect(() => {
    if (customerUser) {
      if (customerUser.name) setCustomerName(customerUser.name);
      if (customerUser.email) setEmail(customerUser.email);
      if (customerUser.phone) setPhone(customerUser.phone);
      if (customerUser.address) setAddress(customerUser.address);
    }
  }, [customerUser, isOpen]);

  // Flow state
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage("Por favor ingrese su nombre completo.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Por favor ingrese un correo electrónico válido.");
      return;
    }

    if (!phone.trim()) {
      setErrorMessage("Por favor ingrese un número de teléfono de contacto.");
      return;
    }

    if (!address.trim()) {
      setErrorMessage("Por favor ingrese la dirección de entrega.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const selectedMethodObj = PAYMENT_METHODS.find((m) => m.id === paymentMethod);
      const res = onConfirmCheckout({
        customerName,
        email,
        phone,
        address,
        paymentMethod: selectedMethodObj ? selectedMethodObj.title : paymentMethod,
      });

      setIsSubmitting(false);

      if (res.success && res.order) {
        setCompletedOrder(res.order);
        toast.success("¡Compra completada con éxito!", {
          description: `Orden ${res.order.id} generada y stock actualizado.`,
        });
      } else {
        setErrorMessage(res.error || "Ocurrió un error al procesar la compra.");
      }
    }, 400);
  };

  const handleFinish = () => {
    setCompletedOrder(null);
    setCustomerName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setErrorMessage(null);
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[94vh] transition-colors"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-modal-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 id="checkout-modal-title" className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {completedOrder ? "Comprobante de Compra" : "Finalizar Pedido (Checkout)"}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                {completedOrder
                  ? "Transacción procesada correctamente"
                  : "Complete sus datos de entrega y pago"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={completedOrder ? handleFinish : onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        {completedOrder ? (
          /* Receipt Screen */
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
            {/* Success Hero */}
            <div className="text-center py-4 space-y-2 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 p-4">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-extrabold text-emerald-900 dark:text-emerald-200">
                ¡Gracias por su compra, {completedOrder.customerName}!
              </h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                Su orden ha sido registrada. El stock de los productos ha sido descontado en tiempo real.
              </p>
              <div className="inline-block mt-2 px-3 py-1 bg-white dark:bg-slate-900 rounded-full border border-emerald-300 dark:border-emerald-700 text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300">
                ID de Orden: {completedOrder.id}
              </div>
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Datos del Cliente
                </span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{completedOrder.customerName}</p>
                <p className="text-slate-600 dark:text-slate-400">{completedOrder.email}</p>
                <p className="text-slate-600 dark:text-slate-400">{completedOrder.phone}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Envío & Pago
                </span>
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>Dirección:</strong> {completedOrder.address}
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>Método de Pago:</strong> {completedOrder.paymentMethod}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[10px]">
                  Fecha: {new Date(completedOrder.createdAt).toLocaleString("es-ES")}
                </p>
              </div>
            </div>

            {/* Purchased Items List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Artículos Comprados
              </h4>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                {completedOrder.items.map((item) => (
                  <div key={item.productId} className="p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">{item.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.quantity} x ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white shrink-0">
                      ${(item.quantity * item.price).toFixed(2)}
                    </span>
                  </div>
                ))}

                {/* Total Row */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white">
                  <span>Total Pagado:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 text-base">
                    ${completedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Seller CTA Banner */}
            {onOpenChat && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50 to-emerald-50/50 dark:from-indigo-950/40 dark:to-emerald-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">¿Tienes dudas o requerimientos sobre tu pedido?</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Chatea en vivo directamente con el vendedor sin salir de la página.</p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const orderToChat = completedOrder;
                    onClose();
                    onOpenChat(orderToChat);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold gap-1.5 shadow-sm shrink-0 cursor-pointer w-full sm:w-auto"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Comunicarse con el vendedor</span>
                </Button>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="text-xs gap-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir Recibo
              </Button>

              <Button
                size="sm"
                onClick={handleFinish}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium shadow-xs"
              >
                Seguir Comprando
              </Button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Customer Information */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                1. Datos de Contacto y Entrega
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Nombre Completo *</label>
                  <Input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej. Carlos Mendoza"
                    required
                    className="text-xs dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Correo Electrónico *</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carlos@correo.com"
                    required
                    className="text-xs dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Teléfono / Móvil *</label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 809-555-0123"
                    required
                    className="text-xs dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Dirección de Entrega *</label>
                  <Input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Calle Principal #42, Ciudad"
                    required
                    className="text-xs dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                2. Método de Pago
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = paymentMethod === method.id;

                  return (
                    <label
                      key={method.id}
                      className={`p-3 rounded-xl border-2 flex flex-col justify-between gap-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={`w-5 h-5 ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={isSelected}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="accent-indigo-600"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {method.title}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                          {method.desc}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Order Review Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Artículos en el pedido:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {cart.reduce((a, b) => a + b.quantity, 0)} unidades
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Envío:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">GRATIS</span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Total a confirmar:</span>
                <span className="text-indigo-600 dark:text-indigo-400 text-base font-extrabold">
                  ${cartTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-xs bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || cart.length === 0}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold px-4 h-9 shadow-sm"
              >
                {isSubmitting ? "Procesando..." : `Confirmar Compra ($${cartTotal.toFixed(2)})`}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
