import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OnlineOrder } from '../../types';
import {
  ShoppingBag,
  Share2,
  MessageCircle,
  Clock,
  CheckCircle,
  Truck,
  PackageCheck,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
  ExternalLink,
  MapPin,
  Phone,
  User
} from 'lucide-react';

export const OnlineOrdersView: React.FC = () => {
  const {
    currentTenant,
    products,
    onlineOrders,
    updateOnlineOrderStatus,
    createOnlineOrder,
    openWhatsAppDialog,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(
    onlineOrders[0] || null
  );

  // Social Commerce Customer Simulation Form State
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simName, setSimName] = useState('Anura Kumara');
  const [simPhone, setSimPhone] = useState('+94 71 890 1234');
  const [simAddress, setSimAddress] = useState('No. 18, Galle Road, Colombo 03');
  const [simProductId, setSimProductId] = useState(products[0]?.id || '');
  const [simQty, setSimQty] = useState(1);
  const [simSource, setSimSource] = useState<'facebook' | 'whatsapp'>('facebook');

  const filteredOrders = onlineOrders.filter((o) =>
    statusFilter === 'all' ? true : o.status === statusFilter
  );

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === simProductId) || products[0];
    if (!prod) return;

    createOnlineOrder({
      source: simSource,
      customerName: simName.trim(),
      customerPhone: simPhone.trim(),
      deliveryAddress: simAddress.trim(),
      items: [
        {
          productId: prod.id,
          productName: prod.name,
          quantity: Number(simQty) || 1,
          price: prod.sellingPrice,
        },
      ],
      totalAmount: prod.sellingPrice * (Number(simQty) || 1),
      status: 'new',
      paymentMethod: 'Cash on Delivery',
      outletAlertSent: true,
      whatsappAlertSent: true,
    });

    setShowSimulateModal(false);
  };

  const getStatusBadge = (status: OnlineOrder['status']) => {
    switch (status) {
      case 'new':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'processing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'dispatched':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled':
        return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-stone-900">Social Commerce Online Orders</h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
              Facebook & WhatsApp Flow
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Incoming orders from Facebook ads, messenger forms, and WhatsApp shop for <strong>{currentTenant.name}</strong>
          </p>
        </div>

        <button
          onClick={() => setShowSimulateModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>Simulate Customer Order (FB / WA)</span>
        </button>
      </div>

      {/* Social Commerce Workflow Architecture Explainer */}
      <div className="bg-stone-900 text-stone-300 p-4 rounded-2xl border border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white text-xs">Full Automated Social Selling Flow</div>
            <div className="text-[11px] text-stone-400">
              Facebook Ad / WhatsApp Catalog → Lead Order Form → Saved in MongoDB with tenantId → Outlet Real-time Alert → Customer WhatsApp confirmation → Dispatch & Stock Deduction.
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 shrink-0 text-[10px] font-mono bg-stone-950 px-3 py-1.5 rounded-lg border border-stone-800">
          <span className="text-emerald-400">FB Ad</span>
          <span>→</span>
          <span className="text-sky-400">Form</span>
          <span>→</span>
          <span className="text-amber-400">Outlet Alert</span>
          <span>→</span>
          <span className="text-emerald-400">WhatsApp</span>
        </div>
      </div>

      {/* Orders Management Grid: List on Left, Detail on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Orders List (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col overflow-hidden">
          {/* Status Filter Tabs */}
          <div className="p-3 border-b border-stone-200 flex items-center space-x-1.5 overflow-x-auto text-xs">
            {['all', 'new', 'processing', 'dispatched', 'delivered'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg capitalize whitespace-nowrap font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-stone-900 text-white font-bold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {st} ({st === 'all' ? onlineOrders.length : onlineOrders.filter((o) => o.status === st).length})
              </button>
            ))}
          </div>

          {/* List */}
          <div className="divide-y divide-stone-100 overflow-y-auto max-h-[560px]">
            {filteredOrders.length === 0 ? (
              <div className="py-16 text-center text-stone-400 text-xs">
                No online orders matching this filter.
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-4 cursor-pointer transition-colors flex items-start justify-between gap-3 text-xs ${
                      isSelected ? 'bg-amber-50/60 border-l-4 border-amber-600' : 'hover:bg-stone-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-stone-900">{order.orderNumber}</span>
                        <span className={`px-2 py-0.2 rounded-full font-bold uppercase text-[10px] border ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                        <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded capitalize font-medium">
                          {order.source}
                        </span>
                      </div>
                      <div className="font-bold text-stone-900">{order.customerName}</div>
                      <div className="text-stone-500 text-[11px] truncate max-w-sm">
                        {order.items.map((i) => `${i.productName} (${i.quantity}x)`).join(', ')}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-black text-stone-900 text-sm">
                        {currentTenant.currencySymbol}{order.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-stone-400 mt-1">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Order Detail & Processing Workflow (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 shadow-xs p-5 flex flex-col justify-between text-xs space-y-4">
          {selectedOrder ? (
            <>
              <div>
                <div className="flex items-center justify-between border-b pb-3 mb-3">
                  <div>
                    <h3 className="font-bold text-sm text-stone-900">
                      Order {selectedOrder.orderNumber}
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      Source: {selectedOrder.source.toUpperCase()} • Created: {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-xs border ${getStatusBadge(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>

                {/* Customer Information */}
                <div className="bg-stone-50 rounded-xl p-3 space-y-2 border border-stone-200/80 mb-4">
                  <div className="flex items-center space-x-2 text-stone-900 font-bold">
                    <User className="w-3.5 h-3.5 text-stone-600" />
                    <span>{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-stone-600 text-[11px]">
                    <Phone className="w-3.5 h-3.5 text-stone-500" />
                    <span>{selectedOrder.customerPhone}</span>
                  </div>
                  <div className="flex items-start space-x-2 text-stone-600 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                    <span>{selectedOrder.deliveryAddress}</span>
                  </div>
                </div>

                {/* Ordered Items */}
                <div className="space-y-2 mb-4">
                  <div className="font-bold text-stone-700 uppercase tracking-wider text-[10px]">
                    Order Items & Quantities
                  </div>
                  <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl p-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="py-1.5 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-stone-900">{item.productName}</div>
                          <div className="text-[10px] text-stone-400">
                            {item.quantity} x {currentTenant.currencySymbol}{item.price.toLocaleString()}
                          </div>
                        </div>
                        <div className="font-mono font-bold text-stone-900">
                          {currentTenant.currencySymbol}{(item.quantity * item.price).toLocaleString()}
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 flex justify-between font-black text-sm text-stone-900">
                      <span>Total Amount:</span>
                      <span className="font-mono text-amber-900">
                        {currentTenant.currencySymbol}{selectedOrder.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Status Alert Trigger */}
                <button
                  onClick={() => {
                    const msg = `Hello ${selectedOrder.customerName}, this is ${currentTenant.name}. Your online order #${selectedOrder.orderNumber} is currently *${selectedOrder.status.toUpperCase()}*. Total: ${currentTenant.currencySymbol}${selectedOrder.totalAmount.toLocaleString()}. Thank you!`;
                    openWhatsAppDialog(selectedOrder.customerPhone, selectedOrder.customerName, msg, `WhatsApp Order Notification #${selectedOrder.orderNumber}`);
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold py-2 rounded-xl text-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Send WhatsApp Status Update to Customer</span>
                </button>
              </div>

              {/* Workflow Actions */}
              <div className="pt-4 border-t border-stone-200 space-y-2">
                <div className="font-bold text-stone-700 uppercase tracking-wider text-[10px]">
                  Change Order State
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {selectedOrder.status === 'new' && (
                    <button
                      onClick={() => updateOnlineOrderStatus(selectedOrder.id, 'processing')}
                      className="col-span-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Accept Order & Start Packing</span>
                    </button>
                  )}

                  {selectedOrder.status === 'processing' && (
                    <button
                      onClick={() => updateOnlineOrderStatus(selectedOrder.id, 'dispatched')}
                      className="col-span-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Dispatch via Courier (Deduct Stock)</span>
                    </button>
                  )}

                  {selectedOrder.status === 'dispatched' && (
                    <button
                      onClick={() => updateOnlineOrderStatus(selectedOrder.id, 'delivered')}
                      className="col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5"
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>Mark as Delivered & Paid</span>
                    </button>
                  )}

                  {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                    <button
                      onClick={() => updateOnlineOrderStatus(selectedOrder.id, 'cancelled')}
                      className="col-span-2 bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold py-1.5 rounded-xl text-xs"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-stone-400">
              Select an order from the left to view details.
            </div>
          )}
        </div>
      </div>

      {/* Simulator Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-stone-200 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Simulate Facebook / WhatsApp Customer Order</span>
              </h3>
            </div>
            <p className="text-stone-500 text-[11px]">
              This simulates a social media shopper clicking an ad or message link, filling out the checkout lead form, and submitting the order.
            </p>

            <form onSubmit={handleSimulateSubmit} className="space-y-3">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Source Channel</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSimSource('facebook')}
                    className={`py-1.5 rounded-lg font-semibold text-xs border ${
                      simSource === 'facebook' ? 'bg-sky-600 text-white border-sky-700' : 'bg-white text-stone-700'
                    }`}
                  >
                    Facebook Ad / Messenger
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimSource('whatsapp')}
                    className={`py-1.5 rounded-lg font-semibold text-xs border ${
                      simSource === 'whatsapp' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white text-stone-700'
                    }`}
                  >
                    WhatsApp Catalog
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">WhatsApp Phone Number</label>
                <input
                  type="text"
                  required
                  value={simPhone}
                  onChange={(e) => setSimPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Delivery Address</label>
                <input
                  type="text"
                  required
                  value={simAddress}
                  onChange={(e) => setSimAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="font-semibold text-stone-700 block mb-1">Product</label>
                  <select
                    value={simProductId}
                    onChange={(e) => setSimProductId(e.target.value)}
                    className="w-full px-2 py-2 border border-stone-300 rounded-lg"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({currentTenant.currencySymbol}{p.sellingPrice.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={simQty}
                    onChange={(e) => setSimQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 rounded-lg border border-stone-200 text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Submit Simulated Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
