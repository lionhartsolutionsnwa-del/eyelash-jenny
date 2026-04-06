'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLang } from '@/contexts/LanguageContext';

/* ── Types ─────────────────────────────────────────────── */

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // minutes
  description: string;
  active: boolean;
}

/* ── Component ─────────────────────────────────────────── */

export default function SettingsPage() {
  const { lang } = useLang();
  // Business Info
  const [businessName, setBusinessName] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [timezone, setTimezone] = useState('America/Los_Angeles');
  const [savingBusiness, setSavingBusiness] = useState(false);

  // Services
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Notifications
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [adminPhone, setAdminPhone] = useState('');
  const [reminder24h, setReminder24h] = useState(true);
  const [reminder1h, setReminder1h] = useState(true);
  const [savingNotifications, setSavingNotifications] = useState(false);

  // Fetch settings + services on mount
  useEffect(() => {
    async function fetchAll() {
      try {
        const [settingsRes, servicesRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/services'),
        ]);

        if (settingsRes.ok) {
          const settings: { key: string; value: unknown }[] = await settingsRes.json();
          const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
          if (map.business_name) setBusinessName(map.business_name as string);
          if (map.business_phone) setBusinessPhone(map.business_phone as string);
          if (map.business_address) setBusinessAddress(map.business_address as string);
          if (map.timezone) setTimezone(map.timezone as string);
          if (map.sms_notifications_enabled !== undefined) setSmsEnabled(!!map.sms_notifications_enabled);
          if (map.admin_phone) setAdminPhone(map.admin_phone as string);
          if (map.reminder_24h !== undefined) setReminder24h(!!map.reminder_24h);
          if (map.reminder_1h !== undefined) setReminder1h(!!map.reminder_1h);
        }

        if (servicesRes.ok) {
          const data = await servicesRes.json();
          setServices(
            data.map((s: { id: string; name: string; price: number; duration_minutes: number; description: string; active: boolean }) => ({
              id: s.id,
              name: s.name,
              price: s.price,
              duration: s.duration_minutes,
              description: s.description,
              active: s.active,
            }))
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  async function saveSetting(key: string, value: unknown) {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    if (!res.ok) throw new Error(`Failed to save ${key}`);
  }

  async function saveBusinessInfo() {
    setSavingBusiness(true);
    try {
      await Promise.all([
        saveSetting('business_name', businessName),
        saveSetting('business_phone', businessPhone),
        saveSetting('business_address', businessAddress),
        saveSetting('timezone', timezone),
      ]);
      alert(lang === 'en' ? 'Business info saved!' : '商家信息已保存！');
    } catch (err) {
      console.error('Error saving business info:', err);
      alert(lang === 'en' ? 'Failed to save. Please try again.' : '保存失败，请重试。');
    } finally {
      setSavingBusiness(false);
    }
  }

  async function saveNotificationSettings() {
    setSavingNotifications(true);
    try {
      await Promise.all([
        saveSetting('sms_notifications_enabled', smsEnabled),
        saveSetting('admin_phone', adminPhone),
        saveSetting('reminder_24h', reminder24h),
        saveSetting('reminder_1h', reminder1h),
      ]);
      alert(lang === 'en' ? 'Notification settings saved!' : '通知设置已保存！');
    } catch (err) {
      console.error('Error saving notifications:', err);
      alert(lang === 'en' ? 'Failed to save. Please try again.' : '保存失败，请重试。');
    } finally {
      setSavingNotifications(false);
    }
  }

  async function updateService(id: string, field: keyof Service, value: string | number | boolean) {
    // Optimistically update local state
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );

    const service = services.find((s) => s.id === id);
    if (!service) return;

    // Map duration back to duration_minutes for API
    const apiBody: Record<string, string | number | boolean> = {
      id,
      name: service.name,
      price: service.price,
      duration_minutes: service.duration,
      description: service.description,
      active: service.active,
    };
    // Override the field that was changed (use the local state value for duration since we already updated it)
    if (field === 'duration') {
      apiBody.duration_minutes = value as number;
    } else {
      apiBody[field] = value;
    }

    try {
      const res = await fetch('/api/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiBody),
      });
      if (!res.ok) throw new Error('Failed to update service');
      const updated = await res.json();
      // Update local state with API response, mapping duration_minutes back to duration
      setServices((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                name: updated.name,
                price: updated.price,
                duration: updated.duration_minutes,
                description: updated.description,
                active: updated.active,
              }
            : s
        )
      );
    } catch (err) {
      console.error('Error updating service:', err);
      alert(lang === 'en' ? 'Failed to save service. Please try again.' : '保存服务失败，请重试。');
    }
  }

  async function addService() {
    const tempId = `temp-${Date.now()}`;
    const newService: Service = {
      id: tempId,
      name: 'New Service',
      price: 0,
      duration: 60,
      description: '',
      active: true,
    };

    // Optimistically add to local state
    setServices((prev) => [...prev, newService]);
    setEditingId(tempId);

    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newService.name,
          price: newService.price,
          duration_minutes: newService.duration,
          description: newService.description,
          active: newService.active,
        }),
      });
      if (!res.ok) throw new Error('Failed to create service');
      const created = await res.json();
      // Replace temp service with real one from API
      setServices((prev) =>
        prev.map((s) =>
          s.id === tempId
            ? {
                id: created.id,
                name: created.name,
                price: created.price,
                duration: created.duration_minutes,
                description: created.description,
                active: created.active,
              }
            : s
        )
      );
      setEditingId(created.id);
    } catch (err) {
      console.error('Error creating service:', err);
      alert(lang === 'en' ? 'Failed to create service. Please try again.' : '创建服务失败，请重试。');
      // Remove the temp service on error
      setServices((prev) => prev.filter((s) => s.id !== tempId));
      setEditingId(null);
    }
  }

  function Toggle({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (val: boolean) => void;
  }) {
    return (
      <button
        onClick={() => onChange(!checked)}
        className={[
          'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent cursor-pointer',
          'transition-[background-color] duration-200',
          'focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
          checked ? 'bg-gold' : 'bg-gray-light',
        ].join(' ')}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={[
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm',
            'transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Section 1: Business Info */}
      <Card className="p-6">
        <h2 className="font-display text-lg text-navy tracking-tight mb-4"><span className="only-en">Business Information</span><span className="only-zh">商家信息</span></h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Business Name"
            name="businessName"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
          <Input
            label="Phone Number"
            name="businessPhone"
            type="tel"
            value={businessPhone}
            onChange={(e) => setBusinessPhone(e.target.value)}
          />
          <div className="sm:col-span-2">
            <Input
              label="Address"
              name="businessAddress"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-navy-light font-body mb-1.5 ml-1">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-2.5 text-sm font-body text-navy bg-white rounded-xl border border-gray-light focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none cursor-pointer"
            >
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/New_York">Eastern Time (ET)</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <Button variant="gold" size="sm" onClick={saveBusinessInfo} loading={savingBusiness}><span className="only-en">Save Business Info</span><span className="only-zh">保存商家信息</span></Button>
        </div>
      </Card>

      {/* Section 2: Services Management */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-navy tracking-tight"><span className="only-en">Services</span><span className="only-zh">服务管理</span></h2>
          <Button variant="secondary" size="sm" onClick={addService}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M7 1v12M1 7h12" />
            </svg>
            <span className="only-en">Add Service</span><span className="only-zh">添加服务</span>
          </Button>
        </div>

        <div className="space-y-3">
          {services.map((service) => {
            const isEditing = editingId === service.id;

            return (
              <div
                key={service.id}
                className={[
                  'p-4 rounded-xl border transition-[border-color] duration-200',
                  isEditing ? 'border-gold bg-gold/5' : 'border-gray-light bg-offwhite/40',
                ].join(' ')}
              >
                {isEditing ? (
                  /* Editing mode */
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) => updateService(service.id, 'name', e.target.value)}
                        placeholder={lang === 'en' ? "Service name" : "服务名称"}
                        className="px-3 py-2 text-sm font-body text-navy bg-white rounded-lg border border-gray-light focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none"
                      />
                      <input
                        type="number"
                        value={service.price}
                        onChange={(e) => updateService(service.id, 'price', parseInt(e.target.value) || 0)}
                        placeholder={lang === 'en' ? "Price ($)" : "价格 ($)"}
                        className="px-3 py-2 text-sm font-body text-navy bg-white rounded-lg border border-gray-light focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none"
                      />
                      <input
                        type="number"
                        value={service.duration}
                        onChange={(e) => updateService(service.id, 'duration', parseInt(e.target.value) || 0)}
                        placeholder={lang === 'en' ? "Duration (min)" : "时长 (分钟)"}
                        className="px-3 py-2 text-sm font-body text-navy bg-white rounded-lg border border-gray-light focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none"
                      />
                    </div>
                    <input
                      type="text"
                      value={service.description}
                      onChange={(e) => updateService(service.id, 'description', e.target.value)}
                      placeholder={lang === 'en' ? "Description" : "服务描述"}
                      className="w-full px-3 py-2 text-sm font-body text-navy bg-white rounded-lg border border-gray-light focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Toggle
                          checked={service.active}
                          onChange={(val) => updateService(service.id, 'active', val)}
                        />
                        <span className="text-xs text-navy-light font-body">
                          {service.active ? (<><span className="only-en">Active</span><span className="only-zh">启用</span></>) : (<><span className="only-en">Inactive</span><span className="only-zh">停用</span></>)}
                        </span>
                      </div>
                      <Button variant="gold" size="sm" onClick={() => setEditingId(null)}>
                        Done
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Display mode */
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={[
                          'text-sm font-body font-medium',
                          service.active ? 'text-navy' : 'text-gray line-through',
                        ].join(' ')}>
                          {service.name}
                        </p>
                        {!service.active && (
                          <span className="text-[10px] text-gray bg-gray-light px-1.5 py-0.5 rounded-full font-body">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-navy-light font-body mt-0.5">
                        ${service.price} &middot; {service.duration} min
                        {service.description ? ` &middot; ${service.description}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingId(service.id)}
                      className="text-xs text-navy-light hover:text-navy px-2 py-1 rounded-md hover:bg-white transition-opacity duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Section 3: Notification Settings */}
      <Card className="p-6">
        <h2 className="font-display text-lg text-navy tracking-tight mb-4"><span className="only-en">Notification Settings</span><span className="only-zh">通知设置</span></h2>

        <div className="space-y-4">
          {/* SMS toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-offwhite/60">
            <div>
              <p className="text-sm font-body font-medium text-navy"><span className="only-en">SMS Notifications</span><span className="only-zh">短信通知</span></p>
              <p className="text-xs text-navy-light font-body"><span className="only-en">Send booking confirmations and reminders via SMS</span><span className="only-zh">通过短信发送预约确认和提醒</span></p>
            </div>
            <Toggle checked={smsEnabled} onChange={setSmsEnabled} />
          </div>

          {/* Admin phone */}
          {smsEnabled && (
            <div className="max-w-sm">
              <Input
                label="Admin Phone Number"
                name="adminPhone"
                type="tel"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
              />
            </div>
          )}

          {/* Reminder toggles */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-offwhite/60">
            <div>
              <p className="text-sm font-body font-medium text-navy"><span className="only-en">24-Hour Reminder</span><span className="only-zh">24小时前提醒</span></p>
              <p className="text-xs text-navy-light font-body"><span className="only-en">Send reminder 24 hours before appointment</span><span className="only-zh">预约前24小时发送提醒</span></p>
            </div>
            <Toggle checked={reminder24h} onChange={setReminder24h} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-offwhite/60">
            <div>
              <p className="text-sm font-body font-medium text-navy"><span className="only-en">1-Hour Reminder</span><span className="only-zh">1小时前提醒</span></p>
              <p className="text-xs text-navy-light font-body"><span className="only-en">Send reminder 1 hour before appointment</span><span className="only-zh">预约前1小时发送提醒</span></p>
            </div>
            <Toggle checked={reminder1h} onChange={setReminder1h} />
          </div>
        </div>

        <div className="mt-4">
          <Button variant="gold" size="sm" onClick={saveNotificationSettings} loading={savingNotifications}><span className="only-en">Save Notification Settings</span><span className="only-zh">保存通知设置</span></Button>
        </div>
      </Card>
    </div>
  );
}
