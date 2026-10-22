import { z } from "zod";

export const warehouseSchema = z.object({
  code: z
    .string()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(20, "El código no debe exceder 20 caracteres")
    .transform((val) => val.toUpperCase().trim()),
  name: z
    .string()
    .min(3, "El nombre del almacén debe tener al menos 3 caracteres"),
  address: z.string().optional(),
  phone: z.string().optional(),
  managerName: z.string().optional(),
});

export type WarehouseInput = z.infer<typeof warehouseSchema>;
