import { createClient } from "@supabase/supabase-js";
import { Order, OrderChat, ChatMessage } from "@/types/store";

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Boolean(
    url &&
      url.startsWith("https://") &&
      !url.includes("demo.supabase.co") &&
      key &&
      key !== "demo-anon-key" &&
      key !== "demo-service-role-key"
  );
}

function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export async function syncOrderToSupabase(order: Order): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    await supabase.from("orders").upsert({
      id: order.id,
      customer_name: order.customerName,
      email: order.email,
      phone: order.phone,
      address: order.address,
      payment_method: order.paymentMethod,
      items: order.items,
      subtotal: order.subtotal,
      total: order.total,
      status: order.status,
      is_guest: order.isGuest ?? false,
      customer_email: order.customerEmail || null,
      created_at: order.createdAt,
      updated_at: order.updatedAt || new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Supabase order sync warning:", err);
  }
}

export async function syncChatMessageToSupabase(
  chat: OrderChat,
  message: ChatMessage
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    // 1. Ensure chat record exists
    await supabase.from("order_chats").upsert({
      order_id: chat.orderId,
      customer_name: chat.customerName,
      customer_email: chat.customerEmail || null,
      customer_phone: chat.customerPhone || null,
      last_message: chat.lastMessage || null,
      last_message_at: chat.lastMessageAt || new Date().toISOString(),
      unread_for_admin: chat.unreadForAdmin ?? 0,
      unread_for_customer: chat.unreadForCustomer ?? 0,
      updated_at: new Date().toISOString(),
    });

    // 2. Insert message
    await supabase.from("chat_messages").upsert({
      id: message.id,
      order_id: message.orderId,
      sender: message.sender,
      sender_name: message.senderName,
      text: message.text,
      read_by_customer: message.readByCustomer ?? false,
      read_by_seller: message.readBySeller ?? false,
      created_at: message.createdAt,
    });
  } catch (err) {
    console.warn("Supabase message sync warning:", err);
  }
}
