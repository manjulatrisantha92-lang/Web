import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole, UserPermissions } from '../../types';
import {
  Users,
  ShieldCheck,
  Plus,
  Trash2,
  Lock,
  Key,
  Check,
  X,
  Eye,
  EyeOff
} from 'lucide-react';

export const UsersRolesView: React.FC = () => {
  const { currentTenant, users, currentUser, setCurrentUser, addUser, isSuperAdmin } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('staff');
  const [permissions, setPermissions] = useState<UserPermissions>({
    pos: true,
    sales: true,
    products: false,
    purchases: false,
    viewCostPrice: false,
    deleteInvoices: false,
    reports: false,
    exportData: false,
    marketing: false,
    appointments: false,
    users: false,
    settings: false,
  });

  const handleRoleChange = (role: UserRole) => {
    setNewUserRole(role);
    if (role === 'owner' || role === 'business_owner') {
      setPermissions({
        pos: true,
        sales: true,
        products: true,
        purchases: true,
        viewCostPrice: true,
        deleteInvoices: true,
        reports: true,
        exportData: true,
        marketing: true,
        appointments: true,
        users: true,
        settings: true,
      });
    } else if (role === 'staff') {
      setPermissions({
        pos: true,
        sales: true,
        products: false,
        purchases: false,
        viewCostPrice: false,
        deleteInvoices: false,
        reports: false,
        exportData: false,
        marketing: false,
        appointments: currentTenant.modules.appointments || false,
        users: false,
        settings: false,
      });
    }
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim() || `${newUserName.toLowerCase().replace(/\s+/g, '')}@${currentTenant.businessCode.toLowerCase()}.wcs.lk`,
      role: newUserRole,
      permissions,
    });

    setShowAddModal(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  const tenantUsers = users.filter((u) => u.tenantId === currentTenant.id);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-stone-900">User Roles & Access Control (RBAC)</h1>
            <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
              Tenant: {currentTenant.name}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage cashier permissions, prohibit cost price viewing, and restrict data export.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff User</span>
        </button>
      </div>

      {/* RBAC Rules Matrix */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-bold text-stone-900 text-sm">
            Staff Members for {currentTenant.name} ({tenantUsers.length})
          </h3>
          <span className="text-xs text-stone-400">
            Current active session: <strong>{currentUser.name}</strong> ({currentUser.role})
          </span>
        </div>

        <div className="divide-y divide-stone-100 text-xs">
          {tenantUsers.map((u) => {
            const isSelf = currentUser.id === u.id;
            return (
              <div
                key={u.id}
                className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                  isSelf ? 'bg-amber-50/40' : 'hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-stone-900 text-white font-bold text-xs flex items-center justify-center">
                    {u.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-stone-900 text-sm">{u.name}</span>
                      <span
                        className={`px-2 py-0.2 rounded-full font-bold uppercase text-[10px] ${
                          u.role === 'owner' || u.role === 'business_owner'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {u.role}
                      </span>
                      {isSelf && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                          Active User
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">{u.email}</div>
                  </div>
                </div>

                {/* Granular Permission Tags */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className={`px-2 py-0.5 rounded border ${u.permissions.pos ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-stone-50 text-stone-400 border-stone-200'}`}>
                    POS: {u.permissions.pos ? 'YES' : 'NO'}
                  </span>
                  <span className={`px-2 py-0.5 rounded border ${u.permissions.viewCostPrice ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200 font-bold'}`}>
                    Cost Price: {u.permissions.viewCostPrice ? 'ALLOWED' : 'HIDDEN'}
                  </span>
                  <span className={`px-2 py-0.5 rounded border ${u.permissions.deleteInvoices ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-stone-50 text-stone-400 border-stone-200'}`}>
                    Delete Inv: {u.permissions.deleteInvoices ? 'YES' : 'NO'}
                  </span>
                  <span className={`px-2 py-0.5 rounded border ${u.permissions.exportData ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-stone-50 text-stone-400 border-stone-200'}`}>
                    Export: {u.permissions.exportData ? 'YES' : 'NO'}
                  </span>
                  <span className={`px-2 py-0.5 rounded border ${u.permissions.reports ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-stone-50 text-stone-400 border-stone-200'}`}>
                    Reports: {u.permissions.reports ? 'YES' : 'NO'}
                  </span>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {!isSelf && (
                    <button
                      onClick={() => setCurrentUser(u)}
                      className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs transition-colors"
                    >
                      Impersonate / Test User
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-stone-200 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-stone-900 text-sm">Add New Staff / Cashier Account</h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">Staff Member Name *</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Kasun Kalhara"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email / Login ID</label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="kasun@wcs.lk"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Assigned Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg font-bold"
                  >
                    <option value="staff">Staff / Cashier</option>
                    <option value="owner">Business Owner (Full Access)</option>
                  </select>
                </div>
              </div>

              {/* Granular Permission Toggles */}
              <div className="space-y-2 border-t pt-3">
                <div className="font-bold text-stone-700 uppercase tracking-wider text-[10px]">
                  Granular Permission Flags
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'pos', label: 'POS Terminal Access' },
                    { key: 'sales', label: 'View Sales History' },
                    { key: 'products', label: 'Edit Products & Stock' },
                    { key: 'viewCostPrice', label: 'View Cost / Purchase Price (Sensitive!)' },
                    { key: 'deleteInvoices', label: 'Delete Invoices (High Risk)' },
                    { key: 'reports', label: 'Custom Report Builder' },
                    { key: 'exportData', label: 'Export Data (CSV/Excel)' },
                    { key: 'marketing', label: 'Facebook / Meta Marketing' },
                  ].map((perm) => (
                    <label
                      key={perm.key}
                      className="flex items-center space-x-2 p-2 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(permissions[perm.key as keyof UserPermissions])}
                        onChange={(e) =>
                          setPermissions({
                            ...permissions,
                            [perm.key]: e.target.checked,
                          })
                        }
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-[11px] font-medium text-stone-800">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-stone-200 rounded-lg text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold"
                >
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
