import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ReportConfig } from '../../types';
import {
  BarChart3,
  FileSpreadsheet,
  Printer,
  Save,
  Trash2,
  Play,
  Check,
  Plus,
  Layers,
  Settings2,
  Sliders,
  ChevronDown
} from 'lucide-react';

export const ReportBuilderView: React.FC = () => {
  const {
    currentTenant,
    reportConfigs,
    products,
    sales,
    appointments,
    onlineOrders,
    customers,
    customFields,
    saveReportConfig,
    deleteReportConfig,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'builder' | 'templates'>('builder');

  // Report Builder state
  const [reportName, setReportName] = useState('Custom Stock & Valuation Report');
  const [dataSource, setDataSource] = useState<ReportConfig['dataSource']>('products');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'code',
    'name',
    'categoryName',
    'stockQuantity',
    'sellingPrice',
  ]);
  const [sortBy, setSortBy] = useState('stockQuantity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [groupBy, setGroupBy] = useState<string>('');
  const [dateRange, setDateRange] = useState<ReportConfig['dateRange']>('all');
  const [showTotals, setShowTotals] = useState(true);
  const [paperSize, setPaperSize] = useState<ReportConfig['paperSize']>('A4');
  const [headerText, setHeaderText] = useState(`${currentTenant.name} • Official Inventory Audit`);
  const [footerText, setFooterText] = useState('Confidential Internal Report • Retain for Company Records');
  const [includeLogo, setIncludeLogo] = useState(true);

  // Available Columns dynamically calculated per Data Source
  const availableColumns = useMemo(() => {
    if (dataSource === 'products') {
      const base = [
        { id: 'code', label: 'Product Code' },
        { id: 'name', label: 'Product Name' },
        { id: 'categoryName', label: 'Category' },
        { id: 'brand', label: 'Brand / Maker' },
        { id: 'purchasePrice', label: 'Cost Price' },
        { id: 'sellingPrice', label: 'Selling Price' },
        { id: 'stockQuantity', label: 'Stock Quantity' },
        { id: 'minStock', label: 'Min Safety Stock' },
        { id: 'unit', label: 'Unit' },
      ];
      // Append tenant custom fields!
      const custom = customFields.map((cf) => ({
        id: `cf_${cf.name}`,
        label: `[CF] ${cf.label}`,
      }));
      return [...base, ...custom];
    } else if (dataSource === 'sales') {
      return [
        { id: 'invoiceNumber', label: 'Invoice Number' },
        { id: 'customerName', label: 'Customer Name' },
        { id: 'customerPhone', label: 'Phone' },
        { id: 'paymentMethod', label: 'Payment Method' },
        { id: 'subtotal', label: 'Subtotal' },
        { id: 'discountAmount', label: 'Discount' },
        { id: 'totalAmount', label: 'Grand Total' },
        { id: 'cashierName', label: 'Cashier' },
        { id: 'createdAt', label: 'Timestamp' },
      ];
    } else if (dataSource === 'appointments') {
      return [
        { id: 'customerName', label: 'Customer' },
        { id: 'customerPhone', label: 'Phone' },
        { id: 'service', label: 'Service' },
        { id: 'staff', label: 'Stylist / Staff' },
        { id: 'date', label: 'Date' },
        { id: 'startTime', label: 'Start Time' },
        { id: 'durationMinutes', label: 'Duration (Min)' },
        { id: 'price', label: 'Price' },
        { id: 'status', label: 'Status' },
      ];
    } else {
      return [
        { id: 'orderNumber', label: 'Order #' },
        { id: 'customerName', label: 'Customer' },
        { id: 'customerPhone', label: 'Phone' },
        { id: 'source', label: 'Platform Source' },
        { id: 'deliveryAddress', label: 'Delivery Address' },
        { id: 'totalAmount', label: 'Total' },
        { id: 'status', label: 'Order Status' },
      ];
    }
  }, [dataSource, customFields]);

  const toggleColumn = (colId: string) => {
    setSelectedColumns((prev) =>
      prev.includes(colId) ? prev.filter((c) => c !== colId) : [...prev, colId]
    );
  };

  // Compile Preview Rows
  const previewRows = useMemo(() => {
    let dataset: any[] = [];
    if (dataSource === 'products') dataset = [...products];
    else if (dataSource === 'sales') dataset = [...sales];
    else if (dataSource === 'appointments') dataset = [...appointments];
    else dataset = [...onlineOrders];

    // Sorting
    dataset.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (sortBy.startsWith('cf_')) {
        const key = sortBy.replace('cf_', '');
        valA = a.customFields?.[key] ?? '';
        valB = b.customFields?.[key] ?? '';
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc'
        ? String(valA || '').localeCompare(String(valB || ''))
        : String(valB || '').localeCompare(String(valA || ''));
    });

    return dataset;
  }, [dataSource, products, sales, appointments, onlineOrders, sortBy, sortOrder]);

  const handleSaveTemplate = () => {
    saveReportConfig({
      name: reportName,
      dataSource,
      selectedColumns,
      filters: [],
      sortBy,
      sortOrder,
      groupBy: groupBy || undefined,
      dateRange,
      showTotals,
      paperSize,
      headerText,
      footerText,
      includeLogo,
    });
    setActiveTab('templates');
  };

  const handleLoadTemplate = (t: ReportConfig) => {
    setReportName(t.name);
    setDataSource(t.dataSource);
    setSelectedColumns(t.selectedColumns);
    setSortBy(t.sortBy);
    setSortOrder(t.sortOrder);
    setGroupBy(t.groupBy || '');
    setDateRange(t.dateRange);
    setShowTotals(t.showTotals);
    setPaperSize(t.paperSize);
    setHeaderText(t.headerText || '');
    setFooterText(t.footerText || '');
    setIncludeLogo(t.includeLogo);
    setActiveTab('builder');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-stone-900">Custom Report Builder</h1>
            <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
              MongoDB Schema Driven
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Design, filter, group, and print tailored reports for <strong>{currentTenant.name}</strong> without developer code changes.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'builder' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Report Designer
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'templates' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Saved Templates ({reportConfigs.length})
          </button>
        </div>
      </div>

      {activeTab === 'templates' ? (
        /* Saved Templates Tab */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportConfigs.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-amber-400 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-stone-400 mb-2 font-mono">
                  <span className="uppercase bg-stone-100 px-2 py-0.5 rounded text-[10px] font-bold text-stone-700">
                    {t.dataSource}
                  </span>
                  <span>{t.paperSize}</span>
                </div>
                <h3 className="font-bold text-sm text-stone-900 group-hover:text-amber-800">
                  {t.name}
                </h3>
                <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                  {t.headerText || 'Custom generated business report'}
                </p>
                <div className="mt-3 text-[11px] text-stone-400">
                  Columns: {t.selectedColumns.length} fields selected
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => deleteReportConfig(t.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg"
                  title="Delete Template"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleLoadTemplate(t)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Load & Run Report</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Builder & Live Preview */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Builder Controls Column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4 text-xs">
              <h3 className="font-bold text-stone-900 text-sm flex items-center space-x-2 border-b pb-2">
                <Settings2 className="w-4 h-4 text-amber-600" />
                <span>Report Parameters</span>
              </h3>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Report Title</label>
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Data Source Collection</label>
                <select
                  value={dataSource}
                  onChange={(e) => {
                    const newSource = e.target.value as ReportConfig['dataSource'];
                    setDataSource(newSource);
                    if (newSource === 'products') setSelectedColumns(['code', 'name', 'stockQuantity', 'sellingPrice']);
                    else if (newSource === 'sales') setSelectedColumns(['invoiceNumber', 'customerName', 'totalAmount', 'createdAt']);
                    else if (newSource === 'appointments') setSelectedColumns(['customerName', 'service', 'staff', 'price', 'status']);
                    else setSelectedColumns(['orderNumber', 'customerName', 'totalAmount', 'status']);
                  }}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg font-semibold capitalize"
                >
                  <option value="products">Products / Stock Inventory</option>
                  <option value="sales">Sales & Revenue Invoices</option>
                  {currentTenant.modules.appointments && (
                    <option value="appointments">Salon Appointments & Bookings</option>
                  )}
                  <option value="online_orders">Social Commerce Online Orders</option>
                </select>
              </div>

              {/* Column Picker */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">
                  Select Columns ({selectedColumns.length} chosen)
                </label>
                <div className="max-h-40 overflow-y-auto p-2 border border-stone-200 rounded-lg space-y-1.5 bg-stone-50">
                  {availableColumns.map((col) => {
                    const isChecked = selectedColumns.includes(col.id);
                    return (
                      <label key={col.id} className="flex items-center space-x-2 cursor-pointer text-[11px]">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleColumn(col.id)}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span className={isChecked ? 'font-bold text-stone-900' : 'text-stone-600'}>
                          {col.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Sorting & Paper Size */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-xs"
                  >
                    {selectedColumns.map((c) => (
                      <option key={c} value={c}>
                        {availableColumns.find((a) => a.id === c)?.label || c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Order</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-xs"
                  >
                    <option value="asc">Ascending (A-Z, 0-9)</option>
                    <option value="desc">Descending (Z-A, 9-0)</option>
                  </select>
                </div>
              </div>

              {/* Paper Size & Logo */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Paper Layout</label>
                  <select
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value as any)}
                    className="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-xs"
                  >
                    <option value="A4">A4 Document</option>
                    <option value="Thermal80">80mm Thermal</option>
                    <option value="Letter">US Letter</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Options</label>
                  <label className="flex items-center space-x-1.5 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showTotals}
                      onChange={(e) => setShowTotals(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-[11px] font-medium text-stone-700">Compute Totals</span>
                  </label>
                </div>
              </div>

              {/* Header & Footer Custom Text */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Report Header Note</label>
                <input
                  type="text"
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              {/* Save & Print Buttons */}
              <div className="pt-2 flex items-center space-x-2">
                <button
                  onClick={handleSaveTemplate}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-xl text-xs shadow-xs flex items-center justify-center space-x-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Template</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs shadow-xs flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          </div>

          {/* Live Document Preview Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 overflow-hidden flex flex-col text-xs text-stone-800">
              {/* Document Header */}
              <div className="border-b-2 border-stone-800 pb-4 mb-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded bg-amber-500 text-stone-950 font-black flex items-center justify-center text-xs">
                      {currentTenant.businessCode.slice(0, 3)}
                    </div>
                    <div>
                      <h2 className="text-base font-black text-stone-900 leading-none">
                        {currentTenant.name}
                      </h2>
                      <p className="text-[10px] text-stone-500 mt-0.5">{headerText}</p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-stone-900 uppercase tracking-wide">
                    {reportName}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    Generated: {new Date().toLocaleDateString()} • Format: {paperSize}
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-stone-300 text-[10px] font-bold text-stone-600 uppercase tracking-wider bg-stone-50">
                      {selectedColumns.map((colId) => (
                        <th key={colId} className="py-2 px-3">
                          {availableColumns.find((c) => c.id === colId)?.label || colId}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {previewRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/60">
                        {selectedColumns.map((colId) => {
                          let cellValue = row[colId];
                          if (colId.startsWith('cf_')) {
                            const key = colId.replace('cf_', '');
                            cellValue = row.customFields?.[key] ?? '-';
                          }

                          const isNumeric = typeof cellValue === 'number';

                          return (
                            <td
                              key={colId}
                              className={`py-2 px-3 ${isNumeric ? 'text-right font-mono' : ''}`}
                            >
                              {isNumeric
                                ? cellValue.toLocaleString()
                                : String(cellValue || '-')}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              {showTotals && (
                <div className="mt-4 pt-3 border-t-2 border-stone-800 flex justify-between items-center text-xs font-bold text-stone-900">
                  <span>Total Records: {previewRows.length}</span>
                  <span className="font-mono text-amber-900">
                    Report Data Verified Under Tenant #{currentTenant.id}
                  </span>
                </div>
              )}

              {/* Footer */}
              <div className="mt-6 pt-3 border-t border-stone-200 text-center text-[10px] text-stone-400">
                {footerText} • WCS Business SaaS Engine
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
