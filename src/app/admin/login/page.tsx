'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminLoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Redirect to admin dashboard
      window.location.href = '/admin';
    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo variant="dark" size="md" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(16,27,75,0.08),0_12px_32px_rgba(16,27,75,0.06)] p-8">
          <h1 className="font-display text-2xl text-navy text-center tracking-tight mb-6">
            Staff Login
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="(479) 329-7979"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="text-sm text-rose-600 font-body bg-rose-50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="gold"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray mt-6 font-body">
          Jenny Professional Eyelash &mdash; Admin Portal
        </p>
      </div>
    </div>
  );
}
