import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sale } from '../../types';
import {
  X,
  Printer,
  MessageCircle,
  Mail,
  Download,
  Check,
  FileText,
  Building,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';

interface InvoiceModalProps {
  sale: Sale | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ sale, onClose }) => {
  const { currentTenant, openWhatsAppDialog } = useApp();
  const [printFormat, setPrintFormat] = useState<'a4' | 'thermal80' | 'thermal58'>('a4');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    const invoiceLink = `https://${currentTenant.businessCode.toLowerCase()}.wcs.lk/invoices/${sale.invoiceNumber}`;
    const itemsList = sale.items
      .map((i) => `• ${i.productName} (${i.quantity}x) - ${currentTenant.currencySymbol}${(i.subtotal).toLocaleString()}`)
      .join('\n');

    const message = `Hello ${sale.customerName},\n\nThank you for choosing *${currentTenant.name}*!\n\nYour Invoice *#${sale.invoiceNumber}* has been issued:\nTotal: *${currentTenant.currencySymbol}${sale.totalAmount.toLocaleString()}*\nPayment: ${sale.paymentMethod.toUpperCase()}\n\n*Purchased Items:*\n${itemsList}\n\nView or download your digital receipt:\n${invoiceLink}\n\n_${currentTenant.billFooter}_`;

    openWhatsAppDialog(sale.customerPhone || currentTenant.phone, sale.customerName, message, `Send WhatsApp Invoice #${sale.invoiceNumber}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-stone-200 flex flex-col max-h-[92vh]">
        {/* Top Control Bar */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
              INV
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 leading-tight">
                {sale.invoiceNumber}
              </h3>
              <p className="text-xs text-stone-500">
                Issued on {new Date(sale.createdAt).toLocaleDateString()} at {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Format Switcher */}
            <div className="hidden sm:flex bg-stone-200/80 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setPrintFormat('a4')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  printFormat === 'a4' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                A4 Invoice
              </button>
              <button
                onClick={() => setPrintFormat('thermal80')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  printFormat === 'thermal80' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                80mm Thermal
              </button>
              <button
                onClick={() => setPrintFormat('thermal58')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  printFormat === 'thermal58' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                58mm POS
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Preview Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-100 flex justify-center">
          {/* A4 FORMAT */}
          {printFormat === 'a4' && (
            <div className="bg-white p-8 w-full max-w-2xl shadow-sm border border-stone-200 text-stone-800 text-xs">
              {/* Header with Logo and Company Info */}
              <div className="flex justify-between items-start border-b border-stone-200 pb-6 mb-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-9 h-9 rounded bg-amber-500 text-stone-950 font-black flex items-center justify-center text-sm shadow-xs">
                      {currentTenant.businessCode.slice(0, 3)}
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-stone-900">{currentTenant.name}</h1>
                      <p className="text-[11px] text-stone-500 font-medium">{currentTenant.billHeader}</p>
                    </div>
                  </div>
                  <div className="text-[11px] text-stone-600 space-y-0.5">
                    <p>{currentTenant.address}</p>
                    <p>Tel: {currentTenant.phone} • Email: {currentTenant.email}</p>
                    {currentTenant.taxNumber && <p className="font-medium text-stone-800">Tax / VAT No: {currentTenant.taxNumber}</p>}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    TAX INVOICE
                  </span>
                  <div className="mt-2 text-sm font-black text-stone-900">{sale.invoiceNumber}</div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    Date: {new Date(sale.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Cashier: {sale.cashierName}
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 mb-6 flex justify-between">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Bill To Customer</span>
                  <div className="text-sm font-bold text-stone-900">{sale.customerName}</div>
                  <div className="text-[11px] text-stone-600">{sale.customerPhone || 'Walk-in Customer'}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Payment Details</span>
                  <div className="text-xs font-semibold text-stone-800 uppercase">{sale.paymentMethod}</div>
                  <div className="text-[11px] text-emerald-600 font-medium">Status: {sale.paymentStatus.toUpperCase()}</div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left mb-6 border-collapse">
                <thead>
                  <tr className="border-b-2 border-stone-800 text-[10px] font-bold text-stone-700 uppercase tracking-wider">
                    <th className="py-2">Item / Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {sale.items.map((item, idx) => (
                    <tr key={idx} className="py-2">
                      <td className="py-2.5 pr-2">
                        <div className="font-semibold text-stone-900">{item.productName}</div>
                        <div className="text-[10px] text-stone-400 font-mono">Code: {item.productCode}</div>
                        {item.customFields && Object.keys(item.customFields).length > 0 && (
                          <div className="text-[10px] text-amber-800 mt-0.5">
                            {Object.entries(item.customFields).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 text-center font-medium">{item.quantity}</td>
                      <td className="py-2.5 text-right font-mono">{currentTenant.currencySymbol}{item.price.toLocaleString()}</td>
                      <td className="py-2.5 text-right font-bold font-mono">{currentTenant.currencySymbol}{item.subtotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Section */}
              <div className="flex justify-end pt-2 border-t border-stone-200">
                <div className="w-64 space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">{currentTenant.currencySymbol}{sale.subtotal.toLocaleString()}</span>
                  </div>
                  {sale.discountAmount > 0 && (
                    <div className="flex justify-between text-rose-600 font-medium">
                      <span>Discount:</span>
                      <span className="font-mono">-{currentTenant.currencySymbol}{sale.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {sale.taxAmount > 0 && (
                    <div className="flex justify-between text-stone-600">
                      <span>Tax / VAT:</span>
                      <span className="font-mono">+{currentTenant.currencySymbol}{sale.taxAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-stone-900 border-t-2 border-stone-800 pt-1.5 mt-1">
                    <span>Grand Total:</span>
                    <span className="font-mono">{currentTenant.currencySymbol}{sale.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-stone-200 text-center text-[10px] text-stone-500">
                <p className="font-medium text-stone-700">{currentTenant.billFooter}</p>
                <p className="mt-1">Generated by WCS Business Management Platform • System Tenant #{currentTenant.id}</p>
              </div>
            </div>
          )}

          {/* 80mm THERMAL RECEIPT FORMAT */}
          {printFormat === 'thermal80' && (
            <div className="bg-white p-5 w-[320px] shadow-md border border-stone-300 font-mono text-[11px] text-stone-900 leading-tight">
              <div className="text-center pb-3 border-b border-dashed border-stone-400">
                <div className="font-bold text-sm tracking-wide uppercase">{currentTenant.name}</div>
                <div className="text-[10px] text-stone-600">{currentTenant.billHeader}</div>
                <div className="text-[10px] mt-1">{currentTenant.address}</div>
                <div className="text-[10px]">TEL: {currentTenant.phone}</div>
                {currentTenant.taxNumber && <div className="text-[9px]">VAT: {currentTenant.taxNumber}</div>}
              </div>

              <div className="py-2 border-b border-dashed border-stone-400 text-[10px]">
                <div className="flex justify-between">
                  <span>BILL NO: {sale.invoiceNumber}</span>
                  <span>{new Date(sale.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>CUST: {sale.customerName.slice(0, 18)}</span>
                  <span>{new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="py-2 border-b border-dashed border-stone-400">
                {sale.items.map((item, idx) => (
                  <div key={idx} className="mb-1.5">
                    <div className="font-semibold text-stone-900 truncate">{item.productName}</div>
                    <div className="flex justify-between text-[10px] text-stone-700">
                      <span>{item.quantity} x {item.price.toLocaleString()}</span>
                      <span className="font-bold">{item.subtotal.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="py-2 border-b border-dashed border-stone-400 space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span>SUBTOTAL:</span>
                  <span>{currentTenant.currencySymbol}{sale.subtotal.toLocaleString()}</span>
                </div>
                {sale.discountAmount > 0 && (
                  <div className="flex justify-between text-[10px]">
                    <span>DISCOUNT:</span>
                    <span>-{currentTenant.currencySymbol}{sale.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-stone-800">
                  <span>TOTAL:</span>
                  <span>{currentTenant.currencySymbol}{sale.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] text-stone-600">
                  <span>PAYMENT:</span>
                  <span>{sale.paymentMethod.toUpperCase()} (PAID)</span>
                </div>
              </div>

              <div className="text-center pt-3 text-[10px] text-stone-600">
                <p>{currentTenant.billFooter}</p>
                <p className="mt-1 text-[8px] text-stone-400">THANK YOU COME AGAIN</p>
              </div>
            </div>
          )}

          {/* 58mm POS FORMAT */}
          {printFormat === 'thermal58' && (
            <div className="bg-white p-3 w-[240px] shadow-md border border-stone-300 font-mono text-[10px] text-stone-900 leading-none">
              <div className="text-center pb-2 border-b border-dashed border-stone-400">
                <div className="font-bold text-xs uppercase">{currentTenant.name.slice(0, 20)}</div>
                <div className="text-[9px]">{currentTenant.phone}</div>
                <div className="text-[9px] mt-1 font-bold">{sale.invoiceNumber}</div>
              </div>

              <div className="py-2 border-b border-dashed border-stone-400">
                {sale.items.map((item, idx) => (
                  <div key={idx} className="mb-1">
                    <div className="truncate font-semibold">{item.productName}</div>
                    <div className="flex justify-between text-[9px]">
                      <span>{item.quantity}x</span>
                      <span className="font-bold">{item.subtotal.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="py-1.5 border-b border-dashed border-stone-400">
                <div className="flex justify-between font-bold text-xs">
                  <span>TOTAL:</span>
                  <span>{currentTenant.currencySymbol}{sale.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-center pt-2 text-[9px] text-stone-600">
                {currentTenant.billFooter ? currentTenant.billFooter.slice(0, 45) : 'Thank you for your business!'}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="px-6 py-4 bg-white border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSendWhatsApp}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send WhatsApp Invoice</span>
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://${currentTenant.businessCode.toLowerCase()}.wcs.lk/invoices/${sale.invoiceNumber}`);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
              }}
              className="flex items-center space-x-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied' : 'Copy Web Link'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print {printFormat.toUpperCase()}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-stone-200 text-xs font-medium text-stone-600 hover:bg-stone-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
