'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type Icon } from '@tabler/icons-react'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export function NavKonten({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const pathname = usePathname()
  const { setOpenMobile, openMobile } = useSidebar()

  const handleNavigation = () => {
    if (openMobile) setOpenMobile(false)
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Konten &amp; Publikasi</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
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
