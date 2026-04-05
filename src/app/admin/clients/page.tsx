'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { useLang } from '@/contexts/LanguageContext';

/* ── Types ─────────────────────────────────────────────── */

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  visits: number;
  lastVisit: string;
  totalSpent: number;
}

type SortKey = keyof Pick<Client, 'name' | 'visits' | 'lastVisit' | 'totalSpent'>;
type SortDir = 'asc' | 'desc';

/* ── Component ─────────────────────────────────────────── */

export default function ClientsPage() {
  const { lang } = useLang();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    fetch('/api/clients')
      .then((r) => {
        if (r.status === 401) { window.location.href = '/admin/login'; return null; }
        if (!r.ok) throw new Error(`Server error: ${r.status}`);
        return r.json();
      })
      .then((data: Client[] | null) => {
        if (data) setClients(data);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = useMemo(() => {
    const filtered = clients.filter((c) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
      );
    });

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'visits') cmp = a.visits - b.visits;
      else if (sortKey === 'lastVisit') cmp = a.lastVisit.localeCompare(b.lastVisit);
      else if (sortKey === 'totalSpent') cmp = a.totalSpent - b.totalSpent;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [search, sortKey, sortDir, clients]);

  const clientRows = sorted.map((client) => (
    <tr
      key={client.id}
      className="border-b border-gray-light/60 hover:bg-offwhite/40 transition-opacity duration-150 cursor-pointer"
    >
      <td className="px-4 py-3">
        <p className="font-medium text-navy">{client.name}</p>
      </td>
      <td className="px-4 py-3 text-navy-light whitespace-nowrap">{client.phone}</td>
      <td className="px-4 py-3 text-navy-light">{client.email}</td>
      <td className="px-4 py-3 text-navy">{client.visits}</td>
      <td className="px-4 py-3 text-navy-light whitespace-nowrap">{client.lastVisit}</td>
      <td className="px-4 py-3 text-right text-navy font-medium">${client.totalSpent.toLocaleString()}</td>
    </tr>
  ));

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) {
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="opacity-30">
          <path d="M3 5l3-3 3 3M3 7l3 3 3-3" />
        </svg>
      );
    }
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-gold-dark">
        {sortDir === 'asc' ? <path d="M3 7l3-3 3 3" /> : <path d="M3 5l3 3 3-3" />}
      </svg>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <Card className="p-4">
        <div className="relative max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray"
            width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
          >
            <circle cx="7" cy="7" r="5" />
            <path d="M14 14l-3.5-3.5" />
          </svg>
          <input
            type="text"
            placeholder={
              lang === 'en'
                ? 'Search clients by name, email, or phone...'
                : '按姓名、邮箱或电话搜索...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm font-body text-navy bg-offwhite rounded-xl border border-gray-light focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none transition-[border-color,box-shadow] duration-200"
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-gray-light bg-offwhite/50">
                <th className="text-left px-4 py-3">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 text-xs font-medium text-gray uppercase tracking-wider cursor-pointer hover:text-navy transition-opacity duration-150"
                  >
                    <span className="only-en">Name</span><span className="only-zh">姓名</span> <SortIcon column="name" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray uppercase tracking-wider">
                  <span className="only-en">Phone</span><span className="only-zh">电话</span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray uppercase tracking-wider">
                  <span className="only-en">Email</span><span className="only-zh">邮箱</span>
                </th>
                <th className="text-left px-4 py-3">
                  <button
                    onClick={() => handleSort('visits')}
                    className="flex items-center gap-1 text-xs font-medium text-gray uppercase tracking-wider cursor-pointer hover:text-navy transition-opacity duration-150"
                  >
                    <span className="only-en">Visits</span><span className="only-zh">次数</span> <SortIcon column="visits" />
                  </button>
                </th>
                <th className="text-left px-4 py-3">
                  <button
                    onClick={() => handleSort('lastVisit')}
                    className="flex items-center gap-1 text-xs font-medium text-gray uppercase tracking-wider cursor-pointer hover:text-navy transition-opacity duration-150"
                  >
                    <span className="only-en">Last Visit</span><span className="only-zh">最近到店</span> <SortIcon column="lastVisit" />
                  </button>
                </th>
                <th className="text-right px-4 py-3">
                  <button
                    onClick={() => handleSort('totalSpent')}
                    className="flex items-center gap-1 text-xs font-medium text-gray uppercase tracking-wider cursor-pointer hover:text-navy transition-opacity duration-150 ml-auto"
                  >
                    <span className="only-en">Total Spent</span><span className="only-zh">累计消费</span> <SortIcon column="totalSpent" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray font-body text-sm">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-gold border-t-transparent rounded-full animate-spin" />
                      <p>Loading clients...</p>
                    </div>
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray font-body text-sm">
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-rose-500">Failed to load: {loadError}</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-1.5 text-sm bg-gold text-navy rounded-lg hover:bg-gold-dark transition-colors cursor-pointer"
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray font-body">
                    <span className="only-en">No clients found.</span>
                    <span className="only-zh">暂无客户记录。</span>
                  </td>
                </tr>
              ) : (
                clientRows
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-light">
          <p className="text-xs text-gray font-body">
            {sorted.length} client{sorted.length !== 1 ? 's' : ''} total
          </p>
        </div>
      </Card>
    </div>
  );
}
