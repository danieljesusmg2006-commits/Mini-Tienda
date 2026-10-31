"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Order, OrderChat } from "@/types/store";
import { useStore } from "@/lib/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Send,
  MessageSquare,
  User,
  Clock,
  CheckCheck,
  Package,
  Phone,
  Mail,
  ArrowLeft,
  Sparkles,
  Inbox,
  CheckCircle2,
  AlertCircle,
  Filter,
  ShoppingBag,
  HelpCircle,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

interface SupportManagerProps {
  orders: Order[];
  initialOrderId?: string | null;
  onViewOrderDetail?: (order: Order) => void;
}

const QUICK_PURCHASE_REPLIES = [
  "¡Hola! Tu pedido ya se encuentra en preparación para despacho.",
  "Confirmamos el pago correctamente. ¡Muchas gracias por tu compra!",
  "El repartidor pasará hoy en horario de la tarde.",
  "Hemos tomado nota de tus indicaciones para la entrega.",
];

const QUICK_INQUIRY_REPLIES = [
  "¡Hola! Sí tenemos disponibilidad de este producto con entrega inmediata.",
  "El producto cuenta con garantía oficial de la tienda y entrega rápida.",
  "¿En qué dirección o zona te encuentras para coordinar el despacho?",
  "Puedes realizar tu compra directamente en la página con entrega garantizada.",
];

