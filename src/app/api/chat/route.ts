import { NextRequest, NextResponse } from "next/server";
import {
  getServerChats,
  addServerChatMessage,
  markServerChatAsRead,
  getOrCreateServerChat,
  deleteServerChat,
} from "@/lib/server/chatServerStore";
import { syncChatMessageToSupabase } from "@/lib/server/supabaseSync";
import { ChatSenderRole } from "@/types/store";

// Prevent Next.js from aggressively caching this route handler
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    const chats = getServerChats();

    if (orderId) {
      const chat = chats[orderId] || null;
      return NextResponse.json({ success: true, chat });
    }

    return NextResponse.json({ success: true, chats });
  } catch (err: any) {
    console.error("Error in GET /api/chat:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Error al obtener chats" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, sender, senderName, text, customerMeta, action } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "El orderId es obligatorio" },
        { status: 400 }
      );
    }

    // Action: create chat if doesn't exist yet
    if (action === "init" || (!text && !sender)) {
      const chat = getOrCreateServerChat(
        orderId,
        customerMeta?.name || "Cliente",
        customerMeta?.email,
        customerMeta?.phone
      );
      return NextResponse.json({ success: true, chat });
    }

    if (!sender || !text) {
      return NextResponse.json(
        { success: false, error: "sender y text son obligatorios para enviar mensajes" },
        { status: 400 }
      );
    }

    const result = addServerChatMessage(
      orderId,
      sender as ChatSenderRole,
      senderName || (sender === "seller" ? "Soporte Mini Tienda" : "Cliente"),
      text,
      customerMeta
    );

    // Sync to Supabase in background if configured
    syncChatMessageToSupabase(result.chat, result.message).catch(() => {});

    return NextResponse.json({
      success: true,
      message: result.message,
      chat: result.chat,
    });
  } catch (err: any) {
    console.error("Error in POST /api/chat:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Error al procesar mensaje" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, reader } = body;

    if (!orderId || !reader) {
      return NextResponse.json(
        { success: false, error: "orderId y reader son obligatorios" },
        { status: 400 }
      );
    }

    const chat = markServerChatAsRead(orderId, reader as "customer" | "seller");
    return NextResponse.json({ success: true, chat });
  } catch (err: any) {
    console.error("Error in PATCH /api/chat:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Error al actualizar lectura" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "orderId es obligatorio" },
        { status: 400 }
      );
    }

    const deleted = deleteServerChat(orderId);
    return NextResponse.json({ success: true, deleted });
  } catch (err: any) {
    console.error("Error in DELETE /api/chat:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Error al eliminar chat" },
      { status: 500 }
    );
  }
}
