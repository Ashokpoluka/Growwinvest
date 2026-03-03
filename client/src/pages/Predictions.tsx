import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertCircle, Calendar, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Predictions: React.FC = () => {
    const [insights, setInsights] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInsights = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/ai/predictions');
            setInsights(data);
        } catch (error) {
            toast.error('Failed to load AI insights');
        } finally {
            setLoading(false);
        }
    };

    const handleRestock = async (item: any) => {
        const loadingToast = toast.loading(`Initiating restock for ${item.name}...`);
        try {
            await api.post('/transactions/purchase', {
                productId: item.productId,
                supplierId: item.supplierId,
                quantity: item.suggestedOrderQuantity,
                totalPrice: item.suggestedOrderQuantity * item.unitPrice
            });
            toast.success(`Successfully restocked ${item.suggestedOrderQuantity} units of ${item.name}`, { id: loadingToast });
            fetchInsights(); // Refresh to update predictions
        } catch (error) {
            toast.error('Restock failed. Please try manual entry.', { id: loadingToast });
        }
    };

    useEffect(() => {
        fetchInsights();
    }, []);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'CRITICAL': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'HIGH': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold mb-1 flex items-center gap-3">
                        <Brain className="text-[#00d09c]" size={32} />
                        AI Stock Forecaster
                    </h2>
                    <p className="text-gray-400 text-sm">Demand-aware replenishment insights powered by Groww Intelligence.</p>
                </div>
                <button
                    onClick={fetchInsights}
                    disabled={loading}
                    className="flex items-center gap-2 bg-[#1e1e1e] hover:bg-gray-800 px-4 py-2 rounded-xl border border-gray-800 transition-all disabled:opacity-50"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    Refresh Analysis
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 rounded-3xl bg-gray-800/20 animate-pulse border border-gray-800" />
                    ))}
                </div>
            ) : insights.length === 0 ? (
                <div className="card p-12 text-center bg-gray-900/40 border-dashed border-gray-800">
                    <CheckCircle2 size={48} className="mx-auto mb-4 text-[#00d09c] opacity-20" />
                    <p className="text-gray-400 font-medium">Inventory Healthy. No replenishment required at this time.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {insights.map((item, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={item.sku}
                            className="group relative bg-[#1e1e1e] border border-gray-800 rounded-3xl p-6 hover:border-[#00d09c55] transition-all hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)]"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="font-bold text-lg mb-0.5 group-hover:text-[#00d09c] transition-colors">{item.name}</h3>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.sku}</span>
                                </div>
                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border ${getPriorityColor(item.priority)}`}>
                                    {item.priority}
                                </span>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Calendar size={14} />
                                        <span className="text-xs">Est. Stockout</span>
                                    </div>
                                    <span className={`text-sm font-bold ${item.predictedStockoutDays <= 7 ? 'text-red-500' : 'text-white'}`}>
                                        {item.predictedStockoutDays === 999 ? 'No Sales' : `${item.predictedStockoutDays} Days`}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <TrendingUp size={14} />
                                        <span className="text-xs">Suggest Quantity</span>
                                    </div>
                                    <span className="text-sm font-bold text-[#00d09c]">
                                        +{item.suggestedOrderQuantity} Units
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-900/80 rounded-2xl border border-gray-800 mb-6 group-hover:bg-[#121212] transition-colors">
                                <p className="text-[11px] text-gray-400 leading-relaxed italic">
                                    " {item.reasoning} "
                                </p>
                            </div>

                            <button
                                onClick={() => handleRestock(item)}
                                className="w-full py-3 bg-gray-800 hover:bg-[#00d09c] hover:text-[#121212] rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 group/btn"
                            >
                                Initiate Restock
                                <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}

            <div className="card bg-gradient-to-br from-[#00d09c05] to-transparent border-gray-800 p-8">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-[#00d09c1a] text-[#00d09c] rounded-2xl">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold">Optimization Intelligence</h4>
                        <p className="text-xs text-gray-500">How Groww AI models your supply chain efficiency.</p>
                    </div>
                </div>
                <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
                    Our forecasting model analyzes rolling 30-day transaction velocity, seasonal trends, and supplier lead times to predict stock exhaustion. Priority is assigned based on daily burn rates and proximity to critical thresholds.
                </p>
            </div>
        </div>
    );
};

export default Predictions;
