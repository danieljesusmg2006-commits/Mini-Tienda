"use server";

import { createClient } from "@/lib/supabase/server";
import type { AuditLog } from "@/types/database.types";

// Datos de auditoría para demostración
const mockAuditLogs: AuditLog[] = [
  {
    id: 104,
    user_id: "demo-user-id",
    action: "INSERT",
    table_name: "sales",
    record_id: "sale-1",
    old_data: null,
    new_data: { invoice_number: "FAC-2026-0001", total_amount: 1930.0, payment_method: "EFECTIVO" },
    created_at: "2026-10-01T14:30:00Z",
  },
  {
    id: 103,
    user_id: "demo-user-id",
    action: "UPDATE",
    table_name: "warehouse_stock",
    record_id: "ws-1",
    old_data: { product_id: "prod-1", current_stock: 87.0 },
    new_data: { product_id: "prod-1", current_stock: 85.0 },
    created_at: "2026-10-01T14:30:00Z",
  },
  {
    id: 102,
    user_id: "demo-user-id",
    action: "UPDATE",
    table_name: "purchases",
    record_id: "pur-1",
    old_data: { status: "SOLICITADO" },
    new_data: { status: "RECIBIDO", received_at: "2026-09-12T14:00:00Z" },
    created_at: "2026-09-12T14:00:00Z",
  },
  {
    id: 101,
    user_id: "demo-user-id",
    action: "INSERT",
    table_name: "products",
    record_id: "prod-1",
    old_data: null,
    new_data: { sku: "ACE-5W30-1L", sale_price: 550.0, cost_price: 380.0 },
    created_at: "2026-09-01T10:00:00Z",
  },
];

export async function getAuditLogsAction(): Promise<AuditLog[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured =
    supabaseUrl &&
    !supabaseUrl.includes("tu-proyecto") &&
    !supabaseUrl.includes("demo.supabase.co");

  if (!isConfigured) {
    return mockAuditLogs;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data) return mockAuditLogs;
    return data;
  } catch {
    return mockAuditLogs;
  }
}
