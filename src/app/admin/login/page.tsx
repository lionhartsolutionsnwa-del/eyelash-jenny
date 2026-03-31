'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function formatPhoneForAuth(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
    return `+${digits}`;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      phone: formatPhoneForAuth(phone),
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push('/admin');
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
            Admin Login
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="(555) 123-4567"
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
