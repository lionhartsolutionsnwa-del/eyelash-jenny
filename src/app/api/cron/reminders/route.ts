import { NextRequest } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { sendSMS, formatPhone } from '@/lib/twilio';

function managerReminder24hMessage(
  clientName: string,
  serviceName: string,
  date: string,
  time: string,
  clientPhone: string
): string {
  return `Manager reminder: ${clientName} has ${serviceName} on ${date} at ${time}. Customer phone: ${clientPhone}.`;
}

function managerReminder1hMessage(
  clientName: string,
  serviceName: string,
  time: string,
  clientPhone: string
): string {
  return `Manager reminder: ${clientName} starts ${serviceName} in about 1 hour at ${time}. Customer phone: ${clientPhone}.`;
}

export async function GET(request: NextRequest) {
  // Fail-safe: reject all requests if CRON_SECRET is not configured
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[CRON] CRON_SECRET environment variable is not configured');
    return Response.json({ error: 'Server configuration error' }, { status: 401 });
  }

  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminClient = getAdminClient();
  const now = new Date();
  // Get business timezone from settings or default to America/Los_Angeles
  const timezone = 'America/Los_Angeles';

  // Get current time in business timezone
  const localNow = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  const currentHour = localNow.getHours();

  // Don't send reminders at night (before 8am or after 9pm)
  if (currentHour < 8 || currentHour > 21) {
    return Response.json({ message: 'Outside notification hours', sent: 0 });
  }

  const { data: managers, error: managerError } = await adminClient
    .from('admin_users')
    .select('phone')
    .eq('active', true)
    .eq('role', 'manager');

  if (managerError) {
    console.error('[CRON] Failed to fetch manager phones:', managerError);
    return Response.json({ error: 'Failed to load manager recipients' }, { status: 500 });
  }

  const managerPhones = Array.from(
    new Set(
      (managers ?? [])
        .map((m) => formatPhone(m.phone))
        .filter((p) => p !== '+')
    )
  );

  if (managerPhones.length === 0) {
    console.warn('[CRON] No active manager phone recipients configured');
    return Response.json({ message: 'No manager recipients configured', sent: 0 });
  }

  let sentCount = 0;

  // --- 24-hour reminders ---
  const tomorrow = new Date(localNow);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const { data: bookings24h } = await adminClient
    .from('bookings')
    .select('*, services(name)')
    .eq('date', tomorrowStr)
    .eq('status', 'confirmed')
    .eq('reminder_24h_sent', false);

  if (bookings24h) {
    for (const booking of bookings24h) {
      const serviceName = (booking.services as any)?.name || 'your service';
      const msg = managerReminder24hMessage(
        booking.client_name,
        serviceName,
        booking.date,
        booking.start_time,
        formatPhone(booking.client_phone)
      );

      let allManagersSent = true;
      for (const managerPhone of managerPhones) {
        const result = await sendSMS(managerPhone, msg);
        if (!result.success) {
          allManagersSent = false;
        } else {
          sentCount++;
        }
      }

      if (allManagersSent) {
        await adminClient
          .from('bookings')
          .update({ reminder_24h_sent: true })
          .eq('id', booking.id);
      }
    }
  }

  // --- 1-hour reminders ---
  const todayStr = localNow.toISOString().split('T')[0];
  const currentMinutes = currentHour * 60 + localNow.getMinutes();

  const { data: bookingsToday } = await adminClient
    .from('bookings')
    .select('*, services(name)')
    .eq('date', todayStr)
    .eq('status', 'confirmed')
    .eq('reminder_1h_sent', false);

  if (bookingsToday) {
    for (const booking of bookingsToday) {
      const [hours, minutes] = booking.start_time.split(':').map(Number);
      const bookingMinutes = hours * 60 + minutes;
      const diff = bookingMinutes - currentMinutes;

      // Send if booking is between 45 and 75 minutes away
      if (diff >= 45 && diff <= 75) {
        const serviceName = (booking.services as any)?.name || 'your service';
        const msg = managerReminder1hMessage(
          booking.client_name,
          serviceName,
          booking.start_time,
          formatPhone(booking.client_phone)
        );

        let allManagersSent = true;
        for (const managerPhone of managerPhones) {
          const result = await sendSMS(managerPhone, msg);
          if (!result.success) {
            allManagersSent = false;
          } else {
            sentCount++;
          }
        }

        if (allManagersSent) {
          await adminClient
            .from('bookings')
            .update({ reminder_1h_sent: true })
            .eq('id', booking.id);
        }
      }
    }
  }

  return Response.json({ message: 'Reminders processed', sent: sentCount });
}
