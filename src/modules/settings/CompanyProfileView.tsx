import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building,
  Upload,
  Save,
  Check,
  Receipt,
  Mail,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  Image as ImageIcon,
  Share2,
  ExternalLink
} from 'lucide-react';

export const CompanyProfileView: React.FC = () => {
  const { currentTenant, updateTenantProfile } = useApp();

  const [name, setName] = useState(currentTenant.name);
  const [address, setAddress] = useState(currentTenant.address);
  const [phone, setPhone] = useState(currentTenant.phone);
  const [email, setEmail] = useState(currentTenant.email);
  const [facebookPageUrl, setFacebookPageUrl] = useState(currentTenant.facebookPageUrl || '');
  const [logoUrl, setLogoUrl] = useState(currentTenant.logoUrl || '');
  const [billHeader, setBillHeader] = useState(currentTenant.billHeader);
  const [billFooter, setBillFooter] = useState(currentTenant.billFooter);
  const [taxNumber, setTaxNumber] = useState(currentTenant.taxNumber || '');
  const [currency, setCurrency] = useState(currentTenant.currency);
  const [currencySymbol, setCurrencySymbol] = useState(currentTenant.currencySymbol);
  const [defaultReceiptFormat, setDefaultReceiptFormat] = useState(currentTenant.defaultReceiptFormat);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenantProfile({
      name,
      address,
      phone,
      email,
      facebookPageUrl: facebookPageUrl.trim() || undefined,
      logoUrl: logoUrl.trim() || undefined,
      billHeader,
      billFooter,
      taxNumber: taxNumber.trim() || undefined,
      currency,
      currencySymbol,
      defaultReceiptFormat,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleLogoUploadSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create local object URL for preview
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-stone-900">Company Profile & Receipt Settings</h1>
            <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
              Tenant ID: {currentTenant.id}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Configure business identity, logo, and receipt typography for <strong>{currentTenant.name}</strong>.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-200 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Profile Updated in Database</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs text-stone-800">
        {/* Business Identity */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-stone-900 text-sm flex items-center space-x-2 border-b pb-2">
            <Building className="w-4 h-4 text-amber-600" />
            <span>Core Business Identity</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Registered Business Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Business Code (Slug)
              </label>
              <input
                type="text"
                disabled
                value={currentTenant.businessCode}
                className="w-full px-3 py-2 border border-stone-200 bg-stone-100 rounded-lg font-mono text-stone-500 cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-700 mb-1">
                Official Business Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Customer Support Phone / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Official Invoicing Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Tax / VAT / Business Reg Number
              </label>
              <input
                type="text"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                placeholder="e.g. VAT-114920491-000"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Billing Currency
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="LKR"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono font-bold"
                />
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  placeholder="Rs."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-stone-700">
                  Company Facebook Page Link (Optional)
                </label>
                <span className="text-[10px] bg-sky-50 text-sky-700 font-semibold px-2 py-0.5 rounded-full border border-sky-200">
                  Used in Facebook Marketing Post Shares
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sky-600 font-bold text-xs">
                    f
                  </div>
                  <input
                    type="url"
                    value={facebookPageUrl}
                    onChange={(e) => setFacebookPageUrl(e.target.value)}
                    placeholder="https://facebook.com/yourcompanypage"
                    className="w-full pl-7 pr-3 py-2 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                {facebookPageUrl && (
                  <a
                    href={facebookPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold flex items-center space-x-1 shrink-0 transition-colors"
                    title="Open company Facebook page in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                    <span>Visit Page</span>
                  </a>
                )}
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Optional: When you share Facebook marketing posts, catalog promotions, or social campaigns, this link is included so customers can follow your business page and message you directly.
              </p>
            </div>
          </div>
        </div>

        {/* Logo Upload (JPG / PNG) */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-stone-900 text-sm flex items-center space-x-2 border-b pb-2">
            <ImageIcon className="w-4 h-4 text-amber-600" />
            <span>Company Logo (Printed on Invoices & Receipts)</span>
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-stone-100 border-2 border-dashed border-stone-300 flex items-center justify-center overflow-hidden shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center p-2">
                  <span className="font-black text-xl text-stone-400">
                    {currentTenant.businessCode.slice(0, 3)}
                  </span>
                  <span className="block text-[9px] text-stone-400 mt-1">No Logo</span>
                </div>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <label className="block font-semibold text-stone-700">
                Upload JPG / PNG Logo File
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleLogoUploadSimulate}
                className="text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
              />
              <p className="text-[11px] text-stone-400">
                Square or horizontal logo. High resolution JPG recommended for crisp 80mm thermal and A4 print rendering.
              </p>
            </div>
          </div>
        </div>

        {/* Receipt & Bill Typography */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-stone-900 text-sm flex items-center space-x-2 border-b pb-2">
            <Receipt className="w-4 h-4 text-amber-600" />
            <span>Bill Typography & Invoicing Preferences</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Bill Header Subtitle
              </label>
              <input
                type="text"
                value={billHeader}
                onChange={(e) => setBillHeader(e.target.value)}
                placeholder="e.g. Genuine Spare Parts & Automotive Services"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Bill Footer / Return Policy Message
              </label>
              <input
                type="text"
                value={billFooter}
                onChange={(e) => setBillFooter(e.target.value)}
                placeholder="e.g. Goods sold are not returnable without bill within 7 days. Thank you!"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Default POS Printer Format
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'a4', label: 'A4 Tax Invoice' },
                  { id: 'thermal80', label: '80mm Thermal Slip' },
                  { id: 'thermal58', label: '58mm Mini POS' },
                ].map((fmt) => (
                  <label
                    key={fmt.id}
                    className={`flex items-center space-x-2 p-3 rounded-xl border cursor-pointer ${
                      defaultReceiptFormat === fmt.id
                        ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold'
                        : 'border-stone-200 text-stone-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="receiptFmt"
                      checked={defaultReceiptFormat === fmt.id}
                      onChange={() => setDefaultReceiptFormat(fmt.id as any)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-xs">{fmt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs transition-transform active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Company Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
