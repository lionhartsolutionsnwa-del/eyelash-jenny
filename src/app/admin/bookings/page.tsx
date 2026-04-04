'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLang } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

/* ── Types ─────────────────────────────────────────────── */

interface Booking {
  id: string;
  date: string;
  time: string;
  client: string;
  email: string;
  phone: string;
  service: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  price: number;
}

/* ── Mock Data ─────────────────────────────────────────── */

const [bookings, setBookings] = useState<Booking[]>([
  { id: 'B001', date: '2026-03-30', time: '9:00 AM', client: 'Sarah Kim', email: 'sarah@email.com', phone: '(555) 123-4567', service: 'Classic Full Set', status: 'confirmed', price: 150 },
  { id: 'B002', date: '2026-03-30', time: '10:30 AM', client: 'Emily Chen', email: 'emily@email.com', phone: '(555) 234-5678', service: 'Hybrid Full Set', status: 'confirmed', price: 200 },
  { id: 'B003', date: '2026-03-30', time: '12:00 PM', client: 'Jessica Park', email: 'jessica@email.com', phone: '(555) 345-6789', service: 'Volume Full Set', status: 'pending', price: 250 },
  { id: 'B004', date: '2026-03-30', time: '1:30 PM', client: 'Michelle Lee', email: 'michelle@email.com', phone: '(555) 456-7890', service: 'Classic Refill', status: 'confirmed', price: 80 },
  { id: 'B005', date: '2026-03-30', time: '3:00 PM', client: 'Amanda Wong', email: 'amanda@email.com', phone: '(555) 567-8901', service: 'Lash Removal', status: 'pending', price: 50 },
  { id: 'B006', date: '2026-03-30', time: '4:30 PM', client: 'Rachel Nguyen', email: 'rachel@email.com', phone: '(555) 678-9012', service: 'Hybrid Refill', status: 'confirmed', price: 120 },
  { id: 'B007', date: '2026-03-29', time: '9:00 AM', client: 'Lisa Wang', email: 'lisa@email.com', phone: '(555) 789-0123', service: 'Classic Full Set', status: 'completed', price: 150 },
  { id: 'B008', date: '2026-03-29', time: '11:00 AM', client: 'Diana Cho', email: 'diana@email.com', phone: '(555) 890-1234', service: 'Volume Full Set', status: 'completed', price: 250 },
  { id: 'B009', date: '2026-03-28', time: '10:00 AM', client: 'Karen Yoo', email: 'karen@email.com', phone: '(555) 901-2345', service: 'Hybrid Full Set', status: 'cancelled', price: 200 },
  { id: 'B010', date: '2026-03-28', time: '1:00 PM', client: 'Grace Tan', email: 'grace@email.com', phone: '(555) 012-3456', service: 'Classic Refill', status: 'completed', price: 80 },
  { id: 'B011', date: '2026-03-27', time: '9:30 AM', client: 'Sophia Lin', email: 'sophia@email.com', phone: '(555) 111-2222', service: 'Volume Full Set', status: 'completed', price: 250 },
  { id: 'B012', date: '2026-03-27', time: '12:00 PM', client: 'Olivia Fang', email: 'olivia@email.com', phone: '(555) 333-4444', service: 'Hybrid Refill', status: 'completed', price: 120 },
]);

const servicesEn = ['All Services', 'Classic Full Set', 'Hybrid Full Set', 'Volume Full Set', 'Classic Refill', 'Hybrid Refill', 'Lash Removal'];
const servicesZh = ['所有服务', '经典全套', '混搭全套', '浓密全套', '经典补睫毛', '混搭补睫毛', '睫毛卸除'];
const statuses = ['All Statuses', 'confirmed', 'pending', 'cancelled', 'completed'];

const ITEMS_PER_PAGE = 8;

/* ── Component ─────────────────────────────────────────── */

