"use server";

import { createClient } from "@/lib/supabase/server";
import { supplierSchema, type SupplierInput } from "@/lib/validators/purchase";
import { revalidatePath } from "next/cache";
import type { Supplier } from "@/types/database.types";

// Datos de demostración en modo desarrollo/preview
const mockSuppliers: Supplier[] = [
  {
    id: "33333333-3333-3333-3333-333333333331",
    tax_id: "101-55829-1",
    name: "Distribuidora Automotriz del Caribe SRL",
    contact_name: "Manuel Tejeda",
    email: "ventas@caribeauto.com",
    phone: "+1 809-567-8900",
    address: "Zona Industrial Herrera, Santo Domingo",
    is_active: true,
    created_at: "2026-09-01T10:00:00Z",
    updated_at: "2026-09-01T10:00:00Z",
  },
  {
    id: "33333333-3333-3333-3333-333333333332",
    tax_id: "102-99432-8",
    name: "Importadora Global de Filtros y Baterías",
    contact_name: "Sonia Almonte",
    email: "pedidos@globalfiltros.com",
    phone: "+1 809-241-1122",
    address: "Parque Industrial Tamboril, Santiago",
    is_active: true,
    created_at: "2026-09-02T11:00:00Z",
    updated_at: "2026-09-02T11:00:00Z",
  },
];

export async function getSuppliersAction(): Promise<Supplier[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured =
    supabaseUrl &&
    !supabaseUrl.includes("tu-proyecto") &&
    !supabaseUrl.includes("demo.supabase.co");

  if (!isConfigured) {
    return mockSuppliers;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .order("name", { ascending: true });

    if (error || !data) return mockSuppliers;
    return data;
  } catch {
    return mockSuppliers;
  }
}

export async function createSupplierAction(data: SupplierInput) {
  const result = supplierSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Datos inválidos" };
  }

  const { taxId, name, contactName, email, phone, address } = result.data;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured =
    supabaseUrl &&
    !supabaseUrl.includes("tu-proyecto") &&
    !supabaseUrl.includes("demo.supabase.co");

  if (!isConfigured) {
    const newSupplier: Supplier = {
      id: `sup-${Date.now()}`,
      tax_id: taxId || null,
      name,
      contact_name: contactName || null,
      email: email || null,
      phone: phone || null,
      address: address || null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockSuppliers.unshift(newSupplier);
    revalidatePath("/compras");
    return { success: true, supplier: newSupplier };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("suppliers").insert({
      tax_id: taxId || null,
      name,
      contact_name: contactName || null,
      email: email || null,
      phone: phone || null,
      address: address || null,
      is_active: true,
    });

    if (error) return { error: error.message };

    revalidatePath("/compras");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function toggleSupplierStatusAction(id: string, currentStatus: boolean) {
  const nextStatus = !currentStatus;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured =
    supabaseUrl &&
    !supabaseUrl.includes("tu-proyecto") &&
    !supabaseUrl.includes("demo.supabase.co");

  if (!isConfigured) {
    const sup = mockSuppliers.find((s) => s.id === id);
    if (sup) sup.is_active = nextStatus;
    revalidatePath("/compras");
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("suppliers")
      .update({ is_active: nextStatus, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/compras");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
