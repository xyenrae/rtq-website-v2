'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { type Icon } from '@tabler/icons-react'
import { toast } from 'sonner'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export function NavSistem({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
    isLogout?: boolean
  }[]
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { setOpenMobile, openMobile } = useSidebar()

  const handleNavigation = () => {
    if (openMobile) setOpenMobile(false)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Berhasil keluar')
    router.push('/login')
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Sistem &amp; Akun</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            if (item.isLogout) {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    onClick={handleLogout}
                    className="min-w-8 duration-200 ease-linear text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    {item.icon && <item.icon size={20} />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            }

            const isActive = pathname === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                  className={
                    isActive
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear'
                      : 'min-w-8 duration-200 ease-linear'
                  }
                >
                  <Link href={item.url} onClick={handleNavigation}>
                    {item.icon && <item.icon size={20} />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
