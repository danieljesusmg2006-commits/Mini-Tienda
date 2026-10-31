import { Product, ProductInput, CartItem, Order, OrderItem, CustomerUser, OrderInput, ChatMessage, OrderChat, ChatSenderRole } from "@/types/store";

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Auriculares Inalámbricos Pro Noise-Cancelling",
    price: 89.99,
    category: "Electrónica",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    stock: 15,
    description: "Auriculares inalámbricos con cancelación activa de ruido (ANC) híbrida, audio espacial de alta fidelidad y hasta 40 horas de reproducción continua. Cuentan con almohadillas ergonómicas de espuma viscoelástica para máxima comodidad durante todo el día y micrófono con claridad cristalina para llamadas.",
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
    description: "Reloj inteligente resistente al agua 5 ATM con pantalla AMOLED táctil de 1.4 pulgadas siempre activa. Incluye sensor de frecuencia cardíaca 24/7, monitor de oxígeno en sangre (SpO2), GPS integrado de alta precisión y más de 90 modos de entrenamiento personalizados.",
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
    description: "Mochila ergonómica de diseño moderno fabricada con tela Oxford de alta densidad resistente al agua y a los arañazos. Cuenta con compartimento acolchado para laptops de hasta 15.6 pulgadas, puerto de carga USB externo y múltiples bolsillos organizadores de seguridad.",
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
    description: "Calzado deportivo de alto rendimiento con entresuela de espuma reactiva que ofrece una amortiguación ultra suave y retorno de energía en cada pisada. Suela de caucho antideslizante con agarre superior y tejido de malla transpirable para mantener los pies frescos.",
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
    description: "Gafas de sol de estilo aviador clásico con lentes polarizadas de protección UV400 completa que eliminan el deslumbramiento y protegen tus ojos del sol. Montura de aleación metálica ultraligera, resistente a la corrosión y almohadillas nasales de silicona ajustables.",
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
  GUEST_SEARCHES: "mini_tienda_guest_searches_session",
  GUEST_ORDERS: "mini_tienda_guest_orders_session",
  ACCOUNT_SEARCHES_PREFIX: "mini_tienda_account_searches_",
  ACCOUNT_ORDERS_PREFIX: "mini_tienda_account_orders_",
  CHATS: "mini_tienda_order_chats_v1",
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
    description: input.description?.trim() || "",
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
    description: input.description !== undefined ? input.description.trim() : current.description,
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

  const customer = getStoredCustomer();
  const isGuest = !customer;
  const customerEmail = customer ? customer.email.trim().toLowerCase() : undefined;

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
    isGuest,
    customerEmail,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveProducts(updatedProducts);
  const currentOrders = getStoredOrders();
  saveOrders([order, ...currentOrders]);

  // Save to customer's permanent order list OR guest's temporary session
  saveMyPurchase(order);

  clearCart();

  return { success: true, order };
}

// -------------------------------------------------------------
// SEARCH HISTORY (Guest: SessionStorage / Account: LocalStorage)
// -------------------------------------------------------------

export function getStoredSearchHistory(): string[] {
  if (typeof window === "undefined") return [];
  const customer = getStoredCustomer();
  try {
    if (customer && customer.email) {
      // Permanent in localStorage
      const key = `${STORAGE_KEYS.ACCOUNT_SEARCHES_PREFIX}${customer.email.toLowerCase().trim()}`;
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } else {
      // Temporary in sessionStorage (wiped on closing tab/browser)
      const raw = sessionStorage.getItem(STORAGE_KEYS.GUEST_SEARCHES);
      return raw ? JSON.parse(raw) : [];
    }
  } catch {
    return [];
  }
}

export function addSearchQueryToHistory(query: string): string[] {
  if (typeof window === "undefined" || !query || !query.trim()) return [];
  const trimmed = query.trim();
  const customer = getStoredCustomer();
  const current = getStoredSearchHistory();
  const updated = [trimmed, ...current.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 10);

  try {
    if (customer && customer.email) {
      const key = `${STORAGE_KEYS.ACCOUNT_SEARCHES_PREFIX}${customer.email.toLowerCase().trim()}`;
      localStorage.setItem(key, JSON.stringify(updated));
    } else {
      sessionStorage.setItem(STORAGE_KEYS.GUEST_SEARCHES, JSON.stringify(updated));
    }
    notifyChange();
  } catch (e) {
    console.error("Error saving search history:", e);
  }
  return updated;
}

