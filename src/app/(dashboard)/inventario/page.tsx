"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import {
  getProductsAction,
  getCategoriesAction,
  createProductAction,
  deleteProductAction,
} from "@/actions/product.actions";
import { getWarehousesAction } from "@/actions/warehouse.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Barcode } from "@/components/ui/barcode";
import {
  Boxes,
  Plus,
  Search,
  Barcode as BarcodeIcon,
  AlertTriangle,
  Printer,
  Trash2,
  X,
  AlertCircle,
  TrendingUp,
  Tag,
  DollarSign,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import type { ProductWithStock, Category, Warehouse } from "@/types/database.types";

export default function InventarioPage() {
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Estados de Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [barcodeModalProduct, setBarcodeModalProduct] = useState<ProductWithStock | null>(null);

  // Formulario de Producto
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [costPrice, setCostPrice] = useState<number | string>("");
  const [salePrice, setSalePrice] = useState<number | string>("");
  const [minStock, setMinStock] = useState<number | string>(5);
  const [maxStock, setMaxStock] = useState<number | string>(100);
  const [unitMeasure, setUnitMeasure] = useState("UND");
  const [initialWarehouseId, setInitialWarehouseId] = useState("");
  const [initialStock, setInitialStock] = useState<number | string>(0);
  const [locationShelf, setLocationShelf] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadData = () => {
    startTransition(async () => {
      const [prods, cats, whs] = await Promise.all([
        getProductsAction(),
        getCategoriesAction(),
        getWarehousesAction(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setWarehouses(whs.data);
      if (whs.data.length > 0) {
        setInitialWarehouseId(whs.data[0].id);
      }
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrado reactivo de productos
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.barcode && p.barcode.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory =
        selectedCategory === "ALL" || p.category_id === selectedCategory;

      const matchLowStock = onlyLowStock
        ? Number(p.total_stock) <= Number(p.min_stock)
        : true;

      return matchSearch && matchCategory && matchLowStock;
    });
  }, [products, searchTerm, selectedCategory, onlyLowStock]);

  // Resumen de Métricas de Inventario
  const metrics = useMemo(() => {
    const totalItems = products.length;
    let criticalItems = 0;
    let totalCostValue = 0;
    let totalSaleValue = 0;

    products.forEach((p) => {
      if (Number(p.total_stock) <= Number(p.min_stock)) {
        criticalItems++;
      }
      totalCostValue += Number(p.total_stock) * Number(p.cost_price);
      totalSaleValue += Number(p.total_stock) * Number(p.sale_price);
    });

    return { totalItems, criticalItems, totalCostValue, totalSaleValue };
  }, [products]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    startTransition(async () => {
      const res = await createProductAction({
        sku,
        barcode: barcode || undefined,
        name,
        description: description || undefined,
        categoryId: categoryId || undefined,
        costPrice: Number(costPrice),
        salePrice: Number(salePrice),
        minStock: Number(minStock),
        maxStock: maxStock ? Number(maxStock) : undefined,
        unitMeasure,
        initialWarehouseId: initialWarehouseId || undefined,
        initialStock: Number(initialStock),
        locationShelf: locationShelf || undefined,
      });

      if (res.error) {
        setFormError(res.error);
        toast.error(res.error);
      } else {
        toast.success("Producto creado exitosamente");
        setIsCreateOpen(false);
        // Reset campos
        setSku("");
        setBarcode("");
        setName("");
        setDescription("");
        setCostPrice("");
        setSalePrice("");
        setMinStock(5);
        setMaxStock(100);
        setInitialStock(0);
        setLocationShelf("");
        loadData();
      }
    });
  };

  const handleDeleteProduct = (id: string, prodName: string) => {
    if (confirm(`¿Está seguro de eliminar el producto "${prodName}"?`)) {
      startTransition(async () => {
        const res = await deleteProductAction(id);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Producto eliminado");
          loadData();
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="w-6 h-6 text-indigo-600" />
            Catálogo de Productos e Inventario
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Control de SKU, códigos de barra, márgenes de utilidad y existencias físicas
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </Button>
      </div>

      {/* Resumen de Métricas Rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
            <CardTitle className="text-xs font-medium text-slate-500">
              Total de Productos
            </CardTitle>
            <Package className="w-4 h-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{metrics.totalItems}</div>
            <p className="text-[11px] text-slate-400">Registrados en catálogo</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
            <CardTitle className="text-xs font-medium text-slate-500">
              Stock Crítico / Bajo
            </CardTitle>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-rose-600">
              {metrics.criticalItems}
            </div>
            <p className="text-[11px] text-rose-500">Bajo el mínimo establecido</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
            <CardTitle className="text-xs font-medium text-slate-500">
              Valor Total (Costo)
            </CardTitle>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {formatCurrency(metrics.totalCostValue)}
            </div>
            <p className="text-[11px] text-slate-400">Inversión en mercancía</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
            <CardTitle className="text-xs font-medium text-slate-500">
              Valor Estimado (Venta)
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-emerald-600">
              {formatCurrency(metrics.totalSaleValue)}
            </div>
            <p className="text-[11px] text-slate-400">Retorno proyectado</p>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por Nombre, SKU o Código..."
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">Todas las Categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
              <input
                type="checkbox"
                checked={onlyLowStock}
                onChange={(e) => setOnlyLowStock(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                Solo Bajo Stock ({metrics.criticalItems})
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Productos */}
      <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Producto & Códigos</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Costo / Venta</th>
                <th className="py-3 px-4">Margen</th>
                <th className="py-3 px-4">Stock Actual</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No se encontraron productos que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const marginPercent =
                    p.cost_price > 0
                      ? Math.round(
                          ((p.sale_price - p.cost_price) / p.cost_price) * 100
                        )
                      : 0;

                  const isCritical = Number(p.total_stock) <= Number(p.min_stock);
                  const isOut = Number(p.total_stock) === 0;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-900/60 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white text-sm">
                          {p.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-slate-500 text-[11px] font-mono">
                          <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            SKU: {p.sku}
                          </span>
                          {p.barcode && (
                            <span className="flex items-center gap-1">
                              <BarcodeIcon className="w-3.5 h-3.5 text-slate-400" />
                              {p.barcode}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <Tag className="w-3 h-3 text-indigo-500" />
                          <span>{p.category?.name || "Sin categoría"}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-indigo-700 dark:text-indigo-400">
                          {formatCurrency(p.sale_price)}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Costo: {formatCurrency(p.cost_price)}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40">
                          +{marginPercent}%
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {p.total_stock} {p.unit_measure}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Mínimo: {p.min_stock}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {isOut ? (
                          <Badge variant="destructive">Agotado</Badge>
                        ) : isCritical ? (
                          <Badge variant="warning" className="gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Stock Bajo
                          </Badge>
                        ) : (
                          <Badge variant="success">Óptimo</Badge>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            title="Ver e Imprimir Código de Barras"
                            onClick={() => setBarcodeModalProduct(p)}
                            className="h-8 w-8 p-0"
                          >
                            <BarcodeIcon className="w-4 h-4 text-slate-600" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            title="Eliminar Producto"
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

      {/* Modal: Crear Producto */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                  Registrar Nuevo Producto
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateSubmit}
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
                    Código SKU *
                  </label>
                  <Input
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    placeholder="Ej: ACE-5W30"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Código de Barras (Opcional)
                  </label>
                  <Input
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Ej: 7501000123456"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Nombre del Producto *
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Aceite Sintético 5W-30"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Categoría
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                  >
                    <option value="">Seleccione Categoría</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Unidad de Medida
                  </label>
                  <select
                    value={unitMeasure}
                    onChange={(e) => setUnitMeasure(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                  >
                    <option value="UND">Unidad (UND)</option>
                    <option value="KG">Kilogramo (KG)</option>
                    <option value="GAL">Galón (GAL)</option>
                    <option value="LT">Litro (LT)</option>
                    <option value="JGO">Juego / Kit (JGO)</option>
                    <option value="CAJA">Caja</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Precio de Costo (RD$) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Precio de Venta (RD$) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Stock Mínimo (Alerta)
                  </label>
                  <Input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    placeholder="5"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Stock Máximo
                  </label>
                  <Input
                    type="number"
                    value={maxStock}
                    onChange={(e) => setMaxStock(e.target.value)}
                    placeholder="100"
                  />
                </div>
              </div>

              {/* Inventario Inicial */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-3 border border-slate-200/80 dark:border-slate-700/60">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Existencia Inicial en Almacén
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500">Almacén</label>
                    <select
                      value={initialWarehouseId}
                      onChange={(e) => setInitialWarehouseId(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-xs"
                    >
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500">Cantidad Inicial</label>
                    <Input
                      type="number"
                      value={initialStock}
                      onChange={(e) => setInitialStock(e.target.value)}
                      placeholder="0"
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500">Ubicación / Estante</label>
                    <Input
                      value={locationShelf}
                      onChange={(e) => setLocationShelf(e.target.value)}
                      placeholder="Pasillo A - Est. 2"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isPending ? "Guardando..." : "Guardar Producto"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Visualizador e Impresión de Código de Barras */}
      {barcodeModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center text-center">
            <button
              type="button"
              onClick={() => setBarcodeModalProduct(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Etiqueta de Código de Barras
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Formato optimizado para impresión térmica o etiqueta adhesiva
            </p>

            <Barcode
              value={barcodeModalProduct.barcode || barcodeModalProduct.sku}
              name={barcodeModalProduct.name}
              price={barcodeModalProduct.sale_price}
              className="mb-4 scale-105"
            />

            <div className="flex gap-2 w-full mt-2">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => setBarcodeModalProduct(null)}
              >
                Cerrar
              </Button>
              <Button
                className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700 text-xs"
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
