"use server";

import { createClient } from "@/lib/supabase/server";
import { productSchema, type ProductInput } from "@/lib/validators/product";
import { revalidatePath } from "next/cache";
import type { Category, ProductWithStock } from "@/types/database.types";

// Categorías de demostración
const mockCategories: Category[] = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    name: "Lubricantes y Fluidos",
    slug: "lubricantes-fluidos",
    description: "Aceites de motor, refrigerantes y líquidos de freno",
    created_at: "2026-09-01T10:00:00Z",
  },
  {
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    name: "Filtros y Mantenimiento",
    slug: "filtros-mantenimiento",
    description: "Filtros de aceite, aire, cabina y combustible",
    created_at: "2026-09-01T10:00:00Z",
  },
  {
    id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    name: "Baterías y Sistema Eléctrico",
    slug: "baterias-electrico",
    description: "Baterías automotrices, bujías y fusibles",
    created_at: "2026-09-01T10:00:00Z",
  },
  {
    id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    name: "Frenos y Suspensión",
    slug: "frenos-suspension",
    description: "Pastillas, discos, amortiguadores y terminales",
    created_at: "2026-09-01T10:00:00Z",
  },
];

// Productos de demostración con stock asignado
const mockProducts: ProductWithStock[] = [
  {
    id: "10000000-0000-0000-0000-000000000001",
    sku: "ACE-5W30-1L",
    barcode: "7501000123456",
    name: "Aceite Sintético 5W-30 (1L)",
    description: "Lubricante sintético de alto rendimiento para motores a gasolina",
    category_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    category: mockCategories[0],
    cost_price: 380.0,
    sale_price: 550.0,
    min_stock: 15.0,
    max_stock: 200.0,
    unit_measure: "UND",
    image_url: null,
    is_active: true,
    total_stock: 105.0,
    created_at: "2026-09-01T10:00:00Z",
    updated_at: "2026-09-01T10:00:00Z",
  },
  {
    id: "10000000-0000-0000-0000-000000000002",
    sku: "FIL-AIR-TY01",
    barcode: "7501000234567",
    name: "Filtro de Aire Toyota Corolla",
    description: "Filtro de aire de alto flujo compatible con modelos 2014-2022",
    category_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    category: mockCategories[1],
    cost_price: 220.0,
    sale_price: 420.0,
    min_stock: 10.0,
    max_stock: 80.0,
    unit_measure: "UND",
    image_url: null,
    is_active: true,
    total_stock: 4.0, // Bajo stock
    created_at: "2026-09-02T11:00:00Z",
    updated_at: "2026-09-02T11:00:00Z",
  },
  {
    id: "10000000-0000-0000-0000-000000000003",
    sku: "BAT-12V-75AH",
    barcode: "7501000345678",
    name: "Batería Automotriz 12V 75Ah",
    description: "Batería libre de mantenimiento con 24 meses de garantía",
    category_id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    category: mockCategories[2],
    cost_price: 4200.0,
    sale_price: 5950.0,
    min_stock: 5.0,
    max_stock: 40.0,
    unit_measure: "UND",
    image_url: null,
    is_active: true,
    total_stock: 12.0,
    created_at: "2026-09-03T12:00:00Z",
    updated_at: "2026-09-03T12:00:00Z",
  },
  {
    id: "10000000-0000-0000-0000-000000000004",
    sku: "PAS-FRN-FR01",
    barcode: "7501000456789",
    name: "Pastillas de Freno Cerámicas Delanteras",
    description: "Juego de pastillas cerámicas de baja emisión de polvo",
    category_id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    category: mockCategories[3],
    cost_price: 850.0,
    sale_price: 1400.0,
    min_stock: 8.0,
    max_stock: 60.0,
    unit_measure: "JGO",
    image_url: null,
    is_active: true,
    total_stock: 25.0,
    created_at: "2026-09-04T14:00:00Z",
    updated_at: "2026-09-04T14:00:00Z",
  },
  {
    id: "10000000-0000-0000-0000-000000000005",
    sku: "REF-5050-GAL",
    barcode: "7501000567890",
    name: "Refrigerante 50/50 Verde (1 Galón)",
    description: "Protección contra corrosión y sobrecalentamiento",
    category_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    category: mockCategories[0],
    cost_price: 320.0,
    sale_price: 490.0,
    min_stock: 12.0,
    max_stock: 100.0,
    unit_measure: "GAL",
    image_url: null,
    is_active: true,
    total_stock: 40.0,
    created_at: "2026-09-05T15:00:00Z",
    updated_at: "2026-09-05T15:00:00Z",
  },
];

