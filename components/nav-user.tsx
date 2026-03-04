'use client'

import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { getPengaturanAkun, type PengaturanAkun } from '@/lib/pengaturan'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export function NavUser() {
  const [akun, setAkun] = useState<PengaturanAkun | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // Fetch data akun + email user
  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()

      // 1. Ambil email dari Supabase Auth
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user?.email) setUserEmail(user.email)

      // 2. Ambil profil dari tabel pengaturan_akun
      const { data, error } = await getPengaturanAkun()
      if (error) {
        console.error('Gagal load akun:', error)
      } else if (data) {
        setAkun(data)
      }

      setLoading(false)
    }
    loadData()
  }, [])

  // Fallback data jika masih loading
  const displayName = loading
    ? 'Memuat...'
    : akun?.nama_lengkap || userEmail?.split('@')[0] || 'Admin'

  const displayEmail = loading ? '' : userEmail || 'admin@pesantren.id'
  const displayAvatar = loading ? '' : akun?.avatar_url || ''
  const initial = displayName?.charAt(0)?.toUpperCase() || 'A'

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-default"
          asChild={false}
        >
          <>
            {/* Avatar */}
            <Avatar className="h-8 w-8 rounded-lg grayscale">
              <AvatarImage src={displayAvatar} alt={displayName} />
              <AvatarFallback className="rounded-lg text-xs bg-muted">
                {loading ? (
                  <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                ) : (
                  initial
                )}
              </AvatarFallback>
            </Avatar>

            {/* Info User */}
            <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
              <span className="truncate font-medium text-foreground">
                {loading ? (
                  <span className="inline-block w-24 h-3 bg-muted rounded animate-pulse" />
                ) : (
                  displayName
                )}
              </span>
              <span className="text-muted-foreground truncate text-xs">
                {loading ? (
                  <span className="inline-block w-32 h-2 bg-muted/50 rounded animate-pulse" />
                ) : (
                  displayEmail
                )}
              </span>
            </div>
          </>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
