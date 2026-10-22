import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Ingrese un correo electrónico válido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const inviteUserSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Ingrese un correo electrónico válido"),
  fullName: z
    .string()
    .min(2, "El nombre completo debe tener al menos 2 caracteres"),
  role: z.enum([
    "super_admin",
    "admin",
    "almacenista",
    "comprador",
    "vendedor",
    "auditor",
  ]),
  phone: z.string().optional(),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;
