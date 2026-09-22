import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Tenant,
  CustomField,
  ProductCategory,
  Product,
  Customer,
  Sale,
  Appointment,
  OnlineOrder,
  OnlineOrderStatus,
  FacebookPromotion,
  ReportConfig,
  AppUser,
  SystemAuditLog,
  WhatsAppNotification,
  TenantModules,
} from '../types';
import {
  INITIAL_TENANTS,
  INITIAL_CUSTOM_FIELDS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_SALES,
  INITIAL_APPOINTMENTS,
  INITIAL_ONLINE_ORDERS,
  INITIAL_PROMOTIONS,
  INITIAL_REPORT_CONFIGS,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_WHATSAPP_NOTIFICATIONS,
} from '../data/initialData';

interface AppContextType {
  // Tenant & User
  tenants: Tenant[];
  currentTenant: Tenant;
  setCurrentTenantId: (id: string) => void;
  users: AppUser[];
  currentUser: AppUser;
  setCurrentUserId: (id: string) => void;
  isSuperAdmin: boolean;
  isSuperAdminAuthenticated: boolean;
  superAdminPassword: string;
  showAdminLoginModal: boolean;
  setShowAdminLoginModal: (show: boolean) => void;
  loginSuperAdmin: (password: string) => { success: boolean; message?: string };
  logoutSuperAdmin: () => void;
  changeSuperAdminPassword: (currentPassword: string, newPassword: string) => { success: boolean; message: string };

  // Navigation
  activeView: string;
  setActiveView: (view: string) => void;

  // Tenant-isolated Data
  products: Product[];
  categories: ProductCategory[];
  customFields: CustomField[];
  customers: Customer[];
  sales: Sale[];
  appointments: Appointment[];
  onlineOrders: OnlineOrder[];
  promotions: FacebookPromotion[];
  reportConfigs: ReportConfig[];
  whatsappNotifications: WhatsAppNotification[];
  auditLogs: SystemAuditLog[];

  // Data Actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'tenantId'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  addCategory: (category: Omit<ProductCategory, 'id' | 'tenantId'>) => void;
  deleteCategory: (id: string) => void;

  addCustomField: (field: Omit<CustomField, 'id' | 'tenantId'>) => void;
  deleteCustomField: (id: string) => void;

  addCustomer: (customer: Omit<Customer, 'id' | 'tenantId' | 'totalOrders' | 'totalSpent'>) => Customer;

  createSale: (saleData: Omit<Sale, 'id' | 'invoiceNumber' | 'createdAt' | 'tenantId'>) => Sale;

  addAppointment: (appointment: Omit<Appointment, 'id' | 'tenantId'>) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;

  createOnlineOrder: (order: Omit<OnlineOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'tenantId'>) => OnlineOrder;
  updateOrderStatus: (id: string, status: OnlineOrderStatus) => void;

  addPromotion: (promo: Omit<FacebookPromotion, 'id' | 'tenantId' | 'publishedAt' | 'reachCount' | 'clicksCount' | 'ordersGenerated'>) => void;
  updatePromotion: (id: string, updates: Partial<FacebookPromotion>) => void;

  saveReportConfig: (config: Omit<ReportConfig, 'id' | 'tenantId'>) => void;
  deleteReportConfig: (id: string) => void;

  sendWhatsAppMessage: (recipientPhone: string, recipientName: string, type: WhatsAppNotification['type'], messageText: string) => WhatsAppNotification;

  // Tenant & System Management
  updateCompanyProfile: (tenantId: string, updates: Partial<Tenant>) => void;
  toggleTenantModule: (tenantId: string, moduleKey: keyof TenantModules, enabled: boolean) => void;
  createTenant: (tenant: Omit<Tenant, 'id' | 'createdAt'>) => Tenant;
  updateTenantStatus: (tenantId: string, status: Tenant['status']) => void;

  // Active Modals state
  activeInvoice: Sale | null;
  activeInvoiceSale: Sale | null;
  openInvoiceModal: (sale: Sale) => void;
  closeInvoiceModal: () => void;

  // Convenient aliases and helpers
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  updateOnlineOrderStatus: (id: string, status: OnlineOrder['status']) => void;
  updateTenantProfile: (updates: Partial<Tenant>) => void;
  setCurrentTenant: (tenant: Tenant) => void;
  setCurrentUser: (user: AppUser) => void;
  addTenant: (tenant: Omit<Tenant, 'id' | 'createdAt'>) => Tenant;
  addUser: (user: Omit<AppUser, 'id' | 'tenantId'>) => AppUser;
  allSalesGlobal: Sale[];
  allProductsGlobal: Product[];

