import { NextRequest } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { sendSMS, formatPhone, reminder24hMessage, reminder1hMessage } from '@/lib/twilio';

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
      const msg = reminder24hMessage(booking.client_name, serviceName, booking.start_time);
      const result = await sendSMS(formatPhone(booking.client_phone), msg);

      if (result.success) {
        await adminClient
          .from('bookings')
          .update({ reminder_24h_sent: true })
          .eq('id', booking.id);
        sentCount++;
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
        const msg = reminder1hMessage(serviceName, booking.start_time);
        const result = await sendSMS(formatPhone(booking.client_phone), msg);

        if (result.success) {
          await adminClient
            .from('bookings')
            .update({ reminder_1h_sent: true })
            .eq('id', booking.id);
          sentCount++;
        }
      }
    }
  }

  return Response.json({ message: 'Reminders processed', sent: sentCount });
}
