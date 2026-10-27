"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Store,
  ShoppingBag,
  LogIn,
  ShieldCheck,
  User,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGuest: () => void;
  onLoginCustomer: (name: string, email: string) => void;
}

export function WelcomeModal({
  isOpen,
  onClose,
  onSelectGuest,
  onLoginCustomer,
}: WelcomeModalProps) {
  const router = useRouter();

  // Mode: "choose" (the 3 choices) or "customer_login" (login form)
  const [view, setView] = useState<"choose" | "customer_login">("choose");

  // Customer login form fields
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGuestClick = () => {
    onSelectGuest();
    toast.success("Ingresaste como Invitado", {
      description: "Puedes explorar y comprar sin registrarte.",
    });
    onClose();
  };

  const handleCustomerLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setFormError("Por favor ingrese su nombre.");
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes("@")) {
      setFormError("Por favor ingrese un correo válido.");
      return;
    }

    onLoginCustomer(customerName, customerEmail);
    toast.success(`¡Bienvenido/a, ${customerName}!`, {
      description: "Sesión de cliente iniciada correctamente.",
    });
    onClose();
  };

  const handleFillDemoCustomer = () => {
    setCustomerName("Daniel Mendoza");
    setCustomerEmail("daniel@tienda.com");
    setFormError(null);
  };

  const handleAdminClick = () => {
    onClose();
    router.push("/admin/login");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-all max-h-[94vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
      >
        {/* Top Hero Header */}
        <div className="relative p-4 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-b from-indigo-50/60 to-transparent dark:from-indigo-950/40 text-center space-y-1.5 sm:space-y-2 shrink-0">
          {/* Theme Toggle Button */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
            <ThemeToggle />
          </div>

          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-500/25">
            <Store className="w-5 h-5 sm:w-7 sm:h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] sm:text-[11px] font-semibold mb-0.5 sm:mb-1">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Mini Tienda Digital</span>
            </div>
            <h2 id="welcome-modal-title" className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              ¡Te damos la bienvenida!
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Selecciona cómo deseas ingresar para disfrutar de la experiencia:
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4">
          {view === "choose" ? (
            <>
              {/* Primary User Options (Guest or Login) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Entrar como Invitado */}
                <button
                  type="button"
                  onClick={handleGuestClick}
                  className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-600 dark:hover:border-indigo-400 bg-white dark:bg-slate-800 hover:bg-indigo-50/40 dark:hover:bg-slate-700/80 text-left transition-all duration-200 flex flex-col justify-between gap-3 group cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-100 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                      Temporal
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Entrar como Invitado
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      Navega y compra sin registrarte. <strong className="text-amber-600 dark:text-amber-400">Tus compras y búsquedas se eliminarán al cerrar la página</strong>.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 flex items-center text-xs font-semibold text-amber-600 dark:text-amber-400 gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Continuar como invitado</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* 2. Iniciar Sesión de Cliente */}
                <button
                  type="button"
                  onClick={() => setView("customer_login")}
                  className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-600 dark:hover:border-indigo-400 bg-white dark:bg-slate-800 hover:bg-indigo-50/40 dark:hover:bg-slate-700/80 text-left transition-all duration-200 flex flex-col justify-between gap-3 group cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-100 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                      <LogIn className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      Permanente
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Iniciar Sesión
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      Guarda tus datos. <strong className="text-emerald-600 dark:text-emerald-400">Tus compras y búsquedas se conservarán para siempre en tu cuenta</strong>.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Ingresar con mi cuenta</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>

              {/* Separador Visual (Apartando la opción de Administrador) */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                  <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 dark:text-slate-500">
                    O si perteneces al equipo administrativo
                  </span>
                </div>
              </div>

              {/* 3. Entrar como Admin (SEPARADO / APARTADO) */}
              <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0">
                    <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Entrar como Administrador
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Gestión del catálogo CRUD, control de stock y configuración.
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={handleAdminClick}
                  className="text-xs bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 font-semibold gap-1.5 shrink-0 shadow-sm cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Acceso Admin →</span>
                </Button>
              </div>
            </>
          ) : (
            /* Iniciar Sesión de Cliente Formulario */
            <form onSubmit={handleCustomerLoginSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setView("choose")}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver a opciones</span>
                </button>
                <button
                  type="button"
                  onClick={handleFillDemoCustomer}
                  className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800"
                >
                  Autocompletar demo
                </button>
              </div>

              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Nombre Completo
                </label>
                <Input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej. Daniel Mendoza"
                  required
                  autoFocus
                  className="text-xs dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Correo Electrónico
                </label>
                <Input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="daniel@correo.com"
                  required
                  className="text-xs dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setView("choose")}
                  className="text-xs dark:border-slate-700 dark:text-slate-200"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Iniciar Sesión y Entrar
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
