"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Product, ProductInput, CartItem, Order, CustomerUser, OrderInput } from "@/types/store";
import {
  getStoredProducts,
  createProduct as createProductFn,
  updateProduct as updateProductFn,
  deleteProduct as deleteProductFn,
  resetProductsToDefault as resetProductsFn,
  isAdminAuthenticated,
  loginAdmin,
  logoutAdmin,
  changeAdminPassword,
  getStoredCart,
  addToCart as addToCartFn,
  updateCartQuantity as updateCartQuantityFn,
  removeFromCart as removeFromCartFn,
  clearCart as clearCartFn,
  getStoredOrders,
  createAdminOrder as createAdminOrderFn,
  updateAdminOrder as updateAdminOrderFn,
  deleteAdminOrder as deleteAdminOrderFn,
  processCheckout as processCheckoutFn,
  CheckoutInput,
  getStoredCustomer,
  loginCustomer as loginCustomerFn,
  logoutCustomer as logoutCustomerFn,
} from "./store";

export function useStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const refreshState = useCallback(() => {
    setProducts(getStoredProducts());
    setCart(getStoredCart());
    setOrders(getStoredOrders());
    setCustomerUser(getStoredCustomer());
    setIsAuthenticated(isAdminAuthenticated());
  }, []);

  useEffect(() => {
    refreshState();
    setIsLoaded(true);

    const handleUpdate = () => {
      refreshState();
    };

    window.addEventListener("mini_store_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("mini_store_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [refreshState]);

  // Product CRUD
  const addProduct = useCallback((input: ProductInput) => {
    const created = createProductFn(input);
    refreshState();
    return created;
  }, [refreshState]);

  const editProduct = useCallback((id: string, input: Partial<ProductInput>) => {
    const updated = updateProductFn(id, input);
    refreshState();
    return updated;
  }, [refreshState]);

  const removeProduct = useCallback((id: string) => {
    const success = deleteProductFn(id);
    refreshState();
    return success;
  }, [refreshState]);

  const restoreDefaults = useCallback(() => {
    const list = resetProductsFn();
    refreshState();
    return list;
  }, [refreshState]);

  // Admin Auth
  const login = useCallback((user: string, pass: string) => {
    const res = loginAdmin(user, pass);
    if (res.success) {
      refreshState();
    }
    return res;
  }, [refreshState]);

  const logout = useCallback(() => {
    logoutAdmin();
    refreshState();
  }, [refreshState]);

  const updatePassword = useCallback((currentPass: string, newPass: string) => {
    return changeAdminPassword(currentPass, newPass);
  }, []);

  // Customer Auth
  const loginCustomer = useCallback((name: string, email: string, phone?: string, address?: string) => {
    const user = loginCustomerFn(name, email, phone, address);
    refreshState();
    return user;
  }, [refreshState]);

  const logoutCustomer = useCallback(() => {
    logoutCustomerFn();
    refreshState();
  }, [refreshState]);

  // Cart operations
  const addItemToCart = useCallback((product: Product, quantity: number = 1) => {
    const res = addToCartFn(product, quantity);
    refreshState();
    return res;
  }, [refreshState]);

  const updateItemQuantity = useCallback((productId: string, quantity: number) => {
    const res = updateCartQuantityFn(productId, quantity);
    refreshState();
    return res;
  }, [refreshState]);

  const removeItemFromCart = useCallback((productId: string) => {
    removeFromCartFn(productId);
    refreshState();
  }, [refreshState]);

  const emptyCart = useCallback(() => {
    clearCartFn();
    refreshState();
  }, [refreshState]);

  const performCheckout = useCallback((input: CheckoutInput) => {
    const res = processCheckoutFn(input);
    refreshState();
    return res;
  }, [refreshState]);

  // Order Admin operations
  const createOrder = useCallback((input: OrderInput) => {
    const created = createAdminOrderFn(input);
    refreshState();
    return created;
  }, [refreshState]);

  const editOrder = useCallback((id: string, input: Partial<Order>) => {
    const updated = updateAdminOrderFn(id, input);
    refreshState();
    return updated;
  }, [refreshState]);

  const removeOrder = useCallback((id: string) => {
    const success = deleteAdminOrderFn(id);
    refreshState();
    return success;
  }, [refreshState]);

  // Calculated properties
  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  return {
    products,
    cart,
    orders,
    cartTotal,
    cartCount,
    customerUser,
    isAuthenticated,
    isLoaded,
    addProduct,
    editProduct,
    removeProduct,
    restoreDefaults,
    login,
    logout,
    updatePassword,
    loginCustomer,
    logoutCustomer,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    emptyCart,
    performCheckout,
    createOrder,
    editOrder,
    removeOrder,
    refreshState,
  };
}
