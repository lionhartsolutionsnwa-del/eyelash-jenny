// GoHighLevel API integration — uses native https to avoid Next.js fetch wrapper issues
import https from 'https';

const GHL_HOST = 'services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

function apiKey() {
  return process.env.GHL_API_KEY?.trim() ?? '';
}

function locationId() {
  return process.env.GHL_LOCATION_ID?.trim() ?? '';
}

function httpsRequest(
  method: string,
  path: string,
  body?: string
): Promise<{ status: number; data: unknown }> {
  return new Promise((resolve, reject) => {
    const buf = body ? Buffer.from(body, 'utf8') : undefined;
    const headers: Record<string, string | number> = {
      Authorization: `Bearer ${apiKey()}`,
      Version: GHL_API_VERSION,
    };
    if (buf) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = buf.length;
    }

    const req = https.request({ hostname: GHL_HOST, path, method, headers }, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode ?? 0, data: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode ?? 0, data: raw });
        }
      });
    });
    req.on('error', reject);
    if (buf) req.write(buf);
    req.end();
  });
}

// Ensure E.164 format: 4791234567 → +14791234567
function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('1') && digits.length === 11) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  return `+${digits}`;
}

export interface GHLContactInput {
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  tags?: string[];
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentService?: string;
}

function buildCustomFields(input: GHLContactInput) {
  const fields: { id: string; field_value: string }[] = [];
  const dateId = process.env.GHL_FIELD_ID_DATE?.trim();
  const timeId = process.env.GHL_FIELD_ID_TIME?.trim();
  const serviceId = process.env.GHL_FIELD_ID_SERVICE?.trim();

  if (dateId && input.appointmentDate) fields.push({ id: dateId, field_value: input.appointmentDate });
  if (timeId && input.appointmentTime) fields.push({ id: timeId, field_value: input.appointmentTime });
  if (serviceId && input.appointmentService) fields.push({ id: serviceId, field_value: input.appointmentService });
  return fields.length > 0 ? fields : undefined;
}

// Upsert a contact in GHL (search by phone, then create or update)
export async function upsertContact(input: GHLContactInput): Promise<string | null> {
  const phone = toE164(input.phone);
  const customFields = buildCustomFields(input);

  try {
    // 1. Search for existing contact by phone
    const search = await httpsRequest(
      'GET',
      `/contacts/?locationId=${locationId()}&query=${encodeURIComponent(phone)}`
    );

    if (search.status === 200) {
      const existing = (search.data as { contacts?: { id: string }[] })?.contacts?.[0];
      if (existing?.id) {
        // Update existing contact
        await httpsRequest('PUT', `/contacts/${existing.id}`, JSON.stringify({
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          tags: input.tags,
          ...(customFields ? { customFields } : {}),
        }));
        console.log('[GHL] Updated contact:', existing.id);
        return existing.id;
      }
    }

    // 2. Create new contact
    const create = await httpsRequest('POST', '/contacts/', JSON.stringify({
      locationId: locationId(),
      firstName: input.firstName,
      lastName: input.lastName,
      phone,
      email: input.email,
      tags: input.tags ?? ['booking'],
      source: 'website',
      ...(customFields ? { customFields } : {}),
    }));

    if (create.status !== 201) {
      console.error('[GHL] Create failed:', create.status, create.data);
      return null;
    }

    const id = (create.data as { contact?: { id: string } })?.contact?.id ?? null;
    console.log('[GHL] Created contact:', id);
    return id;
  } catch (err) {
    console.error('[GHL] upsertContact error:', err);
    return null;
  }
}

// Add a note to a contact
export async function addNote(input: { contactId: string; body: string }): Promise<void> {
  try {
    const res = await httpsRequest('POST', `/contacts/${input.contactId}/notes`, JSON.stringify({ body: input.body }));
    if (res.status !== 200 && res.status !== 201) {
      console.error('[GHL] Add note failed:', res.status, res.data);
    }
  } catch (err) {
    console.error('[GHL] addNote error:', err);
  }
}
