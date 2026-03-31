import twilio from 'twilio';

function getClient() {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

export async function sendSMS(to: string, body: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const message = await getClient().messages.create({
      body,
      from: process.env.TWILIO_FROM_NUMBER,
      to,
    });
    return { success: true, messageId: message.sid };
  } catch (err: any) {
    console.error('SMS send failed:', err.message);
    return { success: false, error: err.message };
  }
}

// Format phone to E.164
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return `+${digits}`;
}

// --- SMS message templates ---

export function bookingConfirmationMessage(clientName: string, serviceName: string, date: string, time: string): string {
  return `Hi ${clientName}! Your appointment at Jenny Professional Eyelash is confirmed.\n\n${serviceName} on ${date} at ${time}.\n\nSee you then! ✨`;
}

export function adminNewBookingMessage(clientName: string, serviceName: string, date: string, time: string, clientPhone: string): string {
  return `New booking: ${clientName} - ${serviceName} on ${date} at ${time}.\nPhone: ${clientPhone}`;
}

export function reminder24hMessage(clientName: string, serviceName: string, time: string): string {
  return `Reminder: Your appointment at Jenny Professional Eyelash is tomorrow at ${time} for ${serviceName}.\n\nPlease reply CANCEL if you need to reschedule.`;
}

export function reminder1hMessage(serviceName: string, time: string): string {
  return `Your appointment at Jenny Professional Eyelash starts in 1 hour at ${time}. See you soon! ✨`;
}