export default function BookingsPage() {
  const { lang } = useLang();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [serviceFilter, setServiceFilter] = useState('All Services');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch =
        !search ||
        b.client.toLowerCase().includes(search.toLowerCase()) ||
        b.id.toLowerCase().includes(search.toLowerCase()) ||
        b.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All Statuses' || b.status === statusFilter;
      const matchesService = serviceFilter === 'All Services' || b.service === serviceFilter;
      return matchesSearch && matchesStatus && matchesService;
    });
  }, [search, statusFilter, serviceFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  function handleExportCSV() {
    const headers = 'ID,Date,Time,Client,Service,Status,Price\n';
    const rows = filtered
      .map((b) => `${b.id},${b.date},${b.time},${b.client},${b.service},${b.status},$${b.price}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray"
              width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
            >
              <circle cx="7" cy="7" r="5" />
              <path d="M14 14l-3.5-3.5" />
            </svg>
            <input
              type="text"
              placeholder={lang === 'en' ? 'Search by name, email, or ID...' : '按姓名、邮箱或预约号搜索...'}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-sm font-body text-navy bg-offwhite rounded-xl border border-gray-light focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none transition-[border-color,box-shadow] duration-200"
            />
          </div>

          {/* Status filter */}
          <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm font-body text-navy bg-offwhite rounded-xl border border-gray-light focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none cursor-pointer"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s === 'All Statuses' ? (lang === 'en' ? s : '所有状态') :
                    s === 'confirmed' ? (lang === 'en' ? 'Confirmed' : '已确认') :
                    s === 'pending' ? (lang === 'en' ? 'Pending' : '待确认') :
                    s === 'cancelled' ? (lang === 'en' ? 'Cancelled' : '已取消') :
                    (lang === 'en' ? 'Completed' : '已完成')}
                </option>
              ))}
            </select>

          {/* Service filter */}
          <select
            value={serviceFilter}
            onChange={(e) => { setServiceFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm font-body text-navy bg-offwhite rounded-xl border border-gray-light focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none cursor-pointer"
          >
            {(lang === 'en' ? servicesEn : servicesZh).map((s, i) => (
              <option key={s} value={servicesEn[i]}>
                {s}
              </option>
            ))}
          </select>
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M7 1v9M3.5 6.5L7 10l3.5-3.5M1 12h12" />
            </svg>
            <span className="only-en">Export CSV</span><span className="only-zh">导出CSV</span>
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-gray-light bg-offwhite/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray uppercase tracking-wider">
                  <span className="only-en">Date</span><span className="only-zh">日期</span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray uppercase tracking-wider">
                  <span className="only-en">Time</span><span className="only-zh">时间</span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray uppercase tracking-wider">
                  <span className="only-en">Client</span><span className="only-zh">客户</span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray uppercase tracking-wider">
                  <span className="only-en">Service</span><span className="only-zh">服务</span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray uppercase tracking-wider">
                  <span className="only-en">Status</span><span className="only-zh">状态</span>
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray uppercase tracking-wider">
                  <span className="only-en">Price</span><span className="only-zh">价格</span>
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray uppercase tracking-wider">
                  <span className="only-en">Actions</span><span className="only-zh">操作</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-gray-light/60 hover:bg-offwhite/40 transition-opacity duration-150 cursor-pointer"
                >
                  <td className="px-4 py-3 text-navy whitespace-nowrap">{booking.date}</td>
                  <td className="px-4 py-3 text-navy whitespace-nowrap">{booking.time}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-navy">{booking.client}</p>
                    <p className="text-xs text-gray">{booking.email}</p>
                  </td>
                  <td className="px-4 py-3 text-navy-light whitespace-nowrap">{booking.service}</td>
                  <td className="px-4 py-3">
                    <Badge variant={booking.status} size="sm">
                      {booking.status === 'confirmed' ? (<><span className="only-en">Confirmed</span><span className="only-zh">已确认</span></>) :
                       booking.status === 'pending' ? (<><span className="only-en">Pending</span><span className="only-zh">待确认</span></>) :
                       booking.status === 'cancelled' ? (<><span className="only-en">Cancelled</span><span className="only-zh">已取消</span></>) :
                       (<><span className="only-en">Completed</span><span className="only-zh">已完成</span></>)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-navy font-medium">${booking.price}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setSelectedBooking(booking)} className="px-2 py-1 text-xs text-navy-light hover:text-navy rounded-md hover:bg-offwhite transition-opacity duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-gold">
                        <span className="only-en">View</span><span className="only-zh">查看</span>
                      </button>
                      {booking.status === 'pending' && (
                        <button onClick={() => { setBookings(bookings.map(b => b.id === booking.id ? { ...b, status: "confirmed" } : b)); }} className="px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50 rounded-md transition-opacity duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-gold">
                          <span className="only-en">Confirm</span><span className="only-zh">确认</span>
                        </button>
                      )}
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button onClick={() => { setBookings(bookings.map(b => b.id === booking.id ? { ...b, status: "cancelled" } : b)); }} className="px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-md transition-opacity duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-gold">
                          <span className="only-en">Cancel</span><span className="only-zh">取消</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray">
                    <span className="only-en">No bookings found matching your filters.</span>
                    <span className="only-zh">没有找到符合条件的预约</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-light">
              <p className="text-xs text-gray font-body">
                <span className="only-en">Showing {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}</span>
                <span className="only-zh">显示 {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, filtered.length)}，共 {filtered.length} 条</span>
              </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-2 py-1 text-xs text-navy-light hover:text-navy rounded-md hover:bg-offwhite disabled:opacity-40 disabled:pointer-events-none transition-opacity duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-gold"
              >
                <span className="only-en">Previous</span><span className="only-zh">上一页</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={[
                    'w-7 h-7 text-xs rounded-md transition-opacity duration-150 cursor-pointer',
                    'focus-visible:ring-2 focus-visible:ring-gold',
                    p === page ? 'bg-navy text-white' : 'text-navy-light hover:text-navy hover:bg-offwhite',
                  ].join(' ')}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-2 py-1 text-xs text-navy-light hover:text-navy rounded-md hover:bg-offwhite disabled:opacity-40 disabled:pointer-events-none transition-opacity duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-gold"
              >
                <span className="only-en">Next</span><span className="only-zh">下一页</span>
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <Modal isOpen={!!selectedBooking} onClose={() => setSelectedBooking(null)}>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-lg text-navy">{selectedBooking.client}</h3>
                <p className="text-sm text-navy-light font-body">{selectedBooking.service}</p>
              </div>
              <Badge variant={selectedBooking.status} size="sm">
                {selectedBooking.status === 'confirmed' ? (<><span className="only-en">Confirmed</span><span className="only-zh">已确认</span></>) :
                 selectedBooking.status === 'pending' ? (<><span className="only-en">Pending</span><span className="only-zh">待确认</span></>) :
                 selectedBooking.status === 'cancelled' ? (<><span className="only-en">Cancelled</span><span className="only-zh">已取消</span></>) :
                 (<><span className="only-en">Completed</span><span className="only-zh">已完成</span></>)}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm font-body">
              <div>
                <p className="text-xs text-gray"><span className="only-en">Date</span><span className="only-zh">日期</span></p>
                <p className="text-navy font-medium">{selectedBooking.date}</p>
              </div>
              <div>
                <p className="text-xs text-gray"><span className="only-en">Time</span><span className="only-zh">时间</span></p>
                <p className="text-navy font-medium">{selectedBooking.time}</p>
              </div>
              <div>
                <p className="text-xs text-gray"><span className="only-en">Email</span><span className="only-zh">邮箱</span></p>
                <p className="text-navy font-medium">{selectedBooking.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray"><span className="only-en">Phone</span><span className="only-zh">电话</span></p>
                <p className="text-navy font-medium">{selectedBooking.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray"><span className="only-en">Booking ID</span><span className="only-zh">预约号</span></p>
                <p className="text-navy font-medium">{selectedBooking.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray"><span className="only-en">Price</span><span className="only-zh">价格</span></p>
                <p className="text-navy font-medium">${selectedBooking.price}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedBooking(null)}>
                <span className="only-en">Close</span><span className="only-zh">关闭</span>
              </Button>
              {selectedBooking.status === 'pending' && (
                <Button variant="gold" size="sm" onClick={() => { setBookings(bookings.map(b => b.id === selectedBooking.id ? { ...b, status: 'confirmed' } : b)); setSelectedBooking(null); }}>
                  <span className="only-en">Confirm Booking</span><span className="only-zh">确认预约</span>
                </Button>
              )}
              {(selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
                <Button variant="secondary" size="sm" onClick={() => { setBookings(bookings.map(b => b.id === selectedBooking.id ? { ...b, status: 'cancelled' } : b)); setSelectedBooking(null); }}>
                  <span className="only-en">Cancel Booking</span><span className="only-zh">取消预约</span>
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
