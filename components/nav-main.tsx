'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconDashboard, type Icon } from '@tabler/icons-react'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useSidebar } from '@/components/ui/sidebar'

export function NavMain({
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
    if (openMobile) {
      setOpenMobile(false)
    }
  }

  // Pisahkan Dashboard dari item lainnya
  const dashboardItem = items.find((item) => item.url === '/protected')
  const restItems = items.filter((item) => item.url !== '/protected')

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {/* Dashboard — styled seperti Quick Create sebelumnya */}
          {dashboardItem && (
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                asChild
                tooltip={dashboardItem.title}
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
              >
                <Link href={dashboardItem.url} onClick={handleNavigation}>
                  <IconDashboard size={20} />
                  <span>{dashboardItem.title}</span>
                </Link>
              </SidebarMenuButton>

              {/* Logo dekoratif — tanpa fungsi */}
              <div className="size-8 shrink-0 flex items-center justify-center rounded-md border border-sidebar-border bg-sidebar text-sidebar-foreground group-data-[collapsible=icon]:opacity-0 pointer-events-none select-none">
                <IconDashboard size={16} className="text-primary" />
              </div>
            </SidebarMenuItem>
          )}
        </SidebarMenu>

        {/* Item navigasi lainnya */}
        <SidebarMenu>
          {restItems.map((item) => {
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
