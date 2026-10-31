"use client";

import { useState, useEffect, useRef } from "react";
import { Product, ProductInput } from "@/types/store";
import { PRESET_CATEGORIES } from "@/lib/store/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Package,
  DollarSign,
  Tag,
  Image as ImageIcon,
  Layers,
  X,
  AlertCircle,
  Sparkles,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  FileImage,
  RefreshCw,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProductInput) => void;
  initialProduct?: Product | null;
}

const SAMPLE_IMAGES = [
  {
    name: "Auriculares",
    url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Smartwatch",
    url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Mochila",
    url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Zapatillas",
    url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Gafas de Sol",
    url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Cámara",
    url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
  },
];

// Helper to optimize and compress image files client-side before storing
function processImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        reject(new Error("No fue posible leer el archivo seleccionado."));
        return;
      }

      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 800;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.85);
          resolve(compressed);
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export function ProductModal({
  isOpen,
  onClose,
  onSave,
  initialProduct,
}: ProductModalProps) {
  const isEditing = Boolean(initialProduct);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Electrónica");
  const [customCategory, setCustomCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Image source mode: "upload" (file from disk), "url" (web link), or "samples"
  const [imageMode, setImageMode] = useState<"upload" | "url" | "samples">("upload");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name);
      setPrice(String(initialProduct.price));
      if (PRESET_CATEGORIES.includes(initialProduct.category)) {
        setCategory(initialProduct.category);
        setCustomCategory("");
      } else {
        setCategory("Otro");
        setCustomCategory(initialProduct.category);
      }
      setImageUrl(initialProduct.imageUrl);
      setStock(String(initialProduct.stock));
      setDescription(initialProduct.description || "");
      setImageError(false);

      if (initialProduct.imageUrl.startsWith("data:")) {
        setImageMode("upload");
        setUploadedFileName("Imagen personalizada cargada");
      } else {
        setImageMode("url");
        setUploadedFileName(null);
      }
    } else {
      setName("");
      setPrice("");
      setCategory("Electrónica");
      setCustomCategory("");
      setImageUrl(SAMPLE_IMAGES[0].url);
      setStock("10");
      setDescription("");
      setImageError(false);
      setImageMode("upload");
      setUploadedFileName(null);
    }
    setErrorMessage(null);
  }, [initialProduct, isOpen]);

  if (!isOpen) return null;

  // File upload handler
  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Formato inválido", {
        description: "Por favor seleccione un archivo de imagen (PNG, JPG, WEBP, GIF, etc.).",
      });
      return;
    }

    try {
      setIsProcessingImage(true);
      const dataUrl = await processImageFile(file);
      setImageUrl(dataUrl);
      setUploadedFileName(`${file.name} (${Math.round(file.size / 1024)} KB)`);
      setImageError(false);
      toast.success("Imagen cargada exitosamente", {
        description: file.name,
      });
    } catch {
      toast.error("Error al procesar la imagen seleccionada");
    } finally {
      setIsProcessingImage(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const finalName = name.trim();
    if (!finalName) {
      setErrorMessage("El nombre del producto es obligatorio.");
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setErrorMessage("El precio debe ser un número positivo mayor a 0.");
      return;
    }

    const finalCategory = (category === "Otro" ? customCategory : category).trim();
    if (!finalCategory) {
      setErrorMessage("Por favor seleccione o especifique una categoría.");
      return;
    }

    const finalImageUrl = imageUrl.trim();
    if (!finalImageUrl) {
      setErrorMessage("La imagen es obligatoria. Suba un archivo o ingrese una URL.");
      return;
    }

    const numStock = parseInt(stock, 10);
    if (isNaN(numStock) || numStock < 0) {
      setErrorMessage("El stock debe ser un número entero mayor o igual a 0.");
      return;
    }

    onSave({
      name: finalName,
      price: Math.round(numPrice * 100) / 100,
      category: finalCategory,
      imageUrl: finalImageUrl,
      stock: numStock,
      description: description.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 id="product-modal-title" className="text-sm font-bold text-slate-900 dark:text-white">
                {isEditing ? "Editar Producto" : "Nuevo Producto"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing
                  ? "Modifica los datos del producto en el catálogo"
                  : "Ingresa los detalles para dar de alta el producto"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Nombre */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-slate-400" />
              Nombre del Producto *
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Auriculares Bluetooth Pro"
              required
              className="text-xs dark:bg-slate-950 dark:border-slate-700 dark:text-white"
            />
          </div>

          {/* Precio y Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                Precio ($ USD) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="49.99"
                required
                className="text-xs dark:bg-slate-950 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Stock Disponible *
              </label>
              <Input
                type="number"
                step="1"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="10"
                required
                className="text-xs dark:bg-slate-950 dark:border-slate-700 dark:text-white"
              />
            </div>
          </div>

          {/* Categoría */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Categoría *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {PRESET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Otro">+ Otra categoría personalizada</option>
              </select>

              {category === "Otro" && (
                <Input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Nombre de categoría"
                  required
                  className="text-xs dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                />
              )}
            </div>
          </div>

          {/* Descripción del Producto */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Descripción del Producto
              </label>
              <span className="text-[10px] text-slate-400">Visible al cliente al hacer clic</span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe detalladamente las características, especificaciones y ventajas de este producto..."
              rows={3}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-y min-h-[75px]"
            />
          </div>

          {/* Imagen del Producto: Subir archivo o Ingresar URL */}
          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Imagen del Producto *
              </label>
              <span className="text-[11px] text-slate-400">
                {imageMode === "upload" ? "Subir desde PC" : imageMode === "url" ? "Enlace web" : "Muestras"}
              </span>
            </div>

            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setImageMode("upload")}
                className={`py-1.5 px-2 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  imageMode === "upload"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs font-bold border border-slate-200/80 dark:border-slate-600"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Subir Archivo</span>
              </button>

              <button
                type="button"
                onClick={() => setImageMode("url")}
                className={`py-1.5 px-2 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  imageMode === "url"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs font-bold border border-slate-200/80 dark:border-slate-600"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Enlace URL</span>
              </button>

              <button
                type="button"
                onClick={() => setImageMode("samples")}
                className={`py-1.5 px-2 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  imageMode === "samples"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs font-bold border border-slate-200/80 dark:border-slate-600"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Muestras</span>
              </button>
            </div>

            {/* Tab 1: Upload File from Disk */}
            {imageMode === "upload" && (
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={onFileInputChange}
                  accept="image/*"
                  className="hidden"
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-4 text-center transition-all flex flex-col items-center justify-center gap-2 ${
                    isDragging
                      ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40"
                      : "border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/60 dark:bg-slate-950/60"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>

                  <div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessingImage}
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 font-semibold cursor-pointer shadow-xs"
                    >
                      <FileImage className="w-3.5 h-3.5" />
                      {uploadedFileName ? "Cambiar Imagen Descargada" : "Seleccionar Imagen de tu PC"}
                    </Button>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                      o arrastra y suelta tu archivo descargado aquí (PNG, JPG, WEBP, GIF)
                    </p>
                  </div>

                  {uploadedFileName && (
                    <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="truncate max-w-[220px]">{uploadedFileName}</span>
                    </div>
                  )}

                  {isProcessingImage && (
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Optimizando imagen...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: URL Input */}
            {imageMode === "url" && (
              <div className="space-y-1.5">
                <Input
                  type="url"
                  value={imageUrl.startsWith("data:") ? "" : imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImageError(false);
                    setUploadedFileName(null);
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className="text-xs dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Pega un enlace web directo hacia la imagen del producto.
                </p>
              </div>
            )}

            {/* Tab 3: Sample Presets */}
            {imageMode === "samples" && (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Selecciona una imagen sugerida de muestra en alta resolución:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {SAMPLE_IMAGES.map((img) => (
                    <button
                      key={img.name}
                      type="button"
                      onClick={() => {
                        setImageUrl(img.url);
                        setImageError(false);
                        setUploadedFileName(null);
                      }}
                      className={`text-xs p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        imageUrl === img.url
                          ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs"
                          : "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <span className="text-[11px] truncate w-full text-center">{img.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Previsualización en vivo unificada */}
            <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 border border-slate-300 dark:border-slate-600 relative flex items-center justify-center">
                {imageUrl && !imageError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt="Previsualización"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {name || "Nombre del producto"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {category === "Otro" ? customCategory || "Categoría" : category} •{" "}
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    ${price ? parseFloat(price).toFixed(2) : "0.00"}
                  </span>
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {imageError ? (
                    <span className="text-rose-500">Error cargando imagen. Verifique el archivo o enlace.</span>
                  ) : (
                    "Vista previa de imagen en tiempo real"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold shadow-xs"
            >
              {isEditing ? "Guardar Cambios" : "Crear Producto"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
