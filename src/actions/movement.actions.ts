"use server";

import { createClient } from "@/lib/supabase/server";
import {
  transferStockSchema,
  adjustmentStockSchema,
  type TransferStockInput,
  type AdjustmentStockInput,
} from "@/lib/validators/purchase";
import { revalidatePath } from "next/cache";
import type { InventoryMovementWithDetails } from "@/types/database.types";

// Movimientos de demostración para el Kardex
const mockMovements: InventoryMovementWithDetails[] = [
  {
    id: "mov-1",
    movement_number: "MOV-REC-20260912-140000",
    type: "ENTRADA",
    source_warehouse_id: null,
    target_warehouse_id: "11111111-1111-1111-1111-111111111111",
    reference_type: "COMPRA",
    reference_id: "OC-2026-001",
    reason: "Recepción de Orden de Compra #OC-2026-001",
    performed_by: null,
    created_at: "2026-09-12T14:00:00Z",
    target_warehouse: {
      id: "11111111-1111-1111-1111-111111111111",
      code: "ALM-CENTRAL",
      name: "Almacén Central (Matriz)",
      address: "Av. 27 de Febrero",
      phone: "+1 809-555-0101",
      manager_name: "Carlos Martínez",
      is_active: true,
      created_at: "2026-09-01T10:00:00Z",
    },
    items: [
      {
        id: "mov-item-1",
        movement_id: "mov-1",
        product_id: "10000000-0000-0000-0000-000000000001",
        quantity: 120,
        unit_cost: 380.0,
        total_cost: 45600.0,
        created_at: "2026-09-12T14:00:00Z",
        product: {
          id: "10000000-0000-0000-0000-000000000001",
          sku: "ACE-5W30-1L",
          barcode: "7501000123456",
          name: "Aceite Sintético 5W-30 (1L)",
          description: null,
          category_id: null,
          cost_price: 380.0,
          sale_price: 550.0,
          min_stock: 15,
          max_stock: 200,
          unit_measure: "UND",
          image_url: null,
          is_active: true,
          created_at: "2026-09-01T10:00:00Z",
          updated_at: "2026-09-01T10:00:00Z",
        },
      },
    ],
  },
  {
    id: "mov-2",
    movement_number: "TR-20260918-093000",
    type: "TRASLADO",
    source_warehouse_id: "11111111-1111-1111-1111-111111111111",
    target_warehouse_id: "22222222-2222-2222-2222-222222222222",
    reference_type: "TRASLADO_MANUAL",
    reference_id: "TR-088",
    reason: "Reposición de stock para Sucursal Norte",
    performed_by: null,
    created_at: "2026-09-18T09:30:00Z",
    source_warehouse: {
      id: "11111111-1111-1111-1111-111111111111",
      code: "ALM-CENTRAL",
      name: "Almacén Central (Matriz)",
      address: null,
      phone: null,
      manager_name: null,
      is_active: true,
      created_at: "2026-09-01T10:00:00Z",
    },
    target_warehouse: {
      id: "22222222-2222-2222-2222-222222222222",
      code: "SUC-NORTE",
      name: "Sucursal Norte",
      address: null,
      phone: null,
      manager_name: null,
      is_active: true,
      created_at: "2026-09-10T14:30:00Z",
    },
    items: [
      {
        id: "mov-item-2",
        movement_id: "mov-2",
        product_id: "10000000-0000-0000-0000-000000000001",
        quantity: 20,
        unit_cost: 380.0,
        total_cost: 7600.0,
        created_at: "2026-09-18T09:30:00Z",
        product: {
          id: "10000000-0000-0000-0000-000000000001",
          sku: "ACE-5W30-1L",
          barcode: "7501000123456",
          name: "Aceite Sintético 5W-30 (1L)",
          description: null,
          category_id: null,
          cost_price: 380.0,
          sale_price: 550.0,
          min_stock: 15,
          max_stock: 200,
          unit_measure: "UND",
          image_url: null,
          is_active: true,
          created_at: "2026-09-01T10:00:00Z",
          updated_at: "2026-09-01T10:00:00Z",
        },
      },
    ],
  },
];

export async function getMovementsAction(filters?: {
  type?: string;
  warehouseId?: string;
}): Promise<InventoryMovementWithDetails[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured =
    supabaseUrl &&
    !supabaseUrl.includes("tu-proyecto") &&
    !supabaseUrl.includes("demo.supabase.co");

  if (!isConfigured) {
    let result = [...mockMovements];
    if (filters?.type && filters.type !== "ALL") {
      result = result.filter((m) => m.type === filters.type);
    }
    if (filters?.warehouseId && filters.warehouseId !== "ALL") {
      result = result.filter(
        (m) =>
          m.source_warehouse_id === filters.warehouseId ||
          m.target_warehouse_id === filters.warehouseId
      );
    }
    return result;
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from("inventory_movements")
      .select(`
        *,
        source_warehouse:warehouses!source_warehouse_id(*),
        target_warehouse:warehouses!target_warehouse_id(*),
        items:inventory_movement_items(*, product:products(*))
      `)
      .order("created_at", { ascending: false });

    if (filters?.type && filters.type !== "ALL") {
      query = query.eq("type", filters.type);
    }

    const { data, error } = await query;
    if (error || !data) return mockMovements;
    return data;
  } catch {
    return mockMovements;
  }
}

