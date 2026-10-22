"use client";

import { useState, useEffect, useTransition } from "react";
import {
  getPurchasesAction,
  createPurchaseAction,
  receivePurchaseAction,
  cancelPurchaseAction,
} from "@/actions/purchase.actions";
import {
  getSuppliersAction,
  createSupplierAction,
  toggleSupplierStatusAction,
} from "@/actions/supplier.actions";
import { getWarehousesAction } from "@/actions/warehouse.actions";
import { getProductsAction } from "@/actions/product.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Plus,
  Truck,
  CheckCircle2,
  Clock,
  Ban,
  PackageCheck,
  Building2,
  DollarSign,
  X,
  AlertCircle,
  FileText,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import type {
  PurchaseWithDetails,
  Supplier,
  Warehouse,
  ProductWithStock,
} from "@/types/database.types";

export default function ComprasPage() {
  const [activeTab, setActiveTab] = useState<"purchases" | "suppliers">("purchases");
  const [purchases, setPurchases] = useState<PurchaseWithDetails[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<ProductWithStock[]>([]);

  // Modales
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  // Formulario Orden de Compra
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [purchaseNotes, setPurchaseNotes] = useState("");
  const [orderItems, setOrderItems] = useState<
    { productId: string; quantityOrdered: number; unitCost: number }[]
  >([]);

  // Formulario Proveedor
  const [taxId, setTaxId] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [contactName, setContactName] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadData = () => {
    startTransition(async () => {
      const [purs, sups, whs, prods] = await Promise.all([
        getPurchasesAction(),
        getSuppliersAction(),
        getWarehousesAction(),
        getProductsAction(),
      ]);
      setPurchases(purs);
      setSuppliers(sups);
      setWarehouses(whs.data);
      setProducts(prods);

      if (sups.length > 0 && !selectedSupplierId) setSelectedSupplierId(sups[0].id);
      if (whs.data.length > 0 && !selectedWarehouseId) setSelectedWarehouseId(whs.data[0].id);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Agregar fila de producto a la orden
  const handleAddItem = () => {
    if (products.length === 0) return;
    const firstProd = products[0];
    setOrderItems((prev) => [
      ...prev,
      {
        productId: firstProd.id,
        quantityOrdered: 10,
        unitCost: Number(firstProd.cost_price) || 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setOrderItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        if (field === "productId") {
          const prod = products.find((p) => p.id === value);
          return {
            ...item,
            productId: value,
            unitCost: prod ? Number(prod.cost_price) : item.unitCost,
          };
        }
        return { ...item, [field]: value };
      })
    );
  };

  // Cálculos en tiempo real
  const subtotalOrder = orderItems.reduce(
    (acc, it) => acc + (Number(it.quantityOrdered) || 0) * (Number(it.unitCost) || 0),
    0
  );
  const taxOrder = subtotalOrder * 0.18;
  const totalOrder = subtotalOrder + taxOrder;

  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (orderItems.length === 0) {
      setFormError("Debe agregar al menos un producto a la orden");
      return;
    }

    startTransition(async () => {
      const res = await createPurchaseAction({
        supplierId: selectedSupplierId,
        warehouseId: selectedWarehouseId,
        notes: purchaseNotes || undefined,
        items: orderItems,
      });

      if (res.error) {
        setFormError(res.error);
        toast.error(res.error);
      } else {
        toast.success("Orden de compra creada exitosamente");
        setIsPurchaseModalOpen(false);
        setPurchaseNotes("");
        setOrderItems([]);
        loadData();
      }
    });
  };

  const handleReceivePurchase = (purchaseId: string, purchaseNumber: string) => {
    if (confirm(`¿Confirmar recepción de mercancía para la orden ${purchaseNumber}? Esta acción sumará existencias y recalculará costos en el Kardex.`)) {
      startTransition(async () => {
        const res = await receivePurchaseAction(purchaseId);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(res.message || "Mercancía ingresada al almacén");
          loadData();
        }
      });
    }
  };

  const handleCancelPurchase = (purchaseId: string) => {
    if (confirm("¿Está seguro de anular esta orden de compra?")) {
      startTransition(async () => {
        const res = await cancelPurchaseAction(purchaseId);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Orden de compra cancelada");
          loadData();
        }
      });
    }
  };

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    startTransition(async () => {
      const res = await createSupplierAction({
        taxId: taxId || undefined,
        name: supplierName,
        contactName: contactName || undefined,
        email: supplierEmail || undefined,
        phone: supplierPhone || undefined,
        address: supplierAddress || undefined,
      });

      if (res.error) {
        setFormError(res.error);
        toast.error(res.error);
      } else {
        toast.success("Proveedor registrado exitosamente");
        setIsSupplierModalOpen(false);
        setTaxId("");
        setSupplierName("");
        setContactName("");
        setSupplierEmail("");
        setSupplierPhone("");
        setSupplierAddress("");
        loadData();
      }
    });
  };

  const handleToggleSupplier = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await toggleSupplierStatusAction(id, currentStatus);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(!currentStatus ? "Proveedor activado" : "Proveedor suspendido");
        loadData();
      }
    });
  };

  // KPIs de compras
  const totalPurchasesAmount = purchases
    .filter((p) => p.status === "RECIBIDO")
    .reduce((sum, p) => sum + Number(p.total_amount), 0);

  const pendingReceiving = purchases.filter((p) => p.status === "SOLICITADO").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-indigo-600" />
            Gestión de Compras y Proveedores
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Control de órdenes de compra, recepción de mercancías y recálculo automático de costo promedio
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "purchases" ? (
            <Button
              onClick={() => {
                setIsPurchaseModalOpen(true);
                if (orderItems.length === 0) handleAddItem();
              }}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Orden de Compra</span>
            </Button>
          ) : (
            <Button
              onClick={() => setIsSupplierModalOpen(true)}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Proveedor</span>
            </Button>
          )}
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab("purchases")}
          className={`pb-3 px-1 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "purchases"
              ? "border-indigo-600 text-indigo-600 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Órdenes de Compra ({purchases.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("suppliers")}
          className={`pb-3 px-1 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "suppliers"
              ? "border-indigo-600 text-indigo-600 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Directorio de Proveedores ({suppliers.length})</span>
        </button>
      </div>

      {/* CONTENIDO PESTAÑA: COMPRAS */}
      {activeTab === "purchases" && (
        <div className="space-y-6">
          {/* Métricas de Compras */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
                <CardTitle className="text-xs font-medium text-slate-500">
                  Órdenes Totales
                </CardTitle>
                <FileText className="w-4 h-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{purchases.length}</div>
                <p className="text-[11px] text-slate-400">Registradas en el sistema</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
                <CardTitle className="text-xs font-medium text-slate-500">
                  Pendientes de Entrega
                </CardTitle>
                <Truck className="w-4 h-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-blue-600">
                  {pendingReceiving}
                </div>
                <p className="text-[11px] text-blue-500">En tránsito a almacenes</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
                <CardTitle className="text-xs font-medium text-slate-500">
                  Inversión en Mercancía Recibida
                </CardTitle>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-emerald-600">
                  {formatCurrency(totalPurchasesAmount)}
                </div>
                <p className="text-[11px] text-slate-400">Costo acumulado ingresado</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de Órdenes */}
          <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Orden #</th>
                    <th className="py-3 px-4">Proveedor</th>
                    <th className="py-3 px-4">Almacén Destino</th>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {purchases.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No hay órdenes de compra registradas.
                      </td>
                    </tr>
                  ) : (
                    purchases.map((p) => {
                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-900/60 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                            {p.purchase_number}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {p.supplier?.name || "Proveedor"}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {p.supplier?.tax_id || ""}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                            {p.warehouse?.name || "Almacén Central"}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {formatDate(p.created_at)}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                            {formatCurrency(p.total_amount)}
                          </td>
                          <td className="py-3.5 px-4">
                            {p.status === "RECIBIDO" && (
                              <Badge variant="success" className="gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Recibido
                              </Badge>
                            )}
                            {p.status === "SOLICITADO" && (
                              <Badge variant="warning" className="gap-1">
                                <Clock className="w-3 h-3" />
                                Solicitado
                              </Badge>
                            )}
                            {p.status === "BORRADOR" && (
                              <Badge variant="secondary">Borrador</Badge>
                            )}
                            {p.status === "CANCELADO" && (
                              <Badge variant="destructive" className="gap-1">
                                <Ban className="w-3 h-3" />
                                Cancelado
                              </Badge>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {p.status === "SOLICITADO" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleReceivePurchase(p.id, p.purchase_number)
                                    }
                                    className="bg-emerald-600 hover:bg-emerald-700 h-8 text-[11px] gap-1.5"
                                  >
                                    <PackageCheck className="w-3.5 h-3.5" />
                                    <span>Recibir Mercancía</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCancelPurchase(p.id)}
                                    className="h-8 text-[11px] text-rose-600 hover:text-rose-700 border-rose-200"
                                  >
                                    Anular
                                  </Button>
                                </>
                              )}
                              {p.status === "RECIBIDO" && (
                                <span className="text-[11px] text-slate-400 italic">
                                  Ingresado a Kardex
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* CONTENIDO PESTAÑA: PROVEEDORES */}
      {activeTab === "suppliers" && (
        <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Proveedor / Razón Social</th>
                  <th className="py-3 px-4">Identificación Fiscal (RNC)</th>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4">Teléfono / Email</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {suppliers.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-900/60 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {s.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {s.address || "Sin dirección"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {s.tax_id || "N/A"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {s.contact_name || "No especificado"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <div>{s.phone || ""}</div>
                      <div className="text-[11px] text-indigo-600">{s.email || ""}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {s.is_active ? (
                        <Badge variant="success">Activo</Badge>
                      ) : (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleSupplier(s.id, s.is_active)}
                        className={`text-[11px] h-7 ${
                          s.is_active
                            ? "text-rose-600 border-rose-200"
                            : "text-emerald-600 border-emerald-200"
                        }`}
                      >
                        {s.is_active ? "Desactivar" : "Activar"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* MODAL: REGISTRAR ORDEN DE COMPRA */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                  Crear Nueva Orden de Compra
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPurchaseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreatePurchase}
              className="p-6 space-y-4 overflow-y-auto flex-1"
            >
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Proveedor *
                  </label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                    required
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Almacén de Recepción *
                  </label>
                  <select
                    value={selectedWarehouseId}
                    onChange={(e) => setSelectedWarehouseId(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                    required
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items de la orden */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Productos a Solicitar
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddItem}
                    className="h-7 text-xs gap-1 text-indigo-600"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Producto</span>
                  </Button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {orderItems.map((item, index) => {
                    const rowSubtotal =
                      (Number(item.quantityOrdered) || 0) * (Number(item.unitCost) || 0);

                    return (
                      <div
                        key={index}
                        className="grid grid-cols-12 gap-2 items-center bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs"
                      >
                        <div className="col-span-5">
                          <label className="text-[10px] text-slate-400 block mb-0.5">
                            Producto
                          </label>
                          <select
                            value={item.productId}
                            onChange={(e) =>
                              handleItemChange(index, "productId", e.target.value)
                            }
                            className="w-full h-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-xs"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-2">
                          <label className="text-[10px] text-slate-400 block mb-0.5">
                            Cantidad
                          </label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantityOrdered}
                            onChange={(e) =>
                              handleItemChange(index, "quantityOrdered", Number(e.target.value))
                            }
                            className="h-8 text-xs"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="text-[10px] text-slate-400 block mb-0.5">
                            Costo Unit.
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unitCost}
                            onChange={(e) =>
                              handleItemChange(index, "unitCost", Number(e.target.value))
                            }
                            className="h-8 text-xs"
                          />
                        </div>

                        <div className="col-span-2 text-right">
                          <label className="text-[10px] text-slate-400 block mb-0.5">
                            Total
                          </label>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {formatCurrency(rowSubtotal)}
                          </span>
                        </div>

                        <div className="col-span-1 text-center pt-3">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                            title="Quitar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notas y Resumen Financiero */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Notas u Observaciones
                  </label>
                  <textarea
                    value={purchaseNotes}
                    onChange={(e) => setPurchaseNotes(e.target.value)}
                    rows={3}
                    placeholder="Condiciones de pago, transporte, etc."
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs"
                  />
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs text-right">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatCurrency(subtotalOrder)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>ITBIS (18%):</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatCurrency(taxOrder)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-indigo-600 dark:text-indigo-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span>Total Orden:</span>
                    <span>{formatCurrency(totalOrder)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPurchaseModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || orderItems.length === 0}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isPending ? "Generando Orden..." : "Guardar Orden de Compra"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR PROVEEDOR */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                  Registrar Nuevo Proveedor
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSupplierModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Razón Social / Nombre de Empresa *
                </label>
                <Input
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="Ej: Distribuidora Nacional SRL"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    RNC / Registro Tributario
                  </label>
                  <Input
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="Ej: 101-55555-1"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Persona de Contacto
                  </label>
                  <Input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Ej: Lic. Gómez"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Teléfono
                  </label>
                  <Input
                    type="tel"
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(e.target.value)}
                    placeholder="+1 809-555-0000"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Correo Electrónico
                  </label>
                  <Input
                    type="email"
                    value={supplierEmail}
                    onChange={(e) => setSupplierEmail(e.target.value)}
                    placeholder="pedidos@proveedor.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Dirección
                </label>
                <Input
                  value={supplierAddress}
                  onChange={(e) => setSupplierAddress(e.target.value)}
                  placeholder="Zona industrial o ciudad"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSupplierModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isPending ? "Guardando..." : "Guardar Proveedor"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
