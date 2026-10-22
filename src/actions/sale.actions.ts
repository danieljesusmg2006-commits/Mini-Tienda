"use server";

import { createClient } from "@/lib/supabase/server";
import { saleSchema, type SaleInput } from "@/lib/validators/sale";
import { revalidatePath } from "next/cache";
import type { SaleWithDetails } from "@/types/database.types";

// Ventas demostrativas iniciales
const mockSales: SaleWithDetails[] = [
  {
    id: "sale-1",
    invoice_number: "FAC-2026-0001",
    customer_id: "55555555-5555-5555-5555-555555555551",
    warehouse_id: "11111111-1111-1111-1111-111111111111",
    status: "COMPLETADA",
    payment_method: "EFECTIVO",
    amount_paid: 2000.0,
    change_returned: 70.0,
    subtotal: 1635.59,
    tax_amount: 294.41,
    discount_amount: 0,
    total_amount: 1930.0,
    notes: "Venta en mostrador",
    created_by: null,
    created_at: "2026-10-01T14:30:00Z",
    updated_at: "2026-10-01T14:30:00Z",
    customer: {
      id: "55555555-5555-5555-5555-555555555551",
      tax_id: "000-0000000-0",
      name: "Consumidor Final / Cliente General",
      email: null,
      phone: null,
      address: null,
      credit_limit: 0,
      current_balance: 0,
      is_active: true,
      created_at: "2026-09-01T10:00:00Z",
      updated_at: "2026-09-01T10:00:00Z",
    },
    warehouse: {
      id: "11111111-1111-1111-1111-111111111111",
      code: "ALM-CENTRAL",
      name: "Almacén Central (Matriz)",
      address: null,
      phone: null,
      manager_name: null,
      is_active: true,
      created_at: "2026-09-01T10:00:00Z",
    },
    items: [
      {
        id: "s-item-1",
        sale_id: "sale-1",
        product_id: "10000000-0000-0000-0000-000000000001",
        quantity: 2,
        unit_price: 550.0,
        unit_cost: 380.0,
        subtotal: 1100.0,
        created_at: "2026-10-01T14:30:00Z",
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

export async function getSalesAction(): Promise<SaleWithDetails[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured =
    supabaseUrl &&
    !supabaseUrl.includes("tu-proyecto") &&
    !supabaseUrl.includes("demo.supabase.co");

  if (!isConfigured) {
    return mockSales;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("sales")
      .select(`
        *,
        customer:customers(*),
        warehouse:warehouses(*),
        items:sale_items(*, product:products(*))
      `)
      .order("created_at", { ascending: false });

    if (error || !data) return mockSales;
    return data;
  } catch {
    return mockSales;
  }
}

export async function processSaleAction(data: SaleInput) {
  const result = saleSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Datos de venta inválidos" };
  }

  const { customerId, warehouseId, paymentMethod, amountPaid, discountAmount, notes, items } = result.data;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured =
    supabaseUrl &&
    !supabaseUrl.includes("tu-proyecto") &&
    !supabaseUrl.includes("demo.supabase.co");

  if (!isConfigured) {
    const subtotal = items.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0) - discountAmount;
    const tax = roundTwoDecimals(subtotal * 0.18);
    const total = roundTwoDecimals(subtotal + tax);
    const change = paymentMethod === "EFECTIVO" ? Math.max(0, amountPaid - total) : 0;
    const invoiceNum = `FAC-${new Date().getFullYear()}-${String(mockSales.length + 1).padStart(4, "0")}`;

    const newSale: SaleWithDetails = {
      id: `sale-${Date.now()}`,
      invoice_number: invoiceNum,
      customer_id: customerId,
      warehouse_id: warehouseId,
      status: "COMPLETADA",
      payment_method: paymentMethod,
      amount_paid: paymentMethod === "EFECTIVO" ? amountPaid : total,
      change_returned: change,
      subtotal,
      tax_amount: tax,
      discount_amount: discountAmount,
      total_amount: total,
      notes: notes || null,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: items.map((it, idx) => ({
        id: `s-item-${Date.now()}-${idx}`,
        sale_id: `sale-${Date.now()}`,
        product_id: it.productId,
        quantity: it.quantity,
        unit_price: it.unitPrice,
        unit_cost: 0,
        subtotal: roundTwoDecimals(it.quantity * it.unitPrice),
        created_at: new Date().toISOString(),
      })),
    };

    mockSales.unshift(newSale);
    revalidatePath("/ventas");
    revalidatePath("/inventario");
    revalidatePath("/dashboard");
    return {
      success: true,
      sale: newSale,
      invoiceNumber: invoiceNum,
      changeReturned: change,
      totalAmount: total,
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Invocación del procedimiento PL/pgSQL transaccional con bloqueos ACID
    const { data: res, error } = await supabase.rpc("process_pos_sale", {
      p_customer_id: customerId,
      p_warehouse_id: warehouseId,
      p_payment_method: paymentMethod,
      p_amount_paid: amountPaid,
      p_discount: discountAmount,
      p_items: items.map((it) => ({
        product_id: it.productId,
        quantity: it.quantity,
        unit_price: it.unitPrice,
      })),
      p_notes: notes || null,
      p_user_id: user?.id || null,
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/ventas");
    revalidatePath("/inventario");
    revalidatePath("/dashboard");

    return {
      success: true,
      invoiceNumber: res.invoice_number,
      changeReturned: res.change_returned,
      totalAmount: res.total_amount,
    };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function cancelSaleAction(saleId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured =
    supabaseUrl &&
    !supabaseUrl.includes("tu-proyecto") &&
    !supabaseUrl.includes("demo.supabase.co");

  if (!isConfigured) {
    const sale = mockSales.find((s) => s.id === saleId);
    if (!sale) return { error: "Venta no encontrada" };
    sale.status = "ANULADA";
    revalidatePath("/ventas");
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("sales")
      .update({ status: "ANULADA", updated_at: new Date().toISOString() })
      .eq("id", saleId);

    if (error) return { error: error.message };
    revalidatePath("/ventas");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

function roundTwoDecimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
