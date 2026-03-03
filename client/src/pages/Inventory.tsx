import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, AlertCircle, Download, History as HistoryIcon, ArrowUpRight, ArrowDownLeft, Camera, MapPin, Package, TrendingUp, Sliders, XCircle } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/ui/Modal';
import ScannerModal from '../components/ScannerModal';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Inventory: React.FC = () => {
    const { user: authUser } = useAuth();
    const location = useLocation();
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isHistOpen, setIsHistOpen] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [viewProduct, setViewProduct] = useState<any>(null);
    const [productHistory, setProductHistory] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [highlightId, setHighlightId] = useState<number | null>(location.state?.highlightId || null);
    const [formData, setFormData] = useState({
        name: '', sku: '', categoryId: '', supplierId: '', warehouseId: '', unitPrice: 0, baseCost: 0, taxRate: 0, stockLevel: 0, lowStockThreshold: 5
    });
    const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || '');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterWarehouse, setFilterWarehouse] = useState('All');
    const [filterStatus, setFilterStatus] = useState(location.state?.filter || 'All');
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');
    const [minStock, setMinStock] = useState<string>('');
    const [maxStock, setMaxStock] = useState<string>('');

    const handleViewHistory = async (product: any) => {
        try {
            const { data } = await api.get('/transactions');
            const history = data.filter((tx: any) => tx.productId === product.id);
            setProductHistory(history.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setViewProduct(product);
            setIsHistOpen(true);
        } catch (err) {
            toast.error('Failed to load asset history');
        }
    };

    useEffect(() => {
        if (location.state?.searchTerm !== undefined) {
            setSearchTerm(location.state.searchTerm);
        }
        if (location.state?.filter) {
            setFilterStatus(location.state.filter);
        }
        if (location.state?.highlightId) {
            setHighlightId(location.state.highlightId);
            const timer = setTimeout(() => setHighlightId(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [location.state]);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (err) {
            console.error('Failed to fetch products', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMeta = async () => {
        try {
            const [cats, sups, whs] = await Promise.all([
                api.get('/meta/categories'),
                api.get('/meta/suppliers'),
                api.get('/warehouses')
            ]);
            setCategories(cats.data);
            setSuppliers(sups.data);
            setWarehouses(whs.data);
        } catch (err) {
            console.error('Failed to fetch meta data', err);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchMeta();
    }, []);

    const toggleSelection = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBatchDelete = async () => {
        if (confirm(`Delete ${selectedIds.length} selected items?`)) {
            try {
                await api.post('/products/batch-delete', { ids: selectedIds });
                toast.success('Batch deletion successful');
                setSelectedIds([]);
                fetchProducts();
            } catch (err) {
                toast.error('Batch deletion failed');
            }
        }
    };

    const handleOpenModal = (product: any = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                sku: product.sku,
                categoryId: product.category.id,
                supplierId: product.supplier.id,
                warehouseId: product.warehouseId || '',
                unitPrice: product.unitPrice,
                baseCost: product.baseCost || 0,
                taxRate: product.taxRate || 0,
                stockLevel: product.stockLevel,
                lowStockThreshold: product.lowStockThreshold
            });
        } else {
            setEditingProduct(null);
            setFormData({ name: '', sku: '', categoryId: '', supplierId: '', warehouseId: '', unitPrice: 0, baseCost: 0, taxRate: 0, stockLevel: 0, lowStockThreshold: 5 });
        }
        setIsModalOpen(true);
    };

    const handleViewProduct = (product: any) => {
        setViewProduct(product);
        setIsViewOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                categoryId: Number(formData.categoryId),
                supplierId: Number(formData.supplierId),
                warehouseId: formData.warehouseId ? Number(formData.warehouseId) : null
            };
            if (editingProduct) {
                await api.put(`/products/${editingProduct.id}`, payload);
                toast.success('Asset updated successfully');
            } else {
                await api.post('/products', payload);
                toast.success('New asset created');
            }
            setIsModalOpen(false);
            fetchProducts();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${id}`);
                toast.success('Asset removed');
                fetchProducts();
            } catch (err: any) {
                toast.error('Failed to delete asset');
            }
        }
    };

    const handleScanSuccess = (sku: string) => {
        setSearchTerm(sku);
        setIsScannerOpen(false);
        toast.success(`Asset Identified: ${sku}`);
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || p.category.name === filterCategory;
        const matchesWarehouse = filterWarehouse === 'All' || p.warehouse?.name === filterWarehouse;
        const isLow = p.stockLevel <= p.lowStockThreshold;
        const matchesStatus = filterStatus === 'All' ||
            (filterStatus === 'Low' && isLow) ||
            (filterStatus === 'In Stock' && !isLow);

        const priceNum = Number(p.unitPrice);
        const stockNum = Number(p.stockLevel);

        const matchesMinPrice = minPrice === '' || priceNum >= Number(minPrice);
        const matchesMaxPrice = maxPrice === '' || priceNum <= Number(maxPrice);
        const matchesMinStock = minStock === '' || stockNum >= Number(minStock);
        const matchesMaxStock = maxStock === '' || stockNum <= Number(maxStock);

        return matchesSearch && matchesCategory && matchesStatus && matchesWarehouse &&
            matchesMinPrice && matchesMaxPrice && matchesMinStock && matchesMaxStock;
    });

    const handleExport = () => {
        if (filteredProducts.length === 0) return toast.error('No data to export');
        const headers = ['Name', 'SKU', 'Category', 'Warehouse', 'Stock Level', 'Price', 'Supplier'];
        const csvContent = [
            headers.join(','),
            ...filteredProducts.map(p => [
                `"${p.name}"`, `"${p.sku}"`, `"${p.category.name}"`, `"${p.warehouse?.name || 'Unassigned'}"`,
                p.stockLevel, p.unitPrice, `"${p.supplier.name}"`
            ].join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', `inventory_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
        toast.success('Inventory report exported');
    };

    const handleExportPDF = () => {
        if (filteredProducts.length === 0) return toast.error('No data to export');
        const doc = new jsPDF() as any;
        doc.setFontSize(22);
        doc.setTextColor(0, 208, 156);
        doc.text('Groww Inventory Enterprise', 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
        doc.text(`Total Assets: ${filteredProducts.length}`, 14, 33);
        const tableData = filteredProducts.map(p => [
            p.name, p.sku, p.category.name, p.warehouse?.name || '---', p.stockLevel,
            `Rs. ${p.unitPrice.toLocaleString()}`, p.supplier.name
        ]);
        doc.autoTable({
            startY: 40,
            head: [['Product Name', 'SKU', 'Category', 'Warehouse', 'Stock', 'Price', 'Supplier']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillStyle: 'dark', fillColor: [0, 208, 156], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [240, 240, 240] },
            margin: { top: 40 }
        });
        doc.save(`inventory_report_${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('Professional PDF report generated');
    };

    const totalValue = filteredProducts.reduce((sum, p) => sum + (p.unitPrice * p.stockLevel), 0);
    const lowStockCount = filteredProducts.filter(p => p.stockLevel <= p.lowStockThreshold).length;

    return (
        <div className="relative pb-24 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold mb-1">Stock Assets</h2>
                    <p className="text-gray-400 text-sm font-medium">Manage your inventory and track stock levels in real-time.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleExport} className="p-3 bg-gray-800 text-gray-400 hover:text-white rounded-xl transition-all border border-gray-800 hover:border-gray-700" title="Export CSV">
                        <Download size={20} />
                    </button>
                    <button onClick={handleExportPDF} className="p-3 bg-[#00d09c10] text-[#00d09c] hover:bg-[#00d09c20] rounded-xl transition-all border border-[#00d09c20] font-black text-xs uppercase tracking-widest px-4" title="Export PDF">
                        PDF Report
                    </button>
                    <button onClick={() => setIsScannerOpen(true)} className="p-3 bg-gray-800 text-blue-500 hover:bg-gray-700 rounded-xl transition-all border border-gray-800 flex items-center gap-2 px-4">
                        <Camera size={20} />
                        <span className="text-xs font-black uppercase tracking-widest">Scan</span>
                    </button>
                    <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl shadow-[0_8px_20px_-4px_rgba(0,208,156,0.3)]">
                        <Plus size={20} />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Tactical Insights Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-[#1e1e1e] border-gray-800 p-6 flex items-center gap-6 group hover:border-[#00d09c33] transition-all">
                    <div className="p-4 bg-gray-900 rounded-[20px] text-[#00d09c] shadow-inner border border-gray-800">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Assets</p>
                        <p className="text-2xl font-black">{filteredProducts.length}</p>
                    </div>
                </div>
                <div className="card bg-[#1e1e1e] border-gray-800 p-6 flex items-center gap-6 group hover:border-orange-500/33 transition-all">
                    <div className="p-4 bg-gray-900 rounded-[20px] text-orange-500 shadow-inner border border-gray-800">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Restock Required</p>
                        <p className="text-2xl font-black text-orange-500">{lowStockCount}</p>
                    </div>
                </div>
                <div className="card bg-[#1e1e1e] border-gray-800 p-6 flex items-center gap-6 group hover:border-blue-500/33 transition-all">
                    <div className="p-4 bg-gray-900 rounded-[20px] text-blue-500 shadow-inner border border-gray-800">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Portfolio Valuation</p>
                        <p className="text-2xl font-black text-blue-400">₹{totalValue.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="card mb-8">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Filter assets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#2c2c2c] border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-[#00d09c] outline-none"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                            className={`p-2 rounded-lg transition-all border ${isFilterPanelOpen ? 'bg-[#00d09c10] border-[#00d09c] text-[#00d09c]' : 'bg-[#2c2c2c] border-transparent text-gray-400'}`}
                            title="Advanced Filters"
                        >
                            <Sliders size={18} />
                        </button>
                        <select value={filterWarehouse} onChange={(e) => setFilterWarehouse(e.target.value)} className="bg-[#2c2c2c] border-none rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-[#00d09c]">
                            <option value="All">All Warehouses</option>
                            {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                        </select>
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-[#2c2c2c] border-none rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-[#00d09c]">
                            <option value="All">All Categories</option>
                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-[#2c2c2c] border-none rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-[#00d09c]">
                            <option value="All">All Status</option>
                            <option value="In Stock">In Stock</option>
                            <option value="Low">Low Stock</option>
                        </select>
                    </div>
                </div>

                {isFilterPanelOpen && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 mb-6 bg-gray-900/40 rounded-2xl border border-gray-800 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 text-[8px]">Min Price (₹)</label>
                            <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="0" className="w-full bg-[#2c2c2c] border-none rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#00d09c]" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 text-[8px]">Max Price (₹)</label>
                            <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Any" className="w-full bg-[#2c2c2c] border-none rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#00d09c]" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 text-[8px]">Min Stock</label>
                            <input type="number" value={minStock} onChange={e => setMinStock(e.target.value)} placeholder="0" className="w-full bg-[#2c2c2c] border-none rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#00d09c]" />
                        </div>
                        <div className="space-y-1 flex items-end gap-2">
                            <div className="flex-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 text-[8px]">Max Stock</label>
                                <input type="number" value={maxStock} onChange={e => setMaxStock(e.target.value)} placeholder="Any" className="w-full bg-[#2c2c2c] border-none rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#00d09c]" />
                            </div>
                            <button
                                onClick={() => { setMinPrice(''); setMaxPrice(''); setMinStock(''); setMaxStock(''); }}
                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                title="Reset Advanced Filters"
                            >
                                <XCircle size={18} />
                            </button>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-800 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                <th className="pb-4 w-10">
                                    <input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? filteredProducts.map(p => p.id) : [])} checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0} className="rounded border-gray-700 bg-gray-800 text-[#00d09c] h-4 w-4" />
                                </th>
                                <th className="pb-4">Asset Identification</th>
                                <th className="pb-4">Category</th>
                                <th className="pb-4">Location</th>
                                <th className="pb-4">Holdings</th>
                                <th className="pb-4">Market Price</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/40">
                            {loading ? (
                                [1, 2, 3].map(i => <tr key={i} className="animate-pulse"><td colSpan={8} className="py-8 h-12 bg-gray-800/10 mb-2"></td></tr>)
                            ) : filteredProducts.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-20 text-gray-500 font-medium italic underline decoration-gray-800 underline-offset-8">Zero analytical results detected.</td></tr>
                            ) : filteredProducts.map((product) => (
                                <tr key={product.id} className={`group hover:bg-gray-800/30 transition-all ${highlightId === product.id ? 'bg-[#00d09c11] border-l-2 border-[#00d09c]' : ''}`}>
                                    <td className="py-5"><input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleSelection(product.id)} className="rounded border-gray-700 bg-gray-800 text-[#00d09c] h-4 w-4" /></td>
                                    <td onClick={() => handleViewProduct(product)} className="py-5 cursor-pointer">
                                        <div className="font-bold text-gray-200 group-hover:text-[#00d09c] transition-colors">{product.name}</div>
                                        <div className="text-[10px] text-gray-500 font-mono tracking-widest">{product.sku}</div>
                                    </td>
                                    <td className="py-5 text-gray-400 text-sm">{product.category.name}</td>
                                    <td className="py-5">
                                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                                            <MapPin size={12} className="text-[#00d09c] opacity-50" />
                                            {product.warehouse?.name || <span className="text-orange-500 opacity-50 italic">Unassigned</span>}
                                        </div>
                                    </td>
                                    <td className="py-5 font-black text-gray-200">{product.stockLevel}</td>
                                    <td className="py-5 font-black text-white">₹{product.unitPrice.toLocaleString()}</td>
                                    <td className="py-5">
                                        {product.stockLevel <= product.lowStockThreshold ? (
                                            <span className="flex items-center gap-1.5 text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-orange-500/20"><AlertCircle size={14} /> Critical</span>
                                        ) : (
                                            <span className="text-[#00d09c] bg-[#00d09c10] px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-[#00d09c20]">Healthy</span>
                                        )}
                                    </td>
                                    <td className="py-5 text-right">
                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            <button onClick={() => handleViewHistory(product)} className="text-gray-500 hover:text-orange-500 transition-colors"><HistoryIcon size={18} /></button>
                                            <button onClick={() => handleOpenModal(product)} className="text-gray-500 hover:text-[#00d09c] transition-colors"><Edit2 size={18} /></button>
                                            {authUser?.role === 'ADMIN' && (<button onClick={() => handleDelete(product.id)} className="text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedIds.length > 0 && (
                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-[#1e1e1e] border border-gray-800 px-8 py-4 rounded-full shadow-2xl flex items-center gap-8 animate-in slide-in-from-bottom-6 z-[60]">
                    <div className="text-sm font-medium">
                        <span className="text-[#00d09c] font-black">{selectedIds.length}</span> items selected
                    </div>
                    <div className="h-6 w-px bg-gray-800" />
                    <div className="flex items-center gap-4">
                        {authUser?.role === 'ADMIN' && (
                            <button onClick={handleBatchDelete} className="text-red-500 hover:text-red-400 font-bold text-sm flex items-center gap-2">
                                <Trash2 size={18} /> Delete Assets
                            </button>
                        )}
                        <button onClick={() => setSelectedIds([])} className="text-gray-400 hover:text-white text-sm font-medium">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Components */}
            <Modal isOpen={isHistOpen} onClose={() => setIsHistOpen(false)} title={`Asset Audit: ${viewProduct?.name}`}>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {productHistory.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 italic">No transaction history found for this asset.</div>
                    ) : productHistory.map(tx => (
                        <div key={tx.id} className="card p-4 flex items-center justify-between border-gray-800/50">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-xl ${tx.type === 'IN' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {tx.type === 'IN' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                </div>
                                <div>
                                    <p className="font-bold text-sm">{tx.type === 'IN' ? 'Restock / Purchase' : 'Sale / Outbound'}</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{new Date(tx.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-black ${tx.type === 'IN' ? 'text-green-500' : 'text-red-500'}`}>
                                    {tx.type === 'IN' ? '+' : '-'}{Math.abs(tx.quantityChange)}
                                </p>
                                <p className="text-[10px] text-gray-500 font-bold">₹{tx.totalPrice?.toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>
            <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Asset Insights">
                {viewProduct && (
                    <div className="space-y-6 pb-2">
                        <div className="flex justify-between items-start border-b border-gray-800 pb-6">
                            <div><h3 className="text-2xl font-bold mb-1">{viewProduct.name}</h3><p className="text-gray-500 font-mono text-xs uppercase tracking-[0.2em]">{viewProduct.sku}</p></div>
                            <div className="text-right"><div className="text-3xl font-black text-[#00d09c]">₹{viewProduct.unitPrice.toLocaleString()}</div><p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Valuation</p></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#2c2c2c] p-4 rounded-2xl border border-gray-800/50">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Holdings</p>
                                <div className="text-2xl font-black">{viewProduct.stockLevel} <span className="text-sm font-normal text-gray-500">U</span></div>
                            </div>
                            <div className="bg-[#2c2c2c] p-4 rounded-2xl border border-gray-800/50">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Global Location</p>
                                <div className="text-sm font-black flex items-center gap-2 text-blue-400 mt-2 truncate"><MapPin size={14} /> {viewProduct.warehouse?.name || 'Unassigned'}</div>
                            </div>
                            <div className="bg-[#2c2c2c] p-4 rounded-2xl border border-gray-800/50">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Base Asset Cost</p>
                                <div className="text-xl font-black text-yellow-500">₹{viewProduct.baseCost?.toLocaleString() || 0}</div>
                            </div>
                            <div className="bg-[#2c2c2c] p-4 rounded-2xl border border-gray-800/50">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Tax Configuration</p>
                                <div className="text-xl font-black text-purple-500">{viewProduct.taxRate || 0}% <span className="text-[8px] text-gray-500">VAT/GST</span></div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => { setIsViewOpen(false); handleViewHistory(viewProduct); }} className="flex-1 bg-gray-800 text-gray-300 py-4 text-[10px] uppercase font-black rounded-xl hover:bg-gray-700 transition-all border border-gray-700">Audit Trace</button>
                            <button onClick={() => { setIsViewOpen(false); handleOpenModal(viewProduct); }} className="flex-[2] btn-primary py-4 text-[10px] uppercase font-black">Configure Asset</button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? 'Modify Asset Profile' : 'Initialize Asset'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Asset Name</label><input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-field w-full py-4 rounded-2xl" /></div>
                        <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">SKU Identification</label><input type="text" required value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} className="input-field w-full py-4 rounded-2xl" /></div>
                        <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Market Price (₹)</label><input type="number" required value={formData.unitPrice} onChange={e => setFormData({ ...formData, unitPrice: Number(e.target.value) })} className="input-field w-full py-4 rounded-2xl" /></div>
                        <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Base Cost (₹)</label><input type="number" required value={formData.baseCost} onChange={e => setFormData({ ...formData, baseCost: Number(e.target.value) })} className="input-field w-full py-4 rounded-2xl border-yellow-500/20" /></div>
                        <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Tax Rate (%)</label><input type="number" required value={formData.taxRate} onChange={e => setFormData({ ...formData, taxRate: Number(e.target.value) })} className="input-field w-full py-4 rounded-2xl border-purple-500/20" /></div>
                        <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Category Stack</label><select required value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className="input-field w-full py-4 rounded-2xl"><option value="">Select Category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                        <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Supply Node</label><select required value={formData.supplierId} onChange={e => setFormData({ ...formData, supplierId: e.target.value })} className="input-field w-full py-4 rounded-2xl"><option value="">Select Supplier</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                        <div className="col-span-2 space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Assigned Warehouse Hub</label><select value={formData.warehouseId} onChange={e => setFormData({ ...formData, warehouseId: e.target.value })} className="input-field w-full py-4 rounded-2xl border-blue-500/20"><option value="">Unassigned Zone</option>{warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.location})</option>)}</select></div>
                        <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Initial Stock</label><input type="number" required value={formData.stockLevel} onChange={e => setFormData({ ...formData, stockLevel: Number(e.target.value) })} className="input-field w-full py-4 rounded-2xl" /></div>
                        <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Critical Limit</label><input type="number" required value={formData.lowStockThreshold} onChange={e => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })} className="input-field w-full py-4 rounded-2xl" /></div>
                    </div>
                    <button type="submit" className="btn-primary w-full py-4 rounded-2xl mt-6 font-black uppercase tracking-widest text-xs">{editingProduct ? 'Update Network Record' : 'Commit to Ledger'}</button>
                </form>
            </Modal>

            <ScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScanSuccess={handleScanSuccess} />
        </div>
    );
};

export default Inventory;