export function SupportManager({
  orders,
  initialOrderId,
  onViewOrderDetail,
}: SupportManagerProps) {
  const { chats, sendChatMessage, markChatAsRead, getOrCreateChat } = useStore();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    initialOrderId || null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "ALL" | "UNREAD" | "PURCHASES" | "INQUIRIES" | "ANSWERED"
  >("ALL");
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If initialOrderId changes, select it
  useEffect(() => {
    if (initialOrderId) {
      setSelectedOrderId(initialOrderId);
    }
  }, [initialOrderId]);

  // Make sure all orders have a chat registered
  useEffect(() => {
    orders.forEach((o) => {
      if (!chats[o.id]) {
        getOrCreateChat(o.id, o.customerName, o.email, o.phone, {
          chatType: "PURCHASE",
        });
      }
    });
  }, [orders, chats, getOrCreateChat]);

  // Listen for open_admin_chat event from toast notifications
  useEffect(() => {
    const handleOpenAdminChat = (e: any) => {
      if (e.detail?.orderId) {
        setSelectedOrderId(e.detail.orderId);
      }
    };
    window.addEventListener("open_admin_chat", handleOpenAdminChat);
    return () => {
      window.removeEventListener("open_admin_chat", handleOpenAdminChat);
    };
  }, []);

  // When selectedOrderId is active, mark chat as read by seller
  useEffect(() => {
    if (selectedOrderId) {
      markChatAsRead(selectedOrderId, "seller");
    }
  }, [selectedOrderId, markChatAsRead]);

  // Auto scroll on new messages
  useEffect(() => {
    if (selectedOrderId && chats[selectedOrderId]?.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedOrderId, chats[selectedOrderId || ""]?.messages?.length]);

  // Distinguish between a completed purchase vs pre-sale inquiry
  const getChatTypeInfo = (chat: OrderChat) => {
    const isPurchase =
      chat.chatType === "PURCHASE" ||
      orders.some((o) => o.id === chat.orderId) ||
      chat.orderId.startsWith("ORD-");

    if (isPurchase) {
      return {
        type: "PURCHASE" as const,
        label: "🛒 Compra Realizada",
        shortLabel: "Compra",
        badgeClass:
          "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
        icon: ShoppingBag,
      };
    }

    return {
      type: "INQUIRY" as const,
      label: "❓ Solo Pregunta / Consulta",
      shortLabel: "Consulta",
      badgeClass:
        "bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800",
      icon: HelpCircle,
    };
  };

  const allChatsList = useMemo(() => Object.values(chats), [chats]);

  const purchasesCount = useMemo(() => {
    return allChatsList.filter((c) => {
      return (
        c.chatType === "PURCHASE" ||
        orders.some((o) => o.id === c.orderId) ||
        c.orderId.startsWith("ORD-")
      );
    }).length;
  }, [allChatsList, orders]);

  const inquiriesCount = useMemo(() => {
    return Math.max(0, allChatsList.length - purchasesCount);
  }, [allChatsList.length, purchasesCount]);

  // Sorted and filtered list of conversations
  const conversationsList = useMemo(() => {
    return allChatsList
      .filter((c) => {
        const query = searchQuery.trim().toLowerCase();
        const matchesQuery =
          query === "" ||
          c.orderId.toLowerCase().includes(query) ||
          c.customerName.toLowerCase().includes(query) ||
          (c.customerEmail && c.customerEmail.toLowerCase().includes(query)) ||
          (c.productName && c.productName.toLowerCase().includes(query)) ||
          (c.lastMessage && c.lastMessage.toLowerCase().includes(query));

        if (!matchesQuery) return false;

        const isPurchase =
          c.chatType === "PURCHASE" ||
          orders.some((o) => o.id === c.orderId) ||
          c.orderId.startsWith("ORD-");

        if (filterType === "UNREAD") {
          return (c.unreadForAdmin || 0) > 0;
        }
        if (filterType === "PURCHASES") {
          return isPurchase;
        }
        if (filterType === "INQUIRIES") {
          return !isPurchase;
        }
        if (filterType === "ANSWERED") {
          return (c.unreadForAdmin || 0) === 0;
        }
        return true;
      })
      .sort((a, b) => {
        // Unread on top, then by latest message date
        const unreadDiff = (b.unreadForAdmin || 0) - (a.unreadForAdmin || 0);
        if (unreadDiff !== 0) return unreadDiff;

        const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return dateB - dateA;
      });
  }, [allChatsList, searchQuery, filterType, orders]);

  // Auto-select first chat on desktop if none selected
  useEffect(() => {
    if (!selectedOrderId && conversationsList.length > 0) {
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        setSelectedOrderId(conversationsList[0].orderId);
      }
    }
  }, [conversationsList, selectedOrderId]);

  const activeChat = selectedOrderId ? chats[selectedOrderId] : null;
  const activeOrder = selectedOrderId
    ? orders.find((o) => o.id === selectedOrderId)
    : null;

  const activeTypeInfo = activeChat
    ? getChatTypeInfo(activeChat)
    : {
        type: "PURCHASE" as const,
        label: "🛒 Compra Realizada",
        shortLabel: "Compra",
        badgeClass: "bg-slate-100 text-slate-800",
        icon: ShoppingBag,
      };

  const unreadOtherChat = useMemo(() => {
    return Object.values(chats).find(
      (c) => c.orderId !== selectedOrderId && (c.unreadForAdmin || 0) > 0
    );
  }, [chats, selectedOrderId]);

  const handleSendReply = (customText?: string) => {
    const text = (customText || replyText).trim();
    if (!text || !selectedOrderId || !activeChat) return;

    sendChatMessage(
      selectedOrderId,
      "seller",
      "Soporte Mini Tienda",
      text,
      {
        name: activeChat.customerName,
        email: activeChat.customerEmail,
        phone: activeChat.customerPhone,
        chatType: activeChat.chatType,
        productId: activeChat.productId,
        productName: activeChat.productName,
        productPrice: activeChat.productPrice,
        productImageUrl: activeChat.productImageUrl,
      }
    );

    setReplyText("");
    toast.success("Respuesta enviada", {
      description: `Mensaje entregado a ${activeChat.customerName}`,
    });
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      const isToday = new Date().toDateString() === date.toDateString();
      if (isToday) {
        return date.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      return date.toLocaleDateString("es-ES", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const totalUnread = allChatsList.reduce(
    (acc, c) => acc + (c.unreadForAdmin || 0),
    0
  );

  return (
    <div className="space-y-4">
      {/* Top Section Header */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Mensajes y Soporte al Cliente
              </h2>
              {totalUnread > 0 ? (
                <Badge className="bg-rose-500 hover:bg-rose-600 text-white text-[10px] px-2 py-0.5 animate-pulse font-bold">
                  {totalUnread} pendiente{totalUnread > 1 ? "s" : ""}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 text-[10px]">
                  Al día
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Distingue rápidamente entre compradores con pedidos confirmados y consultas previas a la compra.
            </p>
          </div>
        </div>

        {/* Status Count Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
            <span>Compras: <strong>{purchasesCount}</strong></span>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-medium flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Consultas: <strong>{inquiriesCount}</strong></span>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-medium">
            Sin responder: <strong>{totalUnread}</strong>
          </span>
        </div>
      </div>

      {/* Main Chat Interface: Dual Pane for Desktop, View Switcher for Mobile */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden h-[640px] flex flex-col md:flex-row transition-colors">
        {/* Left Side: Conversations List (Hidden on mobile if a chat is selected) */}
        <div
          className={`w-full md:w-84 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full ${
            selectedOrderId ? "hidden md:flex" : "flex"
          }`}
        >
          {/* List Search & Filters */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 space-y-2.5 bg-slate-50/50 dark:bg-slate-950/40">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar cliente, orden o producto..."
                className="pl-8 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white h-9"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => setFilterType("ALL")}
                className={`px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterType === "ALL"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                Todos ({allChatsList.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("UNREAD")}
                className={`px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  filterType === "UNREAD"
                    ? "bg-rose-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                <span>No leídos</span>
                {totalUnread > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-white text-rose-600 font-bold">
                    {totalUnread}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setFilterType("PURCHASES")}
                className={`px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  filterType === "PURCHASES"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                <ShoppingBag className="w-3 h-3" />
                <span>Compras ({purchasesCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterType("INQUIRIES")}
                className={`px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  filterType === "INQUIRIES"
                    ? "bg-amber-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                <HelpCircle className="w-3 h-3" />
                <span>Consultas ({inquiriesCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterType("ANSWERED")}
                className={`px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterType === "ANSWERED"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                Respondidos
              </button>
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
            {conversationsList.length === 0 ? (
              <div className="p-8 text-center space-y-2 text-slate-400">
                <Inbox className="w-8 h-8 mx-auto opacity-50" />
                <p className="text-xs font-semibold">No hay conversaciones</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  {searchQuery
                    ? "Ningún chat coincide con la búsqueda o filtro seleccionado."
                    : "Los mensajes y consultas de los clientes aparecerán aquí."}
                </p>
              </div>
            ) : (
              conversationsList.map((chat) => {
                const isSelected = selectedOrderId === chat.orderId;
                const hasUnread = (chat.unreadForAdmin || 0) > 0;
                const typeInfo = getChatTypeInfo(chat);
                const TypeIcon = typeInfo.icon;

                return (
                  <button
                    key={chat.orderId}
                    type="button"
                    onClick={() => setSelectedOrderId(chat.orderId)}
                    className={`w-full text-left p-3.5 transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50/80 dark:bg-indigo-950/50 border-l-4 border-indigo-600"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-transparent"
                    }`}
                  >
                    {/* User Initials Badge */}
                    <div className="relative shrink-0 mt-0.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                          hasUnread
                            ? "bg-rose-500 text-white shadow-xs"
                            : isSelected
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {chat.customerName
                          ? chat.customerName.charAt(0).toUpperCase()
                          : "C"}
                      </div>
                      {hasUnread && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full animate-ping" />
                      )}
                    </div>

                    {/* Details Snippet */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {chat.customerName || "Cliente"}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatTime(chat.lastMessageAt)}
                        </span>
                      </div>

                      {/* Admin-only distinction badge */}
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold border ${typeInfo.badgeClass}`}
                          title={typeInfo.type === "PURCHASE" ? "Cliente con compra realizada" : "Cliente preguntando sin compra aún"}
                        >
                          <TypeIcon className="w-2.5 h-2.5 shrink-0" />
                          <span>{typeInfo.label}</span>
                        </span>

                        {hasUnread && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-rose-500 text-white">
                            {chat.unreadForAdmin} nuevo{chat.unreadForAdmin && chat.unreadForAdmin > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>

                      {/* Reference / Product subtitle */}
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {typeInfo.type === "PURCHASE" ? (
                          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold truncate">
                            Ref: #{chat.orderId}
                          </span>
                        ) : (
                          <span className="text-amber-800 dark:text-amber-300 font-medium truncate">
                            {chat.productName ? `Sobre: ${chat.productName}` : "Consulta previa de producto"}
                          </span>
                        )}
                      </div>

                      <p
                        className={`text-[11px] truncate mt-0.5 ${
                          hasUnread
                            ? "font-semibold text-slate-900 dark:text-white"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {chat.lastMessage || "Sin mensajes"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Chat View (Full screen on mobile when selected) */}
        <div
          className={`flex-1 flex flex-col h-full bg-slate-50/30 dark:bg-slate-950/30 ${
            !selectedOrderId ? "hidden md:flex" : "flex"
          }`}
        >
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedOrderId(null)}
                    className="relative md:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Volver a lista de chats"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {totalUnread > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                        {totalUnread}
                      </span>
                    )}
                  </button>

                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {activeChat.customerName}
                      </h3>

                      {/* Admin-only classification badge */}
                      <Badge
                        variant="outline"
                        className={`text-[10px] py-0 px-2 font-bold flex items-center gap-1 ${activeTypeInfo.badgeClass}`}
                      >
                        <activeTypeInfo.icon className="w-3 h-3" />
                        <span>{activeTypeInfo.label}</span>
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {activeTypeInfo.type === "PURCHASE" ? (
                        <>
                          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                            Orden #{activeChat.orderId}
                          </span>
                          {activeOrder && (
                            <>
                              <span>•</span>
                              <span>Total: ${activeOrder.total.toFixed(2)}</span>
                              <span>•</span>
                              <Badge variant="outline" className="text-[9px] py-0 px-1 font-semibold">
                                {activeOrder.status}
                              </Badge>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="text-amber-700 dark:text-amber-400 font-bold truncate">
                            {activeChat.productName ? `Consulta sobre: ${activeChat.productName}` : "Consulta general"}
                          </span>
                          {activeChat.productPrice ? (
                            <>
                              <span>•</span>
                              <span>${activeChat.productPrice.toFixed(2)}</span>
                            </>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* View Order Detail Link if purchase */}
                {activeOrder && onViewOrderDetail && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onViewOrderDetail(activeOrder)}
                    className="text-xs gap-1.5 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 h-8 shrink-0 cursor-pointer"
                  >
                    <Package className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span className="hidden sm:inline">Ver Pedido</span>
                  </Button>
                )}
              </div>

              {/* Unread Alert Banner for other orders */}
              {unreadOtherChat && (
                <div className="bg-rose-50 dark:bg-rose-950/70 border-b border-rose-200 dark:border-rose-900 px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs text-rose-800 dark:text-rose-200 animate-in slide-in-from-top-1 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                    <span className="truncate">
                      <strong>{unreadOtherChat.customerName}:</strong> {unreadOtherChat.lastMessage || "Nuevo mensaje"} (#{unreadOtherChat.orderId})
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setSelectedOrderId(unreadOtherChat.orderId)}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] h-7 px-3 shrink-0 font-medium cursor-pointer"
                  >
                    Ver este chat
                  </Button>
                </div>
              )}

              {/* Context Ribbon: Product Inquiry vs Purchase Order (Admin view) */}
              {activeTypeInfo.type === "INQUIRY" ? (
                <div className="px-4 py-2.5 bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-300/60 dark:border-amber-800/60 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {activeChat.productImageUrl && (
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-amber-300 dark:border-amber-700 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={activeChat.productImageUrl}
                          alt={activeChat.productName || "Producto"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-xs truncate">
                        {activeChat.productName ? `Consulta sobre: ${activeChat.productName}` : "Consulta general previa a compra"}
                        {activeChat.productPrice ? ` • $${activeChat.productPrice.toFixed(2)}` : ""}
                      </p>
                      <p className="text-[10px] text-amber-700 dark:text-amber-400">
                        👤 <strong>Cliente:</strong> {activeChat.customerEmail || "Sin correo"} • ⚠️ <em>Este usuario aún no ha realizado compra. Está solicitando información previa.</em>
                      </p>
                    </div>
                  </div>
                  <Badge className="shrink-0 bg-amber-600 text-white text-[10px] font-bold">
                    Solo Preguntando
                  </Badge>
                </div>
              ) : activeOrder ? (
                <div className="px-4 py-2 bg-emerald-500/10 dark:bg-emerald-950/40 border-b border-emerald-300/60 dark:border-emerald-800/60 flex items-center justify-between text-[11px] text-emerald-950 dark:text-emerald-200 shrink-0 gap-2 overflow-x-auto no-scrollbar">
                  <div className="flex items-center gap-2 truncate">
                    <Package className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">
                      <strong>Artículos:</strong> {activeOrder.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <Mail className="w-3 h-3" />
                      <span>{activeOrder.email}</span>
                    </div>
                    <span>Pago: <strong>{activeOrder.paymentMethod}</strong></span>
                    <span>Total: <strong>${activeOrder.total.toFixed(2)}</strong></span>
                  </div>
                </div>
              ) : null}

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeChat.messages.map((msg) => {
                  const isSeller = msg.sender === "seller";

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isSeller ? "items-end" : "items-start"} animate-in fade-in duration-150`}
                    >
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mb-0.5 px-1">
                        {isSeller ? "Tú (Vendedor)" : activeChat.customerName}
                      </span>

                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] sm:max-w-[75%] shadow-xs ${
                          isSeller
                            ? "bg-indigo-600 text-white rounded-tr-xs"
                            : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-tl-xs"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        <div
                          className={`flex items-center justify-end gap-1 text-[9px] mt-1 ${
                            isSeller ? "text-indigo-200" : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          <span>{formatTime(msg.createdAt)}</span>
                          {isSeller && <CheckCheck className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Canned Quick Replies */}
              <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0 font-medium pl-1">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  <span>Respuestas rápidas:</span>
                </div>
                {(activeTypeInfo.type === "INQUIRY" ? QUICK_INQUIRY_REPLIES : QUICK_PURCHASE_REPLIES).map((reply, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendReply(reply)}
                    className="text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors shrink-0 cursor-pointer"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Message Reply Input */}
              <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendReply();
                  }}
                  className="flex items-center gap-2"
                >
                  <Input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={
                      activeTypeInfo.type === "INQUIRY"
                        ? `Responder consulta de ${activeChat.customerName} sobre ${activeChat.productName || "producto"}...`
                        : `Responder a ${activeChat.customerName} sobre la orden #${activeChat.orderId}...`
                    }
                    className="flex-1 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus-visible:ring-indigo-500 h-9 sm:h-10"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!replyText.trim()}
                    className="h-9 sm:h-10 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 cursor-pointer disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline ml-1 text-xs font-semibold">Responder</span>
                  </Button>
                </form>
              </div>
            </>
          ) : (
            /* Empty State when no chat selected */
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                Ninguna conversación seleccionada
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                Selecciona un chat del listado de la izquierda para ver las dudas de clientes con compra realizada o consultas sobre productos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
