"use client";

import { useState, useEffect, useTransition } from "react";
import {
  getWarehousesAction,
  createWarehouseAction,
  toggleWarehouseStatusAction,
} from "@/actions/warehouse.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Warehouse as WarehouseIcon,
  Plus,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  XCircle,
  X,
  AlertCircle,
  Boxes,
} from "lucide-react";
import { toast } from "sonner";
import type { Warehouse } from "@/types/database.types";

export default function AlmacenesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [managerName, setManagerName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadWarehouses = () => {
    startTransition(async () => {
      const res = await getWarehousesAction();
      setWarehouses(res.data);
    });
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    startTransition(async () => {
      const res = await createWarehouseAction({
        code,
        name,
        address: address || undefined,
        phone: phone || undefined,
        managerName: managerName || undefined,
      });

      if (res.error) {
        setFormError(res.error);
        toast.error(res.error);
      } else {
        toast.success("Almacén creado exitosamente");
        setIsModalOpen(false);
        setCode("");
        setName("");
        setAddress("");
        setPhone("");
        setManagerName("");
        loadWarehouses();
      }
    });
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await toggleWarehouseStatusAction(id, currentStatus);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(
          !currentStatus ? "Almacén activado" : "Almacén desactivado"
        );
        loadWarehouses();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <WarehouseIcon className="w-6 h-6 text-indigo-600" />
            Gestión de Almacenes y Sucursales
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Administración de centros de distribución, bodegas físicas y ubicaciones de inventario
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Almacén</span>
        </Button>
      </div>

      {/* Modal de Creación */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <WarehouseIcon className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                  Registrar Nuevo Almacén / Sucursal
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Código Único
                  </label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="ALM-03"
                    required
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Nombre del Almacén
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Bodega Este / Distribuidora"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Dirección Física
                </label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle o Avenida, Ciudad, Sector"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Teléfono de Contacto
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
                    Encargado / Responsable
                  </label>
                  <Input
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    placeholder="Nombre del encargado"
                  />
                </div>
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
                  {isPending ? "Guardando..." : "Guardar Almacén"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid de Almacenes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {warehouses.map((wh) => (
          <Card
            key={wh.id}
            className="border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div
              className={`absolute top-0 left-0 right-0 h-1 ${
                wh.is_active ? "bg-indigo-600" : "bg-slate-400"
              }`}
            />
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" className="font-mono text-[11px] mb-1">
                    {wh.code}
                  </Badge>
                  <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                    {wh.name}
                  </CardTitle>
                </div>
                {wh.is_active ? (
                  <Badge variant="success" className="gap-1 text-[11px]">
                    <CheckCircle2 className="w-3 h-3" />
                    Activo
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1 text-[11px]">
                    <XCircle className="w-3 h-3" />
                    Inactivo
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2">
                  {wh.address || "Sin dirección registrada"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{wh.phone || "Sin teléfono"}</span>
              </div>

              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Encargado: {wh.manager_name || "No asignado"}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-indigo-600 font-medium text-[11px]">
                  <Boxes className="w-3.5 h-3.5" />
                  <span>Control Multialmacén</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStatus(wh.id, wh.is_active)}
                  className={`text-[11px] h-7 ${
                    wh.is_active
                      ? "text-rose-600 hover:text-rose-700 border-rose-200"
                      : "text-emerald-600 hover:text-emerald-700 border-emerald-200"
                  }`}
                >
                  {wh.is_active ? "Desactivar" : "Activar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
