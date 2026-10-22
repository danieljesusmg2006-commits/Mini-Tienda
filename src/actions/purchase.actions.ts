"use server";

import { createClient } from "@/lib/supabase/server";
import { purchaseSchema, type PurchaseInput } from "@/lib/validators/purchase";
import { revalidatePath } from "next/cache";
import type { PurchaseWithDetails } from "@/types/database.types";

// Datos de demostración en modo desarrollo/preview
const mockPurchases: PurchaseWithDetails[] = [
  {
    id: "44444444-4444-4444-4444-444444444441",
    purchase_number: "OC-2026-001",
    supplier_id: "33333333-3333-3333-3333-333333333331",
    warehouse_id: "11111111-1111-1111-1111-111111111111",
    status: "RECIBIDO",
    payment_status: "PAGADO",
    subtotal: 45600.0,
    tax_amount: 8208.0,
    total_amount: 53808.0,
    notes: "Recepción completa de aceites y lubricantes",
    created_by: null,
    received_at: "2026-09-12T14:00:00Z",
    created_at: "2026-09-10T10:00:00Z",
    updated_at: "2026-09-12T14:00:00Z",
    supplier: {
      id: "33333333-3333-3333-3333-333333333331",
      tax_id: "101-55829-1",
      name: "Distribuidora Automotriz del Caribe SRL",
      contact_name: "Manuel Tejeda",
      email: "ventas@caribeauto.com",
      phone: "+1 809-567-8900",
      address: "Santo Domingo",
      is_active: true,
      created_at: "2026-09-01T10:00:00Z",
      updated_at: "2026-09-01T10:00:00Z",
    },
    warehouse: {
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
        id: "item-1",
        purchase_id: "44444444-4444-4444-4444-444444444441",
        product_id: "10000000-0000-0000-0000-000000000001",
        quantity_ordered: 120,
        quantity_received: 120,
        unit_cost: 380.0,
        subtotal: 45600.0,
        created_at: "2026-09-10T10:00:00Z",
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
    id: "44444444-4444-4444-4444-444444444442",
    purchase_number: "OC-2026-002",
    supplier_id: "33333333-3333-3333-3333-333333333332",
    warehouse_id: "11111111-1111-1111-1111-111111111111",
    status: "SOLICITADO",
    payment_status: "PENDIENTE",
    subtotal: 25200.0,
    tax_amount: 4536.0,
    total_amount: 29736.0,
    notes: "Entrega programada por camión de carga",
    created_by: null,
    received_at: null,
    created_at: "2026-09-25T11:00:00Z",
    updated_at: "2026-09-25T11:00:00Z",
    supplier: {
      id: "33333333-3333-3333-3333-333333333332",
      tax_id: "102-99432-8",
      name: "Importadora Global de Filtros y Baterías",
      contact_name: "Sonia Almonte",
      email: "pedidos@globalfiltros.com",
      phone: "+1 809-241-1122",
      address: "Santiago",
      is_active: true,
      created_at: "2026-09-02T11:00:00Z",
      updated_at: "2026-09-02T11:00:00Z",
    },
    warehouse: {
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
        id: "item-2",
        purchase_id: "44444444-4444-4444-4444-444444444442",
        product_id: "10000000-0000-0000-0000-000000000003",
        quantity_ordered: 6,
        quantity_received: 0,
        unit_cost: 4200.0,
        subtotal: 25200.0,
        created_at: "2026-09-25T11:00:00Z",
        product: {
          id: "10000000-0000-0000-0000-000000000003",
          sku: "BAT-12V-75AH",
          barcode: "7501000345678",
          name: "Batería Automotriz 12V 75Ah",
          description: null,
          category_id: null,
          cost_price: 4200.0,
          sale_price: 5950.0,
          min_stock: 5,
          max_stock: 40,
          unit_measure: "UND",
          image_url: null,
          is_active: true,
          created_at: "2026-09-03T12:00:00Z",
          updated_at: "2026-09-03T12:00:00Z",
        },
      },
    ],
  },
];

export async function getPurchasesAction(): Promise<PurchaseWithDetails[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured =
    supabaseUrl &&
    !supabaseUrl.includes("tu-proyecto") &&
    !supabaseUrl.includes("demo.supabase.co");

  if (!isConfigured) {
    return mockPurchases;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("purchases")
      .select(`
        *,
        supplier:suppliers(*),
        warehouse:warehouses(*),
        items:purchase_items(*, product:products(*))
      `)
      .order("created_at", { ascending: false });

    if (error || !data) return mockPurchases;
    return data;
  } catch {
    return mockPurchases;
  }
}

