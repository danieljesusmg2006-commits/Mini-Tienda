"use client";

import { useState, useEffect, useTransition } from "react";
import {
  getCustomersAction,
  createCustomerAction,
  toggleCustomerStatusAction,
} from "@/actions/customer.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  X,
  AlertCircle,
  Search,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import type { Customer } from "@/types/database.types";

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formulario
  const [taxId, setTaxId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [creditLimit, setCreditLimit] = useState<number | string>(0);

  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadCustomers = () => {
    startTransition(async () => {
      const res = await getCustomersAction();
      setCustomers(res);
    });
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.tax_id && c.tax_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.phone && c.phone.includes(searchTerm))
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    startTransition(async () => {
      const res = await createCustomerAction({
        taxId: taxId || undefined,
        name,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
        creditLimit: Number(creditLimit) || 0,
      });

      if (res.error) {
        setFormError(res.error);
        toast.error(res.error);
      } else {
        toast.success("Cliente registrado exitosamente");
        setIsModalOpen(false);
        setTaxId("");
        setName("");
        setEmail("");
        setPhone("");
        setAddress("");
        setCreditLimit(0);
        loadCustomers();
      }
    });
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await toggleCustomerStatusAction(id, currentStatus);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(!currentStatus ? "Cliente activado" : "Cliente desactivado");
        loadCustomers();
      }
    });
  };

  // Métricas de crédito
  const totalReceivables = customers.reduce(
    (sum, c) => sum + Number(c.current_balance || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Directorio de Clientes y Créditos
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Administración de clientes comerciales, líneas de crédito y cuentas por cobrar
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Cliente</span>
        </Button>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
            <CardTitle className="text-xs font-medium text-slate-500">
              Total Clientes Registrados
            </CardTitle>
            <Users className="w-4 h-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{customers.length}</div>
            <p className="text-[11px] text-slate-400">Activos en el sistema</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
            <CardTitle className="text-xs font-medium text-slate-500">
              Cuentas por Cobrar (Saldos Pendientes)
            </CardTitle>
            <CreditCard className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-amber-600">
              {formatCurrency(totalReceivables)}
            </div>
            <p className="text-[11px] text-amber-500">Créditos pendientes de liquidar</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
            <CardTitle className="text-xs font-medium text-slate-500">
              Clientes con Crédito Activo
            </CardTitle>
            <Receipt className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-emerald-600">
              {customers.filter((c) => Number(c.credit_limit) > 0).length}
            </div>
            <p className="text-[11px] text-slate-400">Líneas de crédito autorizadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Buscador */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-4">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por Nombre, Cédula/RNC o Teléfono..."
              className="pl-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Clientes */}
      <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Cliente / Razón Social</th>
                <th className="py-3 px-4">Identificación Fiscal</th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4">Límite de Crédito</th>
                <th className="py-3 px-4">Saldo Pendiente</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No se encontraron clientes que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-900/60 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {c.name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {c.address || "Sin dirección"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {c.tax_id || "N/A"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {c.phone || "Sin teléfono"}
                      </div>
                      {c.email && (
                        <div className="text-[11px] text-indigo-600 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {c.email}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {formatCurrency(c.credit_limit)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-bold ${
                          Number(c.current_balance) > 0
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {formatCurrency(c.current_balance)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {c.is_active ? (
                        <Badge variant="success">Activo</Badge>
                      ) : (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {c.tax_id !== "000-0000000-0" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(c.id, c.is_active)}
                          className={`text-[11px] h-7 ${
                            c.is_active
                              ? "text-rose-600 border-rose-200"
                              : "text-emerald-600 border-emerald-200"
                          }`}
                        >
                          {c.is_active ? "Suspender" : "Activar"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Registrar Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                  Registrar Nuevo Cliente
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Nombre Completo / Razón Social *
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Auto Repuestos Los Mina SRL"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Cédula / RNC
                  </label>
                  <Input
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="402-0000000-0"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Límite de Crédito (RD$)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Teléfono
                  </label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 809-555-0000"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Correo Electrónico
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cliente@empresa.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Dirección
                </label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle, Sector, Ciudad"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isPending ? "Guardando..." : "Guardar Cliente"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
