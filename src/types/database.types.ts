export type UserRole =
  | "super_admin"
  | "admin"
  | "almacenista"
  | "comprador"
  | "vendedor"
  | "auditor";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  user_id: string | null;
  action: "INSERT" | "UPDATE" | "DELETE";
  table_name: string;
  record_id: string | null;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  created_at: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string | null;
  phone: string | null;
  manager_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string | null;
  name: string;
  description: string | null;
  category_id: string | null;
  cost_price: number;
  sale_price: number;
  min_stock: number;
  max_stock: number | null;
  unit_measure: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WarehouseStock {
  id: string;
  product_id: string;
  warehouse_id: string;
  current_stock: number;
  reserved_stock: number;
  location_shelf: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductWithStock extends Product {
  category?: Category | null;
  total_stock: number;
  warehouse_stocks?: (WarehouseStock & { warehouse?: Warehouse })[];
}

export interface Supplier {
  id: string;
  tax_id: string | null;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type PurchaseStatus = "BORRADOR" | "SOLICITADO" | "RECIBIDO" | "CANCELADO";
export type PaymentStatus = "PENDIENTE" | "PAGADO";

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  product_id: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  subtotal: number;
  created_at: string;
  product?: Product;
}

export interface Purchase {
  id: string;
  purchase_number: string;
  supplier_id: string;
  warehouse_id: string;
  status: PurchaseStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes: string | null;
  created_by: string | null;
  received_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseWithDetails extends Purchase {
  supplier?: Supplier;
  warehouse?: Warehouse;
  items?: (PurchaseItem & { product?: Product })[];
}

export type MovementType = "ENTRADA" | "SALIDA" | "TRASLADO" | "AJUSTE";
export type MovementReferenceType = "COMPRA" | "VENTA" | "TRASLADO_MANUAL" | "AJUSTE_INVENTARIO" | "MERMA";

export interface InventoryMovementItem {
  id: string;
  movement_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  created_at: string;
  product?: Product;
}

export interface InventoryMovement {
  id: string;
  movement_number: string;
  type: MovementType;
  source_warehouse_id: string | null;
  target_warehouse_id: string | null;
  reference_type: MovementReferenceType | null;
  reference_id: string | null;
  reason: string | null;
  performed_by: string | null;
  created_at: string;
}

export interface InventoryMovementWithDetails extends InventoryMovement {
  source_warehouse?: Warehouse | null;
  target_warehouse?: Warehouse | null;
  items?: (InventoryMovementItem & { product?: Product })[];
  user?: Profile | null;
}

export interface Customer {
  id: string;
  tax_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  credit_limit: number;
  current_balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type SaleStatus = "COMPLETADA" | "PENDIENTE" | "ANULADA";
export type PaymentMethod = "EFECTIVO" | "TARJETA" | "TRANSFERENCIA" | "CREDITO";

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  subtotal: number;
  created_at: string;
  product?: Product;
}

export interface Sale {
  id: string;
  invoice_number: string;
  customer_id: string;
  warehouse_id: string;
  status: SaleStatus;
  payment_method: PaymentMethod;
  amount_paid: number;
  change_returned: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SaleWithDetails extends Sale {
  customer?: Customer;
  warehouse?: Warehouse;
  items?: (SaleItem & { product?: Product })[];
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, "id" | "created_at">;
        Update: never;
      };
      warehouses: {
        Row: Warehouse;
        Insert: Omit<Warehouse, "id" | "created_at">;
        Update: Partial<Omit<Warehouse, "id" | "created_at">>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, "id" | "created_at">;
        Update: Partial<Omit<Category, "id" | "created_at">>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Product, "id" | "created_at">>;
      };
      warehouse_stock: {
        Row: WarehouseStock;
        Insert: Omit<WarehouseStock, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<WarehouseStock, "id" | "created_at">>;
      };
      suppliers: {
        Row: Supplier;
        Insert: Omit<Supplier, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Supplier, "id" | "created_at">>;
      };
      purchases: {
        Row: Purchase;
        Insert: Omit<Purchase, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Purchase, "id" | "created_at">>;
      };
      purchase_items: {
        Row: PurchaseItem;
        Insert: Omit<PurchaseItem, "id" | "created_at">;
        Update: Partial<Omit<PurchaseItem, "id" | "created_at">>;
      };
      inventory_movements: {
        Row: InventoryMovement;
        Insert: Omit<InventoryMovement, "id" | "created_at">;
        Update: Partial<Omit<InventoryMovement, "id" | "created_at">>;
      };
      inventory_movement_items: {
        Row: InventoryMovementItem;
        Insert: Omit<InventoryMovementItem, "id" | "created_at">;
        Update: Partial<Omit<InventoryMovementItem, "id" | "created_at">>;
      };
    };
  };
}
