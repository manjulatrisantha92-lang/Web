export type TenantIndustry = 
  | 'automotive' 
  | 'salon' 
  | 'jewellery' 
  | 'computer' 
  | 'grocery' 
  | 'mobile' 
  | 'agriculture' 
  | 'agro'
  | 'cosmetics' 
  | 'electrical' 
  | 'general';

export type BusinessIndustry = TenantIndustry;

export interface TenantModules {
  inventory: boolean;
  pos: boolean;
  facebook: boolean;
  whatsapp: boolean;
  appointments: boolean;
  customFields: boolean;
  reportBuilder: boolean;
  purchases: boolean;
  customers: boolean;
  accounting?: boolean;
  reports?: boolean;
  serialTracking?: boolean;
  goldWeight?: boolean;
  multiBranch?: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  businessCode: string;
  industry: TenantIndustry;
  currency: string;
  currencySymbol: string;
  status: 'active' | 'suspended' | 'trial';
  plan: 'Starter' | 'Pro' | 'Enterprise' | 'pro' | 'starter' | 'enterprise';
  logoUrl?: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  facebookPageUrl?: string;
  ownerName?: string;
  taxNumber?: string;
  billHeader?: string;
  billFooter?: string;
  defaultReceiptFormat?: 'a4' | 'thermal80' | 'thermal58';
  metaConfig?: {
    pageId: string;
    pageName: string;
    pixelId: string;
    accessToken: string;
  };
  modules: TenantModules;
  createdAt: string;
}

export type CustomFieldType = 
  | 'text' 
  | 'number' 
  | 'decimal' 
  | 'date' 
  | 'dropdown' 
  | 'multi_select' 
  | 'checkbox' 
  | 'image' 
  | 'barcode' 
  | 'serial_number' 
  | 'weight' 
  | 'currency';

export interface CustomField {
  id: string;
  tenantId: string;
  entity: 'product' | 'customer' | 'sale' | 'appointment';
  name: string;
  label: string;
  type: CustomFieldType;
  required: boolean;
  options?: string[]; // For dropdown, multi_select
  placeholder?: string;
  defaultValue?: any;
  unit?: string; // e.g. "g", "carat", "kg", "kW"
}

export interface ProductCategory {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description?: string;
  productCount?: number;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  barcode: string;
  sku: string;
  categoryId: string;
  categoryName: string;
  brand: string;
  supplier: string;
  purchasePrice: number;
  sellingPrice: number;
  discount: number;
  taxRate: number;
  stockQuantity: number;
  minStock: number;
  unit: string;
  imageUrl?: string;
  customFields: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  notes?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  productCode: string;
  price: number;
  quantity: number;
  discount: number;
  taxRate: number;
  subtotal: number;
  customFields?: Record<string, any>;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  items: SaleItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'credit' | 'online';
  paymentStatus: 'paid' | 'partial' | 'pending';
  notes?: string;
  cashierName: string;
  createdAt: string;
}

export type AppointmentStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'arrived' 
  | 'in_progress'
  | 'booked'
  | 'completed' 
  | 'cancelled' 
  | 'no_show';

export interface Appointment {
  id: string;
  tenantId: string;
  customerName: string;
  customerPhone: string;
  service: string;
  staff: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string; // HH:mm
  durationMinutes: number;
  price: number;
  advancePayment?: number;
  status: AppointmentStatus;
  notes?: string;
  whatsappReminderSent?: boolean;
}

export type OnlineOrderStatus = 
  | 'new' 
  | 'confirmed' 
  | 'processing' 
  | 'ready' 
  | 'dispatched' 
  | 'delivered'
  | 'completed' 
  | 'cancelled';

export interface OnlineOrder {
  id: string;
  orderNumber: string;
  tenantId: string;
  source: 'facebook' | 'web' | 'whatsapp';
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: OnlineOrderStatus;
  paymentMethod: string;
  outletAlertSent: boolean;
  whatsappAlertSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FacebookPromotion {
  id: string;
  tenantId: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  campaignTitle: string;
  description: string;
  reachCount: number;
  clicksCount: number;
  ordersGenerated: number;
  status: 'active' | 'paused' | 'draft';
  targetAudience: string;
  publishedAt: string;
}

export interface ReportConfig {
  id: string;
  tenantId: string;
  name: string;
  dataSource: 'products' | 'sales' | 'customers' | 'appointments' | 'online_orders';
  selectedColumns: string[];
  filters: { field: string; operator: 'equals' | 'contains' | 'greater_than' | 'less_than'; value: string }[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  groupBy?: string;
  dateRange: 'all' | 'today' | 'this_week' | 'this_month' | 'custom';
  showTotals: boolean;
  paperSize: 'A4' | 'Thermal80' | 'Letter';
  headerText?: string;
  footerText?: string;
  includeLogo: boolean;
}

export type UserRole = 'super_admin' | 'business_owner' | 'owner' | 'staff';

export interface RolePermissions {
  sales: boolean;
  products: boolean;
  purchases: boolean;
  reports: boolean;
  settings: boolean;
  users: boolean;
  marketing: boolean;
  appointments: boolean;
  pos?: boolean;
  viewCostPrice?: boolean;
  deleteInvoices?: boolean;
  exportData?: boolean;
}

export type UserPermissions = RolePermissions;

export interface AppUser {
  id: string;
  tenantId: string; // "SUPER_ADMIN" or specific tenant ID
  name: string;
  email: string;
  role: UserRole;
  permissions: RolePermissions;
  avatarUrl?: string;
}

export type User = AppUser;

export interface SystemAuditLog {
  id: string;
  tenantId: string;
  timestamp: string;
  action: string;
  entity: string;
  userId: string;
  userName: string;
  details: string;
  ipAddress: string;
}

export interface WhatsAppNotification {
  id: string;
  tenantId: string;
  recipientPhone: string;
  recipientName: string;
  type: 'invoice' | 'order_alert' | 'appointment_confirmation' | 'appointment_reminder';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  messageText: string;
  timestamp: string;
}
