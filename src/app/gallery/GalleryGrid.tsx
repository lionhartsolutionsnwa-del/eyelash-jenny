'use client'

import { useState } from 'react'
import Link from 'next/link'

interface GalleryImage {
  src: string
  alt: string
  aspect: string
}

function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div
      className="gap-5"
      style={{
        columns: '3 280px',
      }}
    >
      {images.map((image, index) => (
        <div
          key={index}
          className="relative mb-5 break-inside-avoid overflow-hidden rounded-2xl group"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-auto object-cover transition-transform duration-500 ease-out"
            style={{
              transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)',
            }}
          />

          {/* Hover overlay */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300"
            style={{
              opacity: hoveredIndex === index ? 1 : 0,
              background: 'linear-gradient(to top, rgba(16,27,75,0.7), rgba(16,27,75,0.3))',
            }}
          >
            <span className="font-display text-xl font-semibold text-white tracking-tight">
              View
            </span>
          </div>

          {/* Book This Look link */}
          <div
            className="absolute bottom-0 inset-x-0 p-4 transition-opacity duration-300"
            style={{
              opacity: hoveredIndex === index ? 1 : 0,
            }}
          >
            <Link
              href="/booking"
              className="inline-flex items-center gap-1.5 font-body text-sm font-medium text-gold hover:text-white transition-colors duration-200"
            >
              Book This Look
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 4L10 8L6 12" />
              </svg>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

export { GalleryGrid }
