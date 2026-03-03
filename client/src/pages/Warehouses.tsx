import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Package, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';

const Warehouses = () => {
    const { user } = useAuth();
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', location: '', description: '' });

    const fetchWarehouses = async () => {
        try {
            const { data } = await api.get('/warehouses');
            setWarehouses(data);
        } catch (err) {
            toast.error('Failed to load warehouse data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const handleOpenModal = (w?: any) => {
        if (w) {
            setEditingWarehouse(w);
            setFormData({ name: w.name, location: w.location, description: w.description || '' });
        } else {
            setEditingWarehouse(null);
            setFormData({ name: '', location: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingWarehouse) {
                await api.put(`/warehouses/${editingWarehouse.id}`, formData);
                toast.success('Warehouse profiles updated');
            } else {
                await api.post('/warehouses', formData);
                toast.success('New warehouse registered');
            }
            fetchWarehouses();
            setIsModalOpen(false);
        } catch (err) {
            toast.error('Operation failed at terminal');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you certain about decommissioning this storage facility?')) return;
        try {
            await api.delete(`/warehouses/${id}`);
            toast.success('Warehouse removed from network');
            fetchWarehouses();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Decommissioning failed');
        }
    };

    const filteredWarehouses = warehouses.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
                        <Truck className="text-[#00d09c]" size={40} />
                        Warehouse Network
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Manage physical asset clusters and storage zones</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group overflow-hidden rounded-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Filter locations..."
                            className="bg-[#1e1e1e] border border-gray-800 rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-1 focus:ring-[#00d09c] transition-all w-full md:w-64 text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {user?.role !== 'STAFF' && (
                        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2 px-6 py-4 rounded-2xl shadow-[0_8px_20px_-4px_rgba(0,208,156,0.3)]">
                            <Plus size={20} />
                            Register Facility
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-[#1e1e1e] rounded-[32px] animate-pulse"></div>
                    ))
                ) : filteredWarehouses.map((w) => (
                    <div key={w.id} className="card bg-[#1e1e1e] border-gray-800 hover:border-[#00d09c44] transition-all group overflow-hidden p-0">
                        <div className="p-8">
                            <div className="flex items-start justify-between mb-6">
                                <div className="p-4 bg-gray-900 rounded-[24px] text-[#00d09c] group-hover:scale-110 transition-transform shadow-inner border border-gray-800">
                                    <MapPin size={24} />
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center justify-end gap-1">
                                        <Package size={10} /> Active Assets
                                    </div>
                                    <div className="text-2xl font-black">{w._count?.products || 0}</div>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold mb-1 group-hover:text-[#00d09c] transition-colors">{w.name}</h3>
                            <p className="text-sm text-gray-500 font-medium mb-4">{w.location}</p>

                            {w.description && (
                                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-6 font-medium">
                                    {w.description}
                                </p>
                            )}
                        </div>

                        <div className="bg-gray-900/50 p-6 flex items-center justify-between border-t border-gray-800/40">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#00d09c]"></span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#00d09c]">Operational</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {user?.role !== 'STAFF' && (
                                    <>
                                        <button onClick={() => handleOpenModal(w)} className="p-2 text-gray-500 hover:text-white transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        {user?.role === 'ADMIN' && (
                                            <button onClick={() => handleDelete(w.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingWarehouse ? 'Edit Facility Profile' : 'Register New Facility'}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Facility Designation</label>
                        <input
                            required
                            className="bg-gray-900 border border-gray-800 rounded-2xl w-full p-4 focus:ring-1 focus:ring-[#00d09c] outline-none text-sm font-bold"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Mumbai North Hub"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Physical Location</label>
                        <input
                            required
                            className="bg-gray-900 border border-gray-800 rounded-2xl w-full p-4 focus:ring-1 focus:ring-[#00d09c] outline-none text-sm font-bold"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="e.g. Area 51, Industrial Zone"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Facility Description</label>
                        <textarea
                            className="bg-gray-900 border border-gray-800 rounded-2xl w-full p-4 focus:ring-1 focus:ring-[#00d09c] outline-none text-sm font-bold h-32"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Specify storage capacity or special handling zones..."
                        />
                    </div>
                    <button type="submit" className="btn-primary w-full py-4 text-sm rounded-2xl mt-4">
                        {editingWarehouse ? 'Update Facility' : 'Initialize Warehouse'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Warehouses;
