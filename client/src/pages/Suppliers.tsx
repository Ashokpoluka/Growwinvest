import React, { useEffect, useState } from 'react';
import { Truck, Plus, Trash2, Mail, Phone, Star, Edit2, Package } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

const Suppliers: React.FC = () => {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<any>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
    const [supplierProducts, setSupplierProducts] = useState<any[]>([]);
    const [isDrillDownOpen, setIsDrillDownOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', contact: '', email: '' });

    const fetchSuppliers = async () => {
        try {
            const { data } = await api.get('/suppliers');
            setSuppliers(data);
        } catch (err) {
            console.error('Failed to fetch suppliers', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewProducts = async (supplier: any) => {
        try {
            // Our backend /products doesn't currently filter by supplierId in the query,
            // so we fetch all and filter locally for a consistent Experience.
            const { data } = await api.get('/products');
            const filtered = data.filter((p: any) => p.supplierId === supplier.id);
            setSupplierProducts(filtered);
            setSelectedSupplier(supplier);
            setIsDrillDownOpen(true);
        } catch (err) {
            toast.error('Failed to load supplier products');
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleOpenModal = (supplier: any = null) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData({ name: supplier.name, contact: supplier.contact, email: supplier.email });
        } else {
            setEditingSupplier(null);
            setFormData({ name: '', contact: '', email: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingSupplier) {
                await api.put(`/suppliers/${editingSupplier.id}`, formData);
                toast.success('Supplier updated');
            } else {
                await api.post('/suppliers', formData);
                toast.success('Supplier added');
            }
            setIsModalOpen(false);
            setFormData({ name: '', contact: '', email: '' });
            fetchSuppliers();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this supplier?')) {
            try {
                await api.delete(`/suppliers/${id}`);
                toast.success('Supplier removed');
                fetchSuppliers();
            } catch (err) {
                toast.error('Could not delete supplier');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold mb-1">Asset Suppliers</h2>
                    <p className="text-gray-400 text-sm">Manage your vendor relationships and procurement sources.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
                    <Plus size={20} />
                    Add Supplier
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? (
                    [1, 2].map(i => <div key={i} className="h-44 bg-gray-800/50 animate-pulse rounded-2xl"></div>)
                ) : suppliers.map(sup => (
                    <div key={sup.id} className="card group hover:border-[#00d09c33] transition-all flex flex-col sm:flex-row gap-6">
                        <div className="w-16 h-16 bg-[#00d09c1a] text-[#00d09c] rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Truck size={32} />
                        </div>
                        <div className="flex-grow">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold">{sup.name}</h3>
                                <div className="flex items-center gap-1 mt-1 text-orange-500">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill={i <= 4 ? "currentColor" : "none"} />)}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenModal(sup)} className="text-gray-600 hover:text-[#00d09c] transition-colors">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(sup.id)} className="text-gray-600 hover:text-red-500 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2 mt-4">
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <Mail size={16} className="text-gray-500" />
                                    {sup.email}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <Phone size={16} className="text-gray-500" />
                                    {sup.contact}
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-800">
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest block">Total Assets Supplied</span>
                                    <span className="font-black text-[#00d09c] text-xl">{sup._count?.products || 0}</span>
                                </div>
                                <button
                                    onClick={() => handleViewProducts(sup)}
                                    className="text-xs font-bold bg-[#00d09c1a] text-[#00d09c] p-2 px-4 rounded-lg hover:bg-[#00d09c] hover:text-white transition-all"
                                >
                                    View Products
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isDrillDownOpen} onClose={() => setIsDrillDownOpen(false)} title={`Assets from ${selectedSupplier?.name}`}>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {supplierProducts.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 italic">No products registered from this supplier.</div>
                    ) : supplierProducts.map(prod => (
                        <div key={prod.id} className="card p-4 flex items-center justify-between border-gray-800/50">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-800 rounded-lg text-[#00d09c]">
                                    <Package size={20} />
                                </div>
                                <div>
                                    <p className="font-bold">{prod.name}</p>
                                    <p className="text-[10px] text-gray-500 uppercase font-black uppercase tracking-widest">SKU: {prod.sku}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold">{prod.stockLevel} units</p>
                                <p className="text-xs text-gray-500">₹{prod.unitPrice.toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Company Name</label>
                        <input
                            type="text" required value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="input-field w-full" placeholder="e.g. Acme Corp"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Email Address</label>
                        <input
                            type="email" required value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="input-field w-full" placeholder="vendor@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Contact Number</label>
                        <input
                            type="text" required value={formData.contact}
                            onChange={e => setFormData({ ...formData, contact: e.target.value })}
                            className="input-field w-full" placeholder="+1 (555) 000-0000"
                        />
                    </div>
                    <button type="submit" className="btn-primary w-full mt-6">
                        {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Suppliers;
