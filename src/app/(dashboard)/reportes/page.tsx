"use client";

import { useState, useEffect, useTransition } from "react";
import { getAuditLogsAction } from "@/actions/report.actions";
import { getSalesAction } from "@/actions/sale.actions";
import { getProductsAction } from "@/actions/product.actions";
import { getCustomersAction } from "@/actions/customer.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Download,
  ShieldCheck,
  TrendingUp,
  Boxes,
  Users,
  DollarSign,
  FileSpreadsheet,
  Calendar,
  Eye,
  X,
  Code,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AuditLog, SaleWithDetails, ProductWithStock, Customer } from "@/types/database.types";
import { toast } from "sonner";

export default function ReportesPage() {
  const [activeTab, setActiveTab] = useState<"analytics" | "audit">("analytics");
  const [sales, setSales] = useState<SaleWithDetails[]>([]);
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadData = () => {
    startTransition(async () => {
      const [s, p, c, a] = await Promise.all([
        getSalesAction(),
        getProductsAction(),
        getCustomersAction(),
        getAuditLogsAction(),
      ]);
      setSales(s);
      setProducts(p);
      setCustomers(c);
      setAuditLogs(a);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Métricas financieras calculadas
  const totalSalesRevenue = sales
    .filter((s) => s.status === "COMPLETADA")
    .reduce((sum, s) => sum + Number(s.total_amount), 0);

  const totalCostValue = products.reduce(
    (sum, p) => sum + Number(p.total_stock) * Number(p.cost_price),
    0
  );

  const totalSaleValue = products.reduce(
    (sum, p) => sum + Number(p.total_stock) * Number(p.sale_price),
    0
  );

  const estimatedProfit = Math.max(0, totalSaleValue - totalCostValue);

  // Generador de Exportación CSV en Navegador
  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Archivo ${filename}.csv descargado con éxito`);
  };

  const handleExportSales = () => {
    const headers = ["Factura", "Cliente", "Metodo_Pago", "Subtotal", "ITBIS", "Total", "Estado", "Fecha"];
    const rows = sales.map((s) => [
      s.invoice_number,
      s.customer?.name || "Consumidor Final",
      s.payment_method,
      s.subtotal,
      s.tax_amount,
      s.total_amount,
      s.status,
      formatDate(s.created_at),
    ]);
    downloadCSV("reporte_ventas", headers, rows);
  };

  const handleExportInventory = () => {
    const headers = ["SKU", "Codigo_Barras", "Producto", "Categoria", "Costo", "Precio_Venta", "Stock_Actual", "Unidad", "Valor_Costo_Total"];
    const rows = products.map((p) => [
      p.sku,
      p.barcode || "N/A",
      p.name,
      p.category?.name || "General",
      p.cost_price,
      p.sale_price,
      p.total_stock,
      p.unit_measure,
      (p.total_stock * p.cost_price).toFixed(2),
    ]);
    downloadCSV("reporte_inventario_valorizado", headers, rows);
  };

  const handleExportCustomers = () => {
    const headers = ["Nombre", "Identificacion_Fiscal", "Telefono", "Email", "Limite_Credito", "Saldo_Pendiente", "Estado"];
    const rows = customers.map((c) => [
      c.name,
      c.tax_id || "N/A",
      c.phone || "N/A",
      c.email || "N/A",
      c.credit_limit,
      c.current_balance,
      c.is_active ? "Activo" : "Inactivo",
    ]);
    downloadCSV("reporte_clientes_credito", headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            Reportes, Analítica y Auditoría
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Inteligencia de negocio, exportaciones a Excel/CSV y bitácora de trazabilidad inmutable
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === "analytics" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("analytics")}
            className="text-xs gap-1.5"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Métricas & Exportaciones</span>
          </Button>

          <Button
            variant={activeTab === "audit" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("audit")}
            className="text-xs gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Bitácora de Auditoría</span>
          </Button>
        </div>
      </div>

      {/* PESTAÑA 1: ANALÍTICA & EXPORTACIONES */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Métricas Principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
                <CardTitle className="text-xs font-medium text-slate-500">
                  Ingresos por Ventas
                </CardTitle>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-emerald-600">
                  {formatCurrency(totalSalesRevenue)}
                </div>
                <p className="text-[11px] text-slate-400">Ventas completadas en POS</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
                <CardTitle className="text-xs font-medium text-slate-500">
                  Inversión en Inventario
                </CardTitle>
                <Boxes className="w-4 h-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {formatCurrency(totalCostValue)}
                </div>
                <p className="text-[11px] text-slate-400">Valorizado a precio de costo</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
                <CardTitle className="text-xs font-medium text-slate-500">
                  Valor Proyectado a la Venta
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-indigo-600">
                  {formatCurrency(totalSaleValue)}
                </div>
                <p className="text-[11px] text-slate-400">Existencias x Precio de venta</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
                <CardTitle className="text-xs font-medium text-slate-500">
                  Utilidad Bruta Proyectada
                </CardTitle>
                <BarChart3 className="w-4 h-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-amber-600">
                  {formatCurrency(estimatedProfit)}
                </div>
                <p className="text-[11px] text-slate-400">Margen potencial de catálogo</p>
              </CardContent>
            </Card>
          </div>

          {/* Centro de Exportación a Excel / CSV */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Centro de Descarga y Exportación de Reportes (CSV / Excel)
              </CardTitle>
              <CardDescription className="text-xs">
                Descargue la data operativa completa en formato plano compatible con Microsoft Excel y Google Sheets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                      Reporte de Ventas y Facturación
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Todas las facturas emitidas, desglose de ITBIS, clientes y métodos de pago.
                    </p>
                  </div>
                  <Button
                    onClick={handleExportSales}
                    size="sm"
                    className="w-full text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Ventas.csv</span>
                  </Button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Boxes className="w-4 h-4 text-emerald-600" />
                      Inventario Físico y Valorizado
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Catálogo completo con SKU, existencias físicas, costos y valorización global.
                    </p>
                  </div>
                  <Button
                    onClick={handleExportInventory}
                    size="sm"
                    className="w-full text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Inventario.csv</span>
                  </Button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-600" />
                      Cartera de Clientes y Saldos
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Directorio de clientes, límites de crédito autorizados y saldos pendientes.
                    </p>
                  </div>
                  <Button
                    onClick={handleExportCustomers}
                    size="sm"
                    className="w-full text-xs gap-1.5 bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Clientes.csv</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* PESTAÑA 2: AUDITORÍA INMUTABLE */}
      {activeTab === "audit" && (
        <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Registro de Auditoría de Base de Datos (Inmutable)
                </CardTitle>
                <CardDescription className="text-xs">
                  Eventos capturados de forma automática por triggers de PostgreSQL a nivel de fila
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[11px]">
                RLS Protegido
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Acción</th>
                    <th className="py-3 px-4">Tabla</th>
                    <th className="py-3 px-4">Registro Afectado</th>
                    <th className="py-3 px-4">Fecha / Hora</th>
                    <th className="py-3 px-4 text-right">Detalle JSON</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-900/60 transition-colors"
                    >
                      <td className="py-3 px-4 text-slate-500">#{log.id}</td>
                      <td className="py-3 px-4 font-sans">
                        <Badge
                          variant={
                            log.action === "INSERT"
                              ? "success"
                              : log.action === "UPDATE"
                              ? "warning"
                              : "destructive"
                          }
                          className="text-[10px]"
                        >
                          {log.action}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                        {log.table_name}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {log.record_id || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-sans">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedAuditLog(log)}
                          className="h-7 text-[11px] gap-1 font-sans"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Payload</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal Visor de JSON de Auditoría */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-600" />
                Snapshot de Auditoría #{selectedAuditLog.id} ({selectedAuditLog.table_name})
              </h3>
              <button
                type="button"
                onClick={() => setSelectedAuditLog(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 font-mono text-xs">
              {selectedAuditLog.old_data && (
                <div>
                  <h5 className="font-sans font-bold text-[11px] text-amber-600 mb-1">
                    Estado Anterior (Old Data):
                  </h5>
                  <pre className="p-3 rounded-lg bg-slate-950 text-emerald-400 overflow-x-auto text-[10px]">
                    {JSON.stringify(selectedAuditLog.old_data, null, 2)}
                  </pre>
                </div>
              )}

              {selectedAuditLog.new_data && (
                <div>
                  <h5 className="font-sans font-bold text-[11px] text-emerald-600 mb-1">
                    Estado Nuevo (New Data):
                  </h5>
                  <pre className="p-3 rounded-lg bg-slate-950 text-cyan-400 overflow-x-auto text-[10px]">
                    {JSON.stringify(selectedAuditLog.new_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAuditLog(null)}
                className="text-xs"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
