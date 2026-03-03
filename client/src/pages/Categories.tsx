import React, { useEffect, useState } from 'react';
import { Layers, Plus, Trash2, Edit2, Package } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

const Categories: React.FC = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDrillDownOpen, setIsDrillDownOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
    const [formData, setFormData] = useState({ name: '', description: '' });

    const handleViewProducts = async (category: any) => {
        try {
            const { data } = await api.get('/products');
            const filtered = data.filter((p: any) => p.categoryId === category.id);
            setCategoryProducts(filtered);
            setSelectedCategory(category);
            setIsDrillDownOpen(true);
        } catch (err) {
            toast.error('Failed to load category products');
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (err) {
            console.error('Failed to fetch categories', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpenModal = (category: any = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name, description: category.description || '' });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await api.put(`/categories/${editingCategory.id}`, formData);
                toast.success('Category updated');
            } else {
                await api.post('/categories', formData);
                toast.success('Category created');
            }
            setIsModalOpen(false);
            setFormData({ name: '', description: '' });
            fetchCategories();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this category?')) {
            try {
                await api.delete(`/categories/${id}`);
                toast.success('Category removed');
                fetchCategories();
            } catch (err) {
                toast.error('Could not delete category');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold mb-1">Asset Categories</h2>
                    <p className="text-gray-400 text-sm">Organize your inventory into meaningful groups.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
                    <Plus size={20} />
                    Add Category
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-800/50 animate-pulse rounded-2xl"></div>)
                ) : categories.map(cat => (
                    <div
                        key={cat.id}
                        onClick={() => handleViewProducts(cat)}
                        className="card group hover:border-[#00d09c33] cursor-pointer transition-all"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-[#00d09c1a] text-[#00d09c] rounded-xl">
                                <Layers size={24} />
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); handleOpenModal(cat); }} className="text-gray-600 hover:text-[#00d09c] transition-colors">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(cat.id); }} className="text-gray-600 hover:text-red-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold mb-1">{cat.name}</h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{cat.description || 'No description provided.'}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Products</span>
                            <span className="font-bold text-[#00d09c]">{cat._count?.products || 0}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Asset Drill-down Modal */}
            <Modal
                isOpen={isDrillDownOpen}
                onClose={() => setIsDrillDownOpen(false)}
                title={`${selectedCategory?.name} - Linked Assets`}
            >
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {categoryProducts.length === 0 ? (
                        <div className="text-center py-20 text-gray-500 italic">No products currently assigned to this category.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {categoryProducts.map(p => (
                                <div key={p.id} className="card p-4 flex items-center justify-between border-gray-800/50 bg-[#1e1e1e]/50">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-gray-800 rounded-xl text-[#00d09c]">
                                            <Package size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-200">{p.name}</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{p.sku}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-[#00d09c]">₹{p.unitPrice.toLocaleString()}</p>
                                        <p className={`text-[10px] font-bold ${p.stockLevel <= p.lowStockThreshold ? 'text-orange-500' : 'text-gray-500'}`}>
                                            Stock: {p.stockLevel}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCategory ? 'Edit Category' : 'New Category'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Category Name</label>
                        <input
                            type="text" required value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="input-field w-full" placeholder="e.g. Electronics"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="input-field w-full h-24 pt-2" placeholder="Brief details about this group..."
                        />
                    </div>
                    <button type="submit" className="btn-primary w-full mt-6">
                        {editingCategory ? 'Update Category' : 'Create Category'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Categories;
