"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store/useStore";
import { StoreHeader } from "@/components/store/StoreHeader";
import { ProductCard } from "@/components/store/ProductCard";
import { CartDrawer } from "@/components/store/CartDrawer";
import { CheckoutModal } from "@/components/store/CheckoutModal";
import { WelcomeModal } from "@/components/store/WelcomeModal";
import { CustomerOrdersModal } from "@/components/store/CustomerOrdersModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  PackageX,
  Truck,
  ArrowRight,
  Clock,
  History,
  Trash2,
  AlertTriangle,
} from "lucide-react";

export default function PublicStorePage() {
  const {
    products,
    cart,
    cartTotal,
    cartCount,
    customerUser,
    myPurchases,
    searchHistory,
    addSearchQuery,
    clearSearches,
    loginCustomer,
    logoutCustomer,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    emptyCart,
    performCheckout,
  } = useStore();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("TODAS");
  const [sortOrder, setSortOrder] = useState<"featured" | "price-asc" | "price-desc" | "name">("featured");

  // Modals State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(true);
  const [isPurchasesOpen, setIsPurchasesOpen] = useState(false);
  const [showGuestBanner, setShowGuestBanner] = useState(true);

  const handleSelectGuest = () => {
    setIsWelcomeOpen(false);
  };

  const handleLoginCustomer = (name: string, email: string) => {
    loginCustomer(name, email);
    setIsWelcomeOpen(false);
  };

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = products.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "TODAS" ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });

    if (sortOrder === "price-asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortOrder === "price-desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortOrder === "name") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, searchTerm, selectedCategory, sortOrder]);

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 transition-colors">
      {/* Header */}
      <StoreHeader
        cartCount={cartCount}
        cartTotal={cartTotal}
        customerUser={customerUser}
        purchasesCount={myPurchases.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenPurchases={() => setIsPurchasesOpen(true)}
        onOpenWelcome={() => setIsWelcomeOpen(true)}
        onLogoutCustomer={logoutCustomer}
      />

      {/* Guest Mode Warning Notification Banner */}
      {!customerUser && showGuestBanner && (
        <div className="bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-300/40 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 px-4 py-2.5 text-xs transition-colors">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <p className="text-xs">
                <strong className="font-semibold">Modo Invitado Activo:</strong> Al cerrar la página, todas tus compras y búsquedas se eliminarán.{" "}
                <button
                  type="button"
                  onClick={() => setIsWelcomeOpen(true)}
                  className="font-bold underline hover:text-amber-700 dark:hover:text-amber-100 ml-1 cursor-pointer"
                >
                  Inicia sesión para conservarlas permanentemente →
                </button>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowGuestBanner(false)}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-white text-xs px-2 py-0.5 rounded cursor-pointer"
              title="Ocultar aviso"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-xs font-semibold text-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>
                {customerUser
                  ? `Conectado como: ${customerUser.name}`
                  : "Modo Invitado Activo"}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Encuentra lo que necesitas con entrega inmediata
            </h1>
            <p className="text-sm text-indigo-200 leading-relaxed">
              Explora nuestro catálogo precargado, agrega productos al carrito con cálculo en tiempo real y realiza tu compra con checkout integrado en la misma página.
            </p>
          </div>

          {/* Highlights & Admin Shortcut */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-indigo-100 flex items-center gap-3">
              <Truck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Envío Gratuito</p>
                <p className="text-[11px] text-indigo-200">En todas tus compras</p>
              </div>
            </div>

            <Link href="/admin">
              <div className="p-3.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-950/90 transition-colors border border-indigo-500/40 text-xs text-indigo-200 flex items-center justify-between gap-3 group cursor-pointer">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>¿Eres administrador? Gestionar CRUD</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Store Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Search, Category Filters & Sort Controls */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchTerm.trim()) {
                    addSearchQuery(searchTerm.trim());
                  }
                }}
                onBlur={() => {
                  if (searchTerm.trim()) {
                    addSearchQuery(searchTerm.trim());
                  }
                }}
                placeholder="Buscar por nombre de producto o categoría... (Presione Enter para buscar)"
                className="pl-10 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus-visible:ring-indigo-500 h-10"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="featured">Destacados</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="name">Nombre: A - Z</option>
              </select>
            </div>
          </div>

          {/* Recent Searches Chips */}
          {searchHistory.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
              <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 font-medium mr-1">
                <History className="w-3.5 h-3.5" />
                <span>Búsquedas recientes:</span>
              </div>
              {searchHistory.map((query, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSearchTerm(query)}
                  className={`px-2.5 py-0.5 rounded-full border text-[11px] transition-colors cursor-pointer ${
                    searchTerm.toLowerCase() === query.toLowerCase()
                      ? "bg-indigo-600 text-white border-indigo-600 font-bold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                  title="Haga clic para buscar este término"
                >
                  {query}
                </button>
              ))}

              <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">
                {customerUser
                  ? "• Guardadas en tu cuenta"
                  : "• Temporales (se borrarán al cerrar la página)"}
              </span>

              <button
                type="button"
                onClick={clearSearches}
                className="text-slate-400 hover:text-rose-500 ml-auto p-1 cursor-pointer transition-colors"
                title="Limpiar historial de búsquedas"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 dark:text-slate-500 font-medium mr-1 text-[11px] shrink-0">
              Categorías:
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory("TODAS")}
              className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer shrink-0 font-medium ${
                selectedCategory === "TODAS"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
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
                  className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer shrink-0 font-medium ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Info Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span>
            Mostrando <strong>{filteredProducts.length}</strong> de{" "}
            <strong>{products.length}</strong> productos disponibles
          </span>

          {(searchTerm || selectedCategory !== "TODAS") && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("TODAS");
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline font-medium cursor-pointer"
            >
              Limpiar filtros de búsqueda
            </button>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center space-y-3 transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <PackageX className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">No encontramos productos</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              No hay productos que coincidan con &quot;{searchTerm || selectedCategory}&quot;. Intenta con otro término o limpia los filtros.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("TODAS");
              }}
              className="text-xs mt-2 dark:border-slate-700 dark:text-slate-200"
            >
              Restablecer Filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filteredProducts.map((product) => {
              const inCartItem = cart.find((item) => item.product.id === product.id);
              const quantityInCart = inCartItem ? inCartItem.quantity : 0;

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantityInCart={quantityInCart}
                  onAddToCart={addItemToCart}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Cart Button for Mobile */}
      {cartCount > 0 && (
        <div className="fixed bottom-5 right-5 z-40 sm:hidden">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-full shadow-xl shadow-indigo-600/30 cursor-pointer font-bold text-xs"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Ver Carrito ({cartCount})</span>
            <span className="font-extrabold border-l border-indigo-400 pl-2">
              ${cartTotal.toFixed(2)}
            </span>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 mt-12 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2 transition-colors">
        <p className="font-semibold text-slate-700 dark:text-slate-300">Mini Tienda Digital • Catálogo y Comercio Electrónico</p>
        <p className="text-slate-400 dark:text-slate-500">
          Desarrollado exclusivamente con PNPM y Next.js • Panel Administrativo protegido & Tienda Pública integrada
        </p>
        <div className="pt-2">
          <Link href="/admin" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Acceso Superusuario al Panel Administrativo →
          </Link>
        </div>
      </footer>

      {/* Slide-over Shopping Cart */}
      <CartDrawer
        isOpen={isCartOpen}
        cart={cart}
        cartTotal={cartTotal}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={updateItemQuantity}
        onRemoveItem={removeItemFromCart}
        onClearCart={emptyCart}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* In-page Integrated Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        cart={cart}
        cartTotal={cartTotal}
        customerUser={customerUser}
        onClose={() => setIsCheckoutOpen(false)}
        onConfirmCheckout={performCheckout}
      />

      {/* Welcome Gateway Modal (Guest / Sign In / Admin separated) */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        onClose={() => setIsWelcomeOpen(false)}
        onSelectGuest={handleSelectGuest}
        onLoginCustomer={handleLoginCustomer}
      />

      {/* Customer / Guest Orders Modal */}
      <CustomerOrdersModal
        isOpen={isPurchasesOpen}
        onClose={() => setIsPurchasesOpen(false)}
        orders={myPurchases}
        customerUser={customerUser}
        onOpenLogin={() => setIsWelcomeOpen(true)}
      />
    </div>
  );
}
