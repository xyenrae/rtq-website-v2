'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {
  IconLogout,
  IconX,
  IconAlertTriangle,
  IconLoader2,
  IconCheck,
  IconShieldLock,
  IconTrash,
  IconDoor,
  type Icon,
} from '@tabler/icons-react'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

import { createClient } from '@/lib/supabase/client'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Logout Steps ─────────────────────────────────────────────────────────────

type StepStatus = 'idle' | 'loading' | 'done' | 'error'

interface LogoutStep {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  status: StepStatus
}

const INITIAL_STEPS: LogoutStep[] = [
  {
    id: 'auth',
    label: 'Mengakhiri sesi',
    description: 'Mencabut token autentikasi',
    icon: <IconShieldLock className="w-4 h-4" />,
    status: 'idle',
  },
  {
    id: 'clear',
    label: 'Membersihkan data lokal',
    description: 'Menghapus cache & cookie',
    icon: <IconTrash className="w-4 h-4" />,
    status: 'idle',
  },
  {
    id: 'redirect',
    label: 'Mengalihkan halaman',
    description: 'Menuju halaman utama',
    icon: <IconDoor className="w-4 h-4" />,
    status: 'idle',
  },
]

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: LogoutStep }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300',
          step.status === 'idle' && 'bg-muted text-muted-foreground',
          step.status === 'loading' && 'bg-primary/10 text-primary',
          step.status === 'done' && 'bg-green-500/10 text-green-600 dark:text-green-400',
          step.status === 'error' && 'bg-destructive/10 text-destructive'
        )}
      >
        {step.status === 'loading' && <IconLoader2 className="w-4 h-4 animate-spin" />}
        {step.status === 'done' && <IconCheck className="w-4 h-4" />}
        {step.status === 'error' && <IconAlertTriangle className="w-4 h-4" />}
        {step.status === 'idle' && step.icon}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium transition-colors duration-200',
            step.status === 'idle' && 'text-muted-foreground',
            step.status === 'loading' && 'text-foreground',
            step.status === 'done' && 'text-foreground',
            step.status === 'error' && 'text-destructive'
          )}
        >
          {step.label}
        </p>
        <p className="text-xs text-muted-foreground truncate">{step.description}</p>
      </div>

      {step.status === 'done' && (
        <span className="text-xs text-green-600 dark:text-green-400 font-medium shrink-0">
          Selesai
        </span>
      )}
      {step.status === 'loading' && (
        <span className="text-xs text-primary font-medium shrink-0 animate-pulse">Proses...</span>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

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
  const { openMobile, setOpenMobile } = useSidebar()
  const [openConfirm, setOpenConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [steps, setSteps] = useState<LogoutStep[]>(INITIAL_STEPS)

  // Reset state setiap kali dialog dibuka
  useEffect(() => {
    if (openConfirm) {
      setSteps(INITIAL_STEPS)
      setIsLoggingOut(false)
      setIsDone(false)
    }
  }, [openConfirm])

  const handleNavigation = () => {
    if (openMobile) setOpenMobile(false)
  }

  const updateStep = (id: string, status: StepStatus) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)))
  }

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)

    try {
      // Step 1: Supabase signOut
      updateStep('auth', 'loading')
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      await sleep(600)
      updateStep('auth', 'done')

      // Step 2: Clear local data
      updateStep('clear', 'loading')
      await sleep(700)
      updateStep('clear', 'done')

      // Step 3: Redirect
      updateStep('redirect', 'loading')
      await sleep(500)
      updateStep('redirect', 'done')

      setIsDone(true)
      await sleep(800)

      window.location.href = '/'
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat logout'

      // Mark current loading step as error
      setSteps((prev) => prev.map((s) => (s.status === 'loading' ? { ...s, status: 'error' } : s)))

      toast.error('Gagal keluar', {
        description: message,
        duration: 5000,
      })

      await sleep(1500)
      setIsLoggingOut(false)
      setSteps(INITIAL_STEPS)
    }
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden mt-auto">
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            {item.isLogout ? (
              <DialogPrimitive.Root open={openConfirm} onOpenChange={setOpenConfirm}>
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
                    onInteractOutside={(e) => isLoggingOut && e.preventDefault()}
                    onEscapeKeyDown={(e) => isLoggingOut && e.preventDefault()}
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
                    {/* ── Header ── */}
                    <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300',
                            isDone ? 'bg-green-500/10' : 'bg-destructive/10'
                          )}
                        >
                          {isDone ? (
                            <IconCheck className="w-4.5 h-4.5 text-green-600 dark:text-green-400" />
                          ) : (
                            <IconLogout className="w-4.5 h-4.5 text-destructive" />
                          )}
                        </div>
                        <div>
                          <DialogPrimitive.Title className="text-base font-bold text-foreground">
                            {isDone ? 'Berhasil Keluar' : 'Konfirmasi Keluar'}
                          </DialogPrimitive.Title>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {isDone
                              ? 'Mengalihkan ke halaman utama...'
                              : 'Anda akan mengakhiri sesi admin saat ini'}
                          </p>
                        </div>
                      </div>

                      {!isLoggingOut && (
                        <DialogPrimitive.Close className="rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors p-1.5">
                          <IconX className="w-4 h-4" />
                          <span className="sr-only">Tutup</span>
                        </DialogPrimitive.Close>
                      )}
                    </div>

                    {/* ── Body ── */}
                    <div className="px-6 py-5">
                      {!isLoggingOut ? (
                        // Tampilan konfirmasi awal
                        <div className="space-y-4">
                          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-destructive/5 border border-destructive/20">
                            <IconAlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                            <p className="text-xs text-destructive leading-relaxed">
                              Pastikan semua perubahan penting sudah disimpan sebelum keluar dari
                              akun.
                            </p>
                          </div>

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
                      ) : (
                        // Tampilan progress steps saat proses logout
                        <div className="space-y-1">
                          {steps.map((step, index) => (
                            <div key={step.id}>
                              <StepIndicator step={step} />
                              {index < steps.length - 1 && (
                                <div
                                  className={cn(
                                    'ml-4 w-0.5 h-4 my-1 rounded-full transition-colors duration-500',
                                    steps[index].status === 'done' ? 'bg-green-500/40' : 'bg-border'
                                  )}
                                />
                              )}
                            </div>
                          ))}

                          {isDone && (
                            <div className="pt-3 pb-1">
                              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
                                <IconCheck className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                                <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                                  Sampai jumpa! Mengalihkan halaman...
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ── Footer ── */}
                    {!isLoggingOut && (
                      <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20">
                        <DialogPrimitive.Close asChild>
                          <button
                            type="button"
                            className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                          >
                            Batal
                          </button>
                        </DialogPrimitive.Close>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-destructive text-destructive-foreground hover:opacity-90 shadow-sm transition-all duration-200"
                        >
                          <IconLogout className="w-4 h-4" />
                          Ya, Keluar
                        </button>
                      </div>
                    )}
                  </DialogPrimitive.Content>
                </DialogPrimitive.Portal>
              </DialogPrimitive.Root>
            ) : (
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
