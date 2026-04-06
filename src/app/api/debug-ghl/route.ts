export const dynamic = 'force-dynamic';

// Temporary debug endpoint — DELETE after testing
// GET /api/debug-ghl
export async function GET() {
  const apiKey = process.env.GHL_API_KEY!;
  const locationId = process.env.GHL_LOCATION_ID!;

  // Step 1: search
  const searchRes = await fetch(
    `https://services.leadconnectorhq.com/contacts/?locationId=${locationId}&query=%2B15550000099`,
    { headers: { Authorization: `Bearer ${apiKey}`, Version: '2021-07-28' } }
  );
  const searchBody = await searchRes.text();

  // Step 2: create
  const createRes = await fetch('https://services.leadconnectorhq.com/contacts/', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, Version: '2021-07-28', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      locationId,
      firstName: 'DebugTest',
      lastName: 'FromVercel',
      phone: '+15550000099',
      tags: ['debug'],
      source: 'website',
      customFields: [
        { id: process.env.GHL_FIELD_ID_DATE, field_value: '2026-04-10' },
        { id: process.env.GHL_FIELD_ID_TIME, field_value: '10:00' },
        { id: process.env.GHL_FIELD_ID_SERVICE, field_value: 'Classic Lashes' },
      ],
    }),
  });
  const createBody = await createRes.text();

  return Response.json({
    search: { status: searchRes.status, body: JSON.parse(searchBody) },
    create: { status: createRes.status, body: JSON.parse(createBody) },
  });
}
