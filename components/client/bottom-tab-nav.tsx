'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, CheckSquare, FileText, MessageCircle, TrendingUp } from 'lucide-react'

interface BottomTabNavProps {
  engagementId: string
}

const tabs = [
  {
    name: 'Overview',
    href: '',
    icon: Home,
  },
  {
    name: 'Actions',
    href: '/actions',
    icon: CheckSquare,
  },
  {
    name: 'Sessions',
    href: '/sessions',
    icon: FileText,
  },
  {
    name: 'Messages',
    href: '/messages',
    icon: MessageCircle,
  },
  {
    name: 'Progress',
    href: '/progress',
    icon: TrendingUp,
  },
]

export function BottomTabNav({ engagementId }: BottomTabNavProps) {
  const pathname = usePathname()
  const basePath = `/client/workspace/${engagementId}`

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const href = `${basePath}${tab.href}`
          const isActive = pathname === href

          return (
            <Link
              key={tab.name}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 text-xs transition-colors',
                isActive
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'fill-current')} />
              <span>{tab.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
