import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Share2,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Megaphone,
  Eye,
  ShoppingBag,
  Sliders,
  Check,
  Copy,
  Link,
  Globe,
  MessageCircle,
  Edit2,
  Save,
  CheckCheck
} from 'lucide-react';

export const FacebookMarketingView: React.FC = () => {
  const { currentTenant, products, promotions, updateTenantProfile } = useApp();

  const [syncedCount, setSyncedCount] = useState(products.length);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [adCampaignName, setAdCampaignName] = useState('New Stock Arrival & Fast Delivery');
  const [adBudget, setAdBudget] = useState(1500);
  const [publishedAd, setPublishedAd] = useState(false);

  // Optional Company Facebook Link management
  const [isEditingFbLink, setIsEditingFbLink] = useState(false);
  const [fbLinkInput, setFbLinkInput] = useState(currentTenant.facebookPageUrl || '');
  const [fbLinkSaved, setFbLinkSaved] = useState(false);

  // Share post controls
  const [includeFbLink, setIncludeFbLink] = useState(true);
  const [includePrice, setIncludePrice] = useState(true);
  const [includeContact, setIncludeContact] = useState(true);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [sharedNotice, setSharedNotice] = useState<string | null>(null);

  const metaConfig = currentTenant.metaConfig;
  const companyFbLink = currentTenant.facebookPageUrl?.trim() || '';

  const handleSyncCatalog = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncedCount(products.length);
    }, 1200);
  };

  const handlePublishAd = (e: React.FormEvent) => {
    e.preventDefault();
    setPublishedAd(true);
    setTimeout(() => setPublishedAd(false), 3000);
  };

  const handleSaveFacebookLink = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenantProfile({
      facebookPageUrl: fbLinkInput.trim() || undefined,
    });
    setIsEditingFbLink(false);
    setFbLinkSaved(true);
    setTimeout(() => setFbLinkSaved(false), 3000);
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // Generated share post text including optional company Facebook link
  const generatedShareText = useMemo(() => {
    if (!selectedProduct) return '';
    const parts: string[] = [];
    parts.push(`🔥 ${adCampaignName || 'Special Offer'}: ${selectedProduct.name}`);
    
    if (includePrice) {
      parts.push(`💰 Price: ${currentTenant.currencySymbol}${selectedProduct.sellingPrice.toLocaleString()}`);
    }

    parts.push(`✨ Available now at ${currentTenant.name}. Island-wide delivery available!`);

    // Include the optional company Facebook link
    if (includeFbLink && companyFbLink) {
      parts.push(`👉 Official Facebook Page: ${companyFbLink}`);
    }

    if (includeContact) {
      if (currentTenant.phone) {
        parts.push(`📲 Order or Inquire via WhatsApp / Call: ${currentTenant.phone}`);
      }
      if (currentTenant.website) {
        parts.push(`🌐 Web Store: ${currentTenant.website}`);
      }
    }

    parts.push(`#${currentTenant.businessCode.replace(/[^a-zA-Z0-9]/g, '')} #${(selectedProduct.categoryName || 'Product').replace(/\s+/g, '')} #OnlineShopping #SriLanka`);

    return parts.join('\n\n');
  }, [selectedProduct, adCampaignName, includePrice, includeFbLink, companyFbLink, includeContact, currentTenant]);

  // Direct Facebook Web Share Handler
  const handleShareToFacebook = (customText?: string) => {
    const textToShare = customText || generatedShareText;
    const shareTargetUrl = companyFbLink || currentTenant.website || window.location.href;
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareTargetUrl)}&quote=${encodeURIComponent(textToShare)}`;
    window.open(shareUrl, '_blank', 'width=650,height=550,noopener,noreferrer');
    setSharedNotice('Shared to Facebook dialog opened!');
    setTimeout(() => setSharedNotice(null), 3500);
  };

  // Direct WhatsApp Share Handler
  const handleShareToWhatsApp = (customText?: string) => {
    const textToShare = customText || generatedShareText;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`;
    window.open(waUrl, '_blank');
    setSharedNotice('Opened WhatsApp with post details and Facebook link!');
    setTimeout(() => setSharedNotice(null), 3500);
  };

  // Copy Post Text to Clipboard
  const handleCopyPostText = (textToCopy?: string) => {
    const text = textToCopy || generatedShareText;
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  // Device native share if available
  const handleDeviceShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${selectedProduct?.name} - ${currentTenant.name}`,
          text: generatedShareText,
          url: companyFbLink || currentTenant.website || window.location.href,
        });
      } catch (err) {
        // User cancelled or share error
      }
    } else {
      handleCopyPostText();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-stone-900">Facebook Marketing & Catalog</h1>
            <span className="text-xs bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-semibold">
              Meta Graph API Sync
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Sync products directly to Facebook Shop, share marketing posts with your company Facebook link, and route customer orders to <strong>{currentTenant.name}</strong>.
          </p>
        </div>

        <button
          onClick={handleSyncCatalog}
          disabled={isSyncing}
          className="flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing Catalog...' : 'Sync Catalog to Meta Shop'}</span>
        </button>
      </div>

      {/* Meta Connection & Company Facebook Link Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs divide-y divide-stone-100 overflow-hidden">
        {/* Connection status header */}
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              f
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-stone-900 text-sm">
                  {metaConfig?.pageName || `${currentTenant.name} Official Facebook Page`}
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.2 rounded-full flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Connected</span>
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Page ID: <code className="font-mono text-stone-700">{metaConfig?.pageId || 'fb_page_102938'}</code> • Meta Pixel: <code className="font-mono text-stone-700">{metaConfig?.pixelId || 'pix_99210'}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="text-right">
              <div className="font-black text-stone-900 text-sm font-mono">{syncedCount} Items</div>
              <div className="text-[10px] text-stone-400">Live in Meta Commerce Catalog</div>
            </div>
          </div>
        </div>

        {/* Optional Company Facebook Link Configuration */}
        <div className="p-4 bg-sky-50/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-sky-100 text-sky-700 rounded-lg">
                <Share2 className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-stone-900">
                    Company Facebook Page Link (Optional)
                  </span>
                  <span className="text-[10px] bg-white border border-sky-200 text-sky-800 font-semibold px-1.5 py-0.2 rounded">
                    Included in Post Shares
                  </span>
                </div>
                <div className="text-xs text-stone-600 mt-0.5">
                  {companyFbLink ? (
                    <div className="flex items-center space-x-2 font-mono text-[11px] text-sky-800">
                      <span>{companyFbLink}</span>
                      <a
                        href={companyFbLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-sky-600 hover:text-sky-800 underline"
                        title="Visit company page"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Visit</span>
                      </a>
                    </div>
                  ) : (
                    <span className="text-stone-400 italic">
                      No Facebook link configured yet. Add your page link to include it in all marketing post shares.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {fbLinkSaved && (
                <span className="text-xs text-emerald-700 font-bold flex items-center space-x-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 animate-in fade-in">
                  <Check className="w-3.5 h-3.5" />
                  <span>Link Saved</span>
                </span>
              )}

              <button
                onClick={() => {
                  setFbLinkInput(companyFbLink);
                  setIsEditingFbLink(!isEditingFbLink);
                }}
                className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors shadow-2xs"
              >
                <Edit2 className="w-3 h-3 text-stone-500" />
                <span>{companyFbLink ? 'Change Link' : 'Add Facebook Link (Optional)'}</span>
              </button>
            </div>
          </div>

          {/* Inline Edit Form for Company Facebook Link */}
          {isEditingFbLink && (
            <form onSubmit={handleSaveFacebookLink} className="mt-3 pt-3 border-t border-sky-100 flex flex-col sm:flex-row items-center gap-2 animate-in fade-in duration-150">
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sky-600 font-bold text-xs">
                  f
                </div>
                <input
                  type="url"
                  value={fbLinkInput}
                  onChange={(e) => setFbLinkInput(e.target.value)}
                  placeholder="https://facebook.com/yourbusinesspage"
                  className="w-full pl-7 pr-3 py-1.5 border border-sky-300 bg-white rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  autoFocus
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditingFbLink(false)}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-2xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Facebook Link</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Catalog & Ad Publisher / Post Share Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Interactive Facebook Ad Simulator & Share Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-stone-900 text-sm flex items-center space-x-2">
                <Eye className="w-4 h-4 text-sky-600" />
                <span>Facebook Feed Post Mockup</span>
              </h3>
              <span className="text-[11px] text-stone-400">Live preview with company link</span>
            </div>

            {/* Ad Card Container */}
            <div className="border border-stone-200 rounded-xl overflow-hidden bg-stone-50/50 shadow-sm max-w-sm mx-auto">
              {/* Feed Post Header */}
              <div className="p-3 bg-white flex items-center justify-between border-b border-stone-100">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center">
                    {currentTenant.businessCode.slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-bold text-stone-900 text-xs leading-none flex items-center space-x-1">
                      <span>{currentTenant.name}</span>
                      {companyFbLink && (
                        <a
                          href={companyFbLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-600 hover:text-sky-800"
                          title="Open Facebook Page"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                    <div className="text-[10px] text-stone-400 mt-0.5">Sponsored • 🌐</div>
                  </div>
                </div>
                <span className="text-stone-400 font-bold text-sm">•••</span>
              </div>

              {/* Ad Copy */}
              <div className="p-3 text-stone-800 text-xs bg-white space-y-2">
                <p className="font-medium text-stone-900">
                  🔥 {adCampaignName || 'Special Product Promotion'}
                </p>
                <p className="text-stone-600 leading-relaxed">
                  Upgrade with our premium <strong>{selectedProduct?.name}</strong>! Available for immediate island-wide delivery.
                </p>

                {/* Optional Company Facebook Link highlight */}
                {includeFbLink && companyFbLink && (
                  <div className="p-2 bg-sky-50 border border-sky-100 rounded-lg flex items-center space-x-2 text-[11px] text-sky-800">
                    <span className="font-bold">👉 Official Page:</span>
                    <a
                      href={companyFbLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-mono truncate"
                    >
                      {companyFbLink}
                    </a>
                  </div>
                )}
              </div>

              {/* Product Mock Visual */}
              <div className="h-44 bg-gradient-to-br from-stone-800 to-stone-900 text-white flex flex-col items-center justify-center p-4 text-center relative">
                {selectedProduct?.imageUrl ? (
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                )}

                <div className="relative z-10 bg-black/60 backdrop-blur-xs p-2.5 rounded-xl max-w-[85%]">
                  <h4 className="font-bold text-xs text-white line-clamp-1">
                    {selectedProduct?.name}
                  </h4>
                  <p className="text-xs text-amber-300 font-mono font-bold mt-0.5">
                    {currentTenant.currencySymbol}{selectedProduct?.sellingPrice.toLocaleString()}
                  </p>
                </div>

                <span className="absolute bottom-2 right-2 text-[9px] bg-black/70 px-1.5 py-0.5 rounded text-white font-mono">
                  {currentTenant.businessCode}
                </span>
              </div>

              {/* Call to action footer */}
              <div className="p-3 bg-stone-100 flex items-center justify-between border-t border-stone-200">
                <div className="truncate pr-2">
                  <div className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold truncate">
                    {companyFbLink ? companyFbLink.replace('https://', '') : `${currentTenant.businessCode.toLowerCase()}.wcs.lk`}
                  </div>
                  <div className="font-bold text-stone-900 text-xs truncate">
                    {selectedProduct?.name}
                  </div>
                </div>
                {companyFbLink ? (
                  <a
                    href={companyFbLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs shrink-0 flex items-center space-x-1"
                  >
                    <span>Visit Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <button className="px-3 py-1.5 bg-stone-200 text-stone-900 font-bold rounded-lg text-xs shrink-0">
                    Send Message
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Facebook Marketing Post Share Box */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-stone-900 text-sm flex items-center space-x-2">
                <Share2 className="w-4 h-4 text-sky-600" />
                <span>Share Marketing Post (with Company Link)</span>
              </h3>
              <span className="text-[11px] text-stone-400">1-click social distribution</span>
            </div>

            {sharedNotice && (
              <div className="p-2.5 bg-sky-50 text-sky-800 rounded-lg border border-sky-200 text-xs font-medium flex items-center space-x-1.5 animate-in fade-in">
                <Check className="w-4 h-4 text-sky-600 shrink-0" />
                <span>{sharedNotice}</span>
              </div>
            )}

            {/* Share Customizer Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-stone-50 rounded-xl">
              <label className="flex items-center space-x-2 cursor-pointer text-[11px] text-stone-700 font-medium">
                <input
                  type="checkbox"
                  checked={includeFbLink}
                  onChange={(e) => setIncludeFbLink(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span>Include Company FB Link</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-[11px] text-stone-700 font-medium">
                <input
                  type="checkbox"
                  checked={includePrice}
                  onChange={(e) => setIncludePrice(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span>Include Price Tag</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-[11px] text-stone-700 font-medium">
                <input
                  type="checkbox"
                  checked={includeContact}
                  onChange={(e) => setIncludeContact(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span>Include Contact / CTA</span>
              </label>
            </div>

            {/* Generated Text Preview */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium mb-1">
                <span>Post Share Content Preview:</span>
                {companyFbLink ? (
                  <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    <span>Company Facebook Link Embedded</span>
                  </span>
                ) : (
                  <span className="text-amber-700 font-semibold">
                    (No Facebook Link Set)
                  </span>
                )}
              </div>
              <div className="p-3 bg-stone-100 rounded-xl font-mono text-[11px] text-stone-800 whitespace-pre-line border border-stone-200 max-h-36 overflow-y-auto">
                {generatedShareText}
              </div>
            </div>

            {/* Share Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => handleShareToFacebook()}
                className="w-full py-2.5 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold flex items-center justify-center space-x-1.5 shadow-xs transition-transform active:scale-95 text-xs"
              >
                <Share2 className="w-4 h-4" />
                <span>Share to Facebook</span>
              </button>

              <button
                onClick={() => handleShareToWhatsApp()}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center space-x-1.5 shadow-xs transition-transform active:scale-95 text-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Share to WhatsApp</span>
              </button>

              <button
                onClick={() => handleCopyPostText()}
                className="w-full py-2.5 px-3 bg-stone-800 hover:bg-stone-900 text-white rounded-xl font-bold flex items-center justify-center space-x-1.5 shadow-xs transition-transform active:scale-95 text-xs"
              >
                {copiedSuccess ? (
                  <>
                    <CheckCheck className="w-4 h-4 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Post Text</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Quick Ad Launcher Form & Active Campaigns */}
        <div className="space-y-4 text-xs">
          {/* Ad Launcher Form */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-stone-900 text-sm flex items-center space-x-2">
                <Megaphone className="w-4 h-4 text-amber-600" />
                <span>Create & Publish Targeted Social Ad</span>
              </h3>
              <span className="text-[11px] text-stone-400">Meta Marketing API</span>
            </div>

            <form onSubmit={handlePublishAd} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Targeted Product
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({currentTenant.currencySymbol}{p.sellingPrice.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Campaign Title / Headline
                </label>
                <input
                  type="text"
                  value={adCampaignName}
                  onChange={(e) => setAdCampaignName(e.target.value)}
                  placeholder="e.g. Stop Safely with Genuine Ceramic Pads"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Daily Budget ({currentTenant.currency})
                  </label>
                  <input
                    type="number"
                    value={adBudget}
                    onChange={(e) => setAdBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Destination
                  </label>
                  <select className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs">
                    <option>Company Facebook Page & Messenger</option>
                    <option>Direct to WhatsApp Order Chat</option>
                    <option>Online Web Store Checkout</option>
                  </select>
                </div>
              </div>

              {publishedAd ? (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold">
                    Campaign submitted to Meta Ads Manager successfully!
                  </span>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 rounded-xl shadow-xs transition-transform active:scale-95 flex items-center justify-center space-x-2 text-xs"
                >
                  <Megaphone className="w-4 h-4" />
                  <span>Launch Ad Campaign</span>
                </button>
              )}
            </form>

            <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-400 space-y-1">
              <p>
                • All leads collected via Facebook Instant Forms automatically appear in <strong>Sales → Online Orders</strong>.
              </p>
              <p>
                • Meta conversion API fires purchase events with token <code>metaConfig.accessToken</code>.
              </p>
            </div>
          </div>

          {/* Active Campaigns Quick Share Section */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-stone-900 text-sm flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Active Campaigns & Post Shares</span>
              </h3>
              <span className="text-[11px] text-stone-400">
                {promotions.length} {promotions.length === 1 ? 'campaign' : 'campaigns'}
              </span>
            </div>

            {promotions.length === 0 ? (
              <div className="p-4 text-center text-xs text-stone-400">
                No active promotional campaigns yet. Launch one above!
              </div>
            ) : (
              <div className="space-y-3">
                {promotions.map((promo) => {
                  const promoShareText = `🔥 Special Offer from ${currentTenant.name}!\n\n` +
                    `${promo.campaignTitle}\n\n` +
                    `📦 ${promo.productName}\n` +
                    `💰 Price: ${currentTenant.currencySymbol}${promo.price.toLocaleString()}\n\n` +
                    (companyFbLink ? `👉 Official Facebook Page: ${companyFbLink}\n\n` : '') +
                    (currentTenant.phone ? `📲 Order now: ${currentTenant.phone}\n` : '') +
                    `#${currentTenant.businessCode.replace(/[^a-zA-Z0-9]/g, '')} #Promotion`;

                  return (
                    <div
                      key={promo.id}
                      className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2 hover:border-stone-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-2.5">
                          {promo.productImage ? (
                            <img
                              src={promo.productImage}
                              alt={promo.productName}
                              className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-stone-200 flex items-center justify-center shrink-0">
                              <ShoppingBag className="w-5 h-5 text-stone-500" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-stone-900 text-xs line-clamp-1">
                              {promo.campaignTitle}
                            </div>
                            <div className="text-[11px] text-stone-500">
                              {promo.productName} • {currentTenant.currencySymbol}{promo.price.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full shrink-0">
                          {promo.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100">
                        <div className="flex items-center space-x-3">
                          <span>Reach: <strong>{promo.reachCount.toLocaleString()}</strong></span>
                          <span>Clicks: <strong>{promo.clicksCount.toLocaleString()}</strong></span>
                          <span>Orders: <strong>{promo.ordersGenerated}</strong></span>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => handleCopyPostText(promoShareText)}
                            className="px-2 py-1 bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 rounded-lg font-semibold text-[10px] flex items-center space-x-1 shadow-2xs"
                            title="Copy campaign post caption with company Facebook link"
                          >
                            <Copy className="w-3 h-3 text-stone-500" />
                            <span>Copy</span>
                          </button>

                          <button
                            onClick={() => handleShareToFacebook(promoShareText)}
                            className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold text-[10px] flex items-center space-x-1 shadow-2xs"
                            title="Share this campaign post on Facebook"
                          >
                            <Share2 className="w-3 h-3" />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

