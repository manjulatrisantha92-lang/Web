import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductCategory } from '../../types';
import {
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Edit2,
  Trash2,
  AlertTriangle,
  Layers,
  Image as ImageIcon,
  Check,
  X,
  Upload,
  Camera,
  Eye,
  LayoutGrid,
  List,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ZoomIn,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const INDUSTRY_SAMPLE_IMAGES: Record<string, { label: string; url: string }[]> = {
  automotive: [
    { label: 'Brake Pads', url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80' },
    { label: 'Oil Filter', url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80' },
    { label: 'Shock Absorber', url: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&auto=format&fit=crop&q=80' },
    { label: 'Alternator / Engine', url: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=600&auto=format&fit=crop&q=80' },
  ],
  salon: [
    { label: 'Keratin Hair Serum', url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80' },
    { label: 'Hydra Facial Care', url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80' },
    { label: 'Organic Shampoo', url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop&q=80' },
  ],
  jewellery: [
    { label: '22K Gold Bangle', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80' },
    { label: 'Sapphire Ring', url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80' },
    { label: 'Diamond Pendant', url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80' },
  ],
  computer: [
    { label: 'Gaming Laptop', url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80' },
    { label: 'Samsung NVMe SSD', url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80' },
    { label: 'Mechanical Keyboard', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80' },
  ],
  grocery: [
    { label: 'Basmati Rice 5kg', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80' },
    { label: 'Pure Ceylon Tea', url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80' },
  ],
  agriculture: [
    { label: 'Organic Crop Booster', url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&auto=format&fit=crop&q=80' },
    { label: 'Hybrid Farm Seeds', url: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=600&auto=format&fit=crop&q=80' },
  ],
  general: [
    { label: 'Premium Product', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80' },
  ],
};

// Client-side image converter: resizes & compresses file to lightweight JPEG
const compressImageToJpg = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|avif)$/i.test(file.name);
    if (!isImage) {
      reject(new Error('Please upload an image file in JPG, JPEG, or PNG format.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Fill pure white background in case source image was a transparent PNG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to optimal JPEG (0.85 quality)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image file. Please try another JPG image.'));
    };
    reader.onerror = () => reject(new Error('Could not read the selected image file.'));
    reader.readAsDataURL(file);
  });
};

export const ProductsView: React.FC = () => {
  const {
    currentTenant,
    products,
    categories,
    customFields,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
    setActiveView,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Lightbox preview modal
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  // Quick Image Manager modal
  const [quickImageProduct, setQuickImageProduct] = useState<Product | null>(null);
  const [quickImageUrl, setQuickImageUrl] = useState('');
  const [quickImageError, setQuickImageError] = useState('');
  const [isProcessingQuickImage, setIsProcessingQuickImage] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [barcode, setBarcode] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [supplier, setSupplier] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [minStock, setMinStock] = useState<number>(3);
  const [unit, setUnit] = useState('Pieces');
  const [imageUrl, setImageUrl] = useState('');
  const [imageTab, setImageTab] = useState<'upload' | 'url' | 'samples'>('upload');
  const [imageError, setImageError] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const quickFileInputRef = useRef<HTMLInputElement>(null);

  // Category modal form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatCode, setNewCatCode] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const sampleImages = INDUSTRY_SAMPLE_IMAGES[currentTenant.industry] || INDUSTRY_SAMPLE_IMAGES.general;

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    const randomCode = `${currentTenant.businessCode.slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`;
    setCode(randomCode);
    setBarcode(`940${Math.floor(100000000 + Math.random() * 900000000)}`);
    setSku(`${randomCode}-01`);
    setCategoryId(categories[0]?.id || '');
    setBrand('');
    setSupplier('');
    setPurchasePrice(0);
    setSellingPrice(0);
    setDiscount(0);
    setTaxRate(0);
    setStockQuantity(20);
    setMinStock(5);
    setUnit(currentTenant.industry === 'salon' ? 'Sessions' : 'Pieces');
    setImageUrl('');
    setImageError('');
    setImageTab('upload');
    setFieldValues({});
    setShowProductModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCode(p.code);
    setBarcode(p.barcode);
    setSku(p.sku);
    setCategoryId(p.categoryId);
    setBrand(p.brand);
    setSupplier(p.supplier);
    setPurchasePrice(p.purchasePrice);
    setSellingPrice(p.sellingPrice);
    setDiscount(p.discount);
    setTaxRate(p.taxRate);
    setStockQuantity(p.stockQuantity);
    setMinStock(p.minStock);
    setUnit(p.unit);
    setImageUrl(p.imageUrl || '');
    setImageError('');
    setImageTab('upload');
    setFieldValues(p.customFields || {});
    setShowProductModal(true);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setImageError('');
    setIsProcessingImage(true);
    try {
      const compressedJpgData = await compressImageToJpg(file);
      setImageUrl(compressedJpgData);
    } catch (err: any) {
      setImageError(err.message || 'Failed to process image.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleQuickFileUpload = async (file: File) => {
    if (!file) return;
    setQuickImageError('');
    setIsProcessingQuickImage(true);
    try {
      const compressedJpgData = await compressImageToJpg(file);
      setQuickImageUrl(compressedJpgData);
    } catch (err: any) {
      setQuickImageError(err.message || 'Failed to process image.');
    } finally {
      setIsProcessingQuickImage(false);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const selectedCat = categories.find((c) => c.id === categoryId);

    const payload = {
      name: name.trim(),
      code: code.trim(),
      barcode: barcode.trim(),
      sku: sku.trim(),
      categoryId: categoryId || categories[0]?.id || 'general',
      categoryName: selectedCat ? selectedCat.name : 'General',
      brand: brand.trim(),
      supplier: supplier.trim(),
      purchasePrice: Number(purchasePrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      discount: Number(discount) || 0,
      taxRate: Number(taxRate) || 0,
      stockQuantity: Number(stockQuantity) || 0,
      minStock: Number(minStock) || 0,
      unit: unit.trim() || 'Pieces',
      imageUrl: imageUrl.trim() || undefined,
      customFields: fieldValues,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
    } else {
      addProduct(payload);
    }

    setShowProductModal(false);
  };

  const handleSaveQuickImage = () => {
    if (!quickImageProduct) return;
    updateProduct(quickImageProduct.id, {
      imageUrl: quickImageUrl.trim() || undefined,
    });
    setQuickImageProduct(null);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({
      name: newCatName.trim(),
      code: newCatCode.trim() || newCatName.slice(0, 3).toUpperCase(),
      description: newCatDesc.trim(),
    });
    setNewCatName('');
    setNewCatCode('');
    setNewCatDesc('');
    setShowCategoryModal(false);
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchLowStock = !filterLowStockOnly || p.stockQuantity <= p.minStock;
    const matchQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.customFields && Object.values(p.customFields).some((v) => String(v).toLowerCase().includes(searchQuery.toLowerCase())));
    return matchCat && matchLowStock && matchQuery;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-stone-900">Products & Inventory</h1>
            <span className="text-xs bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full font-semibold">
              {products.length} Products
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Configurable product catalog with JPG product imagery and dynamic <span className="font-semibold text-amber-800">{currentTenant.industry}</span> custom attributes
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-stone-50 text-stone-700 rounded-xl border border-stone-200 text-xs font-semibold shadow-xs"
          >
            <Layers className="w-3.5 h-3.5 text-stone-500" />
            <span>Categories ({categories.length})</span>
          </button>
          <button
            onClick={() => setActiveView('custom_fields')}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-stone-50 text-stone-700 rounded-xl border border-stone-200 text-xs font-semibold shadow-xs"
            title="Configure Industry Custom Fields"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
            <span>Custom Fields ({customFields.length})</span>
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by code, name, brand, or custom attributes..."
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <label className="flex items-center space-x-2 text-xs text-stone-700 cursor-pointer bg-stone-50 px-3 py-2 rounded-xl border border-stone-200 hover:bg-stone-100">
            <input
              type="checkbox"
              checked={filterLowStockOnly}
              onChange={(e) => setFilterLowStockOnly(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <span>Low Stock Only</span>
          </label>
        </div>

        {/* View Switcher: Table vs Gallery Grid */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'table'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
            title="Table View"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Table</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
            title="Gallery Card View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Gallery Cards</span>
          </button>
        </div>
      </div>

      {/* View Mode: TABLE */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-800">
              <thead className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-16 text-center">Photo</th>
                  <th className="py-3.5 px-4">Code / Barcode</th>
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Configured Custom Fields</th>
                  <th className="py-3.5 px-4 text-right">Cost Price</th>
                  <th className="py-3.5 px-4 text-right">Selling Price</th>
                  <th className="py-3.5 px-4 text-center">Stock</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-stone-400">
                      No matching products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const isLow = p.stockQuantity <= p.minStock;
                    return (
                      <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                        {/* Image Thumbnail Column */}
                        <td className="py-2.5 px-4 text-center">
                          <div className="relative group/img w-11 h-11 mx-auto rounded-lg border border-stone-200 overflow-hidden bg-stone-100 flex items-center justify-center shrink-0">
                            {p.imageUrl ? (
                              <>
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center space-x-1">
                                  <button
                                    onClick={() => setPreviewProduct(p)}
                                    title="View Full Photo"
                                    className="p-1 text-white hover:text-amber-300 rounded"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setQuickImageProduct(p);
                                      setQuickImageUrl(p.imageUrl || '');
                                      setQuickImageError('');
                                    }}
                                    title="Change JPG Image"
                                    className="p-1 text-white hover:text-amber-300 rounded"
                                  >
                                    <Camera className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  setQuickImageProduct(p);
                                  setQuickImageUrl('');
                                  setQuickImageError('');
                                }}
                                title="Add JPG Photo"
                                className="w-full h-full flex flex-col items-center justify-center text-stone-400 hover:text-amber-600 hover:bg-amber-50/60 transition-colors"
                              >
                                <Camera className="w-4 h-4" />
                                <span className="text-[8px] font-bold text-amber-700 mt-0.5">+JPG</span>
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-stone-900">{p.code}</div>
                          <div className="text-[10px] text-stone-400 font-mono">{p.barcode}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-stone-900">{p.name}</div>
                          <div className="text-[11px] text-stone-500">{p.brand || 'No Brand'} • SKU: {p.sku}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-medium text-[11px]">
                            {p.categoryName}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          {p.customFields && Object.keys(p.customFields).length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(p.customFields).map(([key, val]) => (
                                <span
                                  key={key}
                                  className="bg-amber-50 text-amber-900 border border-amber-200/60 px-1.5 py-0.2 rounded text-[10px]"
                                >
                                  <strong className="font-semibold capitalize">{key}:</strong> {String(val)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-stone-300 text-[10px] italic">None</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-stone-500">
                          {currentTenant.currencySymbol}{p.purchasePrice.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-stone-900">
                          {currentTenant.currencySymbol}{p.sellingPrice.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                              isLow
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {p.stockQuantity} {p.unit}
                          </span>
                          {isLow && (
                            <div className="text-[9px] text-rose-600 font-bold uppercase mt-0.5">
                              Low Stock
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => {
                                setQuickImageProduct(p);
                                setQuickImageUrl(p.imageUrl || '');
                                setQuickImageError('');
                              }}
                              className="p-1.5 text-stone-500 hover:text-amber-700 rounded-lg hover:bg-stone-100"
                              title="Update JPG Photo"
                            >
                              <Camera className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                              title="Edit Product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${p.name}?`)) {
                                  deleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* View Mode: GALLERY CARDS */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-stone-400 bg-white rounded-2xl border border-stone-200">
              No matching products found.
            </div>
          ) : (
            filteredProducts.map((p) => {
              const isLow = p.stockQuantity <= p.minStock;
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Card Photo Banner */}
                    <div className="relative w-full h-44 bg-stone-100 overflow-hidden border-b border-stone-100 flex items-center justify-center">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-stone-300">
                          <Package className="w-10 h-10 mb-1" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                            No Photo
                          </span>
                        </div>
                      )}

                      {/* Stock Pill on Photo */}
                      <div className="absolute top-2.5 right-2.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono shadow-xs ${
                            isLow
                              ? 'bg-rose-600 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {p.stockQuantity} {p.unit}
                        </span>
                      </div>

                      {/* Category Badge on Photo */}
                      <div className="absolute bottom-2.5 left-2.5">
                        <span className="bg-stone-900/80 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md font-semibold">
                          {p.categoryName}
                        </span>
                      </div>

                      {/* Quick Action Overlay on Photo */}
                      <div className="absolute top-2.5 left-2.5 flex items-center space-x-1">
                        {p.imageUrl && (
                          <button
                            onClick={() => setPreviewProduct(p)}
                            title="Preview Full Image"
                            className="p-1.5 bg-black/60 hover:bg-black/90 text-white rounded-lg backdrop-blur-xs shadow-xs transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setQuickImageProduct(p);
                            setQuickImageUrl(p.imageUrl || '');
                            setQuickImageError('');
                          }}
                          title="Change / Add Photo"
                          className="p-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-xs transition-colors"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Product Card Details */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-1 text-[10px] font-mono text-stone-400">
                        <span>{p.code}</span>
                        <span>{p.sku}</span>
                      </div>

                      <h3 className="font-bold text-stone-900 text-sm leading-snug line-clamp-2">
                        {p.name}
                      </h3>

                      {p.brand && (
                        <p className="text-xs text-stone-500 font-medium">
                          Brand: <span className="text-stone-700 font-semibold">{p.brand}</span>
                        </p>
                      )}

                      {/* Key Custom Fields */}
                      {p.customFields && Object.keys(p.customFields).length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {Object.entries(p.customFields)
                            .slice(0, 3)
                            .map(([k, v]) => (
                              <span
                                key={k}
                                className="bg-amber-50 text-amber-900 border border-amber-200/50 px-1.5 py-0.5 rounded text-[10px]"
                              >
                                <strong>{k}:</strong> {String(v)}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Prices & Actions */}
                  <div className="p-4 pt-2 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-stone-400 font-medium">Selling Price</div>
                      <div className="font-mono font-black text-sm text-stone-900">
                        {currentTenant.currencySymbol}{p.sellingPrice.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${p.name}?`)) deleteProduct(p.id);
                        }}
                        className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Lightbox / Full Image Preview Modal */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-700">
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">{previewProduct.name}</h3>
                <p className="text-xs text-stone-400 font-mono">
                  {previewProduct.code} • {previewProduct.categoryName} • {currentTenant.currencySymbol}{previewProduct.sellingPrice.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setPreviewProduct(null)}
                className="p-1 text-stone-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-stone-950 flex items-center justify-center max-h-[60vh] overflow-hidden">
              {previewProduct.imageUrl ? (
                <img
                  src={previewProduct.imageUrl}
                  alt={previewProduct.name}
                  className="max-h-[55vh] max-w-full object-contain rounded-lg"
                />
              ) : (
                <div className="text-stone-500 py-12">No Image Available</div>
              )}
            </div>

            <div className="p-4 bg-stone-900 text-stone-300 flex items-center justify-between text-xs">
              <span>Format: JPEG / JPG Image</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const p = previewProduct;
                    setPreviewProduct(null);
                    setQuickImageProduct(p);
                    setQuickImageUrl(p.imageUrl || '');
                    setQuickImageError('');
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors flex items-center space-x-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Replace Photo</span>
                </button>
                <button
                  onClick={() => setPreviewProduct(null)}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Image Manager Modal */}
      {quickImageProduct && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200">
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-stone-900 text-sm">Product Photo Manager</h3>
                <p className="text-xs text-stone-500 truncate max-w-xs">{quickImageProduct.name}</p>
              </div>
              <button
                onClick={() => setQuickImageProduct(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Image Preview & Dropzone */}
              <div className="flex flex-col items-center justify-center">
                {quickImageUrl ? (
                  <div className="relative w-full h-48 rounded-xl border border-stone-200 overflow-hidden bg-stone-100 flex items-center justify-center group/preview">
                    <img
                      src={quickImageUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>JPG Ready</span>
                    </div>
                    <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <button
                        type="button"
                        onClick={() => quickFileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-800 font-bold rounded-lg shadow-sm"
                      >
                        Change JPG
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickImageUrl('')}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => quickFileInputRef.current?.click()}
                    className="w-full h-44 rounded-xl border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50/80 cursor-pointer transition-colors flex flex-col items-center justify-center p-4 text-center group"
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mb-2 group-hover:scale-110 transition-transform">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div className="font-bold text-stone-800 text-sm">
                      {isProcessingQuickImage ? 'Optimizing JPG Image...' : 'Click or Drop JPG Image Here'}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-1">
                      Supports .jpg, .jpeg, .png (Auto-converts to high-res JPG)
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  ref={quickFileInputRef}
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleQuickFileUpload(e.target.files[0]);
                  }}
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png,image/webp"
                  className="hidden"
                />
              </div>

              {quickImageError && (
                <div className="p-2.5 bg-rose-50 text-rose-700 rounded-lg text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{quickImageError}</span>
                </div>
              )}

              {/* Paste URL directly */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Or Paste Image URL (JPG):</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={quickImageUrl}
                    onChange={(e) => setQuickImageUrl(e.target.value)}
                    placeholder="https://example.com/item.jpg"
                    className="flex-1 px-3 py-2 border border-stone-300 rounded-lg font-mono text-xs"
                  />
                  {quickImageUrl && (
                    <button
                      type="button"
                      onClick={() => setQuickImageUrl('')}
                      className="px-2.5 py-2 text-stone-400 hover:text-rose-600 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sample Presets */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-semibold text-stone-500 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Quick Industry Presets ({currentTenant.industry}):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sampleImages.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setQuickImageUrl(s.url);
                        setQuickImageError('');
                      }}
                      className="px-2 py-1 bg-stone-100 hover:bg-amber-100 hover:text-amber-900 border border-stone-200 rounded-lg text-[10px] font-medium transition-colors"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setQuickImageProduct(null)}
                className="px-4 py-2 border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuickImage}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-xs transition-colors"
              >
                Save Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-stone-200 max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-stone-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Tenant: <span className="font-semibold text-stone-800">{currentTenant.name}</span> ({currentTenant.industry})
                </p>
              </div>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Product Photo / JPG Image Section */}
              <div className="space-y-3 bg-stone-50/70 p-4 rounded-xl border border-stone-200">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <div className="flex items-center space-x-1.5">
                    <Camera className="w-4 h-4 text-amber-600" />
                    <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                      Product Image (JPG / JPEG / PNG)
                    </h4>
                  </div>
                  <span className="text-[10px] text-stone-400 font-medium">
                    Optimized for catalog & POS display
                  </span>
                </div>

                {imageError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{imageError}</span>
                  </div>
                )}

                {imageUrl ? (
                  /* Image has been uploaded or specified */
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-stone-200">
                    <div className="relative w-32 h-32 rounded-lg border border-stone-200 overflow-hidden bg-stone-100 shrink-0">
                      <img
                        src={imageUrl}
                        alt="Product Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 right-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                        JPG
                      </div>
                    </div>

                    <div className="flex-1 space-y-2 text-left">
                      <div className="flex items-center space-x-2 text-emerald-700 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Product JPG Photo Ready</span>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        This image will be displayed in the product catalog, POS terminal register, and printed receipts.
                      </p>
                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-lg transition-colors flex items-center space-x-1"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Change JPG File</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-lg transition-colors"
                        >
                          Remove Photo
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* No image uploaded yet - Show Drag & Drop Zone + Tabs */
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 border-b border-stone-200">
                      <button
                        type="button"
                        onClick={() => setImageTab('upload')}
                        className={`pb-1.5 text-xs font-bold border-b-2 transition-colors ${
                          imageTab === 'upload'
                            ? 'border-amber-600 text-amber-700'
                            : 'border-transparent text-stone-400 hover:text-stone-600'
                        }`}
                      >
                        Upload JPG File
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageTab('samples')}
                        className={`pb-1.5 text-xs font-bold border-b-2 transition-colors ${
                          imageTab === 'samples'
                            ? 'border-amber-600 text-amber-700'
                            : 'border-transparent text-stone-400 hover:text-stone-600'
                        }`}
                      >
                        Industry Presets ({currentTenant.industry})
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageTab('url')}
                        className={`pb-1.5 text-xs font-bold border-b-2 transition-colors ${
                          imageTab === 'url'
                            ? 'border-amber-600 text-amber-700'
                            : 'border-transparent text-stone-400 hover:text-stone-600'
                        }`}
                      >
                        Web URL Link
                      </button>
                    </div>

                    {imageTab === 'upload' && (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          if (e.dataTransfer.files?.[0]) {
                            handleFileUpload(e.dataTransfer.files[0]);
                          }
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                          isDragging
                            ? 'border-amber-600 bg-amber-100/50 scale-[1.01]'
                            : 'border-stone-300 hover:border-amber-500 bg-white hover:bg-amber-50/30'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200/60 mx-auto flex items-center justify-center text-amber-700 mb-2">
                          <Camera className="w-6 h-6" />
                        </div>
                        <div className="font-bold text-stone-800 text-sm">
                          {isProcessingImage ? 'Optimizing Image...' : 'Click to Browse JPG or Drag & Drop Here'}
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1">
                          Accepts JPG, JPEG, and PNG files up to 5MB
                        </p>
                        <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 bg-stone-100 text-stone-700 rounded-lg text-[11px] font-semibold">
                          <Upload className="w-3.5 h-3.5 text-amber-600" />
                          <span>Select JPG Image</span>
                        </div>
                      </div>
                    )}

                    {imageTab === 'samples' && (
                      <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-2">
                        <p className="text-[11px] text-stone-600 font-medium">
                          Click any ready-to-use sample photo for {currentTenant.industry}:
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {sampleImages.map((sample, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setImageUrl(sample.url);
                                setImageError('');
                              }}
                              className="group flex flex-col items-center p-2 rounded-xl border border-stone-200 hover:border-amber-500 hover:bg-amber-50/40 transition-all text-left"
                            >
                              <div className="w-full h-16 rounded-lg overflow-hidden bg-stone-100 mb-1.5 border border-stone-100">
                                <img
                                  src={sample.url}
                                  alt={sample.label}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <span className="text-[10px] font-bold text-stone-800 truncate w-full text-center">
                                {sample.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {imageTab === 'url' && (
                      <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-2">
                        <label className="block font-semibold text-stone-700">Enter External JPG Image URL:</label>
                        <input
                          type="url"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/photo-... or supplier JPG link"
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono text-xs"
                        />
                        <p className="text-[10px] text-stone-400">
                          Ensure the URL is a direct web link ending in .jpg, .jpeg, or an image service.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                  }}
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png,image/webp"
                  className="hidden"
                />
              </div>

              {/* Basic Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px] border-b pb-1">
                  General Product Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-stone-700 mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Front Ceramic Brake Pads / 18K Sapphire Ring"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Product Code</label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Barcode</label>
                    <input
                      type="text"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Category</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Brand / Maker</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Toyota / Moroccanoil / Asus"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px] border-b pb-1">
                  Pricing & Inventory Control
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Purchase Price</label>
                    <input
                      type="number"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Selling Price *</label>
                    <input
                      type="number"
                      required
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Current Stock</label>
                    <input
                      type="number"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Min Alert Qty</label>
                    <input
                      type="number"
                      value={minStock}
                      onChange={(e) => setMinStock(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Industry Custom Fields Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b pb-1">
                  <h4 className="font-bold text-amber-900 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Dynamic Custom Fields ({currentTenant.industry.toUpperCase()})</span>
                  </h4>
                  <span className="text-[10px] text-stone-400">
                    Engineered from Settings → Custom Fields
                  </span>
                </div>

                {customFields.length === 0 ? (
                  <div className="p-3 bg-stone-50 rounded-lg text-stone-500 text-center">
                    No custom fields configured for this business yet.{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setShowProductModal(false);
                        setActiveView('custom_fields');
                      }}
                      className="text-amber-700 font-semibold underline"
                    >
                      Add Custom Fields
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/40 p-4 rounded-xl border border-amber-200/60">
                    {customFields.map((cf) => {
                      const val = fieldValues[cf.name] ?? '';
                      return (
                        <div key={cf.id}>
                          <label className="block font-semibold text-stone-700 mb-1">
                            {cf.label} {cf.required && <span className="text-rose-500">*</span>}
                            {cf.unit && <span className="text-[10px] text-stone-500 font-normal"> ({cf.unit})</span>}
                          </label>

                          {cf.type === 'dropdown' && cf.options ? (
                            <select
                              value={val}
                              onChange={(e) =>
                                setFieldValues({ ...fieldValues, [cf.name]: e.target.value })
                              }
                              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg"
                            >
                              <option value="">Select {cf.label}...</option>
                              {cf.options.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : cf.type === 'checkbox' ? (
                            <label className="flex items-center space-x-2 py-2">
                              <input
                                type="checkbox"
                                checked={Boolean(val)}
                                onChange={(e) =>
                                  setFieldValues({ ...fieldValues, [cf.name]: e.target.checked })
                                }
                                className="rounded text-amber-600 focus:ring-amber-500"
                              />
                              <span className="text-stone-700">Yes / Enabled</span>
                            </label>
                          ) : (
                            <input
                              type={cf.type === 'number' || cf.type === 'decimal' || cf.type === 'weight' ? 'number' : 'text'}
                              step={cf.type === 'decimal' || cf.type === 'weight' ? '0.01' : '1'}
                              value={val}
                              onChange={(e) =>
                                setFieldValues({ ...fieldValues, [cf.name]: e.target.value })
                              }
                              placeholder={cf.placeholder || `Enter ${cf.label}`}
                              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-mono text-xs"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-stone-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-stone-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm">Manage Product Categories</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-stone-100 text-xs">
              {categories.map((c) => (
                <div key={c.id} className="py-2 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-stone-900">{c.name}</span>
                    <span className="text-[10px] text-stone-400 ml-2 font-mono">[{c.code}]</span>
                  </div>
                  <button
                    onClick={() => deleteCategory(c.id)}
                    className="text-stone-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-2 pt-2 border-t border-stone-100 text-xs">
              <div className="font-bold text-stone-700">Add New Category</div>
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Category Name (e.g. Transmission & Clutches)"
                className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
              />
              <input
                type="text"
                value={newCatCode}
                onChange={(e) => setNewCatCode(e.target.value)}
                placeholder="Category Code (e.g. TRN)"
                className="w-full px-3 py-1.5 border border-stone-300 rounded-lg uppercase"
              />
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 text-white rounded-lg font-bold text-xs"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
