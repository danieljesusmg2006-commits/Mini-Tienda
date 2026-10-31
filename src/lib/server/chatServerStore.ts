import fs from "fs";
import path from "path";
import { OrderChat, ChatMessage, ChatSenderRole } from "@/types/store";

export const DEFAULT_SERVER_CHATS: Record<string, OrderChat> = {
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

// Global memory cache to stay active across requests in the same Node.js process
const globalForChats = globalThis as unknown as {
  __miniTiendaChats?: Record<string, OrderChat>;
  __miniTiendaChatsFilePath?: string;
};

function getStorageFilePath(): string {
  if (globalForChats.__miniTiendaChatsFilePath) {
    return globalForChats.__miniTiendaChatsFilePath;
  }

  const primaryDir = path.join(process.cwd(), ".data");
  try {
    if (!fs.existsSync(primaryDir)) {
      fs.mkdirSync(primaryDir, { recursive: true });
    }
    const testFile = path.join(primaryDir, ".write-test");
    fs.writeFileSync(testFile, "ok");
    fs.unlinkSync(testFile);
    const target = path.join(primaryDir, "chats.json");
    globalForChats.__miniTiendaChatsFilePath = target;
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
    const target = path.join(tmpDir, "chats.json");
    globalForChats.__miniTiendaChatsFilePath = target;
    return target;
  }
}

export function getServerChats(): Record<string, OrderChat> {
  if (globalForChats.__miniTiendaChats) {
    return globalForChats.__miniTiendaChats;
  }

  const filePath = getStorageFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      globalForChats.__miniTiendaChats = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn("Could not read server chats file, initializing defaults:", err);
  }

  const initial = { ...DEFAULT_SERVER_CHATS };
  globalForChats.__miniTiendaChats = initial;
  saveServerChats(initial);
  return initial;
}

export function saveServerChats(chats: Record<string, OrderChat>): void {
  globalForChats.__miniTiendaChats = chats;
  const filePath = getStorageFilePath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(chats, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not save server chats file:", err);
  }
}

export function getOrCreateServerChat(
  orderId: string,
  customerName: string = "Cliente",
  customerEmail?: string,
  customerPhone?: string
): OrderChat {
  const chats = getServerChats();
  if (chats[orderId]) {
    return chats[orderId];
  }

  const initialMessage: ChatMessage = {
    id: `msg-${orderId}-${Date.now()}`,
    orderId,
    sender: "seller",
    senderName: "Soporte Mini Tienda",
    text: `¡Hola ${customerName}! 👋 Gracias por tu compra con ID #${orderId}. Si tienes alguna duda sobre tu pedido o deseas consultar el estado de tu entrega, déjanos tu mensaje aquí y te responderemos enseguida.`,
    createdAt: new Date().toISOString(),
    readByCustomer: false,
    readBySeller: true,
  };

  const newChat: OrderChat = {
    orderId,
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
  saveServerChats(chats);
  return newChat;
}

export function addServerChatMessage(
  orderId: string,
  sender: ChatSenderRole,
  senderName: string,
  text: string,
  customerMeta?: { name?: string; email?: string; phone?: string }
): { message: ChatMessage; chat: OrderChat } {
  const chats = getServerChats();
  let chat = chats[orderId];

  if (!chat) {
    chat = getOrCreateServerChat(
      orderId,
      customerMeta?.name || senderName,
      customerMeta?.email,
      customerMeta?.phone
    );
  }

  const newMessage: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    orderId,
    sender,
    senderName,
    text: text.trim(),
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

  chat.unreadForAdmin = chat.messages.filter(
    (m) => m.sender === "customer" && !m.readBySeller
  ).length;
  chat.unreadForCustomer = chat.messages.filter(
    (m) => m.sender === "seller" && !m.readByCustomer
  ).length;

  chats[orderId] = chat;
  saveServerChats(chats);

  return { message: newMessage, chat };
}

export function markServerChatAsRead(
  orderId: string,
  reader: "customer" | "seller"
): OrderChat | null {
  const chats = getServerChats();
  const chat = chats[orderId];
  if (!chat) return null;

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
    saveServerChats(chats);
  }

  return chat;
}

export function deleteServerChat(orderId: string): boolean {
  const chats = getServerChats();
  if (chats[orderId]) {
    delete chats[orderId];
    saveServerChats(chats);
    return true;
  }
  return false;
}
