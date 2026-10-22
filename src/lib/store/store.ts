import { Product, ProductInput, CartItem, Order, OrderItem, CustomerUser, OrderInput } from "@/types/store";

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Auriculares Inalámbricos Pro Noise-Cancelling",
    price: 89.99,
    category: "Electrónica",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    stock: 15,
    createdAt: "2026-10-22T10:00:00.000Z",
    updatedAt: "2026-10-22T10:00:00.000Z",
  },
  {
    id: "prod-2",
    name: "Smartwatch Deportivo Ultra Fit",
    price: 129.50,
    category: "Tecnología",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    stock: 8,
    createdAt: "2026-10-22T10:05:00.000Z",
    updatedAt: "2026-10-22T10:05:00.000Z",
  },
  {
    id: "prod-3",
    name: "Mochila Urbana Impermeable con Puerto USB",
    price: 45.00,
    category: "Accesorios",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    stock: 22,
    createdAt: "2026-10-22T10:10:00.000Z",
    updatedAt: "2026-10-22T10:10:00.000Z",
  },
  {
    id: "prod-4",
    name: "Zapatillas Deportivas Air Runner",
    price: 74.99,
    category: "Calzado",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
    stock: 10,
    createdAt: "2026-10-22T10:15:00.000Z",
    updatedAt: "2026-10-22T10:15:00.000Z",
  },
  {
    id: "prod-5",
    name: "Gafas de Sol Polarizadas Estilo Aviador",
    price: 32.00,
    category: "Moda",
    imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80",
    stock: 4,
    createdAt: "2026-10-22T10:20:00.000Z",
    updatedAt: "2026-10-22T10:20:00.000Z",
  },
];

export const DEFAULT_ORDERS: Order[] = [
  {
    id: "ORD-928410-101",
    customerName: "Carlos Gómez",
    email: "carlos.gomez@gmail.com",
    phone: "+1 809-555-0144",
    address: "Av. Winston Churchill #105, Santo Domingo",
    paymentMethod: "Tarjeta de Crédito / Débito",
    items: [
      {
        productId: "prod-1",
        name: "Auriculares Inalámbricos Pro Noise-Cancelling",
        price: 89.99,
        quantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      },
      {
        productId: "prod-3",
        name: "Mochila Urbana Impermeable con Puerto USB",
        price: 45.00,
        quantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
      },
    ],
    subtotal: 134.99,
    total: 134.99,
    status: "Completada",
    createdAt: "2026-10-22T14:30:00.000Z",
    updatedAt: "2026-10-22T14:30:00.000Z",
  },
  {
    id: "ORD-841920-205",
    customerName: "Mariana Silva",
    email: "mariana.silva@outlook.com",
    phone: "+1 829-555-0199",
    address: "Calle Las Palmas #23, Santiago",
    paymentMethod: "Transferencia Bancaria",
    items: [
      {
        productId: "prod-2",
        name: "Smartwatch Deportivo Ultra Fit",
        price: 129.50,
        quantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
      },
    ],
    subtotal: 129.50,
    total: 129.50,
    status: "Entregada",
    createdAt: "2026-10-22T11:15:00.000Z",
    updatedAt: "2026-10-22T11:15:00.000Z",
  },
  {
    id: "ORD-750183-309",
    customerName: "David Ramírez",
    email: "david.ramirez@hotmail.com",
    phone: "+1 849-555-0182",
    address: "Residencial Bella Vista Edif B Apt 302",
    paymentMethod: "Efectivo contra entrega",
    items: [
      {
        productId: "prod-4",
        name: "Zapatillas Deportivas Air Runner",
        price: 74.99,
        quantity: 2,
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
      },
    ],
    subtotal: 149.98,
    total: 149.98,
    status: "Pendiente",
    createdAt: "2026-10-22T15:45:00.000Z",
    updatedAt: "2026-10-22T15:45:00.000Z",
  },
];

export const DEFAULT_ADMIN_USERNAME = "admin";
export const DEFAULT_ADMIN_PASSWORD = "1234";

