import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', { email, password, name });
            login(data);
            toast.success(`Account created! Welcome, ${data.name}`);
            navigate('/');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#121212] px-4">
            <div className="w-full max-w-md bg-[#1e1e1e] rounded-2xl p-8 border border-gray-800 shadow-2xl">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-[#00d09c1a] rounded-2xl flex items-center justify-center mb-4">
                        <TrendingUp className="text-[#00d09c]" size={36} />
                    </div>
                    <h1 className="text-3xl font-bold">Groww<span className="text-[#00d09c]">Inv</span></h1>
                    <p className="text-gray-400 mt-2 text-center text-sm">Join the next generation of asset management.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text" required value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-[#2c2c2c] border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#00d09c] outline-none transition-all"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="email" required value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#2c2c2c] border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#00d09c] outline-none transition-all"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="password" required minLength={6} value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#2c2c2c] border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#00d09c] outline-none transition-all"
                                placeholder="至少 6 characters"
                            />
                        </div>
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="w-full bg-[#00d09c] text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#00b085] transition-all transform active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <p className="mt-8 text-center text-gray-500 text-xs">
                    Already have an account? <span onClick={() => navigate('/login')} className="text-[#00d09c] cursor-pointer hover:underline">Log in</span>
                </p>
            </div>
        </div>
    );
};

export default Register;
