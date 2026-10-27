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
} from "lucide-react";
import { toast } from "sonner";

interface SupportManagerProps {
  orders: Order[];
  initialOrderId?: string | null;
  onViewOrderDetail?: (order: Order) => void;
}

const QUICK_SELLER_REPLIES = [
  "¡Hola! Tu pedido ya se encuentra en preparación para despacho.",
  "Confirmamos el pago correctamente. ¡Muchas gracias por tu compra!",
  "El repartidor pasará hoy en horario de la tarde.",
  "Hemos tomado nota de tus indicaciones para la entrega.",
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
  const [filterType, setFilterType] = useState<"ALL" | "UNREAD" | "ANSWERED">("ALL");
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
        getOrCreateChat(o.id, o.customerName, o.email, o.phone);
      }
    });
  }, [orders, chats, getOrCreateChat]);

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

  // Sorted and filtered list of conversations
  const conversationsList = useMemo(() => {
    const list = Object.values(chats);

    return list
      .filter((c) => {
        const query = searchQuery.trim().toLowerCase();
        const matchesQuery =
          query === "" ||
          c.orderId.toLowerCase().includes(query) ||
          c.customerName.toLowerCase().includes(query) ||
          (c.customerEmail && c.customerEmail.toLowerCase().includes(query)) ||
          (c.lastMessage && c.lastMessage.toLowerCase().includes(query));

        if (!matchesQuery) return false;

        if (filterType === "UNREAD") {
          return (c.unreadForAdmin || 0) > 0;
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
  }, [chats, searchQuery, filterType]);

  // Auto-select first chat on desktop if none selected
  useEffect(() => {
    if (!selectedOrderId && conversationsList.length > 0) {
      // Only set on larger screens where split view is visible
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        setSelectedOrderId(conversationsList[0].orderId);
      }
    }
  }, [conversationsList, selectedOrderId]);

  const activeChat = selectedOrderId ? chats[selectedOrderId] : null;
  const activeOrder = selectedOrderId
    ? orders.find((o) => o.id === selectedOrderId)
    : null;

  const handleSendReply = (customText?: string) => {
    const text = (customText || replyText).trim();
    if (!text || !selectedOrderId) return;

    sendChatMessage(
      selectedOrderId,
      "seller",
      "Soporte Mini Tienda",
      text,
      activeOrder
        ? {
            name: activeOrder.customerName,
            email: activeOrder.email,
            phone: activeOrder.phone,
          }
        : undefined
    );

    setReplyText("");
    toast.success("Respuesta enviada", {
      description: `Mensaje entregado al cliente de la orden #${selectedOrderId}`,
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

  const totalUnread = Object.values(chats).reduce(
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
                Mensajes y Soporte al Comprador
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
              Responde las consultas directas de los clientes sobre sus pedidos y envíos en tiempo real.
            </p>
          </div>
        </div>

        {/* Status Count Pills */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium">
            Total Chats: <strong>{Object.keys(chats).length}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-medium">
            Sin responder: <strong>{totalUnread}</strong>
          </span>
        </div>
      </div>

      {/* Main Chat Interface: Dual Pane for Desktop, View Switcher for Mobile */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden h-[620px] flex flex-col md:flex-row transition-colors">
        {/* Left Side: Conversations List (Hidden on mobile if a chat is selected) */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full ${
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
                placeholder="Buscar por cliente o ID de orden..."
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
            <div className="flex items-center gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => setFilterType("ALL")}
                className={`px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterType === "ALL"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                Todos ({Object.keys(chats).length})
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
                    ? "Ningún chat coincide con la búsqueda."
                    : "Los mensajes de los clientes sobre sus pedidos aparecerán aquí."}
                </p>
              </div>
            ) : (
              conversationsList.map((chat) => {
                const isSelected = selectedOrderId === chat.orderId;
                const hasUnread = (chat.unreadForAdmin || 0) > 0;

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

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                          #{chat.orderId}
                        </span>
                        {hasUnread && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-rose-500 text-white">
                            {chat.unreadForAdmin} nuevo{chat.unreadForAdmin && chat.unreadForAdmin > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>

                      <p
                        className={`text-[11px] truncate mt-1 ${
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
                    className="md:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Volver a lista de chats"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {activeChat.customerName}
                      </h3>
                      {activeOrder && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                          {activeOrder.status}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                        #{activeChat.orderId}
                      </span>
                      {activeOrder && (
                        <>
                          <span>•</span>
                          <span>Total: ${activeOrder.total.toFixed(2)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* View Order Detail Link */}
                {activeOrder && onViewOrderDetail && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onViewOrderDetail(activeOrder)}
                    className="text-xs gap-1.5 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 h-8"
                  >
                    <Package className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span className="hidden sm:inline">Ver Pedido</span>
                  </Button>
                )}
              </div>

              {/* Order Info Strip */}
              {activeOrder && (
                <div className="px-4 py-2 bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 shrink-0 gap-2 overflow-x-auto no-scrollbar">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{activeOrder.email}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{activeOrder.phone}</span>
                  </div>
                  <div className="shrink-0 font-medium text-emerald-600 dark:text-emerald-400">
                    Pago: {activeOrder.paymentMethod}
                  </div>
                </div>
              )}

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
                {QUICK_SELLER_REPLIES.map((reply, idx) => (
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
                    placeholder={`Responder a ${activeChat.customerName} sobre la orden #${activeChat.orderId}...`}
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
                Selecciona un chat del listado de la izquierda para ver los mensajes del cliente y responder sus dudas sobre el pedido.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
