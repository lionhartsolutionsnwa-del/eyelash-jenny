'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

/* ── Types ──────────────────────────────────────────────── */

interface Service {
  name: string;
  price: number;
}

interface Booking {
  id: string;
  date: string;
  start_time: string;
  status: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  services: Service | null;
}

interface StatsData {
  todayBookings: number;
  weekRevenue: number;
  newClientsThisMonth: number;
  totalClients: number;
}

/* ── Helper Functions ───────────────────────────────────── */

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  return new Date(d.setDate(diff));
}

function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  return weekEnd;
}

function formatTime(time: string): string {
  // Convert "09:00" to "9:00 AM" format
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function isInCurrentWeek(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  const weekStart = getWeekStart(today);
  const weekEnd = getWeekEnd(today);
  weekStart.setHours(0, 0, 0, 0);
  weekEnd.setHours(23, 59, 59, 999);
  return date >= weekStart && date <= weekEnd;
}

function isInCurrentMonth(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
}

/* ── Icons ──────────────────────────────────────────────── */

const CalendarIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M3 10h18" />
    <path d="M8 2v4M16 2v4" />
  </svg>
);

const RevenueIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M17 5H9.5a3 3 0 000 6h5a3 3 0 010 6H7" />
  </svg>
);

const NewClientsIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const TotalClientsIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4" />
    <path d="M5.5 21c0-3.87 2.91-7 6.5-7s6.5 3.13 6.5 7" />
  </svg>
);

