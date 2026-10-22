"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(username, password);
      if (res.success) {
        toast.success("Bienvenido al Panel Administrativo", {
          description: "Sesión iniciada correctamente.",
        });
        router.push("/admin");
        router.refresh();
      } else {
        setErrorMessage(res.error || "Credenciales incorrectas.");
        setIsSubmitting(false);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-indigo-50/40 to-slate-200 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="w-full max-w-md">
        {/* Top Navigation Bar */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver a la Tienda Pública
          </Link>

          <ThemeToggle />
        </div>

        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 mb-3 border border-indigo-400/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Panel Administrativo</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Mini Tienda Digital • Acceso Protegido
          </p>
        </div>

        {/* Login Card */}
        <Card className="border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md shadow-2xl transition-colors">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg text-slate-900 dark:text-white">Autenticación Requerida</CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Ingrese su usuario y contraseña para administrar el catálogo
            </CardDescription>
          </CardHeader>

          <CardContent>
            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Usuario
                </label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingrese su usuario"
                  required
                  autoFocus
                  autoComplete="username"
                  className="bg-slate-50 dark:bg-slate-950/60 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••"
                    required
                    autoComplete="current-password"
                    className="bg-slate-50 dark:bg-slate-950/60 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-indigo-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 font-medium tracking-wide bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 cursor-pointer text-white shadow-md shadow-indigo-500/20"
              >
                {isSubmitting ? "Verificando..." : "Entrar al Panel"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-6">
          🔒 Acceso restringido. Mini Tienda Digital © 2026
        </p>
      </div>
    </div>
  );
}
