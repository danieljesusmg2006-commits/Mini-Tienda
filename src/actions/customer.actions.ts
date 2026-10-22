"use server";

import { createClient } from "@/lib/supabase/server";
import { customerSchema, type CustomerInput } from "@/lib/validators/sale";
import { revalidatePath } from "next/cache";
import type { Customer } from "@/types/database.types";

// Datos de demostración en modo desarrollo/preview
const mockCustomers: Customer[] = [
  {
    id: "55555555-5555-5555-5555-555555555551",
    tax_id: "000-0000000-0",
    name: "Consumidor Final / Cliente General",
    email: "caja@empresa.com",
    phone: "N/A",
    address: "Venta en Mostrador",
    credit_limit: 0,
    current_balance: 0,
    is_active: true,
    created_at: "2026-09-01T10:00:00Z",
    updated_at: "2026-09-01T10:00:00Z",
  },
  {
    id: "55555555-5555-5555-5555-555555555552",
    tax_id: "402-1234567-8",
    name: "Taller Mecánico Hermanos Díaz",
    email: "taller.diaz@gmail.com",
    phone: "+1 809-555-0811",
    address: "Av. San Vicente de Paul #88, SDE",
    credit_limit: 50000.0,
    current_balance: 14200.0,
    is_active: true,
    created_at: "2026-09-15T12:00:00Z",
    updated_at: "2026-09-15T12:00:00Z",
  },
  {
    id: "55555555-5555-5555-5555-555555555553",
    tax_id: "131-98765-4",
    name: "Transportes y Flotillas del Norte SAS",
    email: "logistica@transnorte.do",
    phone: "+1 809-582-9900",
    address: "Santiago de los Caballeros",
    credit_limit: 150000.0,
    current_balance: 32500.0,
    is_active: true,
    created_at: "2026-09-20T15:00:00Z",
    updated_at: "2026-09-20T15:00:00Z",
  },
];

export async function getCustomersAction(): Promise<Customer[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured =
    supabaseUrl &&
    !supabaseUrl.includes("tu-proyecto") &&
    !supabaseUrl.includes("demo.supabase.co");

  if (!isConfigured) {
    return mockCustomers;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("name", { ascending: true });

    if (error || !data) return mockCustomers;
    return data;
  } catch {
    return mockCustomers;
  }
}

export async function createCustomerAction(data: CustomerInput) {
  const result = customerSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Datos inválidos" };
  }

  const { taxId, name, email, phone, address, creditLimit } = result.data;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured =
    supabaseUrl &&
    !supabaseUrl.includes("tu-proyecto") &&
    !supabaseUrl.includes("demo.supabase.co");

  if (!isConfigured) {
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      tax_id: taxId || null,
      name,
      email: email || null,
      phone: phone || null,
      address: address || null,
      credit_limit: creditLimit,
      current_balance: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockCustomers.push(newCustomer);
    revalidatePath("/clientes");
    revalidatePath("/ventas");
    return { success: true, customer: newCustomer };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("customers").insert({
      tax_id: taxId || null,
      name,
      email: email || null,
      phone: phone || null,
      address: address || null,
      credit_limit: creditLimit,
      current_balance: 0,
      is_active: true,
    });

    if (error) return { error: error.message };

    revalidatePath("/clientes");
    revalidatePath("/ventas");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function toggleCustomerStatusAction(id: string, currentStatus: boolean) {
  const nextStatus = !currentStatus;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured =
    supabaseUrl &&
    !supabaseUrl.includes("tu-proyecto") &&
    !supabaseUrl.includes("demo.supabase.co");

  if (!isConfigured) {
    const cust = mockCustomers.find((c) => c.id === id);
    if (cust) cust.is_active = nextStatus;
    revalidatePath("/clientes");
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("customers")
      .update({ is_active: nextStatus, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/clientes");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
