"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Order, Product, CustomerUser } from "@/types/store";
import { useStore } from "@/lib/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Send,
  Store,
  CheckCheck,
  Package,
  Clock,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  MessageSquare,
  Lock,
  LogIn,
  ShoppingBag,
} from "lucide-react";

interface OrderChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order | null;
  product?: Product | null;
  customerUser?: CustomerUser | null;
  onOpenLogin?: () => void;
}

const ORDER_QUICK_QUESTIONS = [
  "¿Cuándo llegará mi pedido?",
  "¿Puedo coordinar el horario de entrega?",
  "Deseo confirmar el método de pago",
  "¿Tienen número de seguimiento?",
];

const INQUIRY_QUICK_QUESTIONS = [
  "¿Tienen stock disponible?",
  "¿Cuánto demora el despacho a mi zona?",
  "¿Tiene garantía este producto?",
  "¿Puedo pagar en efectivo al recibir?",
];

export function OrderChatModal({
  isOpen,
  onClose,
  order,
  product,
  customerUser,
  onOpenLogin,
}: OrderChatModalProps) {
  const { chats, sendChatMessage, markChatAsRead, getOrCreateChat } = useStore();
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Compute active target Chat ID
  const activeChatInfo = useMemo(() => {
    if (order) {
      return {
        chatId: order.id,
        isOrder: true,
        isProduct: false,
        customerName: customerUser?.name || order.customerName,
        customerEmail: customerUser?.email || order.email,
        customerPhone: customerUser?.phone || order.phone,
      };
    }
    if (product && customerUser) {
      const cleanEmail = customerUser.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
      return {
        chatId: `INQ-${product.id}-${cleanEmail}`,
        isOrder: false,
        isProduct: true,
        customerName: customerUser.name,
        customerEmail: customerUser.email,
        customerPhone: customerUser.phone,
      };
    }
    return null;
  }, [order, product, customerUser]);

  const targetChatId = activeChatInfo?.chatId;

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // When opened, ensure chat exists and mark as read by customer
  useEffect(() => {
    if (isOpen && activeChatInfo && targetChatId) {
      if (activeChatInfo.isOrder && order) {
        getOrCreateChat(
          order.id,
          activeChatInfo.customerName,
          activeChatInfo.customerEmail,
          activeChatInfo.customerPhone,
          {
            chatType: "PURCHASE",
          }
        );
        markChatAsRead(order.id, "customer");
      } else if (activeChatInfo.isProduct && product) {
        getOrCreateChat(
          targetChatId,
          activeChatInfo.customerName,
          activeChatInfo.customerEmail,
          activeChatInfo.customerPhone,
          {
            chatType: "INQUIRY",
            productId: product.id,
            productName: product.name,
            productPrice: product.price,
            productImageUrl: product.imageUrl,
          }
        );
        markChatAsRead(targetChatId, "customer");
      }
    }
  }, [isOpen, activeChatInfo, targetChatId, order, product, getOrCreateChat, markChatAsRead]);

  // Scroll on new messages
  const currentChat = targetChatId ? chats[targetChatId] : null;
  useEffect(() => {
    if (isOpen && currentChat?.messages && targetChatId) {
      scrollToBottom();
      markChatAsRead(targetChatId, "customer");
    }
  }, [isOpen, currentChat?.messages?.length, targetChatId, markChatAsRead]);

  if (!isOpen) return null;

  // -------------------------------------------------------------
  // Mandatory Login Gate: Guests cannot chat unless signed in
  // -------------------------------------------------------------
  if (!customerUser) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-center space-y-4 transition-all"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Inicio de Sesión Requerido
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
              Para comunicarte en vivo con el vendedor y recibir respuesta a tus preguntas sobre productos o pedidos, necesitas iniciar sesión o identificarte con tu nombre y correo.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 text-xs border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cerrar
            </Button>
            <Button
              type="button"
              onClick={() => {
                onClose();
                onOpenLogin?.();
              }}
              className="flex-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 cursor-pointer shadow-md shadow-indigo-500/20"
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión Ahora</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!order && !product) return null;

  const chat = currentChat || {
    orderId: targetChatId || "CHAT",
    customerName: customerUser.name,
    customerEmail: customerUser.email,
    messages: [],
  };

  const isProductInquiry = Boolean(product && !order);
  const quickQuestions = isProductInquiry ? INQUIRY_QUICK_QUESTIONS : ORDER_QUICK_QUESTIONS;

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !targetChatId) return;

    const senderName = customerUser.name;

    sendChatMessage(targetChatId, "customer", senderName, text, {
      name: customerUser.name,
      email: customerUser.email,
      phone: customerUser.phone,
      chatType: isProductInquiry ? "INQUIRY" : "PURCHASE",
      productId: product?.id,
      productName: product?.name,
      productPrice: product?.price,
      productImageUrl: product?.imageUrl,
    });

    setInputText("");
    setTimeout(scrollToBottom, 50);
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      return new Date(isoString).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[92vh] max-h-[720px] transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-chat-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Seller Avatar with online indicator */}
            <div className="relative shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Store className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
            </div>

            {/* Title & Status */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 id="order-chat-title" className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  Vendedor • Soporte Oficial
                </h3>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  En vivo
                </Badge>
              </div>

              {/* Reference Pill */}
              {order ? (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Pedido <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">#{order.id}</span> • ${order.total.toFixed(2)}
                </p>
              ) : product ? (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Consulta sobre: <span className="font-bold text-indigo-600 dark:text-indigo-400">{product.name}</span> • ${product.price.toFixed(2)}
                </p>
              ) : null}
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Cerrar chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Preview Ribbon */}
        {order ? (
          <div className="px-4 py-2 bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between gap-2 text-[11px] text-indigo-900 dark:text-indigo-200 shrink-0">
            <div className="flex items-center gap-1.5 truncate">
              <Package className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="truncate">
                <strong>Artículos:</strong> {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
              </span>
            </div>
            <span className="shrink-0 font-bold text-indigo-700 dark:text-indigo-300">
              Estado: {order.status}
            </span>
          </div>
        ) : product ? (
          <div className="px-4 py-2 bg-amber-50/70 dark:bg-amber-950/40 border-b border-amber-200/60 dark:border-amber-900/50 flex items-center justify-between gap-2 text-[11px] text-amber-950 dark:text-amber-200 shrink-0">
            <div className="flex items-center gap-2 truncate">
              {/* Product Thumbnail */}
              <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-amber-300 dark:border-amber-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
              <span className="truncate">
                <strong>Pregunta sobre:</strong> {product.name} (${product.price.toFixed(2)})
              </span>
            </div>
            <span className="shrink-0 font-bold text-emerald-600 dark:text-emerald-400">
              {product.stock > 0 ? "Stock Disponible" : "Agotado"}
            </span>
          </div>
        ) : null}

        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3 bg-slate-50/40 dark:bg-slate-900/40">
          {chat.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                Inicia la conversación
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs">
                {isProductInquiry
                  ? "Escribe cualquier consulta o duda sobre este producto y el vendedor te responderá enseguida."
                  : "Escribe cualquier duda o requerimiento sobre tu pedido y el vendedor te responderá directamente aquí."}
              </p>
            </div>
          ) : (
            chat.messages.map((msg) => {
              const isCustomer = msg.sender === "customer";

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isCustomer ? "items-end" : "items-start"} animate-in fade-in duration-150`}
                >
                  {/* Sender label */}
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mb-0.5 px-1">
                    {isCustomer ? "Tú" : "Vendedor (Tienda)"}
                  </span>

                  {/* Bubble */}
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] sm:max-w-[78%] shadow-xs ${
                      isCustomer
                        ? "bg-indigo-600 text-white rounded-tr-xs"
                        : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-tl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    <div
                      className={`flex items-center justify-end gap-1 text-[9px] mt-1 ${
                        isCustomer ? "text-indigo-200" : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      <span>{formatTime(msg.createdAt)}</span>
                      {isCustomer && <CheckCheck className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="p-2 sm:p-2.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0 font-medium pl-1">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>Sugerencias:</span>
          </div>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              className="text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors shrink-0 cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <Input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isProductInquiry
                  ? `Pregunta sobre ${product?.name}...`
                  : "Escribe tu mensaje sobre este pedido..."
              }
              className="flex-1 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus-visible:ring-indigo-500 h-9 sm:h-10"
              autoFocus
            />
            <Button
              type="submit"
              size="sm"
              disabled={!inputText.trim()}
              className="h-9 sm:h-10 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 cursor-pointer disabled:opacity-40"
              aria-label="Enviar mensaje"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline ml-1 text-xs font-semibold">Enviar</span>
            </Button>
          </form>

          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-1.5 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Chat directo y seguro dentro de la tienda • Sin aplicaciones externas</span>
          </p>
        </div>
      </div>
    </div>
  );
}
