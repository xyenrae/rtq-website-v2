'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

export function SiteHeader() {
  const pathname = usePathname()
  const currentYear = new Date().getFullYear()

  const rawSegments = pathname.split('/').filter(Boolean)
  const segments = rawSegments[0] === 'protected' ? rawSegments.slice(1) : rawSegments

  const formatTitle = (text: string) =>
    text.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <header className="flex h-(--header-height) shrink-0 items-center border-b bg-background">
      <div className="flex w-full items-center px-4 lg:px-6">
        {/* LEFT DESKTOP */}
        <div className="hidden lg:flex items-center gap-2">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        </div>

        {/* MOBILE BRAND */}
        <div className="flex flex-1 items-center justify-between lg:hidden">
          <span className="font-semibold tracking-wide">RTQ AL-HIKMAH</span>
          <SidebarTrigger />
        </div>

        {/* DESKTOP BREADCRUMB */}
        <nav className="hidden lg:flex flex-1 items-center gap-1 text-sm font-medium">
          {segments.length === 0 ? (
            <span className="text-primary font-semibold">Home</span>
          ) : (
            <Link
              href="/protected"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
          )}

          {segments.map((segment, index) => {
            const href = '/protected/' + segments.slice(0, index + 1).join('/')

            const isLast = index === segments.length - 1

            return (
              <div key={index} className="flex items-center gap-1">
                <span className="text-muted-foreground">/</span>

                {isLast ? (
                  <span className="text-primary font-semibold">{formatTitle(segment)}</span>
                ) : (
                  <Link
                    href={href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {formatTitle(segment)}
                  </Link>
                )}
              </div>
            )
          })}
        </nav>

        {/* COPYRIGHT DESKTOP */}
        <div className="hidden lg:block text-xs text-muted-foreground whitespace-nowrap">
          © {currentYear} RTQ AL-HIKMAH. All rights reserved.
        </div>
      </div>
    </header>
  )
}
