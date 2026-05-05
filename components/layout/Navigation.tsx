'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement | null>(null)
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      <nav
        className={`bg-white sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? 'py-2 shadow-md' : 'py-3'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div
                className={`relative transition-all duration-300 ${
                  isScrolled ? 'w-9 h-9 sm:w-11 sm:h-11' : 'w-11 h-11 sm:w-13 sm:h-13'
                }`}
              >
                <Image
                  src="/images/logo-rtq.png"
                  alt="Logo RTQ"
                  fill
                  sizes="(max-width: 640px) 44px, 52px"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span
                  className={`font-bold text-green-500 transition-all duration-300 ${
                    isScrolled
                      ? 'text-base sm:text-lg md:text-xl'
                      : 'text-lg sm:text-xl md:text-2xl'
                  }`}
                >
                  Al-Hikmah
                </span>
                <span
                  className={`text-green-500 transition-all duration-300 ${
                    isScrolled
                      ? 'text-[9px] sm:text-[10px] md:text-xs'
                      : 'text-[10px] sm:text-xs md:text-sm'
                  }`}
                >
                  Cinta Al-Qur&apos;an, Cinta Ilmu
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-8">
              <div className="flex gap-6">
                <NavLink href="/" label="Beranda" isScrolled={isScrolled} />
                <NavLink href="/berita" label="Berita" isScrolled={isScrolled} />
                <NavLink href="/pendaftaran" label="Pendaftaran" isScrolled={isScrolled} />
                <NavLink href="/galeri" label="Galeri" isScrolled={isScrolled} />
                <NavLink href="/kontak" label="Kontak" isScrolled={isScrolled} />
              </div>
            </div>

            {/* Hamburger */}
            <button
              ref={mobileMenuButtonRef}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                ref={mobileMenuRef}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden mt-3"
              >
                <div className="flex flex-col gap-1 bg-white rounded-lg p-2">
                  <MobileNavLink
                    href="/"
                    label="Beranda"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                  <MobileNavLink
                    href="/berita"
                    label="Berita"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                  <MobileNavLink
                    href="/pendaftaran"
                    label="Pendaftaran"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                  <MobileNavLink
                    href="/galeri"
                    label="Galeri"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                  <MobileNavLink
                    href="/kontak"
                    label="Kontak"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </>
  )
}

function NavLink({
  href,
  label,
  isScrolled,
}: {
  href: string
  label: string
  isScrolled: boolean
}) {
  const pathname = usePathname()
  const isActive = pathname === href || (href === '/berita' && pathname.startsWith('/berita/'))

  return (
    <Link href={href} className="relative group">
      <span
        className={`text-gray-600 transition-all duration-300 ${
          isScrolled ? 'text-sm' : 'text-base'
        } ${isActive ? 'text-green-600 font-medium' : 'group-hover:text-green-500'}`}
      >
        {label}
      </span>
      {isActive && (
        <motion.span
          layoutId="activeNav"
          className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 rounded-full"
          initial={false}
        />
      )}
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 rounded-full scale-x-0 transition-transform duration-300" />
    </Link>
  )
}

function MobileNavLink({
  href,
  label,
  onClick,
}: {
  href: string
  label: string
  onClick: () => void
}) {
  const pathname = usePathname()
  const isActive = pathname === href || (href === '/berita' && pathname.startsWith('/berita/'))

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`px-4 py-2.5 rounded-lg text-sm transition-colors duration-300 ${
        isActive ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {label}
    </Link>
  )
}
