"use client";

import { useState, useEffect, useTransition } from "react";
import {
  getSalesAction,
  processSaleAction,
  cancelSaleAction,
} from "@/actions/sale.actions";
import { getCustomersAction } from "@/actions/customer.actions";
import { getProductsAction } from "@/actions/product.actions";
import { getWarehousesAction } from "@/actions/warehouse.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Receipt,
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  DollarSign,
  Printer,
  CheckCircle2,
  X,
  Barcode as BarcodeIcon,
  Tag,
  Clock,
  Ban,
  ArrowRight,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import type {
  SaleWithDetails,
  Customer,
  ProductWithStock,
  Warehouse,
  PaymentMethod,
} from "@/types/database.types";

export default function VentasPage() {
  const [activeTab, setActiveTab] = useState<"pos" | "history">("pos");
  const [sales, setSales] = useState<SaleWithDetails[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  // Carrito POS
  const [cart, setCart] = useState<
    { product: ProductWithStock; quantity: number }[]
  >([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");

  // Modal de Cobro
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("EFECTIVO");
  const [amountPaid, setAmountPaid] = useState<number | string>("");
  const [discountAmount, setDiscountAmount] = useState<number | string>(0);
  const [saleNotes, setSaleNotes] = useState("");

  // Modal de Ticket Térmico / Recibo
  const [receiptSale, setReceiptSale] = useState<SaleWithDetails | null>(null);

  const [isPending, startTransition] = useTransition();

  const loadData = () => {
    startTransition(async () => {
      const [salesData, custs, prods, whs] = await Promise.all([
        getSalesAction(),
        getCustomersAction(),
        getProductsAction(),
        getWarehousesAction(),
      ]);
      setSales(salesData);
      setCustomers(custs);
      setProducts(prods);
      setWarehouses(whs.data);

      if (custs.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(custs[0].id);
      }
      if (whs.data.length > 0 && !selectedWarehouseId) {
        setSelectedWarehouseId(whs.data[0].id);
      }
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Agregar al carrito
  const addToCart = (product: ProductWithStock) => {
    if (product.total_stock <= 0) {
      toast.error(`"${product.name}" está agotado`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.total_stock) {
          toast.warning(`Existencia máxima alcanzada (${product.total_stock} und)`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            if (nextQty > item.product.total_stock) {
              toast.warning(`Stock máximo: ${item.product.total_stock}`);
              return item;
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter(Boolean) as { product: ProductWithStock; quantity: number }[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((it) => it.product.id !== productId));
  };

  // Escáner de código de barras directo
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const found = products.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === barcodeInput.trim().toLowerCase()) ||
        p.sku.toLowerCase() === barcodeInput.trim().toLowerCase()
    );

    if (found) {
      addToCart(found);
      setBarcodeInput("");
      toast.success(`Agregado: ${found.name}`);
    } else {
      toast.error(`Código "${barcodeInput}" no encontrado`);
      setBarcodeInput("");
    }
  };

  // Cálculos de Totales POS
  const subtotalCart = cart.reduce(
    (acc, it) => acc + it.quantity * it.product.sale_price,
    0
  );
  const discountVal = Number(discountAmount) || 0;
  const netSubtotal = Math.max(0, subtotalCart - discountVal);
  const itbisCart = netSubtotal * 0.18;
  const totalCart = netSubtotal + itbisCart;
  const paidVal = Number(amountPaid) || 0;
  const changeVal = paymentMethod === "EFECTIVO" ? Math.max(0, paidVal - totalCart) : 0;

  // Procesar Cobro
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === "EFECTIVO" && paidVal < totalCart) {
      toast.error("El monto recibido no puede ser inferior al total");
      return;
    }

    startTransition(async () => {
      const res = await processSaleAction({
        customerId: selectedCustomerId,
        warehouseId: selectedWarehouseId,
        paymentMethod,
        amountPaid: paymentMethod === "EFECTIVO" ? paidVal : totalCart,
        discountAmount: discountVal,
        notes: saleNotes || undefined,
        items: cart.map((it) => ({
          productId: it.product.id,
          quantity: it.quantity,
          unitPrice: it.product.sale_price,
        })),
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Venta completada. Factura: ${res.invoiceNumber}`);
        setIsCheckoutOpen(false);

        // Crear recibo en memoria para imprimir ticket
        const cust = customers.find((c) => c.id === selectedCustomerId);
        const wh = warehouses.find((w) => w.id === selectedWarehouseId);

        const newSaleObj: SaleWithDetails = {
          id: `sale-${Date.now()}`,
          invoice_number: res.invoiceNumber || "FAC-0000",
          customer_id: selectedCustomerId,
          warehouse_id: selectedWarehouseId,
          status: "COMPLETADA",
          payment_method: paymentMethod,
          amount_paid: paymentMethod === "EFECTIVO" ? paidVal : totalCart,
          change_returned: res.changeReturned || 0,
          subtotal: netSubtotal,
          tax_amount: itbisCart,
          discount_amount: discountVal,
          total_amount: totalCart,
          notes: saleNotes || null,
          created_by: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          customer: cust,
          warehouse: wh,
          items: cart.map((it, idx) => ({
            id: `item-${idx}`,
            sale_id: "tmp",
            product_id: it.product.id,
            quantity: it.quantity,
            unit_price: it.product.sale_price,
            unit_cost: it.product.cost_price,
            subtotal: it.quantity * it.product.sale_price,
            created_at: new Date().toISOString(),
            product: it.product,
          })),
        };

        setReceiptSale(newSaleObj);
        setCart([]);
        setAmountPaid("");
        setDiscountAmount(0);
        setSaleNotes("");
        loadData();
      }
    });
  };

  const handleCancelSale = (saleId: string) => {
    if (confirm("¿Está seguro de anular esta venta? El stock será devuelto a almacén.")) {
      startTransition(async () => {
        const res = await cancelSaleAction(saleId);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Factura anulada e inventario restablecido");
          loadData();
        }
      });
    }
  };

  const filteredCatalog = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(productSearch.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Header con tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-indigo-600" />
            Punto de Venta (POS) y Facturación
          </h2>
          <p className="text-xs text-slate-500">
            Caja registradora de alta velocidad con bloqueo atómico de stock y soporte para lector de código de barras
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === "pos" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("pos")}
            className="text-xs gap-1.5"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Punto de Venta ({cart.length})</span>
          </Button>

          <Button
            variant={activeTab === "history" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("history")}
            className="text-xs gap-1.5"
          >
            <Clock className="w-4 h-4" />
            <span>Historial de Facturas ({sales.length})</span>
          </Button>
        </div>
      </div>

      {/* VISTA 1: PUNTO DE VENTA (POS) */}
      {activeTab === "pos" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Columna Izquierda: Buscador & Catálogo de Selección Rápida */}
          <div className="lg:col-span-7 space-y-4">
            {/* Barra Escáner de Códigos de Barra */}
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <BarcodeIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
                <Input
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Escanear Código de Barras o SKU con pistola láser (Presione Enter)..."
                  className="pl-9 text-xs h-10 border-indigo-300 dark:border-indigo-800 focus-visible:ring-indigo-600 font-mono"
                  autoFocus
                />
              </div>
              <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs">
                Escanear
              </Button>
            </form>

            {/* Búsqueda manual por nombre */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Buscar por descripción o modelo..."
                className="pl-9 text-xs h-9"
              />
            </div>

            {/* Cuadrícula de Productos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[560px] overflow-y-auto pr-1">
              {filteredCatalog.map((prod) => {
                const isOutOfStock = prod.total_stock <= 0;
                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => addToCart(prod)}
                    disabled={isOutOfStock}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all select-none ${
                      isOutOfStock
                        ? "opacity-50 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 cursor-not-allowed"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 hover:shadow-md active:scale-98"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-mono text-slate-400">
                          {prod.sku}
                        </span>
                        <Badge
                          variant={isOutOfStock ? "destructive" : "outline"}
                          className="text-[9px] px-1 py-0"
                        >
                          {prod.total_stock} {prod.unit_measure}
                        </Badge>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-2">
                        {prod.name}
                      </h4>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(prod.sale_price)}
                      </span>
                      <Plus className="w-4 h-4 text-indigo-600" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Columna Derecha: Carrito de Compra y Botón de Cobro */}
          <Card className="lg:col-span-5 border-slate-200 dark:border-slate-800 shadow-md">
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-indigo-600" />
                  Carrito de Venta ({cart.length})
                </CardTitle>
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCart([])}
                    className="text-[11px] text-rose-500 hover:underline"
                  >
                    Vaciar Carrito
                  </button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Lista de Items en Carrito */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    El carrito está vacío. Escanee un código de barras o haga clic en un producto.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-white truncate">
                          {item.product.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {formatCurrency(item.product.sale_price)} x {item.quantity} ={" "}
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {formatCurrency(item.quantity * item.product.sale_price)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-6 h-6 rounded bg-white dark:bg-slate-700 border flex items-center justify-center hover:bg-slate-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-6 h-6 rounded bg-white dark:bg-slate-700 border flex items-center justify-center hover:bg-slate-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-rose-400 hover:text-rose-600 ml-1 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Selector de Cliente y Almacén */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">Cliente</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full h-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-[11px]"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">Almacén Origen</label>
                  <select
                    value={selectedWarehouseId}
                    onChange={(e) => setSelectedWarehouseId(e.target.value)}
                    className="w-full h-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-[11px]"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Resumen Financiero */}
              <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal Bruto:</span>
                  <span>{formatCurrency(subtotalCart)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>ITBIS (18%):</span>
                  <span>{formatCurrency(itbisCart)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>Total a Cobrar:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(totalCart)}
                  </span>
                </div>
              </div>

              {/* Botón de Cobro */}
              <Button
                type="button"
                onClick={() => {
                  setAmountPaid(totalCart);
                  setIsCheckoutOpen(true);
                }}
                disabled={cart.length === 0}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 font-bold text-sm tracking-wide shadow-lg gap-2"
              >
                <DollarSign className="w-5 h-5" />
                <span>Cobrar {formatCurrency(totalCart)}</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* VISTA 2: HISTORIAL DE FACTURAS */}
      {activeTab === "history" && (
        <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Factura #</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Método de Pago</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-900/60 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-indigo-600">
                      {sale.invoice_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {sale.customer?.name || "Consumidor Final"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {sale.warehouse?.name || "Almacén Central"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="outline">{sale.payment_method}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDate(sale.created_at)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(sale.total_amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      {sale.status === "COMPLETADA" ? (
                        <Badge variant="success">Completada</Badge>
                      ) : (
                        <Badge variant="destructive">Anulada</Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReceiptSale(sale)}
                          className="h-7 text-[11px] gap-1"
                          title="Reimprimir Ticket"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Ticket</span>
                        </Button>
                        {sale.status === "COMPLETADA" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelSale(sale.id)}
                            className="h-7 text-[11px] text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          >
                            Anular
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* MODAL DE COBRO (CHECKOUT) */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                Finalizar Cobro de Venta
              </h3>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              {/* Métodos de Pago */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Método de Pago
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["EFECTIVO", "TARJETA", "TRANSFERENCIA", "CREDITO"] as PaymentMethod[]).map(
                    (m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMethod(m)}
                        className={`py-2 px-1 text-center rounded-lg text-xs font-semibold border transition-all ${
                          paymentMethod === m
                            ? "bg-indigo-600 text-white border-indigo-600 shadow"
                            : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        {m}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Si es efectivo, cálculo de cambio/devuelta */}
              {paymentMethod === "EFECTIVO" && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Monto Recibido en Efectivo (RD$)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="0.00"
                      className="text-base font-bold text-indigo-600"
                      required
                    />
                  </div>

                  <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-700 dark:text-slate-300">Devuelta / Cambio:</span>
                    <span className="text-emerald-600 text-lg">
                      {formatCurrency(changeVal)}
                    </span>
                  </div>
                </div>
              )}

              {/* Descuento Opcional */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Descuento Especial (RD$)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-8 text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCheckoutOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-sm font-bold px-6"
                >
                  {isPending ? "Confirmando Venta..." : "Confirmar e Imprimir"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE TICKET TÉRMICO IMPRIMIBLE */}
      {receiptSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white text-black p-6 rounded-xl shadow-2xl font-mono text-xs border">
            <button
              type="button"
              onClick={() => setReceiptSale(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-black p-1 print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Encabezado del Ticket */}
            <div className="text-center space-y-1 border-b pb-3 mb-3">
              <h3 className="font-bold text-sm tracking-wider">ERP ADMINISTRATIVO</h3>
              <p className="text-[10px]">RNC: 101-99887-2</p>
              <p className="text-[10px]">Av. 27 de Febrero #450, Santo Domingo</p>
              <p className="text-[10px]">Tel: (809) 555-0101</p>
            </div>

            {/* Metadatos de Factura */}
            <div className="space-y-1 border-b pb-2 mb-2 text-[11px]">
              <div>Factura: <span className="font-bold">{receiptSale.invoice_number}</span></div>
              <div>Fecha: {formatDate(receiptSale.created_at)}</div>
              <div>Cliente: {receiptSale.customer?.name || "Consumidor Final"}</div>
              <div>Método: {receiptSale.payment_method}</div>
            </div>

            {/* Items */}
            <div className="space-y-1 border-b pb-2 mb-2 text-[11px]">
              <div className="grid grid-cols-12 font-bold text-[10px] text-slate-600">
                <span className="col-span-6">CANT/DESC</span>
                <span className="col-span-3 text-right">PRECIO</span>
                <span className="col-span-3 text-right">TOTAL</span>
              </div>
              {receiptSale.items?.map((it, idx) => (
                <div key={idx} className="grid grid-cols-12 text-[10px]">
                  <span className="col-span-6 truncate">{it.quantity}x {it.product?.name}</span>
                  <span className="col-span-3 text-right">{it.unit_price.toFixed(2)}</span>
                  <span className="col-span-3 text-right">{it.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Totales */}
            <div className="space-y-1 text-right text-[11px] font-bold">
              <div>Subtotal: RD$ {receiptSale.subtotal.toFixed(2)}</div>
              <div>ITBIS (18%): RD$ {receiptSale.tax_amount.toFixed(2)}</div>
              <div className="text-sm border-t pt-1">TOTAL: RD$ {receiptSale.total_amount.toFixed(2)}</div>
              {receiptSale.payment_method === "EFECTIVO" && (
                <>
                  <div className="text-[10px] text-slate-600">Efectivo: RD$ {receiptSale.amount_paid.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-600">Devuelta: RD$ {receiptSale.change_returned.toFixed(2)}</div>
                </>
              )}
            </div>

            <div className="text-center text-[10px] text-slate-500 pt-4 border-t mt-3">
              *** GRACIAS POR SU COMPRA ***<br />
              Comprobante de venta válido
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2 mt-4 print:hidden">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => setReceiptSale(null)}
              >
                Cerrar
              </Button>
              <Button
                className="flex-1 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-xs"
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
