import { NextRequest, NextResponse } from "next/server";
import {
  getServerOrders,
  addServerOrder,
  updateServerOrder,
  deleteServerOrder,
} from "@/lib/server/ordersServerStore";
import { getOrCreateServerChat } from "@/lib/server/chatServerStore";
import { syncOrderToSupabase } from "@/lib/server/supabaseSync";
import { Order } from "@/types/store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const orders = getServerOrders();
    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    console.error("Error in GET /api/orders:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Error al obtener pedidos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const order: Order = body;

    if (!order || !order.id) {
      return NextResponse.json(
        { success: false, error: "Datos de orden inválidos" },
        { status: 400 }
      );
    }

    const saved = addServerOrder(order);

    // Sync to Supabase in background if configured
    syncOrderToSupabase(saved).catch(() => {});

    // Auto-initialize chat for this order on the server
    try {
      getOrCreateServerChat(
        order.id,
        order.customerName,
        order.email,
        order.phone
      );
    } catch (e) {
      console.warn("Could not auto-create chat for order:", e);
    }

    return NextResponse.json({ success: true, order: saved });
  } catch (err: any) {
    console.error("Error in POST /api/orders:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Error al registrar orden" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...partial } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID de orden requerido" },
        { status: 400 }
      );
    }

    const updated = updateServerOrder(id, partial);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    console.error("Error in PUT /api/orders:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Error al actualizar orden" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID de orden requerido" },
        { status: 400 }
      );
    }

    const deleted = deleteServerOrder(id);
    return NextResponse.json({ success: true, deleted });
  } catch (err: any) {
    console.error("Error in DELETE /api/orders:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Error al eliminar orden" },
      { status: 500 }
    );
  }
}
