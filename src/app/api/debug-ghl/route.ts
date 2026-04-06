import https from 'https';

export const dynamic = 'force-dynamic';

function httpsPost(body: string, apiKey: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(body, 'utf8');
    const req = https.request({
      hostname: 'services.leadconnectorhq.com',
      path: '/contacts/',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    }, (res) => {
      let result = '';
      res.on('data', (chunk) => { result += chunk; });
      res.on('end', () => resolve({ status: res.statusCode ?? 0, body: result }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// GET /api/debug-ghl
export async function GET() {
  const apiKey = process.env.GHL_API_KEY?.trim() ?? '';
  const locationId = process.env.GHL_LOCATION_ID?.trim() ?? '';

  // Test with native https module (bypasses Next.js fetch wrapper)
  const payload = JSON.stringify({ locationId, firstName: 'DebugNative', phone: '+15550000055' });
  const result = await httpsPost(payload, apiKey);

  return Response.json({
    tokenSuffix: apiKey.slice(-8),
    locationId,
    nativeHttps: { status: result.status, body: JSON.parse(result.body) },
  });
}
