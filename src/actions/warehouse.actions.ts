"use server";

import { createClient } from "@/lib/supabase/server";
import { warehouseSchema, type WarehouseInput } from "@/lib/validators/warehouse";
import { revalidatePath } from "next/cache";
import type { Warehouse } from "@/types/database.types";

// Datos de demostración en caso de que Supabase esté en modo preview local
const mockWarehouses: Warehouse[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    code: "ALM-CENTRAL",
    name: "Almacén Central (Matriz)",
    address: "Av. 27 de Febrero #450, Santo Domingo",
    phone: "+1 809-555-0101",
    manager_name: "Carlos Martínez",
    is_active: true,
    created_at: "2026-09-01T10:00:00Z",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    code: "SUC-NORTE",
    name: "Sucursal Norte",
    address: "Autopista Duarte Km 9, Santiago",
    phone: "+1 809-555-0102",
    manager_name: "Elena Ramos",
    is_active: true,
    created_at: "2026-09-10T14:30:00Z",
  },
];

export async function getWarehousesAction(): Promise<{ data: Warehouse[]; error?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured =
    supabaseUrl &&
    !supabaseUrl.includes("tu-proyecto") &&
    !supabaseUrl.includes("demo.supabase.co");

  if (!isConfigured) {
    return { data: mockWarehouses };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("warehouses")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      return { data: mockWarehouses, error: error.message };
    }

    return { data: data || [] };
  } catch (err: any) {
    return { data: mockWarehouses, error: err.message };
  }
}

export async function createWarehouseAction(data: WarehouseInput) {
  const result = warehouseSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Datos inválidos" };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured =
    supabaseUrl &&
    !supabaseUrl.includes("tu-proyecto") &&
    !supabaseUrl.includes("demo.supabase.co");

  if (!isConfigured) {
    mockWarehouses.push({
      id: `wh-${Date.now()}`,
      code: result.data.code,
      name: result.data.name,
      address: result.data.address || null,
      phone: result.data.phone || null,
      manager_name: result.data.managerName || null,
      is_active: true,
      created_at: new Date().toISOString(),
    });
    revalidatePath("/almacenes");
    revalidatePath("/inventario");
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("warehouses").insert({
      code: result.data.code,
      name: result.data.name,
      address: result.data.address || null,
      phone: result.data.phone || null,
      manager_name: result.data.managerName || null,
      is_active: true,
    });

    if (error) {
      return { error: `Error al crear almacén: ${error.message}` };
    }

    revalidatePath("/almacenes");
    revalidatePath("/inventario");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function toggleWarehouseStatusAction(id: string, currentStatus: boolean) {
  const nextStatus = !currentStatus;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured =
    supabaseUrl &&
    !supabaseUrl.includes("tu-proyecto") &&
    !supabaseUrl.includes("demo.supabase.co");

  if (!isConfigured) {
    const wh = mockWarehouses.find((w) => w.id === id);
    if (wh) wh.is_active = nextStatus;
    revalidatePath("/almacenes");
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("warehouses")
      .update({ is_active: nextStatus })
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/almacenes");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
