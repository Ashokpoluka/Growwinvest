import React from 'react';
import { Shield, Clock, User as UserIcon, Activity, Database, Search } from 'lucide-react';
import api from '../api/axios';

const ActivityLog = () => {
    const [logs, setLogs] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');

    React.useEffect(() => {
        const fetchLogs = async () => {
            try {
                const { data } = await api.get('/audit');
                setLogs(data);
            } catch (err) {
                console.error('Failed to fetch audit logs');
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getActionColor = (action: string) => {
        if (action.includes('DELETE')) return 'text-red-500 bg-red-500/10';
        if (action.includes('CREATE')) return 'text-[#00d09c] bg-[#00d09c10]';
        if (action.includes('UPDATE')) return 'text-blue-500 bg-blue-500/10';
        return 'text-gray-400 bg-gray-400/10';
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <Shield className="text-[#00d09c]" size={32} />
                        System Activity Log
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">Enterprise-grade audit trail & governance</p>
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00d09c] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search audit trail..."
                        className="bg-[#1e1e1e] border border-gray-800 rounded-2xl py-3 pl-12 pr-6 outline-none focus:ring-2 focus:ring-[#00d09c33] focus:border-[#00d09c] transition-all w-full md:w-80"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-[#1e1e1e] border border-gray-800 rounded-[32px] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-800 bg-gray-900/30">
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Timestamp</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">User</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Action</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Resource</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8 h-16 bg-gray-800/10"></td>
                                    </tr>
                                ))
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                                        <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Activity className="opacity-20" size={32} />
                                        </div>
                                        <p className="font-bold text-lg">No audit records found</p>
                                        <p className="text-sm">Global system governance logs will appear here</p>
                                    </td>
                                </tr>
                            ) : filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-800/20 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3 text-sm font-medium text-gray-400">
                                            <Clock size={14} className="opacity-40" />
                                            {new Date(log.createdAt).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-[#00d09c]">
                                                <UserIcon size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-200">User #{log.userId}</div>
                                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{log.ipAddress || 'System'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${getActionColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <Database size={16} className="text-gray-500" />
                                            <div>
                                                <div className="text-sm font-bold text-gray-300">{log.entity}</div>
                                                <div className="text-[10px] text-gray-500 font-medium">Ref: {log.entityId || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="max-w-xs truncate text-xs text-gray-400 font-medium bg-gray-900/50 px-3 py-2 rounded-lg border border-gray-800">
                                            {log.details || 'No additional metadata'}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ActivityLog;
