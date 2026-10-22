"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff, KeyRound, AlertCircle, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordChange: (currentPass: string, newPass: string) => { success: boolean; error?: string };
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  onPasswordChange,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentPassword) {
      setErrorMessage("Por favor ingrese su contraseña actual.");
      return;
    }

    if (newPassword.length < 4) {
      setErrorMessage("La nueva contraseña debe tener al menos 4 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("La confirmación de la contraseña no coincide.");
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMessage("La nueva contraseña debe ser diferente de la actual.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = onPasswordChange(currentPassword, newPassword);
      setIsSubmitting(false);

      if (res.success) {
        toast.success("Contraseña actualizada exitosamente", {
          description: "Utilice su nueva contraseña la próxima vez que inicie sesión.",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setErrorMessage(null);
        onClose();
      } else {
        setErrorMessage(res.error || "No fue posible cambiar la contraseña.");
      }
    }, 250);
  };

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors"
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 id="change-password-title" className="text-sm font-bold text-slate-900 dark:text-white">
                Cambiar Contraseña
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Actualiza tus credenciales de superusuario</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Contraseña Actual
            </label>
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Ingrese su contraseña actual"
                required
                className="pr-10 text-xs dark:bg-slate-950 dark:border-slate-700 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                aria-label={showCurrent ? "Ocultar" : "Mostrar"}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              Nueva Contraseña
            </label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                required
                minLength={4}
                className="pr-10 text-xs dark:bg-slate-950 dark:border-slate-700 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                aria-label={showNew ? "Ocultar" : "Mostrar"}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
              Confirmar Nueva Contraseña
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita la nueva contraseña"
              required
              className="text-xs dark:bg-slate-950 dark:border-slate-700 dark:text-white"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-xs bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold shadow-xs"
            >
              {isSubmitting ? "Guardando..." : "Actualizar Contraseña"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
