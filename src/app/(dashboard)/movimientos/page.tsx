"use client";

import { useState, useEffect, useTransition } from "react";
import {
  getMovementsAction,
  executeTransferAction,
  executeAdjustmentAction,
} from "@/actions/movement.actions";
import { getWarehousesAction } from "@/actions/warehouse.actions";
import { getProductsAction } from "@/actions/product.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeftRight,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  Sliders,
  Filter,
  Warehouse,
  Boxes,
  X,
  AlertCircle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import type {
  InventoryMovementWithDetails,
  Warehouse as WarehouseType,
  ProductWithStock,
} from "@/types/database.types";

export default function MovimientosPage() {
  const [movements, setMovements] = useState<InventoryMovementWithDetails[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [products, setProducts] = useState<ProductWithStock[]>([]);

  // Filtros
  const [filterType, setFilterType] = useState("ALL");
  const [filterWarehouse, setFilterWarehouse] = useState("ALL");

  // Modales
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);

  // Formulario Traslado
  const [sourceWh, setSourceWh] = useState("");
  const [targetWh, setTargetWh] = useState("");
  const [transferProd, setTransferProd] = useState("");
  const [transferQty, setTransferQty] = useState<number | string>(10);
  const [transferReason, setTransferReason] = useState("");

  // Formulario Ajuste
  const [adjustWh, setAdjustWh] = useState("");
  const [adjustProd, setAdjustProd] = useState("");
  const [adjustType, setAdjustType] = useState<"ENTRADA" | "SALIDA">("SALIDA");
  const [adjustQty, setAdjustQty] = useState<number | string>(1);
  const [adjustReason, setAdjustReason] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadData = () => {
    startTransition(async () => {
      const [movs, whs, prods] = await Promise.all([
        getMovementsAction({ type: filterType, warehouseId: filterWarehouse }),
        getWarehousesAction(),
        getProductsAction(),
      ]);
      setMovements(movs);
      setWarehouses(whs.data);
      setProducts(prods);

      if (whs.data.length >= 2) {
        if (!sourceWh) setSourceWh(whs.data[0].id);
        if (!targetWh) setTargetWh(whs.data[1].id);
      }
      if (whs.data.length > 0 && !adjustWh) {
        setAdjustWh(whs.data[0].id);
      }
      if (prods.length > 0) {
        if (!transferProd) setTransferProd(prods[0].id);
        if (!adjustProd) setAdjustProd(prods[0].id);
      }
    });
  };

  useEffect(() => {
    loadData();
  }, [filterType, filterWarehouse]);

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    startTransition(async () => {
      const res = await executeTransferAction({
        sourceWarehouseId: sourceWh,
        targetWarehouseId: targetWh,
        productId: transferProd,
        quantity: Number(transferQty),
        reason: transferReason,
      });

      if (res.error) {
        setFormError(res.error);
        toast.error(res.error);
      } else {
        toast.success(res.message || "Traslado registrado con éxito");
        setIsTransferModalOpen(false);
        setTransferReason("");
        loadData();
      }
    });
  };

  const handleAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    startTransition(async () => {
      const res = await executeAdjustmentAction({
        warehouseId: adjustWh,
        productId: adjustProd,
        type: adjustType,
        quantity: Number(adjustQty),
        reason: adjustReason,
      });

      if (res.error) {
        setFormError(res.error);
        toast.error(res.error);
      } else {
        toast.success(res.message || "Ajuste registrado exitosamente");
        setIsAdjustmentModalOpen(false);
        setAdjustReason("");
        loadData();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-indigo-600" />
            Movimientos de Inventario (Kardex)
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Trazabilidad física y documental de entradas, salidas, traslados entre sucursales y ajustes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsTransferModalOpen(true)}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow text-xs"
          >
            <Repeat className="w-4 h-4" />
            <span>Traslado entre Almacenes</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsAdjustmentModalOpen(true)}
            className="gap-2 text-xs"
          >
            <Sliders className="w-4 h-4" />
            <span>Ajuste / Merma</span>
          </Button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Filtrar Kardex:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs"
            >
              <option value="ALL">Todos los Tipos</option>
              <option value="ENTRADA">Entradas (Compras/Devoluciones)</option>
              <option value="SALIDA">Salidas (Ventas/Bajas)</option>
              <option value="TRASLADO">Traslados entre Almacenes</option>
              <option value="AJUSTE">Ajustes de Inventario</option>
            </select>

            <select
              value={filterWarehouse}
              onChange={(e) => setFilterWarehouse(e.target.value)}
              className="h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs"
            >
              <option value="ALL">Todos los Almacenes</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla Kardex */}
      <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Movimiento #</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Referencia / Motivo</th>
                <th className="py-3 px-4">Flujo de Almacén</th>
                <th className="py-3 px-4">Producto & Cantidad</th>
                <th className="py-3 px-4">Fecha / Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No se registran movimientos para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                movements.map((m) => {
                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-900/60 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                        {m.movement_number}
                      </td>

                      <td className="py-3.5 px-4">
                        {m.type === "ENTRADA" && (
                          <Badge variant="success" className="gap-1">
                            <ArrowDownLeft className="w-3 h-3" />
                            Entrada
                          </Badge>
                        )}
                        {m.type === "SALIDA" && (
                          <Badge variant="destructive" className="gap-1">
                            <ArrowUpRight className="w-3 h-3" />
                            Salida
                          </Badge>
                        )}
                        {m.type === "TRASLADO" && (
                          <Badge variant="default" className="gap-1">
                            <Repeat className="w-3 h-3" />
                            Traslado
                          </Badge>
                        )}
                        {m.type === "AJUSTE" && (
                          <Badge variant="warning" className="gap-1">
                            <Sliders className="w-3 h-3" />
                            Ajuste
                          </Badge>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {m.reference_id || m.reference_type || "N/A"}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">
                          {m.reason || "Sin observación"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {m.type === "TRASLADO" ? (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {m.source_warehouse?.name || "Matriz"}
                            </span>
                            <span className="text-slate-400">➔</span>
                            <span className="font-medium text-indigo-600 dark:text-indigo-400">
                              {m.target_warehouse?.name || "Sucursal"}
                            </span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-600 dark:text-slate-300">
                            {m.target_warehouse?.name ||
                              m.source_warehouse?.name ||
                              "Almacén Central"}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {m.items && m.items.length > 0 ? (
                          m.items.map((it) => (
                            <div key={it.id} className="text-xs">
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {it.product?.name || "Producto"}
                              </span>{" "}
                              <span
                                className={`font-bold ml-1 ${
                                  m.type === "ENTRADA"
                                    ? "text-emerald-600"
                                    : m.type === "SALIDA"
                                    ? "text-rose-600"
                                    : "text-indigo-600"
                                }`}
                              >
                                ({m.type === "ENTRADA" ? "+" : m.type === "SALIDA" ? "-" : "±"}
                                {it.quantity} {it.product?.unit_measure || "UND"})
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">Sin items</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {formatDate(m.created_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL: TRASLADO ENTRE ALMACENES */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Repeat className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                  Registrar Traslado de Mercancía
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Almacén Origen (Resta) *
                  </label>
                  <select
                    value={sourceWh}
                    onChange={(e) => setSourceWh(e.target.value)}
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

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Almacén Destino (Suma) *
                  </label>
                  <select
                    value={targetWh}
                    onChange={(e) => setTargetWh(e.target.value)}
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Producto a Transferir *
                  </label>
                  <select
                    value={transferProd}
                    onChange={(e) => setTransferProd(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                    required
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Cantidad *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={transferQty}
                    onChange={(e) => setTransferQty(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Motivo o Justificación del Traslado *
                </label>
                <Input
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="Ej: Reposición de stock o solicitud urgente de cliente"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsTransferModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isPending ? "Procesando..." : "Ejecutar Traslado"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AJUSTE DE INVENTARIO / MERMA */}
      {isAdjustmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                  Ajuste Manual de Inventario (Merma / Conteo)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAdjustmentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustmentSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Tipo de Ajuste *
                  </label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as "ENTRADA" | "SALIDA")}
                    className="flex h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                  >
                    <option value="SALIDA">Baja / Salida (Merma, Daño, Pérdida)</option>
                    <option value="ENTRADA">Alta / Entrada (Sobrante físico)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Almacén Afectado *
                  </label>
                  <select
                    value={adjustWh}
                    onChange={(e) => setAdjustWh(e.target.value)}
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Producto *
                  </label>
                  <select
                    value={adjustProd}
                    onChange={(e) => setAdjustProd(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                    required
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Cantidad *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Motivo de Ajuste *
                </label>
                <Input
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Ej: Empaque roto en transporte o diferencia de inventario"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdjustmentModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isPending ? "Guardando..." : "Aplicar Ajuste"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
