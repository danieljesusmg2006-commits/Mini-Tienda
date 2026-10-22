export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export type OrderStatus = "Completada" | "Pendiente" | "Entregada" | "Cancelada";

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderInput {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: string;
  items: OrderItem[];
  subtotal?: number;
  total?: number;
  status?: OrderStatus;
}

export interface CustomerUser {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface StoreState {
  products: Product[];
  adminPasswordHash: string;
  cart: CartItem[];
  orders: Order[];
  customer: CustomerUser | null;
}
