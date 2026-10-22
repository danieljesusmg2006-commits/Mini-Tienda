import { z } from "zod";

export const supplierSchema = z.object({
  taxId: z.string().optional(),
  name: z.string().min(2, "El nombre o razón social es requerido"),
  contactName: z.string().optional(),
  email: z.string().email("Correo electrónico inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type SupplierInput = z.infer<typeof supplierSchema>;

export const purchaseItemSchema = z.object({
  productId: z.string().min(1, "Debe seleccionar un producto"),
  quantityOrdered: z.coerce.number().min(0.01, "La cantidad debe ser mayor a 0"),
  unitCost: z.coerce.number().min(0, "El costo unitario no puede ser negativo"),
});

export const purchaseSchema = z.object({
  supplierId: z.string().min(1, "Debe seleccionar un proveedor"),
  warehouseId: z.string().min(1, "Debe seleccionar el almacén de destino"),
  notes: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, "Debe incluir al menos un producto en la orden"),
});

export type PurchaseInput = z.infer<typeof purchaseSchema>;

export const transferStockSchema = z.object({
  sourceWarehouseId: z.string().min(1, "Seleccione el almacén de origen"),
  targetWarehouseId: z.string().min(1, "Seleccione el almacén de destino"),
  productId: z.string().min(1, "Seleccione el producto"),
  quantity: z.coerce.number().min(0.01, "La cantidad a transferir debe ser mayor a 0"),
  reason: z.string().min(3, "Indique el motivo del traslado (mínimo 3 caracteres)"),
}).refine((data) => data.sourceWarehouseId !== data.targetWarehouseId, {
  message: "El almacén de origen y destino no pueden ser el mismo",
  path: ["targetWarehouseId"],
});

export type TransferStockInput = z.infer<typeof transferStockSchema>;

export const adjustmentStockSchema = z.object({
  warehouseId: z.string().min(1, "Seleccione el almacén"),
  productId: z.string().min(1, "Seleccione el producto"),
  type: z.enum(["ENTRADA", "SALIDA"]),
  quantity: z.coerce.number().min(0.01, "La cantidad debe ser mayor a 0"),
  reason: z.string().min(3, "Especifique el motivo del ajuste (ej: Conteo físico, Merma, Daño)"),
});

export type AdjustmentStockInput = z.infer<typeof adjustmentStockSchema>;
