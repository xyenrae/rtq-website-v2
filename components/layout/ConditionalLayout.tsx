'use client'

import { Suspense, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Banner from '@/components/layout/Banner'
import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import ScrollToTopButton from '@/components/ScrollToTopButton'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

function LayoutContent({ children }: ConditionalLayoutProps) {
  const pathname = usePathname() || ''
  const isAdmin = pathname.includes('/protected')

  const [showScrollToTop, setShowScrollToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {!isAdmin && <Banner />}
      {!isAdmin && <Navigation />}

      <main className="min-h-[calc(100vh-160px)]">{children}</main>

      {!isAdmin && <Footer />}
      {!isAdmin && showScrollToTop && <ScrollToTopButton />}
    </>
  )
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  return (
    <Suspense fallback={null}>
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  )
}