const STORAGE_KEYS = {
  PRODUCTS: "mini_tienda_products_v1",
  PASSWORD: "mini_tienda_admin_password_v1",
  AUTH: "mini_tienda_auth_session",
  CART: "mini_tienda_cart_v1",
  ORDERS: "mini_tienda_orders_v1",
  CUSTOMER: "mini_tienda_customer_user_v1",
  HAS_CHOSEN_ACCESS: "mini_tienda_has_chosen_access_v1",
};

export const PRESET_CATEGORIES = [
  "Electrónica",
  "Tecnología",
  "Accesorios",
  "Calzado",
  "Moda",
  "Hogar",
  "Deportes",
];

// Helper to notify other components/tabs
function notifyChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("mini_store_updated"));
  }
}

// Cookie helpers for middleware compatibility
function setCookie(name: string, value: string, days: number = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(";").shift() || "");
  return null;
}

// Product CRUD functions
export function getStoredProducts(): Product[] {
  if (typeof window === "undefined") {
    return DEFAULT_PRODUCTS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length >= 0) {
      return parsed;
    }
    return DEFAULT_PRODUCTS;
  } catch (e) {
    console.error("Error reading products from localStorage:", e);
    return DEFAULT_PRODUCTS;
  }
}

export function saveProducts(products: Product[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    notifyChange();
  } catch (e) {
    console.error("Error saving products to localStorage:", e);
  }
}

export function createProduct(input: ProductInput): Product {
  const products = getStoredProducts();
  const now = new Date().toISOString();
  const newProduct: Product = {
    id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: input.name.trim(),
    price: Number(input.price),
    category: input.category.trim(),
    imageUrl: input.imageUrl.trim(),
    stock: Math.max(0, Math.floor(Number(input.stock))),
    createdAt: now,
    updatedAt: now,
  };

  const updatedList = [newProduct, ...products];
  saveProducts(updatedList);
  return newProduct;
}

export function updateProduct(id: string, input: Partial<ProductInput>): Product | null {
  const products = getStoredProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const current = products[index];
  const updated: Product = {
    ...current,
    name: input.name !== undefined ? input.name.trim() : current.name,
    price: input.price !== undefined ? Number(input.price) : current.price,
    category: input.category !== undefined ? input.category.trim() : current.category,
    imageUrl: input.imageUrl !== undefined ? input.imageUrl.trim() : current.imageUrl,
    stock: input.stock !== undefined ? Math.max(0, Math.floor(Number(input.stock))) : current.stock,
    updatedAt: new Date().toISOString(),
  };

  products[index] = updated;
  saveProducts(products);
  return updated;
}

export function deleteProduct(id: string): boolean {
  const products = getStoredProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  saveProducts(filtered);
  return true;
}

export function resetProductsToDefault(): Product[] {
  saveProducts(DEFAULT_PRODUCTS);
  return DEFAULT_PRODUCTS;
}

// Authentication & Password Management
export function getAdminPassword(): string {
  if (typeof window === "undefined") return DEFAULT_ADMIN_PASSWORD;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PASSWORD);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.PASSWORD, DEFAULT_ADMIN_PASSWORD);
      return DEFAULT_ADMIN_PASSWORD;
    }
    return stored;
  } catch {
    return DEFAULT_ADMIN_PASSWORD;
  }
}

export function verifyAdminCredentials(user: string, pass: string): boolean {
  const expectedUser = DEFAULT_ADMIN_USERNAME.toLowerCase();
  const currentPassword = getAdminPassword();
  return user.trim().toLowerCase() === expectedUser && pass === currentPassword;
}

export function loginAdmin(user: string, pass: string): { success: boolean; error?: string } {
  if (verifyAdminCredentials(user, pass)) {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.AUTH, "authenticated");
      setCookie("mini_store_auth", "authenticated", 7);
      notifyChange();
    }
    return { success: true };
  }
  return { success: false, error: "Credenciales incorrectas. Verifique usuario y contraseña." };
}

