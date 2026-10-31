import fs from "fs";
import path from "path";
import { Order } from "@/types/store";

export const DEFAULT_SERVER_ORDERS: Order[] = [
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

const globalForOrders = globalThis as unknown as {
  __miniTiendaOrders?: Order[];
  __miniTiendaOrdersFilePath?: string;
};

function getOrdersFilePath(): string {
  if (globalForOrders.__miniTiendaOrdersFilePath) {
    return globalForOrders.__miniTiendaOrdersFilePath;
  }

  const primaryDir = path.join(process.cwd(), ".data");
  try {
    if (!fs.existsSync(primaryDir)) {
      fs.mkdirSync(primaryDir, { recursive: true });
    }
    const testFile = path.join(primaryDir, ".write-test-orders");
    fs.writeFileSync(testFile, "ok");
    fs.unlinkSync(testFile);
    const target = path.join(primaryDir, "orders.json");
    globalForOrders.__miniTiendaOrdersFilePath = target;
    return target;
  } catch {
    const tmpDir = path.join(process.env.TMPDIR || "/tmp", "mini-tienda");
    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
    } catch {
      // fallback
    }
    const target = path.join(tmpDir, "orders.json");
    globalForOrders.__miniTiendaOrdersFilePath = target;
    return target;
  }
}

export function getServerOrders(): Order[] {
  if (globalForOrders.__miniTiendaOrders) {
    return globalForOrders.__miniTiendaOrders;
  }

  const filePath = getOrdersFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      globalForOrders.__miniTiendaOrders = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn("Could not read server orders file, initializing defaults:", err);
  }

  const initial = [...DEFAULT_SERVER_ORDERS];
  globalForOrders.__miniTiendaOrders = initial;
  saveServerOrders(initial);
  return initial;
}

export function saveServerOrders(orders: Order[]): void {
  globalForOrders.__miniTiendaOrders = orders;
  const filePath = getOrdersFilePath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(orders, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not save server orders file:", err);
  }
}

export function addServerOrder(order: Order): Order {
  const orders = getServerOrders();
  // prepend new order
  const existingIndex = orders.findIndex((o) => o.id === order.id);
  if (existingIndex >= 0) {
    orders[existingIndex] = order;
  } else {
    orders.unshift(order);
  }
  saveServerOrders(orders);
  return order;
}

export function updateServerOrder(id: string, partial: Partial<Order>): Order | null {
  const orders = getServerOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;

  orders[index] = {
    ...orders[index],
    ...partial,
    updatedAt: new Date().toISOString(),
  };
  saveServerOrders(orders);
  return orders[index];
}

export function deleteServerOrder(id: string): boolean {
  const orders = getServerOrders();
  const filtered = orders.filter((o) => o.id !== id);
  if (filtered.length !== orders.length) {
    saveServerOrders(filtered);
    return true;
  }
  return false;
}