export async function executeTransferAction(data: TransferStockInput) {
  const result = transferStockSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Datos de traslado inválidos" };
  }

  const { sourceWarehouseId, targetWarehouseId, productId, quantity, reason } = result.data;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured =
    supabaseUrl &&
    !supabaseUrl.includes("tu-proyecto") &&
    !supabaseUrl.includes("demo.supabase.co");

  if (!isConfigured) {
    const movNumber = `TR-${Date.now().toString().slice(-6)}`;
    const newMovement: InventoryMovementWithDetails = {
      id: `mov-${Date.now()}`,
      movement_number: movNumber,
      type: "TRASLADO",
      source_warehouse_id: sourceWarehouseId,
      target_warehouse_id: targetWarehouseId,
      reference_type: "TRASLADO_MANUAL",
      reference_id: movNumber,
      reason,
      performed_by: null,
      created_at: new Date().toISOString(),
      items: [
        {
          id: `item-${Date.now()}`,
          movement_id: `mov-${Date.now()}`,
          product_id: productId,
          quantity,
          unit_cost: 0,
          total_cost: 0,
          created_at: new Date().toISOString(),
        },
      ],
    };
    mockMovements.unshift(newMovement);
    revalidatePath("/movimientos");
    revalidatePath("/inventario");
    revalidatePath("/dashboard");
    return { success: true, message: `Traslado ${movNumber} registrado con éxito` };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: res, error } = await supabase.rpc("execute_stock_transfer", {
      p_source_wh: sourceWarehouseId,
      p_target_wh: targetWarehouseId,
      p_product_id: productId,
      p_quantity: quantity,
      p_reason: reason,
      p_user_id: user?.id || null,
    });

    if (error) return { error: error.message };

    revalidatePath("/movimientos");
    revalidatePath("/inventario");
    revalidatePath("/dashboard");
    return { success: true, message: "Traslado completado exitosamente" };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function executeAdjustmentAction(data: AdjustmentStockInput) {
  const result = adjustmentStockSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Datos de ajuste inválidos" };
  }

  const { warehouseId, productId, type, quantity, reason } = result.data;
  const movNumber = `AJ-${type === "ENTRADA" ? "ENT" : "SAL"}-${Date.now().toString().slice(-6)}`;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured =
    supabaseUrl &&
    !supabaseUrl.includes("tu-proyecto") &&
    !supabaseUrl.includes("demo.supabase.co");

  if (!isConfigured) {
    const newMovement: InventoryMovementWithDetails = {
      id: `mov-${Date.now()}`,
      movement_number: movNumber,
      type: "AJUSTE",
      source_warehouse_id: type === "SALIDA" ? warehouseId : null,
      target_warehouse_id: type === "ENTRADA" ? warehouseId : null,
      reference_type: "AJUSTE_INVENTARIO",
      reference_id: movNumber,
      reason,
      performed_by: null,
      created_at: new Date().toISOString(),
      items: [
        {
          id: `item-${Date.now()}`,
          movement_id: `mov-${Date.now()}`,
          product_id: productId,
          quantity,
          unit_cost: 0,
          total_cost: 0,
          created_at: new Date().toISOString(),
        },
      ],
    };
    mockMovements.unshift(newMovement);
    revalidatePath("/movimientos");
    revalidatePath("/inventario");
    revalidatePath("/dashboard");
    return { success: true, message: `Ajuste ${movNumber} registrado con éxito` };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Inserción en cabecera de movimiento
    const { data: movRow, error: movError } = await supabase
      .from("inventory_movements")
      .insert({
        movement_number: movNumber,
        type: "AJUSTE",
        source_warehouse_id: type === "SALIDA" ? warehouseId : null,
        target_warehouse_id: type === "ENTRADA" ? warehouseId : null,
        reference_type: "AJUSTE_INVENTARIO",
        reason,
        performed_by: user?.id || null,
      })
      .select()
      .single();

    if (movError) return { error: movError.message };

    // Inserción del detalle
    await supabase.from("inventory_movement_items").insert({
      movement_id: movRow.id,
      product_id: productId,
      quantity,
      unit_cost: 0,
      total_cost: 0,
    });

    // Actualizar stock del producto en el almacén
    if (type === "ENTRADA") {
      await supabase.from("warehouse_stock").upsert({
        product_id: productId,
        warehouse_id: warehouseId,
        current_stock: quantity,
      });
    }

    revalidatePath("/movimientos");
    revalidatePath("/inventario");
    revalidatePath("/dashboard");
    return { success: true, message: "Ajuste de inventario procesado" };
  } catch (err: any) {
    return { error: err.message };
  }
}
