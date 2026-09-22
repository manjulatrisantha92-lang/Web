import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Tenant, BusinessIndustry } from '../../types';
import {
  ShieldCheck,
  Building,
  Plus,
  ToggleLeft,
  ToggleRight,
  Database,
  Code2,
  Server,
  Layers,
  Search,
  ExternalLink,
  CheckCircle,
  X,
  Lock,
  LogOut,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export const SuperAdminView: React.FC = () => {
  const {
    tenants,
    currentTenant,
    setCurrentTenant,
    addTenant,
    toggleTenantModule,
    allSalesGlobal,
    allProductsGlobal,
    isSuperAdminAuthenticated,
    loginSuperAdmin,
    logoutSuperAdmin,
    changeSuperAdminPassword,
    superAdminPassword,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);

  // Lock Screen State
  const [lockPassword, setLockPassword] = useState('');
  const [showLockPassword, setShowLockPassword] = useState(false);
  const [lockError, setLockError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Change Password Modal State
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('');

  // New Tenant Form
  const [newBizName, setNewBizName] = useState('');
  const [newBizCode, setNewBizCode] = useState('');
  const [newIndustry, setNewIndustry] = useState<BusinessIndustry>('grocery');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newPhone, setNewPhone] = useState('+94 77 ');
  const [newEmail, setNewEmail] = useState('');
  const [newCurrency, setNewCurrency] = useState('LKR');
  const [newCurrencySymbol, setNewCurrencySymbol] = useState('Rs.');

  // Simulated Query Inspector
  const [activeQueryTab, setActiveQueryTab] = useState<'mongo' | 'express' | 'security'>('mongo');

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.businessCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLockLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLockError('');
    if (!lockPassword) {
      setLockError('Please enter the Super Admin master password.');
      return;
    }
    setIsUnlocking(true);
    setTimeout(() => {
      const res = loginSuperAdmin(lockPassword);
      setIsUnlocking(false);
      if (!res.success) {
        setLockError(res.message || 'Incorrect password.');
      } else {
        setLockPassword('');
      }
    }, 200);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError('');
    setChangePasswordSuccess('');

    if (!currentPasswordInput) {
      setChangePasswordError('Please provide your current master password.');
      return;
    }
    if (!newPasswordInput || newPasswordInput.length < 4) {
      setChangePasswordError('New password must be at least 4 characters long.');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setChangePasswordError('New password and confirmation do not match.');
      return;
    }

    const res = changeSuperAdminPassword(currentPasswordInput, newPasswordInput);
    if (!res.success) {
      setChangePasswordError(res.message);
    } else {
      setChangePasswordSuccess(res.message);
      setTimeout(() => {
        setShowChangePasswordModal(false);
        setCurrentPasswordInput('');
        setNewPasswordInput('');
        setConfirmPasswordInput('');
        setChangePasswordSuccess('');
      }, 1500);
    }
  };

  // If locked, do not display other companies!
  if (!isSuperAdminAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-8 bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden animate-in fade-in duration-200">
        <div className="bg-stone-950 p-6 text-white text-center relative">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center mb-3">
            <Lock className="w-7 h-7" />
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-black uppercase tracking-wider">
            Clearance Gate
          </span>
          <h2 className="text-xl font-black text-white mt-2">Super Admin Access Locked</h2>
          <p className="text-xs text-stone-300 mt-1 leading-relaxed">
            Other company profiles, tenant databases, and global metrics are hidden. Enter master password to proceed.
          </p>
          <div className="mt-3 inline-flex items-center space-x-1.5 text-[11px] text-amber-300 bg-amber-950/60 border border-amber-800/60 rounded-lg px-2.5 py-1 font-mono">
            <Building className="w-3 h-3" />
            <span>Active Tenant: {currentTenant.name}</span>
          </div>
        </div>

        <form onSubmit={handleLockLogin} className="p-6 space-y-4">
          {lockError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{lockError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800 flex items-center space-x-1.5">
              <KeyRound className="w-3.5 h-3.5 text-stone-500" />
              <span>Super Admin Password</span>
            </label>

            <div className="relative">
              <input
                type={showLockPassword ? 'text' : 'password'}
                value={lockPassword}
                onChange={(e) => {
                  setLockPassword(e.target.value);
                  setLockError('');
                }}
                placeholder="Enter master password"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-mono text-stone-900 pr-11 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowLockPassword(!showLockPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
              >
                {showLockPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-stone-500">
              Input characters are masked (<code className="font-mono text-stone-700">password:••••••••</code>) to prevent others from viewing.
            </p>
          </div>

          <button
            type="submit"
            disabled={isUnlocking}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2"
          >
            <span>{isUnlocking ? 'Verifying...' : 'Unlock Super Admin Panel'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    );
  }

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim()) return;

    const code =
      newBizCode.trim().toUpperCase() ||
      newBizName.slice(0, 3).toUpperCase() + Math.floor(10 + Math.random() * 89);

    const created = addTenant({
      name: newBizName.trim(),
      businessCode: code,
      industry: newIndustry,
      ownerName: newOwnerName.trim() || 'Store Owner',
      phone: newPhone.trim(),
      email: newEmail.trim() || `admin@${code.toLowerCase()}.wcs.lk`,
      address: 'Main Street, Colombo, Sri Lanka',
      website: `https://${code.toLowerCase()}.wcs.lk`,
      currency: newCurrency,
      currencySymbol: newCurrencySymbol,
      billHeader: `Welcome to ${newBizName.trim()}`,
      billFooter: 'Thank you for your business!',
      defaultReceiptFormat: 'thermal80',
      modules: {
        pos: true,
        inventory: true,
        purchases: true,
        customers: true,
        accounting: true,
        reports: true,
        reportBuilder: true,
        customFields: true,
        facebook: true,
        whatsapp: true,
        appointments: newIndustry === 'salon',
        serialTracking: newIndustry === 'computer' || newIndustry === 'mobile',
        goldWeight: newIndustry === 'jewellery',
        multiBranch: false,
      },
      status: 'active',
      plan: 'pro',
    });

    setShowAddTenantModal(false);
    setCurrentTenant(created);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Super Admin Root Identity */}
      <div className="bg-stone-950 text-white rounded-2xl p-6 border border-stone-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-black uppercase tracking-wider">
              WCS Super Admin Platform
            </span>
            <span className="text-xs text-stone-400 font-mono">Shared Multi-Tenant Engine</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Multi-Tenant SaaS Control Center
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl">
            One centralized platform managing all business types (Automotive, Jewellery, Computer, Salon, Mobile, Agro, Grocery) on a single unified database with absolute <code>tenantId</code> isolation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setCurrentPasswordInput('');
              setNewPasswordInput('');
              setConfirmPasswordInput('');
              setChangePasswordError('');
              setChangePasswordSuccess('');
              setShowChangePasswordModal(true);
            }}
            className="flex items-center space-x-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 px-3.5 py-2.5 rounded-xl font-semibold text-xs border border-stone-700 transition-colors shadow-xs"
            title="Change master administrator password"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Change Password</span>
          </button>

          <button
            onClick={logoutSuperAdmin}
            className="flex items-center space-x-1.5 bg-rose-950/70 hover:bg-rose-900/80 text-rose-200 border border-rose-800/80 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-colors shadow-xs"
            title="Lock access to other companies and logout of Super Admin"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Logout Admin</span>
          </button>

          <button
            onClick={() => setShowAddTenantModal(true)}
            className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-stone-950 px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Provision Tenant</span>
          </button>
        </div>
      </div>

      {/* Security Status Bar */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2 text-amber-950 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>
            <strong>Super Admin Session Active:</strong> You have master clearance to manage all {tenants.length} business instances on the shared multi-tenant database.
          </span>
        </div>
        <div className="flex items-center space-x-3 text-stone-600 text-[11px]">
          <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-200 text-amber-900 font-semibold flex items-center space-x-1">
            <Lock className="w-3 h-3 text-amber-600" />
            <span>Encrypted Master Clearance</span>
          </span>
        </div>
      </div>

      {/* Global SaaS Platform Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Total Active Tenants
          </span>
          <div className="text-2xl font-black text-stone-900 mt-2">{tenants.length}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Across 7 Diverse Industries
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Global Catalog SKUs
          </span>
          <div className="text-2xl font-black text-stone-900 mt-2">
            {allProductsGlobal.length}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Partitioned by tenantId
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Platform Transactions
          </span>
          <div className="text-2xl font-black text-stone-900 mt-2">
            {allSalesGlobal.length}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Processed via POS & Social Commerce
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Architecture Type
          </span>
          <div className="text-2xl font-black text-amber-700 mt-2">Single DB</div>
          <div className="text-[11px] text-stone-400 mt-1">
            Zero-maintenance tenant provisioning
          </div>
        </div>
      </div>

      {/* Tenant Isolation Code & Query Inspector */}
      <div className="bg-stone-900 text-stone-300 rounded-2xl border border-stone-800 p-5 space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-2">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">
              Live Tenant Isolation Query Demonstrator
            </h3>
          </div>
          <div className="flex items-center space-x-1 font-mono text-[11px]">
            <button
              onClick={() => setActiveQueryTab('mongo')}
              className={`px-2.5 py-1 rounded ${
                activeQueryTab === 'mongo' ? 'bg-amber-600 text-white font-bold' : 'text-stone-400 hover:text-white'
              }`}
            >
              MongoDB Filter Query
            </button>
            <button
              onClick={() => setActiveQueryTab('express')}
              className={`px-2.5 py-1 rounded ${
                activeQueryTab === 'express' ? 'bg-amber-600 text-white font-bold' : 'text-stone-400 hover:text-white'
              }`}
            >
              Express Middleware
            </button>
            <button
              onClick={() => setActiveQueryTab('security')}
              className={`px-2.5 py-1 rounded ${
                activeQueryTab === 'security' ? 'bg-amber-600 text-white font-bold' : 'text-stone-400 hover:text-white'
              }`}
            >
              Security Guarantees
            </button>
          </div>
        </div>

        {activeQueryTab === 'mongo' && (
          <pre className="p-3 bg-stone-950 rounded-xl font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed border border-stone-800">
{`// MongoDB Query safely executed for active tenant "${currentTenant.name}"
const tenantFilter = { tenantId: "${currentTenant.id}" };

// 1. Fetching inventory with dynamic custom fields:
const products = await db.collection("products").find({
  ...tenantFilter,
  stockQuantity: { $gt: 0 }
}).toArray();

// 2. Issuing POS invoice:
await db.collection("sales").insertOne({
  tenantId: "${currentTenant.id}",
  invoiceNumber: "INV-${currentTenant.businessCode}-2026-004",
  totalAmount: 14500,
  createdAt: new Date()
});`}
          </pre>
        )}

        {activeQueryTab === 'express' && (
          <pre className="p-3 bg-stone-950 rounded-xl font-mono text-[11px] text-amber-300 overflow-x-auto leading-relaxed border border-stone-800">
{`// Express API Security Middleware for automated tenant injection
export function enforceTenantIsolation(req, res, next) {
  const host = req.headers.host; // e.g. "sparkauto.wcs.lk" or JWT payload
  const tenantId = req.user?.tenantId || lookupTenantBySubdomain(host);

  if (!tenantId && !req.user?.isSuperAdmin) {
    return res.status(403).json({ error: "Access Denied: Missing valid tenantId" });
  }

  // Inject tenantId into request context so no handler can query another tenant's data
  req.tenantId = tenantId;
  next();
}`}
          </pre>
        )}

        {activeQueryTab === 'security' && (
          <div className="p-3 bg-stone-950 rounded-xl text-stone-300 space-y-1.5 leading-relaxed border border-stone-800">
            <p className="text-white font-bold">1. Zero Cross-Tenant Data Leaks:</p>
            <p className="text-stone-400">All database collections (<code>products</code>, <code>sales</code>, <code>customers</code>, <code>appointments</code>, <code>custom_fields</code>, <code>reports</code>) are indexed with a compound index on <code>&#123; tenantId: 1, _id: 1 &#125;</code>.</p>
            <p className="text-white font-bold mt-2">2. Dynamic Industry Modularity:</p>
            <p className="text-stone-400">Salon features (`appointments`) only load for Salon tenants. Computer serial tracking only loads for Computer stores. Super Admin toggles modules per tenant without deploying new containers.</p>
          </div>
        )}
      </div>

      {/* Tenants Roster */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-stone-900 text-sm">
              All Registered Tenants ({filteredTenants.length})
            </h3>
            <span className="text-xs text-stone-400">Click to switch or toggle feature modules</span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tenants..."
              className="w-full pl-9 pr-3 py-1.5 border border-stone-200 rounded-lg text-xs bg-stone-50"
            />
          </div>
        </div>

        <div className="divide-y divide-stone-100 text-xs">
          {filteredTenants.map((t) => {
            const isCurrent = t.id === currentTenant.id;
            return (
              <div
                key={t.id}
                className={`p-4 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  isCurrent ? 'bg-amber-50/50' : 'hover:bg-stone-50'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-400 font-bold text-sm flex items-center justify-center shrink-0">
                    {t.businessCode.slice(0, 3)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-stone-900 text-sm">{t.name}</h4>
                      <span className="bg-stone-100 text-stone-700 px-2 py-0.2 rounded font-semibold text-[10px] uppercase">
                        {t.industry}
                      </span>
                      <span className="font-mono text-[10px] text-stone-400">
                        {t.id}
                      </span>
                      {isCurrent && (
                        <span className="bg-amber-600 text-white font-bold text-[10px] px-2 py-0.2 rounded-full">
                          ACTIVE INSTANCE
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Owner: <strong>{t.ownerName}</strong> • {t.phone} • Subdomain: <code className="font-mono text-stone-700">{t.businessCode.toLowerCase()}.wcs.lk</code>
                    </div>

                    {/* Module Badges */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {Object.entries(t.modules).map(([modName, isEnabled]) => (
                        <button
                          key={modName}
                          onClick={() => toggleTenantModule(t.id, modName as any, !isEnabled)}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono transition-colors ${
                            isEnabled
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
                              : 'bg-stone-100 text-stone-400 border border-stone-200 line-through'
                          }`}
                          title={`Click to toggle ${modName}`}
                        >
                          {modName}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {!isCurrent ? (
                    <button
                      onClick={() => setCurrentTenant(t)}
                      className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                    >
                      Switch to Tenant
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs">
                      Currently Operating
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Tenant Modal */}
      {showAddTenantModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-stone-200 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-stone-900 text-sm">Provision New SaaS Business Tenant</h3>
              <button onClick={() => setShowAddTenantModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-3">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  value={newBizName}
                  onChange={(e) => {
                    setNewBizName(e.target.value);
                    if (!newBizCode) {
                      setNewBizCode(e.target.value.slice(0, 3).toUpperCase());
                    }
                  }}
                  placeholder="e.g. Ceylon Agro Chemicals"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Business Code (Slug)</label>
                  <input
                    type="text"
                    value={newBizCode}
                    onChange={(e) => setNewBizCode(e.target.value.toUpperCase())}
                    placeholder="CAC"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Industry Archetype</label>
                  <select
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value as BusinessIndustry)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg font-bold capitalize"
                  >
                    <option value="automotive">Automotive & Spare Parts</option>
                    <option value="jewellery">Jewellery & Gemstones</option>
                    <option value="computer">Computer & IT Hardware</option>
                    <option value="salon">Salon & Beauty Parlour</option>
                    <option value="mobile">Mobile & Smart Devices</option>
                    <option value="agro">Agricultural Supplies</option>
                    <option value="grocery">Grocery & Supermarket</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Business Owner Name</label>
                  <input
                    type="text"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    placeholder="Owner Full Name"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddTenantModal(false)}
                  className="px-4 py-2 border border-stone-200 rounded-lg text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Provision Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-stone-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-stone-900 text-white p-6 relative">
              <button
                onClick={() => setShowChangePasswordModal(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Change Master Admin Password</h3>
              <p className="text-xs text-stone-300 mt-1">
                This password protects other business accounts and multi-tenant management.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              {changePasswordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{changePasswordError}</span>
                </div>
              )}

              {changePasswordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{changePasswordSuccess}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    placeholder="Enter current master password"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-mono text-stone-900 pr-11 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="e.g. newSecurePass99!"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-mono text-stone-900 pr-11 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-stone-500">
                  Password input is masked (<code className="font-mono text-stone-700">password:••••••••</code>) so onlookers cannot see it.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="Re-type new master password"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
