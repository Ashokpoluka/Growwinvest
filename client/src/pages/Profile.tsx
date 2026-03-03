import { User, Shield, Key, ShieldCheck, LogOut, ChevronRight, Activity, Smartphone, Monitor } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
        toast.success('Security session ended');
    };

    const getRoleInfo = (role: string) => {
        switch (role) {
            case 'ADMIN': return { label: 'System Administrator', color: 'text-red-500', bg: 'bg-red-500/10', desc: 'Full access to system governance, audit logs, and user management.' };
            case 'MANAGER': return { label: 'Operations Manager', color: 'text-blue-400', bg: 'bg-blue-400/10', desc: 'Can manage inventory, categories, and view analytics.' };
            default: return { label: 'Warehouse Staff', color: 'text-[#00d09c]', bg: 'bg-[#00d09c10]', desc: 'Can perform stock operations and view inventory logs.' };
        }
    };

    const roleInfo = getRoleInfo(user?.role || 'STAFF');

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header / Avatar Section */}
            <div className="relative h-48 rounded-[40px] bg-gradient-to-r from-gray-900 to-gray-800 overflow-hidden border border-gray-800 shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="absolute bottom-0 left-0 w-full p-8 flex items-end gap-6 translate-y-6">
                    <div className="w-32 h-32 rounded-3xl bg-gray-900 border-4 border-[#121212] flex items-center justify-center text-[#00d09c] shadow-2xl relative z-10 group overflow-hidden">
                        <User size={64} className="group-hover:scale-110 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                            <Smartphone size={24} className="text-white" />
                        </div>
                    </div>
                    <div className="pb-8 space-y-1">
                        <h1 className="text-4xl font-black tracking-tight">{user?.name}</h1>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 ${roleInfo.bg} ${roleInfo.color}`}>
                                {roleInfo.label}
                            </span>
                            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                                <Activity size={12} className="text-[#00d09c]" /> Active Session
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Security & Settings */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Identity Details */}
                    <div className="card border-gray-800/60 p-8 bg-[#1e1e1e]/40 backdrop-blur-xl">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                            <ShieldCheck size={24} className="text-[#00d09c]" />
                            Enterprise Identity
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1 border-l-2 border-gray-800 pl-4 py-1 hover:border-[#00d09c] transition-all">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Full Name</p>
                                <p className="font-bold text-gray-200">{user?.name}</p>
                            </div>
                            <div className="space-y-1 border-l-2 border-gray-800 pl-4 py-1 hover:border-blue-500 transition-all">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Email Address</p>
                                <p className="font-bold text-gray-200">{user?.email}</p>
                            </div>
                            <div className="space-y-1 border-l-2 border-gray-800 pl-4 py-1">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Account Status</p>
                                <p className="font-bold text-[#00d09c] flex items-center gap-1.5"><Shield size={14} /> Verified Enterprise</p>
                            </div>
                            <div className="space-y-1 border-l-2 border-gray-800 pl-4 py-1">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Member Since</p>
                                <p className="font-bold text-gray-200">October 2023</p>
                            </div>
                        </div>
                    </div>

                    {/* Permissions Overview */}
                    <div className="card border-gray-800/60 p-8 bg-gradient-to-br from-gray-900/40 to-transparent">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                            <Key size={24} className="text-orange-500" />
                            Security Clearance
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed mb-6 font-medium">
                            {roleInfo.desc} Access keys are encrypted and rotated every 24 hours for maximum security.
                        </p>
                        <div className="space-y-3">
                            {[
                                { label: 'Inventory Management', status: 'Enabled' },
                                { label: 'Financial Reporting', status: user?.role === 'ADMIN' ? 'Enabled' : 'Restricted' },
                                { label: 'User Governance', status: user?.role === 'ADMIN' ? 'Admin Access' : 'No Access' },
                                { label: 'System Configuration', status: user?.role === 'ADMIN' ? 'Admin Access' : 'No Access' }
                            ].map((perm, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-2xl border border-gray-800/50 group hover:border-gray-700 transition-all">
                                    <span className="text-sm font-bold text-gray-300">{perm.label}</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${perm.status === 'Enabled' || perm.status === 'Admin Access' ? 'bg-[#00d09c10] text-[#00d09c]' : 'bg-red-500/10 text-red-500 opacity-50'}`}>
                                        {perm.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Sessions & Actions */}
                <div className="space-y-8">
                    {/* Active Session Hardware */}
                    <div className="card border-gray-800 p-8 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center text-[#00d09c] mb-6 shadow-inner border border-gray-800">
                            <Monitor size={32} />
                        </div>
                        <h4 className="text-lg font-bold mb-1">Current Terminal</h4>
                        <p className="text-xs text-gray-500 mb-6 font-bold uppercase tracking-widest">Chrome / Windows 11</p>

                        <div className="w-full space-y-3">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-800 pb-3">
                                <span>Session Start</span>
                                <span className="text-white">Today, 09:15 AM</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-800 pb-3">
                                <span>Security ID</span>
                                <span className="text-white font-mono uppercase">GRW-X892-01</span>
                            </div>
                        </div>

                        <button onClick={handleLogout} className="w-full mt-8 bg-gray-800 hover:bg-gray-700 text-red-400 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group">
                            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Terminate Session
                        </button>
                    </div>

                    {/* Quick Settings */}
                    <div className="space-y-4">
                        <p className="px-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Account Management</p>
                        <button className="w-full flex items-center justify-between p-6 bg-[#1e1e1e]/60 rounded-[32px] border border-gray-800 hover:border-[#00d09c33] transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gray-800 text-[#00d09c] rounded-2xl">
                                    <Key size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-sm">Rotate Secret Key</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Change your password</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </button>

                        <button className="w-full flex items-center justify-between p-6 bg-[#1e1e1e]/60 rounded-[32px] border border-gray-800 hover:border-blue-500/33 transition-all group opacity-50 cursor-not-allowed">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gray-800 text-blue-500 rounded-2xl">
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-sm">2FA Integration</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Biometric verification</p>
                                </div>
                            </div>
                            <span className="text-[9px] font-black bg-gray-900 border border-gray-800 px-2 py-1 rounded text-gray-500 uppercase tracking-widest">Coming Soon</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
