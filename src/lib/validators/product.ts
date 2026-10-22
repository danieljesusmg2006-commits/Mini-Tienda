import { z } from "zod";

export const productSchema = z.object({
  sku: z
    .string()
    .min(2, "El SKU debe tener al menos 2 caracteres")
    .max(50, "El SKU no debe exceder 50 caracteres"),
  barcode: z.string().optional(),
  name: z
    .string()
    .min(3, "El nombre del producto debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  costPrice: z
    .coerce
    .number()
    .min(0, "El precio de costo no puede ser negativo"),
  salePrice: z
    .coerce
    .number()
    .min(0, "El precio de venta no puede ser negativo"),
  minStock: z
    .coerce
    .number()
    .min(0, "El stock mínimo no puede ser negativo")
    .default(5),
  maxStock: z
    .coerce
    .number()
    .min(0, "El stock máximo debe ser mayor a 0")
    .optional(),
  unitMeasure: z
    .string()
    .min(1, "Especifique la unidad de medida")
    .default("UND"),
  initialWarehouseId: z.string().optional(),
  initialStock: z
    .coerce
    .number()
    .min(0, "La cantidad no puede ser negativa")
    .optional()
    .default(0),
  locationShelf: z.string().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
