"use client";

import { useEffect, useState } from "react";
import { Order, OrderItem, OrderStatus, Product } from "@/types/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  X,
  Plus,
  Trash2,
  Receipt,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  CheckCircle2,
  Package,
} from "lucide-react";
import { toast } from "sonner";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    customerName: string;
    email: string;
    phone: string;
    address: string;
    paymentMethod: string;
    status: OrderStatus;
    items: OrderItem[];
    subtotal: number;
    total: number;
  }) => void;
  initialOrder: Order | null;
  availableProducts: Product[];
}

const PAYMENT_OPTIONS = [
  "Efectivo contra entrega",
  "Tarjeta de Crédito / Débito",
  "Transferencia Bancaria",
];

const STATUS_OPTIONS: OrderStatus[] = [
  "Completada",
  "Pendiente",
  "Entregada",
  "Cancelada",
];

export function OrderModal({
  isOpen,
  onClose,
  onSave,
  initialOrder,
  availableProducts,
}: OrderModalProps) {
  const isEditing = !!initialOrder;

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_OPTIONS[0]);
  const [status, setStatus] = useState<OrderStatus>("Completada");
  const [items, setItems] = useState<OrderItem[]>([]);

  // Product addition state
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);

  // Sync state when modal opens or initialOrder changes
  useEffect(() => {
    if (initialOrder) {
      setCustomerName(initialOrder.customerName || "");
      setEmail(initialOrder.email || "");
      setPhone(initialOrder.phone || "");
      setAddress(initialOrder.address || "");
      setPaymentMethod(initialOrder.paymentMethod || PAYMENT_OPTIONS[0]);
      setStatus(initialOrder.status || "Completada");
      setItems(initialOrder.items || []);
    } else {
      setCustomerName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setPaymentMethod(PAYMENT_OPTIONS[0]);
      setStatus("Completada");
      // Add first available product if any
      if (availableProducts.length > 0) {
        const first = availableProducts[0];
        setItems([
          {
            productId: first.id,
            name: first.name,
            price: first.price,
            quantity: 1,
            imageUrl: first.imageUrl,
          },
        ]);
      } else {
        setItems([]);
      }
    }
    setFormError(null);
    if (availableProducts.length > 0) {
      setSelectedProductId(availableProducts[0].id);
    }
  }, [initialOrder, isOpen, availableProducts]);

  if (!isOpen) return null;

  // Real-time calculation
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal;

  // Add a product item
  const handleAddItem = () => {
    if (!selectedProductId) return;
    const prod = availableProducts.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const existingIndex = items.findIndex((i) => i.productId === prod.id);
    if (existingIndex !== -1) {
      const updated = [...items];
      updated[existingIndex].quantity += selectedQuantity;
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          productId: prod.id,
          name: prod.name,
          price: prod.price,
          quantity: Math.max(1, selectedQuantity),
          imageUrl: prod.imageUrl,
        },
      ]);
    }
    setSelectedQuantity(1);
    toast.success("Producto agregado a la venta", {
      description: `${prod.name} (x${selectedQuantity})`,
    });
  };

  const handleUpdateItemQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setItems(items.map((i) => (i.productId === productId ? { ...i, quantity: newQty } : i)));
  };

  const handleRemoveItem = (productId: string) => {
    setItems(items.filter((i) => i.productId !== productId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!customerName.trim()) {
      setFormError("Por favor ingrese el nombre del cliente.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setFormError("Por favor ingrese un correo válido.");
      return;
    }
    if (!phone.trim()) {
      setFormError("Por favor ingrese un teléfono de contacto.");
      return;
    }
    if (!address.trim()) {
      setFormError("Por favor ingrese la dirección de entrega.");
      return;
    }
    if (items.length === 0) {
      setFormError("Debe incluir al menos un producto en la venta.");
      return;
    }

    onSave({
      customerName: customerName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      paymentMethod,
      status,
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      total: Math.round(total * 100) / 100,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-all max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 id="order-modal-title" className="text-sm font-bold text-slate-900 dark:text-white">
                {isEditing ? `Modificar Venta (${initialOrder.id})` : "Registrar Nueva Venta"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing
                  ? "Actualice los datos del cliente, productos o estado de la compra"
                  : "Complete la información y los productos para registrar la transacción"}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
              {formError}
            </div>
          )}

          {/* Section 1: Customer Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              1. Datos del Cliente
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Nombre Completo *
                </label>
                <Input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej. Roberto Sánchez"
                  required
                  className="text-xs dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Correo Electrónico *
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="roberto@correo.com"
                  required
                  className="text-xs dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Teléfono / Móvil *
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 809-555-0199"
                  required
                  className="text-xs dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Dirección de Entrega *
                </label>
                <Input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle 5, Edificio Los Robles"
                  required
                  className="text-xs dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Order Settings (Status & Payment) */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              2. Estado & Método de Pago
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Estado de la Venta
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Método de Pago
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {PAYMENT_OPTIONS.map((pm) => (
                    <option key={pm} value={pm}>
                      {pm}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Products in Sale */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              3. Productos de la Venta
            </h3>

            {/* Add Product Line Controls */}
            {availableProducts.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="flex-1 h-9 px-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                >
                  {availableProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ${p.price.toFixed(2)} (Stock: {p.stock})
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Cant:</span>
                    <Input
                      type="number"
                      min={1}
                      max={99}
                      value={selectedQuantity}
                      onChange={(e) => setSelectedQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 h-9 text-xs dark:bg-slate-900 dark:border-slate-600 dark:text-white text-center"
                    />
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddItem}
                    className="h-9 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Items List */}
            {items.length === 0 ? (
              <p className="text-xs text-rose-500 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                No hay productos en esta venta. Seleccione al menos un artículo arriba.
              </p>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="p-3 flex items-center justify-between gap-3 text-xs bg-white dark:bg-slate-900/90"
                  >
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
                        <p className="font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-[280px]">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          ${item.price.toFixed(2)} c/u
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800">
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQuantity(item.productId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-900 dark:text-white select-none">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQuantity(item.productId, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <span className="w-16 text-right font-bold text-slate-900 dark:text-white">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.productId)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors cursor-pointer"
                        title="Quitar producto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Subtotal & Total Row */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Total de la Venta ({items.reduce((a, b) => a + b.quantity, 0)} unidades):</span>
                  <span className="text-indigo-600 dark:text-indigo-400 text-base font-extrabold">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
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
              type="submit"
              size="sm"
              className="text-xs bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold shadow-xs"
            >
              {isEditing ? "Guardar Cambios de Venta" : "Registrar Venta"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