  activeWhatsAppDialog: {
    isOpen: boolean;
    phone: string;
    name: string;
    message: string;
    title: string;
  } | null;
  openWhatsAppDialog: (phone: string, name: string, message: string, title?: string) => void;
  closeWhatsAppDialog: () => void;

  // Alert/Banner notification
  latestOnlineAlert: OnlineOrder | null;
  dismissOnlineAlert: () => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from local storage or defaults
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem('wcs_tenants');
    return saved ? JSON.parse(saved) : INITIAL_TENANTS;
  });

  const [currentTenantId, setCurrentTenantIdState] = useState<string>(() => {
    return localStorage.getItem('wcs_active_tenant') || 'TENANT_AUTO';
  });

  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('wcs_users');
    if (!saved) return INITIAL_USERS;
    try {
      const parsed: AppUser[] = JSON.parse(saved);
      // Merge any missing initial users by id to ensure all tenants have users
      const existingIds = new Set(parsed.map((u) => u.id));
      const missing = INITIAL_USERS.filter((u) => !existingIds.has(u.id));
      return missing.length > 0 ? [...parsed, ...missing] : parsed;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUserId, setCurrentUserIdState] = useState<string>(() => {
    return localStorage.getItem('wcs_active_user') || 'usr_owner_auto';
  });

  const [activeView, setActiveView] = useState<string>('dashboard');

  const [customFields, setCustomFields] = useState<CustomField[]>(() => {
    const saved = localStorage.getItem('wcs_custom_fields');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOM_FIELDS;
  });

  const [categories, setCategories] = useState<ProductCategory[]>(() => {
    const saved = localStorage.getItem('wcs_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('wcs_products');
    if (!saved) return INITIAL_PRODUCTS;
    try {
      const parsed: Product[] = JSON.parse(saved);
      return parsed.map((p) => {
        if (!p.imageUrl) {
          const init = INITIAL_PRODUCTS.find((ip) => ip.id === p.id);
          if (init?.imageUrl) {
            return { ...p, imageUrl: init.imageUrl };
          }
        }
        return p;
      });
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('wcs_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('wcs_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('wcs_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>(() => {
    const saved = localStorage.getItem('wcs_online_orders');
    return saved ? JSON.parse(saved) : INITIAL_ONLINE_ORDERS;
  });

  const [promotions, setPromotions] = useState<FacebookPromotion[]>(() => {
    const saved = localStorage.getItem('wcs_promotions');
    return saved ? JSON.parse(saved) : INITIAL_PROMOTIONS;
  });

  const [reportConfigs, setReportConfigs] = useState<ReportConfig[]>(() => {
    const saved = localStorage.getItem('wcs_report_configs');
    return saved ? JSON.parse(saved) : INITIAL_REPORT_CONFIGS;
  });

  const [whatsappNotifications, setWhatsappNotifications] = useState<WhatsAppNotification[]>(() => {
    const saved = localStorage.getItem('wcs_whatsapp_notifications');
    return saved ? JSON.parse(saved) : INITIAL_WHATSAPP_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(() => {
    const saved = localStorage.getItem('wcs_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Modals state
  const [activeInvoice, setActiveInvoice] = useState<Sale | null>(null);
  const [activeWhatsAppDialog, setActiveWhatsAppDialog] = useState<{
    isOpen: boolean;
    phone: string;
    name: string;
    message: string;
    title: string;
  } | null>(null);

  const [latestOnlineAlert, setLatestOnlineAlert] = useState<OnlineOrder | null>(null);

  // Super Admin Authentication & Master Password State
  const [isSuperAdminAuthenticated, setIsSuperAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('wcs_admin_auth') === 'true';
  });

  const [superAdminPassword, setSuperAdminPassword] = useState<string>(() => {
    const saved = localStorage.getItem('wcs_admin_password');
    if (!saved || saved === 'wcsAdmin2026!') {
      localStorage.setItem('wcs_admin_password', '1975@2005n');
      return '1975@2005n';
    }
    return saved;
  });

  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('wcs_admin_password', superAdminPassword);
  }, [superAdminPassword]);

  useEffect(() => {
    sessionStorage.setItem('wcs_admin_auth', isSuperAdminAuthenticated ? 'true' : 'false');
  }, [isSuperAdminAuthenticated]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('wcs_tenants', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem('wcs_active_tenant', currentTenantId);
  }, [currentTenantId]);

  useEffect(() => {
    localStorage.setItem('wcs_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('wcs_active_user', currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('wcs_custom_fields', JSON.stringify(customFields));
  }, [customFields]);

  useEffect(() => {
    localStorage.setItem('wcs_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('wcs_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('wcs_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('wcs_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('wcs_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('wcs_online_orders', JSON.stringify(onlineOrders));
  }, [onlineOrders]);

  useEffect(() => {
    localStorage.setItem('wcs_promotions', JSON.stringify(promotions));
  }, [promotions]);

  useEffect(() => {
    localStorage.setItem('wcs_report_configs', JSON.stringify(reportConfigs));
  }, [reportConfigs]);

  useEffect(() => {
    localStorage.setItem('wcs_whatsapp_notifications', JSON.stringify(whatsappNotifications));
  }, [whatsappNotifications]);

  useEffect(() => {
    localStorage.setItem('wcs_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Derived state
  const currentTenant = tenants.find((t) => t.id === currentTenantId) || tenants[0];

  // Strictly enforce that currentUser belongs to the open company (unless authenticated as Super Admin)
  const currentUser: AppUser = useMemo(() => {
    if (isSuperAdminAuthenticated) {
      const superUser = users.find((u) => u.id === currentUserId && u.role === 'super_admin');
      if (superUser) return superUser;
    }
    // Match active user if they belong to this open company
    const tenantUser = users.find((u) => u.id === currentUserId && u.tenantId === currentTenant.id);
    if (tenantUser) return tenantUser;

    // Otherwise fallback to an owner or first available user in this open company
    const companyOwner = users.find((u) => u.tenantId === currentTenant.id && (u.role === 'business_owner' || u.role === 'owner'));
    if (companyOwner) return companyOwner;

    const anyCompanyUser = users.find((u) => u.tenantId === currentTenant.id);
    if (anyCompanyUser) return anyCompanyUser;

    return {
      id: `usr_owner_${currentTenant.id}`,
      tenantId: currentTenant.id,
      name: `${currentTenant.name} Director`,
      email: currentTenant.email || `contact@${currentTenant.businessCode.toLowerCase()}.lk`,
      role: 'business_owner',
      permissions: {
        sales: true,
        products: true,
        purchases: true,
        reports: true,
        settings: true,
        users: true,
        marketing: true,
        appointments: currentTenant.modules?.appointments || false,
      },
    };
  }, [users, currentUserId, currentTenant, isSuperAdminAuthenticated]);

  const isSuperAdmin = isSuperAdminAuthenticated && currentUser.role === 'super_admin';

  // Multi-tenant Filtered Datasets:
  // Strictly enforce tenant isolation: only return documents where doc.tenantId === currentTenant.id
  const tenantProducts = products.filter((p) => p.tenantId === currentTenant.id);
  const tenantCategories = categories.filter((c) => c.tenantId === currentTenant.id);
  const tenantCustomFields = customFields.filter((cf) => cf.tenantId === currentTenant.id);
  const tenantCustomers = customers.filter((c) => c.tenantId === currentTenant.id);
  const tenantSales = sales.filter((s) => s.tenantId === currentTenant.id);
  const tenantAppointments = appointments.filter((a) => a.tenantId === currentTenant.id);
  const tenantOnlineOrders = onlineOrders.filter((o) => o.tenantId === currentTenant.id);
  const tenantPromotions = promotions.filter((p) => p.tenantId === currentTenant.id);
  const tenantReportConfigs = reportConfigs.filter((r) => r.tenantId === currentTenant.id);
  const tenantWhatsappNotifications = whatsappNotifications.filter((w) => w.tenantId === currentTenant.id);
  const tenantAuditLogs = isSuperAdmin
    ? auditLogs
    : auditLogs.filter((l) => l.tenantId === currentTenant.id);

  const setCurrentTenantId = (id: string) => {
    setCurrentTenantIdState(id);
    localStorage.setItem('wcs_active_tenant', id);
    // Automatically switch active user to the newly opened company
    const tenantUser = users.find((u) => u.tenantId === id && (u.role === 'business_owner' || u.role === 'owner'))
      || users.find((u) => u.tenantId === id);
    if (tenantUser && !isSuperAdminAuthenticated) {
      setCurrentUserIdState(tenantUser.id);
      localStorage.setItem('wcs_active_user', tenantUser.id);
    }
  };

  const setCurrentUserId = (id: string) => {
    setCurrentUserIdState(id);
    localStorage.setItem('wcs_active_user', id);
    const selectedUser = users.find((u) => u.id === id);
    if (selectedUser && selectedUser.role !== 'super_admin' && selectedUser.tenantId !== 'SUPER_ADMIN') {
      if (selectedUser.tenantId !== currentTenantId) {
        setCurrentTenantIdState(selectedUser.tenantId);
        localStorage.setItem('wcs_active_tenant', selectedUser.tenantId);
      }
    }
  };

  const logAction = (action: string, entity: string, details: string) => {
    const newLog: SystemAuditLog = {
      id: `log_${Date.now()}`,
      tenantId: currentTenant.id,
      timestamp: new Date().toISOString(),
      action,
      entity,
      userId: currentUser.id,
      userName: currentUser.name,
      details,
      ipAddress: '192.168.1.1',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Product Actions
  const addProduct = (prodData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'tenantId'>): Product => {
    const newProduct: Product = {
      ...prodData,
      id: `prod_${Date.now()}`,
      tenantId: currentTenant.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    logAction('CREATE_PRODUCT', 'Product', `Added product ${newProduct.name} (${newProduct.code})`);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
    logAction('UPDATE_PRODUCT', 'Product', `Updated product ID: ${id}`);
  };

  const deleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    logAction('DELETE_PRODUCT', 'Product', `Deleted product ${target?.name || id}`);
  };

  // Category Actions
  const addCategory = (catData: Omit<ProductCategory, 'id' | 'tenantId'>) => {
    const newCat: ProductCategory = {
      ...catData,
      id: `cat_${Date.now()}`,
      tenantId: currentTenant.id,
    };
    setCategories((prev) => [...prev, newCat]);
    logAction('CREATE_CATEGORY', 'ProductCategory', `Created category ${newCat.name}`);
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    logAction('DELETE_CATEGORY', 'ProductCategory', `Deleted category ID: ${id}`);
  };

  // Custom Field Actions
  const addCustomField = (fieldData: Omit<CustomField, 'id' | 'tenantId'>) => {
    const newField: CustomField = {
      ...fieldData,
      id: `cf_${Date.now()}`,
      tenantId: currentTenant.id,
    };
    setCustomFields((prev) => [...prev, newField]);
    logAction('ADD_CUSTOM_FIELD', 'CustomField', `Configured new custom field '${newField.label}' (${newField.type})`);
  };

  const deleteCustomField = (id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
    logAction('DELETE_CUSTOM_FIELD', 'CustomField', `Removed custom field ID: ${id}`);
  };

  // Customer Actions
  const addCustomer = (customerData: Omit<Customer, 'id' | 'tenantId' | 'totalOrders' | 'totalSpent'>): Customer => {
    const newCust: Customer = {
      ...customerData,
      id: `cust_${Date.now()}`,
      tenantId: currentTenant.id,
      totalOrders: 0,
      totalSpent: 0,
    };
    setCustomers((prev) => [...prev, newCust]);
    logAction('CREATE_CUSTOMER', 'Customer', `Registered customer ${newCust.name}`);
    return newCust;
  };

  // Sale Actions (POS Checkout)
  const createSale = (saleData: Omit<Sale, 'id' | 'invoiceNumber' | 'createdAt' | 'tenantId'>): Sale => {
    const invCount = sales.filter((s) => s.tenantId === currentTenant.id).length + 1001;
    const invCode = currentTenant.businessCode.replace('-', '');
    const invoiceNumber = `INV-${invCode}-${invCount}`;

    const newSale: Sale = {
      ...saleData,
      id: `sale_${Date.now()}`,
      invoiceNumber,
      tenantId: currentTenant.id,
      createdAt: new Date().toISOString(),
    };

    // Deduct stock for sold items
    setProducts((prev) =>
      prev.map((prod) => {
        const item = saleData.items.find((i) => i.productId === prod.id);
        if (item) {
          const updatedStock = Math.max(0, prod.stockQuantity - item.quantity);
          return { ...prod, stockQuantity: updatedStock };
        }
        return prod;
      })
    );

    // Update customer spending
    if (saleData.customerId) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === saleData.customerId
            ? {
                ...c,
                totalOrders: c.totalOrders + 1,
                totalSpent: c.totalSpent + saleData.totalAmount,
              }
            : c
        )
      );
    }

    setSales((prev) => [newSale, ...prev]);
    logAction('CREATE_SALE', 'Sale', `POS Checkout #${invoiceNumber} completed for ${currentTenant.currencySymbol}${newSale.totalAmount}`);
    return newSale;
  };

  // Appointment Actions
  const addAppointment = (aptData: Omit<Appointment, 'id' | 'tenantId'>) => {
    const newApt: Appointment = {
      ...aptData,
      id: `apt_${Date.now()}`,
      tenantId: currentTenant.id,
    };
    setAppointments((prev) => [newApt, ...prev]);
    logAction('CREATE_APPOINTMENT', 'Appointment', `Booked appointment for ${newApt.customerName} on ${newApt.date} at ${newApt.startTime}`);
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    logAction('UPDATE_APPOINTMENT', 'Appointment', `Updated appointment ID: ${id}`);
  };

  const deleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    logAction('DELETE_APPOINTMENT', 'Appointment', `Deleted appointment ID: ${id}`);
  };

  // Online Order Actions (Facebook / Web Flow)
  const createOnlineOrder = (orderData: Omit<OnlineOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'tenantId'>): OnlineOrder => {
    const orderNum = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: OnlineOrder = {
      ...orderData,
      id: `ord_${Date.now()}`,
      orderNumber: orderNum,
      tenantId: currentTenant.id,
      status: 'new',
      outletAlertSent: true,
      whatsappAlertSent: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOnlineOrders((prev) => [newOrder, ...prev]);
    setLatestOnlineAlert(newOrder);

    // Send WhatsApp notification alert
    const waMsg: WhatsAppNotification = {
      id: `wa_${Date.now()}`,
      tenantId: currentTenant.id,
      recipientPhone: currentTenant.phone,
      recipientName: `${currentTenant.name} Orders Desk`,
      type: 'order_alert',
      status: 'delivered',
      messageText: `🚨 NEW ONLINE ORDER ALERT!\nOrder: #${newOrder.orderNumber}\nCustomer: ${newOrder.customerName} (${newOrder.customerPhone})\nTotal: ${currentTenant.currencySymbol}${newOrder.totalAmount.toLocaleString()}\nDelivery: ${newOrder.deliveryAddress}\nPlease check WCS Orders.`,
      timestamp: new Date().toISOString(),
    };
    setWhatsappNotifications((prev) => [waMsg, ...prev]);

    logAction('ONLINE_ORDER_RECEIVED', 'OnlineOrder', `New online order #${orderNum} placed by ${newOrder.customerName}`);
    return newOrder;
  };

  const updateOrderStatus = (id: string, status: OnlineOrderStatus) => {
    setOnlineOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o))
    );
    logAction('UPDATE_ORDER_STATUS', 'OnlineOrder', `Order #${id} status changed to ${status.toUpperCase()}`);
  };

  // Promotion Actions
  const addPromotion = (promoData: Omit<FacebookPromotion, 'id' | 'tenantId' | 'publishedAt' | 'reachCount' | 'clicksCount' | 'ordersGenerated'>) => {
    const newPromo: FacebookPromotion = {
      ...promoData,
      id: `fb_promo_${Date.now()}`,
      tenantId: currentTenant.id,
      reachCount: 0,
      clicksCount: 0,
      ordersGenerated: 0,
      publishedAt: new Date().toISOString(),
    };
    setPromotions((prev) => [newPromo, ...prev]);
    logAction('CREATE_FACEBOOK_CAMPAIGN', 'FacebookPromotion', `Published Facebook catalog campaign: ${newPromo.campaignTitle}`);
  };

  const updatePromotion = (id: string, updates: Partial<FacebookPromotion>) => {
    setPromotions((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  // Report Builder Actions
  const saveReportConfig = (configData: Omit<ReportConfig, 'id' | 'tenantId'>) => {
    const newConfig: ReportConfig = {
      ...configData,
      id: `rep_${Date.now()}`,
      tenantId: currentTenant.id,
    };
    setReportConfigs((prev) => [...prev, newConfig]);
    logAction('SAVE_REPORT_CONFIG', 'ReportConfig', `Saved custom report configuration '${newConfig.name}'`);
  };

  const deleteReportConfig = (id: string) => {
    setReportConfigs((prev) => prev.filter((r) => r.id !== id));
  };

  // WhatsApp Sender
  const sendWhatsAppMessage = (
    recipientPhone: string,
    recipientName: string,
    type: WhatsAppNotification['type'],
    messageText: string
  ): WhatsAppNotification => {
    const newMsg: WhatsAppNotification = {
      id: `wa_${Date.now()}`,
      tenantId: currentTenant.id,
      recipientPhone,
      recipientName,
      type,
      status: 'sent',
      messageText,
      timestamp: new Date().toISOString(),
    };
    setWhatsappNotifications((prev) => [newMsg, ...prev]);
    logAction('SEND_WHATSAPP', 'WhatsAppNotification', `Sent WhatsApp message to ${recipientName} (${recipientPhone})`);
    return newMsg;
  };

  // Tenant / Company Profile
  const updateCompanyProfile = (tenantId: string, updates: Partial<Tenant>) => {
    setTenants((prev) => prev.map((t) => (t.id === tenantId ? { ...t, ...updates } : t)));
    logAction('UPDATE_COMPANY_PROFILE', 'Tenant', `Updated company profile settings`);
  };

  const toggleTenantModule = (tenantId: string, moduleKey: keyof TenantModules, enabled: boolean) => {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === tenantId
          ? { ...t, modules: { ...t.modules, [moduleKey]: enabled } }
          : t
      )
    );
    logAction('TOGGLE_MODULE', 'Tenant', `Toggled module ${moduleKey} to ${enabled ? 'ENABLED' : 'DISABLED'}`);
  };

  const createTenant = (tenantData: Omit<Tenant, 'id' | 'createdAt'>): Tenant => {
    const newTenant: Tenant = {
      ...tenantData,
      id: `TENANT_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTenants((prev) => [...prev, newTenant]);

    // Create default owner user for new tenant
    const newUser: AppUser = {
      id: `usr_owner_${Date.now()}`,
      tenantId: newTenant.id,
      name: `${newTenant.name} Admin`,
      email: newTenant.email,
      role: 'business_owner',
      permissions: {
        sales: true,
        products: true,
        purchases: true,
        reports: true,
        settings: true,
        users: true,
        marketing: true,
        appointments: true,
      },
    };
    setUsers((prev) => [...prev, newUser]);
    logAction('PROVISION_TENANT', 'Tenant', `Provisioned new multi-tenant instance: ${newTenant.name}`);
    return newTenant;
  };

  const updateTenantStatus = (tenantId: string, status: Tenant['status']) => {
    setTenants((prev) => prev.map((t) => (t.id === tenantId ? { ...t, status } : t)));
    logAction('UPDATE_TENANT_STATUS', 'Tenant', `Changed status of tenant ${tenantId} to ${status}`);
  };

  // Modal Handlers
  const openInvoiceModal = (sale: Sale) => setActiveInvoice(sale);
  const closeInvoiceModal = () => setActiveInvoice(null);

  const openWhatsAppDialog = (phone: string, name: string, message: string, title = 'Send WhatsApp Notification') => {
    setActiveWhatsAppDialog({
      isOpen: true,
      phone,
      name,
      message,
      title,
    });
  };

  const closeWhatsAppDialog = () => setActiveWhatsAppDialog(null);
  const dismissOnlineAlert = () => setLatestOnlineAlert(null);

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    updateAppointment(id, { status });
  };

  const updateOnlineOrderStatus = (id: string, status: OnlineOrder['status']) => {
    updateOrderStatus(id, status as any);
  };

  const updateTenantProfile = (updates: Partial<Tenant>) => {
    updateCompanyProfile(currentTenant.id, updates);
  };

  const setCurrentTenant = (tenant: Tenant) => {
    setCurrentTenantId(tenant.id);
  };

  const setCurrentUser = (user: AppUser) => {
    setCurrentUserId(user.id);
  };

  const addTenant = (tenant: Omit<Tenant, 'id' | 'createdAt'>) => {
    return createTenant(tenant);
  };

  const addUser = (userData: Omit<AppUser, 'id' | 'tenantId'>) => {
    const newUser: AppUser = {
      ...userData,
      id: `usr_${Date.now()}`,
      tenantId: currentTenant.id,
    };
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  const loginSuperAdmin = (password: string) => {
    if (password.trim() === superAdminPassword.trim()) {
      setIsSuperAdminAuthenticated(true);
      const superUser = users.find((u) => u.role === 'super_admin') || users[0];
      if (superUser) {
        setCurrentUserIdState(superUser.id);
      }
      setShowAdminLoginModal(false);
      return { success: true };
    }
    return { success: false, message: 'Invalid Super Admin master password. Access denied.' };
  };

  const logoutSuperAdmin = () => {
    setIsSuperAdminAuthenticated(false);
    sessionStorage.removeItem('wcs_admin_auth');
    // Switch active user back to owner of current company
    const tenantUser =
      users.find((u) => u.tenantId === currentTenantId && u.role !== 'super_admin') ||
      users.find((u) => u.id === 'usr_owner_auto') ||
      users[1];
    if (tenantUser) {
      setCurrentUserIdState(tenantUser.id);
    }
    if (activeView === 'super_admin') {
      setActiveView('dashboard');
    }
  };

  const changeSuperAdminPassword = (currentPass: string, newPass: string) => {
    if (currentPass.trim() !== superAdminPassword.trim()) {
      return { success: false, message: 'Current master password does not match.' };
    }
    if (!newPass || newPass.trim().length < 4) {
      return { success: false, message: 'New password must be at least 4 characters long.' };
    }
    setSuperAdminPassword(newPass.trim());
    return { success: true, message: 'Super Admin master password updated successfully.' };
  };

  const resetAllData = () => {
    localStorage.clear();
    setTenants(INITIAL_TENANTS);
    setCurrentTenantIdState('TENANT_AUTO');
    setUsers(INITIAL_USERS);
    setCurrentUserIdState('usr_owner_auto');
    setCustomFields(INITIAL_CUSTOM_FIELDS);
    setCategories(INITIAL_CATEGORIES);
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setSales(INITIAL_SALES);
    setAppointments(INITIAL_APPOINTMENTS);
    setOnlineOrders(INITIAL_ONLINE_ORDERS);
    setPromotions(INITIAL_PROMOTIONS);
    setReportConfigs(INITIAL_REPORT_CONFIGS);
    setWhatsappNotifications(INITIAL_WHATSAPP_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.setItem('wcs_admin_password', '1975@2005n');
    setSuperAdminPassword('1975@2005n');
    setIsSuperAdminAuthenticated(false);
    sessionStorage.removeItem('wcs_admin_auth');
    setActiveView('dashboard');
  };

  return (
    <AppContext.Provider
      value={{
        tenants,
        currentTenant,
        setCurrentTenantId,
        users,
        currentUser,
        setCurrentUserId,
        isSuperAdmin,
        isSuperAdminAuthenticated,
        superAdminPassword,
        showAdminLoginModal,
        setShowAdminLoginModal,
        loginSuperAdmin,
        logoutSuperAdmin,
        changeSuperAdminPassword,
        activeView,
        setActiveView,
        products: tenantProducts,
        categories: tenantCategories,
        customFields: tenantCustomFields,
        customers: tenantCustomers,
        sales: tenantSales,
        appointments: tenantAppointments,
        onlineOrders: tenantOnlineOrders,
        promotions: tenantPromotions,
        reportConfigs: tenantReportConfigs,
        whatsappNotifications: tenantWhatsappNotifications,
        auditLogs: tenantAuditLogs,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        deleteCategory,
        addCustomField,
        deleteCustomField,
        addCustomer,
        createSale,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        createOnlineOrder,
        updateOrderStatus,
        addPromotion,
        updatePromotion,
        saveReportConfig,
        deleteReportConfig,
        sendWhatsAppMessage,
        updateCompanyProfile,
        toggleTenantModule,
        createTenant,
        updateTenantStatus,
        activeInvoice,
        activeInvoiceSale: activeInvoice,
        openInvoiceModal,
        closeInvoiceModal,
        updateAppointmentStatus,
        updateOnlineOrderStatus,
        updateTenantProfile,
        setCurrentTenant,
        setCurrentUser,
        addTenant,
        addUser,
        allSalesGlobal: sales,
        allProductsGlobal: products,
        activeWhatsAppDialog,
        openWhatsAppDialog,
        closeWhatsAppDialog,
        latestOnlineAlert,
        dismissOnlineAlert,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