export function logoutAdmin(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    deleteCookie("mini_store_auth");
    notifyChange();
  }
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const inStorage = localStorage.getItem(STORAGE_KEYS.AUTH) === "authenticated";
    const inCookie = getCookie("mini_store_auth") === "authenticated";
    return inStorage || inCookie;
  } catch {
    return false;
  }
}

export function changeAdminPassword(
  currentPass: string,
  newPass: string
): { success: boolean; error?: string } {
  const currentStored = getAdminPassword();
  if (currentPass !== currentStored) {
    return { success: false, error: "La contraseña actual no es correcta." };
  }

  if (!newPass || newPass.trim().length < 4) {
    return { success: false, error: "La nueva contraseña debe tener al menos 4 caracteres." };
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.PASSWORD, newPass);
      notifyChange();
      return { success: true };
    } catch {
      return { success: false, error: "Error al guardar la nueva contraseña en el almacenamiento." };
    }
  }

  return { success: true };
}

// -------------------------------------------------------------
// CART & CHECKOUT OPERATIONS (PHASE 2)
// -------------------------------------------------------------

export function getStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CART);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    notifyChange();
  } catch (e) {
    console.error("Error saving cart to localStorage:", e);
  }
}

export function addToCart(product: Product, quantity: number = 1): { success: boolean; message: string } {
  const allProducts = getStoredProducts();
  const freshProduct = allProducts.find((p) => p.id === product.id) || product;

  if (freshProduct.stock <= 0) {
    return { success: false, message: `Lo sentimos, "${freshProduct.name}" está agotado.` };
  }

  const cart = getStoredCart();
  const existingIndex = cart.findIndex((item) => item.product.id === freshProduct.id);

  if (existingIndex > -1) {
    const currentQty = cart[existingIndex].quantity;
    const newQty = currentQty + quantity;

    if (newQty > freshProduct.stock) {
      return {
        success: false,
        message: `Solo quedan ${freshProduct.stock} unidades disponibles en inventario.`,
      };
    }

    cart[existingIndex].quantity = newQty;
    cart[existingIndex].product = freshProduct;
  } else {
    if (quantity > freshProduct.stock) {
      return {
        success: false,
        message: `Solo quedan ${freshProduct.stock} unidades disponibles en inventario.`,
      };
    }
    cart.push({ product: freshProduct, quantity });
  }

  saveCart(cart);
  return { success: true, message: `"${freshProduct.name}" se agregó al carrito.` };
}

export function updateCartQuantity(productId: string, quantity: number): { success: boolean; message?: string } {
  const cart = getStoredCart();
  const itemIndex = cart.findIndex((item) => item.product.id === productId);
  if (itemIndex === -1) return { success: false, message: "Producto no encontrado en el carrito." };

  if (quantity <= 0) {
    cart.splice(itemIndex, 1);
    saveCart(cart);
    return { success: true, message: "Producto eliminado del carrito." };
  }

  const allProducts = getStoredProducts();
  const currentProduct = allProducts.find((p) => p.id === productId);
  const maxStock = currentProduct ? currentProduct.stock : cart[itemIndex].product.stock;

  if (quantity > maxStock) {
    return {
      success: false,
      message: `Stock máximo disponible: ${maxStock} unidades.`,
    };
  }

  cart[itemIndex].quantity = quantity;
  saveCart(cart);
  return { success: true };
}

export function removeFromCart(productId: string): void {
  const cart = getStoredCart();
  const filtered = cart.filter((item) => item.product.id !== productId);
  saveCart(filtered);
}

export function clearCart(): void {
  saveCart([]);
}

export function getStoredOrders(): Order[] {
  if (typeof window === "undefined") return DEFAULT_ORDERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
      return DEFAULT_ORDERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
    return DEFAULT_ORDERS;
  } catch {
    return DEFAULT_ORDERS;
  }
}

export function saveOrders(orders: Order[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    notifyChange();
  } catch (e) {
    console.error("Error saving orders:", e);
  }
}

