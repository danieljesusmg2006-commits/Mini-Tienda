"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store/useStore";
import { Product, ProductInput, Order, OrderStatus, OrderItem } from "@/types/store";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProductStats } from "@/components/admin/ProductStats";
import { ProductModal } from "@/components/admin/ProductModal";
import { DeleteProductModal } from "@/components/admin/DeleteProductModal";
import { ChangePasswordModal } from "@/components/admin/ChangePasswordModal";
import { OrdersManager } from "@/components/admin/OrdersManager";
import { OrderModal } from "@/components/admin/OrderModal";
import { OrderDetailModal } from "@/components/admin/OrderDetailModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  RotateCcw,
  Package,
  Layers,
  Sparkles,
  AlertCircle,
  SlidersHorizontal,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const router = useRouter();
  const {
    products,
    orders,
    isAuthenticated,
    isLoaded,
    addProduct,
    editProduct,
    removeProduct,
    restoreDefaults,
    logout,
    updatePassword,
    createOrder,
    editOrder,
    removeOrder,
  } = useStore();

  // Authentication check
  useEffect(() => {
    if (isLoaded && !isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isLoaded, isAuthenticated, router]);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Order Modal States
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<Order | null>(null);

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("TODAS");
  const [stockFilter, setStockFilter] = useState<"ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK">("ALL");

  // Unique categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory =
        selectedCategory === "TODAS" ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();

      // Stock filter
      let matchesStock = true;
      if (stockFilter === "IN_STOCK") matchesStock = item.stock > 5;
      else if (stockFilter === "LOW_STOCK") matchesStock = item.stock > 0 && item.stock <= 5;
      else if (stockFilter === "OUT_OF_STOCK") matchesStock = item.stock === 0;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, selectedCategory, stockFilter]);

  // CRUD Handlers
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (data: ProductInput) => {
    if (editingProduct) {
      editProduct(editingProduct.id, data);
      toast.success("Producto actualizado", {
        description: `Se han guardado los cambios para "${data.name}".`,
      });
    } else {
      addProduct(data);
      toast.success("Producto creado", {
        description: `"${data.name}" se agregó al catálogo de la tienda.`,
      });
    }
  };

  const handleOpenDeleteModal = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingProduct) {
      removeProduct(deletingProduct.id);
      toast.error("Producto eliminado", {
        description: `Se eliminó "${deletingProduct.name}" del catálogo.`,
      });
      setIsDeleteModalOpen(false);
      setDeletingProduct(null);
    }
  };

  const handleRestoreDefaults = () => {
    if (window.confirm("¿Restaurar los 5 productos iniciales del catálogo? Se restablecerá la configuración de demostración.")) {
      restoreDefaults();
      toast.info("Catálogo restaurado", {
        description: "Se han recargado los 5 productos iniciales predeterminados.",
      });
    }
  };

  // Order CRUD Handlers
  const handleOpenCreateOrder = () => {
    setEditingOrder(null);
    setIsOrderModalOpen(true);
  };

  const handleOpenEditOrder = (order: Order) => {
    setEditingOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleOpenOrderDetail = (order: Order) => {
    setSelectedDetailOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleSaveOrder = (data: {
    customerName: string;
    email: string;
    phone: string;
    address: string;
    paymentMethod: string;
    status: OrderStatus;
    items: OrderItem[];
    subtotal: number;
    total: number;
  }) => {
    if (editingOrder) {
      editOrder(editingOrder.id, data);
      toast.success("Venta modificada con éxito", {
        description: `Se han actualizado los datos de la venta "${editingOrder.id}".`,
      });
      if (selectedDetailOrder && selectedDetailOrder.id === editingOrder.id) {
        setSelectedDetailOrder({ ...editingOrder, ...data });
      }
    } else {
      const created = createOrder(data);
      toast.success("Nueva venta registrada", {
        description: `Se registró la venta "${created.id}" por $${created.total.toFixed(2)}.`,
      });
    }
  };

  const handleDeleteOrder = (order: Order) => {
    if (window.confirm(`¿Está seguro de eliminar la venta con ID "${order.id}" de ${order.customerName}? Esta acción no se puede deshacer.`)) {
      removeOrder(order.id);
      toast.error("Venta eliminada", {
        description: `La orden "${order.id}" fue eliminada del sistema.`,
      });
      if (selectedDetailOrder && selectedDetailOrder.id === order.id) {
        setIsDetailModalOpen(false);
        setSelectedDetailOrder(null);
      }
    }
  };

  if (!isLoaded || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Verificando sesión administrativa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors">
      {/* Header */}
      <AdminHeader
        onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
        onLogout={logout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "products"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Catálogo de Productos</span>
            <Badge
              variant="secondary"
              className={`text-[10px] ml-1 px-1.5 py-0.2 ${
                activeTab === "products"
                  ? "bg-indigo-700 text-white border-transparent"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {products.length}
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "orders"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Buscador & Gestión de Ventas</span>
            <Badge
              variant="secondary"
              className={`text-[10px] ml-1 px-1.5 py-0.2 ${
                activeTab === "orders"
                  ? "bg-indigo-700 text-white border-transparent"
                  : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
              }`}
            >
              {orders.length}
            </Badge>
          </button>
        </div>

        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Title & Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Gestión de Catálogo (CRUD)
              </h2>
              <Badge variant="outline" className="text-[11px] text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 font-semibold">
                Fase 1 Activa
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Administre el inventario: cree, visualice, edite y elimine productos en tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestoreDefaults}
              className="text-xs gap-1.5 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-2xs"
              title="Restaurar catálogo inicial"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">Restaurar Iniciales</span>
            </Button>

            <Button
              size="sm"
              onClick={handleOpenCreateModal}
              className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </Button>
          </div>
        </div>

        {/* Inventory Statistics */}
        <ProductStats products={products} />

        {/* Toolbar: Search & Filters */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o categoría..."
                className="pl-9 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus-visible:ring-indigo-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Selector */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="TODAS">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Selector */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">Todo el stock</option>
                <option value="IN_STOCK">En stock (&gt; 5)</option>
                <option value="LOW_STOCK">Stock bajo (1 - 5)</option>
                <option value="OUT_OF_STOCK">Agotados (0)</option>
              </select>
            </div>
          </div>

          {/* Quick Category Pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            <span className="text-slate-400 dark:text-slate-500 font-medium mr-1">Filtro rápido:</span>
            <button
              type="button"
              onClick={() => setSelectedCategory("TODAS")}
              className={`px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                selectedCategory === "TODAS"
                  ? "bg-indigo-600 text-white border-indigo-600 font-semibold"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Todas ({products.length})
            </button>
            {categories.map((cat) => {
              const count = products.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 font-semibold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Table / Cards */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                <Package className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">No se encontraron productos</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                No hay productos que coincidan con los filtros aplicados. Intente restablecer la búsqueda o agregue un nuevo producto.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("TODAS");
                    setStockFilter("ALL");
                  }}
                  className="text-xs dark:border-slate-700 dark:text-slate-200"
                >
                  Limpiar Filtros
                </Button>
                <Button
                  size="sm"
                  onClick={handleOpenCreateModal}
                  className="text-xs bg-indigo-600 text-white"
                >
                  Crear Producto
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Producto</th>
                    <th className="py-3.5 px-4">Categoría</th>
                    <th className="py-3.5 px-4">Precio</th>
                    <th className="py-3.5 px-4">Stock</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredProducts.map((product) => {
                    const isOutOfStock = product.stock === 0;
                    const isLowStock = product.stock > 0 && product.stock <= 5;

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        {/* Image & Name */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback image on error
                                  (e.target as HTMLImageElement).src =
                                    "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&auto=format&fit=crop&q=80";
                                }}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {product.name}
                              </p>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                                ID: {product.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {product.category}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            ${product.price.toFixed(2)}
                          </span>
                        </td>

                        {/* Stock status */}
                        <td className="py-3.5 px-4">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                              Agotado (0)
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Bajo stock ({product.stock} unids)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {product.stock} disponibles
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEditModal(product)}
                              className="h-8 px-2.5 text-xs text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 shadow-2xs"
                              title="Editar producto"
                            >
                              <Pencil className="w-3.5 h-3.5 mr-1 text-slate-500 dark:text-slate-400" />
                              <span>Editar</span>
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDeleteModal(product)}
                              className="h-8 px-2.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 shadow-2xs"
                              title="Eliminar producto"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
                              <span>Eliminar</span>
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

          {/* Footer of Table */}
          <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Mostrando <strong>{filteredProducts.length}</strong> de{" "}
              <strong>{products.length}</strong> productos registrados
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Datos sincronizados en tiempo real
            </span>
          </div>
        </div>
      </div>
    )}

    {/* Orders Management View */}
    {activeTab === "orders" && (
      <OrdersManager
        orders={orders}
        onOpenCreateOrder={handleOpenCreateOrder}
        onOpenEditOrder={handleOpenEditOrder}
        onOpenDetail={handleOpenOrderDetail}
        onDeleteOrder={handleDeleteOrder}
      />
    )}
  </main>

  {/* Modals */}
  <ProductModal
    isOpen={isProductModalOpen}
    onClose={() => setIsProductModalOpen(false)}
    onSave={handleSaveProduct}
    initialProduct={editingProduct}
  />

  <DeleteProductModal
    isOpen={isDeleteModalOpen}
    product={deletingProduct}
    onClose={() => setIsDeleteModalOpen(false)}
    onConfirm={handleConfirmDelete}
  />

  <ChangePasswordModal
    isOpen={isPasswordModalOpen}
    onClose={() => setIsPasswordModalOpen(false)}
    onPasswordChange={updatePassword}
  />

  <OrderModal
    isOpen={isOrderModalOpen}
    onClose={() => setIsOrderModalOpen(false)}
    onSave={handleSaveOrder}
    initialOrder={editingOrder}
    availableProducts={products}
  />

  <OrderDetailModal
    isOpen={isDetailModalOpen}
    order={selectedDetailOrder}
    onClose={() => setIsDetailModalOpen(false)}
    onEdit={(order) => {
      setIsDetailModalOpen(false);
      handleOpenEditOrder(order);
    }}
  />
    </div>
  );
}
