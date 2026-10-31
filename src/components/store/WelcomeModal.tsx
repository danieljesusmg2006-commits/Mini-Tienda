"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LogIn,
  User,
  Mail,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGuest?: () => void;
  onLoginCustomer: (name: string, email: string) => void;
}

export function WelcomeModal({
  isOpen,
  onClose,
  onLoginCustomer,
}: WelcomeModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setFormError("Por favor ingresa tu nombre.");
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes("@")) {
      setFormError("Por favor ingresa un correo electrónico válido.");
      return;
    }

    onLoginCustomer(customerName.trim(), customerEmail.trim());
    toast.success(`Sesión iniciada como ${customerName.trim()}`, {
      description: "Tus compras y chats con el vendedor quedarán guardados.",
    });
    onClose();
  };

  const handleFillDemo = () => {
    setCustomerName("Daniel Mendoza");
    setCustomerEmail("daniel@tienda.com");
    setFormError(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-login-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="relative p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h2 id="customer-login-modal-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Iniciar Sesión de Cliente
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Para chatear con el vendedor y guardar tus compras
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Nombre Completo</span>
            </label>
            <Input
              type="text"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                if (formError) setFormError(null);
              }}
              placeholder="Ej: Daniel Mendoza"
              className="text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 h-10"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Correo Electrónico</span>
            </label>
            <Input
              type="email"
              value={customerEmail}
              onChange={(e) => {
                setCustomerEmail(e.target.value);
                if (formError) setFormError(null);
              }}
              placeholder="Ej: daniel@ejemplo.com"
              className="text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 h-10"
            />
          </div>

          {formError && (
            <p className="text-xs font-medium text-rose-500 bg-rose-50 dark:bg-rose-950/60 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
              {formError}
            </p>
          )}

          {/* Quick Demo Fill button */}
          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Llenar con datos de prueba</span>
            </button>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 text-xs h-10 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Seguir como invitado
            </Button>
            <Button
              type="submit"
              className="flex-1 text-xs h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer shadow-md shadow-indigo-500/20"
            >
              Iniciar Sesión
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
