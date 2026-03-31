'use client'

import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        return (
          <div
            key={index}
            className="bg-white rounded-2xl overflow-hidden"
            style={{
              boxShadow: '0 2px 8px rgba(16,27,75,0.05), 0 4px 16px rgba(16,27,75,0.03)',
            }}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer group"
              aria-expanded={isOpen}
            >
              <span className="font-display text-lg font-semibold text-navy tracking-tight group-hover:text-gold-dark transition-colors duration-200">
                {item.question}
              </span>
              <span
                className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-offwhite text-navy-light transition-transform duration-300"
                style={{
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
            <div
              className="overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
              style={{
                maxHeight: isOpen ? '300px' : '0px',
                opacity: isOpen ? 1 : 0,
              }}
            >
              <p className="px-6 pb-5 font-body text-base text-navy-light leading-[1.7]">
                {item.answer}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { FAQAccordion }
