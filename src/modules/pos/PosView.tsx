import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Customer } from '../../types';
import {
  Search,
  Barcode,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  Smartphone,
  User,
  Check,
  Tag,
  Receipt,
  X,
  Sparkles,
  Package,
  Image as ImageIcon
} from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
}

export const PosView: React.FC = () => {
  const {
    currentTenant,
    products,
    categories,
    customers,
    currentUser,
    createSale,
    openInvoiceModal,
    addCustomer,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [overallDiscount, setOverallDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'credit' | 'online'>('cash');
  const [notes, setNotes] = useState('');

  // Quick Customer Add Modal
  const [showQuickCustomerModal, setShowQuickCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const matchQuery =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.customFields && Object.values(p.customFields).some((v) => String(v).toLowerCase().includes(searchQuery.toLowerCase())));
      return matchCat && matchQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart operations
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, discount: 0 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setOverallDiscount(0);
    setNotes('');
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
  const totalAmount = Math.max(0, subtotal - overallDiscount);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const saleItems = cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      productCode: item.product.code,
      price: item.product.sellingPrice,
      quantity: item.quantity,
      discount: item.discount,
      taxRate: item.product.taxRate,
      subtotal: item.product.sellingPrice * item.quantity - item.discount,
      customFields: item.product.customFields,
    }));

    const newSale = createSale({
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in Customer',
      customerPhone: selectedCustomer ? selectedCustomer.phone : currentTenant.phone,
      items: saleItems,
      subtotal,
      discountAmount: overallDiscount,
      taxAmount: 0,
      totalAmount,
      paymentMethod,
      paymentStatus: 'paid',
      notes,
      cashierName: currentUser.name,
    });

    // Clear cart and automatically open Invoice modal for preview / print / WhatsApp
    clearCart();
    openInvoiceModal(newSale);
  };

  const handleCreateQuickCustomer = () => {
    if (!newCustName.trim()) return;
    const created = addCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim() || currentTenant.phone,
    });
    setSelectedCustomerId(created.id);
    setShowQuickCustomerModal(false);
    setNewCustName('');
    setNewCustPhone('');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-6.5rem)]">
      {/* Left: Product Catalog & Search */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {/* Search & Category Header */}
        <div className="p-4 border-b border-stone-200 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${currentTenant.name} catalog by name, barcode, code, model...`}
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="hidden sm:flex items-center space-x-1.5 text-xs text-stone-500 bg-stone-100 px-2.5 py-2 rounded-xl">
              <Barcode className="w-4 h-4 text-stone-600" />
              <span>Barcode Ready</span>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              All Items ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-400">
              <Tag className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm font-semibold">No products found</p>
              <p className="text-xs text-stone-400 mt-1">Try another search keyword or switch categories.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((product) => {
                const inCart = cart.find((i) => i.product.id === product.id);
                return (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="relative bg-white border border-stone-200 hover:border-amber-400 rounded-xl p-2.5 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md group active:scale-[0.98]"
                  >
                    <div>
                      {/* Product Image Thumbnail */}
                      <div className="w-full h-24 sm:h-28 mb-2 rounded-lg overflow-hidden bg-stone-100 border border-stone-100 flex items-center justify-center relative">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-stone-300">
                            <Package className="w-6 h-6 mb-1" />
                            <span className="text-[9px] uppercase font-bold tracking-wider text-stone-400">No Image</span>
                          </div>
                        )}
                        {inCart && (
                          <div className="absolute top-1.5 right-1.5 bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">
                            {inCart.quantity} in cart
                          </div>
                        )}
                      </div>

                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider font-mono">
                          {product.code}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                          product.stockQuantity <= product.minStock
                            ? 'bg-rose-100 text-rose-700 font-bold'
                            : 'bg-stone-100 text-stone-600'
                        }`}>
                          {product.stockQuantity} {product.unit}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-stone-900 line-clamp-2 leading-snug group-hover:text-amber-800">
                        {product.name}
                      </h4>

                      {/* Display 1 key industry custom field if present */}
                      {product.customFields && Object.keys(product.customFields).length > 0 && (
                        <div className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded mt-1.5 line-clamp-1">
                          {Object.entries(product.customFields)
                            .slice(0, 1)
                            .map(([k, v]) => `${k}: ${v}`)}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between">
                      <div className="font-mono font-black text-sm text-stone-900">
                        {currentTenant.currencySymbol}{product.sellingPrice.toLocaleString()}
                      </div>
                      <button
                        className="w-6 h-6 rounded-lg bg-stone-100 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center text-stone-600 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {inCart && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-600 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                        {inCart.quantity}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart & Fast Checkout Panel */}
      <div className="w-full lg:w-96 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col overflow-hidden">
        {/* Cart Header with Customer Selection */}
        <div className="p-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4 text-stone-700" />
              <h3 className="font-bold text-stone-900 text-sm">Active Bill</h3>
              <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.2 rounded-full font-bold">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Customer Selector */}
          <div className="flex items-center space-x-1.5 mt-2">
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="flex-1 bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Walk-in Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowQuickCustomerModal(true)}
              className="p-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs"
              title="Add New Customer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 p-4 overflow-y-auto divide-y divide-stone-100 text-xs">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-stone-400 py-12">
              <ShoppingCart className="w-8 h-8 mb-2 opacity-30" />
              <p className="font-medium text-xs">Cart is empty</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Click products on the left to start billing.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-2">
                <div className="w-8 h-8 rounded-md bg-stone-100 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {item.product.imageUrl ? (
                    <img src={item.product.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-4 h-4 text-stone-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0 pr-1 truncate">
                  <div className="font-bold text-stone-900 truncate">{item.product.name}</div>
                  <div className="text-stone-400 text-[10px] font-mono">
                    {currentTenant.currencySymbol}{item.product.sellingPrice.toLocaleString()} each
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="p-1 text-stone-600 hover:text-stone-900"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 font-bold font-mono text-xs">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="p-1 text-stone-600 hover:text-stone-900"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="font-mono font-bold text-stone-900 w-16 text-right">
                    {currentTenant.currencySymbol}{(item.product.sellingPrice * item.quantity).toLocaleString()}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 text-stone-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill Summary & Payment Method */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-3">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal:</span>
              <span className="font-mono font-semibold">
                {currentTenant.currencySymbol}{subtotal.toLocaleString()}
              </span>
            </div>

            {/* Overall Discount Input */}
            <div className="flex justify-between items-center text-stone-600">
              <span>Bill Discount:</span>
              <div className="flex items-center space-x-1">
                <span className="text-[10px]">{currentTenant.currencySymbol}</span>
                <input
                  type="number"
                  min="0"
                  value={overallDiscount || ''}
                  onChange={(e) => setOverallDiscount(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-20 px-2 py-0.5 text-right font-mono text-xs border border-stone-300 rounded bg-white"
                />
              </div>
            </div>

            <div className="flex justify-between font-black text-sm text-stone-900 pt-2 border-t border-stone-200">
              <span>Grand Total:</span>
              <span className="font-mono text-amber-900">
                {currentTenant.currencySymbol}{totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
              Payment Method
            </span>
            <div className="grid grid-cols-4 gap-1.5 text-xs">
              {[
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'card', label: 'Card', icon: CreditCard },
                { id: 'online', label: 'Online', icon: Smartphone },
                { id: 'credit', label: 'Credit', icon: Receipt },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-1.5 rounded-lg border text-center flex flex-col items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-amber-600 text-white border-amber-700 font-bold'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 mb-0.5" />
                    <span className="text-[10px] leading-none">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Checkout Action */}
          <button
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className="w-full bg-stone-900 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center space-x-2 text-xs"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Complete Sale & Print Receipt ({currentTenant.currencySymbol}{totalAmount.toLocaleString()})</span>
          </button>
        </div>
      </div>

      {/* Quick Add Customer Modal */}
      {showQuickCustomerModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-stone-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm">Quick Add Customer</h3>
              <button onClick={() => setShowQuickCustomerModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Customer Full Name</label>
                <input
                  type="text"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Sunil Perera"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Phone / WhatsApp</label>
                <input
                  type="text"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="+94 77 123 4567"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowQuickCustomerModal(false)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-medium text-stone-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateQuickCustomer}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
              >
                Save & Select
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
