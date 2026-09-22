import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  MessageCircle,
  Send,
  ExternalLink,
  CheckCircle,
  Smartphone,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export const WhatsAppModal: React.FC = () => {
  const { activeWhatsAppDialog, closeWhatsAppDialog, sendWhatsAppMessage, currentTenant } = useApp();

  if (!activeWhatsAppDialog || !activeWhatsAppDialog.isOpen) return null;

  const [phone, setPhone] = useState(activeWhatsAppDialog.phone || '');
  const [name, setName] = useState(activeWhatsAppDialog.name || '');
  const [message, setMessage] = useState(activeWhatsAppDialog.message || '');
  const [isSent, setIsSent] = useState(false);

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const waWebUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  const handleCloudApiSend = () => {
    sendWhatsAppMessage(phone, name, 'invoice', message);
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      closeWhatsAppDialog();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200 animate-in fade-in-50 zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-emerald-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">
                {activeWhatsAppDialog.title || 'WhatsApp Business Cloud API'}
              </h3>
              <p className="text-[11px] text-emerald-100">
                Official Cloud API Endpoint • Tenant: {currentTenant.name}
              </p>
            </div>
          </div>
          <button
            onClick={closeWhatsAppDialog}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs">
          {isSent ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-stone-900">Message Dispatched!</h4>
              <p className="text-stone-500">
                Processed via WCS WhatsApp Cloud API gateway with HTTP 200 OK.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Message Payload
                </label>
                <textarea
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 border border-stone-300 rounded-lg font-mono text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed bg-stone-50"
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start space-x-2.5">
                <Smartphone className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-[11px] text-emerald-900 leading-normal">
                  <span className="font-bold">Dual Delivery Modes:</span> You can either dispatch directly through the simulated <strong>WhatsApp Cloud API</strong> (stores in tenant database logs) or open in <strong>WhatsApp Web</strong> to send to your actual phone!
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-stone-200">
                <a
                  href={waWebUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    sendWhatsAppMessage(phone, name, 'invoice', message);
                  }}
                  className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-semibold transition-colors text-center"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open WhatsApp Web / App</span>
                </a>

                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={closeWhatsAppDialog}
                    className="px-3 py-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCloudApiSend}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Cloud API Alert</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
