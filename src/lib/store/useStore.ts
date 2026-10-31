"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Product, ProductInput, CartItem, Order, CustomerUser, OrderInput, ChatMessage, OrderChat, ChatSenderRole } from "@/types/store";
import { broadcastCloudEvent, startCloudSyncListener, playNotificationSound } from "@/lib/sync/cloudSync";
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
  getStoredSearchHistory,
  addSearchQueryToHistory,
  clearSearchHistory,
  getMyPurchases,
  clearGuestSessionData,
  getStoredChats,
  saveStoredChats,
  saveOrders,
  getOrderChat,
  getOrCreateOrderChat,
  sendChatMessage as sendChatMessageFn,
  markChatAsRead as markChatAsReadFn,
  deleteOrderChat as deleteOrderChatFn,
} from "./store";

// Helper to merge local & server chats safely without duplicates
function mergeChats(
  local: Record<string, OrderChat>,
  server: Record<string, OrderChat>
): Record<string, OrderChat> {
  const merged: Record<string, OrderChat> = { ...server };

  for (const [orderId, localChat] of Object.entries(local)) {
    if (!merged[orderId]) {
      merged[orderId] = localChat;
    } else {
      const serverChat = merged[orderId];
      const allMsgs: ChatMessage[] = [];

      const isDuplicate = (list: ChatMessage[], item: ChatMessage) => {
        return list.some(
          (m) =>
            m.id === item.id ||
            (m.sender === item.sender &&
              m.text.trim() === item.text.trim() &&
              Math.abs(new Date(m.createdAt).getTime() - new Date(item.createdAt).getTime()) < 5000)
        );
      };

      (localChat.messages || []).forEach((m) => {
        if (!isDuplicate(allMsgs, m)) allMsgs.push(m);
      });
      (serverChat.messages || []).forEach((m) => {
        if (!isDuplicate(allMsgs, m)) allMsgs.push(m);
      });

      const allMessages = allMsgs.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      merged[orderId] = {
        ...localChat,
        ...serverChat,
        messages: allMessages,
        lastMessage:
          allMessages.length > 0
            ? allMessages[allMessages.length - 1].text
            : serverChat.lastMessage || localChat.lastMessage,
        lastMessageAt:
          allMessages.length > 0
            ? allMessages[allMessages.length - 1].createdAt
            : serverChat.lastMessageAt || localChat.lastMessageAt,
        unreadForAdmin: allMessages.filter(
          (m) => m.sender === "customer" && !m.readBySeller
        ).length,
        unreadForCustomer: allMessages.filter(
          (m) => m.sender === "seller" && !m.readByCustomer
        ).length,
      };
    }
  }

  return merged;
}

