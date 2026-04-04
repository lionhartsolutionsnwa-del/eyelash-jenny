import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

/* ── Mock Data ─────────────────────────────────────────── */

const stats = [
  {
    labelEn: "Today's Bookings",
    labelZh: '今日预约',
    value: '6',
    comparisonEn: '+2 from yesterday',
    comparisonZh: '比昨天多2个',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M3 10h18" />
        <path d="M8 2v4M16 2v4" />
      </svg>
    ),
  },
  {
    labelEn: "This Week's Revenue",
    labelZh: '本周收入',
    value: '$1,280',
    comparisonEn: '+18% vs last week',
    comparisonZh: '比上周增长18%',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3 3 0 000 6h5a3 3 0 010 6H7" />
      </svg>
    ),
  },
  {
    labelEn: 'New Clients This Month',
    labelZh: '本月新客户',
    value: '12',
    comparisonEn: '+4 from last month',
    comparisonZh: '比上月多4个',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    labelEn: 'Total Clients',
    labelZh: '客户总数',
    value: '87',
    comparisonEn: 'All time',
    comparisonZh: '历史累计',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="7" r="4" />
        <path d="M5.5 21c0-3.87 2.91-7 6.5-7s6.5 3.13 6.5 7" />
      </svg>
    ),
  },
];

const todaysBookings = [
  { time: '9:00 AM', client: 'Sarah Kim', service: 'Classic Full Set', status: 'confirmed' as const },
  { time: '10:30 AM', client: 'Emily Chen', service: 'Hybrid Full Set', status: 'confirmed' as const },
  { time: '12:00 PM', client: 'Jessica Park', service: 'Volume Full Set', status: 'pending' as const },
  { time: '1:30 PM', client: 'Michelle Lee', service: 'Classic Refill', status: 'confirmed' as const },
  { time: '3:00 PM', client: 'Amanda Wong', service: 'Lash Removal', status: 'pending' as const },
  { time: '4:30 PM', client: 'Rachel Nguyen', service: 'Hybrid Refill', status: 'confirmed' as const },
];

/* ── Page Component ────────────────────────────────────── */

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat) => (
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
            <div className="space-y-3">
              {todaysBookings.map((booking, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-xl bg-offwhite/60 hover:bg-offwhite transition-opacity duration-150"
                >
                  <span className="text-sm font-body font-medium text-navy w-20 shrink-0">
                    {booking.time}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body font-medium text-navy truncate">
                      {booking.client}
                    </p>
                    <p className="text-xs text-navy-light font-body">{booking.service}</p>
                  </div>
                  <Badge variant={booking.status} size="sm">
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
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
