import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  TrendingUp,
  Boxes,
  AlertTriangle,
  Receipt,
  ShoppingCart,
  ArrowRight,
  ArrowLeftRight,
  UserPlus,
  Package,
} from "lucide-react";

export default function DashboardPage() {
  // Datos demostrativos de vista previa para la Fase 1
  const kpis = [
    {
      title: "Ventas del Día",
      value: "RD$ 48,250.00",
      change: "+12.5% vs ayer",
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      title: "Total Productos en Catálogo",
      value: "1,248",
      change: "4 almacenes activos",
      icon: Boxes,
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40",
    },
    {
      title: "Alertas de Stock Crítico",
      value: "9 productos",
      change: "Requiere reposición inmediata",
      icon: AlertTriangle,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
    },
    {
      title: "Compras Pendientes",
      value: "3 órdenes",
      change: "En tránsito a Almacén Central",
      icon: ShoppingCart,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40",
    },
  ];

  const recentMovements = [
    {
      id: "MOV-1002",
      type: "ENTRADA",
      reference: "Compra #OC-402",
      warehouse: "Almacén Central",
      product: "Aceite Sintético 5W-30 (1L)",
      quantity: "+120 und",
      time: "Hace 15 min",
      status: "success",
    },
    {
      id: "MOV-1001",
      type: "SALIDA",
      reference: "Venta #FAC-8902",
      warehouse: "Sucursal Norte",
      product: "Filtro de Aire Premium",
      quantity: "-2 und",
      time: "Hace 32 min",
      status: "destructive",
    },
    {
      id: "MOV-1000",
      type: "TRASLADO",
      reference: "Traslado #TR-088",
      warehouse: "Matriz ➔ Sucursal Sur",
      product: "Batería 12V 75Ah",
      quantity: "15 und",
      time: "Hace 1 hora",
      status: "warning",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Saludo y Accesos Rápidos */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Panel de Control General
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Resumen en tiempo real del inventario, ventas y operaciones multialmacén.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/ventas">
            <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow">
              <Receipt className="w-4 h-4" />
              <span>Nueva Venta (POS)</span>
            </Button>
          </Link>
          <Link href="/usuarios">
            <Button variant="outline" size="sm" className="gap-2">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Invitar Usuario</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Tarjetas de Métricas (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-slate-900 dark:text-white">
                  {kpi.value}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {kpi.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Secciones Inferiores: Atajos y Últimos Movimientos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Atajos Rápidos Operativos */}
        <Card className="lg:col-span-1 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Acciones Operativas</CardTitle>
            <CardDescription className="text-xs">
              Accesos directos para tareas diarias de bodega y mostrador
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <Link
              href="/inventario"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-indigo-600" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600">
                    Consultar Catálogo de Productos
                  </h4>
                  <p className="text-[11px] text-slate-500">Buscar SKU, precios y existencias</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/movimientos"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <ArrowLeftRight className="w-5 h-5 text-amber-600" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-amber-600">
                    Traslado entre Almacenes
                  </h4>
                  <p className="text-[11px] text-slate-500">Transferir stock de matriz a sucursal</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/compras"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600">
                    Recepción de Mercadería
                  </h4>
                  <p className="text-[11px] text-slate-500">Ingresar orden de compra de proveedor</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </CardContent>
        </Card>

        {/* Últimos Movimientos de Kardex */}
        <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Trazabilidad Reciente (Kardex)</CardTitle>
              <CardDescription className="text-xs">
                Últimos movimientos de stock registrados en almacenes
              </CardDescription>
            </div>
            <Link href="/movimientos">
              <Button variant="ghost" size="sm" className="text-xs text-indigo-600 gap-1">
                <span>Ver Todos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentMovements.map((mov) => (
                <div key={mov.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-900 dark:text-white">
                        {mov.product}
                      </span>
                      <Badge
                        variant={
                          mov.status === "success"
                            ? "success"
                            : mov.status === "destructive"
                            ? "destructive"
                            : "warning"
                        }
                        className="text-[10px] px-1.5 py-0"
                      >
                        {mov.type}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {mov.reference} • {mov.warehouse}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-bold ${
                        mov.status === "success"
                          ? "text-emerald-600"
                          : mov.status === "destructive"
                          ? "text-rose-600"
                          : "text-amber-600"
                      }`}
                    >
                      {mov.quantity}
                    </span>
                    <p className="text-[10px] text-slate-400">{mov.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
