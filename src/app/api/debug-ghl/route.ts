import { upsertContact } from '@/lib/ghl';

export const dynamic = 'force-dynamic';

// Temporary debug endpoint — DELETE after testing
// GET /api/debug-ghl
export async function GET() {
  const envCheck = {
    GHL_API_KEY: !!process.env.GHL_API_KEY,
    GHL_LOCATION_ID: !!process.env.GHL_LOCATION_ID,
    GHL_FIELD_ID_DATE: !!process.env.GHL_FIELD_ID_DATE,
    GHL_FIELD_ID_TIME: !!process.env.GHL_FIELD_ID_TIME,
    GHL_FIELD_ID_SERVICE: !!process.env.GHL_FIELD_ID_SERVICE,
  };

  let contactId: string | null = null;
  let error: string | null = null;

  try {
    contactId = await upsertContact({
      firstName: 'DebugTest',
      lastName: 'FromVercel',
      phone: '5550000001',
      email: 'debug@test.com',
      tags: ['debug'],
      appointmentDate: '2026-04-10',
      appointmentTime: '10:00',
      appointmentService: 'Classic Lashes',
    });
  } catch (e) {
    error = String(e);
  }

  return Response.json({ envCheck, contactId, error });
}
