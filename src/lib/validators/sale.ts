import { z } from "zod";

export const customerSchema = z.object({
  taxId: z.string().optional(),
  name: z.string().min(2, "El nombre o razón social es requerido"),
  email: z.string().email("Correo electrónico inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  creditLimit: z.coerce.number().min(0, "El límite de crédito no puede ser negativo").default(0),
});

export type CustomerInput = z.infer<typeof customerSchema>;

export const posItemSchema = z.object({
  productId: z.string().min(1, "Producto requerido"),
  quantity: z.coerce.number().min(0.01, "La cantidad debe ser mayor a 0"),
  unitPrice: z.coerce.number().min(0, "El precio unitario no puede ser negativo"),
});

export const saleSchema = z.object({
  customerId: z.string().min(1, "Debe seleccionar un cliente"),
  warehouseId: z.string().min(1, "Debe seleccionar el almacén origen"),
  paymentMethod: z.enum(["EFECTIVO", "TARJETA", "TRANSFERENCIA", "CREDITO"]),
  amountPaid: z.coerce.number().min(0, "Monto pagado no puede ser negativo"),
  discountAmount: z.coerce.number().min(0, "Descuento no puede ser negativo").default(0),
  notes: z.string().optional(),
  items: z.array(posItemSchema).min(1, "Debe agregar al menos un producto al carrito de venta"),
});

export type SaleInput = z.infer<typeof saleSchema>;
