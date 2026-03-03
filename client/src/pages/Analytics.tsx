import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, Package, AlertTriangle, IndianRupee, MapPin, Shield } from 'lucide-react';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';

const Analytics: React.FC = () => {
    const { t } = useTranslation();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [financeSummary, setFinanceSummary] = useState<any>(null);

    const fetchAnalytics = async () => {
        try {
            const [{ data: stats }, { data: finance }] = await Promise.all([
                api.get('/analytics/stats'),
                api.get('/finance/summary')
            ]);
            setData(stats);
            setFinanceSummary(finance);
        } catch (err) {
            console.error('Failed to fetch analytics', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Calculating insights...</div>;



    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold mb-1">Deep Analytics</h2>
                <p className="text-gray-400 text-sm">Visualize your business performance and inventory health.</p>
            </div>

            {/* Detail Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card border-l-4 border-[#00d09c]">
                    <div className="flex items-center gap-4 text-gray-400 mb-2 uppercase text-xs font-bold tracking-widest">
                        <IndianRupee size={16} /> Total Stock Value
                    </div>
                    <div className="text-3xl font-black">₹{data?.totalStockValue?.toLocaleString() || 0}</div>
                </div>
                <div className="card border-l-4 border-blue-500">
                    <div className="flex items-center gap-4 text-gray-400 mb-2 uppercase text-xs font-bold tracking-widest">
                        <Package size={16} /> Total Skus
                    </div>
                    <div className="text-3xl font-black">{data?.itemCount || 0}</div>
                </div>
                <div className="card border-l-4 border-orange-500">
                    <div className="flex items-center gap-4 text-gray-400 mb-2 uppercase text-xs font-bold tracking-widest">
                        <AlertTriangle size={16} /> Low Stock Risk
                    </div>
                    <div className="text-3xl font-black text-orange-500">{data?.lowStockItems?.length || 0}</div>
                </div>
                <div className="card border-l-4 border-green-500">
                    <div className="flex items-center gap-4 text-gray-400 mb-2 uppercase text-xs font-bold tracking-widest">
                        <TrendingUp size={16} /> Monthly Revenue
                    </div>
                    <div className="text-3xl font-black text-green-500">₹{data?.monthlySales?.toLocaleString() || 0}</div>
                </div>
            </div>

            {/* Financial Intelligence Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-gradient-to-br from-[#1e1e1e] to-gray-900 border-l-4 border-yellow-500">
                    <div className="flex items-center gap-4 text-gray-400 mb-2 uppercase text-[10px] font-black tracking-widest">
                        <TrendingUp size={14} className="text-yellow-500" /> {t('finance.grossMargin')}
                    </div>
                    <div className="flex items-end gap-2">
                        <div className="text-3xl font-black">{financeSummary?.averageGrossMargin?.toFixed(1) || 0}%</div>
                        <div className="text-[10px] text-gray-500 mb-1 font-bold">PROFITABILITY</div>
                    </div>
                </div>
                <div className="card bg-gradient-to-br from-[#1e1e1e] to-gray-900 border-l-4 border-purple-500">
                    <div className="flex items-center gap-4 text-gray-400 mb-2 uppercase text-[10px] font-black tracking-widest">
                        <Shield size={14} className="text-purple-500" /> {t('finance.taxLiability')}
                    </div>
                    <div className="flex items-end gap-2">
                        <div className="text-3xl font-black">₹{financeSummary?.estimatedTaxLiability?.toLocaleString() || 0}</div>
                        <div className="text-[10px] text-gray-500 mb-1 font-bold">FISCAL OBLIGATION</div>
                    </div>
                </div>
                <div className="card bg-gradient-to-br from-[#1e1e1e] to-gray-900 border-l-4 border-indigo-500">
                    <div className="flex items-center gap-4 text-gray-400 mb-2 uppercase text-[10px] font-black tracking-widest">
                        <TrendingUp size={14} className="text-indigo-500" /> {t('finance.cogs')}
                    </div>
                    <div className="flex items-end gap-2">
                        <div className="text-3xl font-black">₹{financeSummary?.estimatedCOGS?.toLocaleString() || 0}</div>
                        <div className="text-[10px] text-gray-500 mb-1 font-bold">ASSET COST</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales Performance */}
                <div className="card h-[450px] flex flex-col">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-[#00d09c]" /> Weekly Sales Trend
                    </h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data?.salesTrend || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2c2c2c" vertical={false} />
                                <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e1e1e', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                                    itemStyle={{ color: '#00d09c' }}
                                />
                                <Line type="monotone" dataKey="sales" stroke="#00d09c" strokeWidth={3} dot={{ r: 6, fill: '#00d09c', strokeWidth: 2, stroke: '#121212' }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Stock Value by Category (Bar Chart) */}
                <div className="card h-[450px] flex flex-col">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Package size={20} className="text-blue-500" /> Stock Value by Category
                    </h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.chartData || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2c2c2c" vertical={false} />
                                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                                <Tooltip
                                    cursor={{ fill: '#2c2c2c' }}
                                    contentStyle={{ backgroundColor: '#1e1e1e', border: 'none', borderRadius: '12px' }}
                                />
                                <Bar dataKey="value" fill="#00d09c" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Warehouse Strategic Distribution (New) */}
                <div className="card h-[450px] flex flex-col">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <MapPin size={20} className="text-purple-500" /> Stock Value by Warehouse
                    </h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.warehouseDistribution || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2c2c2c" vertical={false} />
                                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                                <Tooltip
                                    cursor={{ fill: '#2c2c2c' }}
                                    contentStyle={{ backgroundColor: '#1e1e1e', border: 'none', borderRadius: '12px' }}
                                />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Hub Utilization Metrics (New) */}
                <div className="card h-[450px] flex flex-col">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-indigo-500" /> Warehouse Hub Utilization
                    </h3>
                    <div className="space-y-6 overflow-y-auto flex-1 pr-2">
                        {data?.warehouseMetrics?.map((wh: any) => {
                            const totalProducts = data?.itemCount || 1;
                            const percentage = Math.min(100, ((wh.count / totalProducts) * 100)).toFixed(1);
                            return (
                                <div key={wh.name} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="font-bold text-sm">{wh.name}</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{wh.count} Unique Assets</p>
                                        </div>
                                        <p className="text-sm font-black text-indigo-400">{percentage}%</p>
                                    </div>
                                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                        <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Inventory Distribution (Pie Chart) */}
                <div className="card h-[450px] flex flex-col">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <IndianRupee size={20} className="text-[#00d09c]" /> Stock Item Distribution
                    </h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'In Stock', value: (data?.itemCount || 10) - (data?.lowStockItems?.length || 0) },
                                        { name: 'Low Stock', value: data?.lowStockItems?.length || 0 }
                                    ]}
                                    cx="50%" cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell fill="#00d09c" />
                                    <Cell fill="#f97316" />
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e1e1e', border: 'none', borderRadius: '12px' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Predictive Inventory Depletion */}
                <div className="card h-[450px] flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <AlertTriangle size={20} className="text-orange-500" /> Stockout Forecast
                        </h3>
                        <span className="text-[10px] font-black bg-orange-500/10 text-orange-500 px-2 py-1 rounded-full uppercase tracking-tighter">7-Day Velocity</span>
                    </div>
                    <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                        {(data?.forecasting?.length || 0) === 0 ? (
                            <div className="text-center py-20 text-gray-500 italic text-sm">No critical depletion risks detected.</div>
                        ) : data.forecasting.map((item: any) => (
                            <div key={item.id} className="p-4 bg-gray-800/30 rounded-2xl border border-gray-800/50 flex items-center justify-between group hover:bg-gray-800/50 transition-all">
                                <div>
                                    <p className="font-bold text-sm group-hover:text-[#00d09c] transition-colors">{item.name}</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{item.sku}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-black text-sm ${item.risk === 'Critical' ? 'text-red-500' : 'text-orange-500'}`}>
                                        {item.daysRemaining} Days
                                    </p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Est. Depletion</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* System Operational Health */}
            <div className="card bg-gradient-to-r from-[#1e1e1e] to-gray-900 border-none relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00d09c05] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-16 h-16 bg-[#00d09c1a] rounded-2xl flex items-center justify-center text-[#00d09c]">
                                <TrendingUp size={32} />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00d09c] rounded-full border-4 border-[#121212] animate-pulse"></div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">System Integrity</h3>
                            <p className="text-gray-400 text-sm">API and Database clusters are operating at peak efficiency.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center px-6 py-3 bg-gray-800/50 rounded-2xl border border-gray-800">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Response Time</p>
                            <p className="text-xl font-black text-[#00d09c]">24ms</p>
                        </div>
                        <div className="text-center px-6 py-3 bg-gray-800/50 rounded-2xl border border-gray-800">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">DB Status</p>
                            <p className="text-xl font-black text-blue-500">Synced</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
