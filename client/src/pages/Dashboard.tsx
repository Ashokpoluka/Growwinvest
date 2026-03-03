import React, { useEffect, useState } from 'react';
import { TrendingUp, Package, IndianRupee, AlertTriangle, ArrowRight, History, Plus, Truck, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

const MiniLineChart: React.FC<{ data: any[], color: string }> = ({ data, color }) => (
    <div className="h-10 w-24">
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <Line type="monotone" dataKey="val" stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    </div>
);

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [recentTxs, setRecentTxs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [{ data: s }, { data: t }] = await Promise.all([
                    api.get('/analytics/stats'),
                    api.get('/transactions')
                ]);
                setStats(s);
                setRecentTxs(t.slice(0, 5));
            } catch (err) {
                console.error('Dashboard fetch failed', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading your command center...</div>;

    const volatility = stats?.salesTrend?.length > 1
        ? Math.abs(stats.salesTrend[stats.salesTrend.length - 1].sales - stats.salesTrend[stats.salesTrend.length - 2].sales) > 1000
            ? 'High' : 'Stable'
        : 'Stable';

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black mb-2">Portfolio Overview</h2>
                    <p className="text-gray-400">Total Valuation: <span className="text-[#00d09c] font-bold">₹{stats?.totalStockValue?.toLocaleString() || 0}</span></p>
                </div>
                <button onClick={() => navigate('/analytics')} className="text-[#00d09c] text-sm font-bold flex items-center gap-1 hover:underline">
                    View Detailed Analytics <ArrowRight size={16} />
                </button>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card bg-gradient-to-br from-[#00d09c1a] to-transparent border-[#00d09c22] flex justify-between items-end">
                    <div>
                        <Package className="text-[#00d09c] mb-4" size={32} />
                        <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Portfolio Assets</h3>
                        <div className="text-4xl font-black">{stats?.itemCount || 0}</div>
                    </div>
                    <MiniLineChart
                        data={stats?.salesTrend?.map((s: any) => ({ val: s.sales })) || [{ val: 1 }, { val: 2 }, { val: 1.5 }]}
                        color="#00d09c"
                    />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card flex justify-between items-end">
                    <div>
                        {volatility === 'High' ? <TrendingUp className="text-blue-500 mb-4" size={32} /> : <TrendingDown className="text-gray-500 mb-4" size={32} />}
                        <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Market Volatility</h3>
                        <div className="text-4xl font-black">{volatility}</div>
                    </div>
                    <div className="text-[10px] font-bold text-gray-600 uppercase mb-2">Beta 1.0</div>
                </motion.div>

                <motion.div
                    onClick={() => navigate('/inventory', { state: { filter: 'Low' } })}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="card cursor-pointer hover:border-orange-500/30 transition-all"
                >
                    <AlertTriangle className={`${stats?.lowStock > 0 ? 'text-orange-500' : 'text-gray-600'} mb-4`} size={32} />
                    <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Low Stock Alerts</h3>
                    <div className="text-4xl font-black">{stats?.lowStock || 0}</div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <History size={20} className="text-[#00d09c]" /> Recent Activity
                    </h3>
                    <div className="card space-y-4">
                        {recentTxs.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                                <div>
                                    <div className="font-bold">{tx.product?.name}</div>
                                    <div className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()}</div>
                                </div>
                                <div className={`font-bold ${tx.type === 'IN' ? 'text-green-400' : 'text-red-400'}`}>
                                    {tx.type === 'IN' ? '+' : '-'}{Math.abs(tx.quantityChange)}
                                </div>
                            </div>
                        ))}
                        {recentTxs.length === 0 && <div className="text-gray-500 text-center py-4">No recent transactions.</div>}
                        <button onClick={() => navigate('/transactions')} className="w-full text-center text-sm text-gray-500 hover:text-white pt-2">View All Transactions</button>
                    </div>
                </div>

                {/* Fast Actions & Critical Stock */}
                <div className="space-y-8">
                    {/* Smart Restock Hub */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <TrendingUp size={20} className="text-[#00d09c]" /> Smart Restock Hub
                        </h3>
                        <div className="card bg-[#1e1e1e] border-none shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00d09c05] rotate-45 translate-x-12 -translate-y-12 transition-transform group-hover:scale-125"></div>
                            <div className="space-y-4 relative z-10">
                                {stats?.forecasting?.length > 0 ? stats.forecasting.slice(0, 3).map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-900/40 rounded-2xl border border-gray-800/50 hover:border-[#00d09c33] transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-[#00d09c]">
                                                <AlertTriangle size={14} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-xs">{item.name}</div>
                                                <div className="text-[10px] text-gray-500 uppercase tracking-tighter">Velocity: {item.avgDailySales}/day</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-black text-xs ${item.daysRemaining <= 7 ? 'text-red-500' : 'text-orange-500'}`}>
                                                {item.daysRemaining}d left
                                            </div>
                                            <button className="text-[10px] font-bold text-[#00d09c] uppercase hover:underline">Restock</button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 text-gray-500 italic text-sm">Predicting market patterns...</div>
                                )}
                                <div className="pt-2">
                                    <button
                                        onClick={() => navigate('/analytics')}
                                        className="w-full bg-[#00d09c1a] text-[#00d09c] py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#00d09c2a] transition-all"
                                    >
                                        View Velocity Reports
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Critical Stock */}
                    {stats?.lowStock > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold flex items-center gap-2 text-orange-500">
                                <AlertTriangle size={20} /> Critical Stock
                            </h3>
                            <div className="card border-orange-500/10 bg-orange-500/5">
                                <div className="space-y-3">
                                    {stats.lowStockItems?.slice(0, 3).map((item: any) => (
                                        <div key={item.id} className="flex items-center justify-between">
                                            <div>
                                                <div className="font-bold text-sm">{item.name}</div>
                                                <div className="text-xs text-gray-500">SKU: {item.sku}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-orange-500 font-bold text-sm">{item.stockLevel} left</div>
                                                <div className="text-[10px] text-gray-600 uppercase">Limit: {item.lowStockThreshold}</div>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => navigate('/inventory', { state: { filter: 'Low' } })}
                                        className="w-full text-center text-xs text-orange-500/70 hover:text-orange-500 font-bold pt-2 uppercase tracking-widest"
                                    >
                                        Restock All Assets
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Fast Actions & Market Leaders */}
                    <div className="space-y-8">
                        {/* Market Leaders */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <TrendingUp size={20} className="text-[#00d09c]" /> Market Leaders
                            </h3>
                            <div className="card space-y-4">
                                {stats?.topProducts?.length > 0 ? stats.topProducts.map((p: any) => (
                                    <div key={p.id} className="flex items-center justify-between group cursor-pointer" onClick={() => navigate('/inventory', { state: { highlightId: p.id } })}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-[#00d09c] group-hover:bg-[#00d09c] group-hover:text-black transition-all">
                                                <Package size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm group-hover:text-[#00d09c] transition-colors">{p.name}</div>
                                                <div className="text-[10px] text-gray-500 font-bold uppercase">{p.category?.name}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-black text-sm">{p.totalSold} Units</div>
                                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total Sales</div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-gray-500 text-sm italic">No sales data recorded yet.</div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <IndianRupee size={20} className="text-[#00d09c]" /> Fast Actions
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => navigate('/inventory')} className="card text-center hover:bg-gray-800 transition-all p-6 group">
                                    <Plus className="mx-auto mb-2 text-gray-500 group-hover:text-[#00d09c]" size={24} />
                                    <div className="font-bold text-sm">Add Item</div>
                                </button>
                                <button onClick={() => navigate('/suppliers')} className="card text-center hover:bg-gray-800 transition-all p-6 group">
                                    <Truck className="mx-auto mb-2 text-gray-500 group-hover:text-[#00d09c]" size={24} />
                                    <div className="font-bold text-sm">Vendors</div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
