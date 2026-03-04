'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { IconLogout, IconX, IconAlertTriangle, IconLoader2, type Icon } from '@tabler/icons-react'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

import { createClient } from '@/lib/supabase/client'

// ─── Utils ────────────────────────────────────────────────────────────────────

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Types ────────────────────────────────────────────────────────────────────

export function NavSecondary({
  items,
  label = 'Settings',
}: {
  items: {
    title: string
    url: string
    icon: Icon
    isLogout?: boolean
  }[]
  label?: string
}) {
  const router = useRouter()
  const { openMobile, setOpenMobile } = useSidebar()
  const [openConfirm, setOpenConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Fungsi untuk menutup sidebar mobile setelah navigasi
  const handleNavigation = () => {
    if (openMobile) {
      setOpenMobile(false)
    }
  }

  // Handler saat dialog ditutup
  const handleDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen && openConfirm && !isLoggingOut) {
      setOpenConfirm(false)
    } else {
      setOpenConfirm(isOpen)
    }
  }

  // Logic logout Supabase dengan feedback proper
  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    const toastId = toast.loading('Sedang keluar...')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) throw error

      toast.success('Berhasil keluar dari akun', {
        id: toastId,
        description: 'Sampai jumpa lagi!',
        duration: 3000,
      })

      setOpenConfirm(false)
      router.push('/')
      router.refresh()
      handleNavigation()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat logout'
      toast.error('Gagal keluar', {
        id: toastId,
        description: message,
        duration: 5000,
      })
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden mt-auto">
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            {item.isLogout ? (
              // Item Logout: Dialog dengan Radix UI primitives
              <DialogPrimitive.Root open={openConfirm} onOpenChange={handleDialogOpenChange}>
                <DialogPrimitive.Trigger asChild>
                  <SidebarMenuButton asChild>
                    <button
                      type="button"
                      className="w-full text-left flex items-center gap-2 cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setOpenConfirm(true)
                      }}
                    >
                      <IconLogout className="w-4 h-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </DialogPrimitive.Trigger>

                <DialogPrimitive.Portal>
                  <DialogPrimitive.Overlay
                    className={cn(
                      'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
                      'data-[state=open]:animate-in data-[state=closed]:animate-out',
                      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                      'duration-200'
                    )}
                  />

                  <DialogPrimitive.Content
                    onInteractOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                    className={cn(
                      'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]',
                      'w-full max-w-md flex flex-col',
                      'bg-card border border-border rounded-2xl shadow-2xl',
                      'data-[state=open]:animate-in data-[state=closed]:animate-out',
                      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                      'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                      'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
                      'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
                      'duration-200'
                    )}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                          <IconLogout className="w-4.5 h-4.5 text-destructive" />
                        </div>
                        <div>
                          <DialogPrimitive.Title className="text-base font-bold text-foreground">
                            Konfirmasi Keluar
                          </DialogPrimitive.Title>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Anda akan mengakhiri sesi admin saat ini
                          </p>
                        </div>
                      </div>
                      <DialogPrimitive.Close
                        onClick={() => setOpenConfirm(false)}
                        disabled={isLoggingOut}
                        className="rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors p-1.5 disabled:opacity-40"
                      >
                        <IconX className="w-4 h-4" />
                        <span className="sr-only">Tutup</span>
                      </DialogPrimitive.Close>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5 space-y-4">
                      {/* Warning banner */}
                      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-destructive/5 border border-destructive/20">
                        <IconAlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                        <p className="text-xs text-destructive leading-relaxed">
                          Pastikan semua perubahan penting sudah disimpan sebelum keluar dari akun.
                        </p>
                      </div>

                      {/* Session info card */}
                      <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <IconLogout className="w-5 h-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              Keluar dari Akun Admin
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Anda perlu login kembali untuk mengakses dashboard
                            </p>
                          </div>
                        </div>

                        {/* Info list */}
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-background border border-border px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Sesi akan diakhiri
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-background border border-border px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            Token auth dihapus
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20">
                      <button
                        type="button"
                        onClick={() => setOpenConfirm(false)}
                        disabled={isLoggingOut}
                        className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className={cn(
                          'flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
                          !isLoggingOut
                            ? 'bg-destructive text-destructive-foreground hover:opacity-90 shadow-sm'
                            : 'bg-destructive/30 text-destructive-foreground/50 cursor-not-allowed'
                        )}
                      >
                        {isLoggingOut ? (
                          <>
                            <IconLoader2 className="w-4 h-4 animate-spin" />
                            Keluar...
                          </>
                        ) : (
                          <>
                            <IconLogout className="w-4 h-4" />
                            Ya, Keluar
                          </>
                        )}
                      </button>
                    </div>
                  </DialogPrimitive.Content>
                </DialogPrimitive.Portal>
              </DialogPrimitive.Root>
            ) : (
              // Item Biasa: Link dengan href
              <SidebarMenuButton asChild>
                <a href={item.url} onClick={handleNavigation}>
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
