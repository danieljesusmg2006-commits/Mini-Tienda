"use client";

import { useState, useTransition } from "react";
import { loginAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const res = await loginAction({ email, password });
      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-radial from-slate-900 via-slate-950 to-black text-slate-100">
      <div className="w-full max-w-md">
        {/* Logo and System Identification */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 mb-3 border border-indigo-400/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Sistema Administrativo ERP</h1>
          <p className="text-xs text-slate-400 mt-1">Acceso privado y restringido para personal autorizado</p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-800 bg-slate-900/90 backdrop-blur-md shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg text-white">Iniciar Sesión</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Ingrese sus credenciales corporativas para continuar
            </CardDescription>
          </CardHeader>

          <CardContent>
            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Correo Corporativo
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@empresa.com"
                  required
                  autoComplete="email"
                  className="bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full mt-2 font-medium tracking-wide bg-indigo-600 hover:bg-indigo-700"
              >
                {isPending ? "Validando acceso..." : "Entrar al Sistema"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Notice Footer */}
        <p className="text-center text-[11px] text-slate-500 mt-6">
          🔒 Conexión cifrada de extremo a extremo. El registro público está deshabilitado.
        </p>
      </div>
    </div>
  );
}