export async function getCategoriesAction(): Promise<Category[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured =
    supabaseUrl &&
    !supabaseUrl.includes("tu-proyecto") &&
    !supabaseUrl.includes("demo.supabase.co");

  if (!isConfigured) {
    return mockCategories;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error || !data) return mockCategories;
    return data;
  } catch {
    return mockCategories;
  }
}

export async function getProductsAction(): Promise<ProductWithStock[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured =
    supabaseUrl &&
    !supabaseUrl.includes("tu-proyecto") &&
    !supabaseUrl.includes("demo.supabase.co");

  if (!isConfigured) {
    return mockProducts;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(*),
        warehouse_stock(current_stock, reserved_stock, location_shelf, warehouse:warehouses(id, name, code))
      `)
      .order("created_at", { ascending: false });

    if (error || !data) return mockProducts;

    return data.map((prod: any) => {
      const stocks = prod.warehouse_stock || [];
      const total = stocks.reduce(
        (sum: number, s: any) => sum + Number(s.current_stock || 0),
        0
      );
      return {
        ...prod,
        total_stock: total,
      };
    });
  } catch {
    return mockProducts;
  }
}

export async function createProductAction(data: ProductInput) {
  const result = productSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Datos del producto inválidos" };
  }

  const {
    sku,
    barcode,
    name,
    description,
    categoryId,
    costPrice,
    salePrice,
    minStock,
    maxStock,
    unitMeasure,
    initialWarehouseId,
    initialStock,
    locationShelf,
  } = result.data;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured =
    supabaseUrl &&
    !supabaseUrl.includes("tu-proyecto") &&
    !supabaseUrl.includes("demo.supabase.co");

  if (!isConfigured) {
    const newCategory = mockCategories.find((c) => c.id === categoryId) || null;
    const newProduct: ProductWithStock = {
      id: `prod-${Date.now()}`,
      sku,
      barcode: barcode || null,
      name,
      description: description || null,
      category_id: categoryId || null,
      category: newCategory,
      cost_price: costPrice,
      sale_price: salePrice,
      min_stock: minStock,
      max_stock: maxStock || null,
      unit_measure: unitMeasure,
      image_url: null,
      is_active: true,
      total_stock: initialStock || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockProducts.unshift(newProduct);
    revalidatePath("/inventario");
    revalidatePath("/dashboard");
    return { success: true, product: newProduct };
  }

  try {
    const supabase = await createClient();

    // 1. Insertar el producto
    const { data: insertedProduct, error: prodError } = await supabase
      .from("products")
      .insert({
        sku,
        barcode: barcode || null,
        name,
        description: description || null,
        category_id: categoryId || null,
        cost_price: costPrice,
        sale_price: salePrice,
        min_stock: minStock,
        max_stock: maxStock || null,
        unit_measure: unitMeasure,
      })
      .select()
      .single();

    if (prodError) {
      return { error: `Error al crear producto: ${prodError.message}` };
    }

    // 2. Si se especificó almacén y stock inicial, insertar en warehouse_stock
    if (initialWarehouseId && (initialStock || 0) > 0) {
      await supabase.from("warehouse_stock").insert({
        product_id: insertedProduct.id,
        warehouse_id: initialWarehouseId,
        current_stock: initialStock,
        location_shelf: locationShelf || null,
      });
    }

    revalidatePath("/inventario");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteProductAction(id: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured =
    supabaseUrl &&
    !supabaseUrl.includes("tu-proyecto") &&
    !supabaseUrl.includes("demo.supabase.co");

  if (!isConfigured) {
    const idx = mockProducts.findIndex((p) => p.id === id);
    if (idx !== -1) {
      mockProducts.splice(idx, 1);
    }
    revalidatePath("/inventario");
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/inventario");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
