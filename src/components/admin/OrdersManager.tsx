"use client";

import { useState, useMemo } from "react";
import { Order, OrderStatus } from "@/types/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  CreditCard,
  Calendar,
  User,
  MapPin,
  Package,
  ShoppingBag,
  DollarSign,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

interface OrdersManagerProps {
  orders: Order[];
  onOpenCreateOrder: () => void;
  onOpenEditOrder: (order: Order) => void;
  onOpenDetail: (order: Order) => void;
  onDeleteOrder: (order: Order) => void;
}

export function OrdersManager({
  orders,
  onOpenCreateOrder,
  onOpenEditOrder,
  onOpenDetail,
  onDeleteOrder,
}: OrdersManagerProps) {
  const [searchIdQuery, setSearchIdQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("TODOS");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Copy ID helper
  const handleCopy = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("ID de compra copiado", { description: id });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Find direct match by ID (exact or strong substring match)
  const matchedOrderById = useMemo(() => {
    const trimmed = searchIdQuery.trim().toLowerCase();
    if (!trimmed) return null;

    // First check exact match on ID
    const exact = orders.find((o) => o.id.toLowerCase() === trimmed);
    if (exact) return exact;

    // Check partial match on ID
    const partial = orders.find((o) => o.id.toLowerCase().includes(trimmed));
    if (partial) return partial;

    return null;
  }, [orders, searchIdQuery]);

  // General filtered orders list for the table
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search matches ID, customer name, email or phone
      const query = searchIdQuery.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        order.id.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.email.toLowerCase().includes(query) ||
        order.phone.toLowerCase().includes(query);

      // Status filter
      const matchesStatus =
        statusFilter === "TODOS" ||
        order.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchIdQuery, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalCount = orders.length;
    const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
    const completed = orders.filter((o) => o.status === "Completada" || o.status === "Entregada").length;
    const pending = orders.filter((o) => o.status === "Pendiente").length;
    return { totalCount, totalRevenue, completed, pending };
  }, [orders]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Entregada":
        return {
          icon: Truck,
          className:
            "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        };
      case "Completada":
        return {
          icon: CheckCircle2,
          className:
            "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
        };
      case "Pendiente":
        return {
          icon: Clock,
          className:
            "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        };
      case "Cancelada":
        return {
          icon: XCircle,
          className:
            "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
        };
      default:
        return {
          icon: Clock,
          className:
            "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
        };
    }
  };

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
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Buscador y Gestión de Ventas
            </h2>
            <Badge
              variant="outline"
              className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 font-semibold"
            >
              Control en Tiempo Real
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Busque cualquier venta por su <strong>ID de compra</strong>, consulte los datos del cliente, modifique o agregue nuevas ventas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={onOpenCreateOrder}
            className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Venta</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Ventas</span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
            {stats.totalCount}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Órdenes registradas</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Ingresos Totales</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
            ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Acumulado total</p>
        </div>

        {/* Completed */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Completadas / Entregadas</span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
            {stats.completed}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">Procesadas con éxito</p>
        </div>

        {/* Pending */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pendientes</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
            {stats.pending}
          </p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">Por despachar o cobrar</p>
        </div>
      </div>

      {/* DEDICATED SALES SEARCH BY ID */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-indigo-200 dark:border-indigo-900/60 shadow-sm transition-colors space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Buscador de Ventas por ID de Compra
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Ingrese el identificador único (ejemplo: <code>ORD-928410-101</code>) para encontrar y visualizar toda la información detallada.
            </p>
          </div>

          {searchIdQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchIdQuery("")}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Limpiar búsqueda
            </Button>
          )}
        </div>

        {/* Search input with quick-find button */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={searchIdQuery}
              onChange={(e) => setSearchIdQuery(e.target.value)}
              placeholder="Escriba o pegue el ID de la compra (ej: ORD-928410-101)..."
              className="pl-10 h-11 text-xs sm:text-sm font-mono bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus-visible:ring-indigo-500 rounded-xl"
            />
            {searchIdQuery && (
              <button
                type="button"
                onClick={() => setSearchIdQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs cursor-pointer p-1"
              >
                ✕
              </button>
            )}
          </div>

          <Button
            type="button"
            onClick={() => {
              if (!searchIdQuery.trim()) {
                toast.error("Por favor ingrese un ID de compra para buscar");
                return;
              }
              if (matchedOrderById) {
                toast.success(`Venta encontrada: ${matchedOrderById.id}`);
              } else {
                toast.error(`No se encontró ninguna venta con el ID "${searchIdQuery}"`);
              }
            }}
            className="h-11 px-5 text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shrink-0"
          >
            Buscar Venta
          </Button>
        </div>

        {/* Quick ID Chips */}
        {orders.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
            <span className="text-slate-400 dark:text-slate-500 font-medium">IDs de prueba disponibles:</span>
            {orders.slice(0, 4).map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setSearchIdQuery(o.id)}
                className={`px-2 py-0.5 rounded-md font-mono text-[10px] border transition-colors cursor-pointer ${
                  searchIdQuery.toUpperCase() === o.id.toUpperCase()
                    ? "bg-indigo-600 text-white border-indigo-600 font-bold"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                }`}
                title="Haga clic para buscar este ID al instante"
              >
                {o.id}
              </button>
            ))}
          </div>
        )}

        {/* HIGHLIGHT CARD: IF ORDER FOUND BY ID */}
        {matchedOrderById && (
          <div className="mt-4 p-5 rounded-xl border border-indigo-200 dark:border-indigo-800/70 bg-indigo-50/60 dark:bg-indigo-950/30 transition-all animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-indigo-100 dark:border-indigo-900/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-indigo-600 text-white font-mono text-xs px-2.5 py-0.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    ID: {matchedOrderById.id}
                  </Badge>
                  <button
                    onClick={(e) => handleCopy(matchedOrderById.id, e)}
                    className="text-xs text-indigo-700 dark:text-indigo-300 hover:underline flex items-center gap-1"
                    title="Copiar ID"
                  >
                    {copiedId === matchedOrderById.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === matchedOrderById.id ? "Copiado" : "Copiar"}</span>
                  </button>

                  {/* Status */}
                  {(() => {
                    const badge = getStatusBadge(matchedOrderById.status);
                    const StatusIcon = badge.icon;
                    return (
                      <Badge variant="outline" className={`text-xs gap-1 py-0.5 px-2.5 font-medium ${badge.className}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {matchedOrderById.status}
                      </Badge>
                    );
                  })()}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Fecha de compra: <strong>{formatDate(matchedOrderById.createdAt)}</strong>
                </p>
              </div>

              {/* Total & Action buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-right mr-3 hidden sm:block">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Monto Total</p>
                  <p className="text-xl font-black text-indigo-700 dark:text-indigo-300">
                    ${matchedOrderById.total.toFixed(2)}
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => onOpenDetail(matchedOrderById)}
                  className="text-xs gap-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 shadow-2xs font-medium"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Ver Toda la Información</span>
                </Button>

                <Button
                  size="sm"
                  onClick={() => onOpenEditOrder(matchedOrderById)}
                  className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-medium"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Modificar Venta</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDeleteOrder(matchedOrderById)}
                  className="text-xs p-2 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Eliminar esta venta"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Quick Grid with Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-4 text-xs">
              <div className="space-y-0.5">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" /> Cliente
                </span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{matchedOrderById.customerName}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{matchedOrderById.email}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{matchedOrderById.phone}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> Dirección de Entrega
                </span>
                <p className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                  {matchedOrderById.address || "No especificada"}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-slate-400" /> Método de Pago
                </span>
                <p className="font-medium text-slate-800 dark:text-slate-200">{matchedOrderById.paymentMethod}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Subtotal: ${matchedOrderById.subtotal?.toFixed(2) || matchedOrderById.total.toFixed(2)}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Package className="w-3 h-3 text-slate-400" /> Productos ({matchedOrderById.items?.length || 0})
                </span>
                <div className="space-y-0.5 max-h-16 overflow-y-auto">
                  {matchedOrderById.items?.map((it, idx) => (
                    <p key={idx} className="text-[11px] text-slate-700 dark:text-slate-300 truncate">
                      • {it.quantity}x {it.name} (${(it.price * it.quantity).toFixed(2)})
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NOT FOUND ALERT IF TYPING A NON-EXISTENT ID */}
        {searchIdQuery.trim() !== "" && !matchedOrderById && (
          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                No se encontró ninguna venta con el ID exacto <strong>&quot;{searchIdQuery}&quot;</strong>. Revise la lista de ventas abajo o registre una nueva venta.
              </span>
            </div>
            <Button
              size="sm"
              onClick={onOpenCreateOrder}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Crear Venta
            </Button>
          </div>
        )}
      </div>

      {/* FILTER BAR FOR ALL ORDERS */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Filtrar por Estado de Venta:
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            {["TODOS", "Completada", "Pendiente", "Entregada", "Cancelada"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === st
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {st === "TODOS" ? "Todos los estados" : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Historial de Ventas Registradas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Haga clic en <strong>Ver Detalle</strong> para consultar la información completa, o en <strong>Modificar</strong> para actualizarla.
            </p>
          </div>

          <Button
            size="sm"
            onClick={onOpenCreateOrder}
            className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Venta</span>
          </Button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No se encontraron ventas
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {searchIdQuery
                ? `No hay órdenes que coincidan con "${searchIdQuery}".`
                : "Aún no hay compras registradas en el sistema."}
            </p>
            <Button
              size="sm"
              onClick={onOpenCreateOrder}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white mt-2"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Registrar Primera Venta
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">ID de Compra</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Método de Pago</th>
                  <th className="py-3 px-4">Productos</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                {filteredOrders.map((order) => {
                  const badge = getStatusBadge(order.status);
                  const StatusIcon = badge.icon;
                  const isCurrentSearched = searchIdQuery.trim() && order.id.toLowerCase().includes(searchIdQuery.trim().toLowerCase());

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                        isCurrentSearched ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""
                      }`}
                    >
                      {/* Order ID */}
                      <td className="py-3.5 px-4 font-mono font-medium">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenDetail(order)}
                            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                            title="Haga clic para ver toda la información"
                          >
                            {order.id}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleCopy(order.id, e)}
                            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                            title="Copiar ID"
                          >
                            {copiedId === order.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {order.customerName}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                          {order.email}
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[140px]">{order.paymentMethod}</span>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant="secondary"
                          className="text-[11px] font-normal bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        >
                          <Package className="w-3 h-3 mr-1 text-slate-500" />
                          {order.items?.reduce((acc, it) => acc + it.quantity, 0) || 0} ítems
                        </Badge>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant="outline" className={`text-[11px] gap-1 py-0.5 px-2 font-medium ${badge.className}`}>
                          <StatusIcon className="w-3 h-3" />
                          {order.status}
                        </Badge>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                        ${order.total.toFixed(2)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Detail Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onOpenDetail(order)}
                            className="h-8 px-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs gap-1"
                            title="Ver toda la información dada"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Ver Detalle</span>
                          </Button>

                          {/* Edit Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onOpenEditOrder(order)}
                            className="h-8 px-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs gap-1"
                            title="Modificar venta"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Modificar</span>
                          </Button>

                          {/* Delete Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDeleteOrder(order)}
                            className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Eliminar venta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Mostrando <strong>{filteredOrders.length}</strong> de{" "}
            <strong>{orders.length}</strong> ventas registradas
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Buscador por ID de Compra activo
          </span>
        </div>
      </div>
    </div>
  );
}