export async function createPurchaseAction(data: PurchaseInput) {
  const result = purchaseSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Datos de orden inválidos" };
  }

  const { supplierId, warehouseId, notes, items } = result.data;
  const subtotal = items.reduce((acc, it) => acc + it.quantityOrdered * it.unitCost, 0);
  const taxAmount = roundTwoDecimals(subtotal * 0.18); // ITBIS / IVA 18%
  const totalAmount = roundTwoDecimals(subtotal + taxAmount);
  const purchaseNumber = `OC-${new Date().getFullYear()}-${String(mockPurchases.length + 1).padStart(3, "0")}`;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured =
    supabaseUrl &&
    !supabaseUrl.includes("tu-proyecto") &&
    !supabaseUrl.includes("demo.supabase.co");

  if (!isConfigured) {
    const newPurchase: PurchaseWithDetails = {
      id: `pur-${Date.now()}`,
      purchase_number: purchaseNumber,
      supplier_id: supplierId,
      warehouse_id: warehouseId,
      status: "SOLICITADO",
      payment_status: "PENDIENTE",
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      notes: notes || null,
      created_by: null,
      received_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: items.map((it, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        purchase_id: `pur-${Date.now()}`,
        product_id: it.productId,
        quantity_ordered: it.quantityOrdered,
        quantity_received: 0,
        unit_cost: it.unitCost,
        subtotal: roundTwoDecimals(it.quantityOrdered * it.unitCost),
        created_at: new Date().toISOString(),
      })),
    };

    mockPurchases.unshift(newPurchase);
    revalidatePath("/compras");
    revalidatePath("/dashboard");
    return { success: true, purchase: newPurchase };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Inserción en Purchases
    const { data: purchaseRow, error: pError } = await supabase
      .from("purchases")
      .insert({
        purchase_number: purchaseNumber,
        supplier_id: supplierId,
        warehouse_id: warehouseId,
        status: "SOLICITADO",
        payment_status: "PENDIENTE",
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        notes: notes || null,
        created_by: user?.id || null,
      })
      .select()
      .single();

    if (pError) return { error: pError.message };

    // Inserción en Purchase Items
    const itemsToInsert = items.map((it) => ({
      purchase_id: purchaseRow.id,
      product_id: it.productId,
      quantity_ordered: it.quantityOrdered,
      quantity_received: 0,
      unit_cost: it.unitCost,
      subtotal: roundTwoDecimals(it.quantityOrdered * it.unitCost),
    }));

    const { error: itemsError } = await supabase
      .from("purchase_items")
      .insert(itemsToInsert);

    if (itemsError) return { error: itemsError.message };

    revalidatePath("/compras");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function receivePurchaseAction(purchaseId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured =
    supabaseUrl &&
    !supabaseUrl.includes("tu-proyecto") &&
    !supabaseUrl.includes("demo.supabase.co");

  if (!isConfigured) {
    const purchase = mockPurchases.find((p) => p.id === purchaseId);
    if (!purchase) return { error: "Orden no encontrada" };
    if (purchase.status === "RECIBIDO") return { error: "Esta orden ya fue recibida" };

    purchase.status = "RECIBIDO";
    purchase.received_at = new Date().toISOString();
    purchase.updated_at = new Date().toISOString();
    if (purchase.items) {
      purchase.items.forEach((it) => {
        it.quantity_received = it.quantity_ordered;
      });
    }

    revalidatePath("/compras");
    revalidatePath("/inventario");
    revalidatePath("/movimientos");
    revalidatePath("/dashboard");
    return { success: true, message: `Orden ${purchase.purchase_number} recibida en almacén exitosamente` };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Invocar el procedimiento almacenado transaccional en PostgreSQL
    const { data: result, error } = await supabase.rpc("receive_purchase_order", {
      p_purchase_id: purchaseId,
      p_user_id: user?.id || null,
    });

    if (error) return { error: error.message };

    revalidatePath("/compras");
    revalidatePath("/inventario");
    revalidatePath("/movimientos");
    revalidatePath("/dashboard");
    return { success: true, message: "Mercancía recibida e inventario actualizado" };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function cancelPurchaseAction(purchaseId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured =
    supabaseUrl &&
    !supabaseUrl.includes("tu-proyecto") &&
    !supabaseUrl.includes("demo.supabase.co");

  if (!isConfigured) {
    const purchase = mockPurchases.find((p) => p.id === purchaseId);
    if (!purchase) return { error: "Orden no encontrada" };
    if (purchase.status === "RECIBIDO") return { error: "No se puede cancelar una orden ya recibida" };
    purchase.status = "CANCELADO";
    revalidatePath("/compras");
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("purchases")
      .update({ status: "CANCELADO", updated_at: new Date().toISOString() })
      .eq("id", purchaseId);

    if (error) return { error: error.message };
    revalidatePath("/compras");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

function roundTwoDecimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