// Helper to merge local & server orders safely
function mergeOrders(local: Order[], server: Order[]): Order[] {
  const map = new Map<string, Order>();
  server.forEach((o) => map.set(o.id, o));
  local.forEach((o) => {
    if (!map.has(o.id)) {
      map.set(o.id, o);
    }
  });
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function useStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [myPurchases, setMyPurchases] = useState<Order[]>([]);
  const [chats, setChats] = useState<Record<string, OrderChat>>({});
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const refreshState = useCallback(() => {
    setProducts(getStoredProducts());
    setCart(getStoredCart());
    setOrders(getStoredOrders());
    setMyPurchases(getMyPurchases());
    setChats(getStoredChats());
    setSearchHistory(getStoredSearchHistory());
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

    // ------------------------------------------------------------------
    // Live multi-device cloud synchronization listener (SSE)
    // ------------------------------------------------------------------
    const stopCloudListener = startCloudSyncListener((cloudEvent) => {
      if (!isMounted) return;

      if (cloudEvent.type === "CHAT_MESSAGE") {
        const { orderId, message, customerMeta } = cloudEvent;
        const currentChats = getStoredChats();
        let targetChat = currentChats[orderId];

        if (!targetChat) {
          targetChat = {
            orderId,
            customerName: customerMeta?.name || message.senderName || "Cliente",
            customerEmail: customerMeta?.email,
            customerPhone: customerMeta?.phone,
            messages: [],
          };
          currentChats[orderId] = targetChat;
        }

        // Robust deduplication: check matching ID or matching (sender, text, timestamp < 5s)
        const msgExists = (targetChat.messages || []).some(
          (m) =>
            m.id === message.id ||
            (m.sender === message.sender &&
              m.text.trim() === message.text.trim() &&
              Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 5000)
        );

        if (!msgExists) {
          targetChat.messages = [...(targetChat.messages || []), message];
          targetChat.lastMessage = message.text;
          targetChat.lastMessageAt = message.createdAt;

          const isAdminPage =
            typeof window !== "undefined" && window.location.pathname.startsWith("/admin");

          if (message.sender === "customer") {
            targetChat.unreadForAdmin = (targetChat.unreadForAdmin || 0) + 1;
            // Only alert if we are in the admin dashboard (recipient)
            if (isAdminPage) {
              playNotificationSound();
              toast.info(`💬 Mensaje de ${message.senderName}`, {
                description: message.text,
                duration: 6000,
                action: {
                  label: "Abrir Chat",
                  onClick: () => {
                    window.dispatchEvent(
                      new CustomEvent("open_admin_chat", { detail: { orderId } })
                    );
                  },
                },
              });
            }
          } else if (message.sender === "seller") {
            targetChat.unreadForCustomer = (targetChat.unreadForCustomer || 0) + 1;
            // Only alert if we are in the store view (recipient)
            if (!isAdminPage) {
              playNotificationSound();
              toast.info(`💬 Soporte de la Tienda`, {
                description: message.text,
                duration: 6000,
                action: {
                  label: "Ver Respuesta",
                  onClick: () => {
                    window.dispatchEvent(
                      new CustomEvent("open_customer_chat", { detail: { orderId } })
                    );
                  },
                },
              });
            }
          }

          saveStoredChats(currentChats);
          setChats({ ...currentChats });
        }
      } else if (cloudEvent.type === "ORDER_CREATED") {
        const { order } = cloudEvent;
        const currentOrders = getStoredOrders();
        const exists = currentOrders.some((o) => o.id === order.id);
        if (!exists) {
          const updated = [order, ...currentOrders];
          saveOrders(updated);
          setOrders(updated);
          setMyPurchases(getMyPurchases());
          playNotificationSound();
          toast.success(`📦 Nuevo Pedido Recibido #${order.id}`, {
            description: `${order.customerName} - Total: $${order.total.toFixed(2)}`,
            duration: 8000,
          });
        }
      }
    });

    // ------------------------------------------------------------------
    // Live multi-device synchronization loop
    // ------------------------------------------------------------------
    let isMounted = true;

    const syncWithServer = async () => {
      try {
        const [chatRes, orderRes] = await Promise.all([
          fetch("/api/chat", { cache: "no-store" }),
          fetch("/api/orders", { cache: "no-store" }),
        ]);

        if (chatRes.ok && isMounted) {
          const chatData = await chatRes.json();
          if (chatData.success && chatData.chats) {
            const currentLocal = getStoredChats();
            const merged = mergeChats(currentLocal, chatData.chats);
            setChats(merged);
            saveStoredChats(merged);
          }
        }

        if (orderRes.ok && isMounted) {
          const orderData = await orderRes.json();
          if (orderData.success && orderData.orders) {
            const currentLocal = getStoredOrders();
            const merged = mergeOrders(currentLocal, orderData.orders);
            setOrders(merged);
            saveOrders(merged);
            setMyPurchases(getMyPurchases());
          }
        }
      } catch {
        // Silently ignore offline network errors
      }
    };

    syncWithServer();
    const interval = setInterval(syncWithServer, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      stopCloudListener();
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

    if (res.success && res.order) {
      // Direct Cloud Real-time broadcast for sub-second cross-device sync
      broadcastCloudEvent({
        type: "ORDER_CREATED",
        order: res.order,
      });

      // Sync to server so admin sees the order across devices
      fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(res.order),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.order) {
            // Also sync the chat
            fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: res.order!.id,
                action: "init",
                customerMeta: {
                  name: res.order!.customerName,
                  email: res.order!.email,
                  phone: res.order!.phone,
                },
              }),
            }).catch(() => {});
          }
        })
        .catch(() => {});
    }

    return res;
  }, [refreshState]);

  // Order Admin operations
  const createOrder = useCallback((input: OrderInput) => {
    const created = createAdminOrderFn(input);
    refreshState();
    broadcastCloudEvent({
      type: "ORDER_CREATED",
      order: created,
    });
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(created),
    }).catch(() => {});
    return created;
  }, [refreshState]);

  const editOrder = useCallback((id: string, input: Partial<Order>) => {
    const updated = updateAdminOrderFn(id, input);
    refreshState();
    fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...input }),
    }).catch(() => {});
    return updated;
  }, [refreshState]);

  const removeOrder = useCallback((id: string) => {
    const success = deleteAdminOrderFn(id);
    refreshState();
    fetch(`/api/orders?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    }).catch(() => {});
    return success;
  }, [refreshState]);

  // Calculated properties
  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  // Chat Operations
  const sendChatMessage = useCallback((
    orderId: string,
    sender: ChatSenderRole,
    senderName: string,
    text: string,
    customerMeta?: { name?: string; email?: string; phone?: string }
  ) => {
    // 1. Optimistic instant local update
    const msg = sendChatMessageFn(orderId, sender, senderName, text, customerMeta);
    refreshState();

    // 2. Direct Cloud Real-time broadcast for sub-second cross-device sync
    broadcastCloudEvent({
      type: "CHAT_MESSAGE",
      orderId,
      message: msg,
      customerMeta,
    });

    // 3. Broadcast to server for multi-device delivery with the same exact message ID
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        sender,
        senderName,
        text,
        customerMeta,
        messageId: msg.id,
        createdAt: msg.createdAt,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.chat) {
          const localChats = getStoredChats();
          const existing = localChats[orderId];
          if (!existing) {
            localChats[orderId] = data.chat;
          } else {
            // Safely merge messages without deleting or duplicating
            const allMsgs = [...(existing.messages || [])];
            (data.chat.messages || []).forEach((m: ChatMessage) => {
              const dup = allMsgs.some(
                (x) =>
                  x.id === m.id ||
                  (x.sender === m.sender &&
                    x.text.trim() === m.text.trim() &&
                    Math.abs(new Date(x.createdAt).getTime() - new Date(m.createdAt).getTime()) < 5000)
              );
              if (!dup) allMsgs.push(m);
            });
            existing.messages = allMsgs.sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            existing.lastMessage =
              existing.messages[existing.messages.length - 1]?.text || existing.lastMessage;
            existing.lastMessageAt =
              existing.messages[existing.messages.length - 1]?.createdAt || existing.lastMessageAt;
            localChats[orderId] = existing;
          }
          saveStoredChats(localChats);
          setChats({ ...localChats });
        }
      })
      .catch((err) => {
        console.warn("Could not sync message to server immediately:", err);
      });

    return msg;
  }, [refreshState]);

  const markChatAsRead = useCallback((orderId: string, reader: "customer" | "seller") => {
    markChatAsReadFn(orderId, reader);
    refreshState();

    fetch("/api/chat", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, reader }),
    }).catch(() => {});
  }, [refreshState]);

  const getOrCreateChat = useCallback((
    orderId: string,
    customerName?: string,
    customerEmail?: string,
    customerPhone?: string
  ) => {
    const chat = getOrCreateOrderChat(orderId, customerName, customerEmail, customerPhone);
    refreshState();

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        action: "init",
        customerMeta: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
      }),
    }).catch(() => {});

    return chat;
  }, [refreshState]);

  const deleteChat = useCallback((orderId: string) => {
    deleteOrderChatFn(orderId);
    refreshState();
    fetch(`/api/chat?orderId=${encodeURIComponent(orderId)}`, {
      method: "DELETE",
    }).catch(() => {});
  }, [refreshState]);

  const totalUnreadAdminMessages = useMemo(() => {
    return Object.values(chats).reduce((acc, c) => acc + (c.unreadForAdmin || 0), 0);
  }, [chats]);

  const totalUnreadCustomerMessages = useMemo(() => {
    return Object.values(chats).reduce((acc, c) => acc + (c.unreadForCustomer || 0), 0);
  }, [chats]);

  const addSearchQuery = useCallback((query: string) => {
    const updated = addSearchQueryToHistory(query);
    setSearchHistory(updated);
  }, []);

  const clearSearches = useCallback(() => {
    clearSearchHistory();
    setSearchHistory([]);
  }, []);

  return {
    products,
    cart,
    orders,
    myPurchases,
    chats,
    totalUnreadAdminMessages,
    totalUnreadCustomerMessages,
    searchHistory,
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
    addSearchQuery,
    clearSearches,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    emptyCart,
    performCheckout,
    createOrder,
    editOrder,
    removeOrder,
    sendChatMessage,
    markChatAsRead,
    getOrCreateChat,
    deleteChat,
    refreshState,
  };
}
