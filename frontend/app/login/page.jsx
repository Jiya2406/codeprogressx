'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Code2, Mail, Lock } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { saveAuth } from '@/lib/auth';
import GoogleSignInButton from '@/components/GoogleSignInButton';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch('/auth/login', { method: 'POST', body: form });
      saveAuth(data.token, data.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-card w-full max-w-md rounded-3xl p-8 md:p-10 shadow-soft">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-lavender-400 to-blush-300 flex items-center justify-center shadow-soft">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl">CodeProgressX</span>
        </Link>

        <h1 className="font-display text-3xl font-bold mb-1">Welcome back</h1>
        <p className="text-gray-600 text-sm mb-7">Log in to continue tracking your progress.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Email"
            icon={Mail}
            type="email"
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
          />
          <Field
            label="Password"
            icon={Lock}
            type="password"
            required
            placeholder="Your password"
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
          />

          {error && (
            <div className="text-sm text-blush-400 bg-blush-50 px-4 py-2.5 rounded-xl border border-blush-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-lavender-400 to-blush-300 text-white font-semibold shadow-soft hover:shadow-glow transition disabled:opacity-60"
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-lavender-100" />
          <span className="text-xs text-gray-400 uppercase tracking-wide">or</span>
          <div className="flex-1 h-px bg-lavender-100" />
        </div>

        <GoogleSignInButton onError={setError} text="continue_with" />

        <p className="text-sm text-gray-600 text-center mt-6">
          New here?{' '}
          <Link href="/signup" className="text-lavender-500 font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({ label, icon: Icon, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          {...props}
          onChange={(e) => props.onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 border border-lavender-100 focus:border-lavender-300 focus:outline-none focus:ring-2 focus:ring-lavender-200 transition placeholder:text-gray-400"
        />
      </div>
    </div>
  );
}
