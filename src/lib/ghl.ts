// GoHighLevel API integration

const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.GHL_API_KEY}`,
    Version: GHL_API_VERSION,
    'Content-Type': 'application/json',
  };
}

// Ensure E.164 format: 14791234567 → +14791234567
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
  // Custom field values — set GHL_FIELD_ID_DATE / _TIME / _SERVICE env vars
  // after creating Text custom fields in GHL Settings → Custom Fields
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentService?: string;
}

// Build customFields array from env var field IDs (only if env vars are set)
function buildCustomFields(input: GHLContactInput) {
  const fields: { id: string; field_value: string }[] = [];
  if (process.env.GHL_FIELD_ID_DATE && input.appointmentDate) {
    fields.push({ id: process.env.GHL_FIELD_ID_DATE, field_value: input.appointmentDate });
  }
  if (process.env.GHL_FIELD_ID_TIME && input.appointmentTime) {
    fields.push({ id: process.env.GHL_FIELD_ID_TIME, field_value: input.appointmentTime });
  }
  if (process.env.GHL_FIELD_ID_SERVICE && input.appointmentService) {
    fields.push({ id: process.env.GHL_FIELD_ID_SERVICE, field_value: input.appointmentService });
  }
  return fields.length > 0 ? fields : undefined;
}

// Upsert a contact in GHL (search by phone, then create or update)
export async function upsertContact(input: GHLContactInput): Promise<string | null> {
  const locationId = process.env.GHL_LOCATION_ID!;
  const phone = toE164(input.phone);
  const customFields = buildCustomFields(input);

  try {
    // 1. Search for existing contact by phone
    const searchRes = await fetch(
      `${GHL_API_BASE}/contacts/?locationId=${locationId}&query=${encodeURIComponent(phone)}`,
      { headers: getHeaders() }
    );

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const existing = searchData?.contacts?.[0];

      if (existing?.id) {
        // Update existing contact
        const updateRes = await fetch(`${GHL_API_BASE}/contacts/${existing.id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            tags: input.tags,
            ...(customFields ? { customFields } : {}),
          }),
        });
        if (!updateRes.ok) {
          console.error('[GHL] Update contact failed:', await updateRes.text());
        }
        return existing.id;
      }
    }

    // 2. Create new contact
    const createRes = await fetch(`${GHL_API_BASE}/contacts/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        locationId,
        firstName: input.firstName,
        lastName: input.lastName,
        phone,
        email: input.email,
        tags: input.tags ?? ['booking'],
        source: 'website',
        ...(customFields ? { customFields } : {}),
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error('[GHL] Create contact failed:', createRes.status, errText);
      return null;
    }

    const created = await createRes.json();
    console.log('[GHL] Contact created:', created?.contact?.id);
    return created?.contact?.id ?? null;
  } catch (err) {
    console.error('[GHL] upsertContact error:', err);
    return null;
  }
}

export interface GHLNoteInput {
  contactId: string;
  body: string;
}

// Add a note to a contact (booking details)
export async function addNote(input: GHLNoteInput): Promise<void> {
  try {
    const res = await fetch(`${GHL_API_BASE}/contacts/${input.contactId}/notes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ body: input.body }),
    });
    if (!res.ok) {
      console.error('[GHL] Add note failed:', await res.text());
    }
  } catch (err) {
    console.error('[GHL] addNote error:', err);
  }
}

// Trigger a GHL workflow for a contact
export async function triggerWorkflow(contactId: string, workflowId: string): Promise<void> {
  try {
    const res = await fetch(`${GHL_API_BASE}/contacts/${contactId}/workflow/${workflowId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      console.error('[GHL] Trigger workflow failed:', await res.text());
    }
  } catch (err) {
    console.error('[GHL] triggerWorkflow error:', err);
  }
}
