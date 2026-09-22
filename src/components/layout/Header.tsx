import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Search,
  Building2,
  Shield,
  ShieldCheck,
  User,
  ChevronDown,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ShoppingBag,
  CheckCircle,
  X,
  Volume2,
  Lock,
  LogOut,
  Users
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    tenants,
    currentTenant,
    setCurrentTenantId,
    users,
    currentUser,
    setCurrentUserId,
    isSuperAdmin,
    isSuperAdminAuthenticated,
    logoutSuperAdmin,
    setShowAdminLoginModal,
    onlineOrders,
    setActiveView,
    activeView,
    latestOnlineAlert,
    dismissOnlineAlert,
    resetAllData,
  } = useApp();

  const [showTenantMenu, setShowTenantMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const pendingOrders = onlineOrders.filter((o) => o.status === 'new');
  const openCompanyUsers = users.filter((u) => u.tenantId === currentTenant.id);

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      {/* Alert banner if an online order arrives */}
      {latestOnlineAlert && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-sm flex items-center justify-between shadow-inner animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <span className="p-1 bg-white/20 rounded-full animate-pulse">
              <ShoppingBag className="w-4 h-4 text-white" />
            </span>
            <span className="font-semibold">New Social Commerce Order Received!</span>
            <span className="opacity-90">
              #{latestOnlineAlert.orderNumber} from {latestOnlineAlert.customerName} (
              {currentTenant.currencySymbol}{latestOnlineAlert.totalAmount.toLocaleString()})
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setActiveView('online_orders');
                dismissOnlineAlert();
              }}
              className="bg-white text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-sm shadow-xs hover:bg-emerald-50 transition-colors"
            >
              View Order
            </button>
            <button
              onClick={dismissOnlineAlert}
              className="text-white/80 hover:text-white p-1"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand & Business Switcher */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold text-lg tracking-wider shadow-sm">
              WCS
            </div>
            <div className="hidden md:block">
              <div className="text-xs text-stone-500 font-medium tracking-wider uppercase">
                Business Platform
              </div>
              <div className="text-sm font-semibold text-stone-900 leading-none">
                Multi-Tenant Core
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-stone-200 hidden sm:block" />

          {/* Tenant Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowTenantMenu(!showTenantMenu);
                setShowUserMenu(false);
              }}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 text-sm font-medium transition-colors"
              title="Switch Active Tenant / Business"
            >
              <Building2 className="w-4 h-4 text-stone-500" />
              <span className="font-semibold text-stone-900 max-w-[160px] sm:max-w-[220px] truncate">
                {currentTenant.name}
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-stone-200 text-stone-700 uppercase tracking-wider font-semibold">
                {currentTenant.industry}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {showTenantMenu && (
              <div className="absolute left-0 mt-2 w-84 bg-white border border-stone-200 rounded-xl shadow-xl z-50 py-2 divide-y divide-stone-100 animate-in fade-in-50 duration-150">
                {isSuperAdminAuthenticated ? (
                  <>
                    <div className="px-3 py-2 bg-amber-50/70 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center space-x-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                          <span>All Registered Tenants ({tenants.length})</span>
                        </p>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          Super Admin mode unlocked
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          logoutSuperAdmin();
                          setShowTenantMenu(false);
                        }}
                        className="text-[11px] text-rose-700 hover:text-rose-800 font-semibold hover:underline flex items-center space-x-1"
                        title="Lock multi-tenant view"
                      >
                        <Lock className="w-3 h-3" />
                        <span>Lock</span>
                      </button>
                    </div>

                    <div className="max-h-72 overflow-y-auto py-1">
                      {tenants.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setCurrentTenantId(t.id);
                            setShowTenantMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-stone-50 transition-colors ${
                            t.id === currentTenant.id ? 'bg-amber-50/70 font-semibold text-amber-950' : 'text-stone-700'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="truncate font-medium">{t.name}</div>
                            <div className="text-xs text-stone-500 capitalize">
                              {t.industry} • Plan: {t.plan}
                            </div>
                          </div>
                          {t.id === currentTenant.id && (
                            <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="px-3 py-2 bg-stone-50">
                      <button
                        onClick={() => {
                          setActiveView('super_admin');
                          setShowTenantMenu(false);
                        }}
                        className="w-full text-center text-xs font-semibold text-stone-800 hover:text-stone-900 py-1 flex items-center justify-center space-x-1"
                      >
                        <span>Manage All Businesses in Super Admin</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-3 py-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                          Active Business Tenant
                        </p>
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                          Tenant Isolated
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        Other companies are protected and hidden from non-admin users.
                      </p>
                    </div>

                    <div className="p-3 bg-stone-50/80">
                      <div className="font-bold text-stone-900 text-sm">{currentTenant.name}</div>
                      <div className="text-xs text-stone-600 capitalize mt-0.5">
                        {currentTenant.industry} • Code: {currentTenant.businessCode} • {currentTenant.currency}
                      </div>
                    </div>

                    <div className="p-3 bg-stone-50 space-y-2">
                      <p className="text-[11px] text-stone-600 leading-tight">
                        To inspect or switch to other company databases, enter your master admin password.
                      </p>
                      <button
                        onClick={() => {
                          setShowTenantMenu(false);
                          setShowAdminLoginModal(true);
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Super Admin Password to Switch Company</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions & User Switcher */}
        <div className="flex items-center space-x-3">
          {/* Quick Super Admin Authentication Button / Status */}
          {isSuperAdminAuthenticated ? (
            <div className="hidden sm:flex items-center space-x-1 bg-amber-50 border border-amber-300/80 rounded-xl p-0.5 shadow-xs">
              <button
                onClick={() => setActiveView(activeView === 'super_admin' ? 'dashboard' : 'super_admin')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeView === 'super_admin'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-950 hover:bg-amber-100/80'
                }`}
                title="View Super Admin SaaS platform"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Super Admin</span>
              </button>
              <button
                onClick={logoutSuperAdmin}
                className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-stone-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                title="Logout Super Admin and lock other company access"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAdminLoginModal(true)}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              title="Authenticate with Super Admin password to manage other companies"
            >
              <Lock className="w-3.5 h-3.5 text-stone-500" />
              <span>Super Admin Login</span>
            </button>
          )}

          {/* Online Orders Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              title="Online Orders & System Alerts"
            >
              <Bell className="w-5 h-5" />
              {pendingOrders.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {pendingOrders.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-84 bg-white border border-stone-200 rounded-xl shadow-xl z-50 py-2 animate-in fade-in-50 duration-150">
                <div className="px-4 py-2 border-b border-stone-100 flex items-center justify-between">
                  <div className="font-semibold text-stone-900 text-sm">Online Orders & Alerts</div>
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                    {pendingOrders.length} new
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-stone-100">
                  {pendingOrders.length === 0 ? (
                    <div className="p-4 text-center text-xs text-stone-400">
                      No pending social commerce orders
                    </div>
                  ) : (
                    pendingOrders.map((ord) => (
                      <div
                        key={ord.id}
                        onClick={() => {
                          setActiveView('online_orders');
                          setShowNotifications(false);
                        }}
                        className="p-3 hover:bg-stone-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-stone-800">#{ord.orderNumber}</span>
                          <span className="text-stone-400">
                            {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-stone-900 mt-0.5">
                          {ord.customerName}
                        </div>
                        <div className="text-xs text-stone-500 mt-0.5 flex items-center justify-between">
                          <span>Via {ord.source.toUpperCase()}</span>
                          <span className="font-semibold text-emerald-700">
                            {currentTenant.currencySymbol}{ord.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 border-t border-stone-100 bg-stone-50 text-center">
                  <button
                    onClick={() => {
                      setActiveView('online_orders');
                      setShowNotifications(false);
                    }}
                    className="text-xs font-semibold text-stone-700 hover:text-stone-900"
                  >
                    Open Social Commerce Orders Table
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowTenantMenu(false);
              }}
              className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-sm transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-stone-800 text-white flex items-center justify-center text-xs font-semibold overflow-hidden">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser.name[0]
                )}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-stone-900 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-stone-500 uppercase tracking-wider">
                  {currentUser.role.replace('_', ' ')}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-stone-200 rounded-xl shadow-xl z-50 py-2 divide-y divide-stone-100 animate-in fade-in-50 duration-150">
                {/* Active Session & Open Company Header */}
                <div className="px-4 py-3 bg-stone-50/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 truncate pr-2">
                      <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-xs font-bold text-stone-900 truncate">
                        {currentTenant.name}
                      </span>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                      Open Company
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                      {currentUser.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                      ) : (
                        currentUser.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-stone-900 truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        {currentUser.email}
                      </div>
                      <div className="mt-0.5 flex items-center space-x-1.5">
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
                          {currentUser.role.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-medium">
                          • Active Session
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Open Company Users ONLY - Never other company users */}
                <div className="py-2">
                  <div className="px-4 py-1 flex items-center justify-between text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    <span>{currentTenant.name} Users</span>
                    <span className="text-[10px] text-stone-400 font-normal">
                      {openCompanyUsers.length} {openCompanyUsers.length === 1 ? 'member' : 'members'}
                    </span>
                  </div>

                  <div className="max-h-56 overflow-y-auto divide-y divide-stone-50 mt-1">
                    {openCompanyUsers.length === 0 ? (
                      <div className="p-3 text-center text-xs text-stone-400">
                        No team members registered yet
                      </div>
                    ) : (
                      openCompanyUsers.map((u) => {
                        const isCurrent = u.id === currentUser.id;
                        return (
                          <button
                            key={u.id}
                            onClick={() => {
                              setCurrentUserId(u.id);
                              setShowUserMenu(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between hover:bg-stone-50 transition-colors ${
                              isCurrent ? 'bg-amber-50/60 font-semibold text-stone-900' : 'text-stone-700'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 truncate">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 overflow-hidden ${
                                  isCurrent ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-700'
                                }`}
                              >
                                {u.avatarUrl ? (
                                  <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                                ) : (
                                  u.name.slice(0, 2).toUpperCase()
                                )}
                              </div>
                              <div className="truncate">
                                <div className="text-xs font-medium text-stone-900 truncate flex items-center space-x-1.5">
                                  <span>{u.name}</span>
                                  {isCurrent && (
                                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1 rounded">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-stone-500 capitalize truncate">
                                  {u.role.replace('_', ' ')}
                                </div>
                              </div>
                            </div>
                            {isCurrent ? (
                              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                            ) : (
                              <span className="text-[10px] text-amber-700 font-medium hover:underline shrink-0 ml-2">
                                Switch
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Company User Actions & Settings */}
                <div className="p-2 bg-stone-50 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setActiveView('users_roles');
                      setShowUserMenu(false);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 text-xs font-semibold text-stone-700 transition-colors flex items-center justify-center space-x-1.5 shadow-2xs"
                  >
                    <Users className="w-3.5 h-3.5 text-stone-500" />
                    <span>Manage Roles</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveView('company_profile');
                      setShowUserMenu(false);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 text-xs font-semibold text-stone-700 transition-colors flex items-center justify-center space-x-1.5 shadow-2xs"
                  >
                    <span>Company Profile</span>
                  </button>
                </div>

                <div className="px-3 py-1.5 bg-stone-50/50 flex items-center justify-between text-[11px] text-stone-500">
                  <button
                    onClick={resetAllData}
                    className="text-[11px] text-rose-600 hover:text-rose-800 flex items-center space-x-1 font-medium"
                    title="Reset to factory demo data"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset Demo Data</span>
                  </button>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {currentTenant.businessCode}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
