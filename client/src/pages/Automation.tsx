import React, { useState } from 'react';
import { Mail, Clock, Shield, CheckCircle, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const Automation: React.FC = () => {
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [dailySnapshots, setDailySnapshots] = useState(true);
    const [weeklyDigest, setWeeklyDigest] = useState(false);
    const [threshold, setThreshold] = useState(5);

    const handleSave = () => {
        toast.success('Automation preferences updated successfully');
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h2 className="text-3xl font-bold mb-1">Automation Hub</h2>
                <p className="text-gray-400 text-sm">Configure intelligent triggers and automated business reporting.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Real-time Alerts */}
                <div className="card border-l-4 border-[#00d09c]">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#00d09c1a] text-[#00d09c] rounded-lg">
                                <Zap size={20} />
                            </div>
                            <h3 className="font-bold">Real-time Triggers</h3>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={emailAlerts} onChange={() => setEmailAlerts(!emailAlerts)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00d09c]"></div>
                        </label>
                    </div>
                    <p className="text-sm text-gray-400 mb-6">
                        Automatically notify administrators via email when any product level falls below the critical threshold.
                    </p>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Global Default Threshold</label>
                        <input
                            type="number"
                            value={threshold}
                            onChange={(e) => setThreshold(parseInt(e.target.value))}
                            className="w-full bg-[#2c2c2c] border-none rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#00d09c]"
                        />
                    </div>
                </div>

                {/* Scheduled Snapshots */}
                <div className="card border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                                <Clock size={20} />
                            </div>
                            <h3 className="font-bold">Scheduled Jobs</h3>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={dailySnapshots} onChange={() => setDailySnapshots(!dailySnapshots)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                    </div>
                    <p className="text-sm text-gray-400 mb-6">
                        Generate automated inventory valuation snapshots every 24 hours at midnight.
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full w-fit uppercase tracking-widest">
                        <CheckCircle size={12} /> Next Sync: Today, 00:00 AM
                    </div>
                </div>
            </div>

            <div className="card border-gray-800">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                        <Mail size={20} />
                    </div>
                    <h3 className="font-bold text-lg">Weekly Strategic Digest</h3>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 bg-gray-900/50 rounded-2xl border border-gray-800 mb-8">
                    <div className="flex-1">
                        <p className="font-bold mb-1">Stock Exhaustion Report</p>
                        <p className="text-xs text-gray-500">Receive a weekly PDF summary of all low-stock items and replenishment forecasts every Monday morning.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${weeklyDigest ? 'text-[#00d09c]' : 'text-gray-500'}`}>
                            {weeklyDigest ? 'Enabled' : 'Disabled'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={weeklyDigest} onChange={() => setWeeklyDigest(!weeklyDigest)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00d09c]"></div>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button className="px-6 py-2 rounded-xl text-sm font-bold border border-gray-800 hover:bg-gray-800 transition-colors">
                        Test Pipeline
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-8 py-2 rounded-xl text-sm font-black bg-[#00d09c] text-[#121212] hover:bg-[#00b086] transition-all shadow-lg shadow-[#00d09c33]"
                    >
                        Save Configuration
                    </button>
                </div>
            </div>

            {/* Automation Health */}
            <div className="card bg-gradient-to-r from-gray-900 to-[#1a1a1a] border-none flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#00d09c1a] rounded-full flex items-center justify-center text-[#00d09c]">
                        <Shield size={24} />
                    </div>
                    <div>
                        <p className="font-bold">System Status</p>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Notification Engine Active</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00d09c] animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-[#00d09c] animate-pulse delay-100"></div>
                    <div className="w-2 h-2 rounded-full bg-[#00d09c] animate-pulse delay-200"></div>
                </div>
            </div>
        </div>
    );
};

export default Automation;