/* ── Page Component ─────────────────────────────────────── */

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData>({
    todayBookings: 0,
    weekRevenue: 0,
    newClientsThisMonth: 0,
    totalClients: 0,
  });
  const [todaysBookings, setTodaysBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/bookings');
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const bookings: Booking[] = await response.json();
        const today = getToday();

        // Compute today's bookings
        const todayBookingsList = bookings
          .filter((b) => b.date === today)
          .sort((a, b) => a.start_time.localeCompare(b.start_time));

        // Compute week's revenue
        const weekRevenue = bookings
          .filter((b) => isInCurrentWeek(b.date))
          .reduce((sum, b) => sum + (b.services?.price || 0), 0);

        // Compute unique clients
        const allClients = new Set(bookings.map((b) => b.client_phone));

        // Compute new clients this month
        const thisMonthClients = new Set(
          bookings
            .filter((b) => isInCurrentMonth(b.date))
            .map((b) => b.client_phone)
        );

        setStats({
          todayBookings: todayBookingsList.length,
          weekRevenue,
          newClientsThisMonth: thisMonthClients.size,
          totalClients: allClients.size,
        });

        setTodaysBookings(todayBookingsList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const statsCards = [
    {
      labelEn: "Today's Bookings",
      labelZh: '今日预约',
      value: stats.todayBookings,
      comparisonEn: 'Total',
      comparisonZh: '总计',
      icon: CalendarIcon,
    },
    {
      labelEn: "This Week's Revenue",
      labelZh: '本周收入',
      value: `$${stats.weekRevenue.toLocaleString()}`,
      comparisonEn: 'This week',
      comparisonZh: '本周',
      icon: RevenueIcon,
    },
    {
      labelEn: 'New Clients This Month',
      labelZh: '本月新客户',
      value: stats.newClientsThisMonth,
      comparisonEn: 'This month',
      comparisonZh: '本月',
      icon: NewClientsIcon,
    },
    {
      labelEn: 'Total Clients',
      labelZh: '客户总数',
      value: stats.totalClients,
      comparisonEn: 'All time',
      comparisonZh: '历史累计',
      icon: TotalClientsIcon,
    },
  ];

  if (error) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          {statsCards.map((stat) => (
            <Card key={stat.labelEn} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray font-body">
                    <span className="only-en">{stat.labelEn}</span>
                    <span className="only-zh">{stat.labelZh}</span>
                  </p>
                  <p className="text-2xl font-display font-semibold text-navy tracking-tight mt-1">
                    -
                  </p>
                  <p className="text-xs text-navy-light font-body mt-1">
                    <span className="only-en">Error loading data</span>
                    <span className="only-zh">数据加载错误</span>
                  </p>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold/10 text-gold-dark shrink-0">
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <Card className="p-6">
              <h2 className="font-display text-lg text-navy tracking-tight mb-4">
                <span className="only-en">Today&apos;s Schedule</span>
                <span className="only-zh">今日日程</span>
              </h2>
              <div className="flex items-center justify-center py-12">
                <p className="text-navy-light font-body">
                  <span className="only-en">Failed to load bookings: {error}</span>
                  <span className="only-zh">加载预约失败：{error}</span>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {loading
          ? statsCards.map((_, i) => (
              <Card key={i} className="p-5 bg-gray-light/30 animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-light rounded" />
                    <div className="h-8 w-16 bg-gray-light rounded" />
                    <div className="h-3 w-20 bg-gray-light rounded" />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gray-light shrink-0" />
                </div>
              </Card>
            ))
          : statsCards.map((stat) => (
              <Card key={stat.labelEn} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray font-body">
                      <span className="only-en">{stat.labelEn}</span>
                      <span className="only-zh">{stat.labelZh}</span>
                    </p>
                    <p className="text-2xl font-display font-semibold text-navy tracking-tight mt-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-navy-light font-body mt-1">
                      <span className="only-en">{stat.comparisonEn}</span>
                      <span className="only-zh">{stat.comparisonZh}</span>
                    </p>
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold/10 text-gold-dark shrink-0">
                    {stat.icon}
                  </div>
                </div>
              </Card>
            ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="xl:col-span-2">
          <Card className="p-6">
            <h2 className="font-display text-lg text-navy tracking-tight mb-4">
              <span className="only-en">Today&apos;s Schedule</span>
              <span className="only-zh">今日日程</span>
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-xl bg-gray-light/30 animate-pulse"
                  >
                    <div className="h-4 w-20 bg-gray-light rounded" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 w-32 bg-gray-light rounded" />
                      <div className="h-3 w-24 bg-gray-light rounded" />
                    </div>
                    <div className="h-6 w-20 bg-gray-light rounded" />
                  </div>
                ))}
              </div>
            ) : todaysBookings.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-navy-light font-body">
                  <span className="only-en">No bookings today</span>
                  <span className="only-zh">今日暂无预约</span>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-offwhite/60 hover:bg-offwhite transition-opacity duration-150"
                  >
                    <span className="text-sm font-body font-medium text-navy w-20 shrink-0">
                      {formatTime(booking.start_time)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-body font-medium text-navy truncate">
                        {booking.client_name}
                      </p>
                      <p className="text-xs text-navy-light font-body">
                        {booking.services?.name || 'N/A'}
                      </p>
                    </div>
                    <Badge variant={booking.status as 'confirmed' | 'pending' | 'cancelled'} size="sm">
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="p-6">
            <h2 className="font-display text-lg text-navy tracking-tight mb-4">
              <span className="only-en">Quick Actions</span>
              <span className="only-zh">快捷操作</span>
            </h2>
            <div className="space-y-3">
              <a
                href="/admin/availability"
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-light hover:border-gold/40 hover:bg-gold/5 transition-opacity duration-150 group"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-navy/5 text-navy group-hover:bg-gold/10 group-hover:text-gold-dark transition-opacity duration-150">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <rect x="2" y="3" width="14" height="13" rx="2" />
                    <path d="M2 7h14" />
                    <path d="M9 10v4M7 12h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-body font-medium text-navy">
                    <span className="only-en">Block Date</span>
                    <span className="only-zh">封锁日期</span>
                  </p>
                  <p className="text-xs text-gray font-body">
                    <span className="only-en">Mark dates as unavailable</span>
                    <span className="only-zh">标记不可用日期</span>
                  </p>
                </div>
              </a>

              <a
                href="/admin/settings"
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-light hover:border-gold/40 hover:bg-gold/5 transition-opacity duration-150 group"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-navy/5 text-navy group-hover:bg-gold/10 group-hover:text-gold-dark transition-opacity duration-150">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="9" cy="9" r="7" />
                    <path d="M9 6v6M6 9h6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-body font-medium text-navy">
                    <span className="only-en">Add Service</span>
                    <span className="only-zh">添加服务</span>
                  </p>
                  <p className="text-xs text-gray font-body">
                    <span className="only-en">Create a new service offering</span>
                    <span className="only-zh">创建新的服务项目</span>
                  </p>
                </div>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
