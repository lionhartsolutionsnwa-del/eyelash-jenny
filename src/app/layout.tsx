import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { GHLChatWidget } from "@/components/shared/GHLChatWidget";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jenny Professional Eyelash | Premium Lash Extensions",
  description:
    "Luxury eyelash extension services by Jenny Professional Eyelash. Classic, hybrid, and volume lash sets crafted with precision for a stunning, natural look.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${dmSans.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Jenny Professional Eyelash",
              description:
                "Premium eyelash extension services including classic, hybrid, and volume lash sets.",
              image: "https://placehold.co/1200x630",
              "@id": "",
              url: "",
              priceRange: "$$",
              serviceType: "Eyelash Extensions",
              areaServed: {
                "@type": "City",
                name: "",
              },
              sameAs: [],
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                  ],
                  opens: "09:00",
                  closes: "19:00",
                },
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: "Saturday",
                  opens: "10:00",
                  closes: "17:00",
                },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-offwhite text-navy font-body">
        {children}
        <GHLChatWidget />
      </body>
    </html>
  );
}
