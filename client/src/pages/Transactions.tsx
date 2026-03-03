import React, { useEffect, useState } from 'react';
import { History, ArrowUpRight, ArrowDownLeft, Calendar, Download, Search } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

const Transactions: React.FC = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderType, setOrderType] = useState<'IN' | 'OUT'>('IN');
    const [filterType, setFilterType] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('All time');
    const [formData, setFormData] = useState({
        productId: '',
        supplierId: '',
        customerName: '',
        quantity: 1,
        totalPrice: 0
    });

    const filteredTransactions = transactions.filter(tx => {
        const matchesSearch = tx.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'ALL' || tx.type === filterType;

        let matchesDate = true;
        if (dateFilter !== 'All time') {
            const txDate = new Date(tx.date);
            const now = new Date();
            if (dateFilter === 'Today') {
                matchesDate = txDate.toDateString() === now.toDateString();
            } else if (dateFilter === 'Last 7 Days') {
                const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
                matchesDate = txDate >= sevenDaysAgo;
            }
        }

        return matchesSearch && matchesType && matchesDate;
    });

    const fetchTransactions = async () => {
        try {
            const [{ data: txs }, { data: prods }, { data: sups }] = await Promise.all([
                api.get('/transactions'),
                api.get('/products'),
                api.get('/suppliers')
            ]);
            setTransactions(txs);
            setProducts(prods);
            setSuppliers(sups);
        } catch (err) {
            console.error('Failed to fetch transactions', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    // Auto-calculate total price
    useEffect(() => {
        if (formData.productId && formData.quantity) {
            const product = products.find(p => p.id === Number(formData.productId));
            if (product) {
                setFormData(prev => ({ ...prev, totalPrice: product.unitPrice * formData.quantity }));
            }
        }
    }, [formData.productId, formData.quantity, products]);

    const handleOpenModal = (type: 'IN' | 'OUT') => {
        setOrderType(type);
        setFormData({ productId: '', supplierId: '', customerName: '', quantity: 1, totalPrice: 0 });
        setIsModalOpen(true);
    };

    const handleExportCSV = () => {
        if (filteredTransactions.length === 0) return toast.error('No data to export');
        const headers = ['Date', 'Product', 'Type', 'Quantity', 'Total Price', 'Partner'];
        const rows = filteredTransactions.map(tx => [
            new Date(tx.date).toLocaleDateString(),
            tx.product?.name,
            tx.type === 'IN' ? 'Purchase' : 'Sale',
            tx.quantityChange,
            `₹${tx.totalPrice}`,
            tx.type === 'IN' ? tx.supplier?.name : tx.customerName
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `transactions_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Filtered report exported');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const endpoint = orderType === 'IN' ? '/transactions/purchase' : '/transactions/sale';
            const payload = {
                ...formData,
                productId: Number(formData.productId),
                supplierId: orderType === 'IN' ? Number(formData.supplierId) : undefined,
                customerName: orderType === 'OUT' ? formData.customerName : undefined,
            };
            await api.post(endpoint, payload);
            toast.success(orderType === 'IN' ? 'Stock purchased successfully' : 'Stock sold successfully');
            setIsModalOpen(false);
            fetchTransactions();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Operation failed');
            console.error('Operation failed', err);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold mb-1">Order History</h2>
                    <p className="text-gray-400 text-sm">View and track all your buy and sell transactions.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleExportCSV} className="p-3 bg-gray-800 text-gray-400 hover:text-white rounded-xl transition-all border border-gray-800 hover:border-gray-700">
                        <Download size={20} />
                    </button>
                    <button onClick={() => handleOpenModal('OUT')} className="btn-primary-outline text-red-500 border-red-500/20 hover:bg-red-500/10">Sell Order</button>
                    <button onClick={() => handleOpenModal('IN')} className="btn-primary-outline text-green-500 border-green-500/20 hover:bg-green-500/10">Buy Order</button>
                </div>
            </div>

            <div className="card flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by product or customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field w-full pl-12"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="input-field py-2 text-sm bg-gray-800 border-gray-700"
                    >
                        <option value="ALL">All Orders</option>
                        <option value="IN">Purchases</option>
                        <option value="OUT">Sales</option>
                    </select>
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="input-field py-2 text-sm bg-gray-800 border-gray-700"
                    >
                        <option value="All time">All time</option>
                        <option value="Today">Today</option>
                        <option value="Last 7 Days">Last 7 Days</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-800/50 animate-pulse rounded-2xl"></div>)
                ) : filteredTransactions.length === 0 ? (
                    <div className="card text-center py-20 text-gray-500">
                        <History size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-xl font-bold">No Records Found</p>
                        <p className="text-sm">Try adjusting your filters or search terms.</p>
                    </div>
                ) : filteredTransactions.map((tx) => (
                    <div key={tx.id} className="card flex items-center justify-between p-6 hover:bg-[#2c2c2c99] transition-all group">
                        <div className="flex items-center gap-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${tx.type === 'IN' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {tx.type === 'IN' ? <ArrowDownLeft size={28} /> : <ArrowUpRight size={28} />}
                            </div>
                            <div>
                                <h4 className="font-bold text-xl">{tx.product?.name}</h4>
                                <div className="flex items-center gap-6 mt-1 text-sm text-gray-500">
                                    <span className="flex items-center gap-2"><Calendar size={14} /> {new Date(tx.date).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px] p-1 px-2 bg-gray-800 rounded">{tx.type === 'IN' ? 'Buy' : 'Sell'}</span>
                                    {tx.type === 'OUT' && tx.customerName && <span className="flex items-center gap-2 italic">Client: {tx.customerName}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className={`text-2xl font-black ${tx.type === 'IN' ? 'text-green-500' : 'text-red-500'}`}>
                                {tx.type === 'IN' ? '+' : '-'}{Math.abs(tx.quantityChange)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 font-bold">₹{tx.totalPrice?.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={orderType === 'IN' ? 'New Buy Order' : 'New Sell Order'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Product</label>
                        <select
                            required value={formData.productId}
                            onChange={e => setFormData({ ...formData, productId: e.target.value })}
                            className="input-field w-full"
                        >
                            <option value="">Select Product</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockLevel})</option>)}
                        </select>
                    </div>

                    {orderType === 'IN' ? (
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Supplier</label>
                            <select
                                required value={formData.supplierId}
                                onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                                className="input-field w-full"
                            >
                                <option value="">Select Supplier</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Customer Name</label>
                            <input
                                type="text" required value={formData.customerName}
                                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                className="input-field w-full" placeholder="e.g. John Doe"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Quantity</label>
                            <input
                                type="number" required min="1" value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                className="input-field w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Total Price (₹)</label>
                            <input
                                type="number" required value={formData.totalPrice}
                                onChange={e => setFormData({ ...formData, totalPrice: Number(e.target.value) })}
                                className="input-field w-full"
                            />
                        </div>
                    </div>

                    <button type="submit" className={`w-full mt-6 py-3 rounded-xl font-bold text-black transition-all transform active:scale-95 ${orderType === 'IN' ? 'bg-[#00d09c] hover:bg-[#00b085]' : 'bg-red-500 hover:bg-red-600'}`}>
                        Place {orderType === 'IN' ? 'Buy' : 'Sell'} Order
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Transactions;