export function createAdminOrder(data: OrderInput): Order {
  const currentOrders = getStoredOrders();
  const subtotal =
    data.subtotal !== undefined
      ? data.subtotal
      : (data.items || []).reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = data.total !== undefined ? data.total : subtotal;

  const newOrder: Order = {
    id: `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
    customerName: data.customerName.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    address: data.address.trim(),
    paymentMethod: data.paymentMethod || "Efectivo contra entrega",
    items: data.items || [],
    subtotal: Math.round(subtotal * 100) / 100,
    total: Math.round(total * 100) / 100,
    status: data.status || "Completada",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveOrders([newOrder, ...currentOrders]);
  return newOrder;
}

export function updateAdminOrder(id: string, data: Partial<Order>): Order | null {
  const currentOrders = getStoredOrders();
  const index = currentOrders.findIndex((o) => o.id === id);
  if (index === -1) return null;

  const existing = currentOrders[index];
  const items = data.items !== undefined ? data.items : existing.items;
  const subtotal =
    data.subtotal !== undefined
      ? data.subtotal
      : items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = data.total !== undefined ? data.total : subtotal;

  const updated: Order = {
    ...existing,
    ...data,
    items,
    subtotal: Math.round(subtotal * 100) / 100,
    total: Math.round(total * 100) / 100,
    updatedAt: new Date().toISOString(),
  };

  const updatedOrders = [...currentOrders];
  updatedOrders[index] = updated;
  saveOrders(updatedOrders);
  return updated;
}

export function deleteAdminOrder(id: string): boolean {
  const currentOrders = getStoredOrders();
  const filtered = currentOrders.filter((o) => o.id !== id);
  if (filtered.length === currentOrders.length) return false;
  saveOrders(filtered);
  return true;
}

export interface CheckoutInput {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: string;
}

export function processCheckout(input: CheckoutInput): {
  success: boolean;
  order?: Order;
  error?: string;
} {
  const cart = getStoredCart();
  if (cart.length === 0) {
    return { success: false, error: "El carrito de compras está vacío." };
  }

  const allProducts = getStoredProducts();

  for (const item of cart) {
    const prod = allProducts.find((p) => p.id === item.product.id);
    if (!prod) {
      return { success: false, error: `El producto "${item.product.name}" ya no existe.` };
    }
    if (prod.stock < item.quantity) {
      return {
        success: false,
        error: `Stock insuficiente para "${prod.name}". Quedan ${prod.stock} unidades y solicitó ${item.quantity}.`,
      };
    }
  }

  const updatedProducts = allProducts.map((prod) => {
    const cartItem = cart.find((item) => item.product.id === prod.id);
    if (cartItem) {
      const newStock = Math.max(0, prod.stock - cartItem.quantity);
      return {
        ...prod,
        stock: newStock,
        updatedAt: new Date().toISOString(),
      };
    }
    return prod;
  });

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const total = subtotal;

  const orderItems: OrderItem[] = cart.map((item) => ({
    productId: item.product.id,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
    imageUrl: item.product.imageUrl,
  }));

  const order: Order = {
    id: `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
    customerName: input.customerName.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    paymentMethod: input.paymentMethod,
    items: orderItems,
    subtotal: Math.round(subtotal * 100) / 100,
    total: Math.round(total * 100) / 100,
    status: "Completada",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveProducts(updatedProducts);
  const currentOrders = getStoredOrders();
  saveOrders([order, ...currentOrders]);
  clearCart();

  return { success: true, order };
}

// -------------------------------------------------------------
// CUSTOMER AUTH & ACCESS MODE
// -------------------------------------------------------------

export function getStoredCustomer(): CustomerUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCustomer(customer: CustomerUser | null): void {
  if (typeof window === "undefined") return;
  try {
    if (customer) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(customer));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CUSTOMER);
    }
    notifyChange();
  } catch (e) {
    console.error("Error saving customer:", e);
  }
}

export function loginCustomer(name: string, email: string, phone?: string, address?: string): CustomerUser {
  const customer: CustomerUser = {
    name: name.trim(),
    email: email.trim(),
    phone: phone ? phone.trim() : undefined,
    address: address ? address.trim() : undefined,
  };
  saveCustomer(customer);
  return customer;
}

export function logoutCustomer(): void {
  saveCustomer(null);
}
