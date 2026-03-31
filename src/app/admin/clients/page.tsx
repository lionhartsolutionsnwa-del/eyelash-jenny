'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';

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

/* ── Mock Data ─────────────────────────────────────────── */

const mockClients: Client[] = [
  { id: '1', name: 'Sarah Kim', phone: '(555) 123-4567', email: 'sarah@email.com', visits: 12, lastVisit: '2026-03-28', totalSpent: 1800 },
  { id: '2', name: 'Emily Chen', phone: '(555) 234-5678', email: 'emily@email.com', visits: 8, lastVisit: '2026-03-25', totalSpent: 1400 },
  { id: '3', name: 'Jessica Park', phone: '(555) 345-6789', email: 'jessica@email.com', visits: 15, lastVisit: '2026-03-30', totalSpent: 2250 },
  { id: '4', name: 'Michelle Lee', phone: '(555) 456-7890', email: 'michelle@email.com', visits: 6, lastVisit: '2026-03-22', totalSpent: 720 },
  { id: '5', name: 'Amanda Wong', phone: '(555) 567-8901', email: 'amanda@email.com', visits: 3, lastVisit: '2026-03-20', totalSpent: 450 },
  { id: '6', name: 'Rachel Nguyen', phone: '(555) 678-9012', email: 'rachel@email.com', visits: 10, lastVisit: '2026-03-27', totalSpent: 1600 },
  { id: '7', name: 'Lisa Wang', phone: '(555) 789-0123', email: 'lisa@email.com', visits: 1, lastVisit: '2026-03-29', totalSpent: 150 },
  { id: '8', name: 'Diana Cho', phone: '(555) 890-1234', email: 'diana@email.com', visits: 4, lastVisit: '2026-03-18', totalSpent: 650 },
  { id: '9', name: 'Karen Yoo', phone: '(555) 901-2345', email: 'karen@email.com', visits: 7, lastVisit: '2026-03-15', totalSpent: 1050 },
  { id: '10', name: 'Grace Tan', phone: '(555) 012-3456', email: 'grace@email.com', visits: 2, lastVisit: '2026-03-10', totalSpent: 350 },
  { id: '11', name: 'Sophia Lin', phone: '(555) 111-2222', email: 'sophia@email.com', visits: 9, lastVisit: '2026-03-26', totalSpent: 1350 },
  { id: '12', name: 'Olivia Fang', phone: '(555) 333-4444', email: 'olivia@email.com', visits: 5, lastVisit: '2026-03-24', totalSpent: 850 },
];

/* ── Component ─────────────────────────────────────────── */

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = useMemo(() => {
    const filtered = mockClients.filter((c) => {
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
  }, [search, sortKey, sortDir]);

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
            placeholder="Search clients by name, email, or phone..."
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
                    Name <SortIcon column="name" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray uppercase tracking-wider">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3">
                  <button
                    onClick={() => handleSort('visits')}
                    className="flex items-center gap-1 text-xs font-medium text-gray uppercase tracking-wider cursor-pointer hover:text-navy transition-opacity duration-150"
                  >
                    Visits <SortIcon column="visits" />
                  </button>
                </th>
                <th className="text-left px-4 py-3">
                  <button
                    onClick={() => handleSort('lastVisit')}
                    className="flex items-center gap-1 text-xs font-medium text-gray uppercase tracking-wider cursor-pointer hover:text-navy transition-opacity duration-150"
                  >
                    Last Visit <SortIcon column="lastVisit" />
                  </button>
                </th>
                <th className="text-right px-4 py-3">
                  <button
                    onClick={() => handleSort('totalSpent')}
                    className="flex items-center gap-1 text-xs font-medium text-gray uppercase tracking-wider cursor-pointer hover:text-navy transition-opacity duration-150 ml-auto"
                  >
                    Total Spent <SortIcon column="totalSpent" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((client) => (
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
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray">
                    No clients found matching your search.
                  </td>
                </tr>
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