export function clearSearchHistory(): void {
  if (typeof window === "undefined") return;
  const customer = getStoredCustomer();
  try {
    if (customer && customer.email) {
      const key = `${STORAGE_KEYS.ACCOUNT_SEARCHES_PREFIX}${customer.email.toLowerCase().trim()}`;
      localStorage.removeItem(key);
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.GUEST_SEARCHES);
    }
    notifyChange();
  } catch (e) {
    console.error("Error clearing search history:", e);
  }
}

// -------------------------------------------------------------
// USER PURCHASES (Guest: SessionStorage / Account: LocalStorage)
// -------------------------------------------------------------

export function getMyPurchases(): Order[] {
  if (typeof window === "undefined") return [];
  const customer = getStoredCustomer();
  try {
    if (customer && customer.email) {
      // Permanent account purchases in localStorage
      const key = `${STORAGE_KEYS.ACCOUNT_ORDERS_PREFIX}${customer.email.toLowerCase().trim()}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw);
      }
      // Fallback matching customer email from all store orders
      const allOrders = getStoredOrders();
      const userOrders = allOrders.filter(
        (o) =>
          o.email?.toLowerCase().trim() === customer.email.toLowerCase().trim() ||
          o.customerEmail?.toLowerCase().trim() === customer.email.toLowerCase().trim()
      );
      if (userOrders.length > 0) {
        localStorage.setItem(key, JSON.stringify(userOrders));
      }
      return userOrders;
    } else {
      // Guest: stored in sessionStorage (cleared when closing tab / browser)
      const raw = sessionStorage.getItem(STORAGE_KEYS.GUEST_ORDERS);
      return raw ? JSON.parse(raw) : [];
    }
  } catch {
    return [];
  }
}

export function saveMyPurchase(order: Order): void {
  if (typeof window === "undefined") return;
  const customer = getStoredCustomer();
  try {
    if (customer && customer.email) {
      const key = `${STORAGE_KEYS.ACCOUNT_ORDERS_PREFIX}${customer.email.toLowerCase().trim()}`;
      const existing = getMyPurchases();
      const updated = [order, ...existing.filter((o) => o.id !== order.id)];
      localStorage.setItem(key, JSON.stringify(updated));
    } else {
      const existing = getMyPurchases();
      const updated = [order, ...existing.filter((o) => o.id !== order.id)];
      sessionStorage.setItem(STORAGE_KEYS.GUEST_ORDERS, JSON.stringify(updated));
    }
    notifyChange();
  } catch (e) {
    console.error("Error saving my purchase:", e);
  }
}

export function clearGuestSessionData(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEYS.GUEST_SEARCHES);
    sessionStorage.removeItem(STORAGE_KEYS.GUEST_ORDERS);
    notifyChange();
  } catch (e) {
    console.error("Error clearing guest session data:", e);
  }
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

  // Migrate any guest session searches and orders into this customer account!
  try {
    const guestOrdersRaw = sessionStorage.getItem(STORAGE_KEYS.GUEST_ORDERS);
    if (guestOrdersRaw) {
      const guestOrders: Order[] = JSON.parse(guestOrdersRaw);
      if (guestOrders.length > 0) {
        const key = `${STORAGE_KEYS.ACCOUNT_ORDERS_PREFIX}${customer.email.toLowerCase().trim()}`;
        const rawExisting = localStorage.getItem(key);
        const existing: Order[] = rawExisting ? JSON.parse(rawExisting) : [];
        const merged = [...guestOrders, ...existing.filter((e) => !guestOrders.some((g) => g.id === e.id))];
        localStorage.setItem(key, JSON.stringify(merged));
        sessionStorage.removeItem(STORAGE_KEYS.GUEST_ORDERS);
      }
    }

    const guestSearchesRaw = sessionStorage.getItem(STORAGE_KEYS.GUEST_SEARCHES);
    if (guestSearchesRaw) {
      const guestSearches: string[] = JSON.parse(guestSearchesRaw);
      if (guestSearches.length > 0) {
        const key = `${STORAGE_KEYS.ACCOUNT_SEARCHES_PREFIX}${customer.email.toLowerCase().trim()}`;
        const rawExisting = localStorage.getItem(key);
        const existing: string[] = rawExisting ? JSON.parse(rawExisting) : [];
        const merged = Array.from(new Set([...guestSearches, ...existing])).slice(0, 10);
        localStorage.setItem(key, JSON.stringify(merged));
        sessionStorage.removeItem(STORAGE_KEYS.GUEST_SEARCHES);
      }
    }
  } catch (e) {
    console.error("Error migrating guest data to customer account:", e);
  }

  notifyChange();
  return customer;
}

export function logoutCustomer(): void {
  saveCustomer(null);
  notifyChange();
}

// ==========================================
// INTERNAL CHAT SYSTEM (SELLER <-> BUYER)
// ==========================================

export const DEFAULT_CHATS: Record<string, OrderChat> = {
  "ORD-928410-101": {
    orderId: "ORD-928410-101",
    customerName: "Carlos Gómez",
    customerEmail: "carlos.gomez@gmail.com",
    customerPhone: "+1 809-555-0143",
    messages: [
      {
        id: "msg-101-1",
        orderId: "ORD-928410-101",
        sender: "seller",
        senderName: "Soporte Mini Tienda",
        text: "¡Hola Carlos! Tu orden ha sido recibida y confirmada. ¿Tienes alguna pregunta sobre la entrega?",
        createdAt: "2026-10-22T10:35:00.000Z",
        readByCustomer: true,
        readBySeller: true,
      },
      {
        id: "msg-101-2",
        orderId: "ORD-928410-101",
        sender: "customer",
        senderName: "Carlos Gómez",
        text: "¡Hola! Quisiera saber si pueden entregar en horas de la tarde, después de las 2 PM.",
        createdAt: "2026-10-22T11:00:00.000Z",
        readByCustomer: true,
        readBySeller: false,
      },
    ],
    lastMessage: "¡Hola! Quisiera saber si pueden entregar en horas de la tarde, después de las 2 PM.",
    lastMessageAt: "2026-10-22T11:00:00.000Z",
    unreadForAdmin: 1,
    unreadForCustomer: 0,
  },
};

export function getStoredChats(): Record<string, OrderChat> {
  if (typeof window === "undefined") return DEFAULT_CHATS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHATS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(DEFAULT_CHATS));
      return DEFAULT_CHATS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading stored chats:", e);
    return DEFAULT_CHATS;
  }
}

export function saveStoredChats(chats: Record<string, OrderChat>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
  } catch (e) {
    console.error("Error saving stored chats:", e);
  }
}

export function getOrderChat(orderId: string): OrderChat | null {
  const chats = getStoredChats();
  return chats[orderId] || null;
}

export function getOrCreateOrderChat(
  orderId: string,
  customerName: string = "Cliente",
  customerEmail?: string,
  customerPhone?: string,
  extra?: {
    chatType?: "PURCHASE" | "INQUIRY";
    productId?: string;
    productName?: string;
    productPrice?: number;
    productImageUrl?: string;
  }
): OrderChat {
  const chats = getStoredChats();
  if (chats[orderId]) {
    if (extra?.chatType) chats[orderId].chatType = extra.chatType;
    if (extra?.productId) chats[orderId].productId = extra.productId;
    if (extra?.productName) chats[orderId].productName = extra.productName;
    if (extra?.productPrice) chats[orderId].productPrice = extra.productPrice;
    if (extra?.productImageUrl) chats[orderId].productImageUrl = extra.productImageUrl;
    return chats[orderId];
  }

  const isInquiry = extra?.chatType === "INQUIRY" || orderId.startsWith("INQ-");
  const welcomeText = isInquiry
    ? `¡Hola ${customerName}! 👋 Gracias por tu interés en "${extra?.productName || 'nuestros productos'}". Si tienes alguna duda sobre especificaciones, disponibilidad o entrega, déjanos tu consulta aquí y te responderemos enseguida.`
    : `¡Hola ${customerName}! 👋 Gracias por tu compra con ID #${orderId}. Si tienes alguna duda sobre tu pedido o deseas consultar el estado de tu entrega, déjanos tu mensaje aquí y te responderemos enseguida.`;

  // Create new chat with welcome message from seller
  const initialMessage: ChatMessage = {
    id: `msg-${orderId}-${Date.now()}`,
    orderId,
    sender: "seller",
    senderName: "Soporte Mini Tienda",
    text: welcomeText,
    createdAt: new Date().toISOString(),
    readByCustomer: false,
    readBySeller: true,
  };

  const newChat: OrderChat = {
    orderId,
    chatType: isInquiry ? "INQUIRY" : "PURCHASE",
    productId: extra?.productId,
    productName: extra?.productName,
    productPrice: extra?.productPrice,
    productImageUrl: extra?.productImageUrl,
    customerName,
    customerEmail,
    customerPhone,
    messages: [initialMessage],
    lastMessage: initialMessage.text,
    lastMessageAt: initialMessage.createdAt,
    unreadForAdmin: 0,
    unreadForCustomer: 1,
  };

  chats[orderId] = newChat;
  saveStoredChats(chats);
  notifyChange();
  return newChat;
}

export function sendChatMessage(
  orderId: string,
  sender: ChatSenderRole,
  senderName: string,
  text: string,
  customerMeta?: {
    name?: string;
    email?: string;
    phone?: string;
    chatType?: "PURCHASE" | "INQUIRY";
    productId?: string;
    productName?: string;
    productPrice?: number;
    productImageUrl?: string;
  }
): ChatMessage {
  const chats = getStoredChats();
  let chat = chats[orderId];

  if (!chat) {
    chat = getOrCreateOrderChat(
      orderId,
      customerMeta?.name || senderName,
      customerMeta?.email,
      customerMeta?.phone,
      customerMeta
    );
  }

  const cleanText = text.trim();
  const existingDup = (chat.messages || []).find(
    (m) =>
      m.sender === sender &&
      m.text.trim() === cleanText &&
      Math.abs(Date.now() - new Date(m.createdAt).getTime()) < 3000
  );
  if (existingDup) {
    return existingDup;
  }

  const newMessage: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    orderId,
    sender,
    senderName,
    text: cleanText,
    createdAt: new Date().toISOString(),
    readByCustomer: sender === "customer",
    readBySeller: sender === "seller",
  };

  chat.messages.push(newMessage);
  chat.lastMessage = newMessage.text;
  chat.lastMessageAt = newMessage.createdAt;
  if (customerMeta?.name) chat.customerName = customerMeta.name;
  if (customerMeta?.email) chat.customerEmail = customerMeta.email;
  if (customerMeta?.phone) chat.customerPhone = customerMeta.phone;
  if (customerMeta?.chatType) chat.chatType = customerMeta.chatType;
  if (customerMeta?.productId) chat.productId = customerMeta.productId;
  if (customerMeta?.productName) chat.productName = customerMeta.productName;
  if (customerMeta?.productPrice) chat.productPrice = customerMeta.productPrice;
  if (customerMeta?.productImageUrl) chat.productImageUrl = customerMeta.productImageUrl;

  // Recalculate unread counts
  chat.unreadForAdmin = chat.messages.filter(
    (m) => m.sender === "customer" && !m.readBySeller
  ).length;
  chat.unreadForCustomer = chat.messages.filter(
    (m) => m.sender === "seller" && !m.readByCustomer
  ).length;

  chats[orderId] = chat;
  saveStoredChats(chats);
  notifyChange();
  return newMessage;
}

export function markChatAsRead(orderId: string, reader: "customer" | "seller"): void {
  const chats = getStoredChats();
  const chat = chats[orderId];
  if (!chat) return;

  let changed = false;
  chat.messages.forEach((m) => {
    if (reader === "customer" && !m.readByCustomer) {
      m.readByCustomer = true;
      changed = true;
    }
    if (reader === "seller" && !m.readBySeller) {
      m.readBySeller = true;
      changed = true;
    }
  });

  if (changed) {
    chat.unreadForAdmin = chat.messages.filter(
      (m) => m.sender === "customer" && !m.readBySeller
    ).length;
    chat.unreadForCustomer = chat.messages.filter(
      (m) => m.sender === "seller" && !m.readByCustomer
    ).length;
    chats[orderId] = chat;
    saveStoredChats(chats);
    notifyChange();
  }
}

export function deleteOrderChat(orderId: string): void {
  const chats = getStoredChats();
  if (chats[orderId]) {
    delete chats[orderId];
    saveStoredChats(chats);
    notifyChange();
  }
}
