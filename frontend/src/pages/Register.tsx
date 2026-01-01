import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function Register() {
    const [formData, setFormData] = useState({ email: '', username: '', password: '' });
    const [error, setError] = useState('');
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/register', formData);
            login(res.data.access_token, res.data.user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
            <div className="w-full max-w-md space-y-8 rounded-lg border border-gray-800 bg-gray-900 p-6 shadow-xl">
                <h2 className="text-center text-3xl font-bold tracking-tight text-white">Create Account</h2>
                {error && <div className="text-red-500 text-center">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-gray-300">Email</label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-300">Username</label>
                        <Input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-300">Password</label>
                        <Input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            className="mt-1"
                        />
                    </div>
                    <Button type="submit" className="w-full">Register</Button>
                </form>
                <p className="text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-blue-500 hover:text-blue-400">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
