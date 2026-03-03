import React from 'react';
import { Users as UsersIcon, Shield, Mail, Calendar, UserCheck, Search, MoreVertical, ShieldAlert, UserCog } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const UserManagement = () => {
    const [users, setUsers] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (err) {
            toast.error('Failed to load user records');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId: number, newRole: string) => {
        try {
            await api.put(`/users/${userId}/role`, { role: newRole });
            toast.success(`User role updated to ${newRole}`);
            fetchUsers();
        } catch (err) {
            toast.error('Failed to update user role');
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'MANAGER': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default: return 'bg-[#00d09c10] text-[#00d09c] border-[#00d09c20]';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
                        <UsersIcon className="text-[#00d09c]" size={40} />
                        User Governance
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Manage enterprise access and security roles</p>
                </div>

                <div className="relative group overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00d09c22] to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00d09c] transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search identities..."
                        className="bg-[#1e1e1e] border border-gray-800 rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-[#00d09c33] focus:border-[#00d09c] transition-all w-full md:w-96 text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Users', value: users.length, icon: UsersIcon, color: 'text-blue-500' },
                    { label: 'Administrators', value: users.filter(u => u.role === 'ADMIN').length, icon: Shield, color: 'text-red-500' },
                    { label: 'Active Managers', value: users.filter(u => u.role === 'MANAGER').length, icon: UserCog, color: 'text-orange-500' },
                    { label: 'Internal Staff', value: users.filter(u => u.role === 'STAFF').length, icon: UserCheck, color: 'text-[#00d09c]' },
                ].map((stat, i) => (
                    <div key={i} className="card bg-[#1e1e1e] border-gray-800 hover:border-[#00d09c33] transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                <p className="text-3xl font-black">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl bg-gray-900 shadow-inner group-hover:scale-110 transition-transform ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-[#1e1e1e] border border-gray-800 rounded-[32px] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-800 bg-gray-900/30">
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">Identity</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">Access Level</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">Last Active</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/40">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-8 py-10 h-24 bg-gray-800/10"></td>
                                    </tr>
                                ))
                            ) : filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-800/20 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-[#00d09c] font-black text-lg border border-gray-700/50">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-base font-bold text-gray-200 group-hover:text-white transition-colors">{user.name}</div>
                                                <div className="text-xs text-gray-500 font-medium flex items-center gap-2">
                                                    <Mail size={12} className="opacity-40" />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getRoleBadge(user.role)}`}>
                                                {user.role}
                                            </span>
                                            {user.role === 'ADMIN' && <ShieldAlert size={14} className="text-red-500 opacity-60" />}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3 text-sm text-gray-400 font-medium">
                                            <Calendar size={14} className="opacity-40" />
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            <select
                                                className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-[10px] font-black uppercase outline-none focus:ring-1 focus:ring-[#00d09c] transition-all cursor-pointer"
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            >
                                                <option value="STAFF">Staff</option>
                                                <option value="MANAGER">Manager</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>
                                            <button className="p-2 text-gray-500 hover:text-white transition-colors">
                                                <MoreVertical size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card bg-gradient-to-br from-[#00d09c08] to-transparent border-gray-800 p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00d09c05] rotate-45 translate-x-12 -translate-y-12 transition-transform group-hover:scale-125"></div>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                        <ShieldAlert size={24} className="text-[#00d09c]" />
                        Active System Sessions
                    </h3>
                    <div className="space-y-4 relative z-10">
                        <div className="flex items-center justify-between p-4 bg-gray-900/40 rounded-2xl border border-gray-800/50">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-[#00d09c]">
                                    <UserCheck size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Main Terminal (Current)</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">IP: 192.168.1.104 • Chrome / Windows</p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-[#00d09c10] text-[#00d09c] text-[10px] font-black uppercase rounded-full border border-[#00d09c33]">Active Now</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-900/20 rounded-2xl border border-gray-800/30 opacity-60">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400">
                                    <UserCheck size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Mobile App Sync</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">IP: 104.28.1.92 • Groww PWA / iOS</p>
                                </div>
                            </div>
                            <button className="text-[10px] font-black text-red-500 uppercase hover:underline">Revoke</button>
                        </div>
                    </div>
                </div>

                <div className="card bg-gray-900/20 border-gray-800 p-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                        <Shield size={24} className="text-blue-500" />
                        Governance Policy
                    </h3>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                            <p className="text-sm text-gray-400 leading-relaxed font-medium">Admins can promote users to <span className="text-white font-bold">Managers</span> to allow inventory modifications but restricted system logging visibility.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 shrink-0"></div>
                            <p className="text-sm text-gray-400 leading-relaxed font-medium">Session tokens are valid for <span className="text-white font-bold">24 hours</span>. Active sessions can be audited and revoked from this panel.</p>
                        </div>
                        <button className="w-full mt-4 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                            Download Audit Policy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
