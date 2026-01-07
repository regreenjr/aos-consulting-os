'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  FileText,
  CheckSquare,
  Settings,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  {
    title: 'Dashboard',
    href: '/consultant/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Clients',
    href: '/consultant/clients',
    icon: Users,
  },
  {
    title: 'Engagements',
    href: '/consultant/engagements',
    icon: FileText,
  },
  {
    title: 'Approvals',
    href: '/consultant/approvals',
    icon: CheckSquare,
  },
]

export function SidebarNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      {/* Logo / Brand */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/consultant/dashboard" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="text-sm font-bold">AOS</span>
          </div>
          <span className="text-lg font-semibold">Consulting OS</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div className="border-t p-4 space-y-2">
        <Link href="/consultant/settings">
          <Button variant="ghost" className="w-full justify-start gap-3">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
