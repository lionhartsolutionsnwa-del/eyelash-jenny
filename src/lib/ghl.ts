// GoHighLevel API integration
// Docs: https://highlevel.stoplight.io/docs/integrations

const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.GHL_API_KEY}`,
    Version: GHL_API_VERSION,
    'Content-Type': 'application/json',
  };
}

function getLocationId() {
  return process.env.GHL_LOCATION_ID!;
}

export interface GHLContactInput {
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  tags?: string[];
}

// Upsert a contact in GHL (create or update by phone)
export async function upsertContact(input: GHLContactInput): Promise<string | null> {
  const locationId = getLocationId();

  try {
    // Search for existing contact by phone
    const searchRes = await fetch(
      `${GHL_API_BASE}/contacts/search/duplicate?locationId=${locationId}&phone=${encodeURIComponent(input.phone)}`,
      { headers: getHeaders() }
    );

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const existingId = searchData?.contact?.id;

      if (existingId) {
        // Update existing contact
        await fetch(`${GHL_API_BASE}/contacts/${existingId}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            tags: input.tags,
          }),
        });
        return existingId;
      }
    }

    // Create new contact
    const createRes = await fetch(`${GHL_API_BASE}/contacts/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        locationId,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        email: input.email,
        tags: input.tags ?? ['booking'],
        source: 'website',
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      console.error('[GHL] Create contact failed:', err);
      return null;
    }

    const created = await createRes.json();
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
      body: JSON.stringify({ body: input.body, userId: '' }),
    });
    if (!res.ok) {
      console.error('[GHL] Add note failed:', await res.text());
    }
  } catch (err) {
    console.error('[GHL] addNote error:', err);
  }
}

// Send a contact through a workflow by tag trigger
// The workflow in GHL should be set to trigger on tag "new-booking"
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
