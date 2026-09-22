import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  CreditCard,
  Package,
  Layers,
  ShoppingBag,
  Calendar,
  BarChart3,
  Share2,
  SlidersHorizontal,
  Building,
  Users,
  ShieldCheck,
  FileSpreadsheet,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Lock
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    currentTenant,
    currentUser,
    activeView,
    setActiveView,
    onlineOrders,
    isSuperAdmin,
    isSuperAdminAuthenticated,
    setShowAdminLoginModal,
  } = useApp();

  const newOrdersCount = onlineOrders.filter((o) => o.status === 'new').length;
  const mods = currentTenant.modules;
  const perms = currentUser.permissions;

  // Build navigation items based on tenant modules and user permissions
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      visible: true,
    },
    {
      id: 'pos',
      label: 'POS Checkout',
      icon: CreditCard,
      visible: mods.pos && (isSuperAdmin || perms.sales),
      badge: 'Fast',
    },
    {
      id: 'products',
      label: 'Products & Stock',
      icon: Package,
      visible: mods.inventory && (isSuperAdmin || perms.products),
    },
    {
      id: 'online_orders',
      label: 'Online Orders',
      icon: ShoppingBag,
      visible: (mods.facebook || mods.whatsapp) && (isSuperAdmin || perms.sales),
      count: newOrdersCount > 0 ? newOrdersCount : undefined,
    },
    {
      id: 'appointments',
      label: 'Salon Appointments',
      icon: Calendar,
      visible: mods.appointments && (isSuperAdmin || perms.appointments),
      badge: 'Salon',
    },
    {
      id: 'marketing_facebook',
      label: 'Facebook Marketing',
      icon: Share2,
      visible: mods.facebook && (isSuperAdmin || perms.marketing),
    },
    {
      id: 'report_builder',
      label: 'Report Builder',
      icon: BarChart3,
      visible: mods.reportBuilder && (isSuperAdmin || perms.reports),
      badge: 'Custom',
    },
    {
      id: 'custom_fields',
      label: 'Custom Fields',
      icon: SlidersHorizontal,
      visible: mods.customFields && (isSuperAdmin || perms.settings),
      badge: 'Engine',
    },
  ];

  const settingItems = [
    {
      id: 'company_profile',
      label: 'Company Profile',
      icon: Building,
      visible: isSuperAdmin || perms.settings,
    },
    {
      id: 'users_roles',
      label: 'Users & Permissions',
      icon: Users,
      visible: isSuperAdmin || perms.users,
    },
  ];

  return (
    <aside className="w-64 bg-stone-900 text-stone-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-stone-800">
      {/* Current Tenant Identity Header */}
      <div className="p-4 border-b border-stone-800/80 bg-stone-950/40">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500 text-stone-950 font-extrabold flex items-center justify-center text-base shadow-sm shrink-0 uppercase">
            {currentTenant.businessCode.slice(0, 3)}
          </div>
          <div className="truncate">
            <h2 className="text-sm font-semibold text-white truncate leading-tight">
              {currentTenant.name}
            </h2>
            <div className="flex items-center space-x-1.5 mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-stone-400 capitalize">
                {currentTenant.industry} • {currentTenant.currency}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
          Core Business Modules
        </div>

        {navItems
          .filter((item) => item.visible)
          .map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white font-semibold shadow-xs'
                    : 'text-stone-300 hover:bg-stone-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                <div className="flex items-center space-x-1.5 shrink-0">
                  {item.badge && !item.count && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                        isActive
                          ? 'bg-amber-700/80 text-white'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {typeof item.count === 'number' && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                      {item.count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}

        <div className="pt-4 px-3 pb-1 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
          Configuration & Settings
        </div>

        {settingItems
          .filter((item) => item.visible)
          .map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white font-semibold shadow-xs'
                    : 'text-stone-300 hover:bg-stone-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
              </button>
            );
          })}

        {/* Super Admin section */}
        <div className="pt-4 px-3 pb-1 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
          Platform Architecture
        </div>
        <button
          onClick={() => {
            if (!isSuperAdminAuthenticated) {
              setShowAdminLoginModal(true);
            } else {
              setActiveView('super_admin');
            }
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            activeView === 'super_admin'
              ? 'bg-amber-700 text-white font-semibold'
              : 'text-stone-300 hover:bg-stone-800/70 hover:text-white'
          }`}
          title={isSuperAdminAuthenticated ? 'Super Admin Portal' : 'Super Admin Portal (Password clearance required)'}
        >
          <div className="flex items-center space-x-2.5 truncate">
            {isSuperAdminAuthenticated ? (
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Lock className="w-4 h-4 text-amber-500/80 shrink-0" />
            )}
            <span className="truncate">Super Admin Portal</span>
          </div>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border ${
              isSuperAdminAuthenticated
                ? 'bg-amber-950 text-amber-300 border-amber-700/40'
                : 'bg-stone-800 text-stone-400 border-stone-700'
            }`}
          >
            {isSuperAdminAuthenticated ? 'Active' : 'Locked'}
          </span>
        </button>
      </div>

      {/* Footer Database Isolation Badge */}
      <div className="p-3 border-t border-stone-800 bg-stone-950/60 text-[11px] text-stone-400">
        <div className="flex items-center justify-between text-stone-400 mb-1">
          <span className="font-mono text-[10px]">tenantId:</span>
          <span className="font-mono text-[10px] text-amber-400 font-semibold">{currentTenant.id}</span>
        </div>
        <div className="text-[10px] text-stone-400 leading-tight">
          Single Shared MongoDB • Filtered by Tenant ID
        </div>
      </div>
    </aside>
  );
};
