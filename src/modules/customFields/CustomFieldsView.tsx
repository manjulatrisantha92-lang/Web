import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomField, CustomFieldType } from '../../types';
import {
  SlidersHorizontal,
  Plus,
  Trash2,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Layers,
  Wrench,
  Gem,
  Laptop,
  Scissors,
  Smartphone,
  Wheat,
  X
} from 'lucide-react';

const SUPPORTED_TYPES: { type: CustomFieldType; label: string; description: string }[] = [
  { type: 'text', label: 'Text', description: 'Single line text (e.g. Model, Engine Type)' },
  { type: 'number', label: 'Number', description: 'Integer values (e.g. Year, Stock)' },
  { type: 'decimal', label: 'Decimal', description: 'Float numbers with decimal precision' },
  { type: 'date', label: 'Date', description: 'Calendar date picker' },
  { type: 'dropdown', label: 'Dropdown', description: 'Predefined single-selection choices' },
  { type: 'multi_select', label: 'Multi-select', description: 'Multiple choices allowed' },
  { type: 'checkbox', label: 'Checkbox', description: 'Yes / No boolean flag' },
  { type: 'image', label: 'Image', description: 'Photo / diagram upload' },
  { type: 'barcode', label: 'Barcode', description: 'Scannable barcode format' },
  { type: 'serial_number', label: 'Serial Number', description: 'Unique device serial or IMEI' },
  { type: 'weight', label: 'Weight', description: 'Grams, carats, or kilograms with unit' },
  { type: 'currency', label: 'Currency', description: 'Monetary denomination' },
];

export const CustomFieldsView: React.FC = () => {
  const { currentTenant, customFields, addCustomField, deleteCustomField } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [label, setLabel] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<CustomFieldType>('text');
  const [required, setRequired] = useState(false);
  const [optionsString, setOptionsString] = useState('');
  const [unit, setUnit] = useState('');
  const [placeholder, setPlaceholder] = useState('');

  const handleLabelChange = (newLabel: string) => {
    setLabel(newLabel);
    // Auto generate camelCase field key
    const generated = newLabel
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, '');
    setName(generated);
  };

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    const options =
      type === 'dropdown' || type === 'multi_select'
        ? optionsString
            .split(',')
            .map((o) => o.trim())
            .filter(Boolean)
        : undefined;

    addCustomField({
      entity: 'product',
      name: name.trim() || label.toLowerCase().replace(/\s+/g, '_'),
      label: label.trim(),
      type,
      required,
      options,
      unit: unit.trim() || undefined,
      placeholder: placeholder.trim() || undefined,
    });

    setShowAddModal(false);
    setLabel('');
    setName('');
    setType('text');
    setRequired(false);
    setOptionsString('');
    setUnit('');
    setPlaceholder('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-stone-900">Custom Fields Engine</h1>
            <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-semibold capitalize">
              {currentTenant.industry} Schema
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Define dynamic attributes for <strong>{currentTenant.name}</strong> without code modifications or table migrations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Field</span>
        </button>
      </div>

      {/* Architecture Notice Banner */}
      <div className="bg-stone-900 text-stone-300 p-4 rounded-2xl border border-stone-800 flex items-start space-x-3 text-xs">
        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
          <SlidersHorizontal className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-white text-xs">
            Dynamic Schema Engine (Shared Multi-Tenant DB)
          </h4>
          <p className="text-stone-400 text-[11px] leading-relaxed">
            Instead of hard-coding separate databases for automotive, jewellery, computer shops, or salons, each business defines its own schema in <code>custom_fields</code>. When adding products or generating reports, the UI dynamically renders and validates these fields.
          </p>
        </div>
      </div>

      {/* Custom Fields Grid / List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-bold text-stone-900 text-sm">
            Configured Fields for this Business ({customFields.length})
          </h3>
          <span className="text-xs text-stone-400">
            Stored under tenantId: <code className="font-mono text-stone-600">{currentTenant.id}</code>
          </span>
        </div>

        {customFields.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-xs">
            No custom fields configured yet. Click "Add Custom Field" to define fields.
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {customFields.map((field) => (
              <div
                key={field.id}
                className="p-4 hover:bg-stone-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-stone-900 text-sm">{field.label}</span>
                    <span className="font-mono text-[11px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                      {field.name}
                    </span>
                    <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.2 rounded font-semibold text-[10px] uppercase">
                      {field.type}
                    </span>
                    {field.required && (
                      <span className="bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded font-bold text-[10px]">
                        Required
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-stone-500">
                    {field.options && (
                      <span>Options: {field.options.join(', ')}</span>
                    )}
                    {field.unit && <span> • Unit: {field.unit}</span>}
                    {field.placeholder && <span> • Placeholder: "{field.placeholder}"</span>}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => {
                      if (confirm(`Remove custom field "${field.label}"?`)) {
                        deleteCustomField(field.id);
                      }
                    }}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Field"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Custom Field Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm">
                Add New Custom Field ({currentTenant.name})
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddField} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Field Label *
                  </label>
                  <input
                    type="text"
                    required
                    value={label}
                    onChange={(e) => handleLabelChange(e.target.value)}
                    placeholder="e.g. Vehicle Make / Carat / RAM / Stylist"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Internal Key Name (JSON)
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono bg-stone-50 text-stone-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Field Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as CustomFieldType)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg font-semibold"
                  >
                    {SUPPORTED_TYPES.map((t) => (
                      <option key={t.type} value={t.type}>
                        {t.label} ({t.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(type === 'dropdown' || type === 'multi_select') && (
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Options (Comma-separated) *
                  </label>
                  <input
                    type="text"
                    required
                    value={optionsString}
                    onChange={(e) => setOptionsString(e.target.value)}
                    placeholder="e.g. Option A, Option B, Option C"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    Enter possible choices separated by commas.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Measurement Unit (Optional)
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. grams, cts, kW, mm"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Placeholder Text
                  </label>
                  <input
                    type="text"
                    value={placeholder}
                    onChange={(e) => setPlaceholder(e.target.value)}
                    placeholder="e.g. e.g. 04465-02220"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={required}
                    onChange={(e) => setRequired(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-semibold text-stone-700">
                    Mandatory / Required Field when creating products
                  </span>
                </label>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold"
                >
                  Save Custom Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
