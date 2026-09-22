import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  CreditCard,
  AlertTriangle,
  ShoppingBag,
  TrendingUp,
  Package,
  Calendar,
  Sparkles,
  Plus,
  ArrowRight,
  Printer,
  MessageCircle,
  Share2,
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    currentTenant,
    products,
    sales,
    onlineOrders,
    appointments,
    setActiveView,
    openInvoiceModal,
    openWhatsAppDialog,
    updateProduct,
    createOnlineOrder,
  } = useApp();

  // Calculations
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const todaySales = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const lowStockProducts = products.filter((p) => p.stockQuantity <= p.minStock);
  const pendingOrders = onlineOrders.filter((o) => o.status === 'new');
  const todayAppointments = appointments.filter((a) => a.date.startsWith('2026-09-22') || a.date.startsWith(todayDateStr));

  // Quick Facebook Order Simulator from Dashboard
  const handleQuickSimulateOrder = () => {
    const randomProduct = products[0] || {
      id: 'prod_sim',
      name: 'Sample Product',
      sellingPrice: 5000,
    };

    createOnlineOrder({
      source: 'facebook',
      customerName: 'Nimal Jayasinghe',
      customerPhone: '+94 77 123 4567',
      deliveryAddress: 'No. 45/2, High Level Road, Colombo 05',
      items: [
        {
          productId: randomProduct.id,
          productName: randomProduct.name,
          quantity: 1,
          price: randomProduct.sellingPrice,
        },
      ],
      totalAmount: randomProduct.sellingPrice,
      status: 'new',
      paymentMethod: 'Cash on Delivery',
      outletAlertSent: true,
      whatsappAlertSent: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Industry & Tenant Context */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white rounded-2xl p-6 shadow-md border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 uppercase tracking-wider">
              {currentTenant.industry} SaaS Instance
            </span>
            <span className="text-xs text-stone-400">Tenant ID: {currentTenant.id}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            {currentTenant.name}
          </h1>
          <p className="text-xs text-stone-300 mt-1 max-w-xl">
            {currentTenant.billHeader} • Configured for {currentTenant.currency} billing with multi-tenant custom fields.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setActiveView('pos')}
            className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-stone-950 px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-transform active:scale-95"
          >
            <CreditCard className="w-4 h-4" />
            <span>Open POS Terminal</span>
          </button>
          <button
            onClick={handleQuickSimulateOrder}
            className="flex items-center space-x-2 bg-stone-700 hover:bg-stone-600 text-white px-3.5 py-2.5 rounded-xl font-semibold text-xs border border-stone-600 transition-colors"
            title="Simulate Facebook customer placing an order"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>Simulate FB Order</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales Card */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Recorded Sales
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-stone-900">
              {currentTenant.currencySymbol}{todaySales.toLocaleString()}
            </div>
            <div className="text-xs text-stone-400 mt-1">
              {sales.length} invoices generated
            </div>
          </div>
          <button
            onClick={() => setActiveView('pos')}
            className="mt-3 pt-3 border-t border-stone-100 text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center justify-between"
          >
            <span>Launch POS Checkout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Stock Alerts Card */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Stock Alerts
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              lowStockProducts.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-stone-100 text-stone-600'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-black ${lowStockProducts.length > 0 ? 'text-rose-600' : 'text-stone-900'}`}>
              {lowStockProducts.length}
            </div>
            <div className="text-xs text-stone-400 mt-1">
              Products below minimum safety threshold
            </div>
          </div>
          <button
            onClick={() => setActiveView('products')}
            className="mt-3 pt-3 border-t border-stone-100 text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center justify-between"
          >
            <span>Manage Inventory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Social Commerce Online Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Online Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-stone-900 flex items-center space-x-2">
              <span>{onlineOrders.length}</span>
              {pendingOrders.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold animate-pulse">
                  {pendingOrders.length} New
                </span>
              )}
            </div>
            <div className="text-xs text-stone-400 mt-1">
              Via Facebook & WhatsApp Commerce
            </div>
          </div>
          <button
            onClick={() => setActiveView('online_orders')}
            className="mt-3 pt-3 border-t border-stone-100 text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center justify-between"
          >
            <span>View Social Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dynamic 4th KPI: Salon Appointments OR Custom Fields Engine */}
        {currentTenant.modules.appointments ? (
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Appointments
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-stone-900">
                {todayAppointments.length}
              </div>
              <div className="text-xs text-stone-400 mt-1">
                Scheduled for today / this week
              </div>
            </div>
            <button
              onClick={() => setActiveView('appointments')}
              className="mt-3 pt-3 border-t border-stone-100 text-xs font-semibold text-purple-700 hover:text-purple-800 flex items-center justify-between"
            >
              <span>Salon Calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Industry Fields
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-stone-900 capitalize">
                {currentTenant.industry}
              </div>
              <div className="text-xs text-stone-400 mt-1">
                Custom schema & attributes active
              </div>
            </div>
            <button
              onClick={() => setActiveView('custom_fields')}
              className="mt-3 pt-3 border-t border-stone-100 text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center justify-between"
            >
              <span>Configure Custom Fields</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Content Grid: Low Stock Alert & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Warning Table */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Low Stock Inventory Alerts</h3>
              <p className="text-xs text-stone-500">Items needing supplier replenishment</p>
            </div>
            <button
              onClick={() => setActiveView('products')}
              className="text-xs font-semibold text-amber-800 hover:text-amber-900"
            >
              View All ({products.length})
            </button>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              All inventory levels are above minimum threshold.
            </div>
          ) : (
            <div className="divide-y divide-stone-100 overflow-x-auto">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-stone-900">{p.name}</div>
                    <div className="text-stone-400 font-mono text-[11px]">
                      Code: {p.code} • Category: {p.categoryName}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                        {p.stockQuantity} {p.unit} left
                      </span>
                      <div className="text-[10px] text-stone-400 mt-0.5">Min: {p.minStock}</div>
                    </div>
                    <button
                      onClick={() => updateProduct(p.id, { stockQuantity: p.stockQuantity + 20 })}
                      className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-2.5 py-1 rounded text-xs transition-colors"
                      title="Quick replenish +20"
                    >
                      + Restock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions & Invoices */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Recent POS Invoices</h3>
              <p className="text-xs text-stone-500">Transactions processed for {currentTenant.name}</p>
            </div>
            <button
              onClick={() => setActiveView('pos')}
              className="text-xs font-semibold text-amber-800 hover:text-amber-900"
            >
              New Sale
            </button>
          </div>

          {sales.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              No sales recorded yet. Open POS to generate your first invoice.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {sales.slice(0, 5).map((sale) => (
                <div key={sale.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-stone-900">{sale.invoiceNumber}</div>
                    <div className="text-stone-500 text-[11px]">
                      {sale.customerName} • {sale.items.length} item(s) • {sale.paymentMethod.toUpperCase()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-stone-900 mr-2">
                      {currentTenant.currencySymbol}{sale.totalAmount.toLocaleString()}
                    </span>
                    <button
                      onClick={() => openInvoiceModal(sale)}
                      className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                      title="View & Print Invoice (A4 / Thermal)"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        const msg = `Hello ${sale.customerName}, here is your invoice #${sale.invoiceNumber} from ${currentTenant.name} for ${currentTenant.currencySymbol}${sale.totalAmount.toLocaleString()}: https://${currentTenant.businessCode.toLowerCase()}.wcs.lk/inv/${sale.invoiceNumber}`;
                        openWhatsAppDialog(sale.customerPhone || currentTenant.phone, sale.customerName, msg);
                      }}
                      className="p-1.5 rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                      title="Send WhatsApp Invoice"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
