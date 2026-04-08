'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';

const GHL_SCRIPT_URL = 'https://widgets.leadconnectorhq.com/loader.js';
const GHL_RESOURCES_URL = 'https://widgets.leadconnectorhq.com/chat-widget/loader.js';
const GHL_WIDGET_ID = '69d572cd37d15a52f396b2f5';

const EXCLUDED_PATHS = ['/book', '/booking'];

export function GHLChatWidget() {
  const pathname = usePathname();
  const isExcluded = EXCLUDED_PATHS.some((path) => pathname.startsWith(path));

  if (isExcluded) {
    return null;
  }

  return (
    <Script
      src={GHL_SCRIPT_URL}
      data-resources-url={GHL_RESOURCES_URL}
      data-widget-id={GHL_WIDGET_ID}
      strategy="afterInteractive"
    />
  );
}
