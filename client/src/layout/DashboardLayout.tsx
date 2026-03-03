import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, History, LogOut, TrendingUp, Search, Bell, User, Layers, Truck, PieChart, Shield, Users as UsersIcon, Camera, Zap, Brain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import ScannerModal from '../components/ScannerModal';
import toast from 'react-hot-toast';

const SidebarItem = ({ to, icon: Icon, label, badge }: { to: string, icon: any, label: string, badge?: number | string }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-[#00d09c33] text-[#00d09c]' : 'text-gray-400 hover:bg-gray-800'
            }`
        }
    >
        <div className="flex items-center gap-3">
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </div>
        {badge ? (
            <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {badge}
            </span>
        ) : null}
    </NavLink>
);

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { logout, user } = useAuth();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [lowStock, setLowStock] = React.useState(0);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [products, setProducts] = React.useState<any[]>([]);
    const [searchResults, setSearchResults] = React.useState<any[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [isNotifOpen, setIsNotifOpen] = React.useState(false);
    const [isCommandOpen, setIsCommandOpen] = React.useState(false);
    const [isScannerOpen, setIsScannerOpen] = React.useState(false);

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    React.useEffect(() => {
        const setupPush = async () => {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

            try {
                const registration = await navigator.serviceWorker.ready;
                const { data: { publicKey } } = await api.get('/push/vapid-public-key');

                let subscription = await registration.pushManager.getSubscription();

                if (!subscription) {
                    subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(publicKey)
                    });
                }

                // Send subscription to server
                await api.post('/push/subscribe', subscription);
                console.log('Push subscription active');
            } catch (err) {
                console.warn('Push registration failed', err);
            }
        };

        if (user) setupPush();
    }, [user]);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandOpen(prev => !prev);
            }
            if (e.key === 'Escape') setIsCommandOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const commandActions = [
        { icon: LayoutDashboard, label: 'Go to Dashboard', path: '/' },
        { icon: Package, label: 'Manage Inventory', path: '/inventory' },
        { icon: Layers, label: 'Asset Categories', path: '/categories' },
        { icon: Truck, label: 'Vendor Directory', path: '/suppliers' },
        { icon: History, label: 'Transaction Logs', path: '/transactions' },
        { icon: PieChart, label: 'Analytics Hub', path: '/analytics' },
        ...(user?.role === 'ADMIN' ? [{ icon: Shield, label: 'System Activity', path: '/activity' }] : []),
        ...(user?.role === 'ADMIN' ? [{ icon: UsersIcon, label: 'User Governance', path: '/users' }] : []),
        ...(user?.role === 'ADMIN' ? [{ icon: Zap, label: 'Automation Hub', path: '/automation' }] : []),
        ...(user?.role === 'ADMIN' ? [{ icon: Brain, label: 'AI Forecaster', path: '/predictions' }] : []),
    ];

    const filteredCommandActions = commandActions.filter(a => a.label.toLowerCase().includes(searchQuery.toLowerCase()));

    const lowStockItems = products.filter(p => p.stockLevel <= p.lowStockThreshold);

    React.useEffect(() => {
        const fetchMeta = async () => {
            try {
                const [{ data: stats }, { data: prods }] = await Promise.all([
                    api.get('/analytics/stats'),
                    api.get('/products')
                ]);
                setLowStock(stats.lowStock || 0);
                setProducts(prods);
            } catch (err) {
                console.error('Failed to fetch sidebar meta', err);
            }
        };
        fetchMeta();
    }, []);

    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        if (val.trim().length > 1) {
            const filtered = products.filter(p =>
                p.name.toLowerCase().includes(val.toLowerCase()) ||
                p.sku.toLowerCase().includes(val.toLowerCase())
            ).slice(0, 5);
            setSearchResults(filtered);
        } else {
            setSearchResults([]);
        }
    };

    const handleSearch = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate('/inventory', { state: { searchTerm: searchQuery } });
            setSearchQuery('');
            setSearchResults([]);
        }
    };

    const handleResultClick = (productId: number) => {
        navigate('/inventory', { state: { searchTerm: '', highlightId: productId } });
        setSearchQuery('');
        setSearchResults([]);
        setIsSidebarOpen(false);
        setIsNotifOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleScanSuccess = (sku: string) => {
        setIsScannerOpen(false);
        navigate('/inventory', { state: { searchTerm: sku } });
        toast.success(`Scanned SKU: ${sku}`);
    };

    return (
        <div className="flex h-screen bg-[#121212] text-white overflow-hidden relative">
            {/* Sidebar Overlay (Mobile Only) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 w-64 border-r border-gray-800 flex flex-col p-4 bg-[#121212] z-[70] transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between px-2 mb-8">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="text-[#00d09c]" size={32} />
                        <span className="text-2xl font-bold tracking-tight">Groww<span className="text-[#00d09c]">Inv</span></span>
                    </div>
                    <button
                        onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en')}
                        className="p-1.5 bg-gray-800 text-[10px] font-black rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        {i18n.language === 'en' ? 'HI' : 'EN'}
                    </button>
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarItem to="/" icon={LayoutDashboard} label={t('nav.dashboard')} />
                    <SidebarItem to="/inventory" icon={Package} label={t('nav.inventory')} badge={lowStock > 0 ? lowStock : undefined} />
                    <SidebarItem to="/categories" icon={Layers} label={t('nav.categories')} />
                    <SidebarItem to="/suppliers" icon={Truck} label={t('nav.suppliers')} />
                    <SidebarItem to="/warehouses" icon={Layers} label={t('nav.warehouses')} />
                    {user?.role === 'ADMIN' && (
                        <>
                            <SidebarItem to="/activity" icon={Shield} label={t('nav.activity')} />
                            <SidebarItem to="/users" icon={UsersIcon} label={t('nav.users')} />
                            <SidebarItem to="/automation" icon={Zap} label={t('nav.automation')} />
                            <SidebarItem to="/predictions" icon={Brain} label={t('nav.forecaster')} />
                        </>
                    )}
                </nav>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors mt-auto"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-16 border-b border-gray-800 flex items-center justify-between px-4 lg:px-8 bg-[#121212] z-50">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 hover:bg-gray-800 rounded-lg lg:hidden text-gray-400"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                        </button>
                        <div className="relative w-48 md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search stocks..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                onKeyDown={handleSearch}
                                className="w-full bg-[#1e1e1e] rounded-full py-2 pl-10 pr-12 text-sm focus:ring-1 focus:ring-[#00d09c] outline-none border border-transparent focus:border-[#00d09c33]"
                            />
                            <button
                                onClick={() => setIsScannerOpen(true)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#00d09c] transition-colors"
                            >
                                <Camera size={18} />
                            </button>
                            {searchResults.length > 0 && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-[#1e1e1e] border border-gray-800 rounded-xl shadow-2xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                                    {searchResults.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => handleResultClick(p.id)}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors flex items-center justify-between group"
                                        >
                                            <div>
                                                <div className="font-bold text-sm text-gray-200 group-hover:text-[#00d09c]">{p.name}</div>
                                                <div className="text-[10px] text-gray-500 uppercase tracking-widest">{p.sku}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-bold">₹{p.unitPrice.toLocaleString()}</div>
                                                <div className={`text-[10px] ${p.stockLevel <= p.lowStockThreshold ? 'text-orange-500' : 'text-gray-500'}`}>
                                                    Stock: {p.stockLevel}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 lg:gap-6">
                        <div className="relative">
                            <button
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className={`p-2 rounded-lg transition-all relative ${isNotifOpen ? 'bg-[#00d09c1a] text-[#00d09c]' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Bell size={20} />
                                {lowStock > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-[#00d09c] rounded-full ring-2 ring-[#121212]"></span>
                                )}
                            </button>

                            {isNotifOpen && (
                                <div className="absolute top-full right-0 w-80 mt-2 bg-[#1e1e1e] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden py-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Notifications</span>
                                        <span className="bg-[#00d09c1a] text-[#00d09c] text-[10px] font-black px-1.5 py-0.5 rounded-full">{lowStock} Health Alerts</span>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto">
                                        {lowStockItems.length === 0 ? (
                                            <div className="p-8 text-center text-gray-500">
                                                <div className="w-12 h-12 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Bell size={20} className="opacity-20" />
                                                </div>
                                                <p className="text-sm font-medium">All assets healthy</p>
                                            </div>
                                        ) : lowStockItems.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => handleResultClick(p.id)}
                                                className="w-full text-left px-4 py-4 hover:bg-gray-800/50 transition-colors border-b border-gray-800 last:border-0 group"
                                            >
                                                <div className="flex gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center flex-shrink-0">
                                                        <Package size={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start">
                                                            <p className="font-bold text-sm text-gray-200 group-hover:text-[#00d09c] truncate">{p.name}</p>
                                                        </div>
                                                        <p className="text-[10px] text-gray-500 mt-0.5">Stock critical: <span className="text-orange-500 font-bold">{p.stockLevel} units remaining</span></p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    {lowStock > 0 && (
                                        <button
                                            onClick={() => { navigate('/inventory'); setIsNotifOpen(false); }}
                                            className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-[#00d09c] hover:bg-[#00d09c11] transition-colors border-t border-gray-800"
                                        >
                                            View All Critical Stock
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <NavLink to="/profile" className="flex items-center gap-2 lg:gap-3 border-l border-gray-800 pl-4 lg:pl-6 text-gray-300 hover:text-white transition-colors">
                            <span className="text-xs lg:text-sm font-medium hidden sm:block">{user?.name}</span>
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                                <User size={16} />
                            </div>
                        </NavLink>
                    </div>
                </header>

                {/* Page Area */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    {children}
                </main>
            </div>
            {/* Groww Command Center (Ctrl+K) */}
            {isCommandOpen && (
                <div className="fixed inset-0 z-[200] flex items-start justify-center pt-20 px-4">
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsCommandOpen(false)} />
                    <div className="relative w-full max-w-2xl bg-[#1e1e1e] border border-gray-800 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-800 flex items-center gap-4">
                            <Search className="text-[#00d09c]" size={24} />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Command shortcut... (try 'Inventory' or 'Sale')"
                                className="w-full bg-transparent text-xl outline-none placeholder-gray-600 font-medium"
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                            />
                            <div className="flex items-center gap-1.5 border border-gray-800 rounded-lg px-2 py-1 bg-gray-900/50">
                                <span className="text-[10px] font-black text-gray-500">ESC</span>
                            </div>
                        </div>

                        <div className="p-2 max-h-[400px] overflow-y-auto">
                            {searchQuery.length > 0 && searchResults.length > 0 && (
                                <div className="mb-4">
                                    <p className="px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Predicted Assets</p>
                                    {searchResults.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => { handleResultClick(p.id); setIsCommandOpen(false); }}
                                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#00d09c11] rounded-2xl transition-all group"
                                        >
                                            <div className="flex items-center gap-4 text-left">
                                                <div className="p-2 bg-gray-800 rounded-xl text-gray-400 group-hover:text-[#00d09c] transition-colors">
                                                    <Package size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-gray-200 group-hover:text-white">{p.name}</p>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{p.sku}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-sm">₹{p.unitPrice.toLocaleString()}</p>
                                                <p className="text-[10px] text-gray-500">Stock: {p.stockLevel}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div>
                                <p className="px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Quick Navigation</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 px-2">
                                    {filteredCommandActions.map((action, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => { navigate(action.path); setIsCommandOpen(false); setSearchQuery(''); }}
                                            className="flex items-center gap-4 px-4 py-3 hover:bg-gray-800 rounded-2xl transition-all group"
                                        >
                                            <div className="p-2 bg-gray-800 rounded-xl text-gray-400 group-hover:bg-[#00d09c1a] group-hover:text-[#00d09c] transition-all">
                                                <action.icon size={18} />
                                            </div>
                                            <span className="font-bold text-sm text-gray-300 group-hover:text-white transition-colors">{action.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-900/30 border-t border-gray-800/50 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            <div className="flex gap-4">
                                <span className="flex items-center gap-1.5"><kbd className="bg-gray-800 px-1 rounded text-gray-400">↑↓</kbd> Select</span>
                                <span className="flex items-center gap-1.5"><kbd className="bg-gray-800 px-1 rounded text-gray-400">↵</kbd> Confirm</span>
                            </div>
                            <span className="text-[#00d09c]/60">Groww Intelligent Palette</span>
                        </div>
                    </div>
                </div>
            )}
            {/* Mobile Scan FAB */}
            <button
                onClick={() => setIsScannerOpen(true)}
                className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-[#00d09c] text-[#121212] rounded-full flex items-center justify-center shadow-[0_8px_24px_-4px_rgba(0,208,156,0.3)] z-[50] active:scale-95 transition-transform"
            >
                <Camera size={24} />
            </button>

            <ScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScanSuccess={handleScanSuccess}
            />
        </div>
    );
};

export default DashboardLayout;
