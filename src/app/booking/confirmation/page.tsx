import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ConfirmationContent } from './ConfirmationContent'

export default function ConfirmationPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-20 bg-offwhite">
        <Suspense
          fallback={
            <div className="mx-auto max-w-2xl px-6 py-24 text-center">
              <p className="font-body text-navy-light">Loading confirmation...</p>
            </div>
          }
        >
          <ConfirmationContent />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
